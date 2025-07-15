import GridModel from "./layers/1-substrate/GridModel";
import CellCluster from "./layers/3-foundation/cell-cluster/CellCluster";

/**
 * Test the new Core Detection Rules system
 * This replaces the complex trait-based system with elegant binary key detection
 */
function testCoreDetection() {
  console.log("🚀 Testing Core Detection Rules System\n");

  // Test 1: Table Detection (all cells filled)
  console.log("📋 Test 1: Table Detection");
  testTableDetection();
  console.log();

  // Test 2: Matrix Detection (unfilledCount = 1, R1C1 empty)
  console.log("🔢 Test 2: Matrix Detection");
  testMatrixDetection();
  console.log();

  // Test 3: Key-Value Detection (R1C1+R2C1 filled, R1C2+R2C2 empty)
  console.log("🗝️ Test 3: Key-Value Detection");
  testKeyValueDetection();
  console.log();

  // Test 4: List Detection (2-cell patterns)
  console.log("📜 Test 4: List Detection");
  testListDetection();
  console.log();

  // Test 5: Tree Detection (everything else)
  console.log("🌳 Test 5: Tree Detection");
  testTreeDetection();
  console.log();

  // Test 6: Size Filter (too small clusters)
  console.log("📏 Test 6: Size Filter");
  testSizeFilter();
  console.log();
}

function testTableDetection() {
  const grid = new GridModel(5, 5);
  
  // Create a 3x3 table (all cells filled)
  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
      grid.setCellRaw(row, col, `R${row}C${col}`);
    }
  }

  const cluster = new CellCluster(0, 2, 0, 2, [
    { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
    { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 },
    { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
  ]);

  const result = cluster.detectConstructType(grid);
  
  if (result?.constructType === "table") {
    console.log("✅ Correctly detected as TABLE");
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  } else {
    console.log(`❌ Expected table, got: ${result?.constructType || 'null'}`);
  }
}

function testMatrixDetection() {
  const grid = new GridModel(5, 5);
  
  // Create a matrix (R1C1 empty, all others filled)
  // Skip R1C1 (empty corner)
  grid.setCellRaw(1, 2, "Col1");
  grid.setCellRaw(1, 3, "Col2");
  grid.setCellRaw(2, 1, "Row1");
  grid.setCellRaw(2, 2, "A");
  grid.setCellRaw(2, 3, "B");
  grid.setCellRaw(3, 1, "Row2");
  grid.setCellRaw(3, 2, "C");
  grid.setCellRaw(3, 3, "D");

  const cluster = new CellCluster(0, 2, 0, 2, [
    { row: 1, col: 2 }, { row: 1, col: 3 },
    { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 },
    { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
  ]);

  const result = cluster.detectConstructType(grid);
  
  if (result?.constructType === "matrix") {
    console.log("✅ Correctly detected as MATRIX");
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  } else {
    console.log(`❌ Expected matrix, got: ${result?.constructType || 'null'}`);
  }
}

function testKeyValueDetection() {
  const grid = new GridModel(5, 5);
  
  // Create key-value pairs (R1C1+R2C1 filled, R1C2+R2C2 empty)
  grid.setCellRaw(1, 1, "Name");      // R1C1 filled
  grid.setCellRaw(2, 1, "Age");       // R2C1 filled
  grid.setCellRaw(3, 1, "City");      // More keys...
  // R1C2 and R2C2 intentionally left empty
  grid.setCellRaw(1, 3, "John");      // Values in column 3
  grid.setCellRaw(2, 3, "25");
  grid.setCellRaw(3, 3, "NYC");

  const cluster = new CellCluster(0, 2, 0, 2, [
    { row: 1, col: 1 },
    { row: 2, col: 1 },
    { row: 3, col: 1 },
    { row: 1, col: 3 },
    { row: 2, col: 3 },
    { row: 3, col: 3 },
  ]);

  const result = cluster.detectConstructType(grid);
  
  if (result?.constructType === "key-value") {
    console.log("✅ Correctly detected as KEY-VALUE");
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`   Orientation: ${result.orientation || 'not specified'}`);
  } else {
    console.log(`❌ Expected key-value, got: ${result?.constructType || 'null'}`);
  }
}

function testListDetection() {
  // Test vertical list (VL key)
  console.log("  Testing Vertical List (VL key):");
  const verticalGrid = new GridModel(4, 2);
  
  // Create vertical list: single column with header + items
  verticalGrid.setCellRaw(1, 1, "Colors");
  verticalGrid.setCellRaw(2, 1, "Red");
  verticalGrid.setCellRaw(3, 1, "Blue");
  
  const verticalCluster = new CellCluster(0, 2, 0, 0, [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 }
  ]);
  
  const verticalResult = verticalCluster.detectConstructType(verticalGrid);
  console.log(`    Pattern: Single column (3 rows x 1 col)`);
  console.log(`    Detection: ${verticalResult?.constructType} (${Math.round((verticalResult?.confidence || 0) * 100)}%)`);
  console.log(`    Orientation: ${verticalResult?.orientation}`);
  console.log(`    Key: ${verticalResult?.key}`);
  
  // Test horizontal list (HL key)
  console.log("\n  Testing Horizontal List (HL key):");
  const horizontalGrid = new GridModel(2, 4);
  
  // Create horizontal list: single row with header + items
  horizontalGrid.setCellRaw(1, 1, "Days");
  horizontalGrid.setCellRaw(1, 2, "Monday");
  horizontalGrid.setCellRaw(1, 3, "Tuesday");
  
  const horizontalCluster = new CellCluster(0, 0, 0, 2, [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 }
  ]);
  
  const horizontalResult = horizontalCluster.detectConstructType(horizontalGrid);
  console.log(`    Pattern: Single row (1 row x 3 cols)`);
  console.log(`    Detection: ${horizontalResult?.constructType} (${Math.round((horizontalResult?.confidence || 0) * 100)}%)`);
  console.log(`    Orientation: ${horizontalResult?.orientation}`);
  console.log(`    Key: ${horizontalResult?.key}`);
  
  // Test NOT a list (multi-row, multi-col)
  console.log("\n  Testing NOT a List (multi-row, multi-col):");
  const notListGrid = new GridModel(3, 3);
  
  // Create multi-row, multi-col structure
  notListGrid.setCellRaw(1, 1, "A");
  notListGrid.setCellRaw(2, 1, "B");
  notListGrid.setCellRaw(1, 2, "C");
  notListGrid.setCellRaw(2, 2, "D");
  
  const notListCluster = new CellCluster(0, 1, 0, 1, [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 1 }
  ]);
  
  const notListResult = notListCluster.detectConstructType(notListGrid);
  console.log(`    Pattern: Multi-row, multi-col (2 rows x 2 cols)`);
  console.log(`    Detection: ${notListResult?.constructType} (should be table/matrix/tree, not list)`);
  console.log(`    Key: ${notListResult?.key}`);
}

