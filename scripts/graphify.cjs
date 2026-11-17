#!/usr/bin/env node
/**
 * scripts/graphify.cjs
 *
 * Athena Codebase AST / Structural Knowledge Graph Builder & Query CLI.
 * Generates:
 *  - graphify-out/graph.json       (Machine-readable structural graph of files, exports, functions, Express routes, React components/tabs/modals, and exact line ranges)
 *  - graphify-out/GRAPH_REPORT.md  (Compact architectural coordinate index & god-node report for AI coding agents to eliminate token waste)
 *
 * Usage:
 *  node scripts/graphify.cjs               # Rebuild full graph & report
 *  node scripts/graphify.cjs query <term>  # Instant lookup of functions, routes, tabs, or files with exact line numbers
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'graphify-out');
const GRAPH_JSON_PATH = path.join(OUT_DIR, 'graph.json');
const REPORT_MD_PATH = path.join(OUT_DIR, 'GRAPH_REPORT.md');

const TARGET_DIRS = ['src', 'backend', 'api', 'scripts'];
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  '.git',
  'src/data/initialData.js',
  'backend/data',
  'backend/scripts/audit_report.json',
  'graphify-out'
];

function shouldIgnore(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  return IGNORE_PATTERNS.some((p) => norm === p || norm.startsWith(p + '/') || norm.includes('/' + p + '/'));
}

function walkFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    if (shouldIgnore(rel)) continue;
    if (entry.isDirectory()) {
      walkFiles(full, list);
    } else if (/\.(js|jsx|cjs|mjs|ts|tsx)$/.test(entry.name)) {
      list.push({ full, rel });
    }
  }
  return list;
}

function parseFileStructure(fileObj) {
  const content = fs.readFileSync(fileObj.full, 'utf8');
  const lines = content.split(/\r?\n/);

  const imports = [];
  const exportsList = [];
  const functions = [];
  const routes = [];
  const uiSections = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // 1. ES Imports & CommonJS require
    const importMatch = line.match(/^\s*import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      imports.push({ target: importMatch[1], line: lineNum });
    }
    const reqMatch = line.match(/(?:const|let|var)\s+.*?\s*=\s*require\(\s*['"]([^'"]+)['"]\s*\)/);
    if (reqMatch) {
      imports.push({ target: reqMatch[1], line: lineNum });
    }

    // 2. Named / Default Exports
    const expFuncMatch = line.match(/^\s*export\s+(?:default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/);
    if (expFuncMatch) {
      exportsList.push({ name: expFuncMatch[1], line: lineNum, kind: 'function' });
    }
    const expConstMatch = line.match(/^\s*export\s+const\s+([A-Za-z0-9_]+)/);
    if (expConstMatch) {
      exportsList.push({ name: expConstMatch[1], line: lineNum, kind: 'const' });
    }

    // 3. Top-level or major functions & React components
    const fnMatch = line.match(/^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/);
    if (fnMatch) {
      functions.push({ name: fnMatch[1], line: lineNum });
    }
    const arrowHandlerMatch = line.match(/^\s*const\s+(handle[A-Z][A-Za-z0-9_]*|fetch[A-Z][A-Za-z0-9_]*)\s*=\s*(?:async\s*)?\(/);
    if (arrowHandlerMatch) {
      functions.push({ name: arrowHandlerMatch[1], line: lineNum, kind: 'handler' });
    }

    // 4. Express Routes (app.get/post/put/delete/use or router.get/post/put/delete)
    const routeMatch = line.match(/^\s*(app|router)\.(get|post|put|delete|patch|use)\s*\(\s*(\[[^\]]+\]|['"`][^'"`]+['"`])/);
    if (routeMatch) {
      routes.push({
        owner: routeMatch[1],
        method: routeMatch[2].toUpperCase(),
        path: routeMatch[3].replace(/\s+/g, ' '),
        line: lineNum
      });
    }

    // 5. Major UI Tabs / Modals / Banner comments
    const tabMatch = line.match(/activeAdminTab\s*===\s*['"]([^'"]+)['"]\s*&&\s*\(/);
    if (tabMatch) {
      uiSections.push({ type: 'AdminTab', name: tabMatch[1], line: lineNum });
    }
    const modalCommentMatch = line.match(/^\s*\{\/\*\s*([A-Z0-9][A-Z0-9\s_&/()-]{5,80})\s*\*\/\}/);
    if (modalCommentMatch && /MODAL|TAB|SECTION|CARD/.test(modalCommentMatch[1])) {
      uiSections.push({ type: 'SectionComment', name: modalCommentMatch[1].trim(), line: lineNum });
    }
  }

  return {
    file: fileObj.rel,
    lines: lines.length,
    bytes: Buffer.byteLength(content, 'utf8'),
    imports,
    exports: exportsList,
    functions,
    routes,
    uiSections
  };
}

function buildGraph() {
  const allFiles = [];
  for (const dir of TARGET_DIRS) {
    walkFiles(path.join(ROOT, dir), allFiles);
  }

  const nodes = allFiles.map(parseFileStructure);
  nodes.sort((a, b) => b.lines - a.lines);

  const totalLines = nodes.reduce((acc, n) => acc + n.lines, 0);
  const totalRoutes = nodes.reduce((acc, n) => acc + n.routes.length, 0);
  const totalFunctions = nodes.reduce((acc, n) => acc + n.functions.length, 0);

  const graph = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalFiles: nodes.length,
      totalLines,
      totalRoutes,
      totalFunctions,
      godNodes: nodes.filter((n) => n.lines >= 1500).map((n) => ({ file: n.file, lines: n.lines }))
    },
    nodes
  };

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  fs.writeFileSync(GRAPH_JSON_PATH, JSON.stringify(graph, null, 2), 'utf8');

  // Build Markdown Report
  let md = `# Athena Knowledge Graph Report (\`GRAPH_REPORT.md\`)\n\n`;
  md += `> **Auto-generated by \`scripts/graphify.cjs\`** — Consult this file or run \`npm run graph:query <term>\` BEFORE opening large files to save 70%+ tokens.\n\n`;
  md += `## 1. Codebase Overview\n`;
  md += `- **Indexed Source Files:** ${graph.summary.totalFiles}\n`;
  md += `- **Total Source Lines:** ${graph.summary.totalLines.toLocaleString('en-US')}\n`;
  md += `- **Total Express Routes / Mounts:** ${graph.summary.totalRoutes}\n`;
  md += `- **Total Indexed Functions & Handlers:** ${graph.summary.totalFunctions}\n\n`;

  md += `## 2. Top 15 Largest Files (Hotspots / God-Node Watchlist)\n`;
  md += `| File | Lines | Functions | Routes | UI Sections |\n`;
  md += `| :--- | ---: | ---: | ---: | ---: |\n`;
  for (const n of nodes.slice(0, 15)) {
    md += `| \`${n.file}\` | ${n.lines} | ${n.functions.length} | ${n.routes.length} | ${n.uiSections.length} |\n`;
  }
  md += `\n`;

  md += `## 3. Express API Routes Map\n`;
  for (const n of nodes.filter((x) => x.routes.length > 0)) {
    md += `### \`${n.file}\` (${n.lines} lines)\n`;
    for (const r of n.routes) {
      md += `- **L${r.line}**: \`${r.method} ${r.path}\`\n`;
    }
    md += `\n`;
  }

  md += `## 4. Key Frontend & Backend Function Coordinates\n`;
  for (const n of nodes.filter((x) => x.functions.length > 0 && x.lines >= 200)) {
    md += `### \`${n.file}\` (${n.lines} lines)\n`;
    const fnSummary = n.functions.map((f) => `\`${f.name}\` (L${f.line})`).join(', ');
    md += `- **Functions:** ${fnSummary}\n`;
    if (n.uiSections.length > 0) {
      const secSummary = n.uiSections.map((s) => `\`${s.name}\` (L${s.line})`).join(', ');
      md += `- **UI Sections / Modals:** ${secSummary}\n`;
    }
    md += `\n`;
  }

  fs.writeFileSync(REPORT_MD_PATH, md, 'utf8');
  return graph;
}

function queryGraph(term) {
  const graph = fs.existsSync(GRAPH_JSON_PATH)
    ? JSON.parse(fs.readFileSync(GRAPH_JSON_PATH, 'utf8'))
    : buildGraph();

  const q = String(term || '').toLowerCase().trim();
  if (!q) {
    console.log('Usage: node scripts/graphify.cjs query <search-term>');
    return;
  }

  console.log(`=== Graphify Query: "${term}" ===`);
  let hits = 0;

  for (const node of graph.nodes) {
    if (node.file.toLowerCase().includes(q)) {
      console.log(`[FILE] ${node.file} (${node.lines} lines)`);
      hits++;
    }
    for (const r of node.routes) {
      if (r.path.toLowerCase().includes(q) || r.method.toLowerCase().includes(q)) {
        console.log(`[ROUTE] ${node.file}#L${r.line} -> ${r.method} ${r.path}`);
        hits++;
      }
    }
    for (const f of node.functions) {
      if (f.name.toLowerCase().includes(q)) {
        console.log(`[FUNC]  ${node.file}#L${f.line} -> ${f.name}()`);
        hits++;
      }
    }
    for (const s of node.uiSections) {
      if (s.name.toLowerCase().includes(q)) {
        console.log(`[UI]    ${node.file}#L${s.line} -> [${s.type}] ${s.name}`);
        hits++;
      }
    }
  }

  if (hits === 0) {
    console.log('No structural graph matches found. Try a broader term.');
  }
}

const cmd = process.argv[2];
if (cmd === 'query' || cmd === 'q') {
  queryGraph(process.argv.slice(3).join(' '));
} else {
  const g = buildGraph();
  console.log(`[Graphify] Indexed ${g.summary.totalFiles} files (${g.summary.totalLines} lines, ${g.summary.totalRoutes} routes, ${g.summary.totalFunctions} functions).`);
  console.log(`[Graphify] Output written to graphify-out/graph.json and graphify-out/GRAPH_REPORT.md`);
}
