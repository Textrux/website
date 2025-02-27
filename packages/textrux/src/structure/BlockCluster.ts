import Block from "./Block";
import BlockJoin from "./BlockJoin";
import Cell from "./Cell";
import GridHelper from "../util/GridHelper";

export default class BlockCluster {
  /**
   * The array of blocks in this cluster.
   */
  blocks: Block[];

  /**
   * The joins (links/locks) among those blocks.
   */
  blockJoins: BlockJoin[];

  /**
   * A simple bounding rectangle (top, left, bottom, right)
   * for all the blocks’ canvas cells.
   */
  clusterCanvas: { top: number; left: number; bottom: number; right: number };

  /**
   * The set of all “linked” cells in this cluster (orange).
   */
  linkedCells: Cell[];

  /**
   * The set of all “locked” cells in this cluster (red).
   */
  lockedCells: Cell[];

  constructor(
    blocks: Block[],
    blockJoins: BlockJoin[],
    clusterCanvas: { top: number; left: number; bottom: number; right: number },
    linkedCells: Cell[],
    lockedCells: Cell[]
  ) {
    this.blocks = blocks;
    this.blockJoins = blockJoins;
    this.clusterCanvas = clusterCanvas;
    this.linkedCells = linkedCells;
    this.lockedCells = lockedCells;
  }

  /**
   * Use the old gatherCluster approach:
   *  - Traverse “neighbor” blocks via their BlockJoins.
   *  - Aggregate all blocks and joins in each connected group.
   *  - Compute bounding box + linkedCells + lockedCells.
   */
  static populateBlockClusters(
    blockList: Block[],
    allJoins: BlockJoin[]
  ): BlockCluster[] {
    const used = new Set<Block>();
    const blockClusters: BlockCluster[] = [];

    // Helper to recursively gather connected blocks + joins
    function gatherCluster(
      currentBlock: Block,
      clusterBlocks: Block[],
      clusterJoins: BlockJoin[]
    ) {
      // If we already have this block in clusterBlocks, do nothing
      if (clusterBlocks.includes(currentBlock)) return;
      clusterBlocks.push(currentBlock);

      // Find joins that involve currentBlock
      const relevantJoins = allJoins.filter((jn) =>
        jn.blocks.includes(currentBlock)
      );
      for (const join of relevantJoins) {
        // If we haven't recorded this join in clusterJoins, add it
        if (!clusterJoins.includes(join)) {
          clusterJoins.push(join);
        }
        // Then follow the other block in this join
        const other =
          join.blocks[0] === currentBlock ? join.blocks[1] : join.blocks[0];
        if (!clusterBlocks.includes(other)) {
          gatherCluster(other, clusterBlocks, clusterJoins);
        }
      }
    }

    for (const block of blockList) {
      if (used.has(block)) {
        continue;
      }

      const clusterBlocks: Block[] = [];
      const clusterJoins: BlockJoin[] = [];
      gatherCluster(block, clusterBlocks, clusterJoins);

      // Collect all canvas cells for bounding box
      const allCanvas = clusterBlocks.flatMap((b) => b.canvasCells);
      const minR = Math.min(...allCanvas.map((pt) => pt.row));
      const maxR = Math.max(...allCanvas.map((pt) => pt.row));
      const minC = Math.min(...allCanvas.map((pt) => pt.col));
      const maxC = Math.max(...allCanvas.map((pt) => pt.col));

      // Collect and deduplicate all linked/locked cells
      const linkedAll = clusterJoins.flatMap((jn) => jn.linkedCells);
      const lockedAll = clusterJoins.flatMap((jn) => jn.lockedCells);
      const mergedLinked = GridHelper.deduplicatePoints(linkedAll);
      const mergedLocked = GridHelper.deduplicatePoints(lockedAll);

      // Construct the BlockCluster
      const cluster = new BlockCluster(
        clusterBlocks,
        clusterJoins,
        { top: minR, left: minC, bottom: maxR, right: maxC },
        mergedLinked,
        mergedLocked
      );
      blockClusters.push(cluster);

      // Mark these blocks as used so we don't reprocess them
      clusterBlocks.forEach((b) => used.add(b));
    }

    return blockClusters;
  }
}
