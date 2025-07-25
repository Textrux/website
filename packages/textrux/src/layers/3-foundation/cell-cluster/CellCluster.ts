import { CellFormat } from "../../../style/CellFormat";
import CellSubcluster from "../cell-subcluster/CellSubcluster";
import { BaseConstruct } from "../../4-constructs/interfaces/ConstructInterfaces";
import { CoreDetectionRules, DetectionResult } from "./CoreDetectionRules";
import { CoreConstructParser } from "../../4-constructs/CoreConstructParser";
import GridModel from "../../1-substrate/GridModel";

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

  /** Legacy traits removed - replaced by Cell Cluster Key system */

  /** Core detection result using binary key matching */
  detectionResult?: DetectionResult;

  /** Identified constructs within this cell cluster */
  constructs: BaseConstruct[];

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

    this.constructs = [];
  }

  // Legacy initializeTraits method removed - replaced by Cell Cluster Key system

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

      // Add neighbors (8-way connectivity: up, down, left, right, and diagonals)
      const neighbors = [
        { row: current.row - 1, col: current.col }, // up
        { row: current.row + 1, col: current.col }, // down
        { row: current.row, col: current.col - 1 }, // left
        { row: current.row, col: current.col + 1 }, // right
        { row: current.row - 1, col: current.col - 1 }, // up-left (NW)
        { row: current.row - 1, col: current.col + 1 }, // up-right (NE)
        { row: current.row + 1, col: current.col - 1 }, // down-left (SW)
        { row: current.row + 1, col: current.col + 1 }, // down-right (SE)
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

  /**
   * Add a construct to this cell cluster
   */
  addConstruct(construct: BaseConstruct): void {
    this.constructs.push(construct);
  }

  /**
   * Get all constructs of a specific type
   */
  getConstructsByType(type: string): BaseConstruct[] {
    return this.constructs.filter((construct) => construct.type === type);
  }

  /**
   * Get the first construct of a specific type (since binary key system provides certainty)
   */
  getBestConstruct(type: string): BaseConstruct | null {
    const constructs = this.getConstructsByType(type);
    return constructs.length > 0 ? constructs[0] : null;
  }

  /**
   * Check if cluster contains any constructs of a specific type
   */
  hasConstructType(type: string): boolean {
    return this.constructs.some((construct) => construct.type === type);
  }

  /**
   * Get all construct types found in this cluster
   */
  getConstructTypes(): string[] {
    return [...new Set(this.constructs.map((construct) => construct.type))];
  }

  /**
   * Clear all constructs
   */
  clearConstructs(): void {
    this.constructs = [];
  }

  /**
   * Detect construct type using Cell Cluster Key system
   * Replaces complex trait-based system with elegant binary key detection
   */
  detectConstructType(grid: GridModel): DetectionResult | null {
    const detector = new CoreDetectionRules(grid);
    this.detectionResult = detector.detectConstruct(this);
    return this.detectionResult;
  }

  /**
   * Get the detected construct type
   */
  getConstructType(): string | null {
    return this.detectionResult?.constructType || null;
  }

  /**
   * Get the detected orientation (for trees and key-values)
   */
  getOrientation(): string | null {
    return this.detectionResult?.orientation || null;
  }

  /**
   * Get detection key
   */
  getDetectionKey(): number | string | null {
    return this.detectionResult?.key || null;
  }

  /**
   * Create the actual construct instance using binary key-based construction
   */
  createConstruct(grid: GridModel): BaseConstruct | null {
    // First detect the construct type
    this.detectConstructType(grid);
    
    if (!this.detectionResult) {
      return null;
    }

    // Use the core parser to create the construct
    const parser = new CoreConstructParser(grid);
    const construct = parser.parseConstruct(this);
    
    if (construct) {
      this.addConstruct(construct);
    }
    
    return construct;
  }

  /**
   * Parse and create construct in one step
   */
  parseToConstruct(grid: GridModel): BaseConstruct | null {
    return this.createConstruct(grid);
  }

  /**
   * Get the primary construct (since binary key system provides certainty)
   */
  getPrimaryConstruct(): BaseConstruct | null {
    return this.constructs.length > 0 ? this.constructs[0] : null;
  }

  /**
   * Check if this cluster represents a tree structure
   */
  isTree(): boolean {
    return this.detectionResult?.constructType === "tree";
  }

  /**
   * Check if this cluster represents a table structure
   */
  isTable(): boolean {
    return this.detectionResult?.constructType === "table";
  }

  /**
   * Check if this cluster represents a matrix structure
   */
  isMatrix(): boolean {
    return this.detectionResult?.constructType === "matrix";
  }

  /**
   * Check if this cluster represents key-value pairs
   */
  isKeyValue(): boolean {
    return this.detectionResult?.constructType === "key-value";
  }

  /**
   * Check if this cluster is a regular (non-transposed) construct
   */
  isRegular(): boolean {
    return this.detectionResult?.orientation === "regular" || this.detectionResult?.orientation === undefined;
  }

  /**
   * Check if this cluster is a transposed construct
   */
  isTransposed(): boolean {
    return this.detectionResult?.orientation === "transposed";
  }
}
