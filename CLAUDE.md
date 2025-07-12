# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build production bundle (runs TypeScript check first)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Code Style
- Use TypeScript with strict type checking and explicit return types
- Follow React hooks rules strictly
- PascalCase for components, interfaces, and classes; camelCase for variables and functions
- Imports: React first, then external libraries, then local modules (sorted alphabetically)
- Prefer functional components with hooks over class components
- Use named exports for better tree-shaking
- Handle errors explicitly with type-safe error handling
- Keep components small and focused on a single responsibility
- Use semantic variable/function names that describe purpose, not implementation

## Project Structure

### Overview
This is a React-based web application that implements **Textrux** - a spatial programming protocol that uses CSV-like grids to represent and manipulate complex data structures, programs, and semantics through spatial relationships rather than sequential syntax.

### Key Architecture Concepts

#### Binary Spatial Semantics
The core principle behind Textrux is **Binary Spatial Semantics** - using filled (1) vs empty (0) cell patterns in 2D space to create meaning:

- **Filled Cells**: Cells containing text, numbers, or formulas (represented as "1" in binary)
- **Empty Cells**: Cells with no content (represented as "0" in binary)
- **Spatial Relationships**: The arrangement of filled/empty cells creates semantic structures
- **Orientation-Agnostic**: Patterns work regardless of primary/secondary direction (down-right, up-left, etc.)

**Example Binary Pattern (Tree Structure)**:
```
100  <- Root cell (filled)
010  <- Child cell (indented)
100  <- Peer cell (same column as root)
```

#### Trait-Based Construct Detection
The system uses a sophisticated multi-layered approach to identify constructs:

1. **Cell Cluster Traits**: Fundamental spatial properties of grouped cells
   - Geometric traits (width, height, aspect ratio, density)
   - Content traits (data types, patterns, consistency) 
   - Spatial relationship traits (connectivity, orientation, boundaries)
   
2. **Construct Signatures**: Pattern definitions that match trait combinations
   - Required traits for positive identification
   - Optional traits that boost confidence
   - Custom validation functions for complex patterns
   
3. **Cell Role Assignment**: Individual cells get semantic roles within constructs
   - Tree: root cell, parent cell, child cell, peer cell, header cell
   - Table: header cell, data cell, row cell, column cell
   - Matrix: primary header, secondary header, body cell
   - Key-Value: key cell, value cell

#### Construct Types and Their Patterns

**Tree Constructs**:
- Root cell: Filled cell at the origin of the hierarchy
- Parent cells: Have child cells in the primary direction + secondary offset
- Child cells: Positioned relative to parent (primary direction + secondary offset)
- Peer cells: Same hierarchical level, aligned in secondary direction
- Header cells: Optional labels above peer groups

**Table Constructs**:
- Rectangular arrangement with consistent row/column structure
- Optional header row/column at edges
- Body cells containing data
- Consistent data types within columns

**Matrix Constructs**:
- Empty top-left corner cell identifies matrix pattern
- Primary headers: First row (or column depending on orientation)
- Secondary headers: First column (or row depending on orientation) 
- Body: Intersection cells containing data

**Key-Value Constructs**:
- Key cells: Text identifiers
- Value cells: Associated data to the right (or in primary direction)
- Can be nested within other constructs (e.g., tree nodes with key-value pairs)

#### Directional Orientation System
All constructs adapt to grid orientation:

- **Grid Primary Direction**: Overall grid growth direction (down, right, up, left)
- **Grid Secondary Direction**: Perpendicular to primary (right, down, left, up)
- **Construct Orientation**: How the construct aligns with grid directions
- **Relative Positioning**: Cell relationships use relative offsets, not absolute directions

#### Content-Driven Formatting
Visual representation is determined by construct roles and orientation:

- **Cell Role Formatting**: Root cells, headers, data cells each have distinct styles
- **Orientation-Aware Borders**: Borders adapt to construct direction (bottom for down-primary, right for right-primary)
- **Hierarchical Indentation**: Visual depth indicators for tree structures
- **Alignment Rules**: Tables maintain column alignment regardless of orientation

#### Action System
Keyboard shortcuts and interactions map to semantic operations:

- **Ctrl+Enter on tree cell**: Insert child/peer based on position and context
- **Tab in table**: Navigate to next cell, extending table if at edge
- **Shift+Enter**: Create peer at same hierarchical level
- **Context-Aware Actions**: Same input triggers different behaviors based on construct type

#### Spatial Programming Protocol
- **Metacircular Design**: System defines and extends itself using its own spatial medium
- **Multi-Layer Architecture**: 10 interconnected layers from substrate to artifacts
- **Future Extensibility**: New construct types can be added by defining new trait patterns

#### Core Components
- **Grids**: CSV-based spatial canvases where text placement creates structures
- **Constructs**: Typed primitives (trees, tables, matrices, key-value pairs) automatically detected from spatial patterns
- **Layouts**: Arrangements of multiple constructs with coordination between them
- **Blueprints**: Named templates that recognize specific spatial patterns (e.g., API schemas)
- **Structures**: Concrete instances of blueprints filled with actual data
- **Renovators**: Internal transformation agents that reshape/evaluate structures
- **Explorers**: Export agents that generate external artifacts from structures

