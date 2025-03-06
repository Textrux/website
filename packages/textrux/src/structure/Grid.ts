import { CellFormat } from "./CellFormat";
import { Parser } from "expr-eval";

export class Grid {
  public id: string;

  public gridType: "base" | "embedded" | "elevated";

  public sourceGrid: Grid | null;

  public grids: Grid[];

  public structures: any;

  public patterns: any;

  public templates: any;

  public representations: any;

  /** The nominal row/col count for the “size” of the sheet. */
  public rows: number;
  public cols: number;

  // Add a simple flag to track whether we’re batching changes:
  private inTransaction = false;

  /**
   * Sparse map of contents. Key = "R#,C#".
   * Values = raw text (could be a formula like "=R2C3+R4C5" or plain text).
   */
  private contentsMap: Record<string, string>;

  /**
   * Sparse map of formatting. Key = "R#,C#".
   * Values = a CellFormat object only if that cell has custom formatting.
   */
  private formatsMap: Record<string, CellFormat>;

  /**
   * Stores formulas separately for quick lookup.
   */
  private formulas: Record<string, string>;

  /**
   * History/future stacks for undo/redo.
   * Each entry stores snapshots of contentsMap, formatsMap, and formulas.
   */
  private history: Array<{
    contentsMap: Record<string, string>;
    formatsMap: Record<string, CellFormat>;
    formulas: Record<string, string>;
  }>;
  private future: Array<{
    contentsMap: Record<string, string>;
    formatsMap: Record<string, CellFormat>;
    formulas: Record<string, string>;
  }>;

  constructor(rows = 1000, cols = 1000) {
    this.id = crypto.randomUUID();
    this.rows = rows;
    this.cols = cols;
    this.contentsMap = {};
    this.formatsMap = {};
    this.formulas = {};
    this.history = [];
    this.future = [];
  }

  /** Get the raw user-typed text of a cell or return an empty string if none exists. */
  getCellRaw(row: number, col: number): string {
    if (row < 1 || col < 1 || row > this.rows || col > this.cols) return "";
    const key = `R${row}C${col}`;
    return this.contentsMap[key] ?? "";
  }

  /** Get the displayed value of a cell, evaluating formulas if necessary. */
  getCellValue(row: number, col: number): string {
    const raw = this.getCellRaw(row, col);
    return raw.startsWith("=") && raw.length > 1
      ? this.evaluateFormula(raw)
      : raw;
  }

  /** Set the raw text of a cell, updating maps accordingly. */ /**
   * Modified setCellRaw to skip saveStateToHistory()
   * if we are inside a transaction.
   */
  public setCellRaw(
    row: number,
    col: number,
    rawText: string,
    skipUndo: boolean = false
  ): void {
    if (row < 1 || col < 1 || row > this.rows || col > this.cols) return;

    // Only record a separate undo state if:
    //  - we're NOT in a transaction
    //  - and we're NOT told to skip explicitly
    if (!this.inTransaction && !skipUndo) {
      this.saveStateToHistory();
      this.future = [];
    }

    const key = `R${row}C${col}`;
    rawText = rawText.trimEnd();

    if (rawText === "") {
      delete this.contentsMap[key];
      delete this.formulas[key];
    } else {
      this.contentsMap[key] = rawText;
      if (rawText.startsWith("=")) {
        this.formulas[key] = rawText;
      } else {
        delete this.formulas[key];
      }
    }
  }

