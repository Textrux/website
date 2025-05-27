import React, { useState, useRef, useEffect } from "react";
import GridModel from "../layers/1-substrate/GridModel";

interface GridTabsProps {
  grids: GridModel[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAddGrid: () => void;
  onDeleteGrid: (index: number) => void;
  onRenameGrid: (index: number, newName: string) => void;
  onReorderGrids?: (newGrids: GridModel[]) => void;
}

/**
 * Renders a row of tabs – one per Grid in the gallery – plus a "+" to add new grids.
 * Supports horizontal scrolling with touch, mouse wheel, and arrow keys.
 * Tabs can be reordered via drag and drop, and new tabs can be added by double-clicking empty space.
 */
export function GridTabs(props: GridTabsProps) {
  const {
    grids,
    activeIndex,
    onSelect,
    onAddGrid,
    onDeleteGrid,
    onRenameGrid,
    onReorderGrids,
  } = props;

  // Track which tab is in "rename" mode (if any)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  // Refs for scrolling and drag handling
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabsInnerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Prevent text selection on double click
  useEffect(() => {
    const preventSelection = (e: MouseEvent) => {
      if (e.detail > 1) {
        // Check if it's a double click or more
        e.preventDefault();
      }
    };

    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener("mousedown", preventSelection);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousedown", preventSelection);
      }
    };
  }, []);

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

  // Drag and drop handlers
  const handleDragStart = (
    index: number,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    if (editingIndex !== null) return;

    // Set a custom drag ghost image with the tab
    const dragElement = e.currentTarget.cloneNode(true) as HTMLDivElement;
    dragElement.style.opacity = "0.6";
    dragElement.style.position = "absolute";
    dragElement.style.left = "-1000px";
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 0, 0);
    e.dataTransfer.effectAllowed = "move";

    // Set dragged data
    e.dataTransfer.setData("text/plain", index.toString());

    setDraggedIndex(index);
    isDragging.current = true;

    // Remove the ghost element after the drag starts
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
  };

  const handleDragOver = (
    index: number,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedIndex === null || draggedIndex === index) return;

    // Determine if we're on the left half or right half of the element
    const rect = e.currentTarget.getBoundingClientRect();
    const position =
      e.clientX < rect.left + rect.width * 0.4 ? "before" : "after";

    setDragOverIndex(index);
    setDropPosition(position);
  };

  const handleDragOverEmpty = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Only handle if target is the container or inner container
    const isTargetContainer =
      e.currentTarget === e.target || e.target === tabsInnerRef.current;

    if (!isTargetContainer) return;

    // When dragging over the empty space, set dragOverIndex to the last tab
    if (draggedIndex !== null && grids.length > 0) {
      setDragOverIndex(grids.length - 1);
      setDropPosition("after");
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Check if we've left the container entirely
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node;

    // Only clear indicators if we've actually left the container
    // and not just moved to another element within it
    if (!currentTarget.contains(relatedTarget) && draggedIndex !== null) {
      setDragOverIndex(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Process the drop operation
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      dropPosition !== null
    ) {
      reorderTabs();
    }

    // Reset drag state
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
    isDragging.current = false;
  };

  const reorderTabs = () => {
    if (
      draggedIndex === null ||
      dragOverIndex === null ||
      dropPosition === null
    )
      return;

    // Create a new array with the dragged tab in the new position
    const newGrids = [...grids];
    const [movedItem] = newGrids.splice(draggedIndex, 1);

    // Calculate insertion position more reliably
    let insertPosition = dragOverIndex;

    // If we're dropping after and the drag target isn't the dragged item
    if (dropPosition === "after") {
      insertPosition += 1;
    }

    // If we dragged from before to after our target, we need to adjust
    // because removing the dragged item shifted the array
    if (draggedIndex < dragOverIndex) {
      // The target position needs to be adjusted by 1 because we removed an item before it
      insertPosition -= 1;
    }

    // Make sure we don't go out of bounds
    insertPosition = Math.min(newGrids.length, Math.max(0, insertPosition));

    newGrids.splice(insertPosition, 0, movedItem);

    // Update active index if it's affected by the reordering
    let newActiveIndex = activeIndex;

    // If we're moving the active tab
    if (activeIndex === draggedIndex) {
      newActiveIndex = insertPosition;
    }
    // If active tab is between old and new positions, we need to adjust it
    else if (draggedIndex < activeIndex && activeIndex <= insertPosition) {
      // Tab was removed before active, so active shifts down by 1
      newActiveIndex = activeIndex - 1;
    } else if (draggedIndex > activeIndex && activeIndex >= insertPosition) {
      // Tab was inserted before active, so active shifts up by 1
      newActiveIndex = activeIndex + 1;
    }

    // Ensure active index stays in bounds
    newActiveIndex = Math.min(newGrids.length - 1, Math.max(0, newActiveIndex));

    // Call the reordering callback if provided
    if (onReorderGrids) {
      // Log for debugging
      console.log(
        `Reordering: moved tab ${draggedIndex} (${grids[draggedIndex].name}) to position ${insertPosition}`
      );
      console.log(`Active index was ${activeIndex}, now ${newActiveIndex}`);

      onReorderGrids(newGrids);

      // Update active tab if needed
      if (newActiveIndex !== activeIndex) {
        onSelect(newActiveIndex);
      }
    } else {
      console.warn(
        "onReorderGrids callback not provided. Tab order changes won't persist."
      );
      // Just select the moved tab as fallback behavior
      onSelect(insertPosition);
    }
  };

  // Double click on empty space to add a new tab
  const handleEmptyAreaDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click is on the container, not on a tab
    if (
      e.target === tabsInnerRef.current ||
      e.target === tabsContainerRef.current
    ) {
      e.preventDefault(); // Prevent text selection
      onAddGrid();
    }
  };

  return (
    <div className="relative flex items-center h-[35px] bg-gray-100 border-b border-gray-200 select-none">
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
        onDragOver={handleDragOverEmpty}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDoubleClick={handleEmptyAreaDoubleClick}
      >
        <div
          ref={tabsInnerRef}
          className="flex items-center px-2 space-x-1"
          onDragOver={handleDragOverEmpty}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {grids.map((grid, i) => {
            const isActive = i === activeIndex;
            const isDragged = i === draggedIndex;
            const isDraggedOver = i === dragOverIndex;

            return (
              <React.Fragment key={grid.id}>
                {/* Visual indicator for drag destination before */}
                {draggedIndex !== null &&
                  isDraggedOver &&
                  dropPosition === "before" && (
                    <div className="h-8 w-1 bg-blue-500 rounded mr-0.5" />
                  )}

                <div
                  onClick={() => onSelect(i)}
                  onDoubleClick={() => handleDoubleClick(i)}
                  draggable={editingIndex !== i}
                  onDragStart={(e) => handleDragStart(i, e)}
                  onDragOver={(e) => handleDragOver(i, e)}
                  onDragEnd={handleDrop}
                  onDrop={handleDrop}
                  className={`
                    flex items-center px-3 py-1.5 rounded-t-lg border relative group
                    ${
                      isActive
                        ? "bg-white border-gray-300 border-b-white shadow-sm"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }
                    ${isDragged ? "opacity-50" : ""}
                    ${isDraggedOver ? "z-10" : ""}
                    cursor-${
                      editingIndex === i ? "text" : "pointer"
                    } transition-colors duration-150
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

                {/* Visual indicator for drag destination after */}
                {draggedIndex !== null &&
                  isDraggedOver &&
                  dropPosition === "after" && (
                    <div className="h-8 w-1 bg-blue-500 rounded ml-0.5" />
                  )}
              </React.Fragment>
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
