# The Semantic Parsing Framework (SPF)

*A self-defining, trait-based system for discovering meaning in spatial data and materializing it in user interfaces*

---

## Framework Overview

The Semantic Parsing Framework (SPF) operates alongside the 10-layer SPASE framework to handle the mechanics of how spatial meaning is discovered, interpreted, and materialized in user interfaces. While SPASE defines the conceptual layers from substrates to artifacts, SPF defines the operational processes that transform spatial arrangements into interactive, formatted UI elements.

**Core Principle**: The system bootstraps from a minimal set of built-in capabilities and becomes self-defining through the very constructs it discovers.

---

## The Five-Phase Architecture

### Phase 1: Foundation Trait Analysis
**Input**: Spatial foundations (blocks, cell clusters, subclusters)  
**Output**: Comprehensive trait profiles for each foundation element  
**Process**: Analyze spatial, content, and relational characteristics

**Core Trait Categories**:
- **Spatial Traits**: Position, proximity, alignment, orientation relationships
- **Content Traits**: Data types, patterns, homogeneity, hierarchical markers
- **Relational Traits**: Parent-child candidates, peer relationships, containment patterns
- **Arrangement Traits**: Grid-likeness, regular spacing, dominant orientations

**Self-Definition Capability**: Custom trait definitions can be embedded in CSV using core constructs (tables defining new trait types, trees defining trait hierarchies).

### Phase 2: Construct Recognition
**Input**: Foundation elements with trait profiles  
**Output**: Identified constructs with confidence scores and orientation metadata  
**Process**: Pattern matching between trait combinations and construct signatures

**Core Construct Library**:
- **Tree**: Hierarchical spatial patterns with consistent orientation
- **Table**: Grid-like arrangements with header patterns
- **Matrix**: Cross-referenced data with dual-axis headers
- **Key-Value**: Paired spatial relationships in sequences

**Self-Definition Capability**: New construct signatures can be defined spatially using core constructs (a table that defines new construct types, their required traits, and confidence algorithms).

**Bidirectional Discovery**: 
- **Trait → Construct**: "These traits indicate this construct type"
- **Construct → Trait**: "This construct type requires these additional trait analyses"

### Phase 3: Element Decomposition
**Input**: Identified constructs  
**Output**: Semantic element maps with role assignments  
**Process**: Break constructs into their functional components

**Element Types by Construct**:

**Tree Elements**:
- Root nodes, parent nodes, child nodes, leaf nodes
- Sibling groups, hierarchy levels, expansion states
- Branch connectors, indentation guides

**Table Elements**:
- Header cells (row/column), data cells, footer cells
- Row groups, column groups, intersection cells
- Border guides, alternation patterns

**Matrix Elements**:
- Axis labels, data intersections, aggregate cells
- Cross-reference indicators, summary regions

**Key-Value Elements**:
- Key cells, value cells, pair boundaries
- Sequence indicators, grouping separators

