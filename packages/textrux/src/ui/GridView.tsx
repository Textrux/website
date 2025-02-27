/* eslint-disable @typescript-eslint/no-explicit-any */
import "./css/project.css";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
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
import GridHelper, { Point as GHPoint } from "../util/GridHelper";
import Cell from "../structure/Cell";

export interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

/** We add a new optional prop: autoLoadLocalStorage (default false).
 *  If true => on first mount, we read localStorage("savedGridData") and fill the grid automatically.
 */
export interface GridViewProps {
  grid: Grid;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  baseRowHeight?: number;
  baseColWidth?: number;
  baseFontSize?: number;

  /** New optional prop to automatically load any saved CSV/TSV from localStorage. */
  autoLoadLocalStorage?: boolean;
}

/**
 * A large, all-in-one React component that manages:
 *  - editing a Grid
 *  - cut/copy/paste
 *  - pinch-zoom, middle-click panning
 *  - nested sheet logic
 *  - saving/restoring from localStorage
 */
export function GridView({
  grid,
  width = "100%",
  height = "100%",
  className = "",
  style = {},
  baseRowHeight = 24,
  baseColWidth = 60,
  baseFontSize = 14,
  autoLoadLocalStorage = false, // new prop
}: GridViewProps) {
  const [zoom, setZoom] = useState(1.0);
  const fontSize = baseFontSize * zoom;

  // track rowHeights/colWidths
  const [rowHeights, setRowHeights] = useState<number[]>(() =>
    Array(grid.rows).fill(baseRowHeight * zoom)
  );
  const [colWidths, setColWidths] = useState<number[]>(() =>
    Array(grid.cols).fill(baseColWidth * zoom)
  );

  // If user wants autoLoadLocalStorage, do that on mount, *before* we parse/format.
  // We only do it once; also skip if the grid is already non-empty (optional).
  useEffect(() => {
    if (!autoLoadLocalStorage) return;

    const saved = localStorage.getItem("savedGridData");
    if (!saved) return;

    // Decide delimiter
    const delim = saved.includes("\t") ? "\t" : ",";
    const arr = delim === "\t" ? fromTSV(saved) : fromCSV(saved);

    // Possibly detect if our grid is already non-empty => skip? Up to you.
    // We'll proceed unconditionally for now.

    // Ensure enough rows/cols
    let neededRows = arr.length;
    let neededCols = 0;
    for (const rowArr of arr) {
      if (rowArr.length > neededCols) neededCols = rowArr.length;
    }
    if (neededRows > grid.rows) grid.resizeRows(neededRows);
    if (neededCols > grid.cols) grid.resizeCols(neededCols);

    // Clear existing
    for (let r = 1; r <= grid.rows; r++) {
      for (let c = 1; c <= grid.cols; c++) {
        grid.setCellRaw(r, c, "");
      }
    }
    // Fill from saved
    for (let r = 0; r < arr.length; r++) {
      for (let c = 0; c < arr[r].length; c++) {
        const val = arr[r][c];
        if (val.trim()) {
          grid.setCellRaw(r + 1, c + 1, val);
        }
      }
    }
    // done => we can force a parse
  }, [autoLoadLocalStorage, grid]);

  useEffect(() => {
    setRowHeights(Array(grid.rows).fill(baseRowHeight * zoom));
    setColWidths(Array(grid.cols).fill(baseColWidth * zoom));
  }, [grid.rows, grid.cols, baseRowHeight, baseColWidth, zoom]);

  // selection
  const [activeRow, setActiveRow] = useState(1);
  const [activeCol, setActiveCol] = useState(1);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    startRow: 1,
    endRow: 1,
    startCol: 1,
    endCol: 1,
  });
  const anchorRef = useRef<{ row: number; col: number } | null>(null);

  // container ref for scrolling
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // set up pinch-zoom, middle-click, etc.
  const { onTouchStart, onTouchMove, onTouchEnd, onMouseDown } =
    useGridController({
      grid,
      zoom,
      setZoom,
      minZoom: 0.2,
      maxZoom: 10,
      colPx: baseColWidth,
      rowPx: baseRowHeight,
      gridContainerRef,
    });

  // We track a "version" so that changing data triggers a re-render + parse
  const [version, setVersion] = useState(0);
  const forceRefresh = useCallback(() => setVersion((v) => v + 1), []);

  // The style map from parseAndFormatGrid
  const [styleMap, setStyleMap] = useState<Record<string, string[]>>({});
  const [isFormattingDisabled, setFormattingDisabled] = useState(false);

  // editing cell
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [focusTarget, setFocusTarget] = useState<"cell" | "formula" | null>(
    null
  );

  // formula bar gear -> modal
  const [isModalOpen, setModalOpen] = useState(false);

  // The user-chosen delimiter for copy/paste + saving
  const [currentDelimiter, setCurrentDelimiter] = useState<"tab" | ",">(() => {
    const stored = localStorage.getItem("savedDelimiter");
    if (stored === "tab" || stored === ",") return stored;
    return GridConfig.defaultDelimiter; // "tab"
  });

  // Parse & Format any time grid changes or user toggles formatting
  useEffect(() => {
    if (!isFormattingDisabled) {
      const newMap = parseAndFormatGrid(grid);
      setStyleMap(newMap);
    } else {
      setStyleMap({});
    }
  }, [grid, version, isFormattingDisabled]);

  // Whenever user changes a cell, we store in localStorage
  // (unless you prefer to do that only on unmount).
  useEffect(() => {
    // Only if version changed => do row/col trimming => store
    saveGridToLocalStorage();
  }, [version, currentDelimiter]);

  function saveGridToLocalStorage() {
    // 1) find last used row/col
    let maxRowUsed = 1;
    let maxColUsed = 1;

    for (let r = grid.rows; r >= 1; r--) {
      for (let c = 1; c <= grid.cols; c++) {
        const val = grid.getCellRaw(r, c).trim();
        if (val !== "") {
          if (r > maxRowUsed) maxRowUsed = r;
          if (c > maxColUsed) maxColUsed = c;
        }
      }
    }

    // Build 2D array
    const arr: string[][] = [];
    for (let rr = 0; rr < maxRowUsed; rr++) {
      arr[rr] = new Array(maxColUsed).fill("");
    }
    for (let rr = 1; rr <= maxRowUsed; rr++) {
      for (let cc = 1; cc <= maxColUsed; cc++) {
        arr[rr - 1][cc - 1] = grid.getCellRaw(rr, cc);
      }
    }

    let text = "";
    if (currentDelimiter === "tab") {
      text = toTSV(arr);
    } else {
      text = toCSV(arr);
    }
    localStorage.setItem("savedGridData", text);
    localStorage.setItem("savedDelimiter", currentDelimiter);
  }

  /** If user hits Ctrl+Shift+~ => toggle structural formatting. */
  function toggleFormatting() {
    setFormattingDisabled((prev) => !prev);
    setVersion((v) => v + 1);
  }

  // measure text => possibly expand row/col
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

  // commit edit
  const commitEdit = useCallback(
    (r: number, c: number, newValue: string, opts?: { escape?: boolean }) => {
      if (opts?.escape) {
        // revert => do nothing
      } else {
        grid.setCellRaw(r, c, newValue);
        measureAndExpand(r, c, newValue);
      }
      setEditingCell(null);
      setEditingValue("");
      setFocusTarget(null);

      // If user typed while formatting was disabled => re-enable
      if (isFormattingDisabled) {
        setFormattingDisabled(false);
      }

      forceRefresh();
    },
    [grid, measureAndExpand, forceRefresh, isFormattingDisabled]
  );

  // handle mouse down => selection
  const dragSelectRef = useRef({ active: false, anchorRow: 1, anchorCol: 1 });

  const handleCellMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      // if we were editing a different cell => commit
      if (editingCell && (editingCell.row !== row || editingCell.col !== col)) {
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

      // focus container so keydown events go there
      if (!editingCell) {
        gridContainerRef.current?.focus();
      }
    },
    [editingCell, editingValue, commitEdit]
  );

  const handleCellClick = useCallback(() => {
    // no-op for single-click
  }, []);

  const handleCellDoubleClick = useCallback(
    (row: number, col: number) => {
      const raw = grid.getCellRaw(row, col);
      setEditingValue(raw);
      setEditingCell({ row, col });
      setFocusTarget("cell");
    },
    [grid]
  );

  // mousemove => drag selection
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

  // keydown => navigation, editing, block moves, etc.
  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (focusTarget === "formula") return;
      if (editingCell) return; // let <textarea> handle it

      const { startRow, endRow, startCol, endCol } = selectionRange;
      const singleSelected =
        startRow === endRow && startCol === endCol && !editingCell;

      // arrow keys
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        if (e.ctrlKey || e.metaKey) {
          // ctrl+arrow => move block; alt => merges
          e.preventDefault();
          moveOrMergeBlock(e.key, e.altKey);
        } else if (e.altKey) {
          // alt+arrow => select nearest block
          e.preventDefault();
          selectNearestBlock(e.key);
        } else if (e.shiftKey && anchorRef.current) {
          e.preventDefault();
          let r = activeRow;
          let c = activeCol;
          if (e.key === "ArrowDown" && r < grid.rows) r++;
          else if (e.key === "ArrowUp" && r > 1) r--;
          else if (e.key === "ArrowLeft" && c > 1) c--;
          else if (e.key === "ArrowRight" && c < grid.cols) c++;
          setActiveRow(r);
          setActiveCol(c);
          setSelectionRange({
            startRow: Math.min(anchorRef.current.row, r),
            endRow: Math.max(anchorRef.current.row, r),
            startCol: Math.min(anchorRef.current.col, c),
            endCol: Math.max(anchorRef.current.col, c),
          });
        } else {
          // normal arrow => move selection
          e.preventDefault();
          let r = activeRow;
          let c = activeCol;
          if (e.key === "ArrowDown" && r < grid.rows) r++;
          else if (e.key === "ArrowUp" && r > 1) r--;
          else if (e.key === "ArrowLeft" && c > 1) c--;
          else if (e.key === "ArrowRight" && c < grid.cols) c++;
          setActiveRow(r);
          setActiveCol(c);
          setSelectionRange({
            startRow: r,
            endRow: r,
            startCol: c,
            endCol: c,
          });
          anchorRef.current = { row: r, col: c };
        }
        return;
      }

      // Enter => move down
      if (e.key === "Enter") {
        e.preventDefault();
        let r = activeRow;
        if (r < grid.rows) r++;
        setActiveRow(r);
        setActiveCol(activeCol);
        setSelectionRange({
          startRow: r,
          endRow: r,
          startCol: activeCol,
          endCol: activeCol,
        });
        anchorRef.current = { row: r, col: activeCol };
        return;
      }

      // Tab => move horizontally
      if (e.key === "Tab") {
        e.preventDefault();
        const r = activeRow;
        let c = activeCol;
        if (e.shiftKey) {
          if (c > 1) c--;
        } else {
          if (c < grid.cols) c++;
        }
        setActiveRow(r);
        setActiveCol(c);
        setSelectionRange({ startRow: r, endRow: r, startCol: c, endCol: c });
        anchorRef.current = { row: r, col: c };
        return;
      }

      // Delete => clear
      if (e.key === "Delete") {
        e.preventDefault();
        for (
          let rr = selectionRange.startRow;
          rr <= selectionRange.endRow;
          rr++
        ) {
          for (
            let cc = selectionRange.startCol;
            cc <= selectionRange.endCol;
            cc++
          ) {
            grid.setCellRaw(rr, cc, "");
          }
        }
        if (isFormattingDisabled) {
          setFormattingDisabled(false);
        }
        forceRefresh();
        return;
      }

      // Copy or Cut
      if ((e.key === "c" || e.key === "C") && e.ctrlKey) {
        e.preventDefault();
        doCopy(false);
        return;
      }
      if ((e.key === "x" || e.key === "X") && e.ctrlKey) {
        e.preventDefault();
        doCopy(true);
        return;
      }

      // F2 => edit
      if (e.key === "F2" && singleSelected) {
        e.preventDefault();
        const raw = grid.getCellRaw(activeRow, activeCol);
        setEditingValue(raw);
        setEditingCell({ row: activeRow, col: activeCol });
        setFocusTarget("cell");
        return;
      }

      // typed char => start editing (if single cell)
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey &&
        singleSelected
      ) {
        e.preventDefault();
        setEditingValue(e.key);
        setEditingCell({ row: activeRow, col: activeCol });
        setFocusTarget("cell");
        return;
      }

      // F3 => enter nested cell
      if (e.key === "F3") {
        e.preventDefault();
        if (singleSelected) {
          enterNestedCell(activeRow, activeCol);
        }
        return;
      }

      // Escape => leave nested cell
      if (e.key === "Escape") {
        e.preventDefault();
        leaveNestedCell();
        return;
      }

      // Ctrl+Shift+~ => toggle formatting
      if (e.key === "~" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        toggleFormatting();
        return;
      }
    },
    [
      focusTarget,
      editingCell,
      selectionRange,
      activeRow,
      activeCol,
      grid,
      anchorRef,
      forceRefresh,
      isFormattingDisabled,
    ]
  );

  // formula bar: text is the raw text if not editing, or editingValue if editing
  const isEditingActiveCell =
    editingCell &&
    editingCell.row === activeRow &&
    editingCell.col === activeCol;
  const cellRaw = grid.getCellRaw(activeRow, activeCol);
  const formulaText = isEditingActiveCell ? editingValue : cellRaw;

  // when user types in formula bar
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

  // formula bar keydown => commit or escape
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

  // total grid size
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

  /** CSV/TSV drop => overwrite grid */
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    loadGridFromFile(file);
  }, []);

  function loadGridFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const delim = text.includes("\t") ? "\t" : ",";
      const arr = delim === "\t" ? fromTSV(text) : fromCSV(text);

      const neededRows = arr.length;
      let neededCols = 0;
      for (const rowArr of arr) {
        if (rowArr.length > neededCols) neededCols = rowArr.length;
      }
      if (neededRows > grid.rows) grid.resizeRows(neededRows);
      if (neededCols > grid.cols) grid.resizeCols(neededCols);

      // clear all
      for (let r = 1; r <= grid.rows; r++) {
        for (let c = 1; c <= grid.cols; c++) {
          grid.setCellRaw(r, c, "");
        }
      }
      // fill
      for (let r = 0; r < arr.length; r++) {
        for (let c = 0; c < arr[r].length; c++) {
          const val = arr[r][c];
          if (val.trim()) {
            grid.setCellRaw(r + 1, c + 1, val);
          }
        }
      }
      if (isFormattingDisabled) {
        setFormattingDisabled(false);
      }
      forceRefresh();
    };
    reader.readAsText(file);
  }

  /** Clear the entire grid. */
  function clearGrid() {
    for (let r = 1; r <= grid.rows; r++) {
      for (let c = 1; c <= grid.cols; c++) {
        grid.setCellRaw(r, c, "");
      }
    }
    if (isFormattingDisabled) {
      setFormattingDisabled(false);
    }
    forceRefresh();
  }

  /** Save to file. */
  function saveGridToFile() {
    // find last used row/col
    let maxRowUsed = 1;
    let maxColUsed = 1;
    for (let r = 1; r <= grid.rows; r++) {
      for (let c = 1; c <= grid.cols; c++) {
        if (grid.getCellRaw(r, c).trim() !== "") {
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

    let text = "";
    if (currentDelimiter === "tab") {
      text = toTSV(arr);
    } else {
      text = toCSV(arr);
    }

    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const defaultName = `grid_${y}${mo}${d}_${hh}${mm}${ss}`;
    let fileName = window.prompt(
      "Enter file name (without extension)",
      defaultName
    );
    if (fileName == null) return;
    if (!fileName) fileName = defaultName;
    fileName += currentDelimiter === "tab" ? ".tsv" : ".csv";

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Load an example. */
  async function loadExample(ex: {
    name: string;
    file: string;
    description: string;
  }) {
    try {
      const resp = await fetch(`./packages/textrux/examples/${ex.file}`);
      if (!resp.ok) {
        alert("Failed to load example: " + ex.file);
        return;
      }
      const text = await resp.text();
      const delim = text.includes("\t") ? "\t" : ",";
      const arr = delim === "\t" ? fromTSV(text) : fromCSV(text);

      if (arr.length > grid.rows) grid.resizeRows(arr.length);
      let maxCols = 0;
      for (const rowArr of arr) {
        if (rowArr.length > maxCols) maxCols = rowArr.length;
      }
      if (maxCols > grid.cols) grid.resizeCols(maxCols);

      // clear
      for (let r = 1; r <= grid.rows; r++) {
        for (let c = 1; c <= grid.cols; c++) {
          grid.setCellRaw(r, c, "");
        }
      }
      // fill
      for (let r = 0; r < arr.length; r++) {
        for (let c = 0; c < arr[r].length; c++) {
          const val = arr[r][c];
          if (val.trim()) {
            grid.setCellRaw(r + 1, c + 1, val);
          }
        }
      }
      if (isFormattingDisabled) {
        setFormattingDisabled(false);
      }
      forceRefresh();
    } catch (err) {
      console.error(err);
      alert("Error loading example: " + err);
    }
  }

  /** Pasting logic. Returns a set of "R#C#" keys that were overwritten. */
  function onPasteHandler(
    e: React.ClipboardEvent<HTMLDivElement>
  ): Set<string> {
    if (editingCell) {
      return new Set();
    }
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    if (!text) return new Set();

    const delim = text.includes("\t") ? "\t" : ",";
    const arr = delim === "\t" ? fromTSV(text) : fromCSV(text);
    const overwritten = new Set<string>();

    // Single‐cell => fill entire selection
    if (arr.length === 1 && arr[0].length === 1) {
      const singleVal = arr[0][0];
      for (
        let rr = selectionRange.startRow;
        rr <= selectionRange.endRow;
        rr++
      ) {
        for (
          let cc = selectionRange.startCol;
          cc <= selectionRange.endCol;
          cc++
        ) {
          grid.setCellRaw(rr, cc, singleVal);
          overwritten.add(`R${rr}C${cc}`);
        }
      }
      return overwritten;
    }

    // Multi‐cell => paste from activeRow/activeCol downward
    const startR = activeRow;
    const startC = activeCol;
    const rowCount = arr.length;
    const colCount = Math.max(...arr.map((r) => r.length));
    if (startR + rowCount - 1 > grid.rows) {
      grid.resizeRows(startR + rowCount - 1);
    }
    if (startC + colCount - 1 > grid.cols) {
      grid.resizeCols(startC + colCount - 1);
    }

    for (let r = 0; r < arr.length; r++) {
      for (let c = 0; c < arr[r].length; c++) {
        const val = arr[r][c];
        const targetR = startR + r;
        const targetC = startC + c;
        grid.setCellRaw(targetR, targetC, val);
        overwritten.add(`R${targetR}C${targetC}`);
      }
    }
    return overwritten;
  }

  // Keep track if we are in cut mode + which cells were cut
  const cutMode = useRef(false);
  let cutCells: { r: number; c: number; val: string }[] = [];

  /**
   * doCopy or doCut. If doCut=true, we remember the cut cells in cutCells[].
   * Fix: Only push them ONCE, after building the CSV string.
   */
  function doCopy(doCut?: boolean) {
    const r1 = selectionRange.startRow;
    const r2 = selectionRange.endRow;
    const c1 = selectionRange.startCol;
    const c2 = selectionRange.endCol;

    // Build array of selected cells
    const arr: string[][] = [];
    for (let rr = r1; rr <= r2; rr++) {
      const rowArr: string[] = [];
      for (let cc = c1; cc <= c2; cc++) {
        const raw = grid.getCellRaw(rr, cc);
        rowArr.push(raw);
      }
      arr.push(rowArr);
    }

    // Convert that array to CSV/TSV
    let text = "";
    if (currentDelimiter === "tab") {
      text = toTSV(arr);
    } else {
      text = toCSV(arr);
    }

    // Place in clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackWriteText(text);
      });
    } else {
      fallbackWriteText(text);
    }

    // If cutting => store all those cells (so we can remove them after paste).
    if (doCut) {
      cutMode.current = true;
      cutCells = []; // reset
      for (let rr = r1; rr <= r2; rr++) {
        for (let cc = c1; cc <= c2; cc++) {
          const raw = grid.getCellRaw(rr, cc);
          cutCells.push({ r: rr, c: cc, val: raw });
        }
      }
    } else {
      cutMode.current = false;
      cutCells = [];
    }
  }

  function fallbackWriteText(text: string) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  // Listen to raw onPaste, re-dispatch as React event, then handle removing cut cells.
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    function handlePaste(e: ClipboardEvent) {
      const evt = new ClipboardEvent("paste", {
        clipboardData: e.clipboardData,
      });
      (container as HTMLDivElement).dispatchEvent(evt);
      e.preventDefault();
    }
    container.addEventListener("paste", handlePaste as EventListener, {
      passive: false,
    });
    return () => {
      container.removeEventListener("paste", handlePaste as EventListener);
    };
  }, []);

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const overwrittenCells = onPasteHandler(e);

    if (cutMode.current && cutCells.length > 0) {
      // For each original cut cell, clear it only if it was NOT overwritten
      for (const cItem of cutCells) {
        const key = `R${cItem.r}C${cItem.c}`;
        if (!overwrittenCells.has(key)) {
          grid.setCellRaw(cItem.r, cItem.c, "");
        }
      }
      cutMode.current = false;
      cutCells = [];

      if (isFormattingDisabled) {
        setFormattingDisabled(false);
      }
      forceRefresh();
    }
  }

  /** Move block if user does ctrl+arrow or ctrl+alt+arrow. */
  function moveOrMergeBlock(directionKey: string, doMerge: boolean) {
    const blockList = gatherAllBlocks();
    const b = findBlockOfCell(blockList, activeRow, activeCol);
    if (!b) return;

    let dR = 0;
    let dC = 0;
    if (directionKey === "ArrowUp") dR = -1;
    if (directionKey === "ArrowDown") dR = 1;
    if (directionKey === "ArrowLeft") dC = -1;
    if (directionKey === "ArrowRight") dC = 1;
    if (!dR && !dC) return;

    if (!canMoveBlock(b, dR, dC, doMerge, blockList)) return;

    const oldTop = b.topRow;
    const oldBottom = b.bottomRow;
    const oldLeft = b.leftCol;
    const oldRight = b.rightCol;

    doMoveBlock(b, dR, dC);

    if (
      activeRow >= oldTop &&
      activeRow <= oldBottom &&
      activeCol >= oldLeft &&
      activeCol <= oldRight
    ) {
      setActiveRow((pr) => pr + dR);
      setActiveCol((pc) => pc + dC);

      setSelectionRange((oldSel) => ({
        startRow: oldSel.startRow + dR,
        endRow: oldSel.endRow + dR,
        startCol: oldSel.startCol + dC,
        endCol: oldSel.endCol + dC,
      }));

      if (anchorRef.current) {
        anchorRef.current = {
          row: anchorRef.current.row + dR,
          col: anchorRef.current.col + dC,
        };
      }
    }

    if (isFormattingDisabled) {
      setFormattingDisabled(false);
    }
    forceRefresh();
  }

  function gatherAllBlocks(): Block[] {
    return buildBlocksFromGrid(grid);
  }

  // A quick container→block re-parse
  function buildBlocksFromGrid(g: Grid): Block[] {
    const filledCells: GHPoint[] = [];
    for (let r = 1; r <= g.rows; r++) {
      for (let c = 1; c <= g.cols; c++) {
        const val = g.getCellRaw(r, c).trim();
        if (val !== "") {
          filledCells.push({ row: r, col: c });
        }
      }
    }
    const containers = getContainersJS(filledCells, 2, g.rows, g.cols);
    const blockList: Block[] = containers.map((cont) => {
      const b = new Block({
        topRow: cont.topRow,
        bottomRow: cont.bottomRow,
        leftColumn: cont.leftColumn,
        rightColumn: cont.rightColumn,
        filledCells: [],
      } as any);
      b.canvasCells = cont.filledPoints.map((p) => {
        const cellObj = g.getCellObject(p.row, p.col);
        return cellObj || new Cell(p.row, p.col, "");
      });
      finalizeBlock(b, g);
      return b;
    });
    return blockList;
  }

  function finalizeBlock(b: Block, g: Grid) {
    const { topRow, bottomRow, leftCol, rightCol } = b;
    const borderPoints = GridHelper.getOutlineCells(
      topRow,
      bottomRow,
      leftCol,
      rightCol,
      1
    );
    b.borderCells = borderPoints.map((p) => {
      const cellObj = g.getCellObject(p.row, p.col);
      return cellObj || ({ row: p.row, col: p.col, contents: "" } as any);
    });
    const framePoints = GridHelper.getOutlineCells(
      topRow,
      bottomRow,
      leftCol,
      rightCol,
      2
    );
    b.frameCells = framePoints.map((p) => {
      const cellObj = g.getCellObject(p.row, p.col);
      return cellObj || ({ row: p.row, col: p.col, contents: "" } as any);
    });
  }

  interface ContainerData {
    topRow: number;
    leftColumn: number;
    bottomRow: number;
    rightColumn: number;
    filledPoints: GHPoint[];
  }

  function getContainersJS(
    filledPoints: GHPoint[],
    expandOutlineBy: number,
    rowCount: number,
    colCount: number
  ): ContainerData[] {
    const containers: ContainerData[] = [];
    const overlappedPoints: GHPoint[] = [];
    const remainingPoints = [...filledPoints];

    for (const cell of filledPoints) {
      if (
        overlappedPoints.some((p) => p.row === cell.row && p.col === cell.col)
      ) {
        continue;
      }
      const tempContainer: ContainerData = {
        topRow: cell.row,
        leftColumn: cell.col,
        bottomRow: cell.row,
        rightColumn: cell.col,
        filledPoints: [cell],
      };

      const allCellsOverlapping: GHPoint[] = [];
      let newlyFound: GHPoint[];

      do {
        const expanded = expandContainer(
          tempContainer,
          expandOutlineBy,
          rowCount,
          colCount
        );

        newlyFound = remainingPoints.filter((p) => {
          if (p === cell) return false;
          if (
            allCellsOverlapping.some(
              (pp) => pp.row === p.row && pp.col === p.col
            )
          ) {
            return false;
          }
          const singleC: ContainerData = {
            topRow: p.row,
            bottomRow: p.row,
            leftColumn: p.col,
            rightColumn: p.col,
            filledPoints: [p],
          };
          return overlaps(expanded, singleC);
        });

        if (newlyFound.length > 0) {
          overlappedPoints.push(...newlyFound);

          const minR = Math.min(
            tempContainer.topRow,
            ...newlyFound.map((p) => p.row)
          );
          const maxR = Math.max(
            tempContainer.bottomRow,
            ...newlyFound.map((p) => p.row)
          );
          const minC = Math.min(
            tempContainer.leftColumn,
            ...newlyFound.map((p) => p.col)
          );
          const maxC = Math.max(
            tempContainer.rightColumn,
            ...newlyFound.map((p) => p.col)
          );

          tempContainer.topRow = minR;
          tempContainer.bottomRow = maxR;
          tempContainer.leftColumn = minC;
          tempContainer.rightColumn = maxC;
          tempContainer.filledPoints.push(...newlyFound);
          allCellsOverlapping.push(...newlyFound);
        }
      } while (newlyFound.length > 0);

      // merge with existing containers
      let mergedSomething: boolean;
      do {
        mergedSomething = false;
        const expanded = expandContainer(
          tempContainer,
          expandOutlineBy,
          rowCount,
          colCount
        );
        const overlappedExisting = containers.filter((cc) =>
          overlaps(expanded, cc)
        );
        if (overlappedExisting.length > 0) {
          mergedSomething = true;
          for (const oc of overlappedExisting) {
            const idx = containers.indexOf(oc);
            if (idx !== -1) containers.splice(idx, 1);

            tempContainer.topRow = Math.min(tempContainer.topRow, oc.topRow);
            tempContainer.bottomRow = Math.max(
              tempContainer.bottomRow,
              oc.bottomRow
            );
            tempContainer.leftColumn = Math.min(
              tempContainer.leftColumn,
              oc.leftColumn
            );
            tempContainer.rightColumn = Math.max(
              tempContainer.rightColumn,
              oc.rightColumn
            );
            tempContainer.filledPoints.push(...oc.filledPoints);
          }
        }
      } while (mergedSomething);

      containers.push(tempContainer);
    }
    containers.sort((a, b) => {
      if (a.topRow !== b.topRow) return a.topRow - b.topRow;
      if (a.leftColumn !== b.leftColumn) return a.leftColumn - b.leftColumn;
      if (a.bottomRow !== b.bottomRow) return a.bottomRow - b.bottomRow;
      return a.rightColumn - b.rightColumn;
    });
    return containers;
  }

  function expandContainer(
    c: ContainerData,
    expand: number,
    rowCount: number,
    colCount: number
  ): ContainerData {
    const newTop = Math.max(1, c.topRow - expand);
    const newLeft = Math.max(1, c.leftColumn - expand);
    const newBottom = Math.min(rowCount, c.bottomRow + expand);
    const newRight = Math.min(colCount, c.rightColumn + expand);
    return {
      topRow: newTop,
      bottomRow: newBottom,
      leftColumn: newLeft,
      rightColumn: newRight,
      filledPoints: [...c.filledPoints],
    };
  }

  function overlaps(a: ContainerData, b: ContainerData): boolean {
    return !(
      a.topRow > b.bottomRow ||
      a.bottomRow < b.topRow ||
      a.leftColumn > b.rightColumn ||
      a.rightColumn < b.leftColumn
    );
  }

  function findBlockOfCell(
    blocks: Block[],
    row: number,
    col: number
  ): Block | null {
    for (const b of blocks) {
      if (
        row >= b.topRow &&
        row <= b.bottomRow &&
        col >= b.leftCol &&
        col <= b.rightCol
      ) {
        return b;
      }
    }
    return null;
  }

  function canMoveBlock(
    b: Block,
    dR: number,
    dC: number,
    allowMerge: boolean,
    allBlocks: Block[]
  ): boolean {
    const newTop = b.topRow + dR;
    const newBottom = b.bottomRow + dR;
    const newLeft = b.leftCol + dC;
    const newRight = b.rightCol + dC;
    if (
      newTop < 1 ||
      newBottom > grid.rows ||
      newLeft < 1 ||
      newRight > grid.cols
    ) {
      return false;
    }
    for (const other of allBlocks) {
      if (other === b) continue;
      if (
        !(newBottom < other.topRow || newTop > other.bottomRow) &&
        !(newRight < other.leftCol || newLeft > other.rightCol)
      ) {
        return allowMerge;
      }
    }
    return true;
  }

  function doMoveBlock(b: Block, dR: number, dC: number) {
    const oldCoords: Array<{ r: number; c: number }> = [];
    for (let r = b.topRow; r <= b.bottomRow; r++) {
      for (let c = b.leftCol; c <= b.rightCol; c++) {
        oldCoords.push({ r, c });
      }
    }

    const moveMap: Array<{
      oldR: number;
      oldC: number;
      newR: number;
      newC: number;
      val: string;
    }> = [];

    for (const { r, c } of oldCoords) {
      const val = grid.getCellRaw(r, c);
      if (val !== "") {
        moveMap.push({ oldR: r, oldC: c, newR: r + dR, newC: c + dC, val });
      }
    }

    // clear old
    for (const { r, c } of oldCoords) {
      grid.setCellRaw(r, c, "");
    }
    // place in new
    for (const m of moveMap) {
      grid.setCellRaw(m.newR, m.newC, m.val);
    }

    b.topRow += dR;
    b.bottomRow += dR;
    b.leftCol += dC;
    b.rightCol += dC;
  }

  /************************************************************************
   * Nested cell logic EXACTLY as old code, plus TS updates
   ************************************************************************/
  function enterNestedCell(r: number, c: number) {
    const oldVal = grid.getCellRaw(r, c);
    if (!oldVal.trim()) {
      grid.setCellRaw(r, c, ",");
    }
    const newVal = grid.getCellRaw(r, c);
    if (!newVal.startsWith(",")) {
      return;
    }

    // 2) check if R1C1 starts with '^'
    const parentVal = grid.getCellRaw(1, 1);
    let currentDepth = 0;
    if (parentVal.startsWith("^")) {
      currentDepth = getDepthFromWrapper(parentVal);
    }

    const rawNestedCsv = grid.getCellRaw(r, c);
    const nestedArr = fromCSV(rawNestedCsv);
    const newDepth = currentDepth + 1;
    grid.setCellRaw(r, c, `<<)${newDepth}(>>`);

    // 6) convert entire existing sheet => ignoring R1C1 if it starts with ^
    const sheetCsv = sheetToCsv(true);
    // 7) wipe entire sheet
    for (let rr = 1; rr <= grid.rows; rr++) {
      for (let cc = 1; cc <= grid.cols; cc++) {
        grid.setCellRaw(rr, cc, "");
      }
    }
    // 8) put nestedArr in as the new sheet
    ensureSizeForNested(nestedArr);
    for (let rr = 0; rr < nestedArr.length; rr++) {
      for (let cc = 0; cc < nestedArr[rr].length; cc++) {
        grid.setCellRaw(rr + 1, cc + 1, nestedArr[rr][cc]);
      }
    }
    // 9) store the old sheet in R1C1
    if (currentDepth === 0) {
      grid.setCellRaw(1, 1, "^" + sheetCsv);
    } else {
      const newParentVal = replaceMarkerInWrapper(
        parentVal,
        currentDepth,
        sheetCsv
      );
      grid.setCellRaw(1, 1, newParentVal);
    }

    if (isFormattingDisabled) {
      setFormattingDisabled(false);
    }
    forceRefresh();
  }

  function leaveNestedCell() {
    const parentVal = grid.getCellRaw(1, 1);
    if (!parentVal.startsWith("^")) {
      return;
    }
    const currentDepth = getDepthFromWrapper(parentVal);
    if (currentDepth === 0) return;

    const currentSheetCsv = sheetToCsv(true);
    if (!currentSheetCsv.trim()) {
      // ensure at least single cell?
    }

    // wipe entire sheet
    for (let rr = 1; rr <= grid.rows; rr++) {
      for (let cc = 1; cc <= grid.cols; cc++) {
        grid.setCellRaw(rr, cc, "");
      }
    }
    if (currentDepth > 1) {
      const newParentVal = embedCurrentCsvInWrapper(
        parentVal,
        currentDepth,
        currentSheetCsv
      );
      const stripped = removeCaret(newParentVal);
      const arr = fromCSV(stripped);
      ensureSizeForNested(arr);
      for (let r = 0; r < arr.length; r++) {
        for (let c = 0; c < arr[r].length; c++) {
          grid.setCellRaw(r + 1, c + 1, arr[r][c]);
        }
      }
    } else {
      // currentDepth=1 => leaving top-level
      const newVal = embedCurrentCsvInWrapper(
        parentVal,
        currentDepth,
        currentSheetCsv
      );
      const stripped = removeCaret(newVal);
      const arr = fromCSV(stripped);
      ensureSizeForNested(arr);
      for (let r = 0; r < arr.length; r++) {
        for (let c = 0; c < arr[r].length; c++) {
          grid.setCellRaw(r + 1, c + 1, arr[r][c]);
        }
      }
    }
    if (isFormattingDisabled) {
      setFormattingDisabled(false);
    }
    forceRefresh();
  }

  function sheetToCsv(ignoreParentCell: boolean) {
    let maxR = 1;
    let maxC = 1;
    for (let r = 1; r <= grid.rows; r++) {
      for (let c = 1; c <= grid.cols; c++) {
        if (
          ignoreParentCell &&
          r === 1 &&
          c === 1 &&
          grid.getCellRaw(r, c).startsWith("^")
        ) {
          continue;
        }
        const val = grid.getCellRaw(r, c).trim();
        if (val !== "") {
          if (r > maxR) maxR = r;
          if (c > maxC) maxC = c;
        }
      }
    }
    const arr: string[][] = [];
    for (let rr = 0; rr < maxR; rr++) {
      arr[rr] = new Array(maxC).fill("");
    }
    for (let rr = 1; rr <= maxR; rr++) {
      for (let cc = 1; cc <= maxC; cc++) {
        if (
          ignoreParentCell &&
          rr === 1 &&
          cc === 1 &&
          grid.getCellRaw(rr, cc).startsWith("^")
        ) {
          continue;
        }
        arr[rr - 1][cc - 1] = grid.getCellRaw(rr, cc);
      }
    }
    return toCSV(arr);
  }

  function ensureSizeForNested(arr: string[][]) {
    const neededRows = arr.length;
    let neededCols = 0;
    for (const rowArr of arr) {
      if (rowArr.length > neededCols) neededCols = rowArr.length;
    }
    if (neededRows > grid.rows) {
      grid.resizeRows(neededRows);
    }
    if (neededCols > grid.cols) {
      grid.resizeCols(neededCols);
    }
  }

  function getDepthFromWrapper(str: string): number {
    const m = str.match(/<<\)(\d+)\(>>/);
    if (m) {
      return parseInt(m[1], 10);
    }
    return 0;
  }

  function replaceMarkerInWrapper(
    csvWrapper: string,
    oldDepth: number,
    newSheetCsv: string
  ) {
    const marker = `<<)${oldDepth}(>>`;
    const replacement = `<<(${oldDepth})${newSheetCsv}(${oldDepth})>>`;
    return csvWrapper.replace(marker, replacement);
  }

  function embedCurrentCsvInWrapper(
    parentCsv: string,
    depth: number,
    childCsv: string
  ): string {
    const marker = `<<)${depth}(>>`;
    const escaped = childCsv.replace(/"/g, `""`);
    const replaced = parentCsv.replace(marker, `"${escaped}"`);
    if (replaced === parentCsv) {
      console.warn(`Marker not found: ${marker} in parentCsv`);
    }
    return replaced;
  }

  function removeCaret(str: string): string {
    if (str.startsWith("^")) {
      return str.substring(1);
    }
    return str;
  }

  // Render
  return (
    <div
      className={`relative ${className}`}
      style={{ width, height, ...style }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={onDrop}
    >
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

      <div className="absolute left-0 right-0 bottom-0" style={{ top: "3rem" }}>
        {/* corner cell */}
        <div
          className="absolute top-0 left-0 bg-gray-200 border-b border-r border-gray-600 flex items-center justify-center z-10"
          style={{ width: 50, height: 30 }}
        >
          #
        </div>

        {/* column headers */}
        <ColumnHeaders
          grid={grid}
          rowHeights={rowHeights}
          colWidths={colWidths}
          fontSize={fontSize}
          version={version}
          gridContainerRef={gridContainerRef}
        />

        {/* row headers */}
        <RowHeaders
          grid={grid}
          rowHeights={rowHeights}
          colWidths={colWidths}
          fontSize={fontSize}
          version={version}
          gridContainerRef={gridContainerRef}
        />

        {/* main grid container */}
        <div
          ref={gridContainerRef}
          className="absolute top-[30px] left-[50px] right-0 bottom-0 overflow-auto bg-white"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onKeyDown={handleContainerKeyDown}
          onPaste={onPaste}
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
              onKeyboardNav={() => {
                /* not used here, cells handle within themselves */
              }}
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

/** find row from y */
function findRowByY(y: number, rowHeights: number[]): number {
  let cum = 0;
  for (let i = 0; i < rowHeights.length; i++) {
    const h = rowHeights[i];
    if (y >= cum && y < cum + h) return i + 1;
    cum += h;
  }
  return rowHeights.length;
}

/** find col from x */
function findColByX(x: number, colWidths: number[]): number {
  let cum = 0;
  for (let i = 0; i < colWidths.length; i++) {
    const w = colWidths[i];
    if (x >= cum && x < cum + w) return i + 1;
    cum += w;
  }
  return colWidths.length;
}
