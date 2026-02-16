# Phase 4.2: Model Split Strategy (Enterprise Hardening)

**Last Updated**: 2026-02-16  
**Status**: Ready for 12h Gate  
**Author**: UCONAI Engineering + 강박사 Technical Review

---

## 🎯 Executive Summary

**Objective**: Separate Planner and Executor workloads to dedicated models, reducing timeout by 50% and improving planning latency to <5s.

**Current State**:
- Single model: `qwen3:4b` for all operations
- Timeout rate: 26 incidents / 5h soak (Planner bottleneck)
- Available models: qwen3:4b, qwen3:8b, gemma3:12b, gpt-oss:20b

**Target State**:
- Planner: qwen3:4b (fast JSON generation)
- Executor: qwen3:8b (quality reasoning)
- Escalation: gemma3:12b → gpt-oss:20b → Cloud API

---

## 📊 Metric System (Critical Fix)

**Problem Identified**: P99 125ms (event loop) vs Planner latency (seconds) were conflated.

**Corrected Metric Definitions**:

| Metric | Description | Unit | Target |
|:---|:---|:---|:---|
| `job_e2e_latency_ms` | Total job execution time | ms | P95 < 60s |
| `planner_latency_ms` | Planner phase only | ms | P95 < 5000ms |
| `llm_latency_ms` | Pure LLM inference time | ms | P95 < 3000ms |
| `tool_latency_ms` | Tool execution time | ms | - |
| `llm_queue_wait_ms` | Semaphore wait time | ms | P95 < 2000ms |
| `event_loop_lag_p99` | Node.js event loop lag | ms | < 100ms |

All metrics tracked at P95 and P99 levels.

---

## 🏗️ Error Taxonomy (Separation of Concerns)

**Before** (Mixed):
```
error: "PARSE_ERR: Failed after 2 attempts: LOCAL Request Timeout"
```

**After** (Separated):
```
error_code: E_TIMEOUT_LOCAL
llm_context: PLANNER | EXECUTOR | CHAT
llm_provider: LOCAL | CLOUD
llm_model: qwen3:4b
llm_attempt: 1 | 2
fallback_used: true | false
```

**Benefits**:
- Prevents error code explosion
- Enables precise failure analysis
- Simplifies dashboard queries

---

## 🔒 Semaphore Architecture

**Critical Decision**: Semaphore lives in `llm-client.js`, NOT in `planner.js`.

**Rationale**:
- Single point of control
- Prevents bypass when planner is called from other modules
- Cleaner separation of concerns

**Configuration**:
```javascript
CONCURRENCY_LIMITS = {
  PLANNER: { max: 2, timeout: 15000 },
  EXECUTOR: { max: 5, timeout: 60000 },
  HEAVY: { max: 1, timeout: 120000 },
  GLOBAL: { max: 6 }  // Total cap across all roles
}
```

**Wait Policy**:
- Max wait: 5-10 seconds (not 30s)
- On timeout: Return `E_OVERLOAD_THROTTLED`
- Integration with Health Guard for backpressure

---

## 🎯 Model Routing Policy

**Role-to-Model Mapping**:

| Role | Primary | Fallback | Timeout | Max Concurrent |
|:---|:---|:---|:---|:---|
| PLANNER | qwen3:4b | qwen3:8b | 15s | 2 |
| EXECUTOR | qwen3:8b | gemma3:12b | 60s | 5 |
| HEAVY | gemma3:12b | gpt-oss:20b | 120s | 1 |
| CLOUD | claude-3-opus | - | 30s | Policy-gated |

**Fallback Chain Limit**: Maximum 1 fallback per role (prevent cost/latency explosion).

**Escalation Policy**:
- Triggered only on explicit conditions (not automatic)
- Cloud API requires budget approval
- Heavy models (20B) max 10 calls/hour

---

## 📋 8-Step Implementation Roadmap

### **Immediate (Before 12h Gate)**

**Step 0: Observability Enhancement**
- Add telemetry fields: `llm_context`, `llm_model`, `llm_latency_ms`, `llm_queue_wait_ms`
- Separate error fields: `error_code`, `error_context`, `error_provider`
- Add LLM client logging (start/end timestamps, model used)
- Dashboard section: `[LLM OBSERVABILITY]`

---

### **Gate 1: Stability Foundation**

**Step 1: Error Classification**
- Implement separated error fields
- Update `llm-client.js` to record context on every call
- Add `llm_attempt` tracking for retry analysis

**Step 2: Semaphore Implementation**
- Build role-based + global concurrency limiter in `llm-client.js`
- Add `llm_queue_wait_ms` metric
- Integrate wait timeout with Health Guard

**Success Criteria (Gate 1)**:
- ✅ Timeout incidents reduced by 50%
- ✅ Queue wait P95 < 2s
- ✅ Error classification 100% populated

---

### **Gate 2: Model Separation**