  /**
   * Evaluate a formula string safely using expr-eval.
   * Supports mathematical operations, string concatenation, booleans, and SUM() for ranges.
   */
  evaluateFormula(formula: string): string {
    try {
      if (!formula.startsWith("=")) return formula; // Not a formula, return raw text

      let expr = formula.slice(1).trim(); // Remove '=' and trim spaces
      const parser = new Parser();

      // Replace boolean values TRUE/FALSE with 1/0
      expr = expr.replace(/\bTRUE\b/gi, "1").replace(/\bFALSE\b/gi, "0");

      // Replace cell references R#C# with actual values
      expr = expr.replace(/R(\d+)C(\d+)/gi, (_m, r, c) => {
        const val = this.getCellValue(Number(r), Number(c)).trim();
        return val === "" ? "0" : JSON.stringify(val); // Ensure proper handling of strings
      });

      // Handle SUM(R1C1:R3C1) or similar range-based functions
      expr = expr.replace(
        /SUM\(\s*(R\d+C\d+:\s*R\d+C\d+)\s*\)/gi,
        (_m, range) => {
          const [start, end] = range.split(":").map((cell) => {
            const match = cell.match(/R(\d+)C(\d+)/i);
            return match
              ? { row: Number(match[1]), col: Number(match[2]) }
              : null;
          });

          if (!start || !end) return "0";

          let sum = 0;
          for (let r = start.row; r <= end.row; r++) {
            sum += Number(this.getCellValue(r, start.col)) || 0;
          }
          return sum.toString();
        }
      );

      // Replace '&' with '+' for string concatenation
      expr = expr.replace(/&/g, "+");

      // Evaluate the expression safely
      return String(parser.evaluate(expr));
    } catch (err) {
      return "ERROR";
    }
  }

  /** Retrieve a cell's formatting, returning a default if none exists. */
  getCellFormat(row: number, col: number): CellFormat {
    return this.formatsMap[`R${row}C${col}`] || new CellFormat();
  }

  /** Merge a new format into an existing cell format or create one if missing. */
  setCellFormat(row: number, col: number, format: Partial<CellFormat>): void {
    const key = `R${row}C${col}`;
    this.formatsMap[key] = { ...this.getCellFormat(row, col), ...format };
  }

  /** Save the current state for undo functionality. */
  private saveStateToHistory() {
    this.history.push({
      contentsMap: { ...this.contentsMap },
      formatsMap: { ...this.formatsMap },
      formulas: { ...this.formulas },
    });
  }

  /** Undo the last action, restoring the previous state. */
  undo() {
    if (this.history.length === 0) return;
    this.future.push({
      contentsMap: { ...this.contentsMap },
      formatsMap: { ...this.formatsMap },
      formulas: { ...this.formulas },
    });
    Object.assign(this, this.history.pop());
  }

  /** Redo the last undone action, restoring the next state. */
  redo() {
    if (this.future.length === 0) return;
    this.history.push({
      contentsMap: { ...this.contentsMap },
      formatsMap: { ...this.formatsMap },
      formulas: { ...this.formulas },
    });
    Object.assign(this, this.future.pop());
  }

  /** Resize the number of rows while keeping existing data intact. */
  resizeRows(newRowCount: number) {
    if (newRowCount < 1) return;
    this.rows = newRowCount;
  }

  /** Resize the number of columns while keeping existing data intact. */
  resizeCols(newColCount: number) {
    if (newColCount < 1) return;
    this.cols = newColCount;
  }

  /** Get all filled cells in the grid. */
  public getFilledCells(): Array<{ row: number; col: number; value: string }> {
    return Object.entries(this.contentsMap)
      .map(([key, value]) => {
        const match = key.match(/^R(\d+)C(\d+)$/);
        if (!match) return null;
        return {
          row: parseInt(match[1], 10),
          col: parseInt(match[2], 10),
          value,
        };
      })
      .filter(Boolean) as Array<{ row: number; col: number; value: string }>;
  }

  /**
   * Begin a “transaction” so that multiple cell changes
   * become a single undo step.
   */
  public beginTransaction(): void {
    // If we are not already in a transaction, record
    // the current state so that UNDO will bring us back here:
    if (!this.inTransaction) {
      this.saveStateToHistory();
      // Clearing future ensures we can redo from here
      this.future = [];
    }
    this.inTransaction = true;
  }

  /**
   * End the transaction, so future changes again
   * store individual undo states unless we start
   * another transaction.
   */
  public endTransaction(): void {
    this.inTransaction = false;
  }

  /**
   * Clear the entire grid (all cell contents, formats, and formulas),
   * optionally skipping the undo/redo history.
   */
  public clearAllCells(skipUndo: boolean = false): void {
    // If we are not already in a transaction and not explicitly asked
    // to skip undo, record the current state so we can undo this clear.
    if (!this.inTransaction && !skipUndo) {
      this.saveStateToHistory();
      this.future = [];
    }

    // Wipe out all cell contents, formulas, and formats:
    this.contentsMap = {};
    this.formulas = {};
    this.formatsMap = {};

    // (We do NOT reset .rows or .cols — this only removes data, not resize.)
  }
}
