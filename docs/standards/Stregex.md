# Stregex: Structural Regular Expressions

*A regex extension for matching spatial patterns in 2D grids using structured comments and positional encoding*

---

## Core Concept

Stregex extends traditional regular expressions by adding structured comments that define spatial patterns while maintaining the familiar regex syntax for text matching. The system uses a 5x5 grid as the fundamental spatial unit, with letters representing specific cell positions and numbers controlling navigation through nested grid structures.

---

## The 5x5 Grid Foundation

Every spatial pattern is based on a 5x5 grid where the center cell (position 13, using 1-25 numbering) can be filled and surrounded by empty cells. This represents the minimum "block" size in spatial semantics.

### Letter Encoding (a-y)
The 25 positions in a 5x5 grid map to letters a-y, reading left to right, top to bottom:

```
a b c d e
f g h i j
k l m n o
p q r s t
u v w x y
```

Where:
- `m` = center cell (position 13)
- `z` = represents a completely empty 5x5 grid
- Each letter represents that specific position relative to a center point

### Number Encoding (0-9)
Numbers control navigation through nested grid structures:

```
1 2 3
4 5 6
7 8 9
```

Where:
- `5` = enter/descend into the current cell (embedded grid)
- `0` = exit/ascend up one level (leave embedded grid)
- `1-4, 6-9` = move to adjacent cells around center (like numpad directions)

---

## Stregex Syntax

### Basic Structure
All Stregex patterns are contained within regex comments, making them invisible to traditional parsers while remaining valid syntax:

```
(?# :structural_pattern: regex_pattern )
```

The `:` characters delimit the structural and regex portions within the comment.

### Grammar Variable System
Stregex supports variables that can be defined and referenced across patterns, enabling complex grammar definitions:

```
(?# $root=tree: m: ^[A-Z][a-z]+$ )
(?# $child=construct: n: ^(table|matrix|keyvalue)$ )  
(?# $tree: $root($child)*: .* )
```

### Full Comment Format
```
(?# $variable=construct_type: position_sequence: regex_pattern )
```

**Examples:**
- `(?# $root=tree: m: ^[A-Z][a-z]+$ )` - Define root tree node
- `(?# $header=table: fgh: ^(Name|Age|City)$ )` - Define table header
- `(?# $api: $root($endpoints)*: ^API$ )` - Reference defined variables

---

## Position Sequences

### Simple Patterns
- `m` - Match center cell only
- `mg` - Match center, then cell to its right
- `mq` - Match center, then cell below
- `mgq` - Match center, right, then down-left

### Repetition and Grouping
- `mg+` - Center followed by one or more cells to the right
- `(mg)*` - Zero or more center-right patterns
- `mg|mq` - Either center-right OR center-down
- `m[gqr]` - Center followed by right, down, or down-right

### Multi-Row Patterns
- `mgm|qrs` - Two rows: center-right-center, then down(q)-down-right(r)-down-down-right(s)
- `abc|fgh|klm` - Three horizontal rows (top, middle, bottom of 5x5)

### Navigation Sequences
- `m5mg` - Center, descend into embedded grid, then move within that grid
- `mg0qr` - Center-right, ascend to parent, then move down-down-right
- `m2mg` - Center, move to adjacent cell (direction 2), then right

---

## Grammar Definitions

### Tree Grammar with Nested Constructs

**Step 1: Define Basic Constructs**
```stregex
(?# $table_header=table: fgh: ^[A-Z][a-z]+$ )
(?# $table_row=table: qrs: ^\w+$ )
(?# $table=table: $table_header|$table_row: .* )

(?# $matrix_labels=matrix: fg: ^[XY]$ )
(?# $matrix_data=matrix: qr: ^\d+$ )
(?# $matrix=matrix: $matrix_labels|$matrix_data: .* )

(?# $kv_key=keyvalue: f: ^[a-z]+$ )
(?# $kv_val=keyvalue: g: ^[a-zA-Z0-9]+$ )
(?# $keyvalue=keyvalue: $kv_key$kv_val: .* )
```

**Step 2: Define Tree Components**
```stregex
(?# $tree_root=tree: m: ^[A-Z][a-zA-Z]*$ )
(?# $tree_child=tree: n: ^[a-z][a-zA-Z]*$ )
(?# $child_construct=construct: n: ($table|$matrix|$keyvalue) )
```

**Step 3: Complete Tree Grammar**
```stregex
(?# $tree=tree: $tree_root($tree_child|$child_construct)*: .* )
```

### Example: API Tree Structure

