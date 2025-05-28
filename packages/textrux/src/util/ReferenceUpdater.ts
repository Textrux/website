import GridModel from "../layers/1-substrate/GridModel";

export interface CellMove {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
}

export interface RangeMove {
  fromStartRow: number;
  fromStartCol: number;
  fromEndRow: number;
  fromEndCol: number;
  toStartRow: number;
  toStartCol: number;
  toEndRow: number;
  toEndCol: number;
}

/**
 * Updates all formula references in the grid when cells or ranges are moved
 */
export class ReferenceUpdater {
  private grid: GridModel;

  constructor(grid: GridModel) {
    this.grid = grid;
  }

  /**
   * Updates all references when a single cell is moved
   */
  updateReferencesForCellMove(move: CellMove): void {
    const allCells = this.grid.getFilledCells();

    for (const cell of allCells) {
      const cellValue = cell.value.trim();
      if (cellValue.startsWith("=")) {
        const updatedFormula = this.updateFormulaForCellMove(cellValue, move);
        if (updatedFormula !== cellValue) {
          this.grid.setCellRaw(cell.row, cell.col, updatedFormula);
        }
      }
    }
  }

  /**
   * Updates all references when a range of cells is moved
   */
  updateReferencesForRangeMove(move: RangeMove): void {
    const allCells = this.grid.getFilledCells();

    for (const cell of allCells) {
      const cellValue = cell.value.trim();
      if (cellValue.startsWith("=")) {
        const updatedFormula = this.updateFormulaForRangeMove(cellValue, move);
        if (updatedFormula !== cellValue) {
          this.grid.setCellRaw(cell.row, cell.col, updatedFormula);
        }
      }
    }
  }

  /**
   * Updates all references when multiple cells are moved (like in a block move)
   */
  updateReferencesForBlockMove(moves: CellMove[]): void {
    const allCells = this.grid.getFilledCells();

    for (const cell of allCells) {
      const cellValue = cell.value.trim();
      if (cellValue.startsWith("=")) {
        let updatedFormula = cellValue;

        // Apply each cell move to the formula
        for (const move of moves) {
          updatedFormula = this.updateFormulaForCellMove(updatedFormula, move);
        }

        if (updatedFormula !== cellValue) {
          this.grid.setCellRaw(cell.row, cell.col, updatedFormula);
        }
      }
    }
  }

  /**
   * Updates a single formula for a cell move
   */
  private updateFormulaForCellMove(formula: string, move: CellMove): string {
    // Pattern to match R1C1 style references: R123C456 or R123C456:R789C012
    const r1c1Pattern = /R(\d+)C(\d+)(?::R(\d+)C(\d+))?/g;

    return formula.replace(r1c1Pattern, (match, r1, c1, r2, c2) => {
      const row1 = parseInt(r1);
      const col1 = parseInt(c1);

      if (r2 && c2) {
        // Range reference
        const row2 = parseInt(r2);
        const col2 = parseInt(c2);

        let newRow1 = row1;
        let newCol1 = col1;
        let newRow2 = row2;
        let newCol2 = col2;

        // Update start of range if it matches the moved cell
        if (row1 === move.fromRow && col1 === move.fromCol) {
          newRow1 = move.toRow;
          newCol1 = move.toCol;
        }

        // Update end of range if it matches the moved cell
        if (row2 === move.fromRow && col2 === move.fromCol) {
          newRow2 = move.toRow;
          newCol2 = move.toCol;
        }

        return `R${newRow1}C${newCol1}:R${newRow2}C${newCol2}`;
      } else {
        // Single cell reference
        if (row1 === move.fromRow && col1 === move.fromCol) {
          return `R${move.toRow}C${move.toCol}`;
        }
        return match; // No change needed
      }
    });
  }

  /**
   * Updates a single formula for a range move
   */
  private updateFormulaForRangeMove(formula: string, move: RangeMove): string {
    // Pattern to match R1C1 style references: R123C456 or R123C456:R789C012
    const r1c1Pattern = /R(\d+)C(\d+)(?::R(\d+)C(\d+))?/g;

    return formula.replace(r1c1Pattern, (match, r1, c1, r2, c2) => {
      const row1 = parseInt(r1);
      const col1 = parseInt(c1);

      if (r2 && c2) {
        // Range reference
        const row2 = parseInt(r2);
        const col2 = parseInt(c2);

        // Check if this range reference matches the moved range exactly
        if (
          row1 === move.fromStartRow &&
          col1 === move.fromStartCol &&
          row2 === move.fromEndRow &&
          col2 === move.fromEndCol
        ) {
          return `R${move.toStartRow}C${move.toStartCol}:R${move.toEndRow}C${move.toEndCol}`;
        }

        // Check if individual cells in the range were moved
        let newRow1 = row1;
        let newCol1 = col1;
        let newRow2 = row2;
        let newCol2 = col2;

        // Check if start cell is within the moved range
        if (
          this.isCellInRange(
            row1,
            col1,
            move.fromStartRow,
            move.fromStartCol,
            move.fromEndRow,
            move.fromEndCol
          )
        ) {
          const deltaRow = move.toStartRow - move.fromStartRow;
          const deltaCol = move.toStartCol - move.fromStartCol;
          newRow1 = row1 + deltaRow;
          newCol1 = col1 + deltaCol;
        }

        // Check if end cell is within the moved range
        if (
          this.isCellInRange(
            row2,
            col2,
            move.fromStartRow,
            move.fromStartCol,
            move.fromEndRow,
            move.fromEndCol
          )
        ) {
          const deltaRow = move.toStartRow - move.fromStartRow;
          const deltaCol = move.toStartCol - move.fromStartCol;
          newRow2 = row2 + deltaRow;
          newCol2 = col2 + deltaCol;
        }

        return `R${newRow1}C${newCol1}:R${newRow2}C${newCol2}`;
      } else {
        // Single cell reference
        if (
          this.isCellInRange(
            row1,
            col1,
            move.fromStartRow,
            move.fromStartCol,
            move.fromEndRow,
            move.fromEndCol
          )
        ) {
          const deltaRow = move.toStartRow - move.fromStartRow;
          const deltaCol = move.toStartCol - move.fromStartCol;
          return `R${row1 + deltaRow}C${col1 + deltaCol}`;
        }
        return match; // No change needed
      }
    });
  }

  /**
   * Checks if a cell is within a given range
   */
  private isCellInRange(
    row: number,
    col: number,
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): boolean {
    return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
  }
}
