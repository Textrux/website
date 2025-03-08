/**
 * /packages/textrux/src/util/LocalStorageStore.ts
 *
 * Minimal helper to store only filled cells as JSON in localStorage.
 */

import Grid from "../model/GridModel";

/**
 * Shape we store in localStorage:
 *   {
 *     rows: number,  // the highest row actually used
 *     cols: number,  // the highest col actually used
 *     cells: Array<{ row, col, value }>,
 *   }
 */
interface StoredGridData {
  rows: number;
  cols: number;
  cells: Array<{
    row: number;
    col: number;
    value: string;
  }>;
}

/**
 * Key used in localStorage
 */
const LOCAL_STORAGE_KEY = "savedGridData";

/**
 * Save to localStorage as minimal array of filled cells.
 */
export function saveGridToLocalStorage(
  grid: Grid,
  storageKey = LOCAL_STORAGE_KEY
) {
  const data: StoredGridData = { rows: 0, cols: 0, cells: [] };
  const filledCells = grid.getFilledCells();

  for (const { row, col, value } of filledCells) {
    data.cells.push({ row, col, value });
    if (row > data.rows) data.rows = row;
    if (col > data.cols) data.cols = col;
  }

  localStorage.setItem(storageKey, JSON.stringify(data));
}

/**
 * Load from localStorage, clearing the grid first,
 * then filling the saved cells. Will resize if needed.
 */
export function loadGridFromLocalStorage(
  grid: Grid,
  storageKey = LOCAL_STORAGE_KEY
) {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return; // nothing saved

  try {
    const parsed = JSON.parse(raw) as StoredGridData;
    if (!parsed || !parsed.cells) return;

    const { rows, cols, cells } = parsed;

    // Resize if needed, but only up to the highest used row/col
    if (rows > grid.rows) {
      grid.resizeRows(rows);
    }
    if (cols > grid.cols) {
      grid.resizeCols(cols);
    }

    // Clear the grid in one shot by wiping internal sparse maps
    // (This is much faster than looping over every cell.)
    (grid as any).contentsMap = {};
    (grid as any).formulas = {};
    // Optionally also wipe formats, if you want a totally clean slate:
    // (grid as any).formatsMap = {};

    // Restore data
    for (const cell of cells) {
      grid.setCellRaw(cell.row, cell.col, cell.value);
    }
  } catch (err) {
    console.error("Failed to parse grid data from localStorage:", err);
  }
}
