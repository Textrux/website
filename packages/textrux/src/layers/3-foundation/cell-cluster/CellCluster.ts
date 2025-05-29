import { CellFormat } from "../../../style/CellFormat";
import { CellClusterTraits } from "./CellClusterTraits";
import CellSubcluster from "../cell-subcluster/CellSubcluster";

export default class CellCluster {
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;

  filledPoints: Array<{ row: number; col: number }>;

  /** Array of subclusters (connected components) within this cell cluster */
  subclusters: CellSubcluster[];

  /** Formatting for empty cells within the cluster */
  clusterEmptyFormat: CellFormat;

  /** Traits for this cell cluster */
  traits: CellClusterTraits;

  constructor(
    topRow: number,
    bottomRow: number,
    leftCol: number,
    rightCol: number,
    filledPoints: Array<{ row: number; col: number }>
  ) {
    this.topRow = topRow;
    this.bottomRow = bottomRow;
    this.leftCol = leftCol;
    this.rightCol = rightCol;
    this.filledPoints = filledPoints;

    // Initialize subclusters array - will be populated later
    this.subclusters = [];

    // Initialize with default format
    this.clusterEmptyFormat = CellFormat.fromCssClass("cluster-empty-cell");

    // Initialize traits with placeholder values - will be populated later
    this.traits = this.initializeTraits();
  }

  private initializeTraits(): CellClusterTraits {
    // TODO: Implement trait analysis and population
    // For now, return a basic structure with default values
    return {
      base: {} as any,
      composite: {} as any,
      derived: {} as any,
    };
  }

  /**
   * Set custom formatting for this cluster's empty cells
   */
  setCustomFormatting(clusterEmptyFormat?: CellFormat) {
    if (clusterEmptyFormat) this.clusterEmptyFormat = clusterEmptyFormat;
  }

  /**
   * Populate subclusters by finding connected components within this cell cluster
   */
  populateSubclusters(): void {
    this.subclusters = this.findConnectedComponents();

    // Set parent cluster reference for each subcluster
    for (const subcluster of this.subclusters) {
      subcluster.parentCluster = this;
    }
  }

  /**
   * Find connected components (subclusters) using a flood-fill algorithm
   */
  private findConnectedComponents(): CellSubcluster[] {
    if (this.filledPoints.length === 0) {
      return [];
    }

    const visited = new Set<string>();
    const subclusters: CellSubcluster[] = [];

    for (const point of this.filledPoints) {
      const key = `${point.row},${point.col}`;
      if (!visited.has(key)) {
        // Start a new connected component
        const component = this.floodFill(point, visited);
        if (component.length > 0) {
          subclusters.push(new CellSubcluster(component));
        }
      }
    }

    return subclusters;
  }

  /**
   * Flood-fill algorithm to find all connected cells starting from a given point
   */
  private floodFill(
    startPoint: { row: number; col: number },
    visited: Set<string>
  ): Array<{ row: number; col: number }> {
    const component: Array<{ row: number; col: number }> = [];
    const stack = [startPoint];
    const filledSet = new Set(
      this.filledPoints.map((p) => `${p.row},${p.col}`)
    );

    while (stack.length > 0) {
      const current = stack.pop()!;
      const key = `${current.row},${current.col}`;

      if (visited.has(key) || !filledSet.has(key)) {
        continue;
      }

      visited.add(key);
      component.push(current);

      // Add neighbors (4-way connectivity: up, down, left, right)
      const neighbors = [
        { row: current.row - 1, col: current.col }, // up
        { row: current.row + 1, col: current.col }, // down
        { row: current.row, col: current.col - 1 }, // left
        { row: current.row, col: current.col + 1 }, // right
      ];

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        if (!visited.has(neighborKey) && filledSet.has(neighborKey)) {
          stack.push(neighbor);
        }
      }
    }

    return component;
  }
}
