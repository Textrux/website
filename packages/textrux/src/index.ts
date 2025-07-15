export { default as GridGalleryView } from "./ui/GridGalleryView";
export { default as GridGalleryModel } from "./layers/1-substrate/GridGalleryModel";
export { GridView } from "./ui/GridView";
export { default as GridModel } from "./layers/1-substrate/GridModel";

// Fix: we actually export CellFormat from its own file:
export { CellFormat } from "./style/CellFormat";

// Fix: reference correct path for GridView's SelectionRange
export type { SelectionRange } from "./ui/GridView";

export { fromCSV, toCSV } from "./util/CSV";
export { fromTSV, toTSV } from "./util/TSV";

// Export examples for use in other packages
export { examples, type ExampleData } from "./examples";

// Export parsing and demo functions
export { parseAndFormatGrid } from "./layers/1-substrate/GridParser";
// export { demonstrateTraitParsing } from "./demo/TraitParsingDemo"; // Legacy trait demo removed
// Legacy trait parsing test removed - replaced by simple detection rules

// Export foundation elements
export { default as CellCluster } from "./layers/3-foundation/cell-cluster/CellCluster";
export { default as BlockSubcluster } from "./layers/3-foundation/block-subcluster/BlockSubcluster";
export { default as BlockCluster } from "./layers/3-foundation/block-cluster/BlockCluster";

// Export construct system
export type {
  BaseConstruct,
  ConstructSignature,
  ConstructSignatureParser,
  DirectionalOrientation,
  ConstructPosition,
} from "./layers/4-constructs/interfaces/ConstructInterfaces";

// NEW: Simplified Construct System (75% reduction!)
export { SimpleTree } from "./layers/4-constructs/cell-cluster/tree/SimpleTree";
export { SimpleTable } from "./layers/4-constructs/cell-cluster/table/SimpleTable";
export { SimpleMatrix } from "./layers/4-constructs/cell-cluster/matrix/SimpleMatrix";
export { SimpleKeyValue } from "./layers/4-constructs/cell-cluster/key-value/SimpleKeyValue";

// Simple detection rules (replaces complex trait system)
export { SimpleDetectionRules } from "./layers/3-foundation/cell-cluster/SimpleDetectionRules";
export { SimpleConstructParser } from "./layers/4-constructs/SimpleConstructParser";

export {
  ConstructRegistry,
  defaultConstructRegistry,
} from "./layers/4-constructs/core/ConstructRegistry";
