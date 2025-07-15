import { BaseConstruct } from "../../interfaces/ConstructInterfaces";

/**
 * Core Table construct based on Cell Cluster Key system
 * Tables have all cells filled and contain headers + body cells
 */

export type TableCellType = "header" | "body";
export type TableElementType = "entity" | "attribute";

export interface TableCell {
  position: { row: number; col: number };
  content: string;
  cellType: TableCellType;
}

export interface TableEntity {
  type: TableElementType;
  index: number; // Row index for entities, column index for attributes
  headerCell?: TableCell;
  bodyCells: TableCell[];
}

export class CoreTable implements BaseConstruct {
  id: string;
  type: string = "table";
  confidence: number;
  signatureImprint: string;
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  metadata: Record<string, any>;

  // Table-specific properties
  cells: TableCell[];
  headerCells: TableCell[];
  bodyCells: TableCell[];
  entities: TableEntity[]; // Rows (or columns if transposed)
  attributes: TableEntity[]; // Columns (or rows if transposed)
  hasHeaders: boolean;

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
    this.headerCells = [];
    this.bodyCells = [];
    this.entities = [];
    this.attributes = [];
    this.hasHeaders = false;
    this.metadata = {};
  }

  /**
   * Add a cell to the table
   */
  addCell(cell: TableCell): void {
    this.cells.push(cell);
    
    if (cell.cellType === "header") {
      this.headerCells.push(cell);
      this.hasHeaders = true;
    } else {
      this.bodyCells.push(cell);
    }
  }

  /**
   * Organize cells into entities (rows) and attributes (columns)
   */
  organizeEntitiesAndAttributes(): void {
    const rowCount = this.bounds.bottomRow - this.bounds.topRow + 1;
    const colCount = this.bounds.rightCol - this.bounds.leftCol + 1;

    // Create entities (rows)
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowCells = this.cells.filter(
        cell => cell.position.row === this.bounds.topRow + rowIndex
      );
      
      const entity: TableEntity = {
        type: "entity",
        index: rowIndex,
        headerCell: rowCells.find(cell => cell.cellType === "header"),
        bodyCells: rowCells.filter(cell => cell.cellType === "body")
      };
      
      this.entities.push(entity);
    }

    // Create attributes (columns)
    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      const colCells = this.cells.filter(
        cell => cell.position.col === this.bounds.leftCol + colIndex
      );
      
      const attribute: TableEntity = {
        type: "attribute",
        index: colIndex,
        headerCell: colCells.find(cell => cell.cellType === "header"),
        bodyCells: colCells.filter(cell => cell.cellType === "body")
      };
      
      this.attributes.push(attribute);
    }
  }

  /**
   * Get cell at specific position
   */
  getCellAt(row: number, col: number): TableCell | null {
    return this.cells.find(
      cell => cell.position.row === row && cell.position.col === col
    ) || null;
  }

  /**
   * Get all cells in a specific row
   */
  getRowCells(rowIndex: number): TableCell[] {
    const row = this.bounds.topRow + rowIndex;
    return this.cells.filter(cell => cell.position.row === row);
  }

  /**
   * Get all cells in a specific column
   */
  getColumnCells(colIndex: number): TableCell[] {
    const col = this.bounds.leftCol + colIndex;
    return this.cells.filter(cell => cell.position.col === col);
  }

  /**
   * Get table dimensions
   */
  getDimensions(): { rows: number; cols: number } {
    return {
      rows: this.bounds.bottomRow - this.bounds.topRow + 1,
      cols: this.bounds.rightCol - this.bounds.leftCol + 1
    };
  }

  /**
   * Check if the table has header row
   */
  hasHeaderRow(): boolean {
    return this.headerCells.some(cell => cell.position.row === this.bounds.topRow);
  }

  /**
   * Check if the table has header column
   */
  hasHeaderColumn(): boolean {
    return this.headerCells.some(cell => cell.position.col === this.bounds.leftCol);
  }

  /**
   * Create a table cell
   */
  static createCell(
    position: { row: number; col: number },
    content: string,
    cellType: TableCellType = "body"
  ): TableCell {
    return {
      position,
      content,
      cellType
    };
  }
}