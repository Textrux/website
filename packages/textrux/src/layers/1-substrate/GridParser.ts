import GridModel from "./GridModel";
import Container from "../3-foundation/Container";
import Block from "../3-foundation/block/Block";
import CellCluster from "../3-foundation/cell-cluster/CellCluster";
import BlockJoin from "../3-foundation/block-subcluster/block-join/BlockJoin";
import BlockSubcluster from "../3-foundation/block-subcluster/BlockSubcluster";
import BlockCluster from "../3-foundation/block-cluster/BlockCluster";
import { CellFormat } from "../../style/CellFormat";

// Import trait parsers
import { BlockTraitParser } from "../3-foundation/block/BlockTraitParser";
import { BlockSubclusterTraitParser } from "../3-foundation/block-subcluster/BlockSubclusterTraitParser";
import { BlockClusterTraitParser } from "../3-foundation/block-cluster/BlockClusterTraitParser";
import { BlockJoinTraitParser } from "../3-foundation/block-subcluster/block-join/BlockJoinTraitParser";
// CellClusterTraitParser removed - replaced by simple detection rules
import { defaultConstructRegistry } from "../4-constructs/core/ConstructRegistry";

/** Key = "R{row}C{col}" => array of class names */
interface StyleMap {
  [key: string]: string[];
}

/** Key = "R{row}C{col}" => CellFormat object */
interface FormatMap {
  [key: string]: CellFormat;
}

/**
 * Scan the grid for non-empty cells => create containers => finalize blocks =>
 * produce a style map. Then also compute BlockJoins => BlockSubclusters => BlockClusters
 * and add locked/linked formatting. Finally, identify "empty cluster" cells as well as
 * "canvas-empty" cells.
 *
 * Returns:
 * - styleMap: Can be used by the UI layer to add classes to each cell (backward compatibility)
 * - formatMap: Maps cell positions to CellFormat objects for advanced styling
 * - blockList: List of all blocks found in the grid
 */
export function parseAndFormatGrid(grid: GridModel): {
  styleMap: Record<string, string[]>;
  formatMap: Record<string, CellFormat>;
  blockList: Block[];
} {
  // 1) Collect all non-empty (filled) cell positions:
  const filledPoints = grid
    .getFilledCells()
    .filter(({ row, col }) => {
      // Ignore R1C1 if its raw text starts with ^
      if (
        row === 1 &&
        col === 1 &&
        grid.getCellRaw(row, col).trim().startsWith("^")
      ) {
        return false;
      }
      return true;
    })
    .map(({ row, col }) => ({ row, col }));

  // Prepare our style and format maps:
  const styleMap: StyleMap = {};
  const formatMap: FormatMap = {};

  if (grid.getCellRaw(1, 1).trim().startsWith("^")) {
    const disabledFormat = CellFormat.fromCssClass("disabled-cell");
    addFormatAndClass(styleMap, formatMap, 1, 1, disabledFormat);
  }

  // 2) Build "containers" of filled cells with outline expand=2 => Blocks
  const containers = getContainers(
    filledPoints,
    2,
    grid.rowCount,
    grid.columnCount
  );
  const blocks: Block[] = containers.map(finalizeBlock);

  // 3) Compute each block's sub-lumps (cell clusters), then
  //    mark cluster‐empty vs. canvas‐empty cells.
  for (const blk of blocks) {
    // get sub-containers with expand=1 from all the block's canvasPoints
    const subContainers = getContainers(
      blk.canvasPoints,
      1,
      grid.rowCount,
      grid.columnCount
    );
    // each sub-container => array of filled points
    // CRITICAL FIX: Convert from 1-indexed Container coordinates to 0-indexed CellCluster coordinates
    const cellClusters = subContainers.map(
      (ctr) =>
        new CellCluster(
          ctr.topRow - 1,    // Convert from 1-indexed to 0-indexed
          ctr.bottomRow - 1, // Convert from 1-indexed to 0-indexed
          ctr.leftColumn - 1, // Convert from 1-indexed to 0-indexed
          ctr.rightColumn - 1, // Convert from 1-indexed to 0-indexed
          ctr.filledPoints
        )
    );

    // store them on the block if needed
    blk.cellClusters = cellClusters;

    // Populate subclusters for each cell cluster
    for (const cellCluster of cellClusters) {
      cellCluster.populateSubclusters();
    }

    // For each sub-lump bounding box => find "cluster-empty" cells
    const clusterEmptyCells: Array<{ row: number; col: number }> = [];
    for (const cluster of cellClusters) {
      const clusterSet = new Set(
        cluster.filledPoints.map((pt) => pointKey(pt.row, pt.col))
      );

      const minR = cluster.topRow;
      const maxR = cluster.bottomRow;
      const minC = cluster.leftCol;
      const maxC = cluster.rightCol;

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const key = pointKey(r, c);
          // If not in the cluster and the entire grid cell is empty
          //   (we confirm by checking raw text).
          if (!clusterSet.has(key) && grid.getCellRaw(r, c).trim() === "") {
            clusterEmptyCells.push({ row: r, col: c });
          }
        }
      }
    }

    // "canvas‐empty" cells = bounding box minus the filled cluster
    const blockEmptyCells: Array<{ row: number; col: number }> = [];
    const fillSet = new Set(
      blk.canvasPoints.map((pt) => pointKey(pt.row, pt.col))
    );
    for (let r = blk.topRow; r <= blk.bottomRow; r++) {
      for (let c = blk.leftCol; c <= blk.rightCol; c++) {
        const k = pointKey(r, c);
        if (!fillSet.has(k)) {
          // not a filled cell
          blockEmptyCells.push({ row: r, col: c });
        }
      }
    }

    // Apply cluster-empty and canvas-empty formatting to cells
    for (const pt of clusterEmptyCells) {
      addFormatAndClass(
        styleMap,
        formatMap,
        pt.row,
        pt.col,
        cellClusters.find(
          (c) =>
            pt.row >= c.topRow &&
            pt.row <= c.bottomRow &&
            pt.col >= c.leftCol &&
            pt.col <= c.rightCol
        )?.clusterEmptyFormat || CellFormat.fromCssClass("cluster-empty-cell")
      );
    }

    for (const pt of blockEmptyCells) {
      const k = pointKey(pt.row, pt.col);
      // Only add canvas-empty if not already cluster-empty
      if (!styleMap[k]?.includes("cluster-empty-cell")) {
        addFormatAndClass(
          styleMap,
          formatMap,
          pt.row,
          pt.col,
          blk.canvasEmptyFormat
        );
      }
    }
  }

  // 4) BlockJoins => BlockSubclusters => BlockClusters => locked/linked
  const blockJoins = BlockJoin.populateBlockJoins(blocks);
  const blockSubclusters = BlockSubcluster.populateBlockSubclusters(
    blocks,
    blockJoins,
    grid.rowCount,
    grid.columnCount
  );
  const blockClusters = BlockCluster.populateBlockClusters(
    blockSubclusters,
    grid.rowCount,
    grid.columnCount
  );

  grid.blockClusters = blockClusters;

  // 5) Parse traits for all foundation elements
  const blockTraitParser = new BlockTraitParser(grid);
  const blockSubclusterTraitParser = new BlockSubclusterTraitParser(grid);
  const blockClusterTraitParser = new BlockClusterTraitParser(grid);
  const blockJoinTraitParser = new BlockJoinTraitParser(grid);
  // const cellClusterTraitParser = new CellClusterTraitParser(grid); // Legacy trait system removed

  // Parse traits for blocks and their cell clusters
  for (const block of blocks) {
    block.traits = blockTraitParser.parseTraits(block);

    // Legacy trait parsing removed - now using simple detection rules
    if (block.cellClusters) {
      for (const cellCluster of block.cellClusters) {
        // cellCluster.traits = cellClusterTraitParser.parseTraits(cellCluster);
      }
    }
  }

  // Parse traits for block joins
  for (const blockJoin of blockJoins) {
    blockJoin.traits = blockJoinTraitParser.parseTraits(blockJoin);
  }

  // Parse traits for block subclusters
  for (const blockSubcluster of blockSubclusters) {
    blockSubcluster.traits =
      blockSubclusterTraitParser.parseTraits(blockSubcluster);
  }

  // Parse traits for block clusters
  for (const blockCluster of blockClusters) {
    blockCluster.traits = blockClusterTraitParser.parseTraits(blockCluster);
  }

  // Parse constructs in cell clusters using Core system
  defaultConstructRegistry.setGrid(grid);
  const allConstructs: any[] = [];

  for (const block of blocks) {
    if (block.cellClusters) {
      for (const cellCluster of block.cellClusters) {
        if (cellCluster) {
          // Use the unified Core construct parser
          const construct =
            defaultConstructRegistry.parseConstruct(cellCluster);
          if (construct) {
            cellCluster.addConstruct(construct);
            allConstructs.push(construct);
          }
        }
      }
    }
  }

  // Update grid's cached constructs for formatting
  grid.updateCachedConstructs(allConstructs);

  // 6) Mark locked/linked cells from blockSubclusters
  for (const bsc of blockSubclusters) {
    for (const pt of bsc.linkedPoints) {
      addFormatAndClass(styleMap, formatMap, pt.row, pt.col, bsc.linkedFormat);
    }
    for (const pt of bsc.lockedPoints) {
      addFormatAndClass(styleMap, formatMap, pt.row, pt.col, bsc.lockedFormat);
    }
  }

  // 7) Apply formatting for canvas, perimeter, buffer for each block cluster
  for (const bc of blockClusters) {
    for (const pt of bc.canvasPoints) {
      addFormatAndClass(styleMap, formatMap, pt.row, pt.col, bc.canvasFormat);
    }
    for (const pt of bc.perimeterPoints) {
      addFormatAndClass(
        styleMap,
        formatMap,
        pt.row,
        pt.col,
        bc.perimeterFormat
      );
    }
    for (const pt of bc.bufferPoints) {
      addFormatAndClass(styleMap, formatMap, pt.row, pt.col, bc.bufferFormat);
    }
  }

  // 8) Finally, apply formatting for canvas, border, frame for each block
  for (const b of blocks) {
    for (const pt of b.canvasPoints) {
      addFormatAndClass(styleMap, formatMap, pt.row, pt.col, b.canvasFormat);
    }
    for (const pt of b.borderPoints) {
      addFormatAndClass(styleMap, formatMap, pt.row, pt.col, b.borderFormat);
    }
    for (const pt of b.framePoints) {
      addFormatAndClass(styleMap, formatMap, pt.row, pt.col, b.frameFormat);
    }
  }

  return { styleMap, formatMap, blockList: blocks };
}

