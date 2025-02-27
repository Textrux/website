// We add a minimal "Point" interface so that `Cell` can be passed
import { CellFormat } from "./CellFormat";

// anywhere a row/col "point" is expected (e.g. overlaps/dedupe).
export interface Point {
  row: number;
  col: number;
}

/**
 * A Cell implements Point to unify row/col usage with our
 * geometry-based code (border, frames, overlaps, etc.).
 */
export default class Cell implements Point {
  row: number;
  col: number;

  /** The raw text typed by user. */
  contents: string;

  /** Computed display value (e.g. formula result). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  display: any;

  /** Cell formatting (colors, borders, etc.) */
  format: CellFormat;

  constructor(row: number, col: number, contents = "") {
    this.row = row;
    this.col = col;
    this.contents = contents;
    this.display = null;
    this.format = new CellFormat();
  }
}
