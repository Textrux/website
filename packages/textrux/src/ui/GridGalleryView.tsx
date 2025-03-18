import React, { useEffect, useState } from "react";
import GridGalleryModel from "../model/GridGalleryModel";
import GridModel from "../model/GridModel";
import { GridTabs } from "./GridTabs";
import { GridView } from "./GridView";
import { GridGroupTabs } from "./GridGroupTabs";
import { LocalStorageManager } from "../util/LocalStorageManager";

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

  useEffect(() => {
    if (!autoLoadLocalStorage) return;

    const savedIndexes = LocalStorageManager.loadGalleryIndexes();
    if (savedIndexes.length > 0) {
      setGallery(() => {
        const gal = new GridGalleryModel();
        // Convert any invalid indexes to 0 to be safe
        const validIndexes = savedIndexes.filter((ix) => Number.isFinite(ix));
        if (validIndexes.length === 0) {
          // fallback if all invalid
          for (let i = 0; i < initialGridCount; i++) {
            gal.grids.push(
              new GridModel(defaultRows, defaultCols, gal.nextGridIndex++)
            );
          }
          return gal;
        }

        gal.grids = validIndexes.map((idx) => {
          const g = new GridModel(defaultRows, defaultCols, idx);
          LocalStorageManager.loadGrid(g);
          return g;
        });

        // If validIndexes was not empty, find its maximum
        const maxIndex = Math.max(...validIndexes);
        gal.nextGridIndex = maxIndex + 1;

        // also load whichever was last active
        gal.activeGridIndex = LocalStorageManager.loadActiveGridIndex();
        return gal;
      });
    } else {
      // fallback: create default if none saved
      setGallery(() => {
        const gal = new GridGalleryModel();
        for (let i = 0; i < initialGridCount; i++) {
          gal.grids.push(
            new GridModel(defaultRows, defaultCols, gal.nextGridIndex++)
          );
        }
        gal.activeGridIndex = 0;
        return gal;
      });
    }
  }, [autoLoadLocalStorage, defaultCols, defaultRows, initialGridCount]);

  // Also reload "activeGridIndex" (optional, you might do it above).
  useEffect(() => {
    if (!autoLoadLocalStorage) return;
    const storedActive = LocalStorageManager.loadActiveGridIndex();
    setGallery((prev) => {
      const gal = new GridGalleryModel();
      gal.grids = [...prev.grids];
      gal.activeGridIndex = storedActive;
      gal.nextGridIndex = prev.nextGridIndex;
      return gal;
    });
  }, [autoLoadLocalStorage]);

  // If the user has no grids, create them (a safety net)
  useEffect(() => {
    setGallery((prev) => {
      if (prev.grids.length === 0) {
        const gal = new GridGalleryModel();
        gal.activeGridIndex = prev.activeGridIndex;
        gal.nextGridIndex = prev.nextGridIndex;

        for (let i = 0; i < initialGridCount; i++) {
          const newIndex = gal.nextGridIndex;
          gal.nextGridIndex++;
          const grid = new GridModel(defaultRows, defaultCols, newIndex);
          gal.grids.push(grid);
        }
        return gal;
      }
      return prev;
    });
  }, [defaultRows, defaultCols, initialGridCount]);

  // Auto-save each time gallery changes
  useEffect(() => {
    if (!autoLoadLocalStorage) return;
    LocalStorageManager.saveActiveGridIndex(gallery.activeGridIndex);

    // Save each grid
    for (const g of gallery.grids) {
      LocalStorageManager.saveGrid(g);
    }
    // also save the set of indexes
    LocalStorageManager.saveGalleryIndexes(gallery.grids);
  }, [gallery, autoLoadLocalStorage]);

  const activeGrid = gallery.grids[gallery.activeGridIndex] || null;

  const selectGrid = (index: number) => {
    setGallery((prev) => {
      const gal = new GridGalleryModel();
      gal.grids = [...prev.grids];

      LocalStorageManager.loadGrid(gal.grids[index]);
      // Re-clone from loaded data
      const loadedState = gal.grids[index].toJSONState();
      const freshGrid = new GridModel(
        gal.grids[index].rowCount,
        gal.grids[index].columnCount,
        gal.grids[index].index
      );
      freshGrid.loadFromJSONState(loadedState);

      gal.grids[index] = freshGrid;

      gal.activeGridIndex = index;
      gal.nextGridIndex = prev.nextGridIndex;
      return gal;
    });
  };

  const addGrid = () => {
    setGallery((prev) => {
      const gal = new GridGalleryModel();
      gal.grids = [...prev.grids];

      const newIdx = prev.nextGridIndex;
      const newGrid = new GridModel(defaultRows, defaultCols, newIdx);
      gal.grids.push(newGrid);

      gal.activeGridIndex = gal.grids.length - 1;
      gal.nextGridIndex = newIdx + 1;

      // Make sure we store the new indexes
      if (autoLoadLocalStorage) {
        LocalStorageManager.saveGalleryIndexes(gal.grids);
      }
      return gal;
    });
  };

  const deleteGrid = (index: number) => {
    if (gallery.grids.length <= 1) {
      alert("Cannot delete the last grid.");
      return;
    }
    setGallery((prev) => {
      const gal = new GridGalleryModel();
      gal.grids = [...prev.grids];

      const removed = gal.grids.splice(index, 1)[0];
      LocalStorageManager.deleteGrid(removed);

      gal.activeGridIndex = Math.min(gal.activeGridIndex, gal.grids.length - 1);
      gal.nextGridIndex = prev.nextGridIndex;

      // Save new set of indexes
      if (autoLoadLocalStorage) {
        LocalStorageManager.saveGalleryIndexes(gal.grids);
      }
      return gal;
    });
  };

  const renameGrid = (index: number, newName: string) => {
    setGallery((prev) => {
      const gal = new GridGalleryModel();
      gal.grids = [...prev.grids];
      const oldGrid = gal.grids[index];
      oldGrid.name = newName;
      gal.activeGridIndex = prev.activeGridIndex;
      gal.nextGridIndex = prev.nextGridIndex;

      LocalStorageManager.saveGrid(oldGrid);
      return gal;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
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
      <div style={{ flex: 1, position: "relative" }}>
        {activeGrid ? (
          <GridView
            grid={activeGrid}
            autoLoadLocalStorage={false}
            baseRowHeight={24}
            baseColWidth={60}
            baseFontSize={14}
          />
        ) : (
          <div style={{ padding: "10px" }}>No grid selected.</div>
        )}
      </div>

      <div style={{ height: "35px" }}>
        <GridGroupTabs />
      </div>
    </div>
  );
}