**Multi-Role Reality**: Any cell can simultaneously be multiple element types (e.g., a tree node that's also a table header).

### Phase 4: Semantic Mapping
**Input**: Constructs with decomposed elements  
**Output**: Abstract semantic instructions for formatting and interaction  
**Process**: Map elements to theme-agnostic directives

**Abstract Formatting Categories**:
- **Hierarchy Indicators**: Indentation depth, nesting level, expansion state
- **Relationship Markers**: Parent-child connections, peer alignments, containment boundaries
- **Data Classifications**: Header vs. data, key vs. value, summary vs. detail
- **Interactive States**: Selectable, expandable, editable, actionable

**Action Mapping**:
- **Navigation Actions**: Move to parent, move to child, move to sibling
- **Structural Actions**: Add sibling, add child, move element, delete element
- **Data Actions**: Edit content, expand/collapse, sort, filter
- **Layout Actions**: Resize, reorder, group, split

### Phase 5: UI Materialization
**Input**: Abstract semantic instructions  
**Output**: Concrete visual formatting and enabled interactions  
**Process**: Apply user's theme and UI framework to semantic instructions

**Theme Application**:
- Map hierarchy levels to visual indentation and colors
- Translate relationship markers to borders, lines, and spacing
- Apply data classifications to typography and highlighting
- Render interactive states as hover effects, icons, and affordances

**Action Enablement**:
- Bind keyboard shortcuts to navigation and structural actions
- Enable mouse/touch interactions for direct manipulation
- Provide context menus with construct-appropriate options
- Handle action conflicts when elements have multiple roles

---

## The Self-Definition Bootstrap Process

### Core Bootstrap (Built-in)
1. **Minimal Trait Set**: Basic spatial, content, and relational trait analyzers
2. **Core Construct Library**: Tree, table, matrix, key-value recognizers
3. **Basic Element Types**: Standard element decomposition for core constructs
4. **Foundation Actions**: Essential navigation and editing operations

### Extension Discovery (CSV-Defined)
1. **Parse Core Constructs**: Use built-in capabilities to identify basic structures
2. **Discover Trait Definitions**: Look for specially-formatted tables/trees that define new traits
3. **Discover Construct Definitions**: Find construct signature definitions in parsed structures
4. **Discover Element Definitions**: Identify element type definitions for new constructs
5. **Bootstrap New Capabilities**: Use discovered definitions to enhance parsing

### Recursive Enhancement
1. **Re-analyze with New Traits**: Apply newly discovered trait analyzers to foundations
2. **Re-recognize with New Constructs**: Use expanded construct library for pattern matching
3. **Decompose with New Elements**: Apply enhanced element types to constructs
4. **Iterate Until Stable**: Continue until no new definitions are discovered

---

## Integration with SPASE Layers

### Foundation Layer Integration (SPASE Layer 3)
- SPF Phase 1 operates on SPASE foundations (blocks, clusters, subclusters)
- Trait analysis enhances foundation understanding with semantic relationships
- Results feed back into foundation layer for enhanced spatial analysis

### Construct Layer Integration (SPASE Layer 4)
- SPF Phases 2-3 directly implement SPASE construct layer
- Construct recognition and element decomposition provide construct semantics
- Self-definition enables dynamic construct library expansion

### Layout Layer Integration (SPASE Layer 5)
- SPF semantic mapping influences multi-construct layout analysis
- Element relationships inform layout coordination patterns
- Action systems enable layout-aware interactions

### Higher Layer Integration (SPASE Layers 6-10)
- Blueprint matching uses SPF construct and element patterns
- Structure instantiation leverages SPF semantic understanding
- Renovators and explorers operate on SPF-enhanced semantic models

---

## Operational Characteristics

### Trait-Construct-Element Relationships

**Forward Flow**: Traits → Constructs → Elements → Semantics → UI
- Traits indicate possible constructs
- Constructs define their constituent elements
- Elements determine semantic roles and capabilities
- Semantics drive formatting and interaction

**Feedback Flow**: UI ← Semantics ← Elements ← Constructs ← Traits
- User actions modify elements
- Element changes update construct understanding
- Construct changes may trigger trait re-analysis
- Trait changes can reveal new patterns

**Bidirectional Discovery**:
- Elements can suggest construct types ("these parent-child elements indicate a tree")
- Constructs can demand element analysis ("trees require parent-child element identification")
- Both can trigger additional trait analysis ("need hierarchy depth traits for tree elements")

### Multi-Role Element Handling

**Role Composition**: Elements maintain multiple simultaneous roles
- Cell R3C2 = {TreeNode: {level: 2, hasChildren: true}, TableHeader: {column: 2, scope: "col"}}
- Formatting combines all applicable semantic instructions
- Actions present unified menu from all applicable role actions

**Conflict Resolution**:
- **Formatting Conflicts**: Use role priority system (user-definable)
- **Action Conflicts**: Present role-specific action groups
- **Navigation Conflicts**: Context-sensitive navigation (tree vs. table movement)

### Self-Definition Validation

**Safety Constraints**:
- New trait definitions must specify validation criteria
- New construct signatures must include confidence bounds
- New element types must define interaction boundaries
- Custom definitions cannot override core safety mechanisms

**Consistency Checking**:
- Trait definitions must be logically consistent
- Construct signatures must be spatially realizable
- Element hierarchies must avoid circular dependencies
- Action definitions must specify conflict resolution

---

## Developer Mental Model

### Think in Layers of Meaning
1. **"What spatial patterns exist?"** (Trait analysis)
2. **"What do these patterns mean?"** (Construct recognition)
3. **"What are the parts of this meaning?"** (Element decomposition)
4. **"How should this be presented?"** (Semantic mapping)
5. **"How does the user interact with this?"** (UI materialization)

### Design for Bootstrap
- **Start Minimal**: Core capabilities enable discovery of extended capabilities
- **Enable Self-Definition**: Parsed constructs define new parsing capabilities
- **Validate Extensions**: New definitions must be safe and consistent
- **Iterate to Stability**: Re-analyze with enhanced capabilities until convergence

### Embrace Multi-Dimensionality
- **Elements Have Multiple Roles**: Design systems to handle role composition
- **Relationships Are Bidirectional**: Traits inform constructs, constructs demand traits
- **Meaning Is Contextual**: Same spatial pattern may have different meanings in different contexts
- **Interactions Are Semantic**: Actions operate on meaning, not just spatial coordinates

---

## Implementation Strategy

### Phase 1 Implementation: Core Bootstrap
1. Build minimal trait analyzers for spatial, content, and relational characteristics
2. Implement core construct recognizers (tree, table, matrix, key-value)
3. Create basic element decomposition for core constructs
4. Establish semantic mapping and UI materialization pipelines

### Phase 2 Implementation: Self-Definition Infrastructure
1. Define CSV-based syntax for trait definitions
2. Create construct signature definition language
3. Implement element type definition system
4. Build bootstrap discovery and validation mechanisms

### Phase 3 Implementation: Advanced Capabilities
1. Multi-role element composition system
2. Bidirectional discovery algorithms
3. Conflict resolution mechanisms
4. Performance optimization for recursive enhancement

---

This framework provides the systematic thinking needed to build a self-defining, extensible spatial parsing system that can grow from basic construct recognition to sophisticated, user-defined semantic understanding while maintaining clean separation between spatial analysis, semantic interpretation, and user interface materialization.