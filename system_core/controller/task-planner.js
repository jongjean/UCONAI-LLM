// Task Planner Module
// Decomposes complex commands into executable sub-tasks

class TaskPlanner {
    constructor() {
        this.taskQueue = [];
        this.taskTemplates = {
            "보고서": {
                steps: [
                    { action: "collect_data", description: "현시각 시스템 가용 데이터 수집" },
                    { action: "analyze", description: "데이터 무결성 분석" },
                    { action: "summarize", description: "강박사님 맞춤 요약 보고 작성" }
                ]
            },
            "재시작": {
                steps: [
                    { action: "check_status", description: "현재 상태 확인" },
                    { action: "restart_service", description: "서비스 재시작" },
                    { action: "verify", description: "재시작 검증" }
                ]
            },
            "정리": {
                steps: [
                    { action: "scan_resources", description: "리소스 스캔" },
                    { action: "identify_waste", description: "불필요 항목 식별" },
                    { action: "cleanup", description: "정리 실행" },
                    { action: "report_results", description: "결과 보고" }
                ]
            },
            "화면": {
                steps: [
                    { action: "capture_screen", description: "화면 캡처" },
                    { action: "analyze_ui", description: "UI 요소 분석" }
                ]
            },
            "대화": {
                steps: [
                    { action: "chat_response", description: "일반 대화 응답" }
                ]
            }
        };
    }

    // Parse user intent and create task plan
    analyzeIntent(userMessage) {
        const intent = {
            original: userMessage,
            tasks: [],
            complexity: "simple"
        };

        // Check for compound commands (multiple actions)
        if (userMessage.includes("하고") || userMessage.includes("그리고") || userMessage.includes("그 다음")) {
            intent.complexity = "compound";
            const parts = userMessage.split(/하고|그리고|그 다음/);
            parts.forEach(part => {
                const subTask = this.identifyTask(part.trim());
                console.log(`[TaskPlanner] Identify Part: "${part.trim()}" -> ${JSON.stringify(subTask)}`);
                if (subTask) intent.tasks.push(subTask);
            });
        } else {
            intent.complexity = "simple";
            const task = this.identifyTask(userMessage);
            console.log(`[TaskPlanner] Identify Task: "${userMessage}" -> ${JSON.stringify(task)}`);
            if (task) intent.tasks.push(task);
        }

        return intent;
    }

    identifyTask(message) {
        const fs = require('fs');
        const path = require('path');
        const registryPath = 'C:\\OpenClaw\\controller\\system-registry.json';
        let registry = { apps: [] };

        if (fs.existsSync(registryPath)) {
            try {
                let content = fs.readFileSync(registryPath, 'utf8');
                if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
                registry = JSON.parse(content);
            } catch (e) { console.error("Registry load error:", e); }
        }

        if (message.includes("최적화") || message.includes("분석") || message.includes("쓰레기") || message.includes("정리")) {
            return {
                type: "system_optimization",
                steps: [
                    { action: "scan_usage", description: "앱 사용 빈도 및 리소스 점유율 정밀 분석" },
                    { action: "identify_idle", description: "장기 미사용 및 중복 앱 식별" },
                    { action: "optimize_report", description: "시스템 최적화 및 자원 회수 전략 보고" }
                ]
            };
        }

        if (message.includes("재시작") || message.includes("restart")) {
            const systemId = message.match(/uconai-\w+|dcp-\w+/)?.[0] || "unknown";
            return {
                type: "restart",
                target: systemId,
                steps: this.taskTemplates["재시작"].steps
            };
        }
        if (message.includes("상태") || message.includes("status")) {
            return {
                type: "status_check",
                steps: [{ action: "health_check", description: "시스템 상태 확인" }]
            };
        }
        if (message.includes("보고서") || message.includes("report")) {
            return {
                type: "report_generation",
                steps: this.taskTemplates["보고서"].steps
            };
        }
        if (message.includes("정리") || message.includes("cleanup")) {
            return {
                type: "cleanup",
                steps: this.taskTemplates["정리"].steps
            };
        }
        if (message.includes("화면") || message.includes("캡처") || message.includes("vision")) {
            return {
                type: "vision_analysis",
                steps: this.taskTemplates["화면"].steps
            };
        }
        if (message.includes("열어") || message.includes("실행") || message.includes("open") || message.includes("run") || message.includes("개시") || message.includes("시작") || message.includes("만들어") || message.includes("제작") || message.includes("디자인")) {
            const isDesign = message.includes("제작") || message.includes("디자인") || message.includes("배치") || message.includes("삽입") || message.includes("저장");

            // Dynamic App Matching
            let targetApp = null;
            const msgLower = message.toLowerCase();

            // Check known IDs first for speed
            const knownApps = {
                '포토샵': 'adobe-photoshop', 'photoshop': 'adobe-photoshop',
                '일러스트': 'adobe-illustrator', 'illustrator': 'adobe-illustrator',
                '워드': 'ms-word', 'word': 'ms-word',
                '엑셀': 'ms-excel', 'excel': 'ms-excel',
                '파워포인트': 'ms-powerpoint', 'ppt': 'ms-powerpoint', 'powerpoint': 'ms-powerpoint',
                '한글': 'hancom-office', 'hwp': 'hancom-office',
                '안티그래비티': 'antigravity-agent', 'antigravity': 'antigravity-agent',
                '메모장': 'notepad.exe',
                '그림판': 'mspaint.exe',
                '계산기': 'calc.exe'
            };

            for (let key in knownApps) {
                if (msgLower.includes(key)) {
                    targetApp = knownApps[key];
                    break;
                }
            }

            // Fallback to Registry search
            if (!targetApp) {
                const found = registry.apps.find(app =>
                    msgLower.includes(app.name.toLowerCase()) ||
                    (app.id && msgLower.includes(app.id.toLowerCase()))
                );
                if (found) targetApp = found.id || found.name;
            }

            return {
                type: isDesign ? "design_automation" : "execute_app",
                target: targetApp || "unknown",
                prompt: message,
                steps: [{ action: isDesign ? "generate_and_run_jsx" : "run_process", description: isDesign ? `${targetApp} 디자인 인텔리전스 가동` : `${targetApp || 'Unknown App'} 탐색 및 작전 전개` }]
            };
        }
        return null;
    }

    // Create execution plan
    createPlan(intent) {
        const plan = {
            id: Date.now().toString(),
            created: new Date().toISOString(),
            original_command: intent.original,
            complexity: intent.complexity,
            total_tasks: intent.tasks.length,
            tasks: intent.tasks,
            status: "pending"
        };
        return plan;
    }

    // Generate human-readable plan description
    describePlan(plan) {
        let description = `강박사님, 다음 작업을 수행하겠습니다:\n\n`;

        plan.tasks.forEach((task, idx) => {
            description += `[작업 ${idx + 1}] ${task.type}\n`;
            task.steps.forEach((step, stepIdx) => {
                description += `  ${stepIdx + 1}. ${step.description}\n`;
            });
        });

        description += `\n총 ${plan.total_tasks}개 작업, ${plan.tasks.reduce((sum, t) => sum + t.steps.length, 0)}개 단계를 실행합니다.`;
        return description;
    }
}

module.exports = TaskPlanner;
