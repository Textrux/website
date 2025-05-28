/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import Grid from "../layers/1-substrate/GridModel";

export function ColumnHeaders({
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
  const [visibleCols, setVisibleCols] = useState({ startCol: 1, endCol: 1 });
  const [scrollLeft, setScrollLeft] = useState(0);

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
    container.addEventListener("scroll", updateVisibleRange);
    window.addEventListener("resize", updateVisibleRange);
    return () => {
      container.removeEventListener("scroll", updateVisibleRange);
      window.removeEventListener("resize", updateVisibleRange);
    };
  }, [colWidths, grid.columnCount, gridContainerRef]);

  const totalWidth = colWidths.reduce((a, b) => a + b, 0);

  return (
    <div className="absolute top-0 left-[50px] right-0 h-[30px] bg-gray-200 dark:bg-gray-700 border-b border-gray-600 dark:border-gray-600 z-9 overflow-hidden">
      <div
        className="relative"
        style={{
          width: totalWidth,
          height: 30,
          transform: `translateX(-${scrollLeft}px)`,
        }}
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
