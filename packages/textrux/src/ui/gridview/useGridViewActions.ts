import { useCallback } from "react";
import { Grid } from "../../structure/Grid";
import { SelectionRange } from "./GridView.types";

interface UseGridViewActionsParams {
  grid: Grid;
  rowHeights: number[];
  colWidths: number[];
  zoom: number;
  baseRowHeight: number;
  baseColWidth: number;
  editingCell: { row: number; col: number } | null;
  editingValue: string;
  isFormattingDisabled: boolean;

  // updaters
  setRowHeights: (val: (prev: number[]) => number[]) => void;
  setColWidths: (val: (prev: number[]) => number[]) => void;
  setEditingCell: (val: any) => void;
  setEditingValue: (val: any) => void;
  setFocusTarget: (val: any) => void;
  setFormattingDisabled: (val: (prev: boolean) => boolean) => void;

  forceRefresh: () => void;
}

/**
 * Encapsulates the main actions to manipulate the grid or local state:
 * - measureAndExpand
 * - commitEdit
 * - clearSelectedCells
 */
export function useGridViewActions({
  grid,
  rowHeights,
  colWidths,
  zoom,
  baseRowHeight,
  baseColWidth,
  editingCell,
  editingValue,
  isFormattingDisabled,

  setRowHeights,
  setColWidths,
  setEditingCell,
  setEditingValue,
  setFocusTarget,
  setFormattingDisabled,

  forceRefresh,
}: UseGridViewActionsParams) {
  /**
   * Measure text in an offscreen <textarea> and expand row/col accordingly.
   */
  const measureAndExpand = useCallback(
    (r: number, c: number, text: string) => {
      // 1) Create a hidden <textarea> with the same wrapping rules
      const hidden = document.createElement("textarea");
      hidden.style.position = "absolute";
      hidden.style.visibility = "hidden";
      hidden.style.zIndex = "-9999";
      hidden.style.whiteSpace = "pre-wrap";
      hidden.style.overflow = "hidden";
      hidden.style.wordBreak = "break-word";

      // Our font size is baseFont * zoom. For simplicity, we can guess line-height
      const fontSizePx = 14; // or pass in
      const actualFontSize = fontSizePx * zoom; // if you want it dynamic
      hidden.style.fontSize = actualFontSize + "px";
      hidden.style.lineHeight = "1.2";

      // Start with the current col width
      const currentWidth = colWidths[c - 1] || baseColWidth * zoom;
      hidden.style.width = currentWidth + "px";

      hidden.value = text;
      document.body.appendChild(hidden);

      // 2) Read .scrollWidth / .scrollHeight
      const neededWidth = hidden.scrollWidth + 2;
      const neededHeight = hidden.scrollHeight + 2;

      document.body.removeChild(hidden);

      // 3) Clamp
      const maxColW = 4 * baseColWidth * zoom;
      const maxRowH = 6 * baseRowHeight * zoom;

      const finalWidth = Math.min(neededWidth, maxColW);
      const finalHeight = Math.min(neededHeight, maxRowH);

      // 4) Expand rowHeights / colWidths if needed
      setColWidths((old) => {
        const copy = [...old];
        if (c >= 1 && c <= copy.length && finalWidth > copy[c - 1]) {
          copy[c - 1] = finalWidth;
        }
        return copy;
      });
      setRowHeights((old) => {
        const copy = [...old];
        if (r >= 1 && r <= copy.length && finalHeight > copy[r - 1]) {
          copy[r - 1] = finalHeight;
        }
        return copy;
      });
    },
    [
      rowHeights,
      colWidths,
      zoom,
      baseRowHeight,
      baseColWidth,
      setRowHeights,
      setColWidths,
    ]
  );

  /**
   * Commit an edit to the grid
   */
  const commitEdit = useCallback(
    (r: number, c: number, newValue: string, opts?: { escape?: boolean }) => {
      if (!opts?.escape) {
        grid.setCellRaw(r, c, newValue);
        measureAndExpand(r, c, newValue);
      }
      setEditingCell(null);
      setEditingValue("");
      setFocusTarget(null);

      // If user had disabled formatting, re-enable it
      if (isFormattingDisabled) {
        setFormattingDisabled(() => false);
      }
      forceRefresh();
    },
    [
      grid,
      isFormattingDisabled,
      measureAndExpand,
      setEditingCell,
      setEditingValue,
      setFocusTarget,
      setFormattingDisabled,
      forceRefresh,
    ]
  );

  /**
   * Clear selected cells
   */
  const clearSelectedCells = useCallback(
    (range: SelectionRange) => {
      const { startRow, endRow, startCol, endCol } = range;
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          grid.setCellRaw(r, c, "");
        }
      }
      forceRefresh();
    },
    [grid, forceRefresh]
  );

  /**
   * If we were editing a different cell, commit that one first
   */
  const maybeCommitOtherEditingCell = useCallback(
    (targetRow: number, targetCol: number) => {
      if (
        editingCell &&
        (editingCell.row !== targetRow || editingCell.col !== targetCol)
      ) {
        // commit the old cell with the last known editingValue
        const oldRow = editingCell.row;
        const oldCol = editingCell.col;
        const oldVal = editingValue;
        grid.setCellRaw(oldRow, oldCol, oldVal);
        setEditingCell(null);
        setEditingValue("");
        setFocusTarget(null);
        forceRefresh();
      }
    },
    [
      editingCell,
      editingValue,
      grid,
      setEditingCell,
      setEditingValue,
      setFocusTarget,
      forceRefresh,
    ]
  );

  return {
    measureAndExpand,
    commitEdit,
    clearSelectedCells,
    maybeCommitOtherEditingCell,
  };
}
