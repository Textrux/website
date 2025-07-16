import { BaseConstruct } from "../interfaces/ConstructInterfaces";

/**
 * Core Matrix construct based on Cell Cluster Key system
 * Matrices have empty top-left corner (R1C1) and dual headers
 */

export type MatrixCellType =
  | "primary-header"
  | "secondary-header"
  | "body"
  | "empty-corner";
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
  keyPattern: string;
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
    keyPattern: string,
    bounds: {
      topRow: number;
      bottomRow: number;
      leftCol: number;
      rightCol: number;
    }
  ) {
    this.id = id;
    this.keyPattern = keyPattern;
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
      cellType: "empty-corner",
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
    for (
      let colIndex = 1;
      colIndex < this.bounds.rightCol - this.bounds.leftCol + 1;
      colIndex++
    ) {
      const col = this.bounds.leftCol + colIndex;

      const headerCell = this.primaryHeaders.find(
        (cell) => cell.position.col === col
      );

      const columnBodyCells = this.bodyCells.filter(
        (cell) => cell.position.col === col
      );

      if (headerCell) {
        const entity: MatrixEntity = {
          type: "primary",
          index: colIndex, // Keep 1-indexed
          headerCell,
          bodyCells: columnBodyCells,
        };

        this.primaryEntities.push(entity);
      }
    }

    // Create secondary entities (rows) - each row is an entity
    for (
      let rowIndex = 1;
      rowIndex < this.bounds.bottomRow - this.bounds.topRow + 1;
      rowIndex++
    ) {
      const row = this.bounds.topRow + rowIndex;

      const headerCell = this.secondaryHeaders.find(
        (cell) => cell.position.row === row
      );

      const rowBodyCells = this.bodyCells.filter(
        (cell) => cell.position.row === row
      );

      if (headerCell) {
        const entity: MatrixEntity = {
          type: "secondary",
          index: rowIndex, // Keep 1-indexed
          headerCell,
          bodyCells: rowBodyCells,
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

    return (
      this.cells.find(
        (cell) => cell.position.row === row && cell.position.col === col
      ) || null
    );
  }

  /**
   * Get the intersection cell for given primary and secondary entities
   */
  getIntersectionCell(
    primaryIndex: number,
    secondaryIndex: number
  ): MatrixCell | null {
    const row = this.bounds.topRow + secondaryIndex + 1;
    const col = this.bounds.leftCol + primaryIndex + 1;

    return this.getCellAt(row, col);
  }

  /**
   * Get all cells in a primary entity (column)
   */
  getPrimaryEntityCells(primaryIndex: number): MatrixCell[] {
    const col = this.bounds.leftCol + primaryIndex + 1;
    return this.cells.filter((cell) => cell.position.col === col);
  }

  /**
   * Get all cells in a secondary entity (row)
   */
  getSecondaryEntityCells(secondaryIndex: number): MatrixCell[] {
    const row = this.bounds.topRow + secondaryIndex + 1;
    return this.cells.filter((cell) => cell.position.row === row);
  }

  /**
   * Get matrix dimensions (excluding headers)
   */
  getDataDimensions(): { primaryCount: number; secondaryCount: number } {
    return {
      primaryCount: this.primaryEntities.length,
      secondaryCount: this.secondaryEntities.length,
    };
  }

  /**
   * Check if the matrix is square (same number of primary and secondary entities)
   */
  isSquareMatrix(): boolean {
    return this.primaryEntities.length === this.secondaryEntities.length;
  }

  /**
   * Get cells by type
   */
  getCellsByType(cellType: MatrixCellType): MatrixCell[] {
    return this.cells.filter(cell => cell.cellType === cellType);
  }

  /**
   * Get primary header content by index
   */
  getPrimaryHeaderContent(index: number): string {
    const col = this.bounds.leftCol + index + 1;
    const headerCell = this.primaryHeaders.find(cell => cell.position.col === col);
    return headerCell ? headerCell.content : "";
  }

  /**
   * Get secondary header content by index
   */
  getSecondaryHeaderContent(index: number): string {
    const row = this.bounds.topRow + index + 1;
    const headerCell = this.secondaryHeaders.find(cell => cell.position.row === row);
    return headerCell ? headerCell.content : "";
  }

  /**
   * Get cell content at position (convenience method)
   */
  getCellContent(row: number, col: number): string {
    const cell = this.getCellAt(row, col);
    return cell ? cell.content : "";
  }

  /**
   * Get intersection content for given indices
   */
  getIntersectionContent(primaryIndex: number, secondaryIndex: number): string {
    const cell = this.getIntersectionCell(primaryIndex, secondaryIndex);
    return cell ? cell.content : "";
  }

  /**
   * Get all positions in the matrix
   */
  getAllPositions(): Array<{ row: number; col: number }> {
    const positions = this.cells.map(cell => cell.position);
    // Add empty corner position
    if (this.emptyCornerCell) {
      positions.push(this.emptyCornerCell.position);
    }
    return positions;
  }

  /**
   * Check if position is within matrix bounds
   */
  containsPosition(row: number, col: number): boolean {
    return row >= this.bounds.topRow &&
           row <= this.bounds.bottomRow &&
           col >= this.bounds.leftCol &&
           col <= this.bounds.rightCol;
  }

  /**
   * Find primary entity by column position
   */
  findPrimaryEntityByColumn(col: number): MatrixEntity | null {
    const colIndex = col - this.bounds.leftCol - 1;
    return this.primaryEntities[colIndex] || null;
  }

  /**
   * Find secondary entity by row position
   */
  findSecondaryEntityByRow(row: number): MatrixEntity | null {
    const rowIndex = row - this.bounds.topRow - 1;
    return this.secondaryEntities[rowIndex] || null;
  }

  /**
   * Get entity by index
   */
  getPrimaryEntity(index: number): MatrixEntity | null {
    return this.primaryEntities[index] || null;
  }

  /**
   * Get secondary entity by index
   */
  getSecondaryEntity(index: number): MatrixEntity | null {
    return this.secondaryEntities[index] || null;
  }

  /**
   * Check if matrix has an empty corner
   */
  hasEmptyCorner(): boolean {
    return this.emptyCornerCell !== null;
  }

  /**
   * Get the empty corner cell
   */
  getEmptyCorner(): MatrixCell | null {
    return this.emptyCornerCell;
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
      cellType,
    };
  }
}
