# Textrux Version Control and Schema Evolution

**Textrux** is an implementation of Binary Spatial Semantics (BSS), a data representation paradigm that treats two-dimensional grids as carriers of explicit, semantically meaningful constructs such as tables, trees, links, and other spatial structures. Textrux extends this paradigm to provide a rich framework for version control and schema evolution within two-dimensional data systems.

## Overview

Traditional version control systems such as Git, Mercurial, and Subversion are designed for text files and operate primarily at the line level. This makes them poorly suited for two-dimensional data like spreadsheets, canvases, or matrices, where structure and meaning often span multiple rows and columns.

Textrux addresses this limitation by parsing spatial patterns within a grid into explicit semantic constructs. These constructs carry their own identities, types, and hierarchical relationships, enabling Textrux to track and manage changes with far greater precision.

## Key Concepts

### Binary Spatial Semantics (BSS)

Binary Spatial Semantics is the foundational model underlying Textrux. In BSS, the placement of binary or discrete values within a grid conveys semantic meaning. For example, a filled rectangle might represent a table, while branching patterns could represent a tree.

By interpreting spatial arrangements as structured constructs, BSS enables direct mapping from low-level grid patterns to high-level data models.

### Constructs

Textrux recognizes various constructs within a grid, such as:

- **Tables**: Rectangular regions that contain rows and columns.
- **Trees**: Spatially organized hierarchies.
- **Links**: Connections between constructs indicating relationships.

Each construct is explicitly defined and uniquely identified, which allows Textrux to track changes over time at the construct level.

### Operation Log

Textrux maintains a detailed operation log that records every change made to the grid. These operations are explicitly tied to constructs and include actions such as:

- `InsertRow`: Adds a new row to a table at a specified index.
- `RenameHeader`: Changes the header name in a table.
- `MoveBlock`: Moves a construct to a new spatial location.
- `AddChild`: Adds a new child to a tree construct.

Because every modification is represented as a discrete, semantically meaningful operation, Textrux can precisely reconstruct the history of changes, support undo/redo, and enable meaningful diffs.

### Hierarchical Logging

Textrux’s logs can be hierarchical, nesting operations within the constructs they affect. This means the history of a table’s changes can be viewed independently of other constructs in the same grid, supporting more granular version control.

```json
{
  "constructId": "GridMain",
  "operations": [
    {
      "type": "MoveBlock",
      "targetBlockId": "Table123",
      "from": [5,10],
      "to": [8,10]
    },
    {
      "type": "Construct",
      "blockId": "Table123",
      "operations": [
        {"type": "AddRow", "at": 3},
        {"type": "RenameHeader", "from": "Total", "to": "Amount"}
      ]
    }
  ]
}
```
# Version Control Features

## Semantic Diffs

Unlike traditional text diffs that operate on lines or characters, Textrux provides diffs at the construct level. For example:

```
Table 'Orders'
  + Added row at position 3
  ~ Renamed column 'Total' to 'Amount'
Tree 'CategoryTree'
  + Added child 'Beverages'
```

This allows users to understand how data structures evolved over time rather than merely where text changed.

Undo/Redo and Time Travel

Because every change is logged as an explicit operation, Textrux can:
	•	Undo or redo any series of operations.
	•	Replay operation logs to reconstruct any past state.
	•	Visualize branching histories, similar to version control graphs, but tied to spatial constructs.

Schema Evolution

Textrux’s explicit constructs mean schema evolution—changes in the shape of data over time—is a first-class feature. Adding a column to a table or restructuring a tree is directly tracked in the operation log, making migrations and collaborative editing robust and transparent.

Storage Formats

Textrux supports flexible storage of the operation log:
	•	Packed Inside the Main File: All operations are embedded within the Textrux data file, making it fully self-contained.
	•	External Log Files: Operation histories can be saved separately, reducing file size and allowing independent management of logs.
	•	Hybrid Approach: A Textrux file may reference external logs but also include compressed summaries for portability.

Example file header with an external history reference:

```yaml
---
version: 1.0
constructs:
  - type: Table
    id: Table123
    data: ...
history:
  packed: false
  logFile: "project-history.trxlog"
```

Comparison with React and Redux

Textrux’s approach bears similarity to the architectural principles of React and Redux:
	•	One-Way Data Flow: Textrux maintains immutable operation logs that transform the state of the grid, ensuring deterministic rendering.
	•	Action Logging: Like Redux, every change is an explicit operation, making it possible to replay or audit the entire history.

However, Textrux’s system is far more semantically rich, operating on explicit spatial constructs rather than general application state.

Applications

Textrux is particularly well-suited for:
	•	Spreadsheet Versioning: Providing meaningful change tracking in collaborative grid environments.
	•	Visual Programming: Maintaining the evolution of data structures in spatial coding environments.
	•	Interactive Documentation: Tracking and replaying how documents and data models evolve over time.

See Also
	•	Operational Transformation
	•	CRDT
	•	Schema Evolution
	•	Redux
