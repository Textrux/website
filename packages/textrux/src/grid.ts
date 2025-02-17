export class Grid {
  private data: string[][];
  private formulas: Record<string, string>;
  private history: string[][][];
  private future: string[][][];

  constructor(public rows: number = 1000, public cols: number = 50) {
    this.data = Array.from({ length: rows }, () => Array(cols).fill(""));
    this.formulas = {};
    this.history = [];
    this.future = [];
  }

  getCell(row: number, col: number): string {
    return this.data[row - 1]?.[col - 1] || "";
  }

  setCell(row: number, col: number, value: string): void {
    const key = `R${row}C${col}`;
    if (value.startsWith("=")) {
      this.formulas[key] = value;
      this.data[row - 1][col - 1] = this.evaluateFormula(value);
    } else {
      delete this.formulas[key];
      this.data[row - 1][col - 1] = value;
    }

    this.history.push(JSON.parse(JSON.stringify(this.data))); // Save for undo
    this.future = []; // Clear redo stack
  }

  evaluateFormula(formula: string): string {
    try {
      let expr = formula.slice(1);
      expr = expr.replace(
        /R(\d+)C(\d+)/g,
        (_, row, col) => this.getCell(Number(row), Number(col)) || "0"
      );
      return eval(expr);
    } catch {
      return "ERROR";
    }
  }

  undo(): void {
    if (this.history.length === 0) return;
    this.future.push(JSON.parse(JSON.stringify(this.data)));
    this.data = this.history.pop()!;
  }

  redo(): void {
    if (this.future.length === 0) return;
    this.history.push(JSON.parse(JSON.stringify(this.data)));
    this.data = this.future.pop()!;
  }
}
