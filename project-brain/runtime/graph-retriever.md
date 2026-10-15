# Graph Retriever Specification

## Responsibility
Extracts the precise subgraph of nodes (routes, components, server actions, models) impacted by a given prompt.

## Algorithm
1. Parse user prompt for entity keywords (e.g., "vital", "report", "member", "preset", "ocr").
2. Match against `graph/embeddings.json` to find primary domain.
3. Lookup entry nodes via `graph/graph-index.json`.
4. Traverse outgoing and incoming edges in `graph/edges.json` up to 2 degrees of separation:
   - Identify dependent client components.
   - Identify corresponding server actions.
   - Identify database models affected.
5. Hand off list of affected nodes to the Context Loader.
