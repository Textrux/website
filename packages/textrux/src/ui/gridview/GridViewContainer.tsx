import React, { useRef } from "react";
import type { GridViewProps } from "./GridView.types";
import { useGridController } from "../controller/GridController";
import { FormulaBar } from "../FormulaBar";
import { ColumnHeaders } from "../ColumnHeaders";
import { RowHeaders } from "../RowHeaders";
import { GridCells } from "../GridCells";
import { AppModal } from "../modal/AppModal";

import { useGridViewState } from "./useGridViewState";
import { useGridViewActions } from "./useGridViewActions";
import { useGridViewKeyboard } from "./useGridViewKeyboard";
import { GridConfig } from "../../util/GridConfig";

/**
 * The "GridView" is now in this container component,
 * which composes multiple custom hooks and subcomponents.
 */
export function GridViewContainer({
  grid,
  width = "100%",
  height = "100%",
  className = "",
  style = {},
  baseRowHeight = 24,
  baseColWidth = 60,
  baseFontSize = 14,
  autoLoadLocalStorage = false,
}: GridViewProps) {
  // 1) Our main state
  const {
    zoom,
    setZoom,
    rowHeights,
    setRowHeights,
    colWidths,
    setColWidths,
    activeRow,
    setActiveRow,
    activeCol,
    setActiveCol,
    selectionRange,
    setSelectionRange,
    anchorRef,

    editingCell,
    setEditingCell,
    editingValue,
    setEditingValue,
    focusTarget,
    setFocusTarget,

    version,
    forceRefresh,

    isFormattingDisabled,
    setFormattingDisabled,
    styleMap,

    reparseGrid,
  } = useGridViewState(grid, {
    autoLoadLocalStorage,
    baseRowHeight,
    baseColWidth,
    baseFontSize,
  });

  // 2) The actions we can call
  const {
    measureAndExpand,
    commitEdit,
    clearSelectedCells,
    maybeCommitOtherEditingCell,
  } = useGridViewActions({
    grid,
    rowHeights,
    colWidths,
    zoom,
    baseRowHeight,
    baseColWidth,
    editingCell,
    editingValue,
    isFormattingDisabled,

    setRowHeights,
    setColWidths,
    setEditingCell,
    setEditingValue,
    setFocusTarget,
    setFormattingDisabled,

    forceRefresh,
  });

  // 3) The keyboard logic
  const { onContainerKeyDown } = useGridViewKeyboard({
    grid,

    activeRow,
    activeCol,
    selectionRange,
    anchorRef,

    editingCell,
    editingValue,

    isFormattingDisabled,
    zoom,

    setActiveRow,
    setActiveCol,
    setSelectionRange,
    setEditingCell,
    setEditingValue,
    setFocusTarget,
    setFormattingDisabled,

    measureAndExpand,
    commitEdit,
    clearSelectedCells,
    maybeCommitOtherEditingCell,

    forceRefresh,
  });

  // 4) The pinch-zoom & middle-click drag logic
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown: onGridContainerMouseDown,
    isSelectingViaLongPressRef,
    selectionAnchorRef,
  } = useGridController({
    grid,
    zoom,
    setZoom,
    minZoom: 0.2,
    maxZoom: 10,
    colPx: baseColWidth,
    rowPx: baseRowHeight,
    gridContainerRef,
  });

  // We also have a built-in modal in the old code
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [currentDelimiter, setCurrentDelimiter] = React.useState<"tab" | ",">(
    () => {
      const stored = localStorage.getItem("savedDelimiter");
      if (stored === "tab" || stored === ",") return stored;
      return GridConfig.defaultDelimiter;
    }
  );

  // Some simple “file load/save” logic from your old code
  function loadGridFromFile(file: File) {
    // same as your old code
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content !== "string") return;
      // ...
      // parse CSV/TSV, fill the grid
      // ...
      forceRefresh();
    };
    reader.readAsText(file);
  }

  function saveGridToFile() {
    // same as your old code
  }

  function clearGrid() {
    if (window.confirm("Are you sure you want to clear the entire grid?")) {
      for (let r = 1; r <= grid.rows; r++) {
        for (let c = 1; c <= grid.cols; c++) {
          grid.setCellRaw(r, c, "");
        }
      }
      forceRefresh();
    }
  }

  function loadExample(ex: {
    name: string;
    file: string;
    description: string;
  }) {
    // fetch(...) or do your logic
  }

  // The formula bar logic
  const isEditingActiveCell =
    editingCell &&
    editingCell.row === activeRow &&
    editingCell.col === activeCol;
  const cellRaw = grid.getCellRaw(activeRow, activeCol);
  const formulaText = isEditingActiveCell ? editingValue : cellRaw;

  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFocusTarget("formula");
    if (!isEditingActiveCell) {
      setEditingCell({ row: activeRow, col: activeCol });
    }
    const newVal = e.target.value;
    setEditingValue(newVal);
    measureAndExpand(activeRow, activeCol, newVal);
  };

  const handleFormulaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!editingCell) return;
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit(editingCell.row, editingCell.col, editingValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      commitEdit(editingCell.row, editingCell.col, cellRaw, { escape: true });
    }
  };

  // total grid dimension
  const totalGridWidth = colWidths.reduce((a, b) => a + b, 0);
  const totalGridHeight = rowHeights.reduce((a, b) => a + b, 0);

  const addressText = `R${activeRow}C${activeCol}`;

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height, ...style }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
          loadGridFromFile(file);
        }
      }}
    >
      {/* Formula bar */}
      <FormulaBar
        address={addressText}
        formulaText={formulaText}
        onFormulaChange={handleFormulaChange}
        onFormulaKeyDown={handleFormulaKeyDown}
        onFocus={() => {
          setFocusTarget("formula");
          if (!editingCell) {
            setEditingCell({ row: activeRow, col: activeCol });
          }
        }}
        onGearClick={() => setModalOpen(true)}
      />

      {/* Main area */}
      <div className="absolute left-0 right-0 bottom-0" style={{ top: "3rem" }}>
        {/* top-left corner cell */}
        <div
          className="absolute top-0 left-0 bg-gray-200 border-b border-r border-gray-600 flex items-center justify-center z-10"
          style={{ width: 50, height: 30 }}
        >
          #
        </div>

        <ColumnHeaders
          grid={grid}
          rowHeights={rowHeights}
          colWidths={colWidths}
          fontSize={baseFontSize * zoom}
          version={version}
          gridContainerRef={gridContainerRef}
        />

        <RowHeaders
          grid={grid}
          rowHeights={rowHeights}
          colWidths={colWidths}
          fontSize={baseFontSize * zoom}
          version={version}
          gridContainerRef={gridContainerRef}
        />

        <div
          ref={gridContainerRef}
          className="absolute top-[30px] left-[50px] right-0 bottom-0 overflow-auto bg-white noselect"
          onMouseDown={onGridContainerMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onKeyDown={onContainerKeyDown}
          tabIndex={0}
        >
          <div
            className="relative"
            style={{ width: totalGridWidth, height: totalGridHeight }}
          >
            <GridCells
              grid={grid}
              version={version}
              rowHeights={rowHeights}
              colWidths={colWidths}
              selectionRange={selectionRange}
              activeRow={activeRow}
              activeCol={activeCol}
              editingCell={editingCell}
              fontSize={baseFontSize * zoom}
              onCellMouseDown={(r, c, e) => {
                maybeCommitOtherEditingCell(r, c);

                if (e.button === 0) {
                  if (!e.shiftKey) {
                    setActiveRow(r);
                    setActiveCol(c);
                    setSelectionRange({
                      startRow: r,
                      endRow: r,
                      startCol: c,
                      endCol: c,
                    });
                    anchorRef.current = { row: r, col: c };
                  } else if (anchorRef.current) {
                    const startR = anchorRef.current.row;
                    const startC = anchorRef.current.col;
                    setSelectionRange({
                      startRow: Math.min(startR, r),
                      endRow: Math.max(startR, r),
                      startCol: Math.min(startC, c),
                      endCol: Math.max(startC, c),
                    });
                    setActiveRow(r);
                    setActiveCol(c);
                  }
                  // Focus for keyboard
                  if (!editingCell) {
                    gridContainerRef.current?.focus();
                  }
                }
              }}
              onCellClick={() => {}}
              onCellDoubleClick={(r, c) => {
                const raw = grid.getCellRaw(r, c);
                setEditingValue(raw);
                setEditingCell({ row: r, col: c });
                setFocusTarget("cell");
              }}
              onCommitEdit={commitEdit}
              onKeyboardNav={() => {}}
              measureAndExpand={measureAndExpand}
              sharedEditingValue={editingValue}
              setSharedEditingValue={setEditingValue}
              styleMap={styleMap}
            />
          </div>
        </div>
      </div>

      <AppModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        currentDelimiter={currentDelimiter}
        setCurrentDelimiter={setCurrentDelimiter}
        clearGrid={clearGrid}
        saveGridToFile={saveGridToFile}
        loadGridFromFile={loadGridFromFile}
        loadExample={loadExample}
      />
    </div>
  );
}
