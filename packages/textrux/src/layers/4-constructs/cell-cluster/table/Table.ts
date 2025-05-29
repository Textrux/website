import {
  BaseConstruct,
  ConstructPosition,
} from "../../interfaces/ConstructInterfaces";

/**
 * Represents a cell in the table
 */
export interface TableCell {
  /** Position of this cell in the grid */
  position: ConstructPosition;

  /** Content of this cell */
  content: string;

  /** Whether this is a header cell */
  isHeader: boolean;

  /** Row index within the table (0-based) */
  tableRow: number;

  /** Column index within the table (0-based) */
  tableColumn: number;

  /** Data type of the cell content */
  dataType: "text" | "number" | "date" | "boolean" | "formula" | "empty";

  /** Formatting information */
  formatting?: {
    alignment?: "left" | "center" | "right";
    bold?: boolean;
    italic?: boolean;
  };
}

/**
 * Represents a row in the table
 */
export interface TableRow {
  /** Row index within the table (0-based) */
  index: number;

  /** All cells in this row */
  cells: TableCell[];

  /** Whether this is a header row */
  isHeader: boolean;

  /** Whether this row has consistent data types */
  hasConsistentDataTypes: boolean;
}

/**
 * Represents a column in the table
 */
export interface TableColumn {
  /** Column index within the table (0-based) */
  index: number;

  /** All cells in this column */
  cells: TableCell[];

  /** Whether this is a header column */
  isHeader: boolean;

  /** Primary data type of this column */
  dataType: "text" | "number" | "date" | "boolean" | "mixed";

  /** Column header text (if any) */
  header?: string;

  /** Whether this column has consistent data types */
  hasConsistentDataTypes: boolean;
}

/**
 * Table construct representing tabular data structures
 */
export default class Table implements BaseConstruct {
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

  /** All cells in the table */
  cells: TableCell[][];

  /** All rows in the table */
  rows: TableRow[];

  /** All columns in the table */
  columns: TableColumn[];

  /** Number of rows in the table */
  rowCount: number;

  /** Number of columns in the table */
  columnCount: number;

  /** Whether the table has headers */
  hasHeaders: boolean;

  /** Header row index (if any) */
  headerRowIndex?: number;

  /** Header column index (if any) */
  headerColumnIndex?: number;

  /** Whether the table has consistent column alignment */
  hasConsistentAlignment: boolean;

  /** Whether the table has borders or separators */
  hasBorders: boolean;

  /** Whether the table has alternating row colors/styles */
  hasAlternatingRows: boolean;

  constructor(
    id: string,
    confidence: number,
    signatureImprint: string,
    bounds: any,
    metadata: Record<string, any> = {}
  ) {
    this.id = id;
    this.confidence = confidence;
    this.signatureImprint = signatureImprint;
    this.bounds = bounds;
    this.metadata = metadata;

    this.cells = [];
    this.rows = [];
    this.columns = [];
    this.rowCount = 0;
    this.columnCount = 0;
    this.hasHeaders = false;
    this.hasConsistentAlignment = false;
    this.hasBorders = false;
    this.hasAlternatingRows = false;
  }

  /**
   * Initialize the table structure with dimensions
   */
  initializeStructure(rowCount: number, columnCount: number): void {
    this.rowCount = rowCount;
    this.columnCount = columnCount;

    // Initialize 2D array of cells
    this.cells = Array.from({ length: rowCount }, () =>
      Array.from({ length: columnCount }, () => null as any)
    );

    // Initialize rows
    this.rows = Array.from({ length: rowCount }, (_, index) => ({
      index,
      cells: [],
      isHeader: false,
      hasConsistentDataTypes: false,
    }));

    // Initialize columns
    this.columns = Array.from({ length: columnCount }, (_, index) => ({
      index,
      cells: [],
      isHeader: false,
      dataType: "text" as const,
      hasConsistentDataTypes: false,
    }));
  }

  /**
   * Add a cell to the table
   */
  addCell(cell: TableCell): void {
    if (
      cell.tableRow >= 0 &&
      cell.tableRow < this.rowCount &&
      cell.tableColumn >= 0 &&
      cell.tableColumn < this.columnCount
    ) {
      // Add to 2D array
      this.cells[cell.tableRow][cell.tableColumn] = cell;

      // Add to row
      this.rows[cell.tableRow].cells[cell.tableColumn] = cell;

      // Add to column
      this.columns[cell.tableColumn].cells[cell.tableRow] = cell;
    }
  }

  /**
   * Get a cell by table coordinates
   */
  getCell(tableRow: number, tableColumn: number): TableCell | null {
    if (
      tableRow >= 0 &&
      tableRow < this.rowCount &&
      tableColumn >= 0 &&
      tableColumn < this.columnCount
    ) {
      return this.cells[tableRow][tableColumn];
    }
    return null;
  }

  /**
   * Get a row by index
   */
  getRow(rowIndex: number): TableRow | null {
    if (rowIndex >= 0 && rowIndex < this.rowCount) {
      return this.rows[rowIndex];
    }
    return null;
  }

  /**
   * Get a column by index
   */
  getColumn(columnIndex: number): TableColumn | null {
    if (columnIndex >= 0 && columnIndex < this.columnCount) {
      return this.columns[columnIndex];
    }
    return null;
  }

