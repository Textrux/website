// GridView.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { GridModel } from "../model/GridModel";
import { useGridController } from "../controller/GridController";
import { ColumnHeaders } from "./ColumnHeaders";
import { RowHeaders } from "./RowHeaders";
import { GridCells } from "./GridCells";

// A helper interface for multi-selection range
export interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

/** The main props for GridView */
export interface GridViewProps {
  grid: GridModel;
  width?: number | string;
  height?: number | string;
  className?: string; // Additional tailwind or custom classes
  style?: React.CSSProperties;
  // base sizes
  baseRowHeight?: number;
  baseColWidth?: number;
  baseFontSize?: number;
}

/**
 * This component uses the Grid model, manages selection, editing, formula bar,
 * virtualization, pinch & wheel zoom, middle-click drag, etc.
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
}: GridViewProps) {
  // 1) We keep a local state for data "zoom"
  const [zoom, setZoom] = useState(1.0);

  // 2) Derived sizes
  const rowPx = baseRowHeight * zoom;
  const colPx = baseColWidth * zoom;
  const fontSize = baseFontSize * zoom;

  // 3) Selection state
  // We'll track the "active cell" (the primary cell in selection),
  // plus a possible "anchor cell" if user shift-clicks, to define multi selection range.
  const [activeRow, setActiveRow] = useState(1); // 1-based
  const [activeCol, setActiveCol] = useState(1); // 1-based
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    startRow: 1,
    startCol: 1,
    endRow: 1,
    endCol: 1,
  });
  const anchorRef = useRef<{ row: number; col: number } | null>(null);

  // 4) The container ref (for scrolling)
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // 5) Use the "controller" hook for pinch, middle-click drag, etc.
  const { onWheel, onTouchStart, onTouchMove, onTouchEnd, onMouseDown } =
    useGridController({
      grid,
      zoom,
      setZoom,
      minZoom: 0.2,
      maxZoom: 10,
      colPx,
      rowPx,
      gridContainerRef,
    });

  // 6) In-model editing
  // If user sets a formula or value, we call `grid.setCell(r, c, val)` => triggers re-render via React?
  // Actually, we won't do a direct re-render unless we store the data in React state or we do a forceUpdate.
  // We'll do the simplest approach: we rely on a forceUpdate or version state if you want.
  const [version, setVersion] = useState(0); // increments to trigger re-render
  const forceRefresh = () => setVersion((v) => v + 1);

  // 7) Single/double click, multi select, editing
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // handle click on cell
  const onCellClick = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.shiftKey && anchorRef.current) {
        // multi selection from anchor
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
      } else {
        // single selection
        setActiveRow(row);
        setActiveCol(col);
        setSelectionRange({
          startRow: row,
          endRow: row,
          startCol: col,
          endCol: col,
        });
        anchorRef.current = { row, col };
      }
      // If we have an editingCell that isn't this one, close it
      if (editingCell && (editingCell.row !== row || editingCell.col !== col)) {
        setEditingCell(null);
      }
    },
    [editingCell]
  );

  // handle double click => edit
  const onCellDoubleClick = useCallback((row: number, col: number) => {
    setEditingCell({ row, col });
  }, []);

  // handle keydown => if user types a normal char while a single cell is selected, start editing
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // If we have exactly one cell selected => (startRow=endRow & startCol=endCol)
      const { startRow, endRow, startCol, endCol } = selectionRange;
      if (startRow === endRow && startCol === endCol) {
        if (!editingCell) {
          // check if it's a character that inserts text
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            // Start editing that cell
            setEditingCell({ row: activeRow, col: activeCol });
            // We'll also set the cell to just e.key or if it was formula, we do something else.
            // Let's do that in the editing component or formula bar approach.
          } else if (e.key === "F2") {
            // typical "edit cell" key
            setEditingCell({ row: activeRow, col: activeCol });
          }
        }
      }
    },
    [selectionRange, editingCell, activeRow, activeCol]
  );

  // handle commit edit
  const commitEdit = useCallback(
    (row: number, col: number, newValue: string) => {
      grid.setCell(row, col, newValue);
      forceRefresh(); // re-render with new data
    },
    [grid]
  );

  // 8) Formula bar input
  // We show the raw formula (if any) or the cell value. If editingCell => show the in-progress text.
  const raw = grid.getCellRaw(activeRow, activeCol);
  const isEditingActiveCell =
    editingCell &&
    editingCell.row === activeRow &&
    editingCell.col === activeCol;

  const [formulaText, setFormulaText] = useState(raw);

  // Keep formulaText in sync with model if not editing
  useEffect(() => {
    if (!isEditingActiveCell) {
      setFormulaText(raw);
    }
  }, [raw, isEditingActiveCell]);

  const onFormulaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormulaText(e.target.value);
    },
    []
  );

  const onFormulaKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        // commit
        grid.setCell(activeRow, activeCol, formulaText);
        forceRefresh();
        setEditingCell(null);
      }
    },
    [activeRow, activeCol, formulaText, grid]
  );

  // 9) Virtualization logic for row/col headers + cells
  // We'll create sub-components for row/col headers & the main cell area
  // that compute visible ranges from scroll. The parent can re-render them on scroll or version changes.

  // 10) Return
  return (
    <div
      className={`relative ${className}`}
      style={{ width, height, ...style }}
      onKeyDown={onKeyDown}
      tabIndex={0} // so we can capture key events
    >
      {/* Formula bar on top (Tailwind: h-12, flex, etc.) */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gray-300 flex items-center px-2 z-50">
        {/* Cell address, fixed width */}
        <div className="w-20 mr-2 text-right font-bold overflow-hidden whitespace-nowrap">
          {`R${activeRow}C${activeCol}`}
        </div>
        <input
          className="flex-1 h-8 text-sm px-2"
          type="text"
          value={formulaText}
          onChange={onFormulaChange}
          onKeyDown={onFormulaKeyDown}
        />
      </div>

      {/* Outer container for the entire grid (below formula bar) */}
      <div className="absolute left-0 right-0 bottom-0" style={{ top: "3rem" }}>
        {/* Corner cell */}
        <div
          className="absolute top-0 left-0 bg-gray-200 border-b border-r border-gray-600 flex items-center justify-center z-10"
          style={{ width: 50, height: 30 }}
        >
          ■
        </div>

        {/* Column headers (pinned top, overflow-x:hidden) */}
        <ColumnHeaders
          grid={grid}
          zoom={zoom}
          rowPx={rowPx}
          colPx={colPx}
          fontSize={fontSize}
          version={version}
        />

        {/* Row headers (pinned left, overflow-y:hidden) */}
        <RowHeaders
          grid={grid}
          zoom={zoom}
          rowPx={rowPx}
          colPx={colPx}
          fontSize={fontSize}
          version={version}
        />

        {/* Main grid container */}
        <div
          ref={gridContainerRef}
          className="absolute top-[30px] left-[50px] right-0 bottom-0 overflow-auto bg-white"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <div
            className="relative"
            style={{
              width: grid.cols * colPx,
              height: grid.rows * rowPx,
            }}
          >
            {/* Virtualized cells */}
            <GridCells
              grid={grid}
              rowPx={rowPx}
              colPx={colPx}
              fontSize={fontSize}
              version={version}
              selectionRange={selectionRange}
              activeRow={activeRow}
              activeCol={activeCol}
              editingCell={editingCell}
              onCellClick={onCellClick}
              onCellDoubleClick={onCellDoubleClick}
              onCommitEdit={commitEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