### Directory Structure

#### `/src` - Main React application
- `App.tsx` - Main application component
- `main.tsx` - Application entry point
- `index.css` - Global styles

#### `/packages/textrux/src` - Core Textrux library
- **`layers/`** - 10-layer spatial programming architecture:
  - `1-substrate/` - Grid parsing and basic structure detection
  - `2-aggregate/` - (Future) Grouping and aggregation rules
  - `3-foundation/` - Core shapes: blocks, clusters, subclusters, cells
  - `4-constructs/` - Typed structures: trees, tables, matrices, key-value
  - `5-layouts/` - Spatial arrangements and coordination between constructs
  - `6-blueprints/` - Pattern templates and recognition
  - `7-structures/` - Concrete instances with data
  - `8-renovators/` - Internal transformation resolvers
  - `9-explorers/` - Export and generation agents
  - `10-artifacts/` - Final output files

- **`ui/`** - React components for the spatial interface:
  - `GridView.tsx` - Main grid editing interface
  - `GridGalleryView.tsx` - Multi-grid management
  - `CellView.tsx` - Individual cell rendering
  - `controller/GridController.ts` - Grid state management

- **`util/`** - Utility functions:
  - `CSV.ts` - CSV parsing and generation
  - `GridHelper.ts` - Grid manipulation utilities
  - `LocalStorageManager.ts` - Persistence layer

- **`examples/`** - Example CSV files demonstrating various constructs
- **`demo/`** - Trait parsing demonstrations

### Key Technologies
- **React 19** with hooks and functional components
- **TypeScript** with strict type checking
- **Zustand** for state management
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Prism.js** for syntax highlighting
- **react-window** for virtualized rendering

### Development Workflow
1. The system detects spatial patterns in CSV grids
2. Constructs are automatically identified (trees, tables, etc.)
3. Layouts coordinate multiple constructs
4. Blueprints recognize domain-specific patterns
5. Structures instantiate blueprints with real data
6. Renovators perform internal transformations
7. Explorers generate external artifacts (JSON schemas, APIs, etc.)

### Important Notes
- Always preserve spatial relationships when making changes
- The system is designed to be metacircular - it defines itself using spatial structures
- Changes to core parsing logic may affect pattern recognition across all layers
- The trait parsing system is central to how constructs are identified and managed
- Grid state management is coordinated through the controller pattern

### Current Implementation Status

#### Completed (Layers 1-3):
- ✅ **GridModel**: Basic grid infrastructure with cell content management
- ✅ **GridParser**: Block and cell cluster detection from spatial patterns
- ✅ **CellCluster**: Foundation-level grouping of filled cells
- ✅ **CellClusterTraits**: Basic geometric and content analysis (needs extension)
- ✅ **UI Components**: Grid rendering, cell editing, basic interaction

#### In Progress (Layer 4 - Constructs):
- 🔄 **Cell Cluster Trait System**: Needs detailed spatial relationship traits
- 🔄 **Construct Detection**: Signature-based pattern matching exists but needs trait integration
- 🔄 **Cell Role Assignment**: Framework exists but needs implementation
- 🔄 **Formatting System**: Basic CellFormat exists but needs construct-aware application
- 🔄 **Action System**: Framework exists but needs semantic operation mapping

#### Critical Implementation Gaps:
1. **Detailed Spatial Traits**: Current traits are too high-level; need specific traits like:
   - `spatial.hasRootCell`, `spatial.hasChildRelationships`, `spatial.hasConsistentIndentation`
   - `arrangement.isVertical`, `arrangement.isHorizontal`, `content.hasHierarchicalStructure`
   
2. **Cell Role Detection**: Missing algorithms to identify:
   - Root cells, parent cells, child cells, peer cells in trees
   - Header cells, data cells in tables
   - Key cells, value cells in key-value pairs
   
3. **Orientation Detection**: Need to determine construct orientation relative to grid:
   - Primary direction (which way the construct "grows")
   - Secondary direction (perpendicular spacing)
   - Relative positioning calculations
   
4. **Construct Element System**: Partial implementation needs completion:
   - Element containers for managing construct parts
   - Format providers for orientation-aware styling
   - Event system for construct communication
   
5. **Action Mapping**: Need semantic operation system:
   - Context-aware keyboard shortcuts
   - Grid manipulation for construct operations
   - Collision detection and shape moving

### Development Priority Order:
1. **Extend CellClusterTraitParser** with detailed spatial relationship analysis
2. **Implement cell role detection algorithms** for each construct type
3. **Create orientation detection system** for grid and construct directions
4. **Build formatting system** that maps cell roles to visual styles
5. **Implement action system** with semantic operations
6. **Add construct element management** for UI interaction
7. **Create shape manipulation system** for dynamic grid operations

### Key Design Principles:
- **Extensibility**: New construct types should be easy to add via trait patterns
- **Orientation Agnostic**: All constructs must work in any direction
- **Content-Driven**: Formatting and behavior determined by spatial semantics
- **Trait-Based**: Use intermediate trait layer for maximum flexibility
- **Future-Oriented**: Design for long-term extensibility and maintainability