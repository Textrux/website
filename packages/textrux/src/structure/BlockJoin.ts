import GridHelper from "../util/GridHelper";
import Block from "./Block";

/**
 * A BlockJoin represents the "link" or "lock" overlap between two Blocks.
 */
export default class BlockJoin {
  blocks: [Block, Block];
  type: "linked" | "locked";

  /** The points of overlap that produce the “linked” region. */
  linkedPoints: Array<{ row: number; col: number }>;

  /** The points of overlap that produce the “locked” region. */
  lockedPoints: Array<{ row: number; col: number }>;

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
  }

  static populateBlockJoins(blockList: Block[]): BlockJoin[] {
    const result: BlockJoin[] = [];

    for (let i = 0; i < blockList.length; i++) {
      for (let j = i + 1; j < blockList.length; j++) {
        const b1 = blockList[i];
        const b2 = blockList[j];

        const framesOverlap = GridHelper.overlaps(
          b1.framePoints,
          b2.framePoints
        );
        const borderFrameOverlap = GridHelper.overlaps(
          b1.borderPoints,
          b2.framePoints
        );

        if (!framesOverlap && !borderFrameOverlap) continue;

        // Real logic would gather exactly which points overlap.
        // For now, an empty example:
        const linked: Array<{ row: number; col: number }> = [];
        const locked: Array<{ row: number; col: number }> = [];

        if (framesOverlap) {
          // gather actual intersection of b1.framePoints & b2.framePoints
        }
        if (borderFrameOverlap) {
          // gather intersection of b1.borderPoints & b2.framePoints => locked
        }

        const join = new BlockJoin(b1, b2, linked, locked);
        result.push(join);
      }
    }

    return result;
  }
}
