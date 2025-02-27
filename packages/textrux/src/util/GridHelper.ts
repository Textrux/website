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
