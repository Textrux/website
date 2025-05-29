import Block from "../block/Block";
import BlockJoin from "../block-join/BlockJoin";
import GridHelper from "../../../util/GridHelper";
import { CellFormat } from "../../../style/CellFormat";
import { BlockClusterTraits } from "./BlockClusterTraits";
import BlockSubcluster from "../block-subcluster/BlockSubcluster";

/**
 * A BlockCluster is a group of BlockSubclusters where their perimeters overlap.
 * It represents a higher-level grouping based on spatial proximity and rectangular overlap.
 * It stores:
 *   - the individual block subclusters in the cluster
 *   - its own canvas, perimeter, and buffer areas
 *   - formatting for the cluster as a whole
 */
export default class BlockCluster {
  /** The block subclusters in this cluster. */
  blockSubclusters: BlockSubcluster[];

  /**
   * The combined canvas area of all subclusters
   */
  clusterCanvas: { top: number; left: number; bottom: number; right: number };

  /**
   * The perimeter around the cluster (expanded from canvas)
   */
  clusterPerimeter: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };

  /**
   * The buffer area around the cluster (expanded further from perimeter)
   */
  clusterBuffer: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };

  /** Formatting for canvas cells */
  canvasFormat: CellFormat;

  /** Formatting for perimeter cells */
  perimeterFormat: CellFormat;

  /** Formatting for buffer cells */
  bufferFormat: CellFormat;

  /** Traits for this block cluster */
  traits: BlockClusterTraits;

  constructor(
    blockSubclusters: BlockSubcluster[],
    clusterCanvas: { top: number; left: number; bottom: number; right: number }
  ) {
    this.blockSubclusters = blockSubclusters;
    this.clusterCanvas = clusterCanvas;

    // Initialize with default formats
    this.canvasFormat = CellFormat.fromCssClass("cluster-canvas");
    this.perimeterFormat = CellFormat.fromCssClass("cluster-perimeter");
    this.bufferFormat = CellFormat.fromCssClass("cluster-buffer");

    // Initialize traits with placeholder values - will be populated later
    this.traits = this.initializeTraits();
  }

  private initializeTraits(): BlockClusterTraits {
    // TODO: Implement trait analysis and population
    // For now, return a basic structure with default values
    return {
      base: {} as any,
      composite: {} as any,
      derived: {} as any,
    };
  }

  /**
   * Set custom formatting for this block cluster's areas
   */
  setCustomFormatting(
    canvasFormat?: CellFormat,
    perimeterFormat?: CellFormat,
    bufferFormat?: CellFormat
  ) {
    if (canvasFormat) this.canvasFormat = canvasFormat;
    if (perimeterFormat) this.perimeterFormat = perimeterFormat;
    if (bufferFormat) this.bufferFormat = bufferFormat;
  }

  /**
   * Static method to group BlockSubclusters into BlockClusters based on overlapping perimeters.
   * BlockSubclusters whose perimeters overlap will be grouped into the same BlockCluster.
   */
  static populateBlockClusters(
    blockSubclusters: BlockSubcluster[],
    rowCount: number,
    colCount: number
  ): BlockCluster[] {
    const used = new Set<BlockSubcluster>();
    const blockClusters: BlockCluster[] = [];

    function gatherCluster(
      currentSubcluster: BlockSubcluster,
      clusterSubclusters: BlockSubcluster[]
    ) {
      // If we already have this subcluster in clusterSubclusters, do nothing
      if (clusterSubclusters.includes(currentSubcluster)) return;
      clusterSubclusters.push(currentSubcluster);

      // Find other subclusters whose perimeters overlap with current subcluster's perimeter
      const currentPerimeter = currentSubcluster.clusterPerimeter;

      for (const otherSubcluster of blockSubclusters) {
        if (clusterSubclusters.includes(otherSubcluster)) continue;

        const otherPerimeter = otherSubcluster.clusterPerimeter;

        // Check if perimeters overlap (rectangularly)
        if (rectanglesOverlap(currentPerimeter, otherPerimeter)) {
          gatherCluster(otherSubcluster, clusterSubclusters);
        }
      }
    }

    for (const subcluster of blockSubclusters) {
      if (used.has(subcluster)) continue;

      const clusterSubclusters: BlockSubcluster[] = [];
      gatherCluster(subcluster, clusterSubclusters);

      // Calculate the combined canvas area
      const allCanvasRects = clusterSubclusters.map((sc) => sc.clusterCanvas);
      const minR = Math.min(...allCanvasRects.map((rect) => rect.top));
      const maxR = Math.max(...allCanvasRects.map((rect) => rect.bottom));
      const minC = Math.min(...allCanvasRects.map((rect) => rect.left));
      const maxC = Math.max(...allCanvasRects.map((rect) => rect.right));

      // Construct the BlockCluster
      const cluster = new BlockCluster(clusterSubclusters, {
        top: minR,
        left: minC,
        bottom: maxR,
        right: maxC,
      });

      cluster.clusterPerimeter = cluster.expandOutline(rowCount, colCount, 2);
      cluster.clusterBuffer = cluster.expandOutline(rowCount, colCount, 4);

      blockClusters.push(cluster);

      // Mark these subclusters as used so we don't reprocess them
      clusterSubclusters.forEach((sc) => used.add(sc));
    }

    return blockClusters;
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

  /**
   * Get all canvas points for this cluster (union of all subcluster canvas points)
   */
  get canvasPoints(): Array<{ row: number; col: number }> {
    const points: Array<{ row: number; col: number }> = [];
    for (let r = this.clusterCanvas.top; r <= this.clusterCanvas.bottom; r++) {
      for (
        let c = this.clusterCanvas.left;
        c <= this.clusterCanvas.right;
        c++
      ) {
        points.push({ row: r, col: c });
      }
    }
    return GridHelper.deduplicatePoints(points);
  }

  /**
   * Get all perimeter points for this cluster
   */
  get perimeterPoints(): Array<{ row: number; col: number }> {
    const points: Array<{ row: number; col: number }> = [];

    // Top and bottom edges
    for (
      let c = this.clusterPerimeter.left;
      c <= this.clusterPerimeter.right;
      c++
    ) {
      points.push({ row: this.clusterPerimeter.top, col: c });
      points.push({ row: this.clusterPerimeter.bottom, col: c });
    }

    // Left and right edges
    for (
      let r = this.clusterPerimeter.top;
      r <= this.clusterPerimeter.bottom;
      r++
    ) {
      points.push({ row: r, col: this.clusterPerimeter.left });
      points.push({ row: r, col: this.clusterPerimeter.right });
    }

    return GridHelper.deduplicatePoints(points).filter(
      (p) => p.row > 0 && p.col > 0
    );
  }

  /**
   * Get all buffer points for this cluster
   */
  get bufferPoints(): Array<{ row: number; col: number }> {
    const points: Array<{ row: number; col: number }> = [];

    // Top and bottom edges
    for (let c = this.clusterBuffer.left; c <= this.clusterBuffer.right; c++) {
      points.push({ row: this.clusterBuffer.top, col: c });
      points.push({ row: this.clusterBuffer.bottom, col: c });
    }

    // Left and right edges
    for (let r = this.clusterBuffer.top; r <= this.clusterBuffer.bottom; r++) {
      points.push({ row: r, col: this.clusterBuffer.left });
      points.push({ row: r, col: this.clusterBuffer.right });
    }

    return GridHelper.deduplicatePoints(points).filter(
      (p) => p.row > 0 && p.col > 0
    );
  }
}

/**
 * Helper function to check if two rectangles overlap
 */
function rectanglesOverlap(
  rect1: { top: number; left: number; bottom: number; right: number },
  rect2: { top: number; left: number; bottom: number; right: number }
): boolean {
  return !(
    rect1.right < rect2.left ||
    rect2.right < rect1.left ||
    rect1.bottom < rect2.top ||
    rect2.bottom < rect1.top
  );
}
