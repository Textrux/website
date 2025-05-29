/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState, useCallback, useRef } from "react";
import Grid from "../layers/1-substrate/GridModel";

export function ColumnHeaders({
  grid,
  rowHeights,
  colWidths,
  fontSize,
  version,
  gridContainerRef,
  onColumnResize,
  onColumnAutoResize,
}: {
  grid: Grid;
  rowHeights: number[];
  colWidths: number[];
  fontSize: number;
  version: number;
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  onColumnResize?: (columnIndex: number, newWidth: number) => void;
  onColumnAutoResize?: (columnIndex: number) => void;
}) {
  const [visibleCols, setVisibleCols] = useState({ startCol: 1, endCol: 1 });
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    function updateVisibleRange() {
      const sl = container?.scrollLeft ?? 0;
      const cw = container?.clientWidth ?? 0;
      setScrollLeft(sl);

      const start = findFirstColInView(sl, colWidths);
      const end = findLastColInView(sl + cw, colWidths);
      const buffer = 2;
      const renderStart = Math.max(1, start - buffer);
      const renderEnd = Math.min(grid.columnCount, end + buffer);

      setVisibleCols({ startCol: renderStart, endCol: renderEnd });
    }

    updateVisibleRange();

    // Use a more frequent update for scroll events
    const handleScroll = () => {
      updateVisibleRange();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateVisibleRange);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateVisibleRange);
    };
  }, [colWidths, grid.columnCount, gridContainerRef]);

  // Handle column resizing
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, columnIndex: number) => {
      const rect = headerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left + scrollLeft;
      const columnStart = sumUpTo(colWidths, columnIndex - 1);
      const columnEnd = columnStart + colWidths[columnIndex - 1];

      // Check if we're near the right edge of the column (resize handle)
      const isNearRightEdge = Math.abs(x - columnEnd) <= 5;

      if (isNearRightEdge) {
        e.preventDefault();
        setIsResizing(true);
        setResizingColumn(columnIndex);
        setResizeStartX(e.clientX);
        setResizeStartWidth(colWidths[columnIndex - 1]);
      }
    },
    [colWidths, scrollLeft]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!headerRef.current) return;

      const rect = headerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollLeft;

      // Find which column we're over and if we're near a resize handle
      let nearResizeHandle = false;
      for (let i = visibleCols.startCol; i <= visibleCols.endCol; i++) {
        const columnStart = sumUpTo(colWidths, i - 1);
        const columnEnd = columnStart + colWidths[i - 1];

        if (Math.abs(x - columnEnd) <= 5) {
          nearResizeHandle = true;
          break;
        }
      }

      // Update cursor
      if (headerRef.current) {
        headerRef.current.style.cursor = nearResizeHandle
          ? "col-resize"
          : "default";
      }
    },
    [colWidths, scrollLeft, visibleCols]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent, columnIndex: number) => {
      const rect = headerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left + scrollLeft;
      const columnStart = sumUpTo(colWidths, columnIndex - 1);
      const columnEnd = columnStart + colWidths[columnIndex - 1];

      // Check if we're near the right edge of the column (resize handle)
      const isNearRightEdge = Math.abs(x - columnEnd) <= 5;

      if (isNearRightEdge && onColumnAutoResize) {
        e.preventDefault();
        onColumnAutoResize(columnIndex);
      }
    },
    [colWidths, scrollLeft, onColumnAutoResize]
  );

  // Global mouse events for resizing
  useEffect(() => {
    if (!isResizing || resizingColumn === null) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartX;
      const newWidth = Math.max(20, resizeStartWidth + deltaX); // Minimum width of 20px

      if (onColumnResize) {
        onColumnResize(resizingColumn, newWidth);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [
    isResizing,
    resizingColumn,
    resizeStartX,
    resizeStartWidth,
    onColumnResize,
  ]);

  const totalWidth = colWidths.reduce((a, b) => a + b, 0);

  return (
    <div className="absolute top-0 left-[50px] right-0 h-[30px] bg-gray-200 dark:bg-gray-700 border-b border-gray-600 dark:border-gray-600 z-9 overflow-hidden">
      <div
        ref={headerRef}
        className="relative"
        style={{
          width: totalWidth,
          height: 30,
          transform: `translateX(-${scrollLeft}px)`,
        }}
        onMouseMove={handleMouseMove}
      >
        {Array.from({
          length: visibleCols.endCol - visibleCols.startCol + 1,
        }).map((_, i) => {
          const c = visibleCols.startCol + i;
          const x = sumUpTo(colWidths, c - 1);
          const w = colWidths[c - 1];
          const label = `C${c}`;
          const labelElement = (
            <>
              <span className="text-black dark:text-gray-100">C</span>
              <span className="dark:text-gray-100">{c}</span>
            </>
          );

          return (
            <div
              key={c}
              className="absolute top-0 flex items-center justify-center border-r border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-xs font-bold overflow-hidden text-ellipsis whitespace-nowrap"
              style={{
                left: x,
                width: w,
                height: 30,
                fontSize,
                userSelect: "none",
              }}
              title={label}
              onMouseDown={(e) => handleMouseDown(e, c)}
              onDoubleClick={(e) => handleDoubleClick(e, c)}
            >
              {labelElement}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function sumUpTo(arr: number[], n: number) {
  let s = 0;
  for (let i = 0; i < n; i++) s += arr[i];
  return s;
}

function findFirstColInView(scrollLeft: number, widths: number[]) {
  let cum = 0;
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i];
    if (scrollLeft < cum + w) {
      return i + 1;
    }
    cum += w;
  }
  return widths.length;
}

function findLastColInView(right: number, widths: number[]) {
  let cum = 0;
  let last = 1;
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i];
    if (cum > right) break;
    last = i + 1;
    cum += w;
  }
  return last;
}
