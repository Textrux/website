/* packages/textrux/src/ui/GridView.tsx */

import "./css/project.css";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  CSSProperties,
} from "react";
import { Grid } from "../structure/Grid";
import Block from "../structure/Block";

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

/** The row/col selection range in the spreadsheet. */
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
  autoLoadLocalStorage?: boolean;
}

/**
 * A helper to check if (r, c) is "inside" a block's canvas
 * — i.e. within bounding box but not in the frame/border.
 */
function isCellInBlockCanvas(b: Block, row: number, col: number): boolean {
  if (row < b.topRow || row > b.bottomRow) return false;
  if (col < b.leftCol || col > b.rightCol) return false;

  // Exclude border or frame cells if you only want the "filled" region
  const isBorder = b.borderPoints.some(
    (pt) => pt.row === row && pt.col === col
  );
  const isFrame = b.framePoints.some((pt) => pt.row === row && pt.col === col);
  // So "canvas" means neither border nor frame:
  return !isBorder && !isFrame;
}

/**
 * Auto-scroll the grid container so that the (row,col) cell is visible.
 */
function scrollCellIntoView(
  row: number,
  col: number,
  rowHeights: number[],
  colWidths: number[],
  container: HTMLDivElement | null
) {
  if (!container) return;

  // The top of row r is sum of rowHeights up to r-1:
  const top = rowHeights.slice(0, row - 1).reduce((a, b) => a + b, 0);
  const cellHeight = rowHeights[row - 1] || 0;

  const left = colWidths.slice(0, col - 1).reduce((a, b) => a + b, 0);
  const cellWidth = colWidths[col - 1] || 0;

  // If the cell is above the visible region
  if (top < container.scrollTop) {
    container.scrollTop = Math.max(0, top - 2);
  }
  // If the cell is below the visible region
  else if (top + cellHeight > container.scrollTop + container.clientHeight) {
    container.scrollTop = top + cellHeight - container.clientHeight + 2;
  }
  // If the cell is left of the visible region
  if (left < container.scrollLeft) {
    container.scrollLeft = Math.max(0, left - 2);
  }
  // If the cell is right of the visible region
  else if (left + cellWidth > container.scrollLeft + container.clientWidth) {
    container.scrollLeft = left + cellWidth - container.clientWidth + 2;
  }
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

  /** Active cell & selection range */
  const [activeRow, setActiveRow] = useState(1);
  const [activeCol, setActiveCol] = useState(1);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    startRow: 1,
    endRow: 1,
    startCol: 1,
    endCol: 1,
  });

  /** For shift+arrow expansions */
  const anchorRef = useRef<{ row: number; col: number } | null>(null);

  /** Container ref for scroll & zoom actions */
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  /** From the pinch/middle-click drag hook: */
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown: onGridContainerMouseDown,
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

  /** Force a re-render whenever we do major changes */
  const [version, setVersion] = useState(0);
  const forceRefresh = useCallback(() => setVersion((v) => v + 1), []);

  /** The style map from parseAndFormatGrid */
  const [styleMap, setStyleMap] = useState<Record<string, string[]>>({});
  const [isFormattingDisabled, setFormattingDisabled] = useState(false);

  /** Editing cell (row,col) + the text that’s being typed */
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [focusTarget, setFocusTarget] = useState<"cell" | "formula" | null>(
    null
  );

  /** Show/hide modal popup */
  const [isModalOpen, setModalOpen] = useState(false);

  /** Track CSV vs TSV in the modal */
  const [currentDelimiter, setCurrentDelimiter] = useState<"tab" | ",">(() => {
    const stored = localStorage.getItem("savedDelimiter");
    if (stored === "tab" || stored === ",") return stored;
    return GridConfig.defaultDelimiter;
  });

  /** We store the blockList from parseAndFormat, so we can do block moves. */
  const blockListRef = useRef<Block[]>([]);

  /** Also store a “clipboard” for cut/copy/paste of ranges. */
  const [clipboardData, setClipboardData] = useState<string[][] | null>(null);
  const [isCutMode, setIsCutMode] = useState(false);

  /** On mount, optionally load from local storage. */
  useEffect(() => {
    if (autoLoadLocalStorage) {
      loadGridFromLocalStorage(grid);
    }
  }, [autoLoadLocalStorage, grid]);

  /** Whenever row/col count or zoom changes, reinitialize rowHeights/colWidths. */
  useEffect(() => {
    setRowHeights(Array(grid.rows).fill(baseRowHeight * zoom));
    setColWidths(Array(grid.cols).fill(baseColWidth * zoom));
  }, [grid.rows, grid.cols, baseRowHeight, baseColWidth, zoom]);

  /**
   * Re-parse the grid => styleMap => blockList => store to localStorage
   */
  const reparse = useCallback(() => {
    if (!isFormattingDisabled) {
      const { styleMap: sm, blockList } = parseAndFormatGrid(grid);
      setStyleMap(sm);
      blockListRef.current = blockList;
    } else {
      setStyleMap({});
      blockListRef.current = [];
    }
    // auto-save
    saveGridToLocalStorage(grid);
  }, [grid, isFormattingDisabled]);

  // Call parse each time version changes
  useEffect(() => {
    reparse();
  }, [version, reparse]);

  /** Drag-select (desktop). Track in a ref, watch mousemove on doc. */
  const dragSelectRef = useRef<{
    active: boolean;
    anchorRow: number;
    anchorCol: number;
  }>({ active: false, anchorRow: 1, anchorCol: 1 });

  /**
   * handleCellMouseDown => begin selection on left-click
   */
  const handleCellMouseDown = useCallback(
    (r: number, c: number, e: React.MouseEvent) => {
      if (editingCell && (editingCell.row !== r || editingCell.col !== c)) {
        // commit the old cell first
        const oldVal = editingValue;
        grid.setCellRaw(editingCell.row, editingCell.col, oldVal);
        setEditingCell(null);
        setEditingValue("");
        setFocusTarget(null);
        forceRefresh();
      }

      if (e.button === 0) {
        dragSelectRef.current.active = true;
        dragSelectRef.current.anchorRow = r;
        dragSelectRef.current.anchorCol = c;

        if (!e.shiftKey) {
          setActiveRow(r);
          setActiveCol(c);
          setSelectionRange({
            startRow: r,
            endRow: r,
            startCol: c,
            endCol: c,
          });
          anchorRef.current = { row: r, col: c };
        } else if (anchorRef.current) {
          const startR = anchorRef.current.row;
          const startC = anchorRef.current.col;
          setSelectionRange({
            startRow: Math.min(startR, r),
            endRow: Math.max(startR, r),
            startCol: Math.min(startC, c),
            endCol: Math.max(startC, c),
          });
          setActiveRow(r);
          setActiveCol(c);
        }

        // focus container for keyboard
        if (!editingCell) {
          gridContainerRef.current?.focus();
        }
      }
    },
    [editingCell, editingValue, grid, forceRefresh]
  );

  /**
   * handleCellDoubleClick => begin editing
   */
  const handleCellDoubleClick = useCallback(
    (r: number, c: number) => {
      const raw = grid.getCellRaw(r, c);
      setEditingValue(raw);
      setEditingCell({ row: r, col: c });
      setFocusTarget("cell");
    },
    [grid]
  );

  /**
   * measureAndExpand => auto-resize row/col if typed multiline text is big
   */
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

  /** commitEdit => store newValue to grid unless opts?.escape. */
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

  /** Listen to doc mousemove/up for drag select. */
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragSelectRef.current.active) return;
      e.preventDefault();
      const container = gridContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      // find row/col
      let hoveredRow = findRowByY(y, rowHeights);
      let hoveredCol = findColByX(x, colWidths);

      let aR = dragSelectRef.current.anchorRow;
      let aC = dragSelectRef.current.anchorCol;
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

  /** Similarly handle long-press drag on mobile from the useGridController ref. */
  useEffect(() => {
    function handleTouchMoveDoc(e: TouchEvent) {
      if (!isSelectingViaLongPressRef.current) return;
      e.preventDefault();
      if (e.touches.length !== 1) return;

      const container = gridContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const t = e.touches[0];
      const x = t.clientX - rect.left + container.scrollLeft;
      const y = t.clientY - rect.top + container.scrollTop;

      const anchor = selectionAnchorRef.current;
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
    function handleTouchEndDoc(_e: TouchEvent) {
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

  /**
   * arrowNav => move active cell up/down/left/right by 1
   */
  const arrowNav = useCallback(
    (key: string) => {
      let dR = 0;
      let dC = 0;
      if (key === "ArrowUp") dR = -1;
      if (key === "ArrowDown") dR = 1;
      if (key === "ArrowLeft") dC = -1;
      if (key === "ArrowRight") dC = 1;

      let newR = Math.max(1, Math.min(grid.rows, activeRow + dR));
      let newC = Math.max(1, Math.min(grid.cols, activeCol + dC));
      setActiveRow(newR);
      setActiveCol(newC);
      setSelectionRange({
        startRow: newR,
        endRow: newR,
        startCol: newC,
        endCol: newC,
      });
      anchorRef.current = { row: newR, col: newC };
      // auto-scroll:
      scrollCellIntoView(
        newR,
        newC,
        rowHeights,
        colWidths,
        gridContainerRef.current
      );
    },
    [activeRow, activeCol, grid.rows, grid.cols, rowHeights, colWidths]
  );

  /**
   * extendSelection => SHIFT+arrow expands from anchorRef
   */
  const extendSelection = useCallback(
    (key: string) => {
      if (!anchorRef.current) {
        anchorRef.current = { row: activeRow, col: activeCol };
      }
      let start = anchorRef.current;

      let dR = 0,
        dC = 0;
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
      scrollCellIntoView(
        newR,
        newC,
        rowHeights,
        colWidths,
        gridContainerRef.current
      );
    },
    [activeRow, activeCol, grid.rows, grid.cols, rowHeights, colWidths]
  );

  /**
   * moveBlock => Ctrl+Arrow or Ctrl+Alt+Arrow
   */
  const moveBlock = useCallback(
    (arrowKey: string, allowMerge: boolean) => {
      const blocks = blockListRef.current;
      if (!blocks.length) return;

      // find block that "contains" (activeRow, activeCol)
      const targetBlock = blocks.find((b) =>
        isCellInBlockCanvas(b, activeRow, activeCol)
      );
      if (!targetBlock) return;

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

      // check boundaries
      const newTop = targetBlock.topRow + dR;
      const newBot = targetBlock.bottomRow + dR;
      const newLeft = targetBlock.leftCol + dC;
      const newRight = targetBlock.rightCol + dC;
      if (
        newTop < 1 ||
        newBot > grid.rows ||
        newLeft < 1 ||
        newRight > grid.cols
      ) {
        return;
      }

      // collision check if !allowMerge
      if (!allowMerge) {
        for (const b of blocks) {
          if (b === targetBlock) continue;
          // Quick bounding box overlap
          const noOverlap =
            newRight < b.leftCol ||
            newLeft > b.rightCol ||
            newBot < b.topRow ||
            newTop > b.bottomRow;
          if (!noOverlap) {
            return; // skip movement
          }
        }
      }

      // do the move
      // gather old cell text => re-insert at new coords
      const oldCells = targetBlock.canvasPoints;
      const buffer: Array<{ row: number; col: number; text: string }> = [];
      for (let pt of oldCells) {
        const txt = grid.getCellRaw(pt.row, pt.col);
        buffer.push({ row: pt.row, col: pt.col, text: txt });
        grid.setCellRaw(pt.row, pt.col, "");
      }
      // shift the block bounding box
      targetBlock.topRow += dR;
      targetBlock.bottomRow += dR;
      targetBlock.leftCol += dC;
      targetBlock.rightCol += dC;
      for (let i = 0; i < oldCells.length; i++) {
        const pt = oldCells[i];
        pt.row += dR;
        pt.col += dC;
      }
      // re-insert
      for (let item of buffer) {
        const newR = item.row + dR;
        const newC = item.col + dC;
        grid.setCellRaw(newR, newC, item.text);
      }

      forceRefresh();

      // shift active cell too
      const newActiveR = activeRow + dR;
      const newActiveC = activeCol + dC;
      setActiveRow(newActiveR);
      setActiveCol(newActiveC);
      setSelectionRange({
        startRow: newActiveR,
        endRow: newActiveR,
        startCol: newActiveC,
        endCol: newActiveC,
      });
      scrollCellIntoView(
        newActiveR,
        newActiveC,
        rowHeights,
        colWidths,
        gridContainerRef.current
      );
    },
    [activeRow, activeCol, grid, forceRefresh, rowHeights, colWidths]
  );

  /**
   * selectNearestBlock => Alt+Arrow
   */
  const selectNearestBlock = useCallback(
    (arrowKey: string) => {
      const blocks = blockListRef.current;
      if (!blocks.length) return;

      // find which block we’re in (or treat single cell as a bounding box)
      let curBlock = blocks.find((b) =>
        isCellInBlockCanvas(b, activeRow, activeCol)
      );
      let top: number, bot: number, left: number, right: number;
      if (curBlock) {
        top = curBlock.topRow;
        bot = curBlock.bottomRow;
        left = curBlock.leftCol;
        right = curBlock.rightCol;
      } else {
        top = activeRow;
        bot = activeRow;
        left = activeCol;
        right = activeCol;
      }
      const refCenterR = (top + bot) / 2;
      const refCenterC = (left + right) / 2;

      // filter by direction
      let candidates = blocks.filter((b) => {
        if (b === curBlock) return false;
        switch (arrowKey) {
          case "ArrowUp":
            return b.bottomRow < top;
          case "ArrowDown":
            return b.topRow > bot;
          case "ArrowLeft":
            return b.rightCol < left;
          case "ArrowRight":
            return b.leftCol > right;
          default:
            return false;
        }
      });
      if (!candidates.length) return;

      // pick whichever is nearest
      let nearest: Block | null = null;
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
      scrollCellIntoView(
        midRow,
        midCol,
        rowHeights,
        colWidths,
        gridContainerRef.current
      );
    },
    [activeRow, activeCol, rowHeights, colWidths]
  );

  /**
   * clearSelectedCells => for Delete
   */
  const clearSelectedCells = useCallback(() => {
    const { startRow, endRow, startCol, endCol } = selectionRange;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        grid.setCellRaw(r, c, "");
      }
    }
    forceRefresh();
  }, [selectionRange, grid, forceRefresh]);

  /**
   * maybeEnterNested => F3
   */
  const maybeEnterNested = useCallback(() => {
    const raw = grid.getCellRaw(activeRow, activeCol).trim();
    if (!raw.startsWith(",")) return;
    // minimal approach as in your sample
    // ...
    // do your nested logic
  }, [activeRow, activeCol, grid]);

  /**
   * maybeExitNested => Esc
   */
  const maybeExitNested = useCallback(() => {
    // ...
    // If your cell starts with ^ or you stored a parent CSV in localStorage
  }, [activeRow, activeCol, grid]);

  /** ---------- COPY/CUT/PASTE ---------- */

  const copySelection = useCallback(() => {
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
    setClipboardData(out);
    setIsCutMode(false);
  }, [selectionRange, grid]);

  const cutSelection = useCallback(() => {
    copySelection();
    setIsCutMode(true);
  }, [copySelection]);

  const pasteSelection = useCallback(() => {
    if (!clipboardData) return;
    const { startRow, endRow, startCol, endCol } = selectionRange;
    const selRows = endRow - startRow + 1;
    const selCols = endCol - startCol + 1;

    // If we have a 1x1 selection in the spreadsheet but multi-size in clipboard => paste the entire block starting there
    if (selRows === 1 && selCols === 1) {
      for (let r = 0; r < clipboardData.length; r++) {
        for (let c = 0; c < clipboardData[r].length; c++) {
          const rr = startRow + r;
          const cc = startCol + c;
          // if needed, resize grid
          if (rr > grid.rows) grid.resizeRows(rr);
          if (cc > grid.cols) grid.resizeCols(cc);
          grid.setCellRaw(rr, cc, clipboardData[r][c]);
        }
      }
      if (isCutMode) {
        // Clear old cells from the "cut" region if you want to emulate "move"
        // ...
        setIsCutMode(false);
      }
    } else {
      // multi→multi
      const dataRows = clipboardData.length;
      const dataCols = Math.max(...clipboardData.map((arr) => arr.length));

      // If 1x1 data => fill entire selection with that
      if (dataRows === 1 && dataCols === 1) {
        const val = clipboardData[0][0];
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            grid.setCellRaw(r, c, val);
          }
        }
        if (isCutMode) {
          // Possibly remove the old cut region
          setIsCutMode(false);
        }
      } else {
        // If user’s selection is same size or bigger, we can do row by row:
        for (let r = 0; r < Math.min(dataRows, selRows); r++) {
          for (let c = 0; c < Math.min(dataCols, selCols); c++) {
            const rr = startRow + r;
            const cc = startCol + c;
            grid.setCellRaw(rr, cc, clipboardData[r][c]);
          }
        }
        // If isCutMode => remove old cells or not
        setIsCutMode(false);
      }
    }
    forceRefresh();
  }, [clipboardData, selectionRange, grid, isCutMode, forceRefresh]);

  /** main keydown for selection, block moves, cut/copy/paste, etc. */
  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (editingCell) return; // skip if we’re actively editing

      if (e.key.startsWith("Arrow")) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // ctrl + arrow => move block
          const allowMerge = e.altKey;
          moveBlock(e.key, allowMerge);
        } else if (e.altKey) {
          e.preventDefault();
          selectNearestBlock(e.key);
        } else if (e.shiftKey) {
          e.preventDefault();
          extendSelection(e.key);
        } else {
          e.preventDefault();
          arrowNav(e.key);
        }
      } else if (e.key === "Delete") {
        e.preventDefault();
        clearSelectedCells();
      } else if (e.key === "F3") {
        e.preventDefault();
        maybeEnterNested();
      } else if (e.key === "Escape") {
        e.preventDefault();
        maybeExitNested();
      }
      // Cut/copy/paste
      else if ((e.key === "c" || e.key === "C") && e.ctrlKey) {
        e.preventDefault();
        copySelection();
      } else if ((e.key === "x" || e.key === "X") && e.ctrlKey) {
        e.preventDefault();
        cutSelection();
      } else if ((e.key === "v" || e.key === "V") && e.ctrlKey) {
        e.preventDefault();
        pasteSelection();
      }
      // Toggle structural formatting
      else if (e.key === "~" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setFormattingDisabled((prev) => !prev);
        forceRefresh();
      }
      // If user typed a normal character => start editing
      else if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        e.preventDefault();
        setEditingCell({ row: activeRow, col: activeCol });
        setFocusTarget("cell");
        setEditingValue(e.key);
      }
    },
    [
      editingCell,
      arrowNav,
      extendSelection,
      moveBlock,
      selectNearestBlock,
      clearSelectedCells,
      maybeEnterNested,
      maybeExitNested,
      copySelection,
      cutSelection,
      pasteSelection,
      activeRow,
      activeCol,
      setFormattingDisabled,
      forceRefresh,
    ]
  );

  /**
   * Formula bar logic
   */
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

  /** total grid dimension */
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

  function saveGridToFile() {
    let maxRowUsed = 0;
    let maxColUsed = 0;
    for (let fill of grid.getFilledCells()) {
      if (fill.row > maxRowUsed) maxRowUsed = fill.row;
      if (fill.col > maxColUsed) maxColUsed = fill.col;
    }
    const arr: string[][] = [];
    for (let r = 0; r < maxRowUsed; r++) {
      arr[r] = new Array(maxColUsed).fill("");
    }
    for (let fill of grid.getFilledCells()) {
      arr[fill.row - 1][fill.col - 1] = fill.value;
    }
    const text = currentDelimiter === "tab" ? toTSV(arr) : toCSV(arr);

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = currentDelimiter === "tab" ? "myGrid.tsv" : "myGrid.csv";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

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
        for (let rowArr of arr) {
          if (rowArr.length > neededCols) neededCols = rowArr.length;
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

/** Helper to find which row is at `y` offset. */
function findRowByY(y: number, rowHeights: number[]): number {
  let cum = 0;
  for (let r = 0; r < rowHeights.length; r++) {
    if (y < cum + rowHeights[r]) {
      return r + 1;
    }
    cum += rowHeights[r];
  }
  return rowHeights.length;
}

/** Helper to find which col is at `x` offset. */
function findColByX(x: number, colWidths: number[]): number {
  let cum = 0;
  for (let c = 0; c < colWidths.length; c++) {
    if (x < cum + colWidths[c]) {
      return c + 1;
    }
    cum += colWidths[c];
  }
  return colWidths.length;
}
