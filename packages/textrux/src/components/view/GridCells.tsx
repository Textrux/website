/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import { GridModel } from "../model/GridModel";
import { SelectionRange } from "./GridView";
import { CellView } from "./CellView";

/** The main grid cells area, which is also virtualized. */
export function GridCells({
  grid,
  rowPx,
  colPx,
  fontSize,
  version,
  selectionRange,
  activeRow,
  activeCol,
  editingCell,
  onCellClick,
  onCellDoubleClick,
  onCommitEdit,
}: {
  grid: GridModel;
  rowPx: number;
  colPx: number;
  fontSize: number;
  version: number; // triggers re-render
  selectionRange: SelectionRange;
  activeRow: number;
  activeCol: number;
  editingCell: { row: number; col: number } | null;
  onCellClick: (r: number, c: number, e: React.MouseEvent) => void;
  onCellDoubleClick: (r: number, c: number) => void;
  onCommitEdit: (r: number, c: number, val: string) => void;
}) {
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

      const startRow = Math.floor(scrollTop / rowPx) + 1;
      const endRow = Math.floor((scrollTop + clientHeight) / rowPx) + 1;
      const startCol = Math.floor(scrollLeft / colPx) + 1;
      const endCol = Math.floor((scrollLeft + clientWidth) / colPx) + 1;

      const buffer = 2;
      const renderStartRow = Math.max(1, startRow - buffer);
      const renderEndRow = Math.min(grid.rows, endRow + buffer);
      const renderStartCol = Math.max(1, startCol - buffer);
      const renderEndCol = Math.min(grid.cols, endCol + buffer);

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
  }, [rowPx, colPx, version, grid.rows, grid.cols]);

  const cells: React.ReactNode[] = [];
  for (let r = visibleRows.startRow; r <= visibleRows.endRow; r++) {
    for (let c = visibleCols.startCol; c <= visibleCols.endCol; c++) {
      const val = grid.getCellValue(r, c);
      const formula = grid.getCellRaw(r, c).startsWith("=")
        ? grid.getCellRaw(r, c)
        : null;
      const format = grid.getCellFormat(r, c);
      const topPx = (r - 1) * rowPx;
      const leftPx = (c - 1) * colPx;

      const isActive = r === activeRow && c === activeCol;
      // check if within selection range
      const inSelection =
        r >= selectionRange.startRow &&
        r <= selectionRange.endRow &&
        c >= selectionRange.startCol &&
        c <= selectionRange.endCol;

      const isEditing =
        editingCell && editingCell.row === r && editingCell.col === c;

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
          isEditing={isEditing ?? false}
          top={topPx}
          left={leftPx}
          width={colPx}
          height={rowPx}
          fontSize={fontSize}
          onClick={onCellClick}
          onDoubleClick={onCellDoubleClick}
          onCommitEdit={onCommitEdit}
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
