import React, { useState } from "react";
import Project from "../model/Project";

interface ProjectTabsProps {
  projects: Project[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAddProject: () => void;
  onDeleteProject: (index: number) => void;
  onRenameProject: (index: number, newName: string) => void;
}

export function ProjectTabs(props: ProjectTabsProps) {
  const {
    projects,
    activeIndex,
    onSelect,
    onAddProject,
    onDeleteProject,
    onRenameProject,
  } = props;

  // Track which tab is in “rename” mode (if any)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");

  const handleDoubleClick = (index: number) => {
    setEditingIndex(index);
    setDraftName(projects[index].name);
  };

  const handleRename = (index: number) => {
    onRenameProject(index, draftName.trim() || projects[index].name);
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
      {projects.map((project, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={i}
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
              <div style={{ marginRight: "8px" }}>{project.name}</div>
            )}
            {/* Small "x" button on each tab */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                const confirmed = window.confirm(
                  `Delete the project "${project.name}"?`
                );
                if (confirmed) onDeleteProject(i);
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

      {/* Mini tab with a "+" to create a new project */}
      <div
        onClick={onAddProject}
        style={{
          display: "inline-flex",
          alignItems: "center",
          marginLeft: "auto",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        title="Add new project"
      >
        +
      </div>
    </div>
  );
}
