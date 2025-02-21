import { Point } from "../structure";
import Container from "../structure/Container";

export default class GridHelper {
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
    return Array.from(new Set(outline.map(JSON.stringify)), JSON.parse);
  }

  static deduplicatePoints(arr: Point[]): Point[] {
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

  static dedupe(arr: Point[]) {
    const seen = new Set<string>();
    const out: Point[] = [];
    for (const p of arr) {
      const k = p.row + "," + p.col;
      if (!seen.has(k)) {
        seen.add(k);
        out.push(p);
      }
    }
    return out;
  }

  static overlaps(a: Point[], b: Point[]): boolean {
    const setB = new Set(b.map((p) => `${p.row},${p.col}`));
    return a.some((p) => setB.has(`${p.row},${p.col}`));
  }
}
