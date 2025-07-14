import GridModel from "./layers/1-substrate/GridModel";
import CellCluster from "./layers/3-foundation/cell-cluster/CellCluster";
import { TreeSignatureParser } from "./layers/4-constructs/cell-cluster/tree/TreeSignatureParser";

// Test the new trait-based tree detection
function testTreeDetection() {
  console.log("🌳 Testing trait-based tree detection...\n");

  // Create a grid with a simple tree structure
  const grid = new GridModel(8, 6);
  
  // Tree structure meeting strict constraints:
  // Root
  //   Child1
  //   Child2
  
  grid.setCellRaw(1, 1, "Root");           // (1,1) - root at top-left
  grid.setCellRaw(2, 2, "  Child1");       // (2,2) - child 1 column right of parent
  grid.setCellRaw(3, 2, "  Child2");       // (3,2) - child at same column as sibling

  // Debug: verify the cells were set
  console.log(`Debug: Root cell (1,1) = "${grid.getCellRaw(1, 1)}"`);
  console.log(`Debug: Child1 cell (2,2) = "${grid.getCellRaw(2, 2)}"`);
  console.log(`Debug: Child2 cell (3,2) = "${grid.getCellRaw(3, 2)}"`);
  console.log();

  console.log("Created tree structure:");
  for (let row = 1; row <= 8; row++) {
    let rowStr = "";
    for (let col = 1; col <= 6; col++) {
      const content = grid.getCellRaw(row, col);
      rowStr += content ? `"${content}"`.padEnd(15) : "".padEnd(15);
    }
    console.log(`Row ${row}: ${rowStr.trim() || '(empty)'}`);
  }
  console.log();

  // Create a cell cluster covering the tree (using same coordinates as grid: 1-indexed)
  const cluster = new CellCluster(
    1, // topRow
    3, // bottomRow
    1, // leftCol
    2, // rightCol
    [
      { row: 1, col: 1 }, // Root
      { row: 2, col: 2 }, // Child1
      { row: 3, col: 2 }, // Child2
    ]
  );

  // Test tree detection
  const parser = new TreeSignatureParser(grid);

  try {
    console.log("🔍 Analyzing cluster for tree patterns...");
    const trees = parser.parseConstruct(cluster);
    
    if (trees.length > 0) {
      console.log(`✅ Tree detection successful! Found ${trees.length} tree(s)\n`);
      
      trees.forEach((tree, index) => {
        console.log(`Tree ${index + 1}:`);
        console.log(`  - ID: ${tree.id}`);
        console.log(`  - Confidence: ${(tree.confidence * 100).toFixed(1)}%`);
        console.log(`  - Orientation: ${tree.orientation.primary}-${tree.orientation.secondary}`);
        console.log(`  - Elements: ${tree.rootElements.length} root elements`);
        console.log(`  - Max depth: ${tree.maxDepth}`);
        console.log(`  - Total elements: ${tree.metadata.totalElements || 'unknown'}`);
        
        // Show tree structure
        console.log(`  - Tree structure:`);
        tree.rootElements.forEach(root => {
          printTreeElement(root, "    ");
        });
        console.log();
      });
    } else {
      console.log("❌ No trees detected in the cluster");
      
      // Debug: Show traits to understand why detection failed
      if (cluster.traits) {
        console.log("\n🔍 Debug - Tree detection traits:");
        const td = cluster.traits.treeDetection;
        console.log(`  - allCellsFilled: ${td.allCellsFilled} (should be false)`);
        console.log(`  - filledTopLeftCell: ${td.filledTopLeftCell} (should be true)`);
        console.log(`  - maxRowIndentationIncrease: ${td.maxRowIndentationIncrease} (should be ≤1)`);
        console.log(`  - maxGapSizeInAnyRow: ${td.maxGapSizeInAnyRow} (should be ≤1)`);
        console.log(`  - maxGapCountInAnyRow: ${td.maxGapCountInAnyRow} (should be ≤1)`);
        console.log(`  - maxFilledCellsBeforeAnyRowGap: ${td.maxFilledCellsBeforeAnyRowGap} (should be ≤1)`);
        console.log(`  - nonParentRowsWithGap: ${td.nonParentRowsWithGap} (should be 0)`);
      }
    }
  } catch (error) {
    console.error("❌ Tree detection failed:", error);
  }
}

function printTreeElement(element: any, indent: string): void {
  console.log(`${indent}${element.content} (${element.elementType}, level: ${element.level})`);
  element.children.forEach((child: any) => {
    printTreeElement(child, indent + "  ");
  });
}

// Test a non-tree structure (table) to ensure it's not misidentified
function testNonTreeStructure() {
  console.log("\n📋 Testing non-tree structure (table) detection...\n");

  const grid = new GridModel(5, 5);
  
  // Table structure (all cells filled - should NOT be detected as tree)
  grid.setCellRaw(0, 0, "Name");
  grid.setCellRaw(0, 1, "Age");
  grid.setCellRaw(0, 2, "City");
  grid.setCellRaw(1, 0, "John");
  grid.setCellRaw(1, 1, "25");
  grid.setCellRaw(1, 2, "NYC");
  grid.setCellRaw(2, 0, "Jane");
  grid.setCellRaw(2, 1, "30");
  grid.setCellRaw(2, 2, "LA");

  console.log("Created table structure:");
  for (let row = 0; row < 3; row++) {
    let rowStr = "";
    for (let col = 0; col < 3; col++) {
      const content = grid.getCellRaw(row, col);
      rowStr += content ? `"${content}"`.padEnd(8) : "".padEnd(8);
    }
    console.log(`Row ${row}: ${rowStr}`);
  }
  console.log();

  const cluster = new CellCluster(
    0, 2, 0, 2,
    [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
      { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
      { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
    ]
  );

  const parser = new TreeSignatureParser(grid);
  const trees = parser.parseConstruct(cluster);

  if (trees.length === 0) {
    console.log("✅ Correctly identified as non-tree (table structure)");
  } else {
    console.log(`❌ Incorrectly identified as tree (found ${trees.length} trees)`);
  }
}

// Run the tests if this file is executed directly
if (typeof window === "undefined") {
  testTreeDetection();
  testNonTreeStructure();
}

export { testTreeDetection, testNonTreeStructure };