/**
 * A Container is basically the bounding rectangle around
 * some collection of *filled* points (row,col).
 */
export default class Container {
  topRow: number;
  leftColumn: number;
  bottomRow: number;
  rightColumn: number;

  filledPoints: Array<{ row: number; col: number }>;

  constructor(top: number, left: number, bottom: number, right: number) {
    this.topRow = top;
    this.leftColumn = left;
    this.bottomRow = bottom;
    this.rightColumn = right;
    this.filledPoints = [];
  }

  expandOutlineBy(
    expand: number,
    rowCount: number,
    colCount: number
  ): Container {
    const top = Math.max(1, this.topRow - expand);
    const left = Math.max(1, this.leftColumn - expand);
    const bottom = Math.min(rowCount, this.bottomRow + expand);
    const right = Math.min(colCount, this.rightColumn + expand);
    const c = new Container(top, left, bottom, right);
    c.filledPoints = [...this.filledPoints];
    return c;
  }

  overlaps(other: Container): boolean {
    return !(
      this.topRow > other.bottomRow ||
      other.topRow > this.bottomRow ||
      this.leftColumn > other.rightColumn ||
      other.leftColumn > this.rightColumn
    );
  }
}
