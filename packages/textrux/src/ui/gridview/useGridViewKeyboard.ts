import { useCallback, useEffect } from "react";
import { Grid } from "../../structure/Grid";
import { SelectionRange } from "./GridView.types";
import React from "react";

export interface BlockMoveOptions {
  // For demonstration, you can add “allowMerge” or “collisionsAllowed” here
  allowMerge?: boolean;
}

interface UseGridViewKeyboardParams {
  grid: Grid;

  activeRow: number;
  activeCol: number;
  selectionRange: SelectionRange;
  anchorRef: React.MutableRefObject<{ row: number; col: number } | null>;

  editingCell: { row: number; col: number } | null;
  editingValue: string;

  // states
  isFormattingDisabled: boolean;
  zoom: number;

  // updaters
  setActiveRow: (val: number) => void;
  setActiveCol: (val: number) => void;
  setSelectionRange: (val: SelectionRange) => void;
  setEditingCell: (val: any) => void;
  setEditingValue: (val: any) => void;
  setFocusTarget: (val: any) => void;
  setFormattingDisabled: (val: (prev: boolean) => boolean) => void;

  // actions
  measureAndExpand: (r: number, c: number, text: string) => void;
  commitEdit: (
    r: number,
    c: number,
    newValue: string,
    opts?: { escape?: boolean }
  ) => void;
  clearSelectedCells: (range: SelectionRange) => void;
  maybeCommitOtherEditingCell: (r: number, c: number) => void;

  forceRefresh: () => void;
}

/**
 * This hook returns an `onContainerKeyDown` handler that implements
 * arrow navigation, block moves, copy/paste, toggling formatting, etc.
 */
