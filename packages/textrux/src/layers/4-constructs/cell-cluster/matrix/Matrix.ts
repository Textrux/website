import {
  BaseConstruct,
  ConstructPosition,
} from "../../interfaces/ConstructInterfaces";

/**
 * Represents a cell in the matrix
 */
export interface MatrixCell {
  /** Position of this cell in the grid */
  position: ConstructPosition;

  /** Numerical value of this cell */
  value: number;

  /** Original content string */
  content: string;

  /** Row index within the matrix (0-based) */
  matrixRow: number;

  /** Column index within the matrix (0-based) */
  matrixColumn: number;

  /** Whether this cell contains a formula */
  isFormula: boolean;

  /** Whether this cell is empty/null */
  isEmpty: boolean;
}

/**
 * Matrix construct representing mathematical matrix structures
 */
export default class Matrix implements BaseConstruct {
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

  /** All cells in the matrix */
  cells: MatrixCell[][];

  /** Number of rows in the matrix */
  rowCount: number;

  /** Number of columns in the matrix */
  columnCount: number;

  /** Whether this is a square matrix */
  isSquare: boolean;

  /** Whether this matrix is symmetric */
  isSymmetric: boolean;

  /** Whether this matrix is diagonal */
  isDiagonal: boolean;

  /** Whether this matrix is an identity matrix */
  isIdentity: boolean;

  /** Whether this matrix contains only integers */
  isIntegerMatrix: boolean;

  /** Determinant of the matrix (if calculable) */
  determinant?: number;