/**
 * Add a CellFormat to formatMap and its corresponding CSS classes to styleMap
 */
function addFormatAndClass(
  styleMap: StyleMap,
  formatMap: FormatMap,
  row: number,
  col: number,
  format: CellFormat
) {
  if (row < 1 || col < 1) return;
  const key = pointKey(row, col);

  // For CSS classes (backward compatibility)
  if (!styleMap[key]) {
    styleMap[key] = [];
  }

  const cssClasses = format.toCssClasses();
  for (const cls of cssClasses) {
    if (!styleMap[key].includes(cls)) {
      styleMap[key].push(cls);
    }
  }

  // For formats (new approach)
  if (!formatMap[key]) {
    formatMap[key] = format;
  } else {
    // Merge with existing format if any
    formatMap[key] = formatMap[key].merge(format);
  }
}

/**
 * Convert an array of filledPoints => one or more Container bounding boxes,
 * expanded by `expandOutlineBy`.
 */
function getContainers(
  filledPoints: Array<{ row: number; col: number }>,
  expandOutlineBy: number,
  rowCount: number,
  colCount: number
): Container[] {
  if (filledPoints.length === 0) return [];

  const containers: Container[] = [];
  // faster membership checks:
  const used = new Set<string>();
  // We'll keep a Set as well for quick membership.
  const allPoints = new Set(filledPoints.map((p) => pointKey(p.row, p.col)));

  for (const cell of filledPoints) {
    const key = pointKey(cell.row, cell.col);
    if (used.has(key)) continue; // skip if already in a container

    const tempContainer = new Container(cell.row, cell.col, cell.row, cell.col);
    const containerSet = new Set<string>();
    containerSet.add(key);
    tempContainer.filledPoints.push(cell);

    // BFS/merge approach:
    let newlyAdded: boolean;
    do {
      newlyAdded = false;
      // expand bounding box by expandOutlineBy
      const expanded = tempContainer.expandOutlineBy(
        expandOutlineBy,
        rowCount,
        colCount
      );

      // gather any points that overlap
      for (const ptStr of allPoints) {
        if (!containerSet.has(ptStr)) {
          const { row, col } = parsePoint(ptStr);
          if (expanded.overlaps(new Container(row, col, row, col))) {
            containerSet.add(ptStr);
            tempContainer.filledPoints.push({ row, col });
            newlyAdded = true;
          }
        }
      }

      if (newlyAdded) {
        // unify bounding box
        const rows = tempContainer.filledPoints.map((p) => p.row);
        const cols = tempContainer.filledPoints.map((p) => p.col);
        tempContainer.topRow = Math.min(...rows);
        tempContainer.bottomRow = Math.max(...rows);
        tempContainer.leftColumn = Math.min(...cols);
        tempContainer.rightColumn = Math.max(...cols);
      }
    } while (newlyAdded);

    // Mark everything in this container as used
    for (const ptStr of containerSet) {
      used.add(ptStr);
    }

    // Now also check if we overlap existing containers => merge
    let merged = true;
    while (merged) {
      merged = false;
      const expanded = tempContainer.expandOutlineBy(
        expandOutlineBy,
        rowCount,
        colCount
      );

      for (let i = containers.length - 1; i >= 0; i--) {
        const c = containers[i];
        if (expanded.overlaps(c)) {
          // unify bounding box & points
          containers.splice(i, 1);
          tempContainer.topRow = Math.min(tempContainer.topRow, c.topRow);
          tempContainer.bottomRow = Math.max(
            tempContainer.bottomRow,
            c.bottomRow
          );
          tempContainer.leftColumn = Math.min(
            tempContainer.leftColumn,
            c.leftColumn
          );
          tempContainer.rightColumn = Math.max(
            tempContainer.rightColumn,
            c.rightColumn
          );
          for (const fp of c.filledPoints) {
            const s = pointKey(fp.row, fp.col);
            if (!containerSet.has(s)) {
              containerSet.add(s);
              tempContainer.filledPoints.push(fp);
            }
          }
          merged = true;
        }
      }
    }

    containers.push(tempContainer);
  }

  // sort for consistent order
  containers.sort((a, b) => {
    if (a.topRow !== b.topRow) return a.topRow - b.topRow;
    if (a.leftColumn !== b.leftColumn) return a.leftColumn - b.leftColumn;
    if (a.bottomRow !== b.bottomRow) return a.bottomRow - b.bottomRow;
    return a.rightColumn - b.rightColumn;
  });

  return containers;
}

