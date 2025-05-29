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
export { demonstrateTraitParsing } from "./demo/TraitParsingDemo";
export { default as testCellClusterTraitParsing } from "./test-trait-parsing";

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

export { default as Tree } from "./layers/4-constructs/cell-cluster/tree/Tree";
export { default as Table } from "./layers/4-constructs/cell-cluster/table/Table";
export { default as Matrix } from "./layers/4-constructs/cell-cluster/matrix/Matrix";
export { default as KeyValue } from "./layers/4-constructs/cell-cluster/key-value/KeyValue";

export {
  ConstructRegistry,
  defaultConstructRegistry,
} from "./layers/4-constructs/core/ConstructRegistry";

export { TreeSignatures } from "./layers/4-constructs/cell-cluster/tree/TreeSignatures";
export { TableSignatures } from "./layers/4-constructs/cell-cluster/table/TableSignatures";
export { MatrixSignatures } from "./layers/4-constructs/cell-cluster/matrix/MatrixSignatures";
export { KeyValueSignatures } from "./layers/4-constructs/cell-cluster/key-value/KeyValueSignatures";