  /** Matrix rank (if calculable) */
  rank?: number;

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
    this.rowCount = 0;
    this.columnCount = 0;
    this.isSquare = false;
    this.isSymmetric = false;
    this.isDiagonal = false;
    this.isIdentity = false;
    this.isIntegerMatrix = false;
  }

  /**
   * Initialize the matrix structure with dimensions
   */
  initializeStructure(rowCount: number, columnCount: number): void {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.isSquare = rowCount === columnCount;

    // Initialize 2D array of cells
    this.cells = Array.from({ length: rowCount }, () =>
      Array.from({ length: columnCount }, () => null as any)
    );
  }

  /**
   * Add a cell to the matrix
   */
  addCell(cell: MatrixCell): void {
    if (
      cell.matrixRow >= 0 &&
      cell.matrixRow < this.rowCount &&
      cell.matrixColumn >= 0 &&
      cell.matrixColumn < this.columnCount
    ) {
      this.cells[cell.matrixRow][cell.matrixColumn] = cell;
    }
  }

  /**
   * Get a cell by matrix coordinates
   */
  getCell(matrixRow: number, matrixColumn: number): MatrixCell | null {
    if (
      matrixRow >= 0 &&
      matrixRow < this.rowCount &&
      matrixColumn >= 0 &&
      matrixColumn < this.columnCount
    ) {
      return this.cells[matrixRow][matrixColumn];
    }
    return null;
  }

  /**
   * Get a row as an array of values
   */
  getRow(rowIndex: number): number[] {
    if (rowIndex >= 0 && rowIndex < this.rowCount) {
      return this.cells[rowIndex].map((cell) => (cell ? cell.value : 0));
    }
    return [];
  }

  /**
   * Get a column as an array of values
   */
  getColumn(columnIndex: number): number[] {
    if (columnIndex >= 0 && columnIndex < this.columnCount) {
      return this.cells.map((row) =>
        row[columnIndex] ? row[columnIndex].value : 0
      );
    }
    return [];
  }

  /**
   * Get the matrix as a 2D array of numbers
   */
  getAsNumericArray(): number[][] {
    return this.cells.map((row) => row.map((cell) => (cell ? cell.value : 0)));
  }

  /**
   * Analyze the matrix structure and properties
   */
  analyzeStructure(): void {
    this.analyzeMatrixProperties();
    this.calculateStatistics();

    // Update metadata
    this.metadata.totalCells = this.rowCount * this.columnCount;
    this.metadata.filledCells = this.getFilledCellCount();
    this.metadata.sparsity = this.calculateSparsity();
    this.metadata.range = this.calculateRange();
    this.metadata.sum = this.calculateSum();
    this.metadata.mean = this.calculateMean();
  }

  private analyzeMatrixProperties(): void {
    if (!this.isSquare) {
      this.isSymmetric = false;
      this.isDiagonal = false;
      this.isIdentity = false;
      return;
    }

    // Check if matrix is diagonal
    this.isDiagonal = this.checkDiagonal();

    // Check if matrix is symmetric
    this.isSymmetric = this.checkSymmetric();

    // Check if matrix is identity
    this.isIdentity = this.checkIdentity();

    // Check if all values are integers
    this.isIntegerMatrix = this.checkAllIntegers();

    // Calculate determinant for small square matrices
    if (this.isSquare && this.rowCount <= 4) {
      this.determinant = this.calculateDeterminant();
    }
  }

  private checkDiagonal(): boolean {
    for (let i = 0; i < this.rowCount; i++) {
      for (let j = 0; j < this.columnCount; j++) {
        if (i !== j) {
          const cell = this.getCell(i, j);
          if (cell && cell.value !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private checkSymmetric(): boolean {
    for (let i = 0; i < this.rowCount; i++) {
      for (let j = 0; j < this.columnCount; j++) {
        const cellIJ = this.getCell(i, j);
        const cellJI = this.getCell(j, i);

        const valueIJ = cellIJ ? cellIJ.value : 0;
        const valueJI = cellJI ? cellJI.value : 0;

        if (Math.abs(valueIJ - valueJI) > 1e-10) {
          return false;
        }
      }
    }
    return true;
  }

  private checkIdentity(): boolean {
    if (!this.isDiagonal) return false;

    for (let i = 0; i < this.rowCount; i++) {
      const cell = this.getCell(i, i);
      if (!cell || cell.value !== 1) {
        return false;
      }
    }
    return true;
  }

  private checkAllIntegers(): boolean {
    for (let i = 0; i < this.rowCount; i++) {
      for (let j = 0; j < this.columnCount; j++) {
        const cell = this.getCell(i, j);
        if (cell && !Number.isInteger(cell.value)) {
          return false;
        }
      }
    }
    return true;
  }

  private calculateDeterminant(): number | undefined {
    const matrix = this.getAsNumericArray();

    if (this.rowCount === 1) {
      return matrix[0][0];
    } else if (this.rowCount === 2) {
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    } else if (this.rowCount === 3) {
      return (
        matrix[0][0] *
          (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
        matrix[0][1] *
          (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
        matrix[0][2] *
          (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
      );
    }

    // For larger matrices, would need more complex algorithm
    return undefined;
  }

  private calculateStatistics(): void {
    // These will be stored in metadata
  }

  private getFilledCellCount(): number {
    let count = 0;
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        if (cell && !cell.isEmpty) {
          count++;
        }
      });
    });
    return count;
  }

  private calculateSparsity(): number {
    const totalCells = this.rowCount * this.columnCount;
    const emptyCells = totalCells - this.getFilledCellCount();
    return totalCells > 0 ? emptyCells / totalCells : 0;
  }

  private calculateRange(): { min: number; max: number } {
    let min = Infinity;
    let max = -Infinity;

    this.cells.forEach((row) => {
      row.forEach((cell) => {
        if (cell && !cell.isEmpty) {
          min = Math.min(min, cell.value);
          max = Math.max(max, cell.value);
        }
      });
    });

    return {
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
    };
  }

  private calculateSum(): number {
    let sum = 0;
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        if (cell && !cell.isEmpty) {
          sum += cell.value;
        }
      });
    });
    return sum;
  }

  private calculateMean(): number {
    const filledCells = this.getFilledCellCount();
    return filledCells > 0 ? this.calculateSum() / filledCells : 0;
  }
}
