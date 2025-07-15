import GridModel from "../../1-substrate/GridModel";
import CellCluster from "./CellCluster";

/**
 * Simple construct detection based on basic cell patterns
 * Replaces the complex trait-based system with elegant pattern matching
 */
export interface DetectionResult {
  constructType: "table" | "matrix" | "key-value" | "tree";
  orientation?: "regular" | "transposed";
  confidence: number;
  markerCell?: { row: number; col: number; content: string };
}

export class SimpleDetectionRules {
  private grid: GridModel;

  constructor(grid: GridModel) {
    this.grid = grid;
  }

  /**
   * Detect construct type using the 4-rule system from slides
   */
  detectConstruct(cluster: CellCluster): DetectionResult | null {
    // Rule 0: Size filter - ignore if less than 2 rows AND 2 columns
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;
    
    if (width < 2 && height < 2) {
      return null; // Too small to be a meaningful construct
    }

    const analysis = this.analyzeCellPattern(cluster);

    // Rule 1: Table detection - if all cells are filled
    if (analysis.allCellsFilled) {
      return {
        constructType: "table",
        confidence: 1.0
      };
    }

    // Rule 2: Matrix detection - if unfilledCellCount = 1 AND R1C1 is empty
    if (analysis.unfilledCellCount === 1 && !analysis.r1c1Filled) {
      return {
        constructType: "matrix",
        confidence: 1.0
      };
    }

    // Rule 3: Key-Value detection - R1C1 filled (header), R2C1 empty, R1C2 empty, R2C2 filled (first key)
    // Pattern: gaps at R2C1 and R1C2, with first key always at R2C2
    if (analysis.r1c1Filled && !analysis.r2c1Filled && !analysis.r1c2Filled && analysis.r2c2Filled) {
      // Additional check: must have values beyond the key column to be key-value
      const hasValuesInOtherColumns = this.hasValuesInOtherColumns(cluster);
      if (hasValuesInOtherColumns) {
        const orientation = this.detectKeyValueOrientation(cluster, analysis);
        return {
          constructType: "key-value",
          orientation,
          confidence: 1.0,
          markerCell: analysis.markerCell
        };
      }
    }

    // Rule 4: Tree detection - everything else
    const treeOrientation = this.detectTreeOrientation(analysis);
    return {
      constructType: "tree",
      orientation: treeOrientation,
      confidence: 1.0
    };
  }

  /**
   * Analyze basic cell pattern for the cluster
   */
  private analyzeCellPattern(cluster: CellCluster): CellPatternAnalysis {
    const totalCells = (cluster.rightCol - cluster.leftCol + 1) * (cluster.bottomRow - cluster.topRow + 1);
    const filledCells = cluster.filledPoints.length;
    const unfilledCellCount = totalCells - filledCells;
    const allCellsFilled = unfilledCellCount === 0;

    // Check specific corner cells (using 1-indexed grid coordinates)
    const r1c1Filled = this.isCellFilled(cluster.topRow + 1, cluster.leftCol + 1);
    const r1c2Filled = this.isCellFilled(cluster.topRow + 1, cluster.leftCol + 2);
    const r2c1Filled = this.isCellFilled(cluster.topRow + 2, cluster.leftCol + 1);
    const r2c2Filled = this.isCellFilled(cluster.topRow + 2, cluster.leftCol + 2);

    // Count filled cells in second row and second column for orientation detection
    const r2FilledCount = this.countFilledCellsInRow(cluster, cluster.topRow + 2);
    const c2FilledCount = this.countFilledCellsInColumn(cluster, cluster.leftCol + 2);

    // Look for marker cell (yellow highlighted cell from slides)
    const markerCell = this.findMarkerCell(cluster);

    return {
      totalCells,
      filledCells,
      unfilledCellCount,
      allCellsFilled,
      r1c1Filled,
      r1c2Filled,
      r2c1Filled,
      r2c2Filled,
      r2FilledCount,
      c2FilledCount,
      markerCell
    };
  }

  /**
   * Detect orientation for key-value constructs
   */
  private detectKeyValueOrientation(cluster: CellCluster, analysis: CellPatternAnalysis): "regular" | "transposed" {
    // If marker cell is present, use it to determine orientation
    if (analysis.markerCell) {
      // Marker cell indicates the orientation (implementation depends on marker logic)
      return "regular"; // Default to regular for now
    }

    // Compare filled cells in second row vs second column
    if (analysis.c2FilledCount > analysis.r2FilledCount) {
      return "regular"; // Vertical key-values
    } else if (analysis.r2FilledCount > analysis.c2FilledCount) {
      return "transposed"; // Horizontal key-values
    } else {
      return "regular"; // Default to regular when equal
    }
  }

  /**
   * Detect orientation for tree constructs
   */
  private detectTreeOrientation(analysis: CellPatternAnalysis): "regular" | "transposed" {
    // Regular tree: R1C1 and R2C1 filled, but R1C2 empty
    if (analysis.r1c1Filled && analysis.r2c1Filled && !analysis.r1c2Filled) {
      return "regular";
    }
    
    // Transposed tree: R1C1 and R1C2 filled, but R2C1 empty
    if (analysis.r1c1Filled && analysis.r1c2Filled && !analysis.r2c1Filled) {
      return "transposed";
    }

    // Default to regular for ambiguous cases
    return "regular";
  }

  /**
   * Check if a cell is filled (has content)
   */
  private isCellFilled(row: number, col: number): boolean {
    const content = this.grid.getCellRaw(row, col);
    return content && content.trim().length > 0;
  }

  /**
   * Count filled cells in a specific row within the cluster bounds
   */
  private countFilledCellsInRow(cluster: CellCluster, row: number): number {
    let count = 0;
    for (let col = cluster.leftCol + 1; col <= cluster.rightCol + 1; col++) {
      if (this.isCellFilled(row, col)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Count filled cells in a specific column within the cluster bounds
   */
  private countFilledCellsInColumn(cluster: CellCluster, col: number): number {
    let count = 0;
    for (let row = cluster.topRow + 1; row <= cluster.bottomRow + 1; row++) {
      if (this.isCellFilled(row, col)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Check if there are values in columns beyond the key column
   * This helps distinguish key-value pairs from trees
   */
  private hasValuesInOtherColumns(cluster: CellCluster): boolean {
    // Check if there are filled cells in columns beyond the first two
    for (let col = cluster.leftCol + 3; col <= cluster.rightCol + 1; col++) {
      for (let row = cluster.topRow + 1; row <= cluster.bottomRow + 1; row++) {
        if (this.isCellFilled(row, col)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Find marker cell (for key-value orientation detection)
   * This would typically look for specially formatted cells
   */
  private findMarkerCell(cluster: CellCluster): { row: number; col: number; content: string } | undefined {
    // For now, return undefined - marker cell detection can be added later
    // based on cell formatting or special content patterns
    return undefined;
  }
}

/**
 * Internal interface for cell pattern analysis
 */
interface CellPatternAnalysis {
  totalCells: number;
  filledCells: number;
  unfilledCellCount: number;
  allCellsFilled: boolean;
  r1c1Filled: boolean;
  r1c2Filled: boolean;
  r2c1Filled: boolean;
  r2c2Filled: boolean;
  r2FilledCount: number;
  c2FilledCount: number;
  markerCell?: { row: number; col: number; content: string };
}