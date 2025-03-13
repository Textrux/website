import React, { useState } from "react";

export function GridTabs() {
  // For now, we'll store a local dummy array of tab labels
  const [tabs, setTabs] = useState<string[]>(["Sheet1"]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");

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

  return (
    <div
      style={{
        height: "25px",
        background: "#f7f7f7",
        borderTop: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        transform: "rotateX(180deg)", // optionally "flip" them to appear "upside down"
      }}
    >
      {tabs.map((tabName, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: "8px",
            padding: "4px 8px",
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
          onDoubleClick={() => handleDoubleClick(i)}
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
                width: "70px",
                fontSize: "0.85rem",
              }}
            />
          ) : (
            <div style={{ marginRight: "8px", transform: "rotateX(180deg)" }}>
              {tabName}
            </div>
          )}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTab(i);
            }}
            style={{
              fontWeight: "bold",
              cursor: "pointer",
              padding: "0 4px",
              color: "#666",
              transform: "rotateX(180deg)",
            }}
          >
            x
          </div>
        </div>
      ))}

      {/* Mini tab with a "+" */}
      <div
        onClick={handleAddTab}
        style={{
          display: "inline-flex",
          alignItems: "center",
          marginLeft: "auto",
          fontWeight: "bold",
          cursor: "pointer",
          transform: "rotateX(180deg)",
        }}
        title="Add new grid tab"
      >
        +
      </div>
    </div>
  );
}
