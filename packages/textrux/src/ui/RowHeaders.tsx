import { useEffect, useState } from "react";
import Grid from "../model/GridModel";
import { findFirstRowInView, findLastRowInView } from "../util/GridHelper";

export function RowHeaders({
  grid,
  rowHeights,
  colWidths,
  fontSize,
  version,
  gridContainerRef,
}: {
  grid: Grid;
  rowHeights: number[];
  colWidths: number[];
  fontSize: number;
  version: number;
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [visibleRows, setVisibleRows] = useState({ startRow: 1, endRow: 1 });
  const [scrollTop, setScrollTop] = useState(0);

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
    container.addEventListener("scroll", updateVisibleRange);
    window.addEventListener("resize", updateVisibleRange);
    return () => {
      container.removeEventListener("scroll", updateVisibleRange);
      window.removeEventListener("resize", updateVisibleRange);
    };
  }, [rowHeights, grid.rowCount, gridContainerRef]);

  return (
    <div className="absolute top-[30px] left-0 bottom-0 w-[50px] bg-gray-200 border-r border-gray-600 z-8 overflow-hidden">
      <div
        className="relative"
        style={{
          width: 50,
          // total height = sum rowHeights
          height: rowHeights.reduce((a, b) => a + b, 0),
          transform: `translateY(-${scrollTop}px)`,
        }}
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
              <span className="text-black">R</span>
              {r}
            </>
          );

          return (
            <div
              key={r}
              className="absolute left-0 flex items-center justify-center border-b border-gray-300 bg-gray-100 text-xs font-bold overflow-hidden text-ellipsis whitespace-nowrap"
              style={{
                top: topPx,
                width: 50,
                height: h,
                fontSize,
              }}
              title={label}
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
