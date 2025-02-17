// GridModel.ts
export interface CellFormat {
  backgroundColor?: string;
  color?: string;
  fontWeight?: "normal" | "bold";
  // ... add any other formatting properties you like
}

/**
 * The main grid model with formula support, undo/redo,
 * and optional per-cell formatting.
 */
export class GridModel {
  private data: string[][]; // Evaluated values
  private formulas: Record<string, string>; // e.g. { "R4C8": "=R9C4+R4C3" }
  private history: string[][][];
  private future: string[][][];

  private formats: Record<string, CellFormat>; // Track cell formatting by "R{row}C{col}"

  constructor(public rows: number = 1000, public cols: number = 50) {
    this.data = Array.from({ length: rows }, () => Array(cols).fill(""));
    this.formulas = {};
    this.history = [];
    this.future = [];
    this.formats = {}; // empty initially
  }

  /** Return the displayed value of a cell (after formula evaluation) */
  getCellValue(row: number, col: number): string {
    if (row < 1 || col < 1 || row > this.rows || col > this.cols) return "";
    return this.data[row - 1][col - 1] || "";
  }

  /** Return the raw input of a cell. If it's a formula, returns the "='...'" string. Otherwise the literal. */
  getCellRaw(row: number, col: number): string {
    const key = `R${row}C${col}`;
    if (this.formulas[key]) {
      return this.formulas[key];
    }
    // otherwise just the data
    return this.getCellValue(row, col);
  }

  /** Set the cell's content. If it starts with '=', treat as formula. Evaluate it. */
  setCell(row: number, col: number, value: string): void {
    const key = `R${row}C${col}`;
    // Save current state for undo
    this.saveStateToHistory();

    if (value.startsWith("=")) {
      // It's a formula
      this.formulas[key] = value;
      this.data[row - 1][col - 1] = this.evaluateFormula(value);
    } else {
      // It's a direct value
      delete this.formulas[key];
      this.data[row - 1][col - 1] = value;
    }
    // Clear the future (no redo after new changes)
    this.future = [];
  }

  /** Evaluate a formula string, e.g. "=R9C4+R4C3". Returns the evaluated result or "ERROR". */
  evaluateFormula(formula: string): string {
    try {
      let expr = formula.slice(1); // remove leading '='
      // Replace references like R9C4 with the cell's value or '0'
      expr = expr.replace(/R(\d+)C(\d+)/g, (_m, r, c) => {
        const val = this.getCellValue(Number(r), Number(c));
        // If blank, treat as "0"
        return val || "0";
      });
      // Evaluate
      // We can do a quick parse with JS eval.
      // For safety you'd want a safer evaluator, but let's keep it simple.
      const result = eval(expr);
      return String(result);
    } catch {
      return "ERROR";
    }
  }

  /** Undo the last change. */
  undo(): void {
    if (this.history.length === 0) return;
    // push current state to future
    this.future.push(this.cloneData(this.data));
    // pop from history => data
    this.data = this.history.pop()!;
  }

  /** Redo */
  redo(): void {
    if (this.future.length === 0) return;
    this.history.push(this.cloneData(this.data));
    this.data = this.future.pop()!;
  }

  /** Get the formatting for a cell. If none, returns {} */
  getCellFormat(row: number, col: number): CellFormat {
    const key = `R${row}C${col}`;
    return this.formats[key] || {};
  }

  /** Set the formatting for a cell. Merges with existing. */
  setCellFormat(row: number, col: number, format: CellFormat): void {
    const key = `R${row}C${col}`;
    // In production, you'd also track these changes for undo.
    // We'll keep it simple. You can call `saveStateToHistory()` if desired.
    const old = this.formats[key] || {};
    this.formats[key] = { ...old, ...format };
  }

  private saveStateToHistory(): void {
    // clone data
    this.history.push(this.cloneData(this.data));
  }

  private cloneData(data: string[][]): string[][] {
    return data.map((row) => [...row]);
  }
}
