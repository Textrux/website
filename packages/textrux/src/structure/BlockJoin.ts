import GridHelper from "../util/GridHelper";
import Block from "./Block";
import Cell from "./Cell";

/**
 * A BlockJoin represents the "link" or "lock" overlap between two Blocks.
 * For instance, if blockA.frameCells overlap blockB.frameCells => linked,
 * if blockA.borderCells overlap blockB.frameCells => locked, etc.
 */
export default class BlockJoin {
  blocks: [Block, Block];
  type: "linked" | "locked";
  linkedCells: Cell[];
  lockedCells: Cell[];
  allJoinedCells: Cell[];

  constructor(
    blockA: Block,
    blockB: Block,
    linkedCells: Cell[],
    lockedCells: Cell[]
  ) {
    this.blocks = [blockA, blockB];
    this.linkedCells = linkedCells;
    this.lockedCells = lockedCells;
    this.allJoinedCells = [...lockedCells, ...linkedCells];

    // If there's at least one locked cell => type = "locked", else "linked"
    this.type = lockedCells.length > 0 ? "locked" : "linked";
  }

  /**
   * Example “populateBlockJoins” is incomplete.
   * The snippet originally returned an incompatible object with {b1, b2, link, lock}.
   * Below is a *placeholder* approach:
   */
  static populateBlockJoins(blockList: Block[]): BlockJoin[] {
    const result: BlockJoin[] = [];

    for (let i = 0; i < blockList.length; i++) {
      for (let j = i + 1; j < blockList.length; j++) {
        const b1 = blockList[i];
        const b2 = blockList[j];

        const framesOverlap = GridHelper.overlaps(b1.frameCells, b2.frameCells);
        const borderFrameOverlap = GridHelper.overlaps(
          b1.borderCells,
          b2.frameCells
        );

        if (!framesOverlap && !borderFrameOverlap) {
          // No join at all
          continue;
        }

        // For real usage, you'd figure out exactly which cells are overlapping:
        const linkedCells: Cell[] = []; // find actual overlapping frame vs frame
        const lockedCells: Cell[] = []; // find border vs frame overlap
        // (We'll just fill them if the boolean is set.)
        if (framesOverlap) {
          // But we do not have the actual grid cells for those frame points,
          // so this is left as a placeholder.
        }
        if (borderFrameOverlap) {
          // likewise placeholder
        }

        // If either type of overlap is true, we create a join:
        const join = new BlockJoin(b1, b2, linkedCells, lockedCells);
        result.push(join);
      }
    }

    return result;
  }
}
