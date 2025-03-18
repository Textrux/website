import BlockCluster from "../structure/BlockCluster";
import { CellFormat } from "../structure/CellFormat";
import { Parser } from "expr-eval";

export default class GridModel {
  public name: string;
  public id: string;
  public index: number;

  public gridType: "base" | "embedded" | "elevated";

  public sourceGrid: GridModel | null;

  public grids: GridModel[];

  public blockClusters: BlockCluster[];

  public patterns: any;
  public templates: any;
  public representations: any;

  /**
   * The total number of rows/columns physically in this grid.
   */
  public rowCount: number;
  public columnCount: number;

  /**
   * The current zoom level (for the UI).
   */
  public zoomLevel: number;

  /**
   * CSV or TSV delimiter preference. ("tab" or ",")
   */
  public delimiter: "tab" | ",";

  /**
   * Which cell is currently selected.
   */
  public selectedCell: { row: number; col: number };

  /**
   * Which cell is at the top-left of the visible scroll region (if known).
   * This helps restore scrolling position.
   */
  public topLeftCell: { row: number; col: number };

  // A simple flag for whether we’re batching changes:
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

  constructor(rowCount = 1000, columnCount = 1000, index = 0) {
    if (!Number.isFinite(index)) {
      index = 0;
    }
    this.index = index;
    this.name = `Grid ${index}`;
    this.id = crypto.randomUUID();

    this.rowCount = rowCount;
    this.columnCount = columnCount;

    // Default them to some values:
    this.zoomLevel = 1.0;
    this.delimiter = "tab";
    this.selectedCell = { row: 1, col: 1 };
    this.topLeftCell = { row: 1, col: 1 };

    this.contentsMap = {};
    this.formatsMap = {};
    this.formulas = {};
    this.history = [];
    this.future = [];
  }

  /** Export *all* relevant grid state as a single object. */
  public toJSONState() {
    return {
      id: this.id,
      name: this.name,
      index: this.index,
      rowCount: this.rowCount,
      columnCount: this.columnCount,
      zoomLevel: this.zoomLevel,
      delimiter: this.delimiter,
      selectedCell: { ...this.selectedCell },
      topLeftCell: { ...this.topLeftCell },
      // Stash all non-empty cells:
      cells: this.getFilledCells(),
    };
  }

  /**
   * Load *all* grid state from an object that was
   * previously produced by `toJSONState()`.
   */
  public loadFromJSONState(state: any) {
    // Name and index
    if (typeof state.name === "string") {
      this.name = state.name;
    }
    if (typeof state.index === "number") {
      this.index = state.index;
    }

    // Row & column counts
    if (typeof state.rowCount === "number") {
      this.resizeRows(state.rowCount);
    }
    if (typeof state.columnCount === "number") {
      this.resizeCols(state.columnCount);
    }

    // Zoom level
    if (typeof state.zoomLevel === "number") {
      this.zoomLevel = state.zoomLevel;
    }

    // Delimiter
    if (state.delimiter === "tab" || state.delimiter === ",") {
      this.delimiter = state.delimiter;
    }

    // Selected cell
    if (
      state.selectedCell &&
      typeof state.selectedCell.row === "number" &&
      typeof state.selectedCell.col === "number"
    ) {
      this.selectedCell = {
        row: state.selectedCell.row,
        col: state.selectedCell.col,
      };
    }

    // Top-left scroll cell
    if (
      state.topLeftCell &&
      typeof state.topLeftCell.row === "number" &&
      typeof state.topLeftCell.col === "number"
    ) {
      this.topLeftCell = {
        row: state.topLeftCell.row,
        col: state.topLeftCell.col,
      };
    }

    // Clear existing cells
    this.contentsMap = {};
    this.formulas = {};

    // Refill from 'cells' array
    if (Array.isArray(state.cells)) {
      for (const cell of state.cells) {
        if (
          cell &&
          typeof cell.row === "number" &&
          typeof cell.col === "number" &&
          typeof cell.value === "string"
        ) {
          this.setCellRaw(cell.row, cell.col, cell.value, true);
        }
      }
    }
  }

  /** Get the raw user-typed text of a cell or return an empty string if none exists. */
  getCellRaw(row: number, col: number): string {
    if (row < 1 || col < 1 || row > this.rowCount || col > this.columnCount)
      return "";
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

  /**
   * Set the raw text of a cell, updating maps accordingly.
   * skipUndo = true means we do NOT push an undo state.
   */
  public setCellRaw(
    row: number,
    col: number,
    rawText: string,
    skipUndo: boolean = false
  ): void {
    // If we're trying to write to R1C1 while it's ^-locked, do nothing
    if (row === 1 && col === 1) {
      const existing = this.getCellRaw(1, 1);
      if (existing.trim().startsWith("^")) {
        return;
      }
    }

    if (row < 1 || col < 1 || row > this.rowCount || col > this.columnCount)
      return;

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
   * Supports typical math plus SUM(R1C1:R3C1) style references.
   */
  evaluateFormula(formula: string): string {
    try {
      if (!formula.startsWith("=")) return formula;
      let expr = formula.slice(1).trim();
      const parser = new Parser();

      // Replace boolean values TRUE/FALSE with 1/0
      expr = expr.replace(/\bTRUE\b/gi, "1").replace(/\bFALSE\b/gi, "0");

      // Replace cell references R#C# with actual values
      expr = expr.replace(/R(\d+)C(\d+)/gi, (_m, r, c) => {
        const val = this.getCellValue(Number(r), Number(c)).trim();
        return val === "" ? "0" : JSON.stringify(val);
      });

      // Handle SUM(R1C1:R3C1) or similar
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

      return String(parser.evaluate(expr));
    } catch {
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
    this.rowCount = newRowCount;
  }

  /** Resize the number of columns while keeping existing data intact. */
  resizeCols(newColCount: number) {
    if (newColCount < 1) return;
    this.columnCount = newColCount;
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
    if (!this.inTransaction) {
      this.saveStateToHistory();
      this.future = [];
    }
    this.inTransaction = true;
  }

  /** End the transaction, so future changes store separate undo states. */
  public endTransaction(): void {
    this.inTransaction = false;
  }

  /**
   * Clear the entire grid (all cell contents, formats, and formulas).
   * Optionally skipping the undo/redo history.
   */
  public clearAllCells(skipUndo: boolean = false): void {
    // If we are not already in a transaction and not explicitly asked
    // to skip undo, record the current state so we can undo this clear.
    if (!this.inTransaction && !skipUndo) {
      this.saveStateToHistory();
      this.future = [];
    }
    this.contentsMap = {};
    this.formulas = {};
    this.formatsMap = {};
  }
}
