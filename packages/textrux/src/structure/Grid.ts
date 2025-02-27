import Cell from "./Cell";
import { CellFormat } from "./CellFormat";

export class Grid {
  private data: Cell[][]; // 2D array of Cell objects

  // (Optional) a map from "R{row}C{col}" -> formula, if we prefer.
  // Or we can store formula inside Cell.contents
  private formulas: Record<string, string>;

  private history: Cell[][][];
  private future: Cell[][][];

  /** Number of rows and columns in the grid. */
  public rows: number;
  public cols: number;

  constructor(rows = 1000, cols = 50) {
    this.rows = rows;
    this.cols = cols;

    // Build the 2D array of Cells:
    this.data = [];
    for (let r = 1; r <= rows; r++) {
      const rowArr: Cell[] = [];
      for (let c = 1; c <= cols; c++) {
        rowArr.push(new Cell(r, c, "")); // blank cell
      }
      this.data.push(rowArr);
    }

    this.formulas = {};
    this.history = [];
    this.future = [];
  }

  /** Return the entire Cell object for reading/editing. */
  getCellObject(row: number, col: number): Cell | null {
    if (row < 1 || col < 1 || row > this.rows || col > this.cols) return null;
    return this.data[row - 1][col - 1];
  }

  /** Return the displayed text: e.g. cell.contents, or cell.resolvesTo if you prefer. */
  getCellValue(row: number, col: number): string {
    const cell = this.getCellObject(row, col);
    if (!cell) return "";
    // For now, we just show the raw text.
    // If we do formula evaluation, we might show cell.resolvesTo if it's non-null.
    return cell.display ? cell.display : cell.contents;
  }

  /** Return the raw input of a cell (the user text).
   * If you want to treat "=` formula`" as special, you can do so here.
   */
  getCellRaw(row: number, col: number): string {
    const cell = this.getCellObject(row, col);
    if (!cell) return "";
    return cell.contents;
  }

  /** Set the cell's raw text. If it starts with '=', treat as formula. Evaluate it. */
  setCellRaw(row: number, col: number, rawText: string): void {
    if (row < 1 || col < 1 || row > this.rows || col > this.cols) {
      return;
    }

    // Save current state for undo:
    this.saveStateToHistory();

    const cell = this.getCellObject(row, col);
    if (!cell) return;

    cell.contents = rawText;
    // If it starts with '=' => formula
    if (rawText.startsWith("=")) {
      const key = `R${row}C${col}`;
      this.formulas[key] = rawText;
      // Evaluate:
      const result = this.evaluateFormula(rawText);
      cell.display = result;
    } else {
      // Not a formula => remove from formulas, set resolvesTo = null or rawText
      const key = `R${row}C${col}`;
      delete this.formulas[key];
      // For now, resolvesTo is just the raw text
      cell.display = rawText;
    }

    // Clear the future (no redo after new changes)
    this.future = [];
  }

  /** Evaluate a formula string, e.g. "=R9C4+R4C3". Returns the result or "ERROR". */
  evaluateFormula(formula: string): string {
    try {
      let expr = formula.slice(1); // remove '='
      expr = expr.replace(/R(\d+)C(\d+)/g, (_m, r, c) => {
        const val = this.getCellValue(Number(r), Number(c));
        return val.trim() === "" ? "0" : val;
      });
      const result = eval(expr);
      return String(result);
    } catch (err) {
      return "ERROR" + err;
    }
  }

  /**
   * Return the cell format object.
   * In the old code, you do:
   *   grid.getCellFormat(r,c).backgroundColor = 'yellow';
   * Or just store all style classes in a separate dictionary – your choice.
   */
  getCellFormat(row: number, col: number): CellFormat {
    const cell = this.getCellObject(row, col);
    if (!cell) return new CellFormat();
    return cell.format;
  }

  /** Merge with existing format. */
  setCellFormat(row: number, col: number, format: Partial<CellFormat>): void {
    const cell = this.getCellObject(row, col);
    if (!cell) return;

    const old = cell.format;
    cell.format = {
      ...old,
      ...format,
    };
  }

  /** For undo: push a deep copy of our entire data. */
  private saveStateToHistory() {
    const cloned = this.cloneData(this.data);
    this.history.push(cloned);
  }

  /** Undo last change. */
  undo() {
    if (this.history.length === 0) return;
    this.future.push(this.cloneData(this.data));
    const prev = this.history.pop()!;
    this.restoreData(prev);
  }

  /** Redo undone change. */
  redo() {
    if (this.future.length === 0) return;
    this.history.push(this.cloneData(this.data));
    const next = this.future.pop()!;
    this.restoreData(next);
  }

  /** Convert this.data into a brand-new array of cloned cells. */
  private cloneData(source: Cell[][]): Cell[][] {
    return source.map((rowArr) => {
      return rowArr.map((cell) => {
        const newCell = new Cell(cell.row, cell.col, cell.contents);
        newCell.display = cell.display;
        // clone the format
        newCell.format = { ...cell.format };
        return newCell;
      });
    });
  }

  private restoreData(from: Cell[][]) {
    // Overwrite each cell in this.data with from’s cell data
    // (We keep the same references for top-level array so row/col lengths remain.)
    for (let r = 0; r < from.length; r++) {
      for (let c = 0; c < from[r].length; c++) {
        const srcCell = from[r][c];
        const destCell = this.data[r][c];
        destCell.contents = srcCell.contents;
        destCell.display = srcCell.display;
        destCell.format = { ...srcCell.format };
      }
    }
  }

  /** Resize row logic */
  resizeRows(newRowCount: number) {
    if (newRowCount <= this.rows) {
      this.rows = newRowCount;
      return;
    }
    const additional = newRowCount - this.rows;
    for (let i = 0; i < additional; i++) {
      const r = this.rows + i + 1;
      const rowArr: Cell[] = [];
      for (let c = 1; c <= this.cols; c++) {
        rowArr.push(new Cell(r, c, ""));
      }
      this.data.push(rowArr);
    }
    this.rows = newRowCount;
  }

  /** Resize col logic */
  resizeCols(newColCount: number) {
    if (newColCount <= this.cols) {
      this.cols = newColCount;
      return;
    }
    const additional = newColCount - this.cols;
    for (let r = 0; r < this.data.length; r++) {
      const row = this.data[r];
      const rowIndex = r + 1;
      for (let i = 0; i < additional; i++) {
        const c = this.cols + i + 1;
        row.push(new Cell(rowIndex, c, ""));
      }
    }
    this.cols = newColCount;
  }
}
