import { BaseConstruct } from "../../interfaces/ConstructInterfaces";

/**
 * Core Matrix construct based on Cell Cluster Key system
 * Matrices have empty top-left corner (R1C1) and dual headers
 */

export type MatrixCellType = "primary-header" | "secondary-header" | "body" | "empty-corner";
export type MatrixEntityType = "primary" | "secondary";

export interface MatrixCell {
  position: { row: number; col: number };
  content: string;
  cellType: MatrixCellType;
}

export interface MatrixEntity {
  type: MatrixEntityType;
  index: number;
  headerCell: MatrixCell;
  bodyCells: MatrixCell[];
}

export class CoreMatrix implements BaseConstruct {
  id: string;
  type: string = "matrix";
  confidence: number;
  signatureImprint: string;
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  metadata: Record<string, any>;

  // Matrix-specific properties
  cells: MatrixCell[];
  emptyCornerCell: MatrixCell;
  primaryHeaders: MatrixCell[]; // First row headers (columns)
  secondaryHeaders: MatrixCell[]; // First column headers (rows)
  bodyCells: MatrixCell[];
  primaryEntities: MatrixEntity[]; // Column entities
  secondaryEntities: MatrixEntity[]; // Row entities

  constructor(
    id: string,
    confidence: number,
    signatureImprint: string,
    bounds: { topRow: number; bottomRow: number; leftCol: number; rightCol: number }
  ) {
    this.id = id;
    this.confidence = confidence;
    this.signatureImprint = signatureImprint;
    this.bounds = bounds;
    this.cells = [];
    this.primaryHeaders = [];
    this.secondaryHeaders = [];
    this.bodyCells = [];
    this.primaryEntities = [];
    this.secondaryEntities = [];
    this.metadata = {};

    // Create the characteristic empty corner cell
    this.emptyCornerCell = {
      position: { row: bounds.topRow, col: bounds.leftCol },
      content: "",
      cellType: "empty-corner"
    };
  }

  /**
   * Add a cell to the matrix
   */
  addCell(cell: MatrixCell): void {
    this.cells.push(cell);
    
    switch (cell.cellType) {
      case "primary-header":
        this.primaryHeaders.push(cell);
        break;
      case "secondary-header":
        this.secondaryHeaders.push(cell);
        break;
      case "body":
        this.bodyCells.push(cell);
        break;
    }
  }

  /**
   * Organize cells into primary and secondary entities
   */
  organizeEntities(): void {
    // Create primary entities (columns) - each column is an entity
    for (let colIndex = 1; colIndex < (this.bounds.rightCol - this.bounds.leftCol + 1); colIndex++) {
      const col = this.bounds.leftCol + colIndex;
      
      const headerCell = this.primaryHeaders.find(
        cell => cell.position.col === col
      );
      
      const columnBodyCells = this.bodyCells.filter(
        cell => cell.position.col === col
      );
      
      if (headerCell) {
        const entity: MatrixEntity = {
          type: "primary",
          index: colIndex - 1,
          headerCell,
          bodyCells: columnBodyCells
        };
        
        this.primaryEntities.push(entity);
      }
    }

    // Create secondary entities (rows) - each row is an entity
    for (let rowIndex = 1; rowIndex < (this.bounds.bottomRow - this.bounds.topRow + 1); rowIndex++) {
      const row = this.bounds.topRow + rowIndex;
      
      const headerCell = this.secondaryHeaders.find(
        cell => cell.position.row === row
      );
      
      const rowBodyCells = this.bodyCells.filter(
        cell => cell.position.row === row
      );
      
      if (headerCell) {
        const entity: MatrixEntity = {
          type: "secondary",
          index: rowIndex - 1,
          headerCell,
          bodyCells: rowBodyCells
        };
        
        this.secondaryEntities.push(entity);
      }
    }
  }

  /**
   * Get cell at specific position
   */
  getCellAt(row: number, col: number): MatrixCell | null {
    // Check for empty corner first
    if (row === this.bounds.topRow && col === this.bounds.leftCol) {
      return this.emptyCornerCell;
    }
    
    return this.cells.find(
      cell => cell.position.row === row && cell.position.col === col
    ) || null;
  }

  /**
   * Get the intersection cell for given primary and secondary entities
   */
  getIntersectionCell(primaryIndex: number, secondaryIndex: number): MatrixCell | null {
    const row = this.bounds.topRow + secondaryIndex + 1;
    const col = this.bounds.leftCol + primaryIndex + 1;
    
    return this.getCellAt(row, col);
  }

  /**
   * Get all cells in a primary entity (column)
   */
  getPrimaryEntityCells(primaryIndex: number): MatrixCell[] {
    const col = this.bounds.leftCol + primaryIndex + 1;
    return this.cells.filter(cell => cell.position.col === col);
  }

  /**
   * Get all cells in a secondary entity (row)
   */
  getSecondaryEntityCells(secondaryIndex: number): MatrixCell[] {
    const row = this.bounds.topRow + secondaryIndex + 1;
    return this.cells.filter(cell => cell.position.row === row);
  }

  /**
   * Get matrix dimensions (excluding headers)
   */
  getDataDimensions(): { primaryCount: number; secondaryCount: number } {
    return {
      primaryCount: this.primaryEntities.length,
      secondaryCount: this.secondaryEntities.length
    };
  }

  /**
   * Check if the matrix is square (same number of primary and secondary entities)
   */
  isSquareMatrix(): boolean {
    return this.primaryEntities.length === this.secondaryEntities.length;
  }

  /**
   * Create a matrix cell
   */
  static createCell(
    position: { row: number; col: number },
    content: string,
    cellType: MatrixCellType = "body"
  ): MatrixCell {
    return {
      position,
      content,
      cellType
    };
  }
}