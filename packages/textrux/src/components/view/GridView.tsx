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

  // Row/column sizing
  const [rowHeights, setRowHeights] = useState<number[]>(() =>
    Array(grid.rows).fill(baseRowHeight * zoom)
  );
  const [colWidths, setColWidths] = useState<number[]>(() =>
    Array(grid.cols).fill(baseColWidth * zoom)
  );

  // If zoom changes, reset row/col sizes (or scale them if you prefer).
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
      colPx: baseColWidth,
      rowPx: baseRowHeight,
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

  // The partial text typed so far (shared with formula bar & cell)
  const [editingValue, setEditingValue] = useState("");

  // Whether the user is focusing the cell text area or the formula bar
  // 'cell' => cell text area, 'formula' => formula bar, null => not editing
  const [focusTarget, setFocusTarget] = useState<"cell" | "formula" | null>(
    null
  );

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

      const maxColWidth = 4 * baseColWidth * zoom;
      const maxRowHeight = 6 * baseRowHeight * zoom;
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

  // Commit the cell edit
  const commitEdit = useCallback(
    (r: number, c: number, newValue: string, opts?: { escape?: boolean }) => {
      if (opts?.escape) {
        // revert => do nothing
      } else {
        grid.setCell(r, c, newValue);
        measureAndExpand(r, c, newValue);
      }
      setEditingCell(null);
      setEditingValue("");
      setFocusTarget(null);
      forceRefresh();
    },
    [grid, measureAndExpand]
  );

  // Mousedown => selection or commit old cell
  const handleCellMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      // If we were editing a different cell => commit it
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

      // IMPORTANT FIX: If not already editing, focus the container
      // so subsequent keys are captured by handleContainerKeyDown.
      if (!editingCell) {
        gridContainerRef.current?.focus();
      }
    },
    [commitEdit, editingCell, editingValue]
  );

  // Single click => no-op
  const handleCellClick = useCallback(() => {
    // no-op
  }, []);

  // Double click => begin editing in the cell
  const handleCellDoubleClick = useCallback(
    (row: number, col: number) => {
      const raw = grid.getCellRaw(row, col);
      setEditingValue(raw);
      setEditingCell({ row, col });
      setFocusTarget("cell");
    },
    [grid]
  );

  // Mouse move => drag selection
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

  // KeyDown => if not editing in the cell or formula bar
  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // If focus is in formula bar, do nothing here
      if (focusTarget === "formula") return;

      // If we're editing in the cell, let the <textarea> handle it
      if (editingCell) {
        return;
      }

      const { startRow, endRow, startCol, endCol } = selectionRange;
      const singleSelected =
        startRow === endRow && startCol === endCol && !editingCell;

      // 1) Arrow keys => move selection or (if shift) expand selection
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        let r = activeRow;
        let c = activeCol;
        if (e.key === "ArrowDown" && r < grid.rows) r++;
        else if (e.key === "ArrowUp" && r > 1) r--;
        else if (e.key === "ArrowLeft" && c > 1) c--;
        else if (e.key === "ArrowRight" && c < grid.cols) c++;

        if (e.shiftKey && anchorRef.current) {
          // SHIFT+arrow => expand selection
          setSelectionRange({
            startRow: Math.min(anchorRef.current.row, r),
            endRow: Math.max(anchorRef.current.row, r),
            startCol: Math.min(anchorRef.current.col, c),
            endCol: Math.max(anchorRef.current.col, c),
          });
        } else {
          // normal arrow => move anchor
          setSelectionRange({
            startRow: r,
            endRow: r,
            startCol: c,
            endCol: c,
          });
          anchorRef.current = { row: r, col: c };
        }
        setActiveRow(r);
        setActiveCol(c);
        return;
      }

      // 2) Enter => move down
      if (e.key === "Enter") {
        e.preventDefault();
        let r = activeRow;
        let c = activeCol;
        if (r < grid.rows) r++;
        setActiveRow(r);
        setActiveCol(c);
        setSelectionRange({ startRow: r, endRow: r, startCol: c, endCol: c });
        anchorRef.current = { row: r, col: c };
        return;
      }

      // 3) Tab => move right or left if shift
      if (e.key === "Tab") {
        e.preventDefault();
        let r = activeRow;
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

      // 4) Delete => clear all selected cells
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
            grid.setCell(rr, cc, "");
          }
        }
        forceRefresh();
        return;
      }

      // 5) If exactly one cell is selected, pressing a normal char => start editing
      if (singleSelected) {
        // F2 => edit existing text
        if (e.key === "F2") {
          e.preventDefault();
          const raw = grid.getCellRaw(activeRow, activeCol);
          setEditingValue(raw);
          setEditingCell({ row: activeRow, col: activeCol });
          setFocusTarget("cell");
          return;
        }

        // Normal character => start editing with that char
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          // Start with the typed char
          setEditingValue(e.key);
          setEditingCell({ row: activeRow, col: activeCol });
          setFocusTarget("cell");
          return;
        }
      }
    },
    [
      focusTarget,
      editingCell,
      activeRow,
      activeCol,
      grid,
      selectionRange,
      forceRefresh,
    ]
  );

  // Called by the cell text area when user hits Enter/Tab/arrow
  // (expanded directions to include "up" as well)
  const handleKeyboardNav = useCallback(
    (r: number, c: number, direction: "up" | "down" | "left" | "right") => {
      let nr = r;
      let nc = c;

      if (direction === "up") {
        if (nr > 1) nr--;
      } else if (direction === "down") {
        if (nr < grid.rows) nr++;
      } else if (direction === "left") {
        if (nc > 1) nc--;
      } else if (direction === "right") {
        if (nc < grid.cols) nc++;
      }
      setActiveRow(nr);
      setActiveCol(nc);
      setSelectionRange({
        startRow: nr,
        endRow: nr,
        startCol: nc,
        endCol: nc,
      });
      anchorRef.current = { row: nr, col: nc };
      setEditingCell(null);
      setEditingValue("");
      setFocusTarget(null);
    },
    [grid.rows, grid.cols]
  );

  // Formula bar text:
  const isEditingActiveCell =
    editingCell &&
    editingCell.row === activeRow &&
    editingCell.col === activeCol;
  const cellRaw = grid.getCellRaw(activeRow, activeCol);
  const formulaText = isEditingActiveCell ? editingValue : cellRaw;

  // When user types in formula bar
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
    [
      isEditingActiveCell,
      activeRow,
      activeCol,
      setEditingCell,
      setEditingValue,
      measureAndExpand,
    ]
  );

  // Keydown in formula bar => commit or escape
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

  // address text
  const addressText = `R${activeRow}C${activeCol}`;

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height, ...style }}
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
          onFocus={() => {
            setFocusTarget("formula");
            if (!editingCell) {
              setEditingCell({ row: activeRow, col: activeCol });
            }
          }}
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
          onMouseDown={onMouseDown} // middle-click/pan from controller
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onKeyDown={handleContainerKeyDown}
          tabIndex={0} // so it can receive key events if clicked
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
              onCommitEdit={(r, c, val, opts) => commitEdit(r, c, val, opts)}
              onKeyboardNav={handleKeyboardNav}
              measureAndExpand={measureAndExpand}
              sharedEditingValue={editingValue}
              setSharedEditingValue={setEditingValue}
              focusTarget={focusTarget}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** find which row at position y with variable sizes */
function findRowByY(y: number, rowHeights: number[]): number {
  let cum = 0;
  for (let r = 0; r < rowHeights.length; r++) {
    const h = rowHeights[r];
    if (y >= cum && y < cum + h) return r + 1;
    cum += h;
  }
  return rowHeights.length;
}
/** find which column at position x with variable sizes */
function findColByX(x: number, colWidths: number[]): number {
  let cum = 0;
  for (let c = 0; c < colWidths.length; c++) {
    const w = colWidths[c];
    if (x >= cum && x < cum + w) return c + 1;
    cum += w;
  }
  return colWidths.length;
}