**Define API Components:**
```stregex
(?# $api_root=tree: m: ^API$ )
(?# $endpoint=tree: n: ^/[a-z]+$ )
(?# $method=tree: o: ^(GET|POST|PUT|DELETE)$ )
(?# $response=table: p: ^\d{3}$ )
```

**Define API Grammar:**
```stregex
(?# $api_endpoint=tree: $endpoint($method($response)?)*: .* )
(?# $api_tree=tree: $api_root($api_endpoint)+: .* )
```

**Usage:**
```
API          ← $api_root matches here
  /users     ← $endpoint matches here
    GET      ← $method matches here
      200    ← $response matches here
    POST
      201
  /orders
    GET
      200
```

### Complex Tree with Mixed Children

**File System Tree with Various File Types:**
```stregex
(?# $folder=tree: m: ^[A-Z][a-zA-Z]*$ )
(?# $js_file=tree: n: ^[a-z]+\.js$ )
(?# $css_file=tree: n: ^[a-z]+\.css$ )
(?# $config=keyvalue: o: ^(port|host|timeout)$ )
(?# $config_val=keyvalue: p: ^\d+|[a-z.]+$ )
(?# $config_pair=keyvalue: $config$config_val: .* )

(?# $file_tree=tree: $folder(($js_file|$css_file)+($config_pair)*): .* )
```

**Usage:**
```
Components        ← $folder matches
  Button.js       ← $js_file matches  
  Modal.js        ← $js_file matches
  styles.css      ← $css_file matches
  port            ← $config matches
    3000          ← $config_val matches
  host            ← $config matches  
    localhost     ← $config_val matches
```

### Database Schema Tree

**Schema with Tables and Relationships:**
```stregex
(?# $schema=tree: m: ^[A-Z_]+$ )
(?# $table_name=tree: n: ^[a-z_]+$ )
(?# $field=table: o: ^[a-z_]+$ )
(?# $type=table: p: ^(int|varchar|date)$ )
(?# $table_def=table: $field$type: .* )

(?# $db_schema=tree: $schema($table_name($table_def)+)+: .* )
```

**Usage:**
```
USER_SCHEMA       ← $schema matches
  users           ← $table_name matches
    id            ← $field matches
      int         ← $type matches  
    name          ← $field matches
      varchar     ← $type matches
    created       ← $field matches
      date        ← $type matches
  orders          ← $table_name matches
    id            ← $field matches
      int         ← $type matches
    user_id       ← $field matches  
      int         ← $type matches
```

---

## Advanced Features

### Nested Grid Navigation

**Embedded CSV Pattern:**
```
(?# embedded: m5fgh ) ^[A-Z]+$
```
Match center cell, descend into embedded grid, match top row.

**Multi-Level Navigation:**
```
(?# deep: m5q5fg0r ) ^\w+$
```
Center → descend → down → descend → top-left-center → ascend → down-right.

### Conditional Patterns

**Tree with Optional Branches:**
```
(?# tree: m(|q)(|r) ) ^(root|child)?$
```
Match root with optional children down or down-right.

**Table with Variable Columns:**
```
(?# table: f[gh]?|q[rs]? ) ^\w*$
```
Match table with 1-2 columns, header and data rows.

### Pattern Combinations

**API Definition:**
```
(?# blueprint: m|qn|vo ) ^(API|GET|POST)$
```
Matches API root with indented HTTP methods.

**File Structure:**
```
(?# blueprint: m|qg|vh ) ^(folder|file\.js|readme\.md)$
```
Matches folder with indented files.

---

## Grammar Compilation and Execution

### Variable Resolution
Variables are resolved in order of definition, allowing for progressive grammar building:

```stregex
(?# $root=tree: m: ^[A-Z]+$ )           // Define root pattern
(?# $child=tree: n: ^\w+$ )             // Define child pattern  
(?# $leaf=construct: o: ($table|$kv) )  // Reference other variables
(?# $full_tree=tree: $root($child($leaf)*)*: .* ) // Complete grammar
```

### Grammar Execution Pipeline

**Step 1: Variable Collection**
- Parse all `(?# $var=... )` definitions
- Build dependency graph between variables
- Validate circular references

**Step 2: Pattern Compilation**  
- Resolve variable references to concrete patterns
- Compile position sequences to spatial coordinates
- Generate state machine for pattern matching

**Step 3: Grid Matching**
- Apply compiled grammar to 5x5 grid blocks
- Match spatial patterns with text constraints
- Return hierarchical construct tree

