import Block from "../layers/3-foundation/block/Block";

// A simple interface for anything with row/col:
export interface Point {
  row: number;
  col: number;
}

export default class GridHelper {
  /**
   * Return a ring of points (row,col) around a rectangle, expanded by N.
   */
  static getOutlineCells(
    top: number,
    bottom: number,
    left: number,
    right: number,
    expandBy: number
  ): Point[] {
    const outline: Point[] = [];
    for (let c = left - expandBy; c <= right + expandBy; c++) {
      outline.push({ row: top - expandBy, col: c });
      outline.push({ row: bottom + expandBy, col: c });
    }
    for (let r = top - expandBy; r <= bottom + expandBy; r++) {
      outline.push({ row: r, col: left - expandBy });
      outline.push({ row: r, col: right + expandBy });
    }
    // deduplicate by string key
    return Array.from(new Set(outline.map((p) => `${p.row},${p.col}`))).map(
      (str) => {
        const [r, c] = str.split(",");
        return { row: +r, col: +c };
      }
    );
  }

  /**
   * Deduplicate an array of Point (row/col) or any object that has row/col.
   */
  static deduplicatePoints<T extends Point>(arr: T[]): T[] {
    const used = new Set<string>();
    return arr.filter((p) => {
      const key = `${p.row},${p.col}`;
      if (!used.has(key)) {
        used.add(key);
        return true;
      }
      return false;
    });
  }

  /**
   * Quick overlaps check: does any row,col in `a` also appear in `b`?
   */
  static overlaps(a: Point[], b: Point[]): boolean {
    const setB = new Set(b.map((p) => `${p.row},${p.col}`));
    return a.some((p) => setB.has(`${p.row},${p.col}`));
  }
}

/**
 * Scroll the container so that (topRow, leftCol) becomes the top-left in view.
 */
export function scrollToCell(
  topRow: number,
  leftCol: number,
  rowHeights: number[],
  colWidths: number[],
  container: HTMLDivElement | null
) {
  if (!container) return;

  let scrollTop = 0;
  for (let r = 0; r < topRow - 1; r++) {
    scrollTop += rowHeights[r] || 0;
  }
  let scrollLeft = 0;
  for (let c = 0; c < leftCol - 1; c++) {
    scrollLeft += colWidths[c] || 0;
  }
  container.scrollTop = scrollTop;
  container.scrollLeft = scrollLeft;
}
/**
 * Auto-scroll the grid container so that the (row,col) cell is visible.
 */
export function scrollCellIntoView(
  row: number,
  col: number,
  rowHeights: number[],
  colWidths: number[],
  container: HTMLDivElement | null
) {
  if (!container) return;

  // The top of row r is sum of rowHeights up to r-1:
  const top = rowHeights.slice(0, row - 1).reduce((a, b) => a + b, 0);
  const cellHeight = rowHeights[row - 1] || 0;

  const left = colWidths.slice(0, col - 1).reduce((a, b) => a + b, 0);
  const cellWidth = colWidths[col - 1] || 0;

  // vertical
  if (top < container.scrollTop) {
    container.scrollTop = Math.max(0, top - 2);
  } else if (top + cellHeight > container.scrollTop + container.clientHeight) {
    container.scrollTop = top + cellHeight - container.clientHeight + 2;
  }

  // horizontal
  if (left < container.scrollLeft) {
    container.scrollLeft = Math.max(0, left - 2);
  } else if (left + cellWidth > container.scrollLeft + container.clientWidth) {
    container.scrollLeft = left + cellWidth - container.clientWidth + 2;
  }
}
/**
 * A helper to check if (r, c) is "inside" a block's canvas
 * — i.e. within bounding box but not in the frame/border.
 */
export function isCellInBlockCanvas(
  b: Block,
  row: number,
  col: number
): boolean {
  if (row < b.topRow || row > b.bottomRow) return false;
  if (col < b.leftCol || col > b.rightCol) return false;

  // Exclude border or frame cells if you only want the "filled" region
  const isBorder = b.borderPoints.some(
    (pt) => pt.row === row && pt.col === col
  );
  const isFrame = b.framePoints.some((pt) => pt.row === row && pt.col === col);

  return !isBorder && !isFrame;
}
export function findFirstRowInView(scrollTop: number, heights: number[]) {
  let cum = 0;
  for (let i = 0; i < heights.length; i++) {
    if (scrollTop < cum + heights[i]) {
      return i + 1;
    }
    cum += heights[i];
  }
  return heights.length;
}
export function findLastRowInView(bottom: number, heights: number[]) {
  let cum = 0;
  let last = 1;
  for (let i = 0; i < heights.length; i++) {
    if (cum > bottom) break;
    last = i + 1;
    cum += heights[i];
  }
  return last;
}
