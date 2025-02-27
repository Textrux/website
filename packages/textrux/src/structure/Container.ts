import Cell from "./Cell";

/**
 * A Container is basically the bounding rectangle around
 * some collection of filled cells, plus an array of those cells.
 */
export default class Container {
  topRow: number;
  leftColumn: number;
  bottomRow: number;
  rightColumn: number;
  filledCells: Cell[];

  constructor(top: number, left: number, bottom: number, right: number) {
    this.topRow = top;
    this.leftColumn = left;
    this.bottomRow = bottom;
    this.rightColumn = right;
    this.filledCells = [];
  }

  expandOutlineBy(
    expand: number,
    rowCount: number,
    colCount: number
  ): Container {
    return new Container(
      Math.max(1, this.topRow - expand),
      Math.max(1, this.leftColumn - expand),
      Math.min(rowCount, this.bottomRow + expand),
      Math.min(colCount, this.rightColumn + expand)
    );
  }

  overlaps(other: Container): boolean {
    return !(
      this.topRow > other.bottomRow ||
      other.topRow > this.bottomRow ||
      this.leftColumn > other.rightColumn ||
      other.leftColumn > this.rightColumn
    );
  }

  mergeWith(other: Container): void {
    this.topRow = Math.min(this.topRow, other.topRow);
    this.bottomRow = Math.max(this.bottomRow, other.bottomRow);
    this.leftColumn = Math.min(this.leftColumn, other.leftColumn);
    this.rightColumn = Math.max(this.rightColumn, other.rightColumn);
    this.filledCells.push(...other.filledCells);
  }

  static fromCell(pt: Cell): Container {
    const c = new Container(pt.row, pt.col, pt.row, pt.col);
    c.filledCells.push(pt);
    return c;
  }
}
