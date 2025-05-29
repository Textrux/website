import Block from "../block/Block";
import BlockJoin from "./block-join/BlockJoin";
import GridHelper from "../../../util/GridHelper";
import { CellFormat } from "../../../style/CellFormat";
import { BlockSubclusterTraits } from "./BlockSubclusterTraits";

/**
 * A BlockSubcluster is a group of Blocks that are connected (via their BlockJoins).
 * It stores:
 *   - the individual blocks in the subcluster
 *   - the joins among them
 *   - a simple bounding rectangle around all their canvas points
 *   - any "linked" or "locked" overlap points gathered from joins
 */
export default class BlockSubcluster {
  /** The blocks in this subcluster. */
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

  clusterBuffer: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };

  /** All "linked" points (row,col) in this subcluster. */
  linkedPoints: Array<{ row: number; col: number }>;

  /** All "locked" points (row,col) in this subcluster. */
  lockedPoints: Array<{ row: number; col: number }>;

  /** Formatting for linked cells */
  linkedFormat: CellFormat;

  /** Formatting for locked cells */
  lockedFormat: CellFormat;

  /** Traits for this block subcluster */
  traits: BlockSubclusterTraits;

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

    // Initialize with default formats
    this.linkedFormat = CellFormat.fromCssClass("linked-cell");
    this.lockedFormat = CellFormat.fromCssClass("locked-cell");

    // Initialize traits with placeholder values - will be populated later
    this.traits = this.initializeTraits();
  }

  private initializeTraits(): BlockSubclusterTraits {
    // TODO: Implement trait analysis and population
    // For now, return a basic structure with default values
    return {
      base: {} as any,
      composite: {} as any,
      derived: {} as any,
    };
  }

  /**
   * Set custom formatting for this block subcluster's cells
   */
  setCustomFormatting(linkedFormat?: CellFormat, lockedFormat?: CellFormat) {
    if (linkedFormat) this.linkedFormat = linkedFormat;
    if (lockedFormat) this.lockedFormat = lockedFormat;
  }

  /**
   * Static method to traverse all blocks, connect them via their BlockJoins,
   * and produce one BlockSubcluster per connected group.
   */
  static populateBlockSubclusters(
    blockList: Block[],
    allJoins: BlockJoin[],
    rowCount: number,
    colCount: number
  ): BlockSubcluster[] {
    const used = new Set<Block>();
    const blockSubclusters: BlockSubcluster[] = [];

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

      // Construct the BlockSubcluster
      const subcluster = new BlockSubcluster(
        clusterBlocks,
        clusterJoins,
        { top: minR, left: minC, bottom: maxR, right: maxC },
        mergedLinked,
        mergedLocked
      );

      subcluster.clusterPerimeter = subcluster.expandOutline(
        rowCount,
        colCount,
        2
      );
      subcluster.clusterBuffer = subcluster.expandOutline(
        rowCount,
        colCount,
        4
      );

      blockSubclusters.push(subcluster);

      // Mark these blocks as used so we don't reprocess them
      clusterBlocks.forEach((b) => used.add(b));
    }

    // console.log("blockSubclusters", blockSubclusters);

    return blockSubclusters;
  }

  expandOutline(
    rowCount: number,
    colCount: number,
    expandBy: number
  ): { top: number; left: number; bottom: number; right: number } {
    return {
      top: Math.max(1, this.clusterCanvas.top - expandBy),
      left: Math.max(1, this.clusterCanvas.left - expandBy),
      bottom: Math.min(rowCount, this.clusterCanvas.bottom + expandBy),
      right: Math.min(colCount, this.clusterCanvas.right + expandBy),
    };
  }
}
