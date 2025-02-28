// packages/textrux/src/ui/GridView.tsx

import "./css/project.css";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { Grid } from "../structure/Grid";
import { parseAndFormatGrid } from "../parser/GridParser";

import { fromCSV, toCSV } from "../util/CSV";
import { fromTSV, toTSV } from "../util/TSV";

import { GridConfig } from "../util/GridConfig";
import { useGridController } from "./controller/GridController";
import { ColumnHeaders } from "./ColumnHeaders";
import { RowHeaders } from "./RowHeaders";
import { GridCells } from "./GridCells";
import { FormulaBar } from "./FormulaBar";
import { AppModal } from "./modal/AppModal";

import {
  saveGridToLocalStorage,
  loadGridFromLocalStorage,
} from "../util/LocalStorageStore";
import Block from "../structure/Block";

export interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface GridViewProps {
  grid: Grid;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  baseRowHeight?: number;
  baseColWidth?: number;
  baseFontSize?: number;
  autoLoadLocalStorage?: boolean; // whether to auto-load on mount
}

export function GridView({
  grid,
  width = "100%",
  height = "100%",
  className = "",
  style = {},
  baseRowHeight = 24,
  baseColWidth = 60,
  baseFontSize = 14,
  autoLoadLocalStorage = false,
}: GridViewProps) {
  const [zoom, setZoom] = useState(1.0);
  const fontSize = baseFontSize * zoom;

  const [rowHeights, setRowHeights] = useState<number[]>(() =>
    Array(grid.rows).fill(baseRowHeight * zoom)
  );
  const [colWidths, setColWidths] = useState<number[]>(() =>
    Array(grid.cols).fill(baseColWidth * zoom)
  );

  // Load from localStorage (if desired):
  useEffect(() => {
    if (autoLoadLocalStorage) {
      loadGridFromLocalStorage(grid);
    }
  }, [autoLoadLocalStorage, grid]);

  // Whenever row/col count or zoom changes, re‐initialize heights/widths:
  useEffect(() => {
    setRowHeights(Array(grid.rows).fill(baseRowHeight * zoom));
    setColWidths(Array(grid.cols).fill(baseColWidth * zoom));
  }, [grid.rows, grid.cols, baseRowHeight, baseColWidth, zoom]);

  // Active cell & selection range
  const [activeRow, setActiveRow] = useState(1);
  const [activeCol, setActiveCol] = useState(1);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    startRow: 1,
    endRow: 1,
    startCol: 1,
    endCol: 1,
  });

  // Anchor for shift‐select
  const anchorRef = useRef<{ row: number; col: number } | null>(null);

  // Container ref for scrolling, pinch/zoom, etc.
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Our pinch & middle‐click panning hook (from GridController):
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown: onGridContainerMouseDown,
    // We'll add a "longPress" event callback for mobile selection:
    isSelectingViaLongPressRef,
    selectionAnchorRef,
  } = useGridController({
    grid,
    zoom,
    setZoom,
    minZoom: 0.2,
    maxZoom: 10,
    colPx: baseColWidth,
    rowPx: baseRowHeight,
    gridContainerRef,
  });

  // Force re‐render trigger
  const [version, setVersion] = useState(0);
  const forceRefresh = useCallback(() => setVersion((v) => v + 1), []);

  // The style map from parser
  const [styleMap, setStyleMap] = useState<Record<string, string[]>>({});
  const [isFormattingDisabled, setFormattingDisabled] = useState(false);

  // Editing cell
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [focusTarget, setFocusTarget] = useState<"cell" | "formula" | null>(
    null
  );

  // Modal open/close
  const [isModalOpen, setModalOpen] = useState(false);

  // Delimiter for file "save" or "load"
  const [currentDelimiter, setCurrentDelimiter] = useState<"tab" | ",">(() => {
    const stored = localStorage.getItem("savedDelimiter");
    if (stored === "tab" || stored === ",") return stored;
    return GridConfig.defaultDelimiter;
  });

  // 1) create a ref to store the blocks
  const blockListRef = useRef<Block[]>([]);

  // Parse & format => also save to localStorage
  const reparse = useCallback(() => {
    if (!isFormattingDisabled) {
      // parse => get styleMap + blockList
      const { styleMap: sm, blockList } = parseAndFormatGrid(grid);
      setStyleMap(sm);
      blockListRef.current = blockList;
    } else {
      setStyleMap({});
      blockListRef.current = []; // no blocks if formatting is disabled
    }
    saveGridToLocalStorage(grid);
  }, [grid, isFormattingDisabled]);

  // Run parse each time version changes (version increments after cell edits, etc.)
  useEffect(() => {
    reparse();
  }, [version, reparse]);

  // ---- Selection by mouse drag (desktop) or long‐press drag (mobile) ----
  // We'll replicate your "dragSelectRef" approach:
  const dragSelectRef = useRef({
    active: false,
    anchorRow: 1,
    anchorCol: 1,
  });

  // `onCellMouseDown` for normal left‐click selection (desktop):
  const handleCellMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      if (editingCell && (editingCell.row !== row || editingCell.col !== col)) {
        // If we had been editing a different cell, commit it:
        commitEdit(editingCell.row, editingCell.col, editingValue);
      }

      dragSelectRef.current.active = true;
      dragSelectRef.current.anchorRow = row;
      dragSelectRef.current.anchorCol = col;

      if (!e.shiftKey) {
        setActiveRow(row);
        setActiveCol(col);
        setSelectionRange({
          startRow: row,
          endRow: row,
          startCol: col,
          endCol: col,
        });
        anchorRef.current = { row, col };
      } else if (anchorRef.current) {
        const startR = anchorRef.current.row;
        const startC = anchorRef.current.col;
        setSelectionRange({
          startRow: Math.min(startR, row),
          endRow: Math.max(startR, row),
          startCol: Math.min(startC, col),
          endCol: Math.max(startC, col),
        });
        setActiveRow(row);
        setActiveCol(col);
      }

      // Focus the container so we can handle keyboard events
      if (!editingCell) {
        gridContainerRef.current?.focus();
      }
    },
    [editingCell, editingValue]
  );

  // `onCellDoubleClick` => edit
  const handleCellDoubleClick = useCallback(
    (row: number, col: number) => {
      const raw = grid.getCellRaw(row, col);
      setEditingValue(raw);
      setEditingCell({ row, col });
      setFocusTarget("cell");
    },
    [grid]
  );

  // measureAndExpand => auto‐resize row/col if the user typed a big multiline
  const measureAndExpand = useCallback(
    (r: number, c: number, text: string) => {
      const lines = text.split("\n");
      let maxLineWidth = 0;
      const ctx = document.createElement("canvas").getContext("2d");
      if (ctx) {
        ctx.font = `${fontSize}px sans-serif`;
        for (const ln of lines) {
          const w = ctx.measureText(ln).width;
          if (w > maxLineWidth) maxLineWidth = w;
        }
      }
      let neededWidth = maxLineWidth + 10;
      const lineHeight = fontSize * 1.2;
      let neededHeight = lines.length * lineHeight + 4;

      const maxColWidth = 4 * baseColWidth * zoom;
      const maxRowHeight = 6 * baseRowHeight * zoom;
      if (neededWidth > maxColWidth) neededWidth = maxColWidth;
      if (neededHeight > maxRowHeight) neededHeight = maxRowHeight;

      setColWidths((old) => {
        const copy = [...old];
        if (c >= 1 && c <= copy.length && neededWidth > copy[c - 1]) {
          copy[c - 1] = neededWidth;
        }
        return copy;
      });
      setRowHeights((old) => {
        const copy = [...old];
        if (r >= 1 && r <= copy.length && neededHeight > copy[r - 1]) {
          copy[r - 1] = neededHeight;
        }
        return copy;
      });
    },
    [fontSize, baseColWidth, baseRowHeight, zoom]
  );

  // `commitEdit` => store into the model
  const commitEdit = useCallback(
    (r: number, c: number, newValue: string, opts?: { escape?: boolean }) => {
      if (!opts?.escape) {
        grid.setCellRaw(r, c, newValue);
        measureAndExpand(r, c, newValue);
      }
      setEditingCell(null);
      setEditingValue("");
      setFocusTarget(null);

      if (isFormattingDisabled) {
        setFormattingDisabled(false);
      }
      forceRefresh();
    },
    [grid, measureAndExpand, forceRefresh, isFormattingDisabled]
  );

  // Similar to your old code: track mousemove on document for drag‐select
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragSelectRef.current.active) return;
      e.preventDefault();
      const container = gridContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      const hoveredRow = findRowByY(y, rowHeights);
      const hoveredCol = findColByX(x, colWidths);

      const aR = dragSelectRef.current.anchorRow;
      const aC = dragSelectRef.current.anchorCol;
      setSelectionRange({
        startRow: Math.min(aR, hoveredRow),
        endRow: Math.max(aR, hoveredRow),
        startCol: Math.min(aC, hoveredCol),
        endCol: Math.max(aC, hoveredCol),
      });
      setActiveRow(hoveredRow);
      setActiveCol(hoveredCol);
    }
    function onMouseUp(e: MouseEvent) {
      if (e.button === 0) {
        dragSelectRef.current.active = false;
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [rowHeights, colWidths]);

  // ---- Touch “long press to select” support ----
  // We rely on GridController to detect a “long press” and set `isSelectingViaLongPressRef.current = true`.
  // Then we do a similar drag as above but for touches:
  useEffect(() => {
    function handleTouchMoveDoc(e: TouchEvent) {
      if (!isSelectingViaLongPressRef.current) return;
      e.preventDefault(); // stop panning
      if (e.touches.length !== 1) return;

      const container = gridContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const t = e.touches[0];
      const x = t.clientX - rect.left + container.scrollLeft;
      const y = t.clientY - rect.top + container.scrollTop;

      // If we never recorded an anchor, bail
      const anchor = selectionAnchorRef.current; // from controller
      if (!anchor) return;

      const hoveredRow = findRowByY(y, rowHeights);
      const hoveredCol = findColByX(x, colWidths);

      setSelectionRange({
        startRow: Math.min(anchor.row, hoveredRow),
        endRow: Math.max(anchor.row, hoveredRow),
        startCol: Math.min(anchor.col, hoveredCol),
        endCol: Math.max(anchor.col, hoveredCol),
      });
      setActiveRow(hoveredRow);
      setActiveCol(hoveredCol);
    }
    function handleTouchEndDoc(e: TouchEvent) {
      isSelectingViaLongPressRef.current = false;
    }

    document.addEventListener("touchmove", handleTouchMoveDoc, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEndDoc);
    document.addEventListener("touchcancel", handleTouchEndDoc);
    return () => {
      document.removeEventListener("touchmove", handleTouchMoveDoc);
      document.removeEventListener("touchend", handleTouchEndDoc);
      document.removeEventListener("touchcancel", handleTouchEndDoc);
    };
  }, [rowHeights, colWidths, isSelectingViaLongPressRef, selectionAnchorRef]);

  // The “arrowNav” function: moves the active cell by +1 row or +1 col, etc.
  const arrowNav = useCallback(
    (key: string) => {
      let dR = 0;
      let dC = 0;
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
    },
    [activeRow, activeCol, grid.rows, grid.cols]
  );

  // The “extendSelection” function: SHIFT+arrow extends selection from anchor
  const extendSelection = useCallback(
    (key: string) => {
      if (!anchorRef.current) {
        anchorRef.current = { row: activeRow, col: activeCol };
      }
      const start = anchorRef.current;
      let dR = 0;
      let dC = 0;
      if (key === "ArrowUp") dR = -1;
      if (key === "ArrowDown") dR = 1;
      if (key === "ArrowLeft") dC = -1;
      if (key === "ArrowRight") dC = 1;

      let newR = activeRow + dR;
      let newC = activeCol + dC;
      if (newR < 1) newR = 1;
      if (newR > grid.rows) newR = grid.rows;
      if (newC < 1) newC = 1;
      if (newC > grid.cols) newC = grid.cols;

      setActiveRow(newR);
      setActiveCol(newC);

      setSelectionRange({
        startRow: Math.min(start.row, newR),
        endRow: Math.max(start.row, newR),
        startCol: Math.min(start.col, newC),
        endCol: Math.max(start.col, newC),
      });
    },
    [activeRow, activeCol, grid.rows, grid.cols]
  );

  ////////////////////////////////////////////////////////////////////////////////
  // 1) The “moveBlock” function: BFS approach to find & move the block
  ////////////////////////////////////////////////////////////////////////////////

  const moveBlock = useCallback(
    (arrowKey: string, allowMerge: boolean) => {
      // 1) Identify which block the active cell is in, by scanning blockListRef:
      const blocks = blockListRef.current; // array of Block
      if (!blocks || !blocks.length) return;

      // Find the block that contains (activeRow, activeCol) in its canvasPoints
      const targetBlock = blocks.find((blk) =>
        blk.canvasPoints.some(
          (pt: { row: number; col: number }) =>
            pt.row === activeRow && pt.col === activeCol
        )
      );
      if (!targetBlock) return; // Active cell not in any block => skip

      // 2) Determine the direction delta (dR, dC)
      let dR = 0,
        dC = 0;
      switch (arrowKey) {
        case "ArrowUp":
          dR = -1;
          break;
        case "ArrowDown":
          dR = 1;
          break;
        case "ArrowLeft":
          dC = -1;
          break;
        case "ArrowRight":
          dC = 1;
          break;
        default:
          return;
      }

      // 3) Check boundaries. If moving would go out of the grid, skip.
      const newTop = targetBlock.topRow + dR;
      const newBottom = targetBlock.bottomRow + dR;
      const newLeft = targetBlock.leftCol + dC;
      const newRight = targetBlock.rightCol + dC;
      if (
        newTop < 1 ||
        newBottom > grid.rows ||
        newLeft < 1 ||
        newRight > grid.cols
      ) {
        // out of range
        return;
      }

      // 4) If allowMerge === false, do a collision check. If we find collision => skip
      if (!allowMerge) {
        // See if the new bounding box of "targetBlock" would intersect
        // another block's bounding box (plus a small proximity).
        for (let b of blocks) {
          if (b === targetBlock) continue; // skip self

          // Quick overlap check between (newTop..newBottom,newLeft..newRight) and b's bounding box
          const noOverlap =
            newRight < b.leftCol - 1 ||
            newLeft > b.rightCol + 1 ||
            newBottom < b.topRow - 1 ||
            newTop > b.bottomRow + 1;
          if (!noOverlap) {
            // They overlap => block the move
            return;
          }
        }
      }

      // 5) All checks passed => move all the block’s canvasPoints in the grid
      //    (This matches your old logic: remove old cells from grid, re‐insert at new coords.)
      //    We'll gather them in a temp, then reassign:

      const oldCells = targetBlock.canvasPoints;
      const buffer: Array<{ row: number; col: number; text: string }> = [];
      // read from grid into buffer
      for (let pt of oldCells) {
        const txt = grid.getCellRaw(pt.row, pt.col);
        buffer.push({ row: pt.row, col: pt.col, text: txt });
        // clear the old cell
        grid.setCellRaw(pt.row, pt.col, "");
      }

      // Update block bounding box
      targetBlock.topRow += dR;
      targetBlock.bottomRow += dR;
      targetBlock.leftCol += dC;
      targetBlock.rightCol += dC;

      // Now set new row/col
      for (let i = 0; i < oldCells.length; i++) {
        const pt = oldCells[i];
        pt.row += dR;
        pt.col += dC;
      }
      // write them back
      for (let item of buffer) {
        const newR = item.row + dR;
        const newC = item.col + dC;
        grid.setCellRaw(newR, newC, item.text);
      }

      // 6) Force re‐render and re‐parse
      forceRefresh();

      // 7) Optionally re‐select the same “relative cell” inside the block
      //    or just set active cell to the newly moved location
      const newActiveRow = activeRow + dR;
      const newActiveCol = activeCol + dC;
      setActiveRow(newActiveRow);
      setActiveCol(newActiveCol);
      setSelectionRange({
        startRow: newActiveRow,
        endRow: newActiveRow,
        startCol: newActiveCol,
        endCol: newActiveCol,
      });
    },
    [
      activeRow,
      activeCol,
      grid,
      styleMap,
      forceRefresh,
      setActiveRow,
      setActiveCol,
      setSelectionRange,
      // presumably blockListRef is also in scope
    ]
  );

  ////////////////////////////////////////////////////////////////////////////////
  // 2) The “selectNearestBlock” function: <Alt+ArrowKey> geometry approach
  ////////////////////////////////////////////////////////////////////////////////

  const selectNearestBlock = useCallback(
    (arrowKey: string) => {
      const blocks = blockListRef.current;
      if (!blocks || !blocks.length) return;

      // 1) Find which block the active cell is in (or treat cell as 1x1 block if none)
      let currentBlock = blocks.find((b) =>
        b.canvasPoints.some(
          (pt: { row: number; col: number }) =>
            pt.row === activeRow && pt.col === activeCol
        )
      );

      let refTop: number, refBottom: number, refLeft: number, refRight: number;
      if (currentBlock) {
        refTop = currentBlock.topRow;
        refBottom = currentBlock.bottomRow;
        refLeft = currentBlock.leftCol;
        refRight = currentBlock.rightCol;
      } else {
        // not in a block => treat as single cell bounding box
        refTop = activeRow;
        refBottom = activeRow;
        refLeft = activeCol;
        refRight = activeCol;
      }

      // We'll define the center of "current block" for distance
      const refCenterR = (refTop + refBottom) / 2;
      const refCenterC = (refLeft + refRight) / 2;

      // 2) Filter candidate blocks based on direction
      const candidates = blocks.filter((b) => {
        if (b === currentBlock) return false;
        switch (arrowKey) {
          case "ArrowUp":
            // block must be “above”
            return b.bottomRow < refTop;
          case "ArrowDown":
            // block must be “below”
            return b.topRow > refBottom;
          case "ArrowLeft":
            // block must be “left”
            return b.rightCol < refLeft;
          case "ArrowRight":
            // block must be “right”
            return b.leftCol > refRight;
          default:
            return false;
        }
      });
      if (!candidates.length) return;

      // 3) pick whichever candidate is “nearest” in Euclidean or “Manhattan” sense
      let nearest: any = null;
      let minDist = Infinity;
      for (let b of candidates) {
        const cR = (b.topRow + b.bottomRow) / 2;
        const cC = (b.leftCol + b.rightCol) / 2;
        const dRow = cR - refCenterR;
        const dCol = cC - refCenterC;
        const dist = Math.sqrt(dRow * dRow + dCol * dCol);
        if (dist < minDist) {
          minDist = dist;
          nearest = b;
        }
      }
      if (!nearest) return;

      // 4) Move selection to the center cell of “nearest”
      const midRow = Math.floor((nearest.topRow + nearest.bottomRow) / 2);
      const midCol = Math.floor((nearest.leftCol + nearest.rightCol) / 2);

      setActiveRow(midRow);
      setActiveCol(midCol);
      setSelectionRange({
        startRow: midRow,
        endRow: midRow,
        startCol: midCol,
        endCol: midCol,
      });
    },
    [
      activeRow,
      activeCol,
      blockListRef,
      setActiveRow,
      setActiveCol,
      setSelectionRange,
    ]
  );

  // “clearSelectedCells” => for <Delete>
  const clearSelectedCells = useCallback(() => {
    const { startRow, endRow, startCol, endCol } = selectionRange;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        grid.setCellRaw(r, c, "");
      }
    }
    forceRefresh();
  }, [selectionRange, grid, forceRefresh]);

  // “maybeEnterNested” => If the active cell starts with comma, we clear out the grid & load that cell's CSV
  const maybeEnterNested = useCallback(() => {
    const raw = grid.getCellRaw(activeRow, activeCol).trim();
    if (!raw.startsWith(",")) return; // Not nested
    // Minimal example: If the cell is “,some CSV lines”
    // we parse that CSV as new grid contents, and store old as caretaker?
    // In your old code, you had “^” in R1C1 to store the parent. We'll do a simpler approach:

    // 1) Save current entire grid to a “parent” key so we can restore on Esc
    const parentCSV = exportGridAsCSV(grid);
    localStorage.setItem("nestedParentCSV", parentCSV);

    // 2) Clear entire grid
    for (let r = 1; r <= grid.rows; r++) {
      for (let c = 1; c <= grid.cols; c++) {
        grid.setCellRaw(r, c, "");
      }
    }

    // 3) Parse the cell's raw CSV (minus the leading comma)
    const subCSV = raw.slice(1);
    const data = fromCSV(subCSV);
    // 4) Place it into the grid:
    importCSVIntoGrid(data, grid);

    forceRefresh();
  }, [activeRow, activeCol, grid]);

  // “maybeExitNested” => If we have a “nestedParentCSV” we restore it
  const maybeExitNested = useCallback(() => {
    const parentCSV = localStorage.getItem("nestedParentCSV");
    if (!parentCSV) return; // no parent
    // 1) Export current as CSV & store it into the active cell with a comma
    const currentCSV = exportGridAsCSV(grid);
    grid.setCellRaw(activeRow, activeCol, "," + currentCSV);

    // 2) Clear entire grid
    for (let r = 1; r <= grid.rows; r++) {
      for (let c = 1; c <= grid.cols; c++) {
        grid.setCellRaw(r, c, "");
      }
    }

    // 3) Load the parent CSV
    const data = fromCSV(parentCSV);
    importCSVIntoGrid(data, grid);

    // 4) Remove the localStorage item
    localStorage.removeItem("nestedParentCSV");
    forceRefresh();
  }, [activeRow, activeCol, grid]);

  // Utility: export entire grid as 2D CSV
  function exportGridAsCSV(g: Grid) {
    let maxR = 0;
    let maxC = 0;
    for (let fill of g.getFilledCells()) {
      if (fill.row > maxR) maxR = fill.row;
      if (fill.col > maxC) maxC = fill.col;
    }
    const arr: string[][] = [];
    for (let r = 0; r < maxR; r++) {
      arr[r] = new Array(maxC).fill("");
    }
    for (let fill of g.getFilledCells()) {
      arr[fill.row - 1][fill.col - 1] = fill.value;
    }
    return toCSV(arr);
  }
  // Utility: import a 2D array from CSV => fill the grid
  function importCSVIntoGrid(data: string[][], g: Grid) {
    const rowCount = data.length;
    let colCount = 0;
    data.forEach((row) => {
      if (row.length > colCount) colCount = row.length;
    });
    if (rowCount > g.rows) g.resizeRows(rowCount);
    if (colCount > g.cols) g.resizeCols(colCount);

    for (let r = 0; r < data.length; r++) {
      for (let c = 0; c < data[r].length; c++) {
        const val = data[r][c];
        if (val.trim()) {
          g.setCellRaw(r + 1, c + 1, val);
        }
      }
    }
  }

  // Keydown handler for cut/copy/paste, moving blocks, etc.
  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // If we are in the middle of editing a cell’s textarea, skip
      if (editingCell) return;

      // Some combos:
      // 1) Cut/copy/paste are typically handled by the browser if we store data in the clipboard
      //    but we can also do “select range => ctrl+c => then ctrl+v => re-insert.”
      //    For brevity, let's just show the key combos:

      // Move entire block => ctrl+arrow
      // Merge => ctrl+alt+arrow
      // Jump => alt+arrow
      if (e.key.startsWith("Arrow")) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // If alt also => allow merge
          const allowMerge = e.altKey;
          moveBlock(e.key, allowMerge);
        } else if (e.altKey) {
          e.preventDefault();
          selectNearestBlock(e.key);
        } else if (e.shiftKey) {
          // SHIFT + arrow => expand selection (like in a typical spreadsheet)
          e.preventDefault();
          extendSelection(e.key);
        } else {
          // plain arrow => move active cell
          e.preventDefault();
          arrowNav(e.key);
        }
      } else if (e.key === "Delete") {
        e.preventDefault();
        // Clear the selected cells
        clearSelectedCells();
      } else if (e.key === "F3") {
        // Enter nested if the cell starts with comma
        e.preventDefault();
        maybeEnterNested();
      } else if (e.key === "Escape") {
        // Exit nested
        e.preventDefault();
        maybeExitNested();
      } else if (e.key === "~" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setFormattingDisabled((prev) => !prev);
        forceRefresh();
      }
    },
    [editingCell, arrowNav, extendSelection, moveBlock, selectNearestBlock]
  );

  // Formula bar logic
  const isEditingActiveCell =
    editingCell &&
    editingCell.row === activeRow &&
    editingCell.col === activeCol;
  const cellRaw = grid.getCellRaw(activeRow, activeCol);
  const formulaText = isEditingActiveCell ? editingValue : cellRaw;

  const onFormulaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFocusTarget("formula");
      if (!isEditingActiveCell) {
        setEditingCell({ row: activeRow, col: activeCol });
      }
      const newVal = e.target.value;
      setEditingValue(newVal);
      measureAndExpand(activeRow, activeCol, newVal);
    },
    [isEditingActiveCell, activeRow, activeCol, measureAndExpand]
  );

  const onFormulaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!editingCell) return;
      if (e.key === "Enter") {
        e.preventDefault();
        commitEdit(editingCell.row, editingCell.col, editingValue);
      } else if (e.key === "Escape") {
        e.preventDefault();
        commitEdit(editingCell.row, editingCell.col, cellRaw, { escape: true });
      }
    },
    [editingCell, commitEdit, editingValue, cellRaw]
  );

  // Calculate total grid dimension for the “big absolute” in GridCells
  const totalGridWidth = useMemo(
    () => colWidths.reduce((a, b) => a + b, 0),
    [colWidths]
  );
  const totalGridHeight = useMemo(
    () => rowHeights.reduce((a, b) => a + b, 0),
    [rowHeights]
  );

  const addressText = `R${activeRow}C${activeCol}`;

  function openModal() {
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }

  // Support “Clear Grid” from the modal
  function clearGrid() {
    if (window.confirm("Are you sure you want to clear the entire grid?")) {
      for (let r = 1; r <= grid.rows; r++) {
        for (let c = 1; c <= grid.cols; c++) {
          grid.setCellRaw(r, c, "");
        }
      }
      forceRefresh();
    }
  }

  // “Save to file” from the modal
  function saveGridToFile() {
    let maxRowUsed = 0;
    let maxColUsed = 0;
    for (let r = 1; r <= grid.rows; r++) {
      for (let c = 1; c <= grid.cols; c++) {
        const val = grid.getCellRaw(r, c).trim();
        if (val !== "") {
          if (r > maxRowUsed) maxRowUsed = r;
          if (c > maxColUsed) maxColUsed = c;
        }
      }
    }
    const arr: string[][] = [];
    for (let rr = 0; rr < maxRowUsed; rr++) {
      arr[rr] = new Array(maxColUsed).fill("");
    }
    for (let rr = 1; rr <= maxRowUsed; rr++) {
      for (let cc = 1; cc <= maxColUsed; cc++) {
        arr[rr - 1][cc - 1] = grid.getCellRaw(rr, cc);
      }
    }
    const text = currentDelimiter === "tab" ? toTSV(arr) : toCSV(arr);

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = currentDelimiter === "tab" ? "myGrid.tsv" : "myGrid.csv";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  // “Load from file”
  function loadGridFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content !== "string") return;
      const isTab = file.name.endsWith(".tsv") || content.indexOf("\t") >= 0;
      const arr = isTab ? fromTSV(content) : fromCSV(content);

      let neededRows = arr.length;
      let neededCols = 0;
      for (const rowArr of arr) {
        if (rowArr.length > neededCols) {
          neededCols = rowArr.length;
        }
      }
      if (neededRows > grid.rows) {
        grid.resizeRows(neededRows);
      }
      if (neededCols > grid.cols) {
        grid.resizeCols(neededCols);
      }
      // Clear
      for (let r = 1; r <= grid.rows; r++) {
        for (let c = 1; c <= grid.cols; c++) {
          grid.setCellRaw(r, c, "");
        }
      }
      // Fill
      for (let r = 0; r < arr.length; r++) {
        for (let c = 0; c < arr[r].length; c++) {
          const val = arr[r][c];
          if (val.trim()) {
            grid.setCellRaw(r + 1, c + 1, val);
          }
        }
      }

      forceRefresh();
    };
    reader.readAsText(file);
  }

  function loadExample(ex: {
    name: string;
    file: string;
    description: string;
  }) {
    fetch(ex.file)
      .then((res) => res.text())
      .then((content) => {
        const delim = content.indexOf("\t") >= 0 ? "\t" : ",";
        const arr = delim === "\t" ? fromTSV(content) : fromCSV(content);

        let neededRows = arr.length;
        let neededCols = 0;
        for (const rowArr of arr) {
          if (rowArr.length > neededCols) {
            neededCols = rowArr.length;
          }
        }
        if (neededRows > grid.rows) {
          grid.resizeRows(neededRows);
        }
        if (neededCols > grid.cols) {
          grid.resizeCols(neededCols);
        }
        // Clear
        for (let r = 1; r <= grid.rows; r++) {
          for (let c = 1; c <= grid.cols; c++) {
            grid.setCellRaw(r, c, "");
          }
        }
        // Fill
        for (let r = 0; r < arr.length; r++) {
          for (let c = 0; c < arr[r].length; c++) {
            const val = arr[r][c];
            if (val.trim()) {
              grid.setCellRaw(r + 1, c + 1, val);
            }
          }
        }

        forceRefresh();
      })
      .catch((err) => {
        console.error("Failed to load example", err);
      });
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height, ...style }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.preventDefault();
        // For file drop
        const file = e.dataTransfer.files[0];
        if (file) {
          loadGridFromFile(file);
        }
      }}
    >
      {/* Formula bar */}
      <FormulaBar
        address={addressText}
        formulaText={formulaText}
        onFormulaChange={onFormulaChange}
        onFormulaKeyDown={onFormulaKeyDown}
        onFocus={() => {
          setFocusTarget("formula");
          if (!editingCell) {
            setEditingCell({ row: activeRow, col: activeCol });
          }
        }}
        onGearClick={() => setModalOpen(true)}
      />

      {/* Main area: row/col headers + scrollable cells */}
      <div className="absolute left-0 right-0 bottom-0" style={{ top: "3rem" }}>
        {/* top-left corner cell */}
        <div
          className="absolute top-0 left-0 bg-gray-200 border-b border-r border-gray-600 flex items-center justify-center z-10"
          style={{ width: 50, height: 30 }}
        >
          #
        </div>

        <ColumnHeaders
          grid={grid}
          rowHeights={rowHeights}
          colWidths={colWidths}
          fontSize={fontSize}
          version={version}
          gridContainerRef={gridContainerRef}
        />

        <RowHeaders
          grid={grid}
          rowHeights={rowHeights}
          colWidths={colWidths}
          fontSize={fontSize}
          version={version}
          gridContainerRef={gridContainerRef}
        />

        <div
          ref={gridContainerRef}
          className="absolute top-[30px] left-[50px] right-0 bottom-0 overflow-auto bg-white noselect"
          onMouseDown={onGridContainerMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onKeyDown={handleContainerKeyDown}
          tabIndex={0}
        >
          <div
            className="relative"
            style={{ width: totalGridWidth, height: totalGridHeight }}
          >
            <GridCells
              grid={grid}
              version={version}
              rowHeights={rowHeights}
              colWidths={colWidths}
              selectionRange={selectionRange}
              activeRow={activeRow}
              activeCol={activeCol}
              editingCell={editingCell}
              fontSize={fontSize}
              onCellMouseDown={handleCellMouseDown}
              onCellClick={() => {}}
              onCellDoubleClick={handleCellDoubleClick}
              onCommitEdit={commitEdit}
              onKeyboardNav={() => {}}
              measureAndExpand={measureAndExpand}
              sharedEditingValue={editingValue}
              setSharedEditingValue={setEditingValue}
              styleMap={styleMap}
            />
          </div>
        </div>
      </div>

      <AppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentDelimiter={currentDelimiter}
        setCurrentDelimiter={setCurrentDelimiter}
        clearGrid={clearGrid}
        saveGridToFile={saveGridToFile}
        loadGridFromFile={loadGridFromFile}
        loadExample={loadExample}
      />
    </div>
  );
}

// Helpers for row/col detection
function findRowByY(y: number, rowHeights: number[]): number {
  let cum = 0;
  for (let i = 0; i < rowHeights.length; i++) {
    const h = rowHeights[i];
    if (y >= cum && y < cum + h) return i + 1;
    cum += h;
  }
  return rowHeights.length;
}
function findColByX(x: number, colWidths: number[]): number {
  let cum = 0;
  for (let i = 0; i < colWidths.length; i++) {
    const w = colWidths[i];
    if (x >= cum && x < cum + w) return i + 1;
    cum += w;
  }
  return colWidths.length;
}
