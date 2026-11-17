---
name: graphify
description: Query the local Athena codebase knowledge graph (graphify-out/GRAPH_REPORT.md and scripts/graphify.cjs) to locate exact file coordinates, Express routes, React components, handlers, and modals without wasting tokens on broad grep or full-file reads.
---

# Graphify — Zero-Token Codebase Navigation Skill

Whenever you need to locate a route, function, state handler, modal, or admin tab in the Athena repository:

1. **Query the Graph First (Instead of `grep` or reading huge files):**
   ```bash
   npm run graph:query <keyword>
   # or
   node scripts/graphify.cjs query <keyword>
   ```
2. **Read Only the Exact Line Range Returned:**
   Use `read_file` with `StartLine` and `EndLine` around the `L<number>` reported by Graphify.
3. **Keep the Graph Updated After Refactoring:**
   ```bash
   npm run graph
   ```
