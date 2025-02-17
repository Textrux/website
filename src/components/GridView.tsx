import React, { useState, useEffect } from "react";
import { VariableSizeGrid as Grid } from "react-window";
import { useGridStore } from "../store/useGridStore";

const BASE_CELL_WIDTH = 100;
const BASE_CELL_HEIGHT = 30;

export const GridView: React.FC = () => {
  const { grid, selectedCell, selectCell, zoom } = useGridStore();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 120, // Adjust for header height
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight - 120, // Adjust dynamically
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-full overflow-auto bg-gray-100">
      <Grid
        columnCount={grid.cols}
        rowCount={grid.rows}
        columnWidth={() => BASE_CELL_WIDTH * zoom}
        rowHeight={() => BASE_CELL_HEIGHT * zoom}
        width={windowSize.width}
        height={windowSize.height}
      >
        {({ columnIndex, rowIndex, style }) => {
          const isSelected =
            selectedCell.row === rowIndex + 1 &&
            selectedCell.col === columnIndex + 1;

          return (
            <div
              style={{
                ...style, // ✅ Ensures React-Window's absolute positioning still applies
                width: BASE_CELL_WIDTH * zoom,
                height: BASE_CELL_HEIGHT * zoom,
                border: "1px solid lightgray",
              }}
              className={`flex items-center justify-center border border-gray-300 
                text-sm font-medium cursor-pointer transition-all select-none 
                bg-white hover:bg-gray-200 
                ${
                  isSelected
                    ? "bg-blue-400 text-white font-bold shadow-md" // ✅ Highlight selected cell
                    : "bg-white"
                }`}
              onClick={() => selectCell(rowIndex + 1, columnIndex + 1)}
            >
              {grid.getCell(rowIndex + 1, columnIndex + 1) || ""}
            </div>
          );
        }}
      </Grid>
    </div>
  );
};
