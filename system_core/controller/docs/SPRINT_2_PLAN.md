# Sprint 2: Performance & Model Optimization
## Implementation Plan & Progress Tracker

**Start Date**: 2026-02-16  
**Status**: 🚀 IN PROGRESS

---

## 📊 Baseline Measurements (Pre-Sprint 2)

### Current System Performance (6h Sample)
- **Total Jobs**: 345
- **Success Rate**: 60.6% (209/345)
- **Planner Failures**: 24 (PARSE_ERR)
- **Avg E2E Latency**: 1,904ms
- **Timeout Incidents**: 20 (LOCAL Request Timeout)

### Token Usage Analysis
- **Estimated Tokens/Job**: ~188 tokens
- **6h Total Usage**: ~64,860 tokens
- **Breakdown**:
  - Prompt: ~450 chars (~113 tokens)
  - Response: ~300 chars (~75 tokens)

### Identified Bottlenecks
1. **Planner Timeout**: 20 incidents in 6h (5.8% of jobs)
2. **Single Model Saturation**: All jobs use qwen3:4b
3. **No Prompt Caching**: Every job incurs full prompt cost
4. **Success Rate**: 60.6% needs improvement

---

## 🎯 Sprint 2 Goals

### M4-2.1: Model Split
- **Target Planner Latency**: < 5s (Currently: ~2s E2E, but timeout spikes exist)
- **Target Timeout Reduction**: 50% (20 → <10 incidents/6h)
- **Method**: Separate Planner(4b) + Executor(8b) + Semaphore

### M4-2.2: Prompt Optimization
- **Target Token Reduction**: 30% (188 → 132 tokens/job)
- **Method**: Prompt compression + Template caching
- **Secondary**: Response format optimization

---

## 📋 Implementation Roadmap

### Phase 1: M4-2.1 Gate 1 (Semaphore & Throttling)

**Objective**: Add role-based concurrency limits to prevent LLM saturation.

**Tasks**:
- [IN PROGRESS] Implement Semaphore in llm-client.js
  - PLANNER: max 2 concurrent
  - EXECUTOR: max 5 concurrent
  - GLOBAL: max 6 concurrent
- [ ] Add queue_wait_ms metric
- [ ] Test with burst workload (10 concurrent jobs)
- [ ] Verify timeout reduction

**Success Criteria**:
- ✅ Timeout incidents < 10/6h
- ✅ Queue wait P95 < 2s
- ✅ No increase in E2E latency

**Estimated Time**: 1 day

---

### Phase 2: M4-2.1 Gate 2 (Role-based Routing)

**Objective**: Route jobs to appropriate models based on context.

**Tasks**:
- [ ] Implement `generate(prompt, role)` interface
- [ ] Create MODEL_POLICY configuration
- [ ] Update Planner to use PLANNER role
- [ ] Add fallback logic (4b → 8b on timeout)

**Success Criteria**:
- ✅ Planner uses qwen3:4b
- ✅ Fallback to qwen3:8b on timeout
- ✅ Planner latency P95 < 5s

**Estimated Time**: 2 days

---

### Phase 3: M4-2.2 (Prompt Optimization)

**Objective**: Reduce token usage by 30% through prompt engineering.

**Tasks**:
- [ ] Analyze current prompt structure
- [ ] Remove redundant instructions
- [ ] Compress schema documentation
- [ ] Implement response format hints
- [ ] A/B test optimized vs baseline

**Success Criteria**:
- ✅ Token usage < 132 tokens/job
- ✅ No degradation in plan quality
- ✅ Schema validation pass rate > 95%

**Estimated Time**: 2 days

---

### Phase 4: Integration & Validation

**Tasks**:
- [ ] 24h soak test with new architecture
- [ ] Compare baseline vs optimized metrics
- [ ] Document performance improvements
- [ ] Update Master Plan status

**Success Criteria**:
- ✅ All M4-2.1 and M4-2.2 goals met
- ✅ No regression in system stability
- ✅ Success rate > 90%

**Estimated Time**: 1 day

---

## 🔧 Current Work: Semaphore Implementation

### Design

**Location**: `llm-client.js` (centralized control)

**Structure**:
```javascript
class Semaphore {
    constructor(max) {
        this.max = max;
        this.current = 0;
        this.queue = [];
    }
    
    async acquire() {
        if (this.current < this.max) {
            this.current++;
            return Promise.resolve();
        }
        return new Promise(resolve => this.queue.push(resolve));
    }
    
    release() {
        this.current--;
        if (this.queue.length > 0) {
            this.current++;
            const resolve = this.queue.shift();
            resolve();
        }
    }
}
```

**Configuration**:
```javascript
SEMAPHORES = {
    PLANNER: new Semaphore(2),
    EXECUTOR: new Semaphore(5),
    HEAVY: new Semaphore(1),
    GLOBAL: new Semaphore(6)
}
```

### Testing Plan

1. **Unit Test**: Single role saturation
2. **Integration Test**: Mixed role workload
3. **Stress Test**: 20 concurrent jobs
4. **Soak Test**: 6h continuous operation

---

## 📈 Success Tracking

| Metric | Baseline | Target | Current | Status |
|:---|:---|:---|:---|:---|
| Timeout Rate | 20/6h | <10/6h | - | 🔄 Pending |
| Planner Latency P95 | ~2s | <5s | - | 🔄 Pending |
| Token Usage | 188/job | 132/job | - | 🔄 Pending |
| Success Rate | 60.6% | >90% | - | 🔄 Pending |
| Queue Wait P95 | N/A | <2s | - | 🔄 Pending |

---

## 🚨 Risks & Mitigation

### Risk 1: Semaphore Deadlock
**Mitigation**: Max wait timeout (10s) + E_OVERLOAD_THROTTLED error

### Risk 2: Fallback Chain Explosion
**Mitigation**: Hard limit 1 fallback per role

### Risk 3: Prompt Optimization Degrades Quality
**Mitigation**: A/B testing + schema validation monitoring

### Risk 4: Model Split Increases Complexity
**Mitigation**: Gradual rollout with rollback plan

---

**Next Update**: After Gate 1 completion (Semaphore implementation)