function testTreeDetection() {
  const grid = new GridModel(5, 5);
  
  // Create a simple tree (R1C1+R2C1 filled, R1C2 empty)
  grid.setCellRaw(1, 1, "Root");        // R1C1 filled
  grid.setCellRaw(2, 1, "Parent1");     // R2C1 filled  
  grid.setCellRaw(3, 2, "  Child1");    // R1C2 empty initially
  grid.setCellRaw(4, 2, "  Child2");

  const cluster = new CellCluster(0, 3, 0, 1, [
    { row: 1, col: 1 },
    { row: 2, col: 1 },
    { row: 3, col: 2 },
    { row: 4, col: 2 },
  ]);

  const result = cluster.detectConstructType(grid);
  
  if (result?.constructType === "tree") {
    console.log("✅ Correctly detected as TREE");
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`   Orientation: ${result.orientation || 'regular'}`);
  } else {
    console.log(`❌ Expected tree, got: ${result?.constructType || 'null'}`);
  }
}

function testSizeFilter() {
  const grid = new GridModel(5, 5);
  
  // Create a cluster that's too small (1x1)
  grid.setCellRaw(1, 1, "Single");

  const cluster = new CellCluster(0, 0, 0, 0, [
    { row: 1, col: 1 }
  ]);

  const result = cluster.detectConstructType(grid);
  
  if (result === null) {
    console.log("✅ Correctly filtered out small cluster");
  } else {
    console.log(`❌ Expected null (filtered), got: ${result?.constructType}`);
  }
}

// Run the test if this file is executed directly
if (typeof window === "undefined") {
  testCoreDetection();
}

export default testCoreDetection;