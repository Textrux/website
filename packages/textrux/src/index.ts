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
