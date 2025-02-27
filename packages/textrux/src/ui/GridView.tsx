// packages/textrux/src/ui/GridView.tsx

import "./css/project.css";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Grid } from "../structure/Grid";
import { parseAndFormatGrid } from "../parser/GridParser";

// We still keep CSV/TSV for "Save to file" or "Load from file" usage:
import { fromCSV, toCSV } from "../util/CSV";
import { fromTSV, toTSV } from "../util/TSV";

import { GridConfig } from "../util/GridConfig";
import { useGridController } from "./controller/GridController";
import { ColumnHeaders } from "./ColumnHeaders";
import { RowHeaders } from "./RowHeaders";
import { GridCells } from "./GridCells";
import { FormulaBar } from "./FormulaBar";
import { AppModal } from "./modal/AppModal";

// --- NEW IMPORTS for localStorage minimal JSON ---
import {
  saveGridToLocalStorage,
  loadGridFromLocalStorage,
} from "../util/LocalStorageStore";

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

  // ----- CHANGED: load from localStorage using the new minimal JSON approach -----
  useEffect(() => {
    if (autoLoadLocalStorage) {
      loadGridFromLocalStorage(grid);
    }
  }, [autoLoadLocalStorage, grid]);

  useEffect(() => {
    setRowHeights(Array(grid.rows).fill(baseRowHeight * zoom));
    setColWidths(Array(grid.cols).fill(baseColWidth * zoom));
  }, [grid.rows, grid.cols, baseRowHeight, baseColWidth, zoom]);

  const [activeRow, setActiveRow] = useState(1);
  const [activeCol, setActiveCol] = useState(1);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    startRow: 1,
    endRow: 1,
    startCol: 1,
    endCol: 1,
  });
  const anchorRef = useRef<{ row: number; col: number } | null>(null);

  const gridContainerRef = useRef<HTMLDivElement>(null);
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

  const [version, setVersion] = useState(0);
  const forceRefresh = useCallback(() => setVersion((v) => v + 1), []);

  const [styleMap, setStyleMap] = useState<Record<string, string[]>>({});
  const [isFormattingDisabled, setFormattingDisabled] = useState(false);

  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [focusTarget, setFocusTarget] = useState<"cell" | "formula" | null>(
    null
  );

  const [isModalOpen, setModalOpen] = useState(false);

  // We keep this for "file save/load" delimiter, not for localStorage:
  const [currentDelimiter, setCurrentDelimiter] = useState<"tab" | ",">(() => {
    const stored = localStorage.getItem("savedDelimiter");
    if (stored === "tab" || stored === ",") return stored;
    return GridConfig.defaultDelimiter; // "tab" or ","
  });

  // Whenever version changes, save minimal JSON to localStorage:
  useEffect(() => {
    // DO NOT store CSV/TSV anymore in localStorage. Now we do minimal JSON:
    saveGridToLocalStorage(grid);
  }, [grid, version]);

  useEffect(() => {
    if (!isFormattingDisabled) {
      const sm = parseAndFormatGrid(grid);
      setStyleMap(sm);
    } else {
      setStyleMap({});
    }
  }, [grid, version, isFormattingDisabled]);

  function toggleFormatting() {
    setFormattingDisabled((prev) => !prev);
    forceRefresh();
  }

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

  const dragSelectRef = useRef({ active: false, anchorRow: 1, anchorCol: 1 });

  const handleCellMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
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

      if (!editingCell) {
        gridContainerRef.current?.focus();
      }
    },
    [editingCell, editingValue, commitEdit]
  );

  const handleCellDoubleClick = useCallback(
    (row: number, col: number) => {
      const raw = grid.getCellRaw(row, col);
      setEditingValue(raw);
      setEditingCell({ row, col });
      setFocusTarget("cell");
    },
    [grid]
  );

  // Drag to select
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

  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Here you can handle arrow keys, editing shortcuts, etc.
      // (Omitted for brevity.)
    },
    []
  );

  // Formula bar
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

  // If you still want to support clearing the entire grid from the modal:
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

  // If you still want to support saving CSV/TSV to a downloadable file:
  function saveGridToFile() {
    // Example approach:
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

  // If you still want to support loading CSV/TSV from a file:
  function loadGridFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content !== "string") return;

      // Decide CSV or TSV by extension or sniff content:
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

  // If you still want to load example CSV/TSV from remote or your assets:
  function loadExample(ex: {
    name: string;
    file: string;
    description: string;
  }) {
    // For instance, fetch the example .csv from your public folder
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
        // If you want to handle dropping a file onto the grid, do it here
      }}
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
          className="absolute top-[30px] left-[50px] right-0 bottom-0 overflow-auto bg-white"
          onMouseDown={onMouseDown}
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

// Helper for drag-select row/col calculations:
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
