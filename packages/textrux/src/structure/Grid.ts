import { CellFormat } from "./CellFormat";

export class Grid {
  /** The nominal row/col count for the “size” of the sheet. */
  public rows: number;
  public cols: number;

  /**
   * Sparse map of contents. Key = "r,c".
   * Values = the raw text (could be formula like "=R2C3+R4C5" or plain text).
   */
  private contentsMap: Record<string, string>;

  /**
   * Sparse map of formatting. Key = "r,c".
   * Values = a CellFormat object only if that cell has custom formatting.
   */
  private formatsMap: Record<string, CellFormat>;

  /**
   * If you want to store formulas separately for quick lookup:
   */
  private formulas: Record<string, string>;

  /**
   * History/future stacks for undo/redo. Each entry is a
   * “snapshot” of contentsMap + formatsMap + formulas (for simplicity).
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

  constructor(rows = 1000, cols = 50) {
    this.rows = rows;
    this.cols = cols;

    this.contentsMap = {};
    this.formatsMap = {};
    this.formulas = {};

    this.history = [];
    this.future = [];
  }

  /**
   * Get the cell’s “raw” user-typed text, or "" if none.
   */
  getCellRaw(row: number, col: number): string {
    if (row < 1 || col < 1 || row > this.rows || col > this.cols) return "";
    const key = `R${row}C${col}`;
    return this.contentsMap[key] ?? "";
  }

  /**
   * Returns the “displayed” text. If there's a formula, we might evaluate it.
   * For speed, we skip any big overhead. In a real app, you might cache it.
   */
  getCellValue(row: number, col: number): string {
    const raw = this.getCellRaw(row, col);
    // if it's a formula
    if (raw.startsWith("=")) {
      // optionally retrieve from this.formulas or we just evaluate on the fly:
      return this.evaluateFormula(raw);
    }
    return raw;
  }

  /**
   * Set the raw text of a cell. If `rawText` is empty, remove from the map (sparse).
   */
  setCellRaw(row: number, col: number, rawText: string): void {
    if (row < 1 || col < 1 || row > this.rows || col > this.cols) {
      return; // out of range
    }
    // Save old state to history for undo:
    this.saveStateToHistory();

    const key = `R${row}C${col}`;
    rawText = rawText.trimEnd(); // optional: or keep trailing spaces

    if (rawText === "") {
      // remove
      delete this.contentsMap[key];
      delete this.formulas[key];
    } else {
      this.contentsMap[key] = rawText;
      // If it starts with '=' => store in formulas
      if (rawText.startsWith("=")) {
        this.formulas[key] = rawText;
      } else {
        delete this.formulas[key];
      }
    }

    // Clear the future (no redo after new changes)
    this.future = [];
  }

  /**
   * Evaluate a formula string, e.g. "=R9C4+R4C3". Very simplistic.
   */
  evaluateFormula(formula: string): string {
    try {
      let expr = formula.slice(1); // remove '='
      // Replace references R#C# with their “value” or 0.
      expr = expr.replace(/R(\d+)C(\d+)/g, (_m, r, c) => {
        const val = this.getCellValue(Number(r), Number(c));
        return val.trim() === "" ? "0" : val;
      });
      const result = eval(expr);
      return String(result);
    } catch (err) {
      return "ERROR";
    }
  }

  /**
   * Get a (possibly) existing CellFormat object. If none, return a default.
   */
  getCellFormat(row: number, col: number): CellFormat {
    const key = `R${row}C${col}`;
    if (!this.formatsMap[key]) {
      return new CellFormat();
    }
    return this.formatsMap[key];
  }

  /**
   * Merge the given format partial into the existing format object,
   * or create a new one if none was set yet.
   */
  setCellFormat(row: number, col: number, format: Partial<CellFormat>): void {
    const key = `R${row}C${col}`;
    let existing = this.formatsMap[key];
    if (!existing) {
      existing = new CellFormat();
    }
    const merged = { ...existing, ...format };
    this.formatsMap[key] = merged;
  }

  /** For undo/redo, we do a shallow clone of all 3 main maps. */
  private saveStateToHistory() {
    this.history.push({
      contentsMap: { ...this.contentsMap },
      formatsMap: { ...this.formatsMap },
      formulas: { ...this.formulas },
    });
  }

  undo() {
    if (this.history.length === 0) return;
    // push current to future
    this.future.push({
      contentsMap: { ...this.contentsMap },
      formatsMap: { ...this.formatsMap },
      formulas: { ...this.formulas },
    });
    const prev = this.history.pop()!;
    this.contentsMap = prev.contentsMap;
    this.formatsMap = prev.formatsMap;
    this.formulas = prev.formulas;
  }

  redo() {
    if (this.future.length === 0) return;
    this.history.push({
      contentsMap: { ...this.contentsMap },
      formatsMap: { ...this.formatsMap },
      formulas: { ...this.formulas },
    });
    const next = this.future.pop()!;
    this.contentsMap = next.contentsMap;
    this.formatsMap = next.formatsMap;
    this.formulas = next.formulas;
  }

  /**
   * Resize row logic. (Nominal only—no giant array to expand.)
   */
  resizeRows(newRowCount: number) {
    if (newRowCount < 1) return;
    this.rows = newRowCount;
  }

  resizeCols(newColCount: number) {
    if (newColCount < 1) return;
    this.cols = newColCount;
  }

  // In Grid.ts
  public getFilledCells(): Array<{ row: number; col: number; value: string }> {
    const filled: Array<{ row: number; col: number; value: string }> = [];
    for (const key of Object.keys(this.contentsMap)) {
      // key looks like "R10C5"
      const match = key.match(/^R(\d+)C(\d+)$/);
      if (!match) continue;

      const row = parseInt(match[1], 10);
      const col = parseInt(match[2], 10);
      const value = this.contentsMap[key];

      filled.push({ row, col, value });
    }
    return filled;
  }
}
