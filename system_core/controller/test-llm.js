const LLM = require('./modules/llm-client');
async function test() {
    console.log('Testing LLM...');
    try {
        const resp = await LLM.generate('Hello, who are you?', 'CHAT');
        console.log('AI Response:', resp);
    } catch (e) {
        console.error('AI Error:', e);
    }
}
test();
