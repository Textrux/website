import { BaseConstruct, BaseElement } from "../interfaces/ConstructInterfaces";

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
  keyPattern: string;
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
  entities: TableEntity[]; // Data rows only (excluding header row)
  attributes: TableEntity[]; // Columns with headers and data cells

  constructor(
    id: string,
    keyPattern: string,
    bounds: { topRow: number; bottomRow: number; leftCol: number; rightCol: number }
  ) {
    this.id = id;
    this.keyPattern = keyPattern;
    this.bounds = bounds;
    this.cells = [];
    this.headerCells = [];
    this.bodyCells = [];
    this.entities = [];
    this.attributes = [];
    this.metadata = {};
  }

  /**
   * Add a cell to the table
   */
  addCell(cell: TableCell): void {
    this.cells.push(cell);
    
    if (cell.cellType === "header") {
      this.headerCells.push(cell);
    } else {
      this.bodyCells.push(cell);
    }
  }

  /**
   * Organize cells into entities (data rows) and attributes (columns)
   */
  organizeEntitiesAndAttributes(): void {
    const rowCount = this.bounds.bottomRow - this.bounds.topRow + 1;
    const colCount = this.bounds.rightCol - this.bounds.leftCol + 1;

    // Create entities - only for data rows (excluding header row)
    // Start from row 1 to skip the header row
    for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
      const currentRow = this.bounds.topRow + rowIndex;
      
      // Get all cells in this row, sorted by column position
      const rowCells = this.cells
        .filter(cell => cell.position.row === currentRow)
        .sort((a, b) => a.position.col - b.position.col);
      
      const entity: TableEntity = {
        type: "entity",
        index: rowIndex - 1, // 0-indexed for data rows only
        headerCell: undefined, // Data rows don't have header cells
        bodyCells: rowCells // All cells in this data row
      };
      
      this.entities.push(entity);
    }

    // Create attributes (columns) - include headers and corresponding body cells
    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      const currentCol = this.bounds.leftCol + colIndex;
      
      const colCells = this.cells.filter(
        cell => cell.position.col === currentCol
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
   * Get cells by type (header or body)
   */
  getCellsByType(cellType: TableCellType): TableCell[] {
    return this.cells.filter(cell => cell.cellType === cellType);
  }

  /**
   * Get all header cells in a specific row
   */
  getRowHeaderCells(rowIndex: number): TableCell[] {
    return this.getRowCells(rowIndex).filter(cell => cell.cellType === "header");
  }

  /**
   * Get all header cells in a specific column
   */
  getColumnHeaderCells(colIndex: number): TableCell[] {
    return this.getColumnCells(colIndex).filter(cell => cell.cellType === "header");
  }

  /**
   * Get all body cells in a specific row
   */
  getRowBodyCells(rowIndex: number): TableCell[] {
    return this.getRowCells(rowIndex).filter(cell => cell.cellType === "body");
  }

  /**
   * Get all body cells in a specific column
   */
  getColumnBodyCells(colIndex: number): TableCell[] {
    return this.getColumnCells(colIndex).filter(cell => cell.cellType === "body");
  }

  /**
   * Get entity (row) by index
   */
  getEntity(index: number): TableEntity | null {
    return this.entities[index] || null;
  }

  /**
   * Get attribute (column) by index
   */
  getAttribute(index: number): TableEntity | null {
    return this.attributes[index] || null;
  }

  /**
   * Find entity index by row position
   */
  findEntityByRow(row: number): TableEntity | null {
    const rowIndex = row - this.bounds.topRow;
    return this.getEntity(rowIndex);
  }

  /**
   * Find attribute index by column position
   */
  findAttributeByColumn(col: number): TableEntity | null {
    const colIndex = col - this.bounds.leftCol;
    return this.getAttribute(colIndex);
  }

  /**
   * Get cell content at position (convenience method)
   */
  getCellContent(row: number, col: number): string {
    const cell = this.getCellAt(row, col);
    return cell ? cell.content : "";
  }

  /**
   * Get header content for a specific column
   */
  getColumnHeader(colIndex: number): string {
    const headerCells = this.getColumnHeaderCells(colIndex);
    return headerCells.length > 0 ? headerCells[0].content : "";
  }

  /**
   * Get header content for a specific row
   */
  getRowHeader(rowIndex: number): string {
    const headerCells = this.getRowHeaderCells(rowIndex);
    return headerCells.length > 0 ? headerCells[0].content : "";
  }

  /**
   * Get all cell positions
   */
  getAllPositions(): Array<{ row: number; col: number }> {
    return this.cells.map(cell => cell.position);
  }

  /**
   * Check if position is within table bounds
   */
  containsPosition(row: number, col: number): boolean {
    return row >= this.bounds.topRow &&
           row <= this.bounds.bottomRow &&
           col >= this.bounds.leftCol &&
           col <= this.bounds.rightCol;
  }

  /**
   * Get elements for console navigation (BaseConstruct interface)
   */
  get baseElements(): BaseElement[] {
    return this.cells as BaseElement[];
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