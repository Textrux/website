import { BaseConstruct } from "../interfaces/ConstructInterfaces";

/**
 * Core List construct based on Cell Cluster Key system
 * Lists have 2-cell key pattern: header + first item in sequence
 * Can be vertical (regular) or horizontal (transposed)
 */

export type ListOrientation = "regular" | "transposed"; // vertical or horizontal
export type ListCellType = "header" | "item";

export interface ListCell {
  position: { row: number; col: number };
  content: string;
  cellType: ListCellType;
  index?: number; // For items, the index in the list (0-based)
}

export class CoreList implements BaseConstruct {
  id: string;
  type: string = "list";
  keyPattern: string;
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  metadata: Record<string, any>;

  // List-specific properties
  orientation: ListOrientation;
  cells: ListCell[];
  headerCell?: ListCell;
  itemCells: ListCell[];
  itemCount: number;

  constructor(
    id: string,
    keyPattern: string,
    bounds: { topRow: number; bottomRow: number; leftCol: number; rightCol: number },
    orientation: ListOrientation = "regular"
  ) {
    this.id = id;
    this.keyPattern = keyPattern;
    this.bounds = bounds;
    this.orientation = orientation;
    this.cells = [];
    this.itemCells = [];
    this.itemCount = 0;
    this.metadata = {};
  }

  /**
   * Add a cell to the list
   */
  addCell(cell: ListCell): void {
    this.cells.push(cell);
    
    if (cell.cellType === "header") {
      this.headerCell = cell;
    } else if (cell.cellType === "item") {
      this.itemCells.push(cell);
    }
  }

  /**
   * Organize items and calculate metrics
   */
  organizeItems(): void {
    // Sort items by position (for consistent ordering)
    if (this.orientation === "regular") {
      // Vertical list: sort by row
      this.itemCells.sort((a, b) => a.position.row - b.position.row);
    } else {
      // Horizontal list: sort by column
      this.itemCells.sort((a, b) => a.position.col - b.position.col);
    }

    // Assign indices to items
    this.itemCells.forEach((cell, index) => {
      cell.index = index;
    });

    this.itemCount = this.itemCells.length;
  }

  /**
   * Get item at specific index
   */
  getItemAt(index: number): ListCell | null {
    return this.itemCells[index] || null;
  }

  /**
   * Get all item contents as array
   */
  getItemContents(): string[] {
    return this.itemCells.map(cell => cell.content);
  }

  /**
   * Get header content
   */
  getHeaderContent(): string | null {
    return this.headerCell?.content || null;
  }

  /**
   * Get list dimensions
   */
  getDimensions(): { length: number; headerCount: number } {
    return {
      length: this.itemCount,
      headerCount: this.headerCell ? 1 : 0
    };
  }

  /**
   * Check if list is vertical (regular orientation)
   */
  isVertical(): boolean {
    return this.orientation === "regular";
  }

  /**
   * Check if list is horizontal (transposed orientation)
   */
  isHorizontal(): boolean {
    return this.orientation === "transposed";
  }

  /**
   * Get the expected next item position
   */
  getNextItemPosition(): { row: number; col: number } | null {
    if (this.itemCells.length === 0) {
      // No items yet, next item goes after header
      if (!this.headerCell) return null;
      
      if (this.orientation === "regular") {
        return {
          row: this.headerCell.position.row + 1,
          col: this.headerCell.position.col
        };
      } else {
        return {
          row: this.headerCell.position.row,
          col: this.headerCell.position.col + 1
        };
      }
    }

    // Get last item position and calculate next
    const lastItem = this.itemCells[this.itemCells.length - 1];
    if (this.orientation === "regular") {
      return {
        row: lastItem.position.row + 1,
        col: lastItem.position.col
      };
    } else {
      return {
        row: lastItem.position.row,
        col: lastItem.position.col + 1
      };
    }
  }

  /**
   * Get cell at specific position
   */
  getCellAt(row: number, col: number): ListCell | null {
    return this.cells.find(
      cell => cell.position.row === row && cell.position.col === col
    ) || null;
  }

  /**
   * Get cells by type
   */
  getCellsByType(cellType: ListCellType): ListCell[] {
    return this.cells.filter(cell => cell.cellType === cellType);
  }

  /**
   * Get header cell
   */
  getHeaderCell(): ListCell | null {
    return this.headerCell;
  }

  /**
   * Get all item cells
   */
  getItemCells(): ListCell[] {
    return this.itemCells;
  }

  /**
   * Get cell content at position (convenience method)
   */
  getCellContent(row: number, col: number): string {
    const cell = this.getCellAt(row, col);
    return cell ? cell.content : "";
  }

  /**
   * Get item content by index
   */
  getItemContent(index: number): string {
    const item = this.getItemAt(index);
    return item ? item.content : "";
  }

  /**
   * Get all positions in the list
   */
  getAllPositions(): Array<{ row: number; col: number }> {
    return this.cells.map(cell => cell.position);
  }

  /**
   * Check if position is within list bounds
   */
  containsPosition(row: number, col: number): boolean {
    return row >= this.bounds.topRow &&
           row <= this.bounds.bottomRow &&
           col >= this.bounds.leftCol &&
           col <= this.bounds.rightCol;
  }

  /**
   * Find item by content
   */
  findItemByContent(content: string): ListCell | null {
    return this.itemCells.find(cell => cell.content === content) || null;
  }

  /**
   * Get item index by content
   */
  getItemIndex(content: string): number {
    return this.itemCells.findIndex(cell => cell.content === content);
  }

  /**
   * Check if list has header
   */
  hasHeader(): boolean {
    return this.headerCell !== null;
  }

  /**
   * Check if list is empty (no items)
   */
  isEmpty(): boolean {
    return this.itemCount === 0;
  }

  /**
   * Get first item
   */
  getFirstItem(): ListCell | null {
    return this.getItemAt(0);
  }

  /**
   * Get last item
   */
  getLastItem(): ListCell | null {
    return this.getItemAt(this.itemCount - 1);
  }

  /**
   * Get list as simple array
   */
  toArray(): string[] {
    return this.getItemContents();
  }

  /**
   * Add a new item to the list
   */
  addItem(content: string, position?: { row: number; col: number }): ListCell {
    const itemPosition = position || this.getNextItemPosition();
    if (!itemPosition) {
      throw new Error("Cannot determine position for new item");
    }

    const cell = CoreList.createCell(
      itemPosition,
      content,
      "item",
      this.itemCells.length
    );
    
    this.addCell(cell);
    this.organizeItems();
    
    return cell;
  }

  /**
   * Create a list cell
   */
  static createCell(
    position: { row: number; col: number },
    content: string,
    cellType: ListCellType = "item",
    index?: number
  ): ListCell {
    const cell: ListCell = {
      position,
      content,
      cellType
    };
    
    if (cellType === "item" && index !== undefined) {
      cell.index = index;
    }
    
    return cell;
  }

  /**
   * Create a list element for tree domain usage
   */
  static createElement(
    position: { row: number; col: number },
    content: string,
    cellType: ListCellType,
    index?: number
  ): ListCell {
    return this.createCell(position, content, cellType, index);
  }
}