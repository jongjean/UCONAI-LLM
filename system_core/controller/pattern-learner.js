// UCONAI-LLM Phase 7.1: Pattern Learner
// Learns user preferences and usage patterns over time.

const fs = require('fs');
const path = require('path');

const PATTERN_DB = path.join(__dirname, '../../logs/user_patterns.json');

class PatternLearner {
    constructor() {
        this.patterns = this.loadPatterns();
    }

    loadPatterns() {
        try {
            if (fs.existsSync(PATTERN_DB)) {
                return JSON.parse(fs.readFileSync(PATTERN_DB, 'utf8'));
            }
        } catch (e) {
            console.error("Pattern DB Load Failed:", e);
        }
        return { commands: {}, last_active: null };
    }

    savePatterns() {
        try {
            fs.writeFileSync(PATTERN_DB, JSON.stringify(this.patterns, null, 2));
        } catch (e) {
            console.error("Pattern DB Save Failed:", e);
        }
    }

    learn(command, success) {
        if (!command) return;

        // Normalize command (simple keyword extraction)
        const keyword = this.extractKeyword(command);
        if (!keyword) return;

        if (!this.patterns.commands[keyword]) {
            this.patterns.commands[keyword] = { count: 0, last_used: null, success_rate: 0 };
        }

        const entry = this.patterns.commands[keyword];
        entry.count++;
        entry.last_used = new Date().toISOString();

        // Update success rate logic (simplified)
        if (success) {
            entry.success_rate = (entry.success_rate * (entry.count - 1) + 100) / entry.count;
        } else {
            entry.success_rate = (entry.success_rate * (entry.count - 1)) / entry.count;
        }

        this.patterns.last_active = new Date().toISOString();
        this.savePatterns();

        console.log(`[Learner] Updated pattern for "${keyword}": Used ${entry.count} times.`);
    }

    extractKeyword(cmd) {
        if (cmd.includes("재시작")) return "재시작";
        if (cmd.includes("상태")) return "상태확인";
        if (cmd.includes("보고서")) return "보고서작성";
        if (cmd.includes("화면")) return "화면인식";
        if (cmd.includes("정리")) return "시스템정리";
        return "기타";
    }

    predictNextAction() {
        // Suggest top action based on frequency
        const cmds = Object.entries(this.patterns.commands);
        if (cmds.length === 0) return null;

        cmds.sort((a, b) => b[1].count - a[1].count);
        const topCmd = cmds[0];

        if (topCmd[1].count > 3) {
            return {
                action: topCmd[0],
                confidence: topCmd[1].success_rate,
                message: `강박사님, 자주 사용하시는 "${topCmd[0]}" 작업을 수행할까요?`
            };
        }
        return null;
    }
}

module.exports = PatternLearner;
