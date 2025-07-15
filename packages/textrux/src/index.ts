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
// Legacy trait parsing test removed - replaced by Cell Cluster Key detection rules

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

// NEW: Core Construct System with Binary Key Detection (75% reduction!)
export { CoreTree } from "./layers/4-constructs/cell-cluster/tree/CoreTree";
export { CoreTable } from "./layers/4-constructs/cell-cluster/table/CoreTable";
export { CoreMatrix } from "./layers/4-constructs/cell-cluster/matrix/CoreMatrix";
export { CoreKeyValue } from "./layers/4-constructs/cell-cluster/key-value/CoreKeyValue";
export { CoreList } from "./layers/4-constructs/cell-cluster/list/CoreList";

// Core detection rules using Cell Cluster Key system (replaces complex trait system)
export { CoreDetectionRules } from "./layers/3-foundation/cell-cluster/CoreDetectionRules";
export { CoreConstructParser } from "./layers/4-constructs/CoreConstructParser";

export {
  ConstructRegistry,
  defaultConstructRegistry,
} from "./layers/4-constructs/core/ConstructRegistry";
