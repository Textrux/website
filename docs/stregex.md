# Stregex: Structural Regular Expressions for 2D Grids

*A simple, regex-inspired language for finding trees, tables, matrices, and key-value pairs in spatial data*

---

## The Problem with Complex Frameworks

The criticism that "simple regex patterns could identify most constructs with far less complexity" is valid. Instead of building elaborate bidirectional discovery systems and multi-phase semantic parsing frameworks, we can create a pattern matching language that directly describes what we're looking for in 2D space.

**Stregex** (Structural Regular Expressions) extends the familiar regex paradigm into two dimensions, allowing developers to write concise patterns that match spatial structures in grids.

---

## Core Concepts

### Spatial Coordinates and Movement
- `@(r,c)` - Match a specific row/column position
- `@(r+n,c+m)` - Relative movement from current position
- `@(r*,c*)` - Wildcard positions (any row, any column)
- `@next` - Move to next cell in reading order

### Cell Content Matching
- `$"text"` - Cell contains exact text
- `$/pattern/` - Cell content matches regex pattern
- `$empty` - Cell is empty
- `$filled` - Cell contains any content
- `$num` - Cell contains numeric data
- `$*` - Any cell (filled or empty)

### Spatial Relationships
- `→` - Move right (east)
- `↓` - Move down (south)
- `↑` - Move up (north)
- `←` - Move left (west)
- `↘` - Move diagonally down-right
- `↖` - Move diagonally up-left
- `~` - Adjacent to (any direction)
- `~~` - Near (within 2 cells)

### Quantifiers and Repetition
- `{n}` - Exactly n repetitions
- `{n,m}` - Between n and m repetitions
- `+` - One or more
- `*` - Zero or more
- `?` - Zero or one

### Grouping and Capture
- `(pattern)` - Group and capture spatial region
- `(?:pattern)` - Group without capture
- `[name:pattern]` - Named capture group

---

## Basic Patterns

### Simple Content Matching
```stregex
$"Hello"                    # Find cell containing "Hello"
$/^API/                     # Find cell starting with "API"
$num → $"total"             # Number followed by "total" to the right
$filled ↓ $empty            # Filled cell with empty cell below
```

### Spatial Sequences
```stregex
$"A" → $"B" → $"C"          # Horizontal sequence A-B-C
$"1" ↓ $"2" ↓ $"3"          # Vertical sequence 1-2-3
$filled (→ $filled){3}      # Row of 4 filled cells
$"header" ↓ ($filled)+      # Header with filled cells below
```

### Area Matching
```stregex
$"Name" → $"Age" → $"City"  # Table header row
↓                           # Move down
($filled → $filled → $filled)+ # Multiple data rows
```

---

## Construct Detection Patterns

### Tree Structures

**Basic Tree (Down-Right Orientation)**:
```stregex
[root: $filled]             # Capture root node
(↓ ↘? [child: $filled]      # Children below and/or right
  (↓ ↘? [grandchild: $filled])* # Optional grandchildren
)*
```

**Tree with Indentation**:
```stregex
[root: $filled]             # Root at leftmost position
(↓ → [child: $filled]       # Children indented right
  (↓ → → [grandchild: $filled])* # Grandchildren further indented
)*
```

**Generic Tree (Any Orientation)**:
```stregex
[root: $filled]             # Root node
([branch: ~ $filled]        # Adjacent nodes
  ([subbranch: ~ $filled])* # Sub-branches
){2,}                       # At least 2 branches for tree structure
```

### Table Structures

**Simple Table**:
```stregex
[headers: ($filled →)+]     # Header row
↓                           # Move to data
[data: (($filled →)+ ↓)+]   # Data rows
```

**Table with Row Headers**:
```stregex
[corner: $filled] → [colheaders: ($filled →)+]  # Corner + column headers
↓                                                # Move down
([rowheader: $filled] → [rowdata: ($filled →)+] ↓)+ # Row header + data
```

**Bordered Table**:
```stregex
$empty → ($empty →)+ ↓      # Top border
($empty → ($filled →)+ $empty ↓)+ # Bordered rows
$empty → ($empty →)+        # Bottom border
```

### Matrix Structures

**Labeled Matrix**:
```stregex
$empty → [collabels: ($filled →)+]     # Column labels
↓
([rowlabel: $filled] → [data: ($num →)+] ↓)+  # Row labels + numeric data
```

**Correlation Matrix**:
```stregex
[variables: ($filled →)+]              # Variable names
↓
([var: $filled] → [correlations: ($num →)+] ↓)+  # Same variables + correlations
```

### Key-Value Pairs

**Horizontal Key-Value**:
```stregex
([key: $filled] → [value: $filled] ↓)+  # Key-value pairs in rows
```

**Vertical Key-Value**:
```stregex
[keys: ($filled ↓)+]        # Column of keys
→                           # Move right
[values: ($filled ↓)+]      # Column of values
```

**Property List**:
```stregex
([key: $/.*:$/] → [value: $filled] ↓)+  # Keys ending with colon
```

---

## Advanced Features

### Conditional Matching
```stregex
$filled → (?($num) $num | $filled)  # If number, next must be number
[root: $filled] → {                 # Complex tree condition
  ?([child: $filled ↓]+)            # If has children below
  |                                 # OR
  ?([child: $filled →]+)            # If has children right
}
```

### Distance and Proximity
```stregex
$"API" ~~{1,3} $/GET|POST|PUT/      # "API" within 3 cells of HTTP method
$filled ->{2,5} $"total"            # Filled cell 2-5 positions right of "total"
```

