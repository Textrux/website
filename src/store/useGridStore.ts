import { create } from "zustand";
import { Grid } from "textrux";

interface GridState {
  grid: Grid;
  selectedCell: { row: number; col: number };
  zoom: number;
  selectCell: (row: number, col: number) => void;
  updateCell: (row: number, col: number, value: string) => void;
  undo: () => void;
  redo: () => void;
  setZoom: (zoom: number) => void;
}

export const useGridStore = create<GridState>((set, get) => {
  const gridInstance = new Grid(1000, 50); // ✅ Always an instance of Grid

  return {
    grid: gridInstance, // ✅ Store instance, not plain object
    selectedCell: { row: 1, col: 1 },
    zoom: 1,

    selectCell: (row, col) => set({ selectedCell: { row, col } }),

    updateCell: (row, col, value) => {
      gridInstance.setCell(row, col, value);
      set({ grid: gridInstance }); // ✅ Avoid cloning, keep instance methods
    },

    undo: () => {
      gridInstance.undo();
      set({ grid: gridInstance });
    },

    redo: () => {
      gridInstance.redo();
      set({ grid: gridInstance });
    },

    setZoom: (zoom) => set({ zoom }),
  };
});