### Example: Complete API Grammar

```stregex
// Basic constructs
(?# $table_row=table: fg: ^\w+$ )
(?# $kv_pair=keyvalue: fg: ^[a-z]+$ )

// Tree components  
(?# $api_root=tree: m: ^API$ )
(?# $endpoint=tree: n: ^/\w+$ )
(?# $method=tree: o: ^(GET|POST|PUT|DELETE)$ )
(?# $param=tree: p: ^\{[a-z]+\}$ )
(?# $response=tree: q: ^\d{3}$ )
(?# $schema=construct: r: ($table_row|$kv_pair) )

// Complete grammar
(?# $api_method=tree: $method($param)?($response($schema)?)?: .* )
(?# $api_endpoint=tree: $endpoint($api_method)+: .* )  
(?# $api_spec=tree: $api_root($api_endpoint)+: .* )
```

**Matches:**
```
API                    ← $api_root
  /users               ← $endpoint  
    GET                ← $method
      200              ← $response
        name           ← $table_row (part of $schema)
        email          ← $table_row (part of $schema)
    POST               ← $method
      {user}           ← $param
      201              ← $response
  /orders              ← $endpoint
    GET                ← $method
      200              ← $response
        total          ← $kv_pair (part of $schema)
        items          ← $kv_pair (part of $schema)
```

---

## Pattern Compilation

### Phase 1: Parse Structural Comment
1. Extract construct type and position sequence
2. Validate position letters (a-y) and numbers (0-9)
3. Build spatial navigation map
4. Identify grid entry/exit points

### Phase 2: Compile Position Sequence
1. Convert letters to 5x5 coordinates
2. Process navigation numbers for grid traversal
3. Generate cell visitation order
4. Handle repetition and alternation

### Phase 3: Apply Text Matching
1. For each spatial pattern match
2. Extract text from identified cells
3. Apply regex pattern to cell contents
4. Validate complete pattern match

### Phase 4: Return Structured Results
1. Capture spatial boundaries of match
2. Extract text content from matched cells
3. Return construct type and confidence
4. Provide cell-level match details

---

## Usage Patterns

### Basic Matching
```javascript
const pattern = /(?# tree: m|qn|vo ) ^[A-Z][a-z]+$/;
const matches = grid.match(pattern);
// Returns tree structures with capitalized labels
```

### Multiple Construct Detection
```javascript
const patterns = [
  /(?# tree: m|q+ ) ^\w+$/,      // Vertical trees
  /(?# table: f+|q+ ) ^\w+$/,    // Tables  
  /(?# keyvalue: fg|qr ) ^\w+$/, // Key-value pairs
];
const constructs = patterns.map(p => grid.match(p)).flat();
```

### Blueprint Matching
```javascript
const apiPattern = /(?# blueprint: m|qn|vo ) ^(API|GET|POST|PUT|DELETE)$/;
const apis = grid.match(apiPattern);
// Finds API definition structures
```

---

## Grid Processing Pipeline

### 1. Grid Preparation
- Parse CSV into 5x5 block structure
- Index filled vs empty cells
- Build navigation maps for nested grids

### 2. Pattern Application
- Compile stregex patterns into spatial matchers
- Apply patterns to grid systematically
- Handle overlapping matches with priority rules

### 3. Result Processing
- Extract matched regions and text content
- Classify construct types and confidence scores
- Generate semantic structure from spatial matches

### 4. UI Integration
- Apply construct-specific formatting
- Enable pattern-aware interactions
- Provide visual feedback for matched structures

---

## Integration with Foundation Trait Analysis

### Two-Phase Discovery Approach

Rather than using Stregex for initial construct detection, a more practical approach combines **trait-based classification** with **Stregex element parsing**:

**Phase 1: Trait-Based Construct Classification**
- Analyze foundation elements (blocks, cell clusters) for comprehensive spatial traits
- Extract specific algorithmic characteristics that indicate construct types
- Classify as likely tree, table, matrix, or key-value with confidence scores
- Use precise spatial measurements rather than complex pattern matching

*For complete trait analysis, see [Comprehensive Trait Analysis](./comprehensive-trait-analysis.md) which details the full taxonomy of Base Traits, Composite Traits, and Derived Traits used for construct recognition.*

### Summarized Trait Categories

The comprehensive trait system includes:

**Base Traits**: Fundamental measurements
- Core metrics (fill counts, dimensions, density)
- Edge and perimeter analysis  
- Row/column dimensional analysis
- Quarter, corner, diagonal, and center analysis

