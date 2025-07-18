# Spase Layers

_A generalized framework for categorizing programming tenants_

> **Spase** = **Spa**tial **se**mantics  
> Layers 1 – 10 describe how raw spatial bits evolve into high-level artifacts.

---

## Layer Table

| Layer  | Name            | Description                                                | Metaphor                     | Examples                                                          | Example Traits                                                                                                                         |
| ------ | --------------- | ---------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | **Substrates**  | The spatial topology & coordinate rules                    | Terrains                     | Rectangular grid, Hexagonal grid                                  | Coordinated (grid) vs Uncoordinated (boxes and arrows), Grid type, dimensionality, tile shape, orientation                             |
| **2**  | **Aggregates**  | Rules for how groups are formed (pre-shape)                | Gravel beds                  | Binary proximity                                                  | Distinguishing elements of a group (cells of a certain type for instance, eg binary cells), Grouping by proximity, Grouping by density |
| **3**  | **Foundations** | Recognizable base shapes                                   | Cinder blocks                | Blocks, Clusters (can be cell or block), Subclusters (contiguous) | has 1/2 empty bounding rectangles                                                                                                      |
| **4**  | **Constructs**  | Typed primitives built from foundations                    | Rooms, walls, trees, tables  | Trees, tables, key–value sets, matrices                           | Aspect ratio, branching depth, column alignment                                                                                        |
| **5**  | **Layouts**     | Spatial arrangements of multiple constructs                | Floor plans                  | Header-tree-table layout, stacked forms                           | Alignment, adjacency, symmetry, offset                                                                                                 |
| **6**  | **Blueprints**  | Named templates that prescribe layouts + constructs        | Architectural plans          | “API Schema”, “Checklist Form”                                    | Required constructs, label detection, layout conformance                                                                               |
| **7**  | **Structures**  | Concrete instances of blueprints filled with content       | Completed buildings          | A populated schema block with fields & rules                      | Blueprint reference, slot completion, validation status                                                                                |
| **8**  | **Renovators**  | Agents that reshape / evaluate a structure internally      | Renovation crews, evaluators | AST reducers, semantic normalizers                                | Absorption logic, tree flattening, pruning strategies                                                                                  |
| **9**  | **Explorers**   | Agents that interpret structures to create outward outputs | Inspectors, archaeologists   | JSON schema exporter, UI renderer                                 | Traversal algorithm, mapping rules, export format                                                                                      |
| **10** | **Artifacts**   | Tangible outputs produced by explorers                     | Documents, schematics        | JSON schema file, Markdown report, HTML form                      | File type, field mapping, rendering settings                                                                                           |

---

## Glossary / Quick Definitions

- **Substrates** – define where things may exist (grid, hex, voxel, etc.).
- **Aggregates** – rules for discovery of groups of cells/points.
- **Foundations** – basic shapes you can name (block / cluster).
- **Constructs** – typed shapes (tree, table…).
- **Layouts** – how multiple constructs sit relative to one another.
- **Blueprints** – reusable templates that expect certain layouts & constructs.
- **Structures** – blueprints instantiated with real data/content.
- **Renovators** – internal re-writers: reduce, normalise, compute.
- **Explorers** – outward-looking interpreters: export, visualise, analyse.
- **Artifacts** – the final files / forms / code a human or machine consumes.
