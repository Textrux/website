import React, { useState, useRef } from "react";

export function GridGroupTabs() {
  // For now, we'll store a local dummy array of tab labels
  const [tabs, setTabs] = useState<string[]>(["Sheet1"]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");

  // Ref for scrolling
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const handleAddTab = () => {
    setTabs([...tabs, `Sheet${tabs.length + 1}`]);
  };

  const handleDeleteTab = (index: number) => {
    if (tabs.length === 1) {
      alert("Cannot delete the last grid tab.");
      return;
    }
    const confirmed = window.confirm(`Delete tab "${tabs[index]}"?`);
    if (confirmed) {
      const copy = [...tabs];
      copy.splice(index, 1);
      setTabs(copy);
    }
  };

  const handleDoubleClick = (index: number) => {
    setEditingIndex(index);
    setDraftName(tabs[index]);
  };

  const handleRename = (index: number) => {
    if (!draftName.trim()) {
      setEditingIndex(null);
      return;
    }
    const newTabs = [...tabs];
    newTabs[index] = draftName.trim();
    setTabs(newTabs);
    setEditingIndex(null);
    setDraftName("");
  };

  // Handle wheel events for horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    // Directly scroll horizontally with wheel
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
    <div className="relative flex items-center h-[35px] bg-gray-50 border-t border-gray-200">
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
          {tabs.map((tabName, i) => (
            <div
              key={i}
              onClick={() => {
                /* Future: select sheet */
              }}
              onDoubleClick={() => handleDoubleClick(i)}
              className="flex items-center px-3 py-1.5 rounded-b-lg border border-gray-300 bg-white shadow-sm relative group cursor-pointer"
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
                  title={tabName}
                >
                  {tabName}
                </span>
              )}

              {/* Delete button - hidden during rename and until hover */}
              {editingIndex !== i && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTab(i);
                  }}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  aria-label="Delete sheet"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add new tab button */}
      <button
        onClick={handleAddTab}
        className="px-3 py-1.5 mx-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors duration-150"
        title="Add new sheet"
        aria-label="Add new sheet"
      >
        +
      </button>
    </div>
  );
}
