/**
 * /packages/textrux/src/util/LocalStorageStore.ts
 *
 * Minimal helper to store only filled cells as JSON in localStorage.
 */

import Grid from "../model/GridModel";
import Project from "../model/Project";

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

// NEW: Save a single Project under a separate key
export function saveProjectToLocalStorage(project: Project, index: number) {
  const data: StoredGridData = { rows: 0, cols: 0, cells: [] };
  const filledCells = project.grid.getFilledCells();

  for (const { row, col, value } of filledCells) {
    data.cells.push({ row, col, value });
    if (row > data.rows) data.rows = row;
    if (col > data.cols) data.cols = col;
  }

  // e.g. "savedGridData_proj_0", "savedGridData_proj_1", etc.
  const key = `${LOCAL_STORAGE_KEY}_proj_${index}`;
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadProjectFromLocalStorage(project: Project, index: number) {
  const key = `${LOCAL_STORAGE_KEY}_proj_${index}`;
  const raw = localStorage.getItem(key);
  if (!raw) return; // nothing saved for this project index

  try {
    const parsed = JSON.parse(raw) as StoredGridData;
    if (!parsed.cells) return;

    const { rows, cols, cells } = parsed;
    if (rows > project.grid.rows) {
      project.grid.resizeRows(rows);
    }
    if (cols > project.grid.cols) {
      project.grid.resizeCols(cols);
    }

    // clear the existing
    (project.grid as any).contentsMap = {};
    (project.grid as any).formulas = {};

    // reapply cells
    for (const cell of cells) {
      project.grid.setCellRaw(cell.row, cell.col, cell.value);
    }
  } catch (err) {
    console.error("Failed to parse project data from localStorage:", err);
  }
}
