import React, { useState } from "react";
import { useGridStore } from "../store/useGridStore";

export const FormulaBar = () => {
  const { selectedCell, updateCell, grid } = useGridStore();
  const [formula, setFormula] = useState(
    grid.getCell(selectedCell.row, selectedCell.col)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormula(e.target.value);
  const applyFormula = () =>
    updateCell(selectedCell.row, selectedCell.col, formula);

  return (
    <div className="flex items-center w-full max-w-lg mt-3 border border-gray-300 p-2 rounded-md bg-white">
      <span className="text-gray-500 font-bold mr-2">
        R{selectedCell.row}C{selectedCell.col}
      </span>
      <input
        type="text"
        value={formula}
        onChange={handleChange}
        onBlur={applyFormula}
        className="flex-1 border-none outline-none p-1 text-gray-700"
      />
    </div>
  );
};
