import React from "react";
import { VariableSizeGrid as Grid } from "react-window";
import { useGridStore } from "../store/useGridStore";

const CELL_WIDTH = 100;
const CELL_HEIGHT = 30;

export const GridView: React.FC = () => {
  const { grid, selectedCell, selectCell, zoom } = useGridStore();

  return (
    <div
      className="border border-gray-300 rounded-lg overflow-hidden"
      style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
    >
      {" "}
      {/* ✅ Apply Zoom */}
      <Grid
        columnCount={grid.cols}
        rowCount={grid.rows}
        columnWidth={() => CELL_WIDTH}
        rowHeight={() => CELL_HEIGHT}
        width={600 / zoom}
        height={400 / zoom}
      >
        {({ columnIndex, rowIndex, style }) => (
          <div
            style={style}
            className={`border p-2 text-center ${
              selectedCell.row === rowIndex + 1 &&
              selectedCell.col === columnIndex + 1
                ? "bg-yellow-200"
                : "bg-white"
            }`}
            onClick={() => selectCell(rowIndex + 1, columnIndex + 1)}
          >
            {grid.getCell(rowIndex + 1, columnIndex + 1)}
          </div>
        )}
      </Grid>
    </div>
  );
};
