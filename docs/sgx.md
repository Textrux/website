# SGX-Progressive: Streamable Grid Exchange

*A future-proof "CSV++" that stays as tiny (or powerful) as you need.*

---

## Why SGX Exists

**CSV is timeless** but has limitations - it can't store binary data like images, doesn't merge cleanly when multiple people edit it, and has no built-in change tracking. **Big-data formats** like Parquet and Arrow solve performance issues but break compatibility with Excel and can't be easily diffed in Git.

**SGX bridges this gap**: keep your familiar `.csv` files completely **unchanged**, and add a small `.sgx` companion file **only when you need capabilities that CSV can't provide**.

---

## Core Philosophy: Progressive Enhancement

SGX follows a "pay-as-you-grow" model:

- **Start simple**: Ship plain CSV files, ignore SGX entirely
- **Add capabilities gradually**: The moment you need thumbnails, change tracking, or system coordination, add a small sidecar file
- **Never break compatibility**: Existing tools continue working with the CSV, while SGX-aware tools get enhanced capabilities
- **Feature flags**: Enable only the features you need - unused capabilities cost zero bytes

---

## Technical Architecture

### The SGX Kernel (Immutable Core)

Every SGX file starts with a minimal 7-byte header:
- Magic bytes: `53 47 58 1F` (identifies this as an SGX file)
- Five core TLV (Type-Length-Value) operations that will never change:
  - `End` - closes a scope
  - `NamespaceDecl` - declares a 16-byte UUID namespace
  - `Nested` - contains sub-TLVs
  - `Blob` - raw binary data
  - `Var/Str` - variable-length integers or UTF-8 strings

Everything else (codes `0x06-0xFF`) lives in extensible namespaces.

### Feature Bank System

SGX uses a variable-length bitmap in the header where each bit represents an optional feature:

| Bit | Feature | Adds to File Size | Capability |
|-----|---------|------------------|------------|
| 0 | ColumnStrip | 6 bytes × columns | Memory-mapped columnar access |
| 1 | ShardIndex | ~1% of file size | Chunk deduplication, resumable transfers |
| 2 | ACL/Crypto | ~2KB | Cell-level security and encryption |
| 3 | WASM Codecs | Module size (once) | Pluggable compression algorithms |
| 4 | Geo-CRS | <256 bytes | Geographic coordinate systems |
| 5 | Zero-copy | Page slice overhead | RDMA/GPU memory mapping |
| 7 | RemoteCsv | Per-link TLV | Stream from HTTPS/IPFS |

Unset bits cost nothing - the base header is only ~30 bytes.

### Sparse-First Storage

SGX only stores non-empty cells, with each cell as a TLV containing:
- Delta-encoded row/column position (1 byte for dense data)
- Data type identifier
- Length-prefixed content

Empty cells cost 0 bytes, making SGX extremely efficient for sparse datasets.

---

## Storage Tiers ("Gears")

SGX adapts to your needs through different operational modes:

### Gear 0: Pure CSV
- Just ship `data.csv`
- Perfect for Excel compatibility and Git diffs
- No SGX overhead

### Gear 1: Sidecar Patches
- Files: `data.csv` + `data.sgx`
- SGX contains only cell patches (binary data, formatting, etc.)
- Text remains fully accessible in CSV
- Typical overhead: <2KB for mixed text/binary data

### Gear 2: Columnar Storage
- Single `.sgx` file with column stripes
- Enable ShardIndex, WASM codecs for compression
- Optimized for analytics while maintaining flexibility

### Gear 3+: Advanced Features
- Encryption, geographic data, nested grids
- Vendor-specific extensions
- Still backward-compatible through feature flags

---

## Key Capabilities

### CSV Integration
- **CsvLink**: Points to local CSV file with SHA-256 integrity checking
- **RemoteCsvLink**: Stream CSV from HTTPS/IPFS URLs with verification
- **CellPatch**: Override specific cells in the CSV with binary data or formatting

### Multi-Dimensional Data
- **PlaneLink**: Map 2D CSV slices into any axes of N-dimensional data
- **FrameJoin**: Stitch multiple CSV files into unified datasets
- **NestedGrid**: Embed complete SGX files within cells for recursive structures