/**
 * Convert a Container => a Block object (canvas, border, frame).
 */
function finalizeBlock(cont: Container): Block {
  const b = new Block(cont);

  // The container's filledPoints => block's canvasPoints
  b.canvasPoints = [...cont.filledPoints];

  // Build border ring => 1 cell around
  const br1 = b.topRow - 1;
  const br2 = b.bottomRow + 1;
  const bc1 = b.leftCol - 1;
  const bc2 = b.rightCol + 1;
  const borderPts: Array<{ row: number; col: number }> = [];

  for (let c = bc1; c <= bc2; c++) {
    borderPts.push({ row: br1, col: c });
    borderPts.push({ row: br2, col: c });
  }
  for (let r = br1; r <= br2; r++) {
    borderPts.push({ row: r, col: bc1 });
    borderPts.push({ row: r, col: bc2 });
  }
  b.borderPoints = dedupePoints(borderPts).filter(
    (p) => p.row > 0 && p.col > 0
  );

  // Build frame => 2 cells around
  const fr1 = br1 - 1;
  const fr2 = br2 + 1;
  const fc1 = bc1 - 1;
  const fc2 = bc2 + 1;
  const framePts: Array<{ row: number; col: number }> = [];

  for (let c = fc1; c <= fc2; c++) {
    framePts.push({ row: fr1, col: c });
    framePts.push({ row: fr2, col: c });
  }
  for (let r = fr1; r <= fr2; r++) {
    framePts.push({ row: r, col: fc1 });
    framePts.push({ row: r, col: fc2 });
  }
  b.framePoints = dedupePoints(framePts).filter((p) => p.row > 0 && p.col > 0);

  return b;
}

/** Deduplicate row,col points. */
function dedupePoints(
  arr: Array<{ row: number; col: number }>
): Array<{ row: number; col: number }> {
  const seen = new Set<string>();
  const out: Array<{ row: number; col: number }> = [];
  for (const p of arr) {
    const k = pointKey(p.row, p.col);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(p);
    }
  }
  return out;
}

/** Helper to convert row,col => "R{row}C{col}". */
function pointKey(row: number, col: number): string {
  return `R${row}C${col}`;
}

/** Helper to parse a "R{row}C{col}" string. */
function parsePoint(str: string): { row: number; col: number } {
  const m = /^R(\d+)C(\d+)$/.exec(str);
  if (!m) throw new Error(`Invalid point key: ${str}`);
  return { row: parseInt(m[1], 10), col: parseInt(m[2], 10) };
}