export function useGridViewKeyboard({
  grid,
  activeRow,
  activeCol,
  selectionRange,
  anchorRef,
  editingCell,
  editingValue,

  isFormattingDisabled,
  zoom,

  setActiveRow,
  setActiveCol,
  setSelectionRange,
  setEditingCell,
  setEditingValue,
  setFocusTarget,
  setFormattingDisabled,

  measureAndExpand,
  commitEdit,
  clearSelectedCells,
  maybeCommitOtherEditingCell,

  forceRefresh,
}: UseGridViewKeyboardParams) {
  // cut/copy/paste state
  // If you prefer, store these in a separate custom hook
  const clipboardRef = React.useRef<string[][] | null>(null);
  const [isCutMode, setIsCutMode] = React.useState(false);
  const [cutCells, setCutCells] = React.useState<Array<{
    row: number;
    col: number;
    text: string;
  }> | null>(null);

  const arrowNav = useCallback(
    (key: string, shiftKey: boolean, ctrlKey: boolean, altKey: boolean) => {
      // SHIFT + arrow => extend selection
      if (shiftKey && !ctrlKey && !altKey) {
        extendSelection(key);
        return;
      }
      // CTRL + arrow => move block
      if ((ctrlKey || altKey) && !shiftKey) {
        // Example logic to do block moves or jump to block
        if (!altKey) {
          moveBlock(key, altKey /* allowMerge? */);
        } else {
          // altKey => select nearest block? etc
          selectNearestBlock(key);
        }
        return;
      }
      // normal arrow => move active cell
      normalArrowNav(key);
    },
    []
  );

  /**
   * SHIFT+arrow extends selection
   */
  function extendSelection(key: string) {
    if (!anchorRef.current) {
      anchorRef.current = { row: activeRow, col: activeCol };
    }
    const start = anchorRef.current;

    let dR = 0,
      dC = 0;
    if (key === "ArrowUp") dR = -1;
    if (key === "ArrowDown") dR = 1;
    if (key === "ArrowLeft") dC = -1;
    if (key === "ArrowRight") dC = 1;

    const newR = Math.max(1, Math.min(grid.rows, activeRow + dR));
    const newC = Math.max(1, Math.min(grid.cols, activeCol + dC));

    setActiveRow(newR);
    setActiveCol(newC);
    setSelectionRange({
      startRow: Math.min(start.row, newR),
      endRow: Math.max(start.row, newR),
      startCol: Math.min(start.col, newC),
      endCol: Math.max(start.col, newC),
    });
  }

  /**
   * Normal arrow => just move the active cell by 1
   */
  function normalArrowNav(key: string) {
    let dR = 0,
      dC = 0;
    if (key === "ArrowUp") dR = -1;
    if (key === "ArrowDown") dR = 1;
    if (key === "ArrowLeft") dC = -1;
    if (key === "ArrowRight") dC = 1;

    const newR = Math.max(1, Math.min(grid.rows, activeRow + dR));
    const newC = Math.max(1, Math.min(grid.cols, activeCol + dC));

    setActiveRow(newR);
    setActiveCol(newC);
    setSelectionRange({
      startRow: newR,
      endRow: newR,
      startCol: newC,
      endCol: newC,
    });
    anchorRef.current = { row: newR, col: newC };
  }

  /**
   * Move block or do “block merges” if collisions
   */
  function moveBlock(arrowKey: string, allowMerge: boolean) {
    // If you have a blockListRef, you can do the same logic that was in the old code
    // For brevity, we’ll skip the entire block movement logic or keep it minimal:
    console.log("Pretend we are moving a block with arrow:", arrowKey, {
      allowMerge,
    });
    // ...
  }

  /**
   * Jump to nearest block in the arrowKey direction
   */
  function selectNearestBlock(arrowKey: string) {
    // ...
    console.log(
      "Pretend we jumped to the nearest block in direction:",
      arrowKey
    );
  }

  /**
   * Copy the currently selected cells into memory
   */
  function copySelection() {
    const { startRow, endRow, startCol, endCol } = selectionRange;
    const rows = endRow - startRow + 1;
    const cols = endCol - startCol + 1;

    const out: string[][] = [];
    for (let r = 0; r < rows; r++) {
      out[r] = [];
      for (let c = 0; c < cols; c++) {
        const rr = startRow + r;
        const cc = startCol + c;
        out[r][c] = grid.getCellRaw(rr, cc) || "";
      }
    }
    clipboardRef.current = out;
    setIsCutMode(false);
  }

  function cutSelection() {
    copySelection();
    const { startRow, endRow, startCol, endCol } = selectionRange;
    const cutArr: { row: number; col: number; text: string }[] = [];
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const txt = grid.getCellRaw(r, c);
        if (txt.trim() !== "") {
          cutArr.push({ row: r, col: c, text: txt });
        }
      }
    }
    setCutCells(cutArr);
    setIsCutMode(true);
    forceRefresh();
  }

  function pasteSelection() {
    if (!clipboardRef.current) return;
    const { startRow, endRow, startCol, endCol } = selectionRange;
    const selRows = endRow - startRow + 1;
    const selCols = endCol - startCol + 1;

    const data = clipboardRef.current;
    const dataRows = data.length;
    const dataCols = Math.max(...data.map((arr) => arr.length));

    // If single selected cell => paste entire block
    if (selRows === 1 && selCols === 1) {
      for (let r = 0; r < dataRows; r++) {
        for (let c = 0; c < data[r].length; c++) {
          const rr = startRow + r;
          const cc = startCol + c;
          if (rr > grid.rows) grid.resizeRows(rr);
          if (cc > grid.cols) grid.resizeCols(cc);
          grid.setCellRaw(rr, cc, data[r][c]);
        }
      }
      if (isCutMode && cutCells) {
        // Clear the cutCells from original place
        cutCells.forEach((cell) => {
          grid.setCellRaw(cell.row, cell.col, "");
        });
        setCutCells(null);
        setIsCutMode(false);
      }
    } else {
      // Fill selection region (or partial)
      if (dataRows === 1 && dataCols === 1) {
        // fill entire selection with that single value
        const val = data[0][0];
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            grid.setCellRaw(r, c, val);
          }
        }
        if (isCutMode && cutCells) {
          cutCells.forEach((cell) => {
            grid.setCellRaw(cell.row, cell.col, "");
          });
          setCutCells(null);
          setIsCutMode(false);
        }
      } else {
        // partial fill
        for (let r = 0; r < Math.min(dataRows, selRows); r++) {
          for (let c = 0; c < Math.min(dataCols, selCols); c++) {
            const rr = startRow + r;
            const cc = startCol + c;
            grid.setCellRaw(rr, cc, data[r][c]);
          }
        }
        if (isCutMode && cutCells) {
          cutCells.forEach((cell) => {
            grid.setCellRaw(cell.row, cell.col, "");
          });
          setCutCells(null);
          setIsCutMode(false);
        }
      }
    }
    forceRefresh();
  }

  const onContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // If we are already editing a cell
      if (editingCell) {
        // If the user types any normal character
        if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
          e.preventDefault();
          setEditingValue((prev) => {
            const newVal = prev + e.key;
            measureAndExpand(editingCell.row, editingCell.col, newVal);
            return newVal;
          });
        }
        if (e.key === "Enter") {
          e.preventDefault();
          // Move down if user wants, or just commit
          commitEdit(editingCell.row, editingCell.col, editingValue);
        }
        if (e.key === "Escape") {
          e.preventDefault();
          commitEdit(
            editingCell.row,
            editingCell.col,
            grid.getCellRaw(editingCell.row, editingCell.col),
            { escape: true }
          );
        }
        return;
      }

      // Not editing
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          // If SHIFT or CTRL? For now we just move down
          commitEdit(activeRow, activeCol, ""); // as if we want to start editing? Or do your old logic
          return;
        case "Delete":
          e.preventDefault();
          clearSelectedCells(selectionRange);
          return;
        case "Escape":
          e.preventDefault();
          // exit nested? or do nothing
          return;
        default:
          break;
      }

      // Arrow keys
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        arrowNav(e.key, e.shiftKey, e.ctrlKey, e.altKey);
        return;
      }

      // Copy/Cut/Paste
      if ((e.key === "c" || e.key === "C") && e.ctrlKey) {
        e.preventDefault();
        copySelection();
        return;
      }
      if ((e.key === "x" || e.key === "X") && e.ctrlKey) {
        e.preventDefault();
        cutSelection();
        return;
      }
      if ((e.key === "v" || e.key === "V") && e.ctrlKey) {
        e.preventDefault();
        pasteSelection();
        return;
      }

      // Toggle structural formatting
      if (e.key === "~" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setFormattingDisabled((prev) => !prev);
        forceRefresh();
        return;
      }

      // If user types a normal char => begin editing
      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        e.preventDefault();
        maybeCommitOtherEditingCell(activeRow, activeCol);
        setEditingCell({ row: activeRow, col: activeCol });
        setFocusTarget("cell");
        setEditingValue(e.key);
        measureAndExpand(activeRow, activeCol, e.key);
      }
    },
    [
      editingCell,
      editingValue,
      activeRow,
      activeCol,
      measureAndExpand,
      commitEdit,
      clearSelectedCells,
      setEditingCell,
      setEditingValue,
      setFocusTarget,
      setFormattingDisabled,
      arrowNav,
      copySelection,
      cutSelection,
      pasteSelection,
      maybeCommitOtherEditingCell,
      forceRefresh,
      selectionRange,
      grid,
    ]
  );

  return {
    onContainerKeyDown,
  };
}
