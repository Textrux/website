// GridView.tsx
import "./project.css";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { GridModel } from "../model/GridModel";
import { useGridController } from "../controller/GridController";
import { ColumnHeaders } from "./ColumnHeaders";
import { RowHeaders } from "./RowHeaders";
import { GridCells } from "./GridCells";

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
}

/**
 * This component uses the Grid model, manages selection vs editing,
 * virtualization, dynamic row/col sizing, pinch/zoom, etc.
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
  // Zoom
  const [zoom, setZoom] = useState(1.0);
  const fontSize = baseFontSize * zoom;

  // For dynamic row/column sizing: store them in arrays
  const [rowHeights, setRowHeights] = useState<number[]>(() =>
    Array(grid.rows).fill(baseRowHeight * zoom)
  );
  const [colWidths, setColWidths] = useState<number[]>(() =>
    Array(grid.cols).fill(baseColWidth * zoom)
  );

  // If zoom changes, re-init. Or you could scale them proportionally if desired.
  useEffect(() => {
    setRowHeights(Array(grid.rows).fill(baseRowHeight * zoom));
    setColWidths(Array(grid.cols).fill(baseColWidth * zoom));
  }, [zoom, grid.rows, grid.cols, baseRowHeight, baseColWidth]);

  // Selection
  const [activeRow, setActiveRow] = useState(1);
  const [activeCol, setActiveCol] = useState(1);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    startRow: 1,
    endRow: 1,
    startCol: 1,
    endCol: 1,
  });
  const anchorRef = useRef<{ row: number; col: number } | null>(null);

  // For click-and-drag selection
  const dragSelectRef = useRef({ active: false, anchorRow: 1, anchorCol: 1 });

  // Container ref (scroll)
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Zoom, middle-click, pinch
  const { onTouchStart, onTouchMove, onTouchEnd, onMouseDown } =
    useGridController({
      grid,
      zoom,
      setZoom,
      minZoom: 0.2,
      maxZoom: 10,
      colPx: baseColWidth, // not used much with variable
      rowPx: baseRowHeight, // same note
      gridContainerRef,
    });

  // Force re-render after data changes
  const [version, setVersion] = useState(0);
  const forceRefresh = () => setVersion((v) => v + 1);

  // Editing cell
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  // The partial text typed so far (shared with formula bar & the editing cell).
  const [editingValue, setEditingValue] = useState("");

  // measure text => possibly expand row or column
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

      const maxColWidth = 4 * baseColWidth * zoom; // bump up if you like
      const maxRowHeight = 6 * baseRowHeight * zoom; // likewise
      if (neededWidth > maxColWidth) neededWidth = maxColWidth;
      if (neededHeight > maxRowHeight) neededHeight = maxRowHeight;

      setColWidths((old) => {
        const copy = [...old];
        if (neededWidth > copy[c - 1]) copy[c - 1] = neededWidth;
        return copy;
      });
      setRowHeights((old) => {
        const copy = [...old];
        if (neededHeight > copy[r - 1]) copy[r - 1] = neededHeight;
        return copy;
      });
    },
    [fontSize, baseColWidth, baseRowHeight, zoom]
  );

  // --(F) commitEdit => store in model, measure => expand
  const commitEdit = useCallback(
    (r: number, c: number, newValue: string, opts?: { escape?: boolean }) => {
      if (opts?.escape) {
        // revert => do nothing
      } else {
        // store
        grid.setCell(r, c, newValue);
        measureAndExpand(r, c, newValue);
      }
      setEditingCell(null);
      setEditingValue("");
      forceRefresh();
    },
    [grid, measureAndExpand]
  );

  // --(A) MOUSE DOWN => start selection or commit old cell--
  const handleCellMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      // If we were editing a different cell => commit it
      if (editingCell && (editingCell.row !== row || editingCell.col !== col)) {
        // commit old partial
        commitEdit(editingCell.row, editingCell.col, editingValue);
      }

      dragSelectRef.current.active = true;
      dragSelectRef.current.anchorRow = row;
      dragSelectRef.current.anchorCol = col;

      // Single selection unless shift
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
        // shift => multi
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
    },
    [commitEdit, editingCell, editingValue]
  );

  // --(B) Single click => typically no-op, selection is done in handleCellMouseDown
  const handleCellClick = useCallback(() => {}, []);

  // --(C) Double click => begin editing that cell
  const handleCellDoubleClick = useCallback(
    (row: number, col: number) => {
      // load the cell's current raw into editingValue
      const raw = grid.getCellRaw(row, col);
      setEditingValue(raw);
      setEditingCell({ row, col });
    },
    [grid]
  );

  // --(D) doc-level mousemove/up => drag selection
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

  // --(E) Keydown => if single cell selected & not editing => start editing if user types char
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { startRow, endRow, startCol, endCol } = selectionRange;
      const singleSelected =
        startRow === endRow && startCol === endCol && !editingCell;
      if (!singleSelected) return;

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // start editing, preload with existing raw + typed char
        const raw = grid.getCellRaw(activeRow, activeCol);
        const newText = raw + e.key;
        setEditingValue(newText);
        setEditingCell({ row: activeRow, col: activeCol });
        e.preventDefault();
      } else if (e.key === "F2") {
        const raw = grid.getCellRaw(activeRow, activeCol);
        setEditingValue(raw);
        setEditingCell({ row: activeRow, col: activeCol });
        e.preventDefault();
      }
    },
    [selectionRange, editingCell, activeRow, activeCol, grid]
  );

  // --(G) handleKeyboardNav => e.g. after Enter => move down
  const handleKeyboardNav = useCallback(
    (r: number, c: number, direction: "down" | "right" | "left") => {
      // once user hits Enter or Tab, we commit
      if (direction === "down") {
        let nr = r < grid.rows ? r + 1 : r;
        setActiveRow(nr);
        setActiveCol(c);
        setSelectionRange({ startRow: nr, endRow: nr, startCol: c, endCol: c });
        anchorRef.current = { row: nr, col: c };
      } else if (direction === "right") {
        const nc = c < grid.cols ? c + 1 : c;
        setActiveRow(r);
        setActiveCol(nc);
        setSelectionRange({ startRow: r, endRow: r, startCol: nc, endCol: nc });
        anchorRef.current = { row: r, col: nc };
      } else if (direction === "left") {
        const nc = c > 1 ? c - 1 : 1;
        setActiveRow(r);
        setActiveCol(nc);
        setSelectionRange({ startRow: r, endRow: r, startCol: nc, endCol: nc });
        anchorRef.current = { row: r, col: nc };
      }
      setEditingCell(null);
      setEditingValue("");
    },
    [grid.rows, grid.cols]
  );

  // --(H) Formula bar
  // If the current cell is being edited, formula bar = editingValue,
  // else show the raw from the model
  const isEditingActiveCell = !!(
    editingCell &&
    editingCell.row === activeRow &&
    editingCell.col === activeCol
  );
  const cellRaw = grid.getCellRaw(activeRow, activeCol);
  const formulaText = isEditingActiveCell ? editingValue : cellRaw;

  const onFormulaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isEditingActiveCell) {
        // start editing
        setEditingCell({ row: activeRow, col: activeCol });
      }
      const newVal = e.target.value;
      setEditingValue(newVal);
      // measure as they type => real-time expansion
      measureAndExpand(activeRow, activeCol, newVal);
    },
    [isEditingActiveCell, activeRow, activeCol, measureAndExpand]
  );

  const onFormulaKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitEdit(activeRow, activeCol, editingValue);
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (editingCell) {
          commitEdit(editingCell.row, editingCell.col, cellRaw, {
            escape: true,
          });
        }
      }
    },
    [activeRow, activeCol, editingValue, editingCell, commitEdit, cellRaw]
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

  // address text
  const addressText = `R${activeRow}C${activeCol}`;

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height, ...style }}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* Formula bar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gray-300 flex items-center px-2 z-50">
        <div
          className="mr-2 text-right font-bold overflow-hidden whitespace-nowrap truncate"
          style={{
            width: "4rem",
            minWidth: 0,
            textOverflow: "ellipsis",
            fontSize: `max(0.6rem, calc(5rem / ${addressText.length}))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
          title={addressText}
        >
          {addressText}
        </div>
        <input
          className="flex-1 h-8 text-sm px-2 bg-white"
          type="text"
          value={formulaText}
          onChange={onFormulaChange}
          onKeyDown={onFormulaKeyDown}
        />
      </div>

      <div className="absolute left-0 right-0 bottom-0" style={{ top: "3rem" }}>
        {/* Corner cell */}
        <div
          className="absolute top-0 left-0 bg-gray-200 border-b border-r border-gray-600 flex items-center justify-center z-10"
          style={{ width: 50, height: 30 }}
        >
          ■
        </div>

        {/* Column headers */}
        <ColumnHeaders
          grid={grid}
          rowHeights={rowHeights}
          colWidths={colWidths}
          fontSize={fontSize}
          version={version}
          gridContainerRef={gridContainerRef}
        />

        {/* Row headers */}
        <RowHeaders
          grid={grid}
          rowHeights={rowHeights}
          colWidths={colWidths}
          fontSize={fontSize}
          version={version}
          gridContainerRef={gridContainerRef}
        />

        {/* Main grid container */}
        <div
          ref={gridContainerRef}
          className="absolute top-[30px] left-[50px] right-0 bottom-0 overflow-auto bg-white"
          onMouseDown={onMouseDown} // middle-click
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <div
            className="relative"
            style={{
              width: totalGridWidth,
              height: totalGridHeight,
            }}
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
              onCommitEdit={(r, c, val) => commitEdit(r, c, val)}
              onKeyboardNav={handleKeyboardNav}
              // We'll also pass measureAndExpand so the cell can grow while user types
              measureAndExpand={measureAndExpand} // We'll use in CellView
              sharedEditingValue={editingValue}
              setSharedEditingValue={setEditingValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** find which row/col at position y/x with variable sizes */
function findRowByY(y: number, rowHeights: number[]): number {
  let cum = 0;
  for (let r = 0; r < rowHeights.length; r++) {
    const h = rowHeights[r];
    if (y >= cum && y < cum + h) return r + 1;
    cum += h;
  }
  return rowHeights.length;
}
function findColByX(x: number, colWidths: number[]): number {
  let cum = 0;
  for (let c = 0; c < colWidths.length; c++) {
    const w = colWidths[c];
    if (x >= cum && x < cum + w) return c + 1;
    cum += w;
  }
  return colWidths.length;
}