**Step 3: LLM Client Role Routing**
- Implement `generate(prompt, role, retryLevel)` interface
- Build model policy table (config-driven)
- Add role-specific semaphore pools

**Step 4: Planner Integration**
- Update `planner.js`: `LLM.generate(prompt, 'PLANNER')`
- Shorten timeout: 15s (4b), 30s (8b fallback)
- Prioritize schema validation failures for immediate retry

**Success Criteria (Gate 2)**:
- ✅ Planner latency P95 < 5s
- ✅ Schema validation error rate < 1%
- ✅ Fallback usage < 10% of calls

---

### **Gate 3: Executor Enhancement**

**Step 5: Executor Selective LLM**
- Add LLM calls for failure analysis (not success)
- Complex output detection (>1000 chars + JSON pattern)
- Use qwen3:8b for executor reasoning

**Success Criteria (Gate 3)**:
- ✅ Executor LLM call rate < 10% of jobs
- ✅ Failure analysis quality validated (manual review)
- ✅ No regression in core execution success rate

---

### **Gate 4: Operationalization**

**Step 6: Config-Driven Policy**
- Extract model policy to `config/model-policy.json`
- Support A/B testing (4b vs 8b comparison)
- **Hot reload deferred to Phase 5** (governance required)

**Step 7: Advanced Telemetry**
- Model-specific performance dashboard
- Cost estimation (token usage + Cloud API)
- Role-specific latency breakdown

**Step 8: Stabilization**
- 1-week monitoring under new architecture
- SLO validation: Planner <5s, Timeout <5/5h, E2E P99 <70s
- Document lessons learned

---

## 🚨 Risk Mitigation

### **Fallback Chain Explosion**
**Risk**: 4b → 8b → 12b → 20b → Cloud causes 5-minute delays.  
**Mitigation**: Hard limit 1 fallback per role. Cloud gated by policy.

### **Concurrency Starvation**
**Risk**: Role limits (2+5+1) exceed global capacity (6).  
**Mitigation**: Global semaphore enforces total cap.

### **Dynamic Config Danger**
**Risk**: Runtime model changes cause unpredictable behavior.  
**Mitigation**: Hot reload disabled in Phase 4.2. Requires restart.

### **Metric Confusion**
**Risk**: Mixing event loop lag (ms) with planner latency (s).  
**Mitigation**: Separate metric namespaces with clear units.

---

## 📅 Timeline (SLO-Gated, Not Time-Gated)

| Phase | Duration | Gate Condition |
|:---|:---|:---|
| **Pre-Gate** | Now - 12h | Soak test completion + observability live |
| **Gate 1** | 2-3 days | Timeout 50%↓ + queue P95 <2s |
| **Gate 2** | 3-5 days | Planner P95 <5s + schema err <1% |
| **Gate 3** | 3-5 days | Executor LLM <10% + quality OK |
| **Gate 4** | 5-7 days | 1-week stable operation |

**Total**: 2-3 weeks for full Phase 4.2 completion.

---

## 🎯 Success Metrics (Phase 4.2 Exit Criteria)

| Metric | Baseline (Single Model) | Target (Split) | Measurement |
|:---|:---|:---|:---|
| Planner Latency P95 | ~10s (estimated) | < 5s | Telemetry |
| Planner Timeout Rate | 26 / 5h | < 5 / 5h | Error Count |
| Executor Quality | Baseline | Hallucination -50% | Manual Audit |
| Job E2E Latency P99 | 125ms (event loop) | < 70s (job) | Dashboard |
| Cloud Escalation | 0 calls | < 10 calls/day | Cost Tracker |
| Overall System Uptime | 100% | 100% | Maintained |

---

## 📚 Reference Architecture

```
┌─────────────────────────────────────────────────┐
│              Job Request (Gateway)              │
└───────────────────┬─────────────────────────────┘
                    │
         ┌──────────▼──────────┐
         │   Health Guard      │ (Assess load)
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │      Planner        │ → LLM.generate(role='PLANNER')
         │   (qwen3:4b→8b)    │    ↓ Semaphore (max 2)
         └──────────┬──────────┘    ↓ 15s timeout
                    │                ↓ Fallback to 8b
         ┌──────────▼──────────┐
         │  Tool Executor      │ → Tools.execute()
         │  (Optional LLM)     │    ↓ On failure only
         └──────────┬──────────┘    ↓ LLM.generate(role='EXECUTOR')
                    │                ↓ qwen3:8b→12b
         ┌──────────▼──────────┐
         │   Result Storage    │
         └─────────────────────┘
```

---

## 🔍 Critical Review Notes (강박사)

1. **Metric clarity is paramount**: Separate event loop lag from job latency.
2. **Semaphore location matters**: llm-client, not planner.
3. **Fallback discipline**: 1 level max, or costs explode.
4. **Observability first**: Can't optimize what you can't measure.
5. **SLO gates, not time gates**: Ship when stable, not when scheduled.

---

**END OF DOCUMENT**

*This strategy is locked until 12h soak completion.*
