import GridModel from "../../1-substrate/GridModel";
import CellCluster from "../../3-foundation/cell-cluster/CellCluster";
import { CoreConstructParser } from "../CoreConstructParser";
import { BaseConstruct } from "../interfaces/ConstructInterfaces";

/**
 * Central registry for Core construct parsing using Cell Cluster Key system
 * Replaces complex signature parser system with elegant binary key detection
 */
export class ConstructRegistry {
  private coreParser?: CoreConstructParser;
  private grid?: GridModel;

  constructor(grid?: GridModel) {
    this.grid = grid;
    if (grid) {
      this.coreParser = new CoreConstructParser(grid);
    }
  }

  /**
   * Set the grid model and initialize the core parser
   */
  setGrid(grid: GridModel): void {
    this.grid = grid;
    this.coreParser = new CoreConstructParser(grid);
  }

  /**
   * Parse a cell cluster using the Core construct system
   * Returns the detected and constructed BaseConstruct or null
   */
  parseConstruct(cluster: CellCluster): BaseConstruct | null {
    if (!this.coreParser) {
      console.warn("ConstructRegistry: No grid set, cannot parse constructs");
      return null;
    }

    return this.coreParser.parseConstruct(cluster);
  }

  /**
   * Parse all cell clusters in the current grid
   * Returns array of all detected constructs
   * Note: This method requires grid to be parsed first with parseAndFormatGrid()
   */
  parseAllConstructs(): BaseConstruct[] {
    if (!this.grid || !this.coreParser) {
      console.warn("ConstructRegistry: No grid set, cannot parse constructs");
      return [];
    }

    const constructs: BaseConstruct[] = [];
    
    // TODO: Implement getAllCellClusters() on GridModel or get clusters from blocks
    // For now, this method requires clusters to be parsed individually
    console.warn("ConstructRegistry.parseAllConstructs(): Not yet implemented - use parseConstruct() on individual clusters");
    
    return constructs;
  }

  /**
   * Get the core parser instance
   */
  getCoreParser(): CoreConstructParser | undefined {
    return this.coreParser;
  }

  /**
   * Check if the registry is ready for parsing
   */
  isReady(): boolean {
    return !!(this.grid && this.coreParser);
  }

  /**
   * Get supported construct types
   */
  getSupportedConstructTypes(): string[] {
    return ["table", "matrix", "key-value", "tree", "list"];
  }

  /**
   * Parse specific construct type from cluster (for testing/debugging)
   */
  parseSpecificType(cluster: CellCluster, expectedType: string): BaseConstruct | null {
    const construct = this.parseConstruct(cluster);
    
    if (construct && construct.type === expectedType) {
      return construct;
    }
    
    return null;
  }
}

/**
 * Default global construct registry instance
 */
export const defaultConstructRegistry = new ConstructRegistry();