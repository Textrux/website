import React, { useEffect, useState, useCallback } from "react";
import GridGalleryModel from "../model/GridGalleryModel";
import GridModel from "../model/GridModel";
import { GridTabs } from "./GridTabs";
import { GridView } from "./GridView";
import { GridGroupTabs } from "./GridGroupTabs";
import { LocalStorageManager } from "../util/LocalStorageManager";
import { fromCSV } from "../util/CSV";
import { fromTSV } from "../util/TSV";

export interface GridGalleryProps {
  autoLoadLocalStorage?: boolean;
  initialGridCount?: number;
  defaultRows?: number;
  defaultCols?: number;
}

export default function GridGalleryView(props: GridGalleryProps) {
  const {
    autoLoadLocalStorage = true,
    initialGridCount = 1,
    defaultRows = 1000,
    defaultCols = 1000,
  } = props;

  const [gallery, setGallery] = useState(() => {
    const gal = new GridGalleryModel();
    gal.nextGridIndex = 1;
    return gal;
  });

  // Single unified effect to load data once on mount
  useEffect(() => {
    // Add debug output to inspect localStorage directly
    try {
      const rawIndexes = localStorage.getItem("galleryIndexes");
      console.log("Raw galleryIndexes in localStorage:", rawIndexes);

      // Inspect some random grid data to see if it exists
      for (let i = 0; i <= 10; i++) {
        const gridData = localStorage.getItem(`grid_${i}_state`);
        if (gridData) {
          console.log(
            `Found grid_${i}_state in localStorage with length ${gridData.length}`
          );
        }
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }

    console.log("Starting initial load effect");
    if (!autoLoadLocalStorage) {
      console.log("autoLoadLocalStorage is false, creating default grids");
      // Just create default grids without loading from storage
      setGallery((prev) => {
        const newGal = new GridGalleryModel();
        newGal.nextGridIndex = 1;
        for (let i = 0; i < initialGridCount; i++) {
          const grid = new GridModel(
            defaultRows,
            defaultCols,
            newGal.nextGridIndex++
          );
          grid.name = `Grid ${i + 1}`;
          newGal.grids.push(grid);
        }
        newGal.activeGridIndex = 0;
        return newGal;
      });
      return;
    }

    // Load from localStorage
    const savedIndexes = LocalStorageManager.loadGalleryIndexes();
    console.log("Loaded savedIndexes from localStorage:", savedIndexes);

    if (savedIndexes.length === 0) {
      console.log("No saved grids found, creating default ones");
      // No saved grids, create default ones
      setGallery(() => {
        const newGal = new GridGalleryModel();
        newGal.nextGridIndex = 1;
        for (let i = 0; i < initialGridCount; i++) {
          const grid = new GridModel(
            defaultRows,
            defaultCols,
            newGal.nextGridIndex++
          );
          grid.name = `Grid ${i + 1}`;
          // Set default values for zoom and delimiter
          grid.zoomLevel = 1.0;
          grid.delimiter = "tab";
          newGal.grids.push(grid);
        }
        newGal.activeGridIndex = 0;
        return newGal;
      });
      return;
    }

    // We have saved indexes, reconstruct each grid from localStorage
    console.log("Found saved grid indexes, loading from localStorage");
    setGallery(() => {
      const loadedGal = new GridGalleryModel();

      // Filter out any invalid indexes
      const validIndexes = savedIndexes.filter(
        (ix) => Number.isFinite(ix) && ix > 0
      );
      console.log("Valid indexes:", validIndexes);

      if (validIndexes.length === 0) {
        console.log("No valid indexes found, creating default grids");
        // All indexes were invalid, create defaults
        loadedGal.nextGridIndex = 1; // Reset the next index
        for (let i = 0; i < initialGridCount; i++) {
          const grid = new GridModel(
            defaultRows,
            defaultCols,
            loadedGal.nextGridIndex++
          );
          grid.name = `Grid ${i + 1}`;
          // Set default values for zoom and delimiter
          grid.zoomLevel = 1.0;
          grid.delimiter = "tab";
          loadedGal.grids.push(grid);

          // Save the new grid immediately to ensure it persists
          LocalStorageManager.saveGrid(grid);
        }
        loadedGal.activeGridIndex = 0;

        // Save the indexes and active grid index
        LocalStorageManager.saveGalleryIndexes(loadedGal.grids);
        LocalStorageManager.saveActiveGridIndex(loadedGal.activeGridIndex);

        return loadedGal;
      }

      // Load each grid from localStorage
      loadedGal.grids = validIndexes.map((idx) => {
        console.log(`Loading grid ${idx} from localStorage`);
        // Always initialize these properties to ensure they exist
        const g = new GridModel(defaultRows, defaultCols, idx);
        g.zoomLevel = 1.0;
        g.delimiter = "tab";

        // Load the grid state from localStorage (if exists)
        const wasLoaded = LocalStorageManager.loadGrid(g);
        console.log(
          `Grid ${idx} loaded successfully:`,
          wasLoaded,
          "zoom:",
          g.zoomLevel,
          "delimiter:",
          g.delimiter
        );

        // Ensure the grid has a name
        if (!g.name || g.name.trim() === "") {
          g.name = `Grid ${idx}`;
        }

        // If the grid couldn't be loaded, it might be corrupted
        if (!wasLoaded) {
          console.warn(
            `Failed to load grid ${idx} from localStorage, using empty grid`
          );
        }

        return g;
      });

      // Set the next index to be one more than the max
      const maxIndex = Math.max(...validIndexes);
      loadedGal.nextGridIndex = maxIndex + 1;
      console.log("Setting nextGridIndex to:", loadedGal.nextGridIndex);

      // Load which grid was active
      const savedActiveIndex = LocalStorageManager.loadActiveGridIndex();
      console.log("Loaded activeGridIndex:", savedActiveIndex);

      // Make sure the active index is valid
      loadedGal.activeGridIndex =
        savedActiveIndex < loadedGal.grids.length ? savedActiveIndex : 0;
      console.log("Final activeGridIndex:", loadedGal.activeGridIndex);

      return loadedGal;
    });
  }, [autoLoadLocalStorage, defaultCols, defaultRows, initialGridCount]);

  // Safety net: ensure there's at least one grid
  useEffect(() => {
    setGallery((prev) => {
      if (prev.grids.length === 0) {
        console.log("No grids found in gallery, creating default grid");

        // Create a copy of the gallery while preserving its type
        const newGal = Object.assign(new GridGalleryModel(), prev);

        // Make sure nextGridIndex is at least 1
        if (newGal.nextGridIndex < 1) {
          newGal.nextGridIndex = 1;
        }

        for (let i = 0; i < initialGridCount; i++) {
          const newIndex = newGal.nextGridIndex++;
          const grid = new GridModel(defaultRows, defaultCols, newIndex);
          grid.name = `Grid ${i + 1}`;
          grid.zoomLevel = 1.0;
          grid.delimiter = "tab";
          newGal.grids.push(grid);
        }

        // Make sure to reset activeGridIndex
        newGal.activeGridIndex = 0;

        // Save the newly created grid to localStorage immediately
        if (autoLoadLocalStorage) {
          for (const g of newGal.grids) {
            LocalStorageManager.saveGrid(g);
          }
          LocalStorageManager.saveGalleryIndexes(newGal.grids);
          LocalStorageManager.saveActiveGridIndex(newGal.activeGridIndex);
        }

        return newGal;
      }
      return prev;
    });
  }, [defaultRows, defaultCols, initialGridCount, autoLoadLocalStorage]);

  // Auto-save each time gallery changes
  useEffect(() => {
    if (!autoLoadLocalStorage) return;

    // Only proceed if we have grids
    if (gallery.grids.length === 0) {
      console.warn("Auto-save: No grids to save");
      return;
    }

    console.log(
      `Auto-save: Saving ${gallery.grids.length} grids to localStorage`
    );

    // Save the active grid index
    LocalStorageManager.saveActiveGridIndex(gallery.activeGridIndex);

    // Save the list of grid indexes for quick loading on startup
    LocalStorageManager.saveGalleryIndexes(gallery.grids);

    // Save each individual grid's data
    for (const g of gallery.grids) {
      if (g && Number.isFinite(g.index)) {
        LocalStorageManager.saveGrid(g);
      } else {
        console.warn("Auto-save: Skipping invalid grid", g);
      }
    }
  }, [gallery, autoLoadLocalStorage]);

  // Ensure each grid always has a valid name
  useEffect(() => {
    // Set default names for any grid that doesn't have one
    setGallery((prev) => {
      const needsNameUpdate = prev.grids.some((g) => !g.name);
      if (!needsNameUpdate) return prev;

      const newGal = Object.assign(new GridGalleryModel(), prev);
      newGal.grids = prev.grids.map((g, i) => {
        if (!g.name) {
          g.name = `Grid ${i + 1}`;
        }
        return g;
      });
      return newGal;
    });
  }, []);

  // Pass an explicit callback to the GridView component to handle grid changes
  const onGridChange = useCallback((updatedGrid: GridModel) => {
    // Save the updated grid to localStorage directly
    LocalStorageManager.saveGrid(updatedGrid);

    // Trigger a re-render of the gallery to reflect any updates
    setGallery((prev) => {
      // Create a shallow copy of the gallery
      const newGal = Object.assign(new GridGalleryModel(), prev);
      newGal.grids = [...prev.grids];
      return newGal;
    });
  }, []);

  const activeGrid = gallery.grids[gallery.activeGridIndex] || null;

  // Function to reset everything to defaults (single grid with default settings)
  const clearAllGrids = useCallback(() => {
    console.log("Clearing all grids and resetting to defaults");

    // First, delete all existing grids from localStorage
    for (const grid of gallery.grids) {
      LocalStorageManager.deleteGrid(grid);
    }

    // Create a fresh gallery with a single grid
    const newGal = new GridGalleryModel();
    newGal.nextGridIndex = 1;

    // Create a single default grid
    const defaultGrid = new GridModel(
      defaultRows,
      defaultCols,
      newGal.nextGridIndex++
    );
    defaultGrid.name = "Grid 1";
    defaultGrid.zoomLevel = 1.0;
    defaultGrid.delimiter = "tab";

    // Add the grid to the gallery
    newGal.grids = [defaultGrid];
    newGal.activeGridIndex = 0;

    // Update localStorage with the new state
    LocalStorageManager.saveGrid(defaultGrid);
    LocalStorageManager.saveGalleryIndexes(newGal.grids);
    LocalStorageManager.saveActiveGridIndex(newGal.activeGridIndex);

    // Update the state
    setGallery(newGal);
  }, [gallery.grids, defaultRows, defaultCols]);

  // Simplified selectGrid function - just changes the active index
  const selectGrid = (index: number) => {
    console.log(`Switching to grid ${index}`);
    if (index === gallery.activeGridIndex) {
      console.log("Already on this tab, doing nothing");
      // Already on this tab, do nothing
      return;
    }

    const currentActiveGrid = gallery.grids[gallery.activeGridIndex];
    // Save the previously active grid first (just to be safe)
    if (currentActiveGrid) {
      console.log(
        `Saving current active grid ${gallery.activeGridIndex} before switching`,
        "zoom:",
        currentActiveGrid.zoomLevel,
        "delimiter:",
        currentActiveGrid.delimiter
      );
      LocalStorageManager.saveGrid(currentActiveGrid);
    }

    setGallery((prev) => {
      // Create a shallow copy while preserving the type
      const newGal = Object.assign(new GridGalleryModel(), prev);
      newGal.grids = [...prev.grids];
      newGal.activeGridIndex = index;

      // Save the new active index to localStorage immediately
      LocalStorageManager.saveActiveGridIndex(index);
      console.log(
        `Switched to grid ${index}`,
        "zoom:",
        newGal.grids[index].zoomLevel,
        "delimiter:",
        newGal.grids[index].delimiter
      );

      return newGal;
    });
  };

  const addGrid = () => {
    setGallery((prev) => {
      // Create a shallow copy while preserving the type
      const newGal = Object.assign(new GridGalleryModel(), prev);
      newGal.grids = [...prev.grids];

      // Create a new grid with the next available index
      const newGrid = new GridModel(
        defaultRows,
        defaultCols,
        newGal.nextGridIndex++
      );
      newGrid.name = `Grid ${newGal.grids.length + 1}`;

      // Set default values for new grid
      newGrid.zoomLevel = 1.0;
      newGrid.delimiter = "tab";

      newGal.grids.push(newGrid);

      // Set the new grid as active
      newGal.activeGridIndex = newGal.grids.length - 1;

      // Save to localStorage immediately
      LocalStorageManager.saveGrid(newGrid);
      LocalStorageManager.saveGalleryIndexes(newGal.grids);
      LocalStorageManager.saveActiveGridIndex(newGal.activeGridIndex);

      return newGal;
    });
  };

  const deleteGrid = (index: number) => {
    if (gallery.grids.length <= 1) {
      alert("Cannot delete the last grid.");
      return;
    }

    setGallery((prev) => {
      // Create a shallow copy while preserving the type
      const newGal = Object.assign(new GridGalleryModel(), prev);
      newGal.grids = [...prev.grids];

      // Remove the grid
      const removed = newGal.grids.splice(index, 1)[0];

      // Delete from localStorage
      LocalStorageManager.deleteGrid(removed);

      // Adjust active index if needed
      if (newGal.activeGridIndex >= newGal.grids.length) {
        newGal.activeGridIndex = newGal.grids.length - 1;
      }

      // Update localStorage immediately
      LocalStorageManager.saveGalleryIndexes(newGal.grids);
      LocalStorageManager.saveActiveGridIndex(newGal.activeGridIndex);

      return newGal;
    });
  };

  const renameGrid = (index: number, newName: string) => {
    setGallery((prev) => {
      // Create a shallow copy while preserving the type
      const newGal = Object.assign(new GridGalleryModel(), prev);
      newGal.grids = [...prev.grids];

      // Update the name
      newGal.grids[index].name = newName;

      // Save to localStorage immediately
      LocalStorageManager.saveGrid(newGal.grids[index]);

      return newGal;
    });
  };

  // Function to create a new grid and load a file into it
  const loadFileToNewGrid = (file: File) => {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      if (!target?.result) return;
      const content = target.result as string;

      setGallery((prev) => {
        // Create a shallow copy while preserving the type
        const newGal = Object.assign(new GridGalleryModel(), prev);
        newGal.grids = [...prev.grids];

        // Create a new grid with the next available index
        const newGrid = new GridModel(
          defaultRows,
          defaultCols,
          newGal.nextGridIndex++
        );

        // Set the grid name to the filename without extension
        const baseName = file.name.replace(/\.\w+$/, ""); // remove extension
        newGrid.name = baseName.split("___")[0];

        // Set default values for new grid
        newGrid.zoomLevel = 1.0;
        newGrid.delimiter =
          file.name.endsWith(".tsv") || content.includes("\t") ? "tab" : ",";

        // Parse the file content
        const isTab = file.name.endsWith(".tsv") || content.includes("\t");
        const arr = isTab ? fromTSV(content) : fromCSV(content);

        // Resize the grid if needed
        const neededRows = arr.length;
        const neededCols = Math.max(...arr.map((row) => row.length), 0);
        newGrid.resizeRows(Math.max(newGrid.rowCount, neededRows));
        newGrid.resizeCols(Math.max(newGrid.columnCount, neededCols));

        // Load the data into the grid
        for (let r = 0; r < neededRows; r++) {
          for (let c = 0; c < arr[r].length; c++) {
            const val = arr[r][c].trim();
            if (val) newGrid.setCellRaw(r + 1, c + 1, val);
          }
        }

        // Add the new grid
        newGal.grids.push(newGrid);

        // Set the new grid as active
        newGal.activeGridIndex = newGal.grids.length - 1;

        // Save to localStorage immediately
        LocalStorageManager.saveGrid(newGrid);
        LocalStorageManager.saveGalleryIndexes(newGal.grids);
        LocalStorageManager.saveActiveGridIndex(newGal.activeGridIndex);

        return newGal;
      });
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <GridTabs
        grids={gallery.grids}
        activeIndex={gallery.activeGridIndex}
        onSelect={selectGrid}
        onAddGrid={addGrid}
        onDeleteGrid={deleteGrid}
        onRenameGrid={renameGrid}
      />
      <div style={{ flex: "1 1 0%", position: "relative", overflow: "hidden" }}>
        {activeGrid ? (
          <GridView
            key={`grid-${activeGrid.index}`}
            grid={activeGrid}
            autoLoadLocalStorage={false}
            baseRowHeight={24}
            baseColWidth={60}
            baseFontSize={14}
            onGridChange={onGridChange}
            onLoadFileToNewGrid={loadFileToNewGrid}
            clearAllGrids={clearAllGrids}
          />
        ) : (
          <div style={{ padding: "10px" }}>No grid selected.</div>
        )}
      </div>

      <div style={{ height: "35px", flexShrink: 0 }}>
        <GridGroupTabs />
      </div>
    </div>
  );
}
