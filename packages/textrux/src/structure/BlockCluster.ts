import Block from "./Block";
import BlockJoin from "./BlockJoin";
import GridHelper from "../util/GridHelper";

/**
 * A BlockCluster is a group of Blocks that are connected (via their BlockJoins).
 * It stores:
 *   - the individual blocks in the cluster
 *   - the joins among them
 *   - a simple bounding rectangle around all their canvas points
 *   - any “linked” or “locked” overlap points gathered from joins
 */
export default class BlockCluster {
  /** The blocks in this cluster. */
  blocks: Block[];

  /** The joins (links/locks) among those blocks. */
  blockJoins: BlockJoin[];

  /**
   * A simple bounding rectangle around all the blocks' canvas points:
   *   top, left, bottom, right
   */
  clusterCanvas: { top: number; left: number; bottom: number; right: number };

  clusterPerimeter: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };

  /** All “linked” points (row,col) in this cluster. */
  linkedPoints: Array<{ row: number; col: number }>;

  /** All “locked” points (row,col) in this cluster. */
  lockedPoints: Array<{ row: number; col: number }>;

  constructor(
    blocks: Block[],
    blockJoins: BlockJoin[],
    clusterCanvas: { top: number; left: number; bottom: number; right: number },
    linkedPoints: Array<{ row: number; col: number }>,
    lockedPoints: Array<{ row: number; col: number }>
  ) {
    this.blocks = blocks;
    this.blockJoins = blockJoins;
    this.clusterCanvas = clusterCanvas;
    this.linkedPoints = linkedPoints;
    this.lockedPoints = lockedPoints;
  }

  /**
   * Static method to traverse all blocks, connect them via their BlockJoins,
   * and produce one BlockCluster per connected group.
   */
  static populateBlockClusters(
    blockList: Block[],
    allJoins: BlockJoin[],
    rowCount: number,
    colCount: number
  ): BlockCluster[] {
    const used = new Set<Block>();
    const blockClusters: BlockCluster[] = [];

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
        // If we haven’t recorded this join in clusterJoins, add it
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
      if (used.has(block)) continue;

      const clusterBlocks: Block[] = [];
      const clusterJoins: BlockJoin[] = [];
      gatherCluster(block, clusterBlocks, clusterJoins);

      // Collect all canvas points for bounding box
      const allCanvas = clusterBlocks.flatMap((b) => b.canvasPoints);
      const minR = Math.min(...allCanvas.map((pt) => pt.row));
      const maxR = Math.max(...allCanvas.map((pt) => pt.row));
      const minC = Math.min(...allCanvas.map((pt) => pt.col));
      const maxC = Math.max(...allCanvas.map((pt) => pt.col));

      // Collect and deduplicate all linked/locked points
      const linkedAll = clusterJoins.flatMap((jn) => jn.linkedPoints);
      const lockedAll = clusterJoins.flatMap((jn) => jn.lockedPoints);
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

      cluster.clusterPerimeter = cluster.expandOutline(rowCount, colCount);

      blockClusters.push(cluster);

      // Mark these blocks as used so we don’t reprocess them
      clusterBlocks.forEach((b) => used.add(b));
    }

    console.log("blockClusters", blockClusters);

    return blockClusters;
  }

  expandOutline(
    rowCount: number,
    colCount: number
  ): { top: number; left: number; bottom: number; right: number } {
    const EXPAND_AMOUNT = 2;

    return {
      top: Math.max(1, this.clusterCanvas.top - EXPAND_AMOUNT),
      left: Math.max(1, this.clusterCanvas.left - EXPAND_AMOUNT),
      bottom: Math.min(rowCount, this.clusterCanvas.bottom + EXPAND_AMOUNT),
      right: Math.min(colCount, this.clusterCanvas.right + EXPAND_AMOUNT),
    };
  }
}
