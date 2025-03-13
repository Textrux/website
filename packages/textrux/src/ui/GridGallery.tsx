// packages/textrux/src/ui/GridGallery.tsx

import React, { useEffect, useState } from "react";
import Gallery from "../model/Gallery";
import Project from "../model/Project";
import { ProjectTabs } from "./ProjectTabs";
import { GridView } from "./GridView";
import { GridTabs } from "./GridTabs";
import {
  loadProjectFromLocalStorage,
  saveProjectToLocalStorage,
} from "../util/LocalStorageStore";

/** Props to configure the all-in-one GridGallery. */
export interface GridGalleryProps {
  /** Whether to auto-load (and auto-save) each project from localStorage. */
  autoLoadLocalStorage?: boolean;
  /** (Optional) initial count of projects if none are stored. Default=1 */
  initialProjectCount?: number;
  /** (Optional) default base row/col count for new projects. */
  defaultRows?: number;
  defaultCols?: number;
}

/**
 * A self-contained multi-project “Gallery” with tabs at the top
 * for each Project, plus a bottom “GridTabs” placeholder.
 */
export function GridGallery(props: GridGalleryProps) {
  const {
    autoLoadLocalStorage = true,
    initialProjectCount = 1,
    defaultRows = 1000,
    defaultCols = 1000,
  } = props;

  // 1) Create a Gallery in local component state
  const [gallery, setGallery] = useState(() => {
    const g = new Gallery();
    // If we have no stored data, create N blank projects:
    for (let i = 0; i < initialProjectCount; i++) {
      const project = new Project(`Project${i + 1}`);
      project.grid.rows = defaultRows;
      project.grid.cols = defaultCols;
      g.projects.push(project);
    }
    g.activeProjectIndex = 0;
    return g;
  });

  // 2) On mount, optionally load each project from localStorage
  useEffect(() => {
    if (!autoLoadLocalStorage) return;
    gallery.projects.forEach((proj, idx) => {
      loadProjectFromLocalStorage(proj, idx);
    });
    // Force a re-render if any were loaded
    setGallery((prev) => {
      const copy = new Gallery();
      copy.projects = [...prev.projects];
      copy.activeProjectIndex = prev.activeProjectIndex;
      return copy;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3) Whenever the gallery updates, auto-save each project
  useEffect(() => {
    if (!autoLoadLocalStorage) return;
    gallery.projects.forEach((proj, idx) => {
      saveProjectToLocalStorage(proj, idx);
    });
  }, [gallery, autoLoadLocalStorage]);

  // Helper to get currently active project:
  const activeProject = gallery.projects[gallery.activeProjectIndex] || null;

  // ----- Actions for the top ProjectTabs -----
  const selectProject = (index: number) => {
    setGallery((prev) => {
      const g2 = new Gallery();
      g2.projects = [...prev.projects];
      g2.activeProjectIndex = index;
      return g2;
    });
  };

  const addProject = () => {
    setGallery((prev) => {
      const g2 = new Gallery();
      g2.projects = [...prev.projects];
      const newProj = new Project(`Project${g2.projects.length + 1}`);
      newProj.grid.rows = defaultRows;
      newProj.grid.cols = defaultCols;
      g2.projects.push(newProj);
      g2.activeProjectIndex = g2.projects.length - 1;
      return g2;
    });
  };

  const deleteProject = (index: number) => {
    if (gallery.projects.length <= 1) {
      alert("Cannot delete the last project.");
      return;
    }
    setGallery((prev) => {
      const g2 = new Gallery();
      g2.projects = [...prev.projects];
      g2.projects.splice(index, 1);
      g2.activeProjectIndex = Math.min(
        g2.activeProjectIndex,
        g2.projects.length - 1
      );
      return g2;
    });
  };

  const renameProject = (index: number, newName: string) => {
    setGallery((prev) => {
      const g2 = new Gallery();
      g2.projects = [...prev.projects];
      const oldProject = g2.projects[index];
      g2.projects[index] = new Project(newName, oldProject.grid);
      g2.activeProjectIndex = prev.activeProjectIndex;
      return g2;
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
      {/* The top row of project tabs */}
      <ProjectTabs
        projects={gallery.projects}
        activeIndex={gallery.activeProjectIndex}
        onSelect={selectProject}
        onAddProject={addProject}
        onDeleteProject={deleteProject}
        onRenameProject={renameProject}
      />

      {/* The main grid area */}
      <div style={{ flex: 1, position: "relative" }}>
        {activeProject ? (
          <GridView
            grid={activeProject.grid}
            projectIndex={gallery.activeProjectIndex}
            // You can expose these props or just hardcode them
            autoLoadLocalStorage={false}
            baseRowHeight={24}
            baseColWidth={60}
            baseFontSize={14}
          />
        ) : (
          <div style={{ padding: "10px" }}>No project selected.</div>
        )}
      </div>

      {/* The bottom row of grid tabs (dummy UI) */}
      <div style={{ height: "35px" }}>
        <GridTabs />
      </div>
    </div>
  );
}
