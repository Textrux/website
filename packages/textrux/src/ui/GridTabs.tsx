import React, { useState, useRef, useEffect } from "react";
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
 * Supports horizontal scrolling with touch, mouse wheel, and arrow keys.
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

  // Track which tab is in "rename" mode (if any)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");

  // Refs for scrolling
  const tabsContainerRef = useRef<HTMLDivElement>(null);

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

  // Handle wheel events for horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    // No need for modifier keys - directly scroll horizontally with wheel
    e.preventDefault();
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      if (tabsContainerRef.current) {
        const scrollAmount = 200;
        tabsContainerRef.current.scrollBy({
          left: e.key === "ArrowLeft" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className="relative flex items-center h-[35px] bg-gray-100 border-b border-gray-200">
      {/* Tabs container */}
      <div
        ref={tabsContainerRef}
        className="flex-1 flex items-center overflow-x-auto"
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{
          scrollbarWidth: "thin",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex items-center px-2 space-x-1">
          {grids.map((grid, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={grid.id}
                onClick={() => onSelect(i)}
                onDoubleClick={() => handleDoubleClick(i)}
                className={`
                  flex items-center px-3 py-1.5 rounded-t-lg border relative group
                  ${
                    isActive
                      ? "bg-white border-gray-300 border-b-white shadow-sm"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }
                  cursor-pointer transition-colors duration-150
                `}
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
                    className="min-w-[24px] max-w-[384px] text-sm bg-transparent border-none focus:outline-none"
                    maxLength={128}
                  />
                ) : (
                  <span
                    className="text-sm text-gray-700 pr-5 max-w-[150px] overflow-hidden whitespace-nowrap text-ellipsis"
                    title={grid.name}
                  >
                    {grid.name}
                  </span>
                )}

                {/* Compact delete button positioned on the far right - hidden during rename and until hover */}
                {editingIndex !== i && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const confirmed = window.confirm(
                        `Delete the grid "${grid.name}"?`
                      );
                      if (confirmed) onDeleteGrid(i);
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    aria-label="Delete grid"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add new grid button */}
      <button
        onClick={onAddGrid}
        className="px-3 py-1.5 mx-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors duration-150"
        title="Add new grid"
        aria-label="Add new grid"
      >
        +
      </button>
    </div>
  );
}
