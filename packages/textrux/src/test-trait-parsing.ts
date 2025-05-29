import GridModel from "./layers/1-substrate/GridModel";
import CellCluster from "./layers/3-foundation/cell-cluster/CellCluster";
import { CellClusterTraitParser } from "./layers/3-foundation/cell-cluster/CellClusterTraitParser";

// Test the CellClusterTraitParser with fixed property references
function testCellClusterTraitParsing() {
  console.log("Testing CellCluster trait parsing...");

  // Create a small grid with some data
  const grid = new GridModel(5, 5);
  grid.setCellRaw(1, 1, "A");
  grid.setCellRaw(1, 2, "B");
  grid.setCellRaw(2, 1, "1");
  grid.setCellRaw(2, 2, "2");

  // Create a simple cell cluster
  const cluster = new CellCluster(
    1, // topRow
    2, // bottomRow
    1, // leftCol
    2, // rightCol
    [
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ]
  );

  // Create parser and test it
  const parser = new CellClusterTraitParser(grid);

  try {
    const traits = parser.parseTraits(cluster);
    console.log("✅ CellCluster trait parsing successful!");
    console.log("Base traits:", {
      cellCount: traits.base.cellCount,
      width: traits.base.width,
      height: traits.base.height,
      isRectangular: traits.base.isRectangular,
    });
    console.log("Composite traits:", {
      hasTabularStructure: traits.composite.hasTabularStructure,
      dominantContentType: traits.composite.dominantContentType,
    });
    console.log("Derived traits:", {
      primaryPurpose: traits.derived.primaryPurpose,
      semanticRole: traits.derived.semanticRole,
    });
  } catch (error) {
    console.error("❌ CellCluster trait parsing failed:", error);
  }
}

// Run the test if this file is executed directly
if (typeof window === "undefined") {
  testCellClusterTraitParsing();
}

export default testCellClusterTraitParsing;
