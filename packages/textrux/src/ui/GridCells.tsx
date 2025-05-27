/* eslint-disable react-hooks/rules-of-hooks */
// packages/textrux/src/ui/GridCells.tsx
import { useEffect, useRef, useState, JSX } from "react";
import Grid from "../layers/1-substrate/GridModel";
import { SelectionRange } from "./GridView";
import { CellView } from "./CellView";

interface GridCellsProps {
  grid: Grid;
  rowHeights: number[];
  colWidths: number[];
  selectionRange: SelectionRange;
  activeRow: number;
  activeCol: number;
  editingCell: { row: number; col: number } | null;
  fontSize: number;
  version: number;

  onCellMouseDown: (r: number, c: number, e: React.MouseEvent) => void;
  onCellClick: (r: number, c: number, e: React.MouseEvent) => void;
  onCellDoubleClick: (r: number, c: number) => void;
  onCommitEdit: (
    r: number,
    c: number,
    val: string,
    opts?: { escape?: boolean }
  ) => void;
  onKeyboardNav: (
    r: number,
    c: number,
    direction: "down" | "right" | "left" | "up" | "down-right" | "down-left"
  ) => void;

  measureAndExpand: (r: number, c: number, text: string) => void;
  sharedEditingValue: string;
  setSharedEditingValue: (txt: string) => void;

  // 1) The style map from parseAndFormatGrid
  styleMap: Record<string, string[]>;
}

export function GridCells({
  grid,
  rowHeights,
  colWidths,
  selectionRange,
  activeRow,
  activeCol,
  editingCell,
  fontSize,
  version,
  onCellMouseDown,
  onCellClick,
  onCellDoubleClick,
  onCommitEdit,
  onKeyboardNav,
  measureAndExpand,
  sharedEditingValue,
  setSharedEditingValue,
  styleMap,
}: GridCellsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [visibleRows, setVisibleRows] = useState({ startRow: 1, endRow: 1 });
  const [visibleCols, setVisibleCols] = useState({ startCol: 1, endCol: 1 });

  useEffect(() => {
    const parent = containerRef.current?.parentElement as HTMLDivElement | null;
    if (!parent) return;
    const gridContainer = parent.parentElement as HTMLDivElement | null;
    if (!gridContainer) return;

    function updateVisibleRange() {
      const scrollTop = gridContainer?.scrollTop ?? 0;
      const scrollLeft = gridContainer?.scrollLeft ?? 0;
      const clientWidth = gridContainer?.clientWidth ?? 0;
      const clientHeight = gridContainer?.clientHeight ?? 0;

      const startRow = findFirstRowInView(scrollTop, rowHeights);
      const endRow = findLastRowInView(scrollTop + clientHeight, rowHeights);
      const startCol = findFirstColInView(scrollLeft, colWidths);
      const endCol = findLastColInView(scrollLeft + clientWidth, colWidths);

      const buffer = 2;
      const renderStartRow = Math.max(1, startRow - buffer);
      const renderEndRow = Math.min(grid.rowCount, endRow + buffer);
      const renderStartCol = Math.max(1, startCol - buffer);
      const renderEndCol = Math.min(grid.columnCount, endCol + buffer);

      setVisibleRows({ startRow: renderStartRow, endRow: renderEndRow });
      setVisibleCols({ startCol: renderStartCol, endCol: renderEndCol });
    }

    updateVisibleRange();
    gridContainer.addEventListener("scroll", updateVisibleRange);
    window.addEventListener("resize", updateVisibleRange);
    return () => {
      gridContainer.removeEventListener("scroll", updateVisibleRange);
      window.removeEventListener("resize", updateVisibleRange);
    };
  }, [version, grid.rowCount, grid.columnCount, rowHeights, colWidths]);

  const cells: JSX.Element[] = [];

  for (let r = visibleRows.startRow; r <= visibleRows.endRow; r++) {
    const topPx = sumUpTo(rowHeights, r - 1);
    const rowHeight = rowHeights[r - 1];

    for (let c = visibleCols.startCol; c <= visibleCols.endCol; c++) {
      const leftPx = sumUpTo(colWidths, c - 1);
      const colWidth = colWidths[c - 1];

      const val = grid.getCellValue(r, c);
      const raw = grid.getCellRaw(r, c);
      const formula = raw.startsWith("=") && raw.length > 1 ? raw : null;
      const format = grid.getCellFormat(r, c);

      const isActive = r === activeRow && c === activeCol;
      const inSelection =
        r >= selectionRange.startRow &&
        r <= selectionRange.endRow &&
        c >= selectionRange.startCol &&
        c <= selectionRange.endCol;

      const isEditing =
        editingCell && editingCell.row === r && editingCell.col === c;

      // 2) Get the array of classes from styleMap:
      const cellKey = `R${r}C${c}`;
      const styleClasses = styleMap[cellKey] || [];

      cells.push(
        <CellView
          key={`${r}-${c}`}
          row={r}
          col={c}
          value={val}
          formula={formula}
          format={format}
          isActive={isActive}
          inSelection={inSelection}
          isEditing={!!isEditing}
          top={topPx}
          left={leftPx}
          width={colWidth}
          height={rowHeight}
          fontSize={fontSize}
          onCellMouseDown={onCellMouseDown}
          onClick={onCellClick}
          onDoubleClick={onCellDoubleClick}
          onCommitEdit={onCommitEdit}
          onKeyboardNav={onKeyboardNav}
          measureAndExpand={measureAndExpand}
          sharedEditingValue={sharedEditingValue}
          setSharedEditingValue={setSharedEditingValue}
          styleClasses={styleClasses}
        />
      );
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {cells}
    </div>
  );
}

function sumUpTo(arr: number[], n: number) {
  let s = 0;
  for (let i = 0; i < n; i++) {
    s += arr[i];
  }
  return s;
}

function findFirstRowInView(scrollTop: number, rowHeights: number[]): number {
  let cum = 0;
  for (let r = 0; r < rowHeights.length; r++) {
    const h = rowHeights[r];
    if (scrollTop < cum + h) {
      return r + 1;
    }
    cum += h;
  }
  return rowHeights.length;
}

function findLastRowInView(bottomPx: number, rowHeights: number[]): number {
  let cum = 0;
  let lastR = 1;
  for (let r = 0; r < rowHeights.length; r++) {
    const h = rowHeights[r];
    if (cum > bottomPx) break;
    lastR = r + 1;
    cum += h;
  }
  return lastR;
}

function findFirstColInView(scrollLeft: number, colWidths: number[]): number {
  let cum = 0;
  for (let c = 0; c < colWidths.length; c++) {
    const w = colWidths[c];
    if (scrollLeft < cum + w) {
      return c + 1;
    }
    cum += w;
  }
  return colWidths.length;
}

function findLastColInView(rightPx: number, colWidths: number[]): number {
  let cum = 0;
  let lastC = 1;
  for (let c = 0; c < colWidths.length; c++) {
    const w = colWidths[c];
    if (cum > rightPx) break;
    lastC = c + 1;
    cum += w;
  }
  return lastC;
}
