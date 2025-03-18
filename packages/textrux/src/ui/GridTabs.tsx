import React, { useState } from "react";
import GridModel from "../model/GridModel";

interface GridTabsProps {
  grids: GridModel[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAddGrid: () => void;
  onDeleteGrid: (index: number) => void;
  onRenameGrid: (index: number, newName: string) => void;
}

/**
 * Renders a row of tabs – one per Grid in the gallery – plus a "+" to add new grids.
 */
export function GridTabs(props: GridTabsProps) {
  const {
    grids,
    activeIndex,
    onSelect,
    onAddGrid,
    onDeleteGrid,
    onRenameGrid,
  } = props;

  // Track which tab is in “rename” mode (if any)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");

  const handleDoubleClick = (index: number) => {
    setEditingIndex(index);
    setDraftName(grids[index].name);
  };

  const handleRename = (index: number) => {
    const newName = draftName.trim() || grids[index].name;
    onRenameGrid(index, newName);
    setEditingIndex(null);
    setDraftName("");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "25px",
        background: "#f0f0f0",
        borderBottom: "1px solid #ccc",
        padding: "0 8px",
      }}
    >
      {grids.map((grid, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={grid.id} // or `i`, but `grid.id` is more stable
            onClick={() => onSelect(i)}
            onDoubleClick={() => handleDoubleClick(i)}
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "8px",
              padding: "4px 8px",
              border: isActive ? "1px solid #999" : "1px solid #ccc",
              background: isActive ? "#fff" : "#e0e0e0",
              cursor: "pointer",
              position: "relative",
            }}
          >
            {editingIndex === i ? (
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => handleRename(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(i);
                  if (e.key === "Escape") {
                    setEditingIndex(null);
                    setDraftName("");
                  }
                }}
                style={{
                  width: "100px",
                  fontSize: "0.9rem",
                }}
              />
            ) : (
              <div style={{ marginRight: "8px" }}>{grid.name}</div>
            )}

            {/* The small “x” button on each tab */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                const confirmed = window.confirm(
                  `Delete the grid "${grid.name}"?`
                );
                if (confirmed) onDeleteGrid(i);
              }}
              style={{
                fontWeight: "bold",
                cursor: "pointer",
                padding: "0 4px",
                color: "#666",
              }}
            >
              x
            </div>
          </div>
        );
      })}

      {/* Mini tab with a "+" to create a new grid */}
      <div
        onClick={onAddGrid}
        style={{
          display: "inline-flex",
          alignItems: "center",
          marginLeft: "auto",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        title="Add new grid"
      >
        +
      </div>
    </div>
  );
}
