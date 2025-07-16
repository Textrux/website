import { BaseConstruct } from "../interfaces/ConstructInterfaces";

/**
 * Core Key-Value construct based on Cell Cluster Key system
 * Key-values have R1C1 filled, R2C1+R1C2 empty, R2C2 filled (first key)
 */

export type KeyValueOrientation = "regular" | "transposed"; // vertical or horizontal
export type KeyValueCellType = "main-header" | "key" | "value" | "marker";

export interface KeyValueCell {
  position: { row: number; col: number };
  content: string;
  cellType: KeyValueCellType;
}

export interface KeyValuePair {
  key: KeyValueCell;
  values: KeyValueCell[];
}

export class CoreKeyValue implements BaseConstruct {
  id: string;
  type: string = "key-value";
  keyPattern: string;
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  metadata: Record<string, any>;

  // Key-Value specific properties
  orientation: KeyValueOrientation;
  cells: KeyValueCell[];
  mainHeader?: KeyValueCell;
  markerCell?: KeyValueCell;
  keyCells: KeyValueCell[];
  valueCells: KeyValueCell[];
  keyValuePairs: KeyValuePair[];

  constructor(
    id: string,
    keyPattern: string,
    bounds: { topRow: number; bottomRow: number; leftCol: number; rightCol: number },
    orientation: KeyValueOrientation = "regular"
  ) {
    this.id = id;
    this.keyPattern = keyPattern;
    this.bounds = bounds;
    this.orientation = orientation;
    this.cells = [];
    this.keyCells = [];
    this.valueCells = [];
    this.keyValuePairs = [];
    this.metadata = {};
  }

  /**
   * Add a cell to the key-value structure
   */
  addCell(cell: KeyValueCell): void {
    this.cells.push(cell);
    
    switch (cell.cellType) {
      case "main-header":
        this.mainHeader = cell;
        break;
      case "marker":
        this.markerCell = cell;
        break;
      case "key":
        this.keyCells.push(cell);
        break;
      case "value":
        this.valueCells.push(cell);
        break;
    }
  }

  /**
   * Organize keys and values into pairs
   */
  organizeKeyValuePairs(): void {
    this.keyValuePairs = [];

    if (this.orientation === "regular") {
      // Vertical key-values: keys in first column, values in subsequent columns
      for (const keyCell of this.keyCells) {
        const keyRow = keyCell.position.row;
        const associatedValues = this.valueCells.filter(
          valueCell => valueCell.position.row === keyRow
        );
        
        if (associatedValues.length > 0) {
          this.keyValuePairs.push({
            key: keyCell,
            values: associatedValues
          });
        }
      }
    } else {
      // Horizontal (transposed) key-values: keys in first row, values in subsequent rows
      for (const keyCell of this.keyCells) {
        const keyCol = keyCell.position.col;
        const associatedValues = this.valueCells.filter(
          valueCell => valueCell.position.col === keyCol
        );
        
        if (associatedValues.length > 0) {
          this.keyValuePairs.push({
            key: keyCell,
            values: associatedValues
          });
        }
      }
    }
  }

  /**
   * Get cell at specific position
   */
  getCellAt(row: number, col: number): KeyValueCell | null {
    return this.cells.find(
      cell => cell.position.row === row && cell.position.col === col
    ) || null;
  }

  /**
   * Get all values for a specific key
   */
  getValuesForKey(keyContent: string): KeyValueCell[] {
    const pair = this.keyValuePairs.find(
      pair => pair.key.content === keyContent
    );
    
    return pair ? pair.values : [];
  }

  /**
   * Get key-value pair by key content
   */
  getKeyValuePair(keyContent: string): KeyValuePair | null {
    return this.keyValuePairs.find(
      pair => pair.key.content === keyContent
    ) || null;
  }

  /**
   * Get all keys as strings
   */
  getAllKeys(): string[] {
    return this.keyCells.map(cell => cell.content);
  }

  /**
   * Get all values as strings
   */
  getAllValues(): string[] {
    return this.valueCells.map(cell => cell.content);
  }

  /**
   * Check if this is a regular (vertical) key-value structure
   */
  isRegular(): boolean {
    return this.orientation === "regular";
  }

  /**
   * Check if this is a transposed (horizontal) key-value structure
   */
  isTransposed(): boolean {
    return this.orientation === "transposed";
  }

  /**
   * Get the main header text (if present)
   */
  getMainHeaderText(): string | null {
    return this.mainHeader ? this.mainHeader.content : null;
  }

  /**
   * Get the marker cell content (if present)
   */
  getMarkerText(): string | null {
    return this.markerCell ? this.markerCell.content : null;
  }

  /**
   * Get number of key-value pairs
   */
  getPairCount(): number {
    return this.keyValuePairs.length;
  }

  /**
   * Get cells by type
   */
  getCellsByType(cellType: KeyValueCellType): KeyValueCell[] {
    return this.cells.filter(cell => cell.cellType === cellType);
  }

  /**
   * Get all key cells
   */
  getKeyCells(): KeyValueCell[] {
    return this.keyCells;
  }

  /**
   * Get all value cells
   */
  getValueCells(): KeyValueCell[] {
    return this.valueCells;
  }

  /**
   * Get all marker cells
   */
  getMarkerCells(): KeyValueCell[] {
    return this.cells.filter(cell => cell.cellType === "marker");
  }

  /**
   * Get all main header cells
   */
  getMainHeaderCells(): KeyValueCell[] {
    return this.cells.filter(cell => cell.cellType === "main-header");
  }

  /**
   * Get cell content at position (convenience method)
   */
  getCellContent(row: number, col: number): string {
    const cell = this.getCellAt(row, col);
    return cell ? cell.content : "";
  }

  /**
   * Get all key contents
   */
  getAllKeyContents(): string[] {
    return this.keyCells.map(cell => cell.content);
  }

  /**
   * Get all value contents for a key
   */
  getAllValuesForKey(keyContent: string): string[] {
    const values = this.getValuesForKey(keyContent);
    return values.map(cell => cell.content);
  }

  /**
   * Get all positions in the key-value construct
   */
  getAllPositions(): Array<{ row: number; col: number }> {
    return this.cells.map(cell => cell.position);
  }

  /**
   * Check if position is within key-value bounds
   */
  containsPosition(row: number, col: number): boolean {
    return row >= this.bounds.topRow &&
           row <= this.bounds.bottomRow &&
           col >= this.bounds.leftCol &&
           col <= this.bounds.rightCol;
  }

  /**
   * Find key by content
   */
  findKeyByContent(content: string): KeyValueCell | null {
    return this.keyCells.find(cell => cell.content === content) || null;
  }

  /**
   * Check if has main header
   */
  hasMainHeader(): boolean {
    return this.getMainHeaderCells().length > 0;
  }

  /**
   * Get first value for a key
   */
  getFirstValueForKey(keyContent: string): string {
    const values = this.getValuesForKey(keyContent);
    return values.length > 0 ? values[0].content : "";
  }

  /**
   * Get key-value as simple object
   */
  toObject(): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};
    
    for (const pair of this.keyValuePairs) {
      const key = pair.key.content;
      const values = pair.values.map(v => v.content);
      
      if (values.length === 1) {
        result[key] = values[0];
      } else {
        result[key] = values;
      }
    }
    
    return result;
  }

  /**
   * Create a key-value cell
   */
  static createCell(
    position: { row: number; col: number },
    content: string,
    cellType: KeyValueCellType = "value"
  ): KeyValueCell {
    return {
      position,
      content,
      cellType
    };
  }
}