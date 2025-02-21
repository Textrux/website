import GridHelper from "../util/GridHelper";
import Block from "./Block";
import Cell from "./Cell";

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
    this.type = lockedCells.length > 0 ? "locked" : "linked";
  }

  static populateBlockJoins(blockList: Block[]): BlockJoin[] {
    const blockJoins: BlockJoin[] = [];
    for (let i = 0; i < blockList.length; i++) {
      for (let j = i + 1; j < blockList.length; j++) {
        let link = false;
        let lock = false;
        const b1 = blockList[i];
        const b2 = blockList[j];
        // link => frames overlap
        if (GridHelper.overlaps(b1.frameCells, b2.frameCells)) {
          link = true;
        }
        // lock => border vs frame overlap
        if (GridHelper.overlaps(b1.borderCells, b2.frameCells)) {
          lock = true;
        }

        if (link) {
          blockJoins.push({ b1: i, b2: j, link, lock });
        }
      }
    }
    return blockJoins;
  }
}
