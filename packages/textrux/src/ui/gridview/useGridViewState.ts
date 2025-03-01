import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "../../structure/Grid";
import {
  loadGridFromLocalStorage,
  saveGridToLocalStorage,
} from "../../util/LocalStorageStore";
import { parseAndFormatGrid } from "../../parser/GridParser";
import type { SelectionRange } from "./GridView.types";

/**
 * Return an object holding all the relevant state for GridView:
 * - rowHeights, colWidths, zoom, etc
 * - selectionRange, activeCell, editingCell, editingValue, styleMap
 * - a `forceRefresh` that triggers re-parse
 */
export function useGridViewState(
  grid: Grid,
  {
    autoLoadLocalStorage,
    baseRowHeight,
    baseColWidth,
    baseFontSize,
  }: {
    autoLoadLocalStorage?: boolean;
    baseRowHeight: number;
    baseColWidth: number;
    baseFontSize: number;
  }
) {
  // Zoom factor: e.g. pinch-zoom or ctrl+wheel
  const [zoom, setZoom] = useState(1.0);

  // rowHeights & colWidths store actual pixel sizes of each row/column
  const [rowHeights, setRowHeights] = useState<number[]>(() =>
    Array(grid.rows).fill(baseRowHeight * zoom)
  );
  const [colWidths, setColWidths] = useState<number[]>(() =>
    Array(grid.cols).fill(baseColWidth * zoom)
  );

  // Active cell and selection
  const [activeRow, setActiveRow] = useState(1);
  const [activeCol, setActiveCol] = useState(1);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    startRow: 1,
    endRow: 1,
    startCol: 1,
    endCol: 1,
  });

  // For SHIFT+arrow expansions
  const anchorRef = useRef<{ row: number; col: number } | null>(null);

  // Editing
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [focusTarget, setFocusTarget] = useState<"cell" | "formula" | null>(
    null
  );

  // Re-render version
  const [version, setVersion] = useState(0);
  const forceRefresh = useCallback(() => setVersion((v) => v + 1), []);

  // For structural formatting
  const [isFormattingDisabled, setFormattingDisabled] = useState(false);

  // The styleMap from parseAndFormatGrid
  const [styleMap, setStyleMap] = useState<Record<string, string[]>>({});

  // On mount, optionally load from localStorage
  useEffect(() => {
    if (autoLoadLocalStorage) {
      loadGridFromLocalStorage(grid);
    }
  }, [autoLoadLocalStorage, grid]);

  // If the row/col counts or zoom changes, reset rowHeights/colWidths
  useEffect(() => {
    setRowHeights(Array(grid.rows).fill(baseRowHeight * zoom));
    setColWidths(Array(grid.cols).fill(baseColWidth * zoom));
  }, [grid.rows, grid.cols, zoom, baseRowHeight, baseColWidth]);

  /**
   * Re-parse the grid => styleMap => store in state => also store in localStorage
   */
  const reparseGrid = useCallback(() => {
    if (!isFormattingDisabled) {
      const { styleMap: sm, blockList } = parseAndFormatGrid(grid);
      setStyleMap(sm);
      // if you need the blockList, you can store it in a ref or in state
      // e.g. blockListRef.current = blockList;
    } else {
      setStyleMap({});
    }
    // store to localStorage to keep data
    saveGridToLocalStorage(grid);
  }, [grid, isFormattingDisabled]);

  // Whenever version changes, re-parse
  useEffect(() => {
    reparseGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  return {
    // state
    zoom,
    setZoom,
    rowHeights,
    setRowHeights,
    colWidths,
    setColWidths,

    activeRow,
    setActiveRow,
    activeCol,
    setActiveCol,
    selectionRange,
    setSelectionRange,
    anchorRef,

    editingCell,
    setEditingCell,
    editingValue,
    setEditingValue,
    focusTarget,
    setFocusTarget,

    version,
    forceRefresh,

    isFormattingDisabled,
    setFormattingDisabled,
    styleMap,
    setStyleMap,

    reparseGrid,
  };
}