**Composite Traits**: Complex pattern recognition
- Regularity analysis and first-fill patterns
- Critical indentation analysis for tree detection
- Symmetry analysis across multiple axes

**Derived Traits**: High-level semantic interpretations
- Root cell identification and pattern directionality
- Primary/secondary flow direction analysis

**Key Tree Detection Traits**:
- `CornerDimensions.TopLeft.IsFilled = true` (anchor requirement)
- `FirstFilledPatternLeftEdge.TopDownMaxIndentation ≤ 1` (tree constraint)
- `FirstFilledPatternLeftEdge.TopDownMaxRetraction > 0` (hierarchy indicator)
- `PercentFilled < 60%` (sparsity indicator)

**Key Matrix Detection Traits**:
- `Edges.TopEdge.PercentFilled > 80%` (header requirement)
- `Edges.LeftEdge.PercentFilled > 80%` (row labels requirement)
- `PercentFilled > 80%` (density requirement)
- `IsRegular = true` (grid structure requirement)

*See [Comprehensive Trait Analysis](./comprehensive-trait-analysis.md) for complete algorithms, calculations, and detection examples.*

**Phase 2: Stregex Element Decomposition**  
- Apply construct-specific Stregex grammars to identified candidates
- Parse detailed element structure (root nodes, headers, keys, values)
- Extract precise semantic relationships and roles
- Handle orientation variations and edge cases

### Trait-Guided Stregex Selection

**Tree Traits → Tree Grammar**
```javascript
if (foundation.traits.hasHierarchy && foundation.traits.consistentIndentation) {
  applyGrammar($tree_indented);
} else if (foundation.traits.hasHierarchy && foundation.traits.verticalAlignment) {
  applyGrammar($tree_vertical);
} else if (foundation.traits.hasBranching) {
  applyGrammar($tree_branched);
}
```

**Table Traits → Table Grammar**
```javascript
if (foundation.traits.gridLikeness > 0.8 && foundation.traits.hasHeaders) {
  applyGrammar($table_with_headers);
} else if (foundation.traits.gridLikeness > 0.6) {
  applyGrammar($table_simple);
}
```

### Example: Tree Element Parsing

**Step 1: Foundation Analysis**
```
Foundation: CellCluster {
  traits: {
    hasHierarchy: true,
    hierarchyDepth: 3,
    orientation: "down-right", 
    consistentIndentation: true,
    gridLikeness: 0.2
  }
  confidence: 0.85
}
```

**Step 2: Apply Tree Grammar**
```stregex
// Selected based on down-right + indentation traits
(?# $root=tree: m: ^[A-Z][a-zA-Z]*$ )
(?# $child_l1=tree: n: ^[a-z][a-zA-Z]*$ )  
(?# $child_l2=tree: o: ^[a-z][a-zA-Z]*$ )
(?# $indented_tree=tree: $root($child_l1($child_l2)*)*: .* )
```

**Step 3: Element Extraction**
```
TreeElements: {
  root: { cell: "A1", content: "Components", level: 0 }
  children: [
    { cell: "B2", content: "Button", level: 1, parent: "A1" },
    { cell: "C3", content: "Primary", level: 2, parent: "B2" },
    { cell: "C4", content: "Secondary", level: 2, parent: "B2" },
    { cell: "B5", content: "Modal", level: 1, parent: "A1" }
  ]
}
```

### Benefits of Hybrid Approach

**Simplified Pattern Matching**:
- Traits eliminate need for complex construct detection patterns
- Stregex focuses on element parsing, not construct recognition
- Much faster than trying every possible grammar

**Better Accuracy**:
- Trait analysis handles orientation and layout variations
- Stregex provides precise element boundaries and relationships
- Confidence scores guide grammar selection

**Practical Implementation**:
- Build on existing foundation/trait infrastructure
- Add Stregex as element parsing layer
- Avoid complex bidirectional discovery systems

### Recommended Architecture

```
1. Foundation Analysis → Extract spatial traits
2. Construct Classification → Identify likely construct type
3. Grammar Selection → Choose appropriate Stregex grammar  
4. Element Parsing → Apply grammar to extract elements
5. Semantic Assembly → Build complete construct model
```

This approach uses Stregex where it excels (precise element parsing) while relying on simpler trait analysis for initial construct detection, providing the best of both approaches without over-engineering.

---

Stregex provides a concise, regex-familiar syntax for describing spatial patterns while leveraging the 5x5 grid foundation and navigation system to handle complex nested structures and precise positional matching in 2D space.