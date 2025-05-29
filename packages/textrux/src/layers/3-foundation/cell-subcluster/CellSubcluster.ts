/**
 * CellSubcluster represents a connected component of filled cells within a CellCluster.
 * Unlike CellClusters which are rectangular regions, CellSubclusters are arbitrary shapes
 * where all filled cells are contiguous (horizontally or vertically adjacent to at least
 * one other filled cell in the subcluster).
 */

import { CellSubclusterTraits } from "./CellSubclusterTraits";

export default class CellSubcluster {
  /** Array of filled cell positions that form this connected component */
  public filledPoints: Array<{ row: number; col: number }>;

  /** Bounding box coordinates */
  public topRow: number;
  public bottomRow: number;
  public leftCol: number;
  public rightCol: number;

  /** Number of filled cells in this subcluster */
  public cellCount: number;

  /** Traits for this cell subcluster */
  public traits: CellSubclusterTraits;

  /** Reference to the parent CellCluster that contains this subcluster */
  public parentCluster?: any; // Will be CellCluster, but avoiding circular import

  constructor(filledPoints: Array<{ row: number; col: number }>) {
    if (filledPoints.length === 0) {
      throw new Error("CellSubcluster cannot be empty");
    }

    this.filledPoints = [...filledPoints];
    this.cellCount = filledPoints.length;

    // Calculate bounding box
    const rows = filledPoints.map((p) => p.row);
    const cols = filledPoints.map((p) => p.col);

    this.topRow = Math.min(...rows);
    this.bottomRow = Math.max(...rows);
    this.leftCol = Math.min(...cols);
    this.rightCol = Math.max(...cols);

    // Initialize traits with placeholder values - will be populated later
    this.traits = this.initializeTraits();
  }

  private initializeTraits(): CellSubclusterTraits {
    // TODO: Implement trait analysis and population
    // For now, return a basic structure with default values
    return {
      base: {} as any,
      composite: {} as any,
      derived: {} as any,
    };
  }

  /** Width of the bounding box */
  get width(): number {
    return this.rightCol - this.leftCol + 1;
  }

  /** Height of the bounding box */
  get height(): number {
    return this.bottomRow - this.topRow + 1;
  }

  /** Area of the bounding box */
  get boundingArea(): number {
    return this.width * this.height;
  }

  /** Density: ratio of filled cells to bounding box area */
  get density(): number {
    return this.cellCount / this.boundingArea;
  }

  /** Check if this is a single isolated cell */
  get isSingleCell(): boolean {
    return this.cellCount === 1;
  }

  /** Check if this subcluster forms a linear shape (horizontal or vertical line) */
  get isLinear(): boolean {
    return this.width === 1 || this.height === 1;
  }

  /** Check if this subcluster is rectangular (fills its entire bounding box) */
  get isRectangular(): boolean {
    return this.cellCount === this.boundingArea;
  }

  /** Get the shape classification of this subcluster */
  get shapeType():
    | "single"
    | "linear-horizontal"
    | "linear-vertical"
    | "rectangular"
    | "irregular" {
    if (this.isSingleCell) return "single";
    if (this.height === 1) return "linear-horizontal";
    if (this.width === 1) return "linear-vertical";
    if (this.isRectangular) return "rectangular";
    return "irregular";
  }

  /**
   * Check if a given cell position is part of this subcluster
   */
  containsCell(row: number, col: number): boolean {
    return this.filledPoints.some((p) => p.row === row && p.col === col);
  }

  /**
   * Get adjacent cells (horizontally and vertically) to this subcluster
   */
  getAdjacentPositions(): Array<{ row: number; col: number }> {
    const adjacent: Array<{ row: number; col: number }> = [];
    const subclusterSet = new Set(
      this.filledPoints.map((p) => `${p.row},${p.col}`)
    );

    for (const point of this.filledPoints) {
      // Check all 4 directions
      const neighbors = [
        { row: point.row - 1, col: point.col }, // up
        { row: point.row + 1, col: point.col }, // down
        { row: point.row, col: point.col - 1 }, // left
        { row: point.row, col: point.col + 1 }, // right
      ];

      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`;
        if (!subclusterSet.has(key)) {
          // This neighbor is not part of the subcluster
          if (
            !adjacent.some(
              (p) => p.row === neighbor.row && p.col === neighbor.col
            )
          ) {
            adjacent.push(neighbor);
          }
        }
      }
    }

    return adjacent;
  }

  /**
   * Calculate the perimeter (number of edge cells) of this subcluster
   */
  getPerimeter(): number {
    const subclusterSet = new Set(
      this.filledPoints.map((p) => `${p.row},${p.col}`)
    );
    let perimeterCells = 0;

    for (const point of this.filledPoints) {
      // Check if this cell has at least one neighbor that's not in the subcluster
      const neighbors = [
        { row: point.row - 1, col: point.col },
        { row: point.row + 1, col: point.col },
        { row: point.row, col: point.col - 1 },
        { row: point.row, col: point.col + 1 },
      ];

      const hasExternalNeighbor = neighbors.some((neighbor) => {
        const key = `${neighbor.row},${neighbor.col}`;
        return !subclusterSet.has(key);
      });

      if (hasExternalNeighbor) {
        perimeterCells++;
      }
    }

    return perimeterCells;
  }

  /**
   * Get a string representation of this subcluster
   */
  toString(): string {
    return `CellSubcluster(${this.cellCount} cells, R${this.topRow}-${this.bottomRow}C${this.leftCol}-${this.rightCol}, ${this.shapeType})`;
  }
}
