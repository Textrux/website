/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { GridModel } from "../model/GridModel";

/** A sub-component for row headers, also virtualized. */
export function RowHeaders({
  grid,
  zoom,
  rowPx,
  colPx,
  fontSize,
  version,
}: {
  grid: GridModel;
  zoom: number;
  rowPx: number;
  colPx: number;
  fontSize: number;
  version: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRows, setVisibleRows] = useState({ startRow: 1, endRow: 1 });

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;
    // The parent's next sibling is the main grid container
    const gridContainer = container.nextElementSibling
      ?.nextElementSibling as HTMLDivElement | null;
    if (!gridContainer) return;

    function updateVisibleRange() {
      const scrollTop = gridContainer?.scrollTop ?? 0;
      const clientHeight = gridContainer?.clientHeight ?? 0;
      const startRow = Math.floor(scrollTop / rowPx) + 1;
      const endRow = Math.floor((scrollTop + clientHeight) / rowPx) + 1;
      const buffer = 2;
      const renderStartRow = Math.max(1, startRow - buffer);
      const renderEndRow = Math.min(grid.rows, endRow + buffer);
      setVisibleRows({ startRow: renderStartRow, endRow: renderEndRow });
    }

    updateVisibleRange();
    gridContainer.addEventListener("scroll", updateVisibleRange);
    window.addEventListener("resize", updateVisibleRange);
    return () => {
      gridContainer.removeEventListener("scroll", updateVisibleRange);
      window.removeEventListener("resize", updateVisibleRange);
    };
  }, [rowPx, grid.rows]);

  return (
    <div
      ref={containerRef}
      className="absolute top-[30px] left-0 bottom-0 w-[50px] overflow-hidden bg-gray-200 border-r border-gray-600 z-8"
    >
      <div
        className="relative"
        style={{
          width: 50,
          height: grid.rows * rowPx,
        }}
      >
        {Array.from({
          length: visibleRows.endRow - visibleRows.startRow + 1,
        }).map((_, i) => {
          const r = visibleRows.startRow + i;
          const topPx = (r - 1) * rowPx;
          return (
            <div
              key={r}
              className="absolute left-0 flex items-center justify-center border-b border-gray-300 bg-gray-100 text-xs font-bold"
              style={{
                top: topPx,
                width: 50,
                height: rowPx,
                fontSize,
              }}
            >
              {`R${r}`}
            </div>
          );
        })}
      </div>
    </div>
  );
}
