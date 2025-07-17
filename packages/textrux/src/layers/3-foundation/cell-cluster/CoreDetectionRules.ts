import GridModel from "../../1-substrate/GridModel";
import CellCluster from "./CellCluster";

/**
 * Core construct detection based on Cell Cluster Key system
 * Uses binary key from R1C1-R2C2 region to directly determine construct types
 */
export interface DetectionResult {
  constructType: "table" | "matrix" | "key-value" | "tree" | "list";
  orientation?: "regular" | "transposed";
  key: number | string;
  hasChildHeader?: boolean;
}

export class CoreDetectionRules {
  private grid: GridModel;

  constructor(grid: GridModel) {
    this.grid = grid;
  }

  /**
   * Detect construct type using Cell Cluster Key system
   * The key is the binary representation of the R1C1-R2C2 region
   */
  detectConstruct(cluster: CellCluster): DetectionResult | null {
    const key = this.calculateCellClusterKey(cluster);

    // Handle special cases first
    if (key === "SC") {
      return null; // Single cell is too small to be a meaningful construct
    }

    // Handle 2-cell List patterns
    if (key === "VL" || key === "HL") {
      return {
        constructType: "list",
        orientation: key === "VL" ? "regular" : "transposed",
        key,
      };
    }

    // Extended keys (0-5) reserved for future use
    if (typeof key === "number" && key >= 0 && key <= 5) {
      return null; // Extended keys not yet implemented
    }

    // Map binary keys to construct types
    switch (key) {
      case 6:
        return null; // Corner Marker - not a construct itself

      case 7:
        return {
          constructType: "matrix",
          key,
        };

      case 8:
        return null; // Single corner cell - not a construct itself

      case 9:
        return {
          constructType: "key-value",
          key,
        };

      case 10:
        return {
          constructType: "tree",
          orientation: "regular",
          key,
          hasChildHeader: false,
        };

      case 11:
        return {
          constructType: "tree",
          orientation: "regular",
          key,
          hasChildHeader: true,
        };

      case 12:
        return {
          constructType: "tree",
          orientation: "transposed",
          key,
          hasChildHeader: false,
        };

      case 13:
        return {
          constructType: "tree",
          orientation: "transposed",
          key,
          hasChildHeader: true,
        };

      case 14:
        return null; // Root Marker - not a construct itself

      case 15:
        return {
          constructType: "table",
          key,
        };

      default:
        console.log(`⚠️ Unknown key detected: ${key}`);
        return null; // Unknown key
    }
  }

  /**
   * Calculate the Cell Cluster Key from the R1C1-R2C2 region
   * Returns either a number (0-15) for 2x2 binary keys or string for special cases
   */
  private calculateCellClusterKey(cluster: CellCluster): number | string {
    // Handle special cases first

    // SC: Single Cell
    if (cluster.filledPoints.length === 1) {
      return "SC";
    }

    // Check for 2-cell List patterns (header + first item)
    const listPattern = this.detect2CellListPattern(cluster);
    if (listPattern) {
      return listPattern;
    }

    // Calculate 2x2 binary key from R1C1-R2C2 region relative to the cluster
    // Check if each position in the cluster's 2x2 top-left region has a filled point
    const filledPointsSet = new Set(
      cluster.filledPoints.map((p) => `${p.row},${p.col}`)
    );

    // Use cluster bounds directly since both bounds and filledPoints are now 1-indexed
    const r1c1Row = cluster.topRow; // Already 1-indexed grid coordinate
    const r1c1Col = cluster.leftCol; // Already 1-indexed grid coordinate

    const r1c1 = filledPointsSet.has(`${r1c1Row},${r1c1Col}`) ? 1 : 0;
    const r1c2 = filledPointsSet.has(`${r1c1Row},${r1c1Col + 1}`) ? 1 : 0;
    const r2c1 = filledPointsSet.has(`${r1c1Row + 1},${r1c1Col}`) ? 1 : 0;
    const r2c2 = filledPointsSet.has(`${r1c1Row + 1},${r1c1Col + 1}`) ? 1 : 0;

    // Convert to binary number (top row first, then bottom row)
    // Binary: R1C1 R1C2 R2C1 R2C2
    const key = (r1c1 << 3) | (r1c2 << 2) | (r2c1 << 1) | r2c2;

    // Debug logging
    console.log(
      `Cell Cluster Key Debug:
    Cluster bounds (0-indexed): topRow=${cluster.topRow}, leftCol=${cluster.leftCol}, bottomRow=${cluster.bottomRow}, rightCol=${cluster.rightCol}
    Cluster filled points (${cluster.filledPoints.length}):`,
      cluster.filledPoints.map((p) => `(${p.row},${p.col})`)
    );
    console.log(`Grid coordinates for R1C1-R2C2 region: r1c1Row=${r1c1Row}, r1c1Col=${r1c1Col}
    Checking binary key cells:
    - R1C1 (${r1c1Row},${r1c1Col}): ${
      r1c1 ? "filled" : "empty"
    } content="${this.grid.getCellRaw(r1c1Row, r1c1Col)}"
    - R1C2 (${r1c1Row},${r1c1Col + 1}): ${
      r1c2 ? "filled" : "empty"
    } content="${this.grid.getCellRaw(r1c1Row, r1c1Col + 1)}"
    - R2C1 (${r1c1Row + 1},${r1c1Col}): ${
      r2c1 ? "filled" : "empty"
    } content="${this.grid.getCellRaw(r1c1Row + 1, r1c1Col)}"
    - R2C2 (${r1c1Row + 1},${r1c1Col + 1}): ${
      r2c2 ? "filled" : "empty"
    } content="${this.grid.getCellRaw(r1c1Row + 1, r1c1Col + 1)}"
    Binary pattern: ${r1c1}${r1c2}\\n${r2c1}${r2c2}
    Calculated key: ${key}`);

    return key;
  }

