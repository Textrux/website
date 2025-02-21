import { Point } from "./Cell";

export default class Container {
  topRow: number;
  leftColumn: number;
  bottomRow: number;
  rightColumn: number;
  filledPoints: Point[];

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
    this.filledPoints.push(...other.filledPoints);
  }

  static fromPoint(pt: Point): Container {
    let c = new Container(pt.row, pt.col, pt.row, pt.col);
    c.filledPoints.push(pt);
    return c;
  }

  static getContainers(
    filledPoints: Point[],
    expandOutlineBy: number,
    rowCount: number,
    colCount: number
  ): Container[] {
    console.time("Total getContainers Execution Time");

    let containers: Container[] = [];
    const overlappedPoints: Point[] = [];
    const remainingPoints: Point[] = [...filledPoints];

    for (const cell of filledPoints) {
      if (
        overlappedPoints.some((p) => p.row === cell.row && p.col === cell.col)
      ) {
        continue;
      }

      const tempContainer = Container.fromPoint(cell);
      let tempExpanded = tempContainer;
      const allCellsOverlappingThisContainer: Point[] = [];
      let cellsOverlappingThisContainer: Point[] = [];

      do {
        const expanded = tempContainer.expandOutlineBy(
          expandOutlineBy,
          rowCount,
          colCount
        );
        tempExpanded = expanded;

        cellsOverlappingThisContainer = remainingPoints.filter((p) => {
          if (p === cell) return false;
          if (
            allCellsOverlappingThisContainer.some(
              (pp) => pp.row === p.row && pp.col === p.col
            )
          ) {
            return false;
          }
          return expanded.overlaps(Container.fromPoint(p));
        });

        if (cellsOverlappingThisContainer.length > 0) {
          overlappedPoints.push(...cellsOverlappingThisContainer);
          tempContainer.mergeWith(
            Container.fromPoint(cellsOverlappingThisContainer[0])
          );
        }
      } while (cellsOverlappingThisContainer.length > 0);

      let mergedSomething: boolean;
      do {
        mergedSomething = false;
        const overlappedExisting = containers.filter((cc) =>
          tempExpanded.overlaps(cc)
        );

        if (overlappedExisting.length > 0) {
          mergedSomething = true;
          for (const oc of overlappedExisting) {
            containers = containers.filter((xx) => xx !== oc);
            tempContainer.mergeWith(oc);
          }
          tempExpanded = tempContainer.expandOutlineBy(
            expandOutlineBy,
            rowCount,
            colCount
          );
        }
      } while (mergedSomething);

      containers.push(tempContainer);
    }

    containers.sort(
      (a, b) => a.topRow - b.topRow || a.leftColumn - b.leftColumn
    );
    console.timeEnd("Total getContainers Execution Time");
    return containers;
  }
}
