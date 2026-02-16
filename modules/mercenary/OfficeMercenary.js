/**
 * UCONAI 제1군단 - Office Mercenary Corps
 * 문서 작전 전문 용병 양성 및 배치 시스템
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class OfficeMercenary {
    constructor() {
        this.basecamp = 'E:\\UCONAI';
        this.battalions = {
            excel: {
                name: 'Excel Battalion',
                library: 'exceljs',
                commander: 'ExcelJS',
                specialties: ['reports', 'charts', 'templates', 'analysis']
            },
            word: {
                name: 'Word Battalion',
                library: 'docx',
                commander: 'docx',
                specialties: ['contracts', 'proposals', 'manuals', 'reports']
            },
            powerpoint: {
                name: 'PowerPoint Battalion',
                library: 'pptxgenjs',
                commander: 'PptxGenJS',
                specialties: ['presentations', 'dashboards', 'infographics']
            }
        };
    }

    /**
     * 임무 분석 (Mission Analysis)
     */
    analyzeMission(userRequest) {
        const keywords = {
            excel: ['엑셀', 'excel', '스프레드시트', '표', '차트', '데이터', 'xlsx', '목록'],
            word: ['워드', 'word', '문서', '계약서', '제안서', '보고서', 'docx', '구글독', 'google doc', '글'],
            powerpoint: ['파워포인트', 'ppt', 'powerpoint', '발표', '프레젠테이션', '슬라이드', 'pptx']
        };

        let detectedBattalion = null;
        let maxMatches = 0;

        for (const [type, words] of Object.entries(keywords)) {
            const matches = words.filter(word =>
                userRequest.toLowerCase().includes(word)
            ).length;

            if (matches > maxMatches) {
                maxMatches = matches;
                detectedBattalion = type;
            }
        }

        // 기본값은 엑셀이지만, 구글독 같은 경우 워드로 유도
        if (!detectedBattalion) {
            if (userRequest.toLowerCase().includes('google') || userRequest.includes('구글')) {
                detectedBattalion = 'word'; // 구글독 -> 워드 변환
            } else {
                detectedBattalion = 'excel';
            }
        }

        return {
            battalion: detectedBattalion,
            request: userRequest,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 코드 검증 (Code Validation)
     */
    validateCode(code) {
        if (!code || code.trim().length === 0) {
            throw new Error("Ollama가 코드를 생성하지 못했습니다. (Empty Code)");
        }
        return code;
    }

    /**
     * 용병 프로젝트 생성 (Train Mercenary)
     */
    async trainMercenary(mission, generatedCode) {
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .substring(0, 19);

        const battalion = this.battalions[mission.battalion];
        const projectName = `${battalion.name.replace(/\s/g, '_')}_${timestamp}`;
        const projectPath = path.join(this.basecamp, projectName);

        // 기지 생성
        if (!fs.existsSync(this.basecamp)) {
            fs.mkdirSync(this.basecamp, { recursive: true });
        }

        // 프로젝트 폴더 구조 생성
        fs.mkdirSync(projectPath, { recursive: true });
        fs.mkdirSync(path.join(projectPath, 'output'), { recursive: true });
        fs.mkdirSync(path.join(projectPath, 'logs'), { recursive: true });

        // package.json 생성
        const packageJson = {
            name: projectName.toLowerCase(),
            version: "1.0.0",
            description: `UCONAI ${battalion.name} - ${mission.request}`,
            main: "index.js",
            scripts: {
                start: "node index.js",
                deploy: "node index.js"
            },
            keywords: battalion.specialties,
            author: "UCONAI Mercenary Factory",
            license: "MIT",
            dependencies: {
                [battalion.library]: "latest"
            }
        };

        fs.writeFileSync(
            path.join(projectPath, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );

        // index.js (작전 매뉴얼) 저장
        fs.writeFileSync(
            path.join(projectPath, 'index.js'),
            generatedCode
        );

        // README.md (임무 지시서) 생성
        const readme = `# ${battalion.name} - 임무 보고서

## 🎯 임무 내용
${mission.request}

## 📅 배치일시
${new Date().toLocaleString('ko-KR')}

## 🔧 사용 무기
- ${battalion.commander} (${battalion.library})

## 🚀 작전 실행
\`\`\`bash
npm install
npm start
\`\`\`

## 📊 결과물
결과물은 \`output/\` 폴더에 생성됩니다.

## 📝 작전 로그
로그는 \`logs/\` 폴더에 기록됩니다.
`;

        fs.writeFileSync(
            path.join(projectPath, 'README.md'),
            readme
        );

        return {
            projectName,
            projectPath,
            battalion: battalion.name,
            status: 'TRAINED'
        };
    }

    /**
     * 용병 배치 (Deploy Mercenary)
     */
    async deployMercenary(projectPath) {
        const logPath = path.join(projectPath, 'logs', 'deployment.log');
        let log = '';

        try {
            // 무기 장착 (npm install)
            log += `[${new Date().toISOString()}] 무기 장착 시작...\n`;
            const { stdout: installOut, stderr: installErr } = await execPromise('npm install', {
                cwd: projectPath,
                timeout: 60000
            });
            log += installOut + '\n' + installErr + '\n';

            // 작전 실행 (npm start)
            log += `[${new Date().toISOString()}] 작전 실행 시작...\n`;
            const { stdout: runOut, stderr: runErr } = await execPromise('npm start', {
                cwd: projectPath,
                timeout: 120000
            });
            log += runOut + '\n' + runErr + '\n';

            // 로그 저장
            fs.writeFileSync(logPath, log);

            // 결과물 확인
            const outputDir = path.join(projectPath, 'output');
            const outputs = fs.existsSync(outputDir)
                ? fs.readdirSync(outputDir)
                : [];

            return {
                status: 'DEPLOYED',
                outputs,
                log: logPath
            };

        } catch (error) {
            log += `[${new Date().toISOString()}] 작전 실패: ${error.message}\n`;
            fs.writeFileSync(logPath, log);

            return {
                status: 'FAILED',
                error: error.message,
                log: logPath
            };
        }
    }

    /**
     * 전체 작전 수행 (Full Operation)
     */
    async executeOperation(userRequest, generatedCode) {
        console.log(`[Office Mercenary] 임무 분석 중...`);
        const mission = this.analyzeMission(userRequest);

        console.log(`[Office Mercenary] ${this.battalions[mission.battalion].name} 용병 훈련 중...`);
        const mercenary = await this.trainMercenary(mission, generatedCode);

        console.log(`[Office Mercenary] 용병 배치 중...`);
        const deployment = await this.deployMercenary(mercenary.projectPath);

        return {
            mission,
            mercenary,
            deployment
        };
    }
}

module.exports = OfficeMercenary;