  /**
   * Detect 2-cell List patterns (header + first item)
   * Returns "VL" for vertical lists, "HL" for horizontal lists, or null
   */
  private detect2CellListPattern(cluster: CellCluster): string | null {
    // Check for vertical list (VL - Vertical List)
    if (this.isVerticalList(cluster)) {
      return "VL";
    }

    // Check for horizontal list (HL - Horizontal List)
    if (this.isHorizontalList(cluster)) {
      return "HL";
    }

    return null;
  }

  /**
   * Check if cluster is a vertical list (header at R1C1, first item at R2C1)
   * ONLY applies when entire cluster is a single column with at least 2 cells
   */
  private isVerticalList(cluster: CellCluster): boolean {
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;

    // Must be exactly one column wide
    if (width !== 1) return false;

    // Must have at least 2 rows
    if (height < 2) return false;

    // Check if first two cells in the column are filled (header + first item)
    // Use cluster bounds directly since they are now 1-indexed
    const baseRow = cluster.topRow; // Already 1-indexed
    const baseCol = cluster.leftCol; // Already 1-indexed
    const r1c1Filled = this.isCellFilled(baseRow, baseCol);
    const r2c1Filled = this.isCellFilled(baseRow + 1, baseCol);

    // Must have header and first item
    return r1c1Filled && r2c1Filled;
  }

  /**
   * Check if cluster is a horizontal list (header at R1C1, first item at R1C2)
   * ONLY applies when entire cluster is a single row with at least 2 cells
   */
  private isHorizontalList(cluster: CellCluster): boolean {
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;

    // Must be exactly one row high
    if (height !== 1) return false;

    // Must have at least 2 columns
    if (width < 2) return false;

    // Check if first two cells in the row are filled (header + first item)
    // Use cluster bounds directly since they are now 1-indexed
    const baseRow = cluster.topRow; // Already 1-indexed
    const baseCol = cluster.leftCol; // Already 1-indexed
    const r1c1Filled = this.isCellFilled(baseRow, baseCol);
    const r1c2Filled = this.isCellFilled(baseRow, baseCol + 1);

    // Must have header and first item
    return r1c1Filled && r1c2Filled;
  }

  /**
   * Check if a cell is filled (has content)
   */
  private isCellFilled(row: number, col: number): boolean {
    const content = this.grid.getCellRaw(row, col);
    return content && content.trim().length > 0;
  }

  /**
   * Get human-readable description of the key
   */
  getKeyDescription(key: number | string): string {
    switch (key) {
      case "SC":
        return "Single Cell";
      case "VL":
        return "Vertical List";
      case "HL":
        return "Horizontal List";
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        return `Extended Key ${key}`;
      case 6:
        return "Corner Marker";
      case 7:
        return "Matrix";
      case 9:
        return "Key-Value";
      case 10:
        return "Tree (Regular)";
      case 11:
        return "Tree (Regular, with Header)";
      case 12:
        return "Tree (Transposed)";
      case 13:
        return "Tree (Transposed, with Header)";
      case 14:
        return "Root Marker";
      case 15:
        return "Table";
      default:
        return `Unknown Key ${key}`;
    }
  }

  /**
   * Convert binary key to visual representation
   */
  getBinaryKeyPattern(key: number | string): string {
    if (typeof key === "string") {
      switch (key) {
        case "SC":
          return "1";
        case "VL":
          return "1\n1";
        case "HL":
          return "11";
        default:
          return "N/A";
      }
    }

    if (typeof key !== "number" || key < 0 || key > 15) {
      return "N/A";
    }

    const r1c1 = (key >> 3) & 1;
    const r1c2 = (key >> 2) & 1;
    const r2c1 = (key >> 1) & 1;
    const r2c2 = key & 1;

    return `${r1c1}${r1c2}\n${r2c1}${r2c2}`;
  }
}
