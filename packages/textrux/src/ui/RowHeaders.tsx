import { useEffect, useState, useCallback, useRef } from "react";
import Grid from "../layers/1-substrate/GridModel";
import { findFirstRowInView, findLastRowInView } from "../util/GridHelper";

export function RowHeaders({
  grid,
  rowHeights,
  colWidths,
  fontSize,
  version,
  gridContainerRef,
  onRowResize,
  onRowAutoResize,
}: {
  grid: Grid;
  rowHeights: number[];
  colWidths: number[];
  fontSize: number;
  version: number;
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  onRowResize?: (rowIndex: number, newHeight: number) => void;
  onRowAutoResize?: (rowIndex: number) => void;
}) {
  const [visibleRows, setVisibleRows] = useState({ startRow: 1, endRow: 1 });
  const [scrollTop, setScrollTop] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    function updateVisibleRange() {
      const st = container?.scrollTop ?? 0;
      const ch = container?.clientHeight ?? 0;
      setScrollTop(st);

      // find which rows are in view
      const start = findFirstRowInView(st, rowHeights);
      const end = findLastRowInView(st + ch, rowHeights);
      const buffer = 2;
      const renderStart = Math.max(1, start - buffer);
      const renderEnd = Math.min(grid.rowCount, end + buffer);

      setVisibleRows({ startRow: renderStart, endRow: renderEnd });
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
  }, [rowHeights, grid.rowCount, gridContainerRef]);

  // Handle row resizing
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, rowIndex: number) => {
      const rect = headerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const y = e.clientY - rect.top;
      const rowStart = sumUpTo(rowHeights, rowIndex - 1);
      const rowEnd = rowStart + rowHeights[rowIndex - 1];

      // Check if we're near the bottom edge of the row (resize handle)
      const isNearBottomEdge = Math.abs(y - rowEnd) <= 5;

      if (isNearBottomEdge) {
        e.preventDefault();
        setIsResizing(true);
        setResizingRow(rowIndex);
        setResizeStartY(e.clientY);
        setResizeStartHeight(rowHeights[rowIndex - 1]);
      }
    },
    [rowHeights]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!headerRef.current) return;

      const rect = headerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;

      // Find which row we're over and if we're near a resize handle
      let nearResizeHandle = false;
      for (let i = visibleRows.startRow; i <= visibleRows.endRow; i++) {
        const rowStart = sumUpTo(rowHeights, i - 1);
        const rowEnd = rowStart + rowHeights[i - 1];

        if (Math.abs(y - rowEnd) <= 5) {
          nearResizeHandle = true;
          break;
        }
      }

      // Update cursor
      if (headerRef.current) {
        headerRef.current.style.cursor = nearResizeHandle
          ? "row-resize"
          : "default";
      }
    },
    [rowHeights, visibleRows]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent, rowIndex: number) => {
      const rect = headerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const y = e.clientY - rect.top;
      const rowStart = sumUpTo(rowHeights, rowIndex - 1);
      const rowEnd = rowStart + rowHeights[rowIndex - 1];

      // Check if we're near the bottom edge of the row (resize handle)
      const isNearBottomEdge = Math.abs(y - rowEnd) <= 5;

      if (isNearBottomEdge && onRowAutoResize) {
        e.preventDefault();
        onRowAutoResize(rowIndex);
      }
    },
    [rowHeights, onRowAutoResize]
  );

  // Global mouse events for resizing
  useEffect(() => {
    if (!isResizing || resizingRow === null) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeStartY;
      const newHeight = Math.max(20, resizeStartHeight + deltaY); // Minimum height of 20px

      if (onRowResize) {
        onRowResize(resizingRow, newHeight);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsResizing(false);
      setResizingRow(null);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isResizing, resizingRow, resizeStartY, resizeStartHeight, onRowResize]);

  return (
    <div className="absolute top-[30px] left-0 bottom-0 w-[50px] bg-gray-200 dark:bg-gray-700 border-r border-gray-600 dark:border-gray-600 z-8 overflow-hidden">
      <div
        ref={headerRef}
        className="relative"
        style={{
          width: 50,
          // total height = sum rowHeights
          height: rowHeights.reduce((a, b) => a + b, 0),
          transform: `translateY(-${scrollTop}px)`,
        }}
        onMouseMove={handleMouseMove}
      >
        {Array.from({
          length: visibleRows.endRow - visibleRows.startRow + 1,
        }).map((_, i) => {
          const r = visibleRows.startRow + i;
          const topPx = sumUpTo(rowHeights, r - 1);
          const h = rowHeights[r - 1];
          const label = `R${r}`;
          const labelElement = (
            <>
              <span className="text-black dark:text-gray-100">R</span>
              <span className="dark:text-gray-100">{r}</span>
            </>
          );

          return (
            <div
              key={r}
              className="absolute left-0 flex items-center justify-center border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-xs font-bold overflow-hidden text-ellipsis whitespace-nowrap"
              style={{
                top: topPx,
                width: 50,
                height: h,
                fontSize,
                userSelect: "none",
              }}
              title={label}
              onMouseDown={(e) => handleMouseDown(e, r)}
              onDoubleClick={(e) => handleDoubleClick(e, r)}
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