### Collaboration and Versioning ("Git for Grids")
- **Intention Deltas**: Capture semantic edits like "Move range", "Insert rows"
- **Lamport Clocks**: Deterministic ordering of edits from multiple authors
- **Merkle DAG**: Git-like history with cherry-picking and merge capabilities

Each edit operation stores:
- User intent (not just the result)
- Author identity and timestamp
- Parent snapshot hash
- Conflict resolution metadata

### Remote and Distributed Data
- **DirManifest**: Reference entire folder trees
- **PathBase**: Relative path resolution
- Content-addressable storage integration (IPFS compatibility)
- Streaming support for large datasets

---

## Practical Examples

### Example 1: Photo Gallery
```
photos.csv:
id,name,photo
1,Sunset,
2,Beach,

photos.sgx: (conceptual)
- Links to photos.csv with integrity hash
- Cell(1,2): PNG thumbnail (5KB)
- Cell(2,2): PNG thumbnail (4KB)

Result: 26-byte CSV + 9KB SGX vs. 600KB+ if images were base64-encoded in CSV
```

### Example 2: Collaborative Spreadsheet
```
Multiple users editing budget.csv:
- User A: Move expense categories (recorded as MoveRange intention)
- User B: Add new budget line (recorded as InsertSlice intention)
- User C: Update formulas (recorded as FormulaEdit intention)

SGX automatically merges these intentions deterministically, maintaining 
edit history and enabling conflict resolution.
```

### Example 3: Distributed Data Pipeline
```
Pipeline processes data across multiple systems:
- Source CSV contains base data
- SGX sidecar contains:
  - Processing instructions for each system
  - Validation rules that all systems apply
  - Links to remote data sources
  - Results from each processing stage

All systems stay synchronized through SGX coordination metadata.
```

---

## Integration with Spatial Coordination

SGX provides the ideal transport layer for spatial coordination systems:

1. **Spatial semantics** remain in the CSV structure (readable by all tools)
2. **Coordination metadata** lives in the SGX sidecar:
   - Change synchronization between distributed systems
   - Edit history and conflict resolution
   - Binary attachments and rich formatting
   - Cross-system coordination directives

3. **Progressive enhancement** allows teams to:
   - Start with basic CSV for spatial data
   - Add SGX for collaboration and coordination
   - Scale up to full distributed system coordination
   - Never break compatibility with existing tools

---

## Evolution Path

**Day 1**: Ship plain CSV files
**Day 90**: Need to add images/thumbnails → create SGX sidecar with CellPatch
**Day 180**: Team collaboration → add intention deltas for merge resolution
**Day 365**: Analytics requirements → enable ColumnStrip bit, append strip index
**Day 730**: Move to cloud storage → enable ShardIndex, publish remote links

Each step maintains backward compatibility while adding new capabilities.

---

## What SGX Is Not

- **Not a replacement for specialized analytics formats**: Parquet is still faster for pure OLAP workloads
- **Not a complete schema language**: Though future extensions may add richer typing
- **Not magic conflict resolution**: Human judgment still needed for semantic conflicts
- **Not a binary-only format**: The CSV+sidecar model maintains text accessibility

---

## Technical Specifications

### File Format
- All integers use unsigned LEB128 variable-length encoding
- Every extension follows TLV (Type-Length-Value) structure
- Extensible through namespaced opcodes
- Self-describing through FeatureDef TLVs

### Performance Characteristics
- Empty cells: 0 bytes
- Dense rows: ~1 byte per cell position
- Feature overhead: only for enabled features
- Streaming-friendly: can process without loading entire file

### Security Model
- SHA-256 integrity checking for linked files
- Cell-level encryption when ACL feature enabled
- Namespace isolation prevents extension conflicts
- WASM sandbox for custom codecs

---

## Future Directions

- **SchemaChange TLVs**: Add stronger typing support
- **Reference implementations**: CLI tools, Excel add-ins, Power Query connectors
- **Advanced merge semantics**: More sophisticated conflict resolution
- **Real-time synchronization**: Live collaboration support
- **Integration with version control**: Native Git integration

---

SGX represents a pragmatic approach to evolving CSV while maintaining its fundamental strengths: simplicity, universality, and tool compatibility. By adding capabilities only when needed and never breaking existing workflows, SGX enables the gradual adoption of advanced data coordination features without forcing wholesale migration from familiar formats.