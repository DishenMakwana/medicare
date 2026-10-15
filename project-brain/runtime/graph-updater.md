# Graph Updater Specification

## Responsibility
Maintains the graph layer files (`nodes.json`, `edges.json`, `graph-index.json`) as components, routes, and server actions are added, renamed, or deleted.

## Update Policy
- **Never manually edit graph structures indiscriminately**.
- If a new component or route is created:
  1. Add entry to `graph/nodes.json`.
  2. Add edge connections (imports, renders, queries) to `graph/edges.json`.
  3. Register key in `graph/graph-index.json`.
  4. Increment `totalNodes` and `totalEdges` in `graph/graph.json`.