### Lookahead and Lookbehind
```stregex
$filled (?= → $"END")               # Filled cell followed by "END" to right
(?<= ↑ $"HEADER") $filled           # Filled cell with "HEADER" above
```

### Pattern Combination
```stregex
(?<tree>                            # Named tree pattern
  [root: $filled]
  (↓ ↘? [child: $filled])*
)
|                                   # OR
(?<table>                           # Named table pattern
  [headers: ($filled →)+] ↓
  [data: (($filled →)+ ↓)+]
)
```

---

## Implementation Strategy

### Phase 1: Core Engine
1. **Lexer**: Parse stregex patterns into tokens
2. **Parser**: Build abstract syntax tree from tokens
3. **Matcher**: Execute patterns against 2D grids
4. **Captures**: Extract matched regions and named groups

### Phase 2: Pattern Library
1. **Built-in Patterns**: Common constructs (tree, table, matrix, key-value)
2. **User Patterns**: Custom pattern definitions
3. **Pattern Composition**: Combine simple patterns into complex ones
4. **Pattern Optimization**: Compile patterns for performance

### Phase 3: Integration
1. **Grid Preprocessing**: Convert CSV to searchable grid format
2. **Multi-Pattern Matching**: Find all construct types in single pass
3. **Conflict Resolution**: Handle overlapping matches
4. **Result Export**: Convert matches to semantic structure

---

## Performance Characteristics

### Advantages Over Complex Frameworks
- **Linear Complexity**: Most patterns scan grid once
- **Predictable Performance**: No bidirectional discovery loops
- **Cacheable Results**: Patterns can be compiled and reused
- **Debuggable**: Clear pattern → match relationship

### Optimization Techniques
- **Early Termination**: Stop matching when pattern fails
- **Spatial Indexing**: Pre-index filled cells and content types
- **Pattern Compilation**: Convert patterns to optimized state machines
- **Incremental Matching**: Re-match only changed regions

---

## Comparison with Semantic Parsing Framework

| Aspect | SPF (Complex) | Stregex (Simple) |
|--------|---------------|------------------|
| **Pattern Definition** | Multi-phase trait analysis | Single regex-like pattern |
| **Execution Model** | Bidirectional discovery | Direct pattern matching |
| **Performance** | Potentially exponential | Linear with input size |
| **Debuggability** | Complex constraint networks | Clear pattern trace |
| **Extensibility** | Self-defining constructs | User-defined patterns |
| **Learning Curve** | Steep (5 phases, multiple concepts) | Gentle (extends familiar regex) |

### What We Gain
- **Simplicity**: Pattern → match, no complex frameworks
- **Performance**: Predictable linear scanning
- **Familiarity**: Builds on regex knowledge
- **Debugging**: Clear execution trace

### What We Lose
- **Self-Definition**: Patterns are static, not discovered from data
- **Bidirectional Discovery**: No constraint propagation between traits/constructs
- **Multi-Role Elements**: Single pattern matches single construct type
- **Dynamic Adaptation**: No learning from spatial arrangements

---

## Example Usage

### Finding API Definitions
```stregex
[api: $/^API/] ↓            # Find "API" header
([endpoint: $/^(GET|POST|PUT|DELETE)/] → [path: $/^\/.*$/] ↓)+  # HTTP methods + paths
```

### Detecting File Structures
```stregex
[folder: $filled] ↓         # Folder name
(→ [file: $/.*\.(js|ts|css)$/] ↓)+  # Indented files with extensions
```

### Finding Financial Tables
```stregex
$/Revenue|Sales|Income/ → ($filled →)+ ↓    # Revenue row
($filled → ($num →)+ ↓)+                    # Data rows with numbers
$/Total/ → ($num →)+                        # Total row
```

---

## Integration with Existing Systems

### CSV Processing Pipeline
1. **Load CSV**: Parse into 2D grid structure
2. **Apply Patterns**: Run stregex patterns against grid
3. **Extract Constructs**: Convert matches to semantic objects
4. **Format UI**: Apply construct-specific formatting
5. **Enable Actions**: Bind construct-appropriate interactions

### Backward Compatibility
- **Fallback Parsing**: Use stregex for common cases, SPF for complex ones
- **Pattern Migration**: Convert trait-based rules to stregex patterns
- **Progressive Enhancement**: Start with stregex, add SPF when needed

### Tool Integration
- **Pattern Debugger**: Visual tool for testing stregex patterns
- **Pattern Library**: Repository of common construct patterns
- **Pattern Generator**: AI-assisted pattern creation from examples

---

## Conclusion

Stregex addresses the valid criticism that complex frameworks may be overengineered for the core problem of finding spatial constructs. By extending the familiar regex paradigm into 2D space, we can:

1. **Simplify dramatically**: Single patterns replace multi-phase frameworks
2. **Improve performance**: Linear scanning replaces constraint solving
3. **Reduce complexity**: Direct pattern matching replaces bidirectional discovery
4. **Maintain power**: Complex spatial patterns remain expressible

While we lose some theoretical elegance and self-defining capabilities, we gain practical usability and predictable performance. For the July 21st conference submission, focusing on stregex-based construct detection provides a much more defensible and implementable approach than the full SPF framework.

The system can always be enhanced later with SPF-style capabilities for edge cases that stregex cannot handle, but starting with simple, working pattern matching establishes a solid foundation for spatial semantic analysis.