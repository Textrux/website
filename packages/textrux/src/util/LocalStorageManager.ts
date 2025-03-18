import GridModel from "../model/GridModel";

export class LocalStorageManager {
  static saveActiveGridIndex(activeIndex: number) {
    localStorage.setItem("activeGridIndex", String(activeIndex));
  }

  static saveGalleryIndexes(grids: GridModel[]) {
    // Just store the numeric indexes:
    const indexes = grids.map((g) => (Number.isFinite(g.index) ? g.index : 0));
    localStorage.setItem("galleryIndexes", JSON.stringify(indexes));
  }

  static loadGalleryIndexes(): number[] {
    const raw = localStorage.getItem("galleryIndexes");
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      // Filter out anything that’s not a valid finite number:
      const numericArr = arr.filter((x: any) => Number.isFinite(x));
      return numericArr;
    } catch {
      return [];
    }
  }

  static loadActiveGridIndex(): number {
    const raw = localStorage.getItem("activeGridIndex");
    if (!raw) return 0;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? 0 : n;
  }

  static saveGrid(grid: GridModel, partialUpdates?: Partial<GridModel>) {
    if (partialUpdates) {
      // If you sometimes pass partial overrides, apply them:
      Object.assign(grid, partialUpdates);
    }
    const key = `grid_${grid.index}_state`;
    const json = JSON.stringify(grid.toJSONState());
    localStorage.setItem(key, json);
  }

  static loadGrid(grid: GridModel): boolean {
    const key = `grid_${grid.index}_state`;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      grid.loadFromJSONState(parsed);
      return true;
    } catch (err) {
      console.warn("Failed to parse grid state:", err);
      return false;
    }
  }

  static deleteGrid(grid: GridModel) {
    const key = `grid_${grid.index}_state`;
    localStorage.removeItem(key);
  }
}
