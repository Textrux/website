import GridHelper from "../util/GridHelper";
import Block from "./Block";
import { CellFormat } from "../style/CellFormat";

/**
 * A BlockJoin represents the "link" or "lock" overlap between two Blocks.
 */
export default class BlockJoin {
  blocks: [Block, Block];
  type: "linked" | "locked";

  /** The points of overlap that produce the "linked" region. */
  linkedPoints: Array<{ row: number; col: number }>;

  /** The points of overlap that produce the "locked" region. */
  lockedPoints: Array<{ row: number; col: number }>;

  /** Formatting for linked cells in this join */
  linkedFormat: CellFormat;

  /** Formatting for locked cells in this join */
  lockedFormat: CellFormat;

  constructor(
    blockA: Block,
    blockB: Block,
    linkedPoints: Array<{ row: number; col: number }>,
    lockedPoints: Array<{ row: number; col: number }>
  ) {
    this.blocks = [blockA, blockB];
    this.linkedPoints = linkedPoints;
    this.lockedPoints = lockedPoints;
    this.type = lockedPoints.length > 0 ? "locked" : "linked";

    // Initialize with default formats
    this.linkedFormat = CellFormat.fromCssClass("linked-cell");
    this.lockedFormat = CellFormat.fromCssClass("locked-cell");
  }

  /**
   * Set custom formatting for this join's cells
   */
  setCustomFormatting(linkedFormat?: CellFormat, lockedFormat?: CellFormat) {
    if (linkedFormat) this.linkedFormat = linkedFormat;
    if (lockedFormat) this.lockedFormat = lockedFormat;
  }

  /**
   * Utility to find the intersection (row,col) points between two arrays.
   */
  static intersectPoints(
    a: Array<{ row: number; col: number }>,
    b: Array<{ row: number; col: number }>
  ): Array<{ row: number; col: number }> {
    const setB = new Set(b.map((pt) => `${pt.row},${pt.col}`));
    return a.filter((pt) => setB.has(`${pt.row},${pt.col}`));
  }

  static deduplicatePoints(
    points: Array<{ row: number; col: number }>
  ): Array<{ row: number; col: number }> {
    const set = new Set<string>();
    const out: Array<{ row: number; col: number }> = [];
    for (const p of points) {
      const k = `${p.row},${p.col}`;
      if (!set.has(k)) {
        set.add(k);
        out.push(p);
      }
    }
    return out;
  }

  static populateBlockJoins(blockList: Block[]): BlockJoin[] {
    const result: BlockJoin[] = [];

    for (let i = 0; i < blockList.length; i++) {
      for (let j = i + 1; j < blockList.length; j++) {
        const b1 = blockList[i];
        const b2 = blockList[j];

        // First do a quick check if there's ANY overlap
        const framesOverlap = GridHelper.overlaps(
          b1.framePoints,
          b2.framePoints
        );
        const borderFrameOverlap =
          GridHelper.overlaps(b1.borderPoints, b2.framePoints) ||
          GridHelper.overlaps(b1.framePoints, b2.borderPoints);

        if (!framesOverlap && !borderFrameOverlap) {
          continue;
        }

        // Now compute *which* cells actually overlap:
        const ff = BlockJoin.intersectPoints(b1.framePoints, b2.framePoints);
        const bfAB = BlockJoin.intersectPoints(b1.borderPoints, b2.framePoints);
        const bfBA = BlockJoin.intersectPoints(b1.framePoints, b2.borderPoints);

        const linked = ff;
        const locked = BlockJoin.deduplicatePoints([...bfAB, ...bfBA]);

        // whichever approach you prefer
        // e.g. if locked.length > 0 => "locked"; else => "linked".
        const join = new BlockJoin(b1, b2, linked, locked);
        result.push(join);
      }
    }

    return result;
  }
}
