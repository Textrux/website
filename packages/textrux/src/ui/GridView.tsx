/* eslint-disable @typescript-eslint/no-explicit-any */
import "./css/project.css";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import GridModel from "../model/GridModel";
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
import {
  arrayToGrid,
  embedGridIntoR1C1,
  getDepthFromCsv,
  replaceDeepMarkerInWrapper,
  sheetToCsv,
} from "../util/EmbeddedHelper";
import { Scrubber } from "./Scrubber";
import {
  displayNextElevatedGridHelper,
  enterElevatedGridHelper,
  exitElevatedGridHelper,
} from "../util/ElevatedHelpers";

/** The row/col selection range in the spreadsheet. */
export interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface GridViewProps {
  grid: GridModel;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  baseRowHeight?: number;
  baseColWidth?: number;
  baseFontSize?: number;
  autoLoadLocalStorage?: boolean;
}

// LocalStorage keys
const LS_TOP_LEFT_CELL = "savedTopLeftCell";
const LS_GRID_ZOOM_LEVEL = "savedGridZoomLevel";
const LS_SELECTED_CELL = "savedSelectedCell";

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

  return !isBorder && !isFrame;
}

/**
 * Scroll the container so that (topRow, leftCol) becomes the top-left in view.
 */
function scrollToCell(
  topRow: number,
  leftCol: number,
  rowHeights: number[],
  colWidths: number[],
  container: HTMLDivElement | null
) {
  if (!container) return;

  let scrollTop = 0;
  for (let r = 0; r < topRow - 1; r++) {
    scrollTop += rowHeights[r] || 0;
  }
  let scrollLeft = 0;
  for (let c = 0; c < leftCol - 1; c++) {
    scrollLeft += colWidths[c] || 0;
  }
  container.scrollTop = scrollTop;
  container.scrollLeft = scrollLeft;
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

  // vertical
  if (top < container.scrollTop) {
    container.scrollTop = Math.max(0, top - 2);
  } else if (top + cellHeight > container.scrollTop + container.clientHeight) {
    container.scrollTop = top + cellHeight - container.clientHeight + 2;
  }

  // horizontal
  if (left < container.scrollLeft) {
    container.scrollLeft = Math.max(0, left - 2);
  } else if (left + cellWidth > container.scrollLeft + container.clientWidth) {
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
  //
  // 1) Load the saved grid zoom (default = 1.0) from localStorage
  //
  const storedZoomRaw = localStorage.getItem(LS_GRID_ZOOM_LEVEL);
  const initialZoom = storedZoomRaw ? parseFloat(storedZoomRaw) : 1.0;
  const [zoom, setZoom] = useState<number>(initialZoom);

  // Whenever zoom changes, save to localStorage
  useEffect(() => {
    localStorage.setItem(LS_GRID_ZOOM_LEVEL, String(zoom));
  }, [zoom]);

  // Derive the actual font size
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

  /** Re-render version */
  const [version, setVersion] = useState(0);
  const forceRefresh = useCallback(() => setVersion((v) => v + 1), []);

  /** Style map from parseAndFormatGrid */
  const [styleMap, setStyleMap] = useState<Record<string, string[]>>({});
  const [isFormattingDisabled, setFormattingDisabled] = useState(false);

  /** Editing cell + typed text */
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [focusTarget, setFocusTarget] = useState<"cell" | "formula" | null>(
    null
  );

  /** Modal for settings, CSV vs TSV, etc. */
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentDelimiter, setCurrentDelimiter] = useState<"tab" | ",">(() => {
    const stored = localStorage.getItem("savedDelimiter");
    if (stored === "tab" || stored === ",") return stored;
    return GridConfig.defaultDelimiter;
  });

  // Function to update state and persist to localStorage
  const updateDelimiter = (delim: "tab" | ",") => {
    setCurrentDelimiter(delim);
    localStorage.setItem("savedDelimiter", delim);
  };

  /** For block movement logic */
  const blockListRef = useRef<Block[]>([]);

  /** For cut/copy/paste logic */
  const [clipboardData, setClipboardData] = useState<string[][] | null>(null);
  const [isCutMode, setIsCutMode] = useState(false);
  const [cutRange, setCutRange] = useState<SelectionRange | null>(null);
  interface CutCell {
    row: number;
    col: number;
    text: string;
  }
  const [cutCells, setCutCells] = useState<CutCell[] | null>(null);

  // Optionally load from localStorage once
  useEffect(() => {
    if (autoLoadLocalStorage) {
      loadGridFromLocalStorage(grid);
    }
  }, [autoLoadLocalStorage, grid]);

  // Re-init rowHeights/colWidths if row/col count changes or zoom changes
  useEffect(() => {
    setRowHeights(Array(grid.rows).fill(baseRowHeight * zoom));
    setColWidths(Array(grid.cols).fill(baseColWidth * zoom));
  }, [grid.rows, grid.cols, baseRowHeight, baseColWidth, zoom]);

  /**
   * Re-parse => styleMap => blockList => store to localStorage
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
    saveGridToLocalStorage(grid);
  }, [grid, isFormattingDisabled]);

  // Run parse whenever version changes
  useEffect(() => {
    reparse();
  }, [version, reparse]);

  //
  // Restore topLeftCell on mount (after rowHeights/colWidths are set):
  //
  useEffect(() => {
    const saved = localStorage.getItem(LS_TOP_LEFT_CELL);
    if (saved) {
      const m = saved.match(/^R(\d+)C(\d+)$/);
      if (m) {
        const r = parseInt(m[1], 10);
        const c = parseInt(m[2], 10);
        scrollToCell(r, c, rowHeights, colWidths, gridContainerRef.current);
      }
    }
  }, [rowHeights, colWidths]);

  //
  // Whenever the user scrolls, update localStorage with new topLeftCell
  //
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    function handleScroll() {
      const { scrollTop, scrollLeft } = container;

      // Figure out which row is at (or near) the top:
      let cumY = 0;
      let topRow = 1;
      for (let i = 0; i < rowHeights.length; i++) {
        if (scrollTop < cumY + rowHeights[i]) {
          topRow = i + 1;
          break;
        }
        cumY += rowHeights[i];
      }
      if (topRow > 1) {
        topRow++;
      }

      // Figure out which col is at (or near) the left:
      let cumX = 0;
      let leftCol = 1;
      for (let j = 0; j < colWidths.length; j++) {
        if (scrollLeft < cumX + colWidths[j]) {
          leftCol = j + 1;
          break;
        }
        cumX += colWidths[j];
      }

      if (leftCol > 1) {
        leftCol++;
      }

      const topLeft = `R${topRow}C${leftCol}`;
      localStorage.setItem(LS_TOP_LEFT_CELL, topLeft);
    }

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [rowHeights, colWidths]);

  // Restore the selected cell
  useEffect(() => {
    const savedCell = localStorage.getItem(LS_SELECTED_CELL);
    if (savedCell) {
      try {
        const { row, col } = JSON.parse(savedCell);
        setActiveRow(row);
        setActiveCol(col);
        setSelectionRange({
          startRow: row,
          endRow: row,
          startCol: col,
          endCol: col,
        });
      } catch (error) {
        console.error("Failed to load saved selected cell:", error);
      }
    }
  }, []);

  /** Drag-select logic for desktop (left click + drag) */
  const dragSelectRef = useRef({
    active: false,
    anchorRow: 1,
    anchorCol: 1,
  });

  const handleCellMouseDown = useCallback(
    (r: number, c: number, e: React.MouseEvent) => {
      // if we’re editing a different cell, commit it first
      if (editingCell && (editingCell.row !== r || editingCell.col !== c)) {
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
          // SHIFT+click
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

        // focus for keyboard
        if (!editingCell) {
          gridContainerRef.current?.focus();
        }
      }
    },
    [editingCell, editingValue, grid, forceRefresh]
  );

  const handleCellClick = (r: number, c: number) => {
    setActiveRow(r);
    setActiveCol(c);
    setSelectionRange({
      startRow: r,
      endRow: r,
      startCol: c,
      endCol: c,
    });

    // Save to localStorage
    localStorage.setItem(LS_SELECTED_CELL, JSON.stringify({ row: r, col: c }));

    // Ensure the cell is properly selected but NOT put into editing mode
    setEditingCell(null);
    setEditingValue("");
    setFocusTarget(null);
  };

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
   * measureAndExpand => measure wrapped text by placing it in
   * an offscreen <textarea> or <div> with the same styles.
   */
  function measureAndExpand(r: number, c: number, text: string) {
    // 1) Create a hidden <textarea> matching the real editor’s styles
    const hidden = document.createElement("textarea");
    hidden.style.position = "absolute";
    hidden.style.visibility = "hidden";
    hidden.style.zIndex = "-9999";

    // Match the styles used in CellView’s <textarea>
    hidden.style.whiteSpace = "pre-wrap";
    hidden.style.wordBreak = "break-word";
    hidden.style.overflowY = "scroll";
    hidden.style.lineHeight = "1.2";
    hidden.style.fontSize = fontSize + "px";
    hidden.style.padding = "4px";
    hidden.style.boxSizing = "border-box";

    // Start with the current column width
    const currentWidth = colWidths[c - 1] ?? baseColWidth * zoom;
    hidden.style.width = currentWidth + "px";

    hidden.value = text;
    document.body.appendChild(hidden);

    // 2) Check the needed scrollWidth / scrollHeight
    const neededWidth = hidden.scrollWidth;
    const neededHeight = hidden.scrollHeight;

    document.body.removeChild(hidden);

    // 3) Add some safety clamp so it doesn’t grow unbounded
    const finalWidth = Math.min(neededWidth + 2, 6 * baseColWidth * zoom);
    const finalHeight = Math.min(neededHeight + 2, 6 * baseRowHeight * zoom);

    // 4) Actually update the rowHeights/colWidths
    setColWidths((old) => {
      if (!old[c - 1]) return old;
      const current = old[c - 1];
      // Only update if it’s at least ~3px bigger
      if (finalWidth - current >= 3) {
        const copy = [...old];
        copy[c - 1] = finalWidth;
        return copy;
      }
      return old;
    });

    setRowHeights((old) => {
      if (!old[r - 1]) return old;
      const current = old[r - 1];
      if (finalHeight - current >= 3) {
        const copy = [...old];
        copy[r - 1] = finalHeight;
        return copy;
      }
      return old;
    });
  }

  function handleKeyboardNav(
    r: number,
    c: number,
    direction: "up" | "down" | "left" | "right" | "down-right" | "down-left"
  ) {
    let newR = r;
    let newC = c;

    switch (direction) {
      case "up":
        newR = r - 1;
        break;
      case "down":
        newR = r + 1;
        break;
      case "left":
        newC = c - 1;
        break;
      case "right":
        newC = c + 1;
        break;
      case "down-right":
        newR = r + 1;
        newC = c + 1;
        break;
      case "down-left":
        newR = r + 1;
        newC = c - 1;
        break;
    }

    // clamp within grid bounds
    if (newR < 1) newR = 1;
    if (newR > grid.rows) newR = grid.rows;
    if (newC < 1) newC = 1;
    if (newC > grid.cols) newC = grid.cols;

    // update the active cell & selection
    setActiveRow(newR);
    setActiveCol(newC);
    setSelectionRange({
      startRow: newR,
      endRow: newR,
      startCol: newC,
      endCol: newC,
    });

    // Scroll the new cell into view
    scrollCellIntoView(
      newR,
      newC,
      rowHeights,
      colWidths,
      gridContainerRef.current
    );

    // IMPORTANT: Re-focus the container so keystrokes go to it.
    // This fixes the "can't type after pressing Enter" issue.
    gridContainerRef.current?.focus();
  }

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

  // Document-level mouse up/move for drag selection
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragSelectRef.current.active) return;
      e.preventDefault();
      const container = gridContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      // find row/col by scanning rowHeights/colWidths
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

  // 1) Intermediary step: show the next elevated level
  const displayNextElevatedGrid = useCallback(() => {
    displayNextElevatedGridHelper(grid);
  }, [grid]);

  // 2) Actual “enter” the elevated grid
  const enterElevatedGrid = useCallback(() => {
    enterElevatedGridHelper(grid);
  }, [grid]);

  // 3) Exit back to a lower level
  const exitElevatedGrid = useCallback(() => {
    exitElevatedGridHelper(grid);
  }, [grid]);

  /** Setup pinch/middle-click drag from custom hook */
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
    displayNextElevatedGrid,
    enterElevatedGrid,
    exitElevatedGrid,
    gridContainerRef,
  });

  // Touch-based long-press logic
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
    function handleTouchEndDoc() {
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

  // Arrow navigation
  const arrowNav = useCallback(
    (key: string) => {
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

  // SHIFT+arrow extends selection
  const extendSelection = useCallback(
    (key: string) => {
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

  // Ctrl+Arrow => move block
  const moveBlock = useCallback(
    (arrowKey: string, allowMerge: boolean) => {
      const blocks = blockListRef.current;
      if (!blocks.length) return;

      // find block that contains our active cell
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
      }
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

      // check collisions if not allowMerge
      if (!allowMerge) {
        const framePad = 1; // how many rows/cols the frame extends beyond the block

        const newTop = targetBlock.topRow - framePad + dR;
        const newBot = targetBlock.bottomRow + framePad + dR;
        const newLeft = targetBlock.leftCol - framePad + dC;
        const newRight = targetBlock.rightCol + framePad + dC;

        // Now check all other blocks with their frame space too:
        for (const b of blocks) {
          if (b === targetBlock) continue;

          const bTop = b.topRow - framePad;
          const bBot = b.bottomRow + framePad;
          const bLeft = b.leftCol - framePad;
          const bRight = b.rightCol + framePad;

          // If these rectangles overlap, return without moving (prevents “merge”):
          const noOverlap =
            newRight < bLeft ||
            newLeft > bRight ||
            newBot < bTop ||
            newTop > bBot;
          if (!noOverlap) {
            return; // Skip the move entirely
          }
        }

        // If we get here, there’s no collision => proceed with the move
      }

      // --- START TRANSACTION ---
      grid.beginTransaction();

      // gather old cell data
      const oldCells = targetBlock.canvasPoints;
      const buffer: Array<{ row: number; col: number; text: string }> = [];
      for (const pt of oldCells) {
        const txt = grid.getCellRaw(pt.row, pt.col);
        buffer.push({ row: pt.row, col: pt.col, text: txt });
        grid.setCellRaw(pt.row, pt.col, "");
      }
      targetBlock.topRow += dR;
      targetBlock.bottomRow += dR;
      targetBlock.leftCol += dC;
      targetBlock.rightCol += dC;
      for (let i = 0; i < oldCells.length; i++) {
        oldCells[i].row += dR;
        oldCells[i].col += dC;
      }
      // re-insert
      for (const item of buffer) {
        const newR = item.row + dR;
        const newC = item.col + dC;
        grid.setCellRaw(newR, newC, item.text);
      }

      // Done editing cells => end the transaction
      grid.endTransaction();

      forceRefresh();

      // shift active cell
      const newActiveR = activeRow + dR;
      const newActiveC = activeCol + dC;

      anchorRef.current = { row: newActiveR, col: newActiveC };

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
    [activeRow, activeCol, rowHeights, colWidths, grid, forceRefresh]
  );

  // Alt+Arrow => jump to nearest block
  const selectNearestBlock = useCallback(
    (arrowKey: string) => {
      const blocks = blockListRef.current;
      if (!blocks.length) return;

      // Find the current block, or treat the active cell as a 1x1 block.
      const curBlock = blocks.find((b) =>
        isCellInBlockCanvas(b, activeRow, activeCol)
      );

      const referenceBlock = curBlock || {
        topRow: activeRow,
        bottomRow: activeRow,
        leftCol: activeCol,
        rightCol: activeCol,
      };

      const refCenterR = (referenceBlock.topRow + referenceBlock.bottomRow) / 2;
      const refCenterC = (referenceBlock.leftCol + referenceBlock.rightCol) / 2;

      // Filter candidate blocks based on movement direction.
      const candidates = blocks.filter((b) => {
        if (b === curBlock) return false;
        switch (arrowKey) {
          case "ArrowRight":
            return b.leftCol > referenceBlock.rightCol;
          case "ArrowLeft":
            return b.rightCol < referenceBlock.leftCol;
          case "ArrowDown":
            return b.topRow > referenceBlock.bottomRow;
          case "ArrowUp":
            return b.bottomRow < referenceBlock.topRow;
          default:
            return false;
        }
      });

      if (!candidates.length) return;

      // Apply directional bias to penalize misalignment.
      const directionalBias = 3;
      let nearest: Block | null = null;
      let minDist = Infinity;

      for (const b of candidates) {
        const cR = (b.topRow + b.bottomRow) / 2;
        const cC = (b.leftCol + b.rightCol) / 2;

        // Adjust weight to prioritize the movement direction.
        let weightRow = 1,
          weightCol = 1;
        if (arrowKey === "ArrowRight" || arrowKey === "ArrowLeft") {
          weightRow = directionalBias; // Penalize row misalignment for horizontal movement.
        } else if (arrowKey === "ArrowUp" || arrowKey === "ArrowDown") {
          weightCol = directionalBias; // Penalize column misalignment for vertical movement.
        }

        const dRow = cR - refCenterR;
        const dCol = cC - refCenterC;
        const dist = Math.sqrt(
          (dRow * weightRow) ** 2 + (dCol * weightCol) ** 2
        );

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

  const clearSelectedCells = useCallback(() => {
    const { startRow, endRow, startCol, endCol } = selectionRange;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        grid.setCellRaw(r, c, "");
      }
    }
    forceRefresh();
  }, [selectionRange, grid, forceRefresh]);

  const enterEmbeddedGrid = useCallback(() => {
    // Markers / patterns used for embedded grids:
    //  - A cell that starts with "," indicates it has an embedded grid.
    //  - The first cell on the grid (R1C1) can contain '^' plus CSV for parent grid.
    //  - When we enter an embedded grid, the containing cell’s contents are replaced with a marker like `<<)1(>>`in the parent CSV.
    //  - When we enter an embedded grid from an embedded grid, the `<<)1(>>`in the parent CSV is replaced with `<<(1),b,<<)2(>>,,(1)>>` where `<<)1(>>` is replaced with `<<(1)` and `(1)>>` and the CSV from the first embedded grid is placed inside with a marker (`<<)2(>>` showing which cell the second embedded grid is in)

    // 1) Get the raw text in the currently active cell
    let initialActiveCellContents = grid
      .getCellRaw(activeRow, activeCol)
      .trim();

    // 2) If it's empty, turn it into a comma cell
    if (!initialActiveCellContents) {
      initialActiveCellContents = ",";
      grid.setCellRaw(activeRow, activeCol, initialActiveCellContents);
    }

    // console.log("initialActiveCellContents", initialActiveCellContents);

    // 3) Only proceed if it starts with a comma (indicating a nested cell)
    if (!initialActiveCellContents.startsWith(",")) {
      return;
    }

    // 4) Determine current depth from R1C1 (top-left cell)
    const initialR1C1CellContents = grid.getCellRaw(1, 1);

    // console.log("initialR1C1CellContents", initialR1C1CellContents);

    let initialDepth = 0;
    if (initialR1C1CellContents.startsWith("^")) {
      // Attempt to see if there's a marker like `^...<<)2(>>...`
      initialDepth = getDepthFromCsv(initialR1C1CellContents);
    }

    // console.log("initialDepth", initialDepth);

    // 5) Insert a marker at the active cell for deeper nesting
    const nextDepth = initialDepth + 1;
    // console.log("nextDepth", nextDepth);

    const activeCellMarkerUsedInNextGrid = `<<)${nextDepth}(>>`;
    // console.log(
    //   "activeCellMarkerUsedInNextGrid",
    //   activeCellMarkerUsedInNextGrid
    // );

    grid.setCellRaw(activeRow, activeCol, activeCellMarkerUsedInNextGrid);
    // console.log(
    //   "setting active cell contents to ",
    //   activeCellMarkerUsedInNextGrid
    // );

    // 6) Convert the entire initial sheet to CSV (excluding the active cell)
    const initialSheetAsCsv = sheetToCsv(grid, true);
    // console.log("initialSheetAsCsv", initialSheetAsCsv);

    // 7) Wipe the entire grid to start fresh
    (grid as any).contentsMap = {};
    (grid as any).formulas = {};

    // console.log("clearing entire grid");

    // 8) Parse the child CSV (just "," for an empty grid) and fill the grid
    const initialActiveCellAsGrid = fromCSV(initialActiveCellContents);
    // console.log("initialActiveCellAsGrid", initialActiveCellAsGrid);

    // console.log("converting grid to initialActiveCellAsGrid");
    arrayToGrid(grid, initialActiveCellAsGrid);

    // console.log("R1C1 is now empty and needs to be populated");

    // 9) Update R1C1 to store the parent CSV correctly
    let nextR1C1Contents: string;
    if (initialDepth === 0) {
      // First-time nesting: store as `^` + CSV
      nextR1C1Contents = `^${initialSheetAsCsv}`;
    } else {
      // Deeper nesting: correctly replace the marker
      nextR1C1Contents = replaceDeepMarkerInWrapper(
        initialR1C1CellContents,
        initialDepth,
        initialSheetAsCsv
      );
    }

    // console.log("nextR1C1Contents:", nextR1C1Contents);
    if (initialDepth === 0 || initialR1C1CellContents.startsWith("^")) {
      // console.log("setting R1C1 to nextR1C1Contents");
      grid.setCellRaw(1, 1, nextR1C1Contents);
    }

    // 10) Force a refresh of the UI
    forceRefresh();

    // 11) Move selection to R1C2
    setActiveRow(1);
    setActiveCol(2);
    setSelectionRange({
      startRow: 1,
      endRow: 1,
      startCol: 2,
      endCol: 2,
    });
  }, [
    grid,
    activeRow,
    activeCol,
    forceRefresh,
    setActiveRow,
    setActiveCol,
    setSelectionRange,
  ]);

  const exitEmbeddedGrid = useCallback(() => {
    // 1) Check R1C1. If it doesn't start with '^', there's no parent to return to.
    const initialR1C1Contents = grid.getCellRaw(1, 1);
    if (!initialR1C1Contents.startsWith("^")) {
      return; // Not nested
    }

    // 2) Figure out the current depth
    const initialDepth = getDepthFromCsv(initialR1C1Contents);
    if (initialDepth < 1) {
      // Means we can’t go up any further
      return;
    }

    const initialR1C1ContentsWithoutCaret = initialR1C1Contents.substring(1); // remove the '^'

    // 3) Convert the entire *current* sheet to CSV, skipping R1C1 if it starts with '^':
    //    This is the "child CSV" that we want to embed back into the parent.
    let initialGridAsCsv = sheetToCsv(grid, true);
    if (!initialGridAsCsv.trim()) {
      initialGridAsCsv = ","; // Ensure there's at least one empty cell
    }

    // 4) Clear out the entire grid before restoring the parent
    (grid as any).contentsMap = {};
    (grid as any).formulas = {};

    let nextGridAsArray: string[][];
    let nextGridAsCsvWithMarker: string;
    let prevActiveRow = 1;
    let prevActiveCol = 1;

    if (initialDepth === 1) {
      nextGridAsCsvWithMarker = initialR1C1ContentsWithoutCaret;

      // we are returning to the base grid
      const nextGridAsCsvWithInitialGridEmbedded = embedGridIntoR1C1(
        initialR1C1ContentsWithoutCaret,
        initialDepth,
        initialGridAsCsv
      );

      // 7) Parse the parent text (which no longer has '^') and fill the grid
      nextGridAsArray = fromCSV(nextGridAsCsvWithInitialGridEmbedded);
    } else {
      // we are going from an embedded grid back out to another embedded grid

      // Look in the parent CSV (in cell R1C1)
      // and grab out the part of that CSV that represents the next highest level
      // So in the example below, if the currentDepth is 2 then grab out all
      // the CSV between <<(1) and (1)>> since that is the CSV for the next level
      // ^,,,
      // ,,,
      // ,,a,
      // ,,,<<(1),,,
      // ,,,
      // ,,b,
      // ,,,<<)2(>>(1)>>
      const nextDepth = initialDepth - 1;
      const nextGridWithoutTrailer = initialR1C1Contents.split(
        `(${nextDepth})>>`
      )[0]; // Get everything before "(depth)>>"
      nextGridAsCsvWithMarker = nextGridWithoutTrailer.split(
        `<<(${nextDepth})`
      )[1]; // Get everything after "<<(depth)"

      // In our example we now have this CSV for the next grid to replace the current grid
      // ,,,
      // ,,,
      // ,,b,
      // ,,,<<)2(>>

      // but before we can use this CSV to replace the contents of the current grid (level 2)
      // with the contents of the CSV from level 1 (from our example above)
      // we have to replace the <<)2(>> in that CSV with the current grid (level 2) as CSV

      // so first define <<)2(>>
      const initialGridMarker = `<<)${initialDepth}(>>`;
      const initialGridAsCsvEscaped = initialGridAsCsv.replace(/"/g, `""`); // Escape double quotes
      const initialGridAsCsvEscapedAndWrappedInQuotes = `"${initialGridAsCsvEscaped}"`; // Wrap the whole thing in quotes

      // now we need to replace the marker in the initialGridAsCsvEscapedAndWrappedInQuotes
      const initialGridAsCsvEscapedAndWrappedInQuotesWithMarkerReplaced =
        nextGridAsCsvWithMarker.replace(
          initialGridMarker,
          initialGridAsCsvEscapedAndWrappedInQuotes
        );

      // In our example we now have this CSV for the next grid to replace the current grid
      // notice the <<)2(>> has now ben replaced with the current grid converted to CSV
      // ,,,
      // ,,,
      // ,,b,
      // ,,,",c"

      // Now we are almost ready to replace the contents of the initial grid with the next grid.
      //  However, we need to add in the new parent CSV to R1C1 in our next grid

      // So first create that next level parent by replacing (from the parent CSV from our example)

      // <<(1),,,
      // ,,,
      // ,,b,
      // ,,,<<)2(>>(1)>>

      //with just

      // <<)1(>>
      const beginningOfNextInParent = `<<(${nextDepth})`;
      const endOfNextInParent = `(${nextDepth})>>`;
      const nextInParent = `${beginningOfNextInParent}${nextGridAsCsvWithMarker}${endOfNextInParent}`;
      const newNextInParent = `<<)${nextDepth}(>>`;
      const currentParentCsvWithNewNext = initialR1C1Contents.replace(
        nextInParent,
        newNextInParent
      );

      // Make sure we wrap the new parent cell in quotes
      const currentParentCsvWithNewNextWrappedInQuotes = `"${currentParentCsvWithNewNext}"`;

      // Now just add the new parent cell on to the beginning of the newly constructed
      // next level CSV
      const nextGridCsv = `${currentParentCsvWithNewNextWrappedInQuotes}${initialGridAsCsvEscapedAndWrappedInQuotesWithMarkerReplaced}`;

      // Convert back to an array
      nextGridAsArray = fromCSV(nextGridCsv);
    }

    const nextGridWithMarker = fromCSV(nextGridAsCsvWithMarker);

    // Find the position of `initialGridMarker` in `nextGridAsArray`
    for (let r = 0; r < nextGridWithMarker.length; r++) {
      for (let c = 0; c < nextGridWithMarker[r].length; c++) {
        if (nextGridWithMarker[r][c] === `<<)${initialDepth}(>>`) {
          prevActiveRow = r + 1; // Convert to 1-based index
          prevActiveCol = c + 1;
          break;
        }
      }
    }

    // Load the updated grid data
    arrayToGrid(grid, nextGridAsArray);

    // Restore selection to the cell that contained the embedded grid
    setActiveRow(prevActiveRow);
    setActiveCol(prevActiveCol);
    setSelectionRange({
      startRow: prevActiveRow,
      endRow: prevActiveRow,
      startCol: prevActiveCol,
      endCol: prevActiveCol,
    });

    // Ensure the restored cell is visible
    scrollCellIntoView(
      prevActiveRow,
      prevActiveCol,
      rowHeights,
      colWidths,
      gridContainerRef.current
    );

    // 8) Force a refresh
    forceRefresh();
  }, [grid, forceRefresh, setActiveRow, setActiveCol, setSelectionRange]);

  /** Copy/Cut/Paste */
  const copySelection = useCallback(() => {
    const { startRow, endRow, startCol, endCol } = selectionRange;

    // Build a 2D array of the selected cells
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

    // Store internally (so we can paste back *inside* the grid)
    setClipboardData(out);
    setIsCutMode(false);

    // Also copy to the actual system clipboard as CSV or TSV,
    // so the user can paste outside the app (e.g. Notepad).
    let textToCopy = "";
    if (currentDelimiter === "tab") {
      textToCopy = toTSV(out);
    } else {
      textToCopy = toCSV(out);
    }

    // Attempt modern async clipboard API
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      navigator.clipboard
        .writeText(textToCopy)
        .catch((err) => console.error("Failed to write to clipboard", err));
    } else {
      // Fallback: create a hidden <textarea> and use document.execCommand('copy')
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.style.position = "fixed"; // avoid scrolling to bottom
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (e) {
        console.error("Fallback: Oops, unable to copy", e);
      }
      document.body.removeChild(textarea);
    }
  }, [
    selectionRange,
    grid,
    setClipboardData,
    setIsCutMode,
    currentDelimiter, // be sure it's in the dependency array
  ]);

  const cutSelection = useCallback(() => {
    // Reuse the copy logic to set the system clipboard:
    copySelection();

    // Then clear the original cells:
    const { startRow, endRow, startCol, endCol } = selectionRange;

    grid.beginTransaction();

    const cutArr: Array<{ row: number; col: number; text: string }> = [];

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

    grid.endTransaction();
    forceRefresh();
  }, [selectionRange, grid, copySelection, forceRefresh]);

  function isInRegion(
    row: number,
    col: number,
    startR: number,
    endR: number,
    startC: number,
    endC: number
  ) {
    return row >= startR && row <= endR && col >= startC && col <= endC;
  }

  const pasteSelection = useCallback(async () => {
    try {
      // Read raw text from the system clipboard:
      const textFromClipboard = await navigator.clipboard.readText();

      // If we got text, decide whether it’s tab-delimited or comma-delimited:
      if (!textFromClipboard) {
        return; // If clipboard is empty, do nothing
      }

      const dataToPaste = textFromClipboard.includes("\t")
        ? fromTSV(textFromClipboard)
        : fromCSV(textFromClipboard);

      // If still no data, do nothing.
      if (!dataToPaste) {
        return;
      }

      // The rest of your original paste logic — e.g. filling the selected cells:
      const { startRow, endRow, startCol, endCol } = selectionRange;
      const selRows = endRow - startRow + 1;
      const selCols = endCol - startCol + 1;

      // Wrap the entire setCellRaw calls in a transaction
      grid.beginTransaction();

      // If single selected cell, paste entire block
      if (selRows === 1 && selCols === 1) {
        for (let r = 0; r < dataToPaste.length; r++) {
          for (let c = 0; c < dataToPaste[r].length; c++) {
            const rr = startRow + r;
            const cc = startCol + c;
            if (rr > grid.rows) grid.resizeRows(rr);
            if (cc > grid.cols) grid.resizeCols(cc);
            grid.setCellRaw(rr, cc, dataToPaste[r][c]);
          }
        }
        if (isCutMode && cutCells) {
          for (const cell of cutCells) {
            if (
              !isInRegion(
                cell.row,
                cell.col,
                startRow,
                endRow,
                startCol,
                endCol
              )
            ) {
              grid.setCellRaw(cell.row, cell.col, "");
            }
          }
          setCutCells(null);
          setIsCutMode(false);
        }
      } else {
        // else fill the selection region
        const dataRows = dataToPaste.length;
        const dataCols = Math.max(...dataToPaste.map((a) => a.length));

        // If 1x1 data => fill entire selection
        if (dataRows === 1 && dataCols === 1) {
          const val = dataToPaste[0][0];
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              grid.setCellRaw(r, c, val);
            }
          }
          if (isCutMode && cutRange) {
            for (let r = cutRange.startRow; r <= cutRange.endRow; r++) {
              for (let c = cutRange.startCol; c <= cutRange.endCol; c++) {
                grid.setCellRaw(r, c, "");
              }
            }
            setCutRange(null);
            setIsCutMode(false);
          }
        } else {
          // Partial fill
          for (let r = 0; r < Math.min(dataRows, selRows); r++) {
            for (let c = 0; c < Math.min(dataCols, selCols); c++) {
              const rr = startRow + r;
              const cc = startCol + c;
              grid.setCellRaw(rr, cc, dataToPaste[r][c]);
            }
          }
          if (isCutMode && cutRange) {
            for (let r = cutRange.startRow; r <= cutRange.endRow; r++) {
              for (let c = cutRange.startCol; c <= cutRange.endCol; c++) {
                grid.setCellRaw(r, c, "");
              }
            }
            setCutRange(null);
            setIsCutMode(false);
          }
        }
      }

      grid.endTransaction();

      forceRefresh();
    } catch (err) {
      console.error("Failed to read from system clipboard:", err);
    }
  }, [selectionRange, grid, isCutMode, cutCells, cutRange, forceRefresh]);

  // Main keydown
  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (editingCell) {
        // If already editing, siphon typed chars into editingValue:
        if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
          e.preventDefault();
          setEditingValue((prev) => {
            const newVal = prev + e.key;
            measureAndExpand(activeRow, activeCol, newVal);
            return newVal;
          });
        }
        return;
      }

      // Ctrl+Z => Undo
      if ((e.key === "z" || e.key === "Z") && e.ctrlKey) {
        e.preventDefault();
        grid.undo();
        forceRefresh();
        return;
      }
      // Ctrl+Y => Redo
      if ((e.key === "y" || e.key === "Y") && e.ctrlKey) {
        e.preventDefault();
        grid.redo();
        forceRefresh();
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();

        // Move one column right, or left if Shift is held
        if (e.shiftKey) {
          arrowNav("ArrowLeft"); // your existing logic that moves left
        } else {
          arrowNav("ArrowRight"); // your existing logic that moves right
        }
        return; // Done, skip further logic
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey && e.ctrlKey) {
          handleKeyboardNav(activeRow, activeCol, "down-left");
        } else if (e.shiftKey) {
          handleKeyboardNav(activeRow, activeCol, "down-right");
        } else {
          handleKeyboardNav(activeRow, activeCol, "down");
        }
        return;
      }

      // Not editing yet
      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        // first typed char => start editing
        e.preventDefault();
        setEditingCell({ row: activeRow, col: activeCol });
        setEditingValue(e.key);
        setFocusTarget("cell");
        measureAndExpand(activeRow, activeCol, e.key);
      }

      if (e.key.startsWith("Arrow")) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // move block
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
      } else if (e.key === "F2") {
        e.preventDefault();
        handleCellDoubleClick(activeRow, activeCol);
      } else if (e.key === "F4") {
        e.preventDefault();
        enterEmbeddedGrid();
      } else if (e.key === "Escape") {
        e.preventDefault();
        exitEmbeddedGrid();
      }
      // Copy/Cut/Paste
      else if ((e.key === "c" || e.key === "C") && e.ctrlKey) {
        e.preventDefault();
        copySelection();
      } else if ((e.key === "x" || e.key === "X") && e.ctrlKey) {
        e.preventDefault();
        cutSelection();
      } else if ((e.key === "v" || e.key === "V") && e.ctrlKey) {
        e.preventDefault();
        (async () => {
          await pasteSelection();
        })();
      } else if ((e.key === "a" || e.key === "A") && e.ctrlKey) {
        e.preventDefault();

        // Check if the active cell is inside a block’s canvas
        const block = blockListRef.current.find((b) =>
          isCellInBlockCanvas(b, activeRow, activeCol)
        );

        if (block) {
          // Select the entire block's canvas
          setSelectionRange({
            startRow: block.topRow,
            endRow: block.bottomRow,
            startCol: block.leftCol,
            endCol: block.rightCol,
          });

          setActiveRow(block.topRow);
          setActiveCol(block.leftCol);
        } else {
          // Select the entire used range of the grid
          const filledCells = grid.getFilledCells();
          if (filledCells.length === 0) return;

          let minRow = Infinity,
            maxRow = -Infinity,
            minCol = Infinity,
            maxCol = -Infinity;

          filledCells.forEach(({ row, col }) => {
            minRow = Math.min(minRow, row);
            maxRow = Math.max(maxRow, row);
            minCol = Math.min(minCol, col);
            maxCol = Math.max(maxCol, col);
          });

          setSelectionRange({
            startRow: 1,
            endRow: maxRow,
            startCol: 1,
            endCol: maxCol,
          });

          setActiveRow(minRow);
          setActiveCol(minCol);
        }
      }
      // Toggle structural formatting
      else if (e.key === "~" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setFormattingDisabled((prev) => !prev);
        forceRefresh();
      } else if ((e.key === "s" || e.key === "S") && e.ctrlKey) {
        e.preventDefault();
        saveGridToFile();
      }
      // Another fallback for normal typed char
      else if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        e.preventDefault();
        setEditingCell({ row: activeRow, col: activeCol });
        setFocusTarget("cell");
        setEditingValue(e.key);
        measureAndExpand(activeRow, activeCol, e.key);
      }
    },
    [
      editingCell,
      activeRow,
      activeCol,
      measureAndExpand,
      arrowNav,
      extendSelection,
      moveBlock,
      selectNearestBlock,
      clearSelectedCells,
      enterEmbeddedGrid,
      exitEmbeddedGrid,
      copySelection,
      cutSelection,
      pasteSelection,
      setFormattingDisabled,
      forceRefresh,
    ]
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
    [editingCell, editingValue, cellRaw, commitEdit]
  );

  // total grid dimension
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
    grid.clearAllCells();

    forceRefresh();
  }
  function saveGridToFile() {
    const filledCells = grid.getFilledCells();
    if (filledCells.length === 0) return;

    let maxRowUsed = 0,
      maxColUsed = 0;
    for (const { row, col } of filledCells) {
      maxRowUsed = Math.max(maxRowUsed, row);
      maxColUsed = Math.max(maxColUsed, col);
    }

    const arr = Array.from({ length: maxRowUsed }, () =>
      Array(maxColUsed).fill("")
    );
    for (const { row, col, value } of filledCells) {
      arr[row - 1][col - 1] = value;
    }

    const text = currentDelimiter === "tab" ? toTSV(arr) : toCSV(arr);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });

    // Generate the timestamped filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:]/g, "").split(".")[0]; // Format YYYYMMDD_HHMMSS
    const fileExtension = currentDelimiter === "tab" ? "tsv" : "csv";
    const fileName = `textrux_${timestamp}.${fileExtension}`;

    const link = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: fileName,
    });
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function loadGridFromFile(file) {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      if (!target?.result) return;
      const content = target.result;

      const isTab =
        file.name.endsWith(".tsv") ||
        (typeof content === "string" && content.includes("\t"));

      const arr = isTab
        ? fromTSV(content as string)
        : fromCSV(content as string);

      const neededRows = arr.length;
      const neededCols = Math.max(...arr.map((row) => row.length), 0);

      grid.resizeRows(Math.max(grid.rows, neededRows));
      grid.resizeCols(Math.max(grid.cols, neededCols));

      Object.assign(grid, { contentsMap: {}, formulas: {} });

      for (let r = 0; r < neededRows; r++) {
        for (let c = 0; c < arr[r].length; c++) {
          const val = arr[r][c].trim();
          if (val) grid.setCellRaw(r + 1, c + 1, val);
        }
      }
      forceRefresh();
    };
    reader.readAsText(file);
  }

  function loadExample(ex) {
    fetch(ex.file)
      .then((res) => res.text())
      .then((content) => {
        const delim = content.includes("\t") ? "\t" : ",";
        const arr = delim === "\t" ? fromTSV(content) : fromCSV(content);

        const neededRows = arr.length;
        const neededCols = Math.max(...arr.map((row) => row.length), 0);

        grid.resizeRows(Math.max(grid.rows, neededRows));
        grid.resizeCols(Math.max(grid.cols, neededCols));

        clearGrid();

        grid.beginTransaction();

        for (let r = 0; r < neededRows; r++) {
          for (let c = 0; c < arr[r].length; c++) {
            const val = arr[r][c].trim();
            if (val) grid.setCellRaw(r + 1, c + 1, val);
          }
        }

        grid.endTransaction();

        forceRefresh();
      })
      .catch((err) => console.error("Failed to load example", err));
  }

  const onChangeDimensions = (newRowCount, newColCount) => {
    // If user is trying to shrink row/col counts, check for filled cells
    if (newRowCount < grid.rows || newColCount < grid.cols) {
      const filled = grid.getFilledCells();
      const wouldBeDeleted = filled.filter(
        (cell) => cell.row > newRowCount || cell.col > newColCount
      );
      if (wouldBeDeleted.length > 0) {
        const ok = window.confirm(
          "Reducing rows/columns will delete some filled cells. Are you sure?"
        );
        if (!ok) {
          return; // user cancelled
        }
        grid.beginTransaction();
        // Actually remove those cells from the grid
        for (const cell of wouldBeDeleted) {
          grid.setCellRaw(cell.row, cell.col, "");
        }
        grid.endTransaction();
      }
    }

    // Then do the resizing
    grid.resizeRows(newRowCount);
    grid.resizeCols(newColCount);
    forceRefresh(); // re-render
  };

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
        onFormulaKeyDown={(e) => onFormulaKeyDown(e)}
        onFocus={() => {
          setFocusTarget("formula");
          if (!editingCell) {
            setEditingCell({ row: activeRow, col: activeCol });
          }
        }}
        onGearClick={() => setModalOpen(true)}
      />

      {/* Main area */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{ top: "3rem", bottom: "35px" }}
      >
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
              onCellClick={handleCellClick}
              onCellDoubleClick={handleCellDoubleClick}
              onCommitEdit={commitEdit}
              onKeyboardNav={handleKeyboardNav}
              measureAndExpand={measureAndExpand}
              sharedEditingValue={editingValue}
              setSharedEditingValue={setEditingValue}
              styleMap={styleMap}
            />
          </div>
        </div>
      </div>

      {/* Scrubber */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          // optionally: height: 50, or just let it auto-size
        }}
      >
        <Scrubber />
      </div>

      <AppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentDelimiter={currentDelimiter}
        setCurrentDelimiter={updateDelimiter}
        clearGrid={clearGrid}
        saveGridToFile={saveGridToFile}
        loadGridFromFile={loadGridFromFile}
        loadExample={loadExample}
        rowCount={grid.rows}
        colCount={grid.cols}
        onChangeDimensions={onChangeDimensions}
      />
    </div>
  );
}

/** Helper: find row index by a given Y offset */
function findRowByY(y: number, rowHeights: number[]): number {
  let cum = 0;
  for (let r = 0; r < rowHeights.length; r++) {
    const h = rowHeights[r];
    if (y < cum + h) {
      return r + 1;
    }
    cum += h;
  }
  return rowHeights.length;
}

/** Helper: find col index by a given X offset */
function findColByX(x: number, colWidths: number[]): number {
  let cum = 0;
  for (let c = 0; c < colWidths.length; c++) {
    const w = colWidths[c];
    if (x < cum + w) {
      return c + 1;
    }
    cum += w;
  }
  return colWidths.length;
}
