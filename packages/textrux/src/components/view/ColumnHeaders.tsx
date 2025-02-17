/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { GridModel } from "../model/GridModel";

/** A sub-component for column headers, but we also virtualize them. */
export function ColumnHeaders({
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
  // We'll track visible columns by reading parent's scrollLeft
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCols, setVisibleCols] = useState({ startCol: 1, endCol: 1 });

  useEffect(() => {
    const container = containerRef.current?.parentElement; // the parent is the absolute wrapper
    if (!container) return;
    // Actually we want the #gridContainer to see its scrollLeft
    const gridContainer = container.nextElementSibling as HTMLDivElement | null;
    if (!gridContainer) return;

    function updateVisibleRange() {
      const scrollLeft = gridContainer?.scrollLeft ?? 30; // just hard coded this number to prevent errors. TODO: need to revisit
      const clientWidth = gridContainer?.clientWidth ?? 30; // just hard coded this number to prevent errors. TODO: need to revisit
      const startCol = Math.floor(scrollLeft / colPx) + 1; // 1-based
      const endCol = Math.floor((scrollLeft + clientWidth) / colPx) + 1;
      const buffer = 2;
      const renderStartCol = Math.max(1, startCol - buffer);
      const renderEndCol = Math.min(grid.cols, endCol + buffer);
      setVisibleCols({ startCol: renderStartCol, endCol: renderEndCol });
    }

    updateVisibleRange();
    gridContainer.addEventListener("scroll", updateVisibleRange);
    window.addEventListener("resize", updateVisibleRange);
    return () => {
      gridContainer.removeEventListener("scroll", updateVisibleRange);
      window.removeEventListener("resize", updateVisibleRange);
    };
  }, [colPx, grid.cols]);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-[50px] right-0 h-[30px] overflow-hidden bg-gray-200 border-b border-gray-600 z-9"
    >
      <div
        className="relative"
        style={{
          width: grid.cols * colPx,
          height: 30,
        }}
      >
        {Array.from({
          length: visibleCols.endCol - visibleCols.startCol + 1,
        }).map((_, i) => {
          const c = visibleCols.startCol + i;
          const leftPx = (c - 1) * colPx;
          return (
            <div
              key={c}
              className="absolute top-0 flex items-center justify-center border-r border-gray-300 bg-gray-100 text-xs font-bold"
              style={{
                left: leftPx,
                width: colPx,
                height: 30,
                fontSize,
              }}
            >
              {`C${c}`}
            </div>
          );
        })}
      </div>
    </div>
  );
}