  /**
   * Detect and mark header rows/columns
   */
  detectHeaders(): void {
    // Check first row for headers
    if (this.rowCount > 1) {
      const firstRow = this.rows[0];
      const hasHeaderPattern = this.analyzeHeaderPattern(firstRow);

      if (hasHeaderPattern) {
        this.hasHeaders = true;
        this.headerRowIndex = 0;
        firstRow.isHeader = true;

        // Mark column headers
        firstRow.cells.forEach((cell, index) => {
          if (cell) {
            cell.isHeader = true;
            this.columns[index].isHeader = true;
            this.columns[index].header = cell.content;
          }
        });
      }
    }

    // Check first column for headers
    if (this.columnCount > 1) {
      const firstColumn = this.columns[0];
      const hasHeaderPattern = this.analyzeColumnHeaderPattern(firstColumn);

      if (hasHeaderPattern) {
        this.hasHeaders = true;
        this.headerColumnIndex = 0;
        firstColumn.isHeader = true;

        // Mark row headers
        firstColumn.cells.forEach((cell) => {
          if (cell) {
            cell.isHeader = true;
          }
        });
      }
    }
  }

  /**
   * Analyze data types for all columns
   */
  analyzeDataTypes(): void {
    for (const column of this.columns) {
      this.analyzeColumnDataType(column);
    }
  }

  /**
   * Analyze the table structure and update metadata
   */
  analyzeStructure(): void {
    // Detect headers
    this.detectHeaders();

    // Analyze data types
    this.analyzeDataTypes();

    // Check for consistent alignment
    this.analyzeAlignment();

    // Check for borders
    this.analyzeBorders();

    // Update metadata
    this.metadata.totalCells = this.rowCount * this.columnCount;
    this.metadata.filledCells = this.getFilledCellCount();
    this.metadata.dataRows = this.getDataRowCount();
    this.metadata.dataColumns = this.getDataColumnCount();
    this.metadata.density = this.calculateDensity();
    this.metadata.columnTypes = this.getColumnTypes();
  }

  private analyzeHeaderPattern(row: TableRow): boolean {
    // Simple heuristic: if the first row has different formatting or
    // content patterns compared to subsequent rows
    if (this.rowCount < 2) return false;

    const secondRow = this.rows[1];

    // Check if first row has more text and second row has more numbers/data
    let firstRowTextCount = 0;
    let secondRowNumberCount = 0;

    row.cells.forEach((cell, index) => {
      if (cell && cell.content.trim()) {
        if (isNaN(Number(cell.content))) {
          firstRowTextCount++;
        }
      }

      const secondCell = secondRow.cells[index];
      if (secondCell && secondCell.content.trim()) {
        if (!isNaN(Number(secondCell.content))) {
          secondRowNumberCount++;
        }
      }
    });

    // If first row is mostly text and second row has numbers, likely headers
    return firstRowTextCount > this.columnCount / 2 && secondRowNumberCount > 0;
  }

  private analyzeColumnHeaderPattern(column: TableColumn): boolean {
    // Similar logic for column headers
    if (this.rowCount < 2) return false;

    // Check if column content looks like row labels
    let textCount = 0;
    column.cells.forEach((cell) => {
      if (cell && cell.content.trim() && isNaN(Number(cell.content))) {
        textCount++;
      }
    });

    return textCount > this.rowCount / 2;
  }

  private analyzeColumnDataType(column: TableColumn): void {
    const dataTypes = new Map<string, number>();
    let totalCells = 0;

    column.cells.forEach((cell) => {
      if (cell && cell.content.trim()) {
        totalCells++;
        const type = this.detectCellDataType(cell.content);
        dataTypes.set(type, (dataTypes.get(type) || 0) + 1);
      }
    });

    if (totalCells === 0) {
      column.dataType = "text";
      return;
    }

    // Find the most common data type
    let maxCount = 0;
    let dominantType = "text";

    dataTypes.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type;
      }
    });

    // If one type dominates (>75%), use it; otherwise, mixed
    if (maxCount / totalCells > 0.75) {
      column.dataType = dominantType as any;
      column.hasConsistentDataTypes = true;
    } else {
      column.dataType = "mixed";
      column.hasConsistentDataTypes = false;
    }
  }

  private detectCellDataType(content: string): string {
    const trimmed = content.trim();

    if (!trimmed) return "empty";
    if (trimmed.startsWith("=")) return "formula";
    if (!isNaN(Number(trimmed))) return "number";
    if (this.isDateLike(trimmed)) return "date";
    if (this.isBooleanLike(trimmed)) return "boolean";

    return "text";
  }

  private isDateLike(content: string): boolean {
    // Simple date detection
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
    ];

    return datePatterns.some((pattern) => pattern.test(content));
  }

  private isBooleanLike(content: string): boolean {
    const lower = content.toLowerCase();
    return ["true", "false", "yes", "no", "y", "n", "1", "0"].includes(lower);
  }

  private analyzeAlignment(): void {
    // Simplified alignment analysis
    // Would check for consistent left/right/center alignment
    this.hasConsistentAlignment = true; // Placeholder
  }

  private analyzeBorders(): void {
    // Simplified border analysis
    // Would check for border characters, separators, etc.
    this.hasBorders = false; // Placeholder
  }

  private getFilledCellCount(): number {
    let count = 0;
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        if (cell && cell.content.trim()) {
          count++;
        }
      });
    });
    return count;
  }

  private getDataRowCount(): number {
    return this.hasHeaders && this.headerRowIndex !== undefined
      ? this.rowCount - 1
      : this.rowCount;
  }

  private getDataColumnCount(): number {
    return this.hasHeaders && this.headerColumnIndex !== undefined
      ? this.columnCount - 1
      : this.columnCount;
  }

  private calculateDensity(): number {
    const totalCells = this.rowCount * this.columnCount;
    const filledCells = this.getFilledCellCount();
    return totalCells > 0 ? filledCells / totalCells : 0;
  }

  private getColumnTypes(): string[] {
    return this.columns.map((col) => col.dataType);
  }
}
