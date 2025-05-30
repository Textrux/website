import GridModel, {
  SizingMode,
  GridSizingSettings,
} from "../layers/1-substrate/GridModel";
import { CellFormat } from "../style/CellFormat";

export class LocalStorageManager {
  static saveActiveGridIndex(activeIndex: number) {
    localStorage.setItem("activeGridIndex", String(activeIndex));
  }

  static saveGalleryIndexes(grids: GridModel[]) {
    // Just store the numeric indexes:
    const indexes = grids.map((g) => (Number.isFinite(g.index) ? g.index : 0));
    // console.log("Saving gallery indexes to localStorage:", indexes);

    // Fix: Ensure we're not saving an empty array even if there are grids
    if (indexes.length === 0 && grids.length > 0) {
      console.warn(
        "Warning: Attempted to save empty indexes even though grids exist"
      );
      // Fallback: Create indexes 1...n for the grids
      const fallbackIndexes = grids.map((_, i) => i + 1);
      localStorage.setItem("galleryIndexes", JSON.stringify(fallbackIndexes));
      return;
    }

    localStorage.setItem("galleryIndexes", JSON.stringify(indexes));

    // Verify it was saved correctly
    const saved = localStorage.getItem("galleryIndexes");
    // console.log("Verification - saved galleryIndexes:", saved);
  }

  static loadGalleryIndexes(): number[] {
    const raw = localStorage.getItem("galleryIndexes");
    console.log("Raw galleryIndexes from localStorage:", raw);

    if (!raw) {
      console.warn("No galleryIndexes found in localStorage");
      return [];
    }

    try {
      const arr = JSON.parse(raw);
      // console.log("Parsed galleryIndexes:", arr);

      // Make sure arr is actually an array
      if (!Array.isArray(arr)) {
        console.warn("galleryIndexes is not an array, returning empty array");
        return [];
      }

      // Filter out anything that's not a valid finite number:
      const numericArr = arr.filter((x: any) => Number.isFinite(x));
      // console.log("Filtered numeric galleryIndexes:", numericArr);

      // Make sure we haven't filtered out all values
      if (numericArr.length === 0 && arr.length > 0) {
        console.warn("All indexes were filtered out, attempting to recover");
        // Try to recover by converting strings to numbers
        const recovered = arr
          .map((x: any) => {
            const num = Number(x);
            return Number.isFinite(num) ? num : 0;
          })
          .filter((x) => x > 0);

        if (recovered.length > 0) {
          // console.log("Recovered indexes:", recovered);
          return recovered;
        }
      }

      return numericArr;
    } catch (err) {
      console.error("Error parsing galleryIndexes:", err);
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

    // Make sure essential properties always exist
    if (grid.zoomLevel === undefined) {
      grid.zoomLevel = 1.0;
    }

    if (grid.delimiter === undefined) {
      grid.delimiter = "tab";
    }

    // Log what we're saving to help debug
    // console.log(
    //   `Saving grid ${grid.index} to localStorage`,
    //   "zoom:",
    //   grid.zoomLevel,
    //   "delimiter:",
    //   grid.delimiter
    // );

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

    // Also clean up any old separate sizing settings
    const oldSizingKey = `grid_${grid.index}_sizing`;
    localStorage.removeItem(oldSizingKey);
  }

  // Updated methods for sizing settings - now integrated into main grid state
  static saveGridSizing(gridIndex: number, settings: GridSizingSettings) {
    // Load the existing grid state
    const key = `grid_${gridIndex}_state`;
    const raw = localStorage.getItem(key);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Add sizing settings to the existing state
        parsed.sizingSettings = settings;
        localStorage.setItem(key, JSON.stringify(parsed));
      } catch (err) {
        console.warn("Failed to update grid state with sizing settings:", err);
      }
    } else {
      // If no existing state, create minimal state with just sizing settings
      const minimalState = {
        sizingSettings: settings,
      };
      localStorage.setItem(key, JSON.stringify(minimalState));
    }

    // Clean up old separate sizing key if it exists
    const oldSizingKey = `grid_${gridIndex}_sizing`;
    localStorage.removeItem(oldSizingKey);
  }

  static loadGridSizing(gridIndex: number): GridSizingSettings | null {
    const key = `grid_${gridIndex}_state`;
    const raw = localStorage.getItem(key);

    if (!raw) {
      // Check for old separate sizing key as fallback
      const oldSizingKey = `grid_${gridIndex}_sizing`;
      const oldRaw = localStorage.getItem(oldSizingKey);
      if (oldRaw) {
        try {
          const parsed = JSON.parse(oldRaw);
          // Convert plain objects back to CellFormat instances
          if (parsed.cellFormats) {
            const convertedFormats: Record<string, CellFormat> = {};
            for (const [cellKey, formatData] of Object.entries(
              parsed.cellFormats
            )) {
              convertedFormats[cellKey] = new CellFormat(
                formatData as Partial<CellFormat>
              );
            }
            parsed.cellFormats = convertedFormats;
          }
          return parsed;
        } catch (err) {
          console.warn("Failed to parse old grid sizing settings:", err);
        }
      }
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed.sizingSettings) return null;

      // Convert plain objects back to CellFormat instances
      const settings = parsed.sizingSettings;
      if (settings.cellFormats) {
        const convertedFormats: Record<string, CellFormat> = {};
        for (const [cellKey, formatData] of Object.entries(
          settings.cellFormats
        )) {
          convertedFormats[cellKey] = new CellFormat(
            formatData as Partial<CellFormat>
          );
        }
        settings.cellFormats = convertedFormats;
      }
      return settings;
    } catch (err) {
      console.warn("Failed to parse grid sizing settings:", err);
      return null;
    }
  }

  static getDefaultGridSizing(
    rowCount: number,
    colCount: number,
    baseRowHeight: number,
    baseColWidth: number
  ): GridSizingSettings {
    return {
      sizingMode: "grid",
      rowHeights: Array(rowCount).fill(baseRowHeight),
      colWidths: Array(colCount).fill(baseColWidth),
      cellFormats: {},
    };
  }
}
