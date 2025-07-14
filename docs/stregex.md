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
```
(?# structural_pattern ) regex_pattern
```

The structured comment `(?# ... )` defines the spatial pattern, followed by traditional regex for text matching within the identified cells.

### Structural Comment Format
```
(?# construct_type: position_sequence )
```

**Examples:**
- `(?# tree: m6n6o6 )` - Tree structure moving right and down
- `(?# table: mgmgmg|qrqrqr )` - Table with header row and data row
- `(?# keyvalue: mqmq )` - Key-value pairs horizontally

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

## Construct Patterns

### Tree Structures

**Vertical Tree (growing down):**
```
(?# tree: m|q|v ) ^[A-Z][a-z]+$
```
Matches cells in vertical line (center, down, down-down) containing capitalized words.

**Hierarchical Tree (indented):**
```
(?# tree: m|qn|vo ) ^.+$
```
Matches root at center, children indented right-down, grandchildren further right.

**Binary Tree:**
```
(?# tree: m|ql|qr ) ^(root|left|right)$
```
Matches center root with left and right children.

### Table Structures

**Simple Table:**
```
(?# table: fgh|qrs ) ^[A-Za-z0-9]+$
```
Matches 2x3 table pattern with header row and data row.

**Table with Headers:**
```
(?# table: fg|qr ) ^(Name|Age|Alice|30)$
```
Matches column headers in top row, data in second row.

**Extended Table:**
```
(?# table: fghi|qrst|vwxy ) ^\w+$
```
Matches 3x4 table with header and two data rows.

### Matrix Structures

**2x2 Matrix:**
```
(?# matrix: gh|rs ) ^\d+$
```
Matches numeric data in 2x2 arrangement.

**Labeled Matrix:**
```
(?# matrix: fg|qr ) ^(X|Y|\d+)$
```
Matches labels and numeric matrix data.

### Key-Value Pairs

**Horizontal Pairs:**
```
(?# keyvalue: fg|qr|vw ) ^([a-z]+|[0-9]+)$
```
Matches key-value pairs arranged horizontally.

**Vertical Pairs:**
```
(?# keyvalue: f|g|q|r ) ^(key|value)$
```
Matches keys in left column, values in right column.

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

## Implementation Examples

### Finding Trees
```stregex
# Simple vertical tree
(?# tree: m|q|v ) ^[A-Z][a-zA-Z]*$

# Indented hierarchy  
(?# tree: m|qn|vo|zpa ) ^.+$

# Binary tree structure
(?# tree: m|ql|qr ) ^(root|left|right|leaf)$
```

### Finding Tables
```stregex
# Basic table with headers
(?# table: fgh|qrs ) ^(Name|Age|City|[A-Z][a-z]+|\d+)$

# Financial table
(?# table: f|q|v ) ^(Revenue|Q1|Q2|Q3|Q4|\$?\d+)$

# Data matrix
(?# table: fghi|qrst|vwxy ) ^\w+$
```

### Finding Key-Value Structures
```stregex
# Property list
(?# keyvalue: fg|qr|vw ) ^([a-z]+_?[a-z]*|[^:]+:.*)$

# Configuration pairs
(?# keyvalue: f|q|v ) ^(host|port|timeout|[a-zA-Z0-9.]+)$
```

### Finding API Definitions
```stregex
# REST API structure
(?# blueprint: m|qn|vo|zqb ) ^(API|/users|GET|POST|PUT|DELETE)$

# With parameters
(?# blueprint: m|qn|vop ) ^(API|/users/\{id\}|GET|200|404)$
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

Stregex provides a concise, regex-familiar syntax for describing spatial patterns while leveraging the 5x5 grid foundation and navigation system to handle complex nested structures and precise positional matching in 2D space.