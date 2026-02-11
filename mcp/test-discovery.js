const ToolDiscovery = require('./tool-discovery');
const discovery = new ToolDiscovery();
const results = discovery.scanSystem();
const saved = discovery.saveDiscoveryResults('C:\\UCONAI-LLM\\data\\discovered_tools.json');

console.log(JSON.stringify({
    total: saved.total_tools,
    categories: [...new Set(saved.tools.map(t => t.category))],
    tools: saved.tools.map(t => ({ name: t.name, category: t.category, source: t.source }))
}, null, 2));
