import "./css/project.css";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import GridModel from "../layers/1-substrate/GridModel";
import Block from "../layers/3-foundation/block/Block";
import { parseAndFormatGrid } from "../layers/1-substrate/GridParser";
import { fromCSV, toCSV } from "../util/CSV";
import { fromTSV, toTSV } from "../util/TSV";
import { useGridController } from "./controller/GridController";
import { ColumnHeaders } from "./ColumnHeaders";
import { RowHeaders } from "./RowHeaders";
import { GridCells } from "./GridCells";
import { FormulaBar } from "./FormulaBar";
import { AppModal } from "./modal/AppModal";
import { Minimap } from "./minimap/Minimap";
import { LocalStorageManager } from "../util/LocalStorageManager";
import {
  arrayToGrid,
  embedGridIntoR1C1,
  getDepthFromCsv,
  replaceDeepMarkerInWrapper,
  sheetToCsv,
} from "../util/EmbeddedHelper";
import { Scrubber } from "./Scrubber";
import {
  displayNextElevatedGridHelper,
  enterElevatedGridHelper,
  exitElevatedGridHelper,
} from "../util/ElevatedHelpers";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import {
  findFirstRowInView,
  isCellInBlockCanvas,
  scrollCellIntoView,
  scrollToCell,
} from "../util/GridHelper";
import {
  ReferenceUpdater,
  CellMove,
  RangeMove,
} from "../util/ReferenceUpdater";
import {
  SizingMode,
  GridSizingSettings,
} from "../layers/1-substrate/GridModel";
import { CellFormat } from "../style/CellFormat";
import { AppearanceSettings } from "../types/AppearanceSettings";
import { StyleManager } from "../util/StyleManager";

// Helper function to calculate pixel position from row/column index and sizes
const calculatePixelPosition = (
  index: number,
  sizes: number[],
  fallbackSize: number
): number => {
  let position = 0;
  for (let i = 0; i < index - 1 && i < sizes.length; i++) {
    position += sizes[i] || fallbackSize;
  }
  return position;
};

// Helper function to calculate pixel range (top/bottom or left/right)
const calculatePixelRange = (
  startIndex: number,
  endIndex: number,
  sizes: number[],
  fallbackSize: number
): { start: number; end: number } => {
  const start = calculatePixelPosition(startIndex, sizes, fallbackSize);
  let end = start;
  for (let i = startIndex - 1; i < endIndex && i < sizes.length; i++) {
    end += sizes[i] || fallbackSize;
  }
  return { start, end };
};

// Helper function to create a standard selection range update
const createSelectionUpdate = (
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number
) => ({
  startRow,
  endRow,
  startCol,
  endCol,
});

// Helper function to calculate cumulative position (used in scroll calculations)
const calculateCumulativePosition = (
  targetIndex: number,
  sizes: number[]
): number => {
  let position = 0;
  // Convert from 1-based to 0-based index
  const arrayIndex = Math.max(0, targetIndex - 1);

  for (let i = 0; i < arrayIndex && i < sizes.length; i++) {
    position += sizes[i];
  }
  return position;
};

// Helper function to update position state consistently
const updatePositionState = (
  row: number,
  col: number,
  setActiveRow: (row: number) => void,
  setActiveCol: (col: number) => void,
  setSelectionRange: (range: any) => void
) => {
  setActiveRow(row);
  setActiveCol(col);
  setSelectionRange(createSelectionUpdate(row, row, col, col));
};

// Helper function to safely clear timeout references
const clearTimeoutRef = (
  timeoutRef: React.MutableRefObject<number | undefined>
) => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
  }
};

// Helper function to collect cell data for operations like cut/copy/move
const collectCellData = (
  grid: GridModel,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number
): Array<{ row: number; col: number; text: string }> => {
  const cellData: Array<{ row: number; col: number; text: string }> = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const text = grid.getCellRaw(row, col);
      cellData.push({ row, col, text });
    }
  }
  return cellData;
};

/** The row/col selection range in the spreadsheet. */
export interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface GridViewProps {
  grid: GridModel;
  gridIndex?: number;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  baseRowHeight?: number;
  baseColWidth?: number;
  baseFontSize?: number;
  autoLoadLocalStorage?: boolean;
  onGridChange?: (grid: GridModel) => void;
  onLoadFileToNewGrid?: (file: File) => void;
  onLoadExampleToNewGrid?: (ex: any) => void; // Load example to new tab
  clearAllGrids?: () => void; // Function to reset all grids to defaults
  handleChangeDefaultSizes?: (
    newRowHeight: number,
    newColWidth: number
  ) => void;
}

export function GridView({
  grid,
  width = "100%",
  height = "100%",
  className = "",
  style = {},
  baseRowHeight = 24,
  baseColWidth = 60,
  baseFontSize = 14,
  autoLoadLocalStorage = true,
  onGridChange,
  onLoadFileToNewGrid,
  onLoadExampleToNewGrid,
  clearAllGrids,
  handleChangeDefaultSizes,
}: GridViewProps) {
  //
  // 1) We'll create a local "zoom" state. If autoLoadLocalStorage is true,
  // we'll load it once from LocalStorageManager on mount.
  //
  const [zoom, setZoom] = useState<number>(1.0);

  // Initialize delimiter state here so it's available for the useEffect below
  const [currentDelimiter, setCurrentDelimiter] = useState(
    grid.delimiter || "tab"
  );

  // Sizing settings state
  const [sizingModeState, setSizingModeState] = useState<SizingMode>("grid");
  const [gridSizingSettings, setGridSizingSettings] =
    useState<GridSizingSettings | null>(null);

  // Use the state value for the current sizing mode
  const sizingMode = sizingModeState;

  // This is a helper function to notify of grid changes
  const notifyGridChange = useCallback(() => {
    // console.log("notifyGridChange called");
    // console.log("Current grid.sizingSettings:", grid.sizingSettings);

    if (onGridChange) {
      // console.log("Calling onGridChange with grid");
      onGridChange(grid);
    } else if (autoLoadLocalStorage) {
      // console.log("Calling LocalStorageManager.saveGrid");
      // Fall back to direct localStorage save if no callback is provided
      LocalStorageManager.saveGrid(grid);
      // console.log("LocalStorageManager.saveGrid completed");
    } else {
      // console.log("No action taken in notifyGridChange");
    }
  }, [grid, onGridChange, autoLoadLocalStorage]);

  // Create a custom setSizingMode that also saves to localStorage
  const setSizingMode = useCallback(
    (mode: SizingMode) => {
      console.log(`🎛️ setSizingMode called with mode: ${mode}`);
      console.log(
        `📊 Current state - sizingModeState: ${sizingModeState}, gridSizingSettings:`,
        gridSizingSettings
      );
      console.log(`⚙️ autoLoadLocalStorage: ${autoLoadLocalStorage}`);

      setSizingModeState(mode);

      // Get current settings or create defaults if they don't exist
      let currentSettings = gridSizingSettings;
      if (!currentSettings) {
        console.log("🔧 Creating default sizing settings...");
        currentSettings = LocalStorageManager.getDefaultGridSizing(
          grid.rowCount,
          grid.columnCount,
          baseRowHeight * zoom,
          baseColWidth * zoom
        );
        // Override the default mode with the one the user just selected
        currentSettings.sizingMode = mode;
        setGridSizingSettings(currentSettings);
      }

      const updatedSettings = {
        ...currentSettings,
        sizingMode: mode,
      };

      console.log(
        `💾 Updating grid.sizingSettings with mode: ${mode}`,
        updatedSettings
      );

      // Always update the grid model's sizing settings
      grid.sizingSettings = updatedSettings;
      console.log(`✅ Updated grid.sizingSettings:`, grid.sizingSettings);

      // Always notify of changes - this will either call onGridChange or save to localStorage
      notifyGridChange();
      console.log("📤 Called notifyGridChange()");

      // Update local state to match
      setGridSizingSettings(updatedSettings);
      console.log("🔄 Updated local gridSizingSettings state");
    },
    [
      autoLoadLocalStorage,
      gridSizingSettings,
      grid,
      baseRowHeight,
      baseColWidth,
      zoom,
      notifyGridChange,
      sizingModeState,
    ]
  );

  // Handle zoom change
  const handleZoomChange = useCallback(
    (newZoom: number) => {
      console.log(
        `Changing zoom from ${zoom} to ${newZoom} for grid ${grid.index}`
      );
      setZoom(newZoom);
      grid.zoomLevel = newZoom;
      notifyGridChange();
    },
    [grid, zoom, notifyGridChange]
  );

  // Handle delimiter change
  const handleDelimiterChange = useCallback(
    (delimiter: "tab" | ",") => {
      console.log(
        `Changing delimiter from ${currentDelimiter} to ${delimiter} for grid ${grid.index}`
      );
      setCurrentDelimiter(delimiter);
      grid.delimiter = delimiter;
      notifyGridChange();
    },
    [grid, currentDelimiter, notifyGridChange]
  );

  // Add state update tracking in the GridView component
  // Sync grid values with UI state when grid prop changes
  useEffect(() => {
    console.log(
      "Grid prop changed in GridView",
      "grid.index:",
      grid.index,
      "grid.zoomLevel:",
      grid.zoomLevel,
      "grid.delimiter:",
      grid.delimiter
    );

    // Check what our current state is vs the new grid
    console.log("Current state", "zoom:", zoom, "delimiter:", currentDelimiter);

    // Only sync on initial load or when switching tabs, not when user zooms
    // This prevents overriding the zoom when user scrolls with Ctrl+wheel
    if (zoom !== grid.zoomLevel && zoom === 1.0) {
      console.log(`Updating zoom from ${zoom} to ${grid.zoomLevel}`);
      setZoom(grid.zoomLevel || 1.0); // Default to 1.0 if undefined
    }

    if (currentDelimiter !== grid.delimiter) {
      console.log(
        `Updating delimiter from ${currentDelimiter} to ${grid.delimiter}`
      );
      setCurrentDelimiter(grid.delimiter || "tab"); // Default to tab if undefined
    }
  }, [grid, zoom, currentDelimiter]);

  // Save scroll position
  const saveScrollPosition = useCallback(
    (topLeftCell: { row: number; col: number }) => {
      grid.topLeftCell = topLeftCell;
      notifyGridChange();
    },
    [grid, notifyGridChange]
  );

  // Derive the actual font size
  const fontSize = baseFontSize * zoom;

  // Initialize rowHeights and colWidths from saved settings or defaults
  const [rowHeights, setRowHeights] = useState<number[]>(() => {
    // Try to load from grid sizing settings first
    if (
      grid.sizingSettings &&
      grid.sizingSettings.sizingMode === "grid" &&
      grid.sizingSettings.rowHeights
    ) {
      return grid.sizingSettings.rowHeights;
    }
    // Fall back to base values scaled by current zoom
    return Array(grid.rowCount).fill(baseRowHeight * zoom);
  });

  const [colWidths, setColWidths] = useState<number[]>(() => {
    // Try to load from grid sizing settings first
    if (
      grid.sizingSettings &&
      grid.sizingSettings.sizingMode === "grid" &&
      grid.sizingSettings.colWidths
    ) {
      return grid.sizingSettings.colWidths;
    }
    // Fall back to base values scaled by current zoom
    return Array(grid.columnCount).fill(baseColWidth * zoom);
  });

  // We keep track of active cell & selection in local state,
  // but also store it in the grid model.
  const [activeRow, setActiveRow] = useState(grid.selectedCell.row);
  const [activeCol, setActiveCol] = useState(grid.selectedCell.col);

  const [selectionRange, setSelectionRange] = useState<SelectionRange>({
    startRow: grid.selectedCell.row,
    endRow: grid.selectedCell.row,
    startCol: grid.selectedCell.col,
    endCol: grid.selectedCell.col,
  });

  const isR1C1Locked = useMemo(() => {
    return (
      activeRow === 1 &&
      activeCol === 1 &&
      grid.getCellRaw(1, 1).trim().startsWith("^")
    );
  }, [activeRow, activeCol, grid]);

  /** For shift+arrow expansions */
  const anchorRef = useRef<{ row: number; col: number } | null>(null);

  /** Full screen editor ref */
  const editorRef = useRef(null);

  /** Container ref for scroll & zoom actions */
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  /** Re-render version */
  const [version, setVersion] = useState(0);
  const forceRefresh = useCallback(() => setVersion((v) => v + 1), []);

  /** Style map from parseAndFormatGrid */
  const [styleMap, setStyleMap] = useState<Record<string, string[]>>({});
  const [isFormattingDisabled, setFormattingDisabled] = useState(false);

  /** Editing cell + typed text */
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [focusTarget, setFocusTarget] = useState<"cell" | "formula" | null>(
    null
  );

  // Update the setCellSelection function
  const setCellSelection = useCallback(
    (range: SelectionRange) => {
      setSelectionRange(range);
      setActiveRow(range.startRow);
      setActiveCol(range.startCol);

      // Update grid's selected cell
      grid.selectedCell = {
        row: range.startRow,
        col: range.startCol,
      };

      // Notify of changes instead of saving directly
      notifyGridChange();
    },
    [grid, notifyGridChange]
  );

  /** Modal for settings, CSV vs TSV, etc. */
  const [isModalOpen, setModalOpen] = useState(false);

  /** Minimap visibility */
  const [showMinimap, setShowMinimap] = useState(true);
  const [minimapPosition, setMinimapPosition] = useState({
    bottom: 16,
    right: 16,
  });

  // Calculate minimap position to avoid scrollbars
  const calculateMinimapPosition = useCallback(() => {
    const container = gridContainerRef.current;
    if (!container) {
      return { bottom: 16, right: 16 };
    }

    const containerRect = container.getBoundingClientRect();
    const hasVerticalScrollbar =
      container.scrollHeight > container.clientHeight;
    const hasHorizontalScrollbar =
      container.scrollWidth > container.clientWidth;

    // Account for scrollbar width (typically 15-17px, we'll use 20px for safety)
    const scrollbarWidth = 20;

    let bottom = 16; // Base margin from bottom
    let right = 16; // Base margin from right

    // If there's a horizontal scrollbar, move up
    if (hasHorizontalScrollbar) {
      bottom += scrollbarWidth;
    }

    // If there's a vertical scrollbar, move left
    if (hasVerticalScrollbar) {
      right += scrollbarWidth;
    }

    // Also account for the scrubber at the bottom (35px height)
    bottom += 35;

    return { bottom, right };
  }, []);

  // Load minimap setting from localStorage
  useEffect(() => {
    if (autoLoadLocalStorage) {
      const saved = localStorage.getItem("textrux-show-minimap");
      if (saved !== null) {
        setShowMinimap(JSON.parse(saved));
      }
    }
  }, [autoLoadLocalStorage]);

  // Save minimap setting to localStorage
  useEffect(() => {
    if (autoLoadLocalStorage) {
      localStorage.setItem("textrux-show-minimap", JSON.stringify(showMinimap));
    }
  }, [showMinimap, autoLoadLocalStorage]);

  // Update minimap position when container size changes
  useEffect(() => {
    const updateMinimapPosition = () => {
      setMinimapPosition(calculateMinimapPosition());
    };

    const container = gridContainerRef.current;
    if (container) {
      // Update position initially
      updateMinimapPosition();

      // Create a ResizeObserver to watch for container size changes
      const resizeObserver = new ResizeObserver(updateMinimapPosition);
      resizeObserver.observe(container);

      // Also listen for scroll events that might affect scrollbar visibility
      container.addEventListener("scroll", updateMinimapPosition);

      return () => {
        resizeObserver.disconnect();
        container.removeEventListener("scroll", updateMinimapPosition);
      };
    }
  }, [calculateMinimapPosition]);

  // Whenever delimiter changes, store it
  useEffect(() => {
    LocalStorageManager.saveGrid(grid, { delimiter: currentDelimiter });
  }, [grid, currentDelimiter]);

  // Listen for scroll events to store topLeftCell
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container) return;

      // Get the current scroll position
      const scrollTop = container.scrollTop;
      const scrollLeft = container.scrollLeft;

      // Find the row and column indices for the current scroll position
      // Note that these functions return 1-based indices (not 0-based)
      const row = findFirstRowInView(scrollTop, rowHeights);
      const col = findFirstRowInView(scrollLeft, colWidths);

      // If we have a valid row and column, save them to the grid
      if (row > 0 && col > 0) {
        // Create new topLeftCell object
        const topLeftCell = { row, col };

        // Log what we're saving
        // console.log(
        //   "Saving scroll position:",
        //   topLeftCell,
        //   "for grid",
        //   grid.index
        // );

        // Save to the grid model and localStorage
        grid.topLeftCell = topLeftCell;
        notifyGridChange();
      }
    }

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [grid, rowHeights, colWidths]);

  // Track repeated Ctrl+A presses
  const ctrlAStageRef = useRef<number>(0);
  // We'll also track the last cell (row,col) on which Ctrl+A was pressed
  const lastCtrlACellRef = useRef<{ row: number; col: number } | null>(null);

  const handleCtrlA = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();

      // If the user switched to a different cell since last time, reset our stage
      if (
        lastCtrlACellRef.current === null ||
        lastCtrlACellRef.current.row !== activeRow ||
        lastCtrlACellRef.current.col !== activeCol
      ) {
        ctrlAStageRef.current = 0;
        lastCtrlACellRef.current = null;
      }

      // Remember this cell as the last one used for Ctrl+A
      lastCtrlACellRef.current = { row: activeRow, col: activeCol };

      // Get the blocks and identify what structures we're in
      const blocks = blockListRef.current; // All blocks
      const blockClusters = grid.blockClusters || []; // All block clusters

      // Find which block we're in (if any)
      const block = blocks.find((b) =>
        isCellInBlockCanvas(b, activeRow, activeCol)
      );

      // Find cell cluster if we're in a block
      let cellCluster = null;
      if (block) {
        // Find which cell cluster we're in (if any)
        for (const cluster of block.cellClusters) {
          const { topRow, bottomRow, leftCol, rightCol } = cluster;
          if (
            activeRow >= topRow &&
            activeRow <= bottomRow &&
            activeCol >= leftCol &&
            activeCol <= rightCol
          ) {
            cellCluster = cluster;
            break;
          }
        }
      }

      // Find block cluster if we're in a block
      const blockCluster = block
        ? blockClusters.find((bc) =>
            bc.blockSubclusters.some((subcluster) =>
              subcluster.blocks.includes(block)
            )
          )
        : null;

      // Check if we're on a filled cell
      const isFilledCell = grid.getCellRaw(activeRow, activeCol).trim() !== "";

      // Select different area based on context

      // If we're in a cell cluster (regardless if the cell is filled or empty)
      if (cellCluster) {
        // First press - select cell cluster
        const { topRow, bottomRow, leftCol, rightCol } = cellCluster;
        setSelectionRange(
          createSelectionUpdate(topRow, bottomRow, leftCol, rightCol)
        );
        setActiveRow(topRow);
        setActiveCol(leftCol);
        ctrlAStageRef.current = 1;
        return;
      }

      // If we're in a block (either initially or after selecting cell cluster)
      if (block && ctrlAStageRef.current <= 1) {
        // Select block canvas
        setSelectionRange(
          createSelectionUpdate(
            block.topRow,
            block.bottomRow,
            block.leftCol,
            block.rightCol
          )
        );
        setActiveRow(block.topRow);
        setActiveCol(block.leftCol);
        ctrlAStageRef.current = 2;
        return;
      }

      // If we're in a block cluster with multiple blocks across subclusters
      if (
        blockCluster &&
        blockCluster.blockSubclusters.reduce(
          (total, subcluster) => total + subcluster.blocks.length,
          0
        ) > 1 &&
        ctrlAStageRef.current <= 2
      ) {
        // Select block cluster canvas
        const { top, left, bottom, right } = blockCluster.clusterCanvas;
        setSelectionRange(createSelectionUpdate(top, bottom, left, right));
        setActiveRow(top);
        setActiveCol(left);
        ctrlAStageRef.current = 3;
        return;
      }

      // Final stage - select entire used range
      const filledCells = grid.getFilledCells();
      if (filledCells.length > 0) {
        let minRow = Infinity,
          maxRow = -Infinity;
        let minCol = Infinity,
          maxCol = -Infinity;

        filledCells.forEach(({ row, col }) => {
          minRow = 1;
          maxRow = Math.max(maxRow, row);
          minCol = 1;
          maxCol = Math.max(maxCol, col);
        });

        setSelectionRange(
          createSelectionUpdate(minRow, maxRow, minCol, maxCol)
        );
        setActiveRow(minRow);
        setActiveCol(minCol);
        ctrlAStageRef.current = 4;
        return;
      }

      // If there are no filled cells, select cell R1C1
      setSelectionRange(createSelectionUpdate(1, 1, 1, 1));
      setActiveRow(1);
      setActiveCol(1);
    },
    [activeRow, activeCol, grid, setSelectionRange]
  );

  // state to track full-screen editor:
  const [fullscreenEditing, setFullscreenEditing] = useState<{
    row: number;
    col: number;
    originalValue: string;
    tempValue: string;
  } | null>(null);

  // function to discard changes
  function discardFullscreenChanges() {
    setFullscreenEditing(null);
    gridContainerRef.current?.focus();
  }

  // function to commit changes
  function commitFullscreenChanges() {
    if (!fullscreenEditing) return;

    const { row, col, tempValue } = fullscreenEditing;
    grid.setCellRaw(row, col, tempValue);
    measureAndExpand(row, col, tempValue);
    forceRefresh();

    setFullscreenEditing(null);
    gridContainerRef.current?.focus();
  }

  /** For block movement logic */
  const blockListRef = useRef<Block[]>([]);

  /** Reference updater for maintaining formula references */
  const referenceUpdaterRef = useRef<ReferenceUpdater | null>(null);

  // Initialize reference updater
  useEffect(() => {
    referenceUpdaterRef.current = new ReferenceUpdater(grid);
  }, [grid]);

  /** For cut/copy/paste logic */
  const [clipboardData, setClipboardData] = useState<string[][] | null>(null);
  const [copiedRange, setCopiedRange] = useState<SelectionRange | null>(null);
  const [isCutMode, setIsCutMode] = useState(false);
  const [cutRange, setCutRange] = useState<SelectionRange | null>(null);
  interface CutCell {
    row: number;
    col: number;
    text: string;
  }
  const [cutCells, setCutCells] = useState<CutCell[] | null>(null);

  /** For block dragging logic */
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [dragCurrentPosition, setDragCurrentPosition] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [dragPreviousPosition, setDragPreviousPosition] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [dragOriginalBlockData, setDragOriginalBlockData] = useState<Array<{
    row: number;
    col: number;
    text: string;
  }> | null>(null);
  const [dragOriginalGridState, setDragOriginalGridState] = useState<Array<{
    row: number;
    col: number;
    text: string;
  }> | null>(null);
  const [isFirstBlockMove, setIsFirstBlockMove] = useState(false);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const longPressTimeoutRef = useRef<number | undefined>(undefined);
  const isDragEligibleRef = useRef(false);

  /** For reference handle logic */
  const [showReferenceHandle, setShowReferenceHandle] = useState(false);
  const [referenceHandlePosition, setReferenceHandlePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isHoveringHandle, setIsHoveringHandle] = useState(false);
  const [isDraggingReference, setIsDraggingReference] = useState(false);
  const [referenceSourceRange, setReferenceSourceRange] =
    useState<SelectionRange | null>(null);
  const [referenceDragStartPos, setReferenceDragStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [referenceDragCurrentPos, setReferenceDragCurrentPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [referenceTargetPosition, setReferenceTargetPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const hideHandleTimeoutRef = useRef<number | undefined>(undefined);
  const showHandleTimeoutRef = useRef<number | undefined>(undefined);

  // Track grid changes to prevent double-scaling
  const prevGridRef = useRef(grid);
  const prevZoomRef = useRef(zoom);

  // Function to update grid dimensions based on cell formats (for "cell" sizing mode)
  const updateGridDimensionsFromCellFormats = useCallback(() => {
    console.log(
      `🔍 updateGridDimensionsFromCellFormats called, sizingMode: ${sizingMode}`
    );

    if (sizingMode !== "cell" || !gridSizingSettings) {
      console.log(
        `❌ Early return: sizingMode=${sizingMode}, hasSettings=${!!gridSizingSettings}`
      );
      return;
    }

    console.log(
      `📊 Cell formats available:`,
      Object.keys(gridSizingSettings.cellFormats).length
    );

    const newRowHeights = [...rowHeights];
    const newColWidths = [...colWidths];

    // Get all filled cells to know which cells to consider
    const filledCells = grid.getFilledCells();
    console.log(`📋 Processing ${filledCells.length} filled cells`);

    // For each row, find the maximum height required by any cell in that row
    for (let row = 1; row <= grid.rowCount; row++) {
      let maxHeight = baseRowHeight * zoom; // Default height

      // Check all filled cells in this row
      for (const { row: cellRow, col } of filledCells) {
        if (cellRow === row) {
          const cellKey = `R${row}C${col}`;
          const cellFormat = gridSizingSettings.cellFormats[cellKey];
          if (cellFormat && cellFormat.height) {
            maxHeight = Math.max(maxHeight, cellFormat.height);
            console.log(
              `📏 Row ${row}: found height ${cellFormat.height} in cell ${cellKey}, maxHeight now ${maxHeight}`
            );
          }
        }
      }

      // Only update if the height changed significantly
      if (Math.abs(newRowHeights[row - 1] - maxHeight) > 1) {
        console.log(
          `📐 Row ${row}: updating height from ${
            newRowHeights[row - 1]
          } to ${maxHeight}`
        );
        newRowHeights[row - 1] = maxHeight;
      }
    }

    // For each column, find the maximum width required by any cell in that column
    for (let col = 1; col <= grid.columnCount; col++) {
      let maxWidth = baseColWidth * zoom; // Default width

      // Check all filled cells in this column
      for (const { row, col: cellCol } of filledCells) {
        if (cellCol === col) {
          const cellKey = `R${row}C${col}`;
          const cellFormat = gridSizingSettings.cellFormats[cellKey];
          if (cellFormat && cellFormat.width) {
            maxWidth = Math.max(maxWidth, cellFormat.width);
            console.log(
              `📏 Column ${col}: found width ${cellFormat.width} in cell ${cellKey}, maxWidth now ${maxWidth}`
            );
          }
        }
      }

      // Only update if the width changed significantly
      if (Math.abs(newColWidths[col - 1] - maxWidth) > 1) {
        console.log(
          `📐 Column ${col}: updating width from ${
            newColWidths[col - 1]
          } to ${maxWidth}`
        );
        newColWidths[col - 1] = maxWidth;
      }
    }

    // Update state if changes were made
    let hasChanges = false;

    if (!arraysEqual(rowHeights, newRowHeights)) {
      console.log(`🔄 Updating row heights`);
      setRowHeights(newRowHeights);
      hasChanges = true;
    }

    if (!arraysEqual(colWidths, newColWidths)) {
      console.log(`🔄 Updating column widths`);
      setColWidths(newColWidths);
      hasChanges = true;
    }

    // Update the sizing settings to reflect the new grid dimensions
    if (hasChanges) {
      console.log(`💾 Saving updated grid dimensions`);
      const updatedSettings: GridSizingSettings = {
        ...gridSizingSettings,
        rowHeights: newRowHeights,
        colWidths: newColWidths,
      };

      grid.sizingSettings = updatedSettings;
      setGridSizingSettings(updatedSettings);
      notifyGridChange();
    } else {
      console.log(`✅ No dimension changes needed`);
    }
  }, [
    sizingMode,
    gridSizingSettings,
    rowHeights,
    colWidths,
    grid,
    baseRowHeight,
    baseColWidth,
    zoom,
    notifyGridChange,
  ]);

  // Helper function to compare arrays
  const arraysEqual = (a: number[], b: number[]) => {
    return (
      a.length === b.length && a.every((val, i) => Math.abs(val - b[i]) < 1)
    );
  };

  // Handle zoom changes intelligently
  useEffect(() => {
    const gridChanged = prevGridRef.current !== grid;
    const zoomChanged = Math.abs(prevZoomRef.current - zoom) > 0.001;

    if (zoomChanged && !gridChanged) {
      // Zoom changed on same grid - scale dimensions
      const zoomRatio = zoom / prevZoomRef.current;

      setRowHeights((prev) => prev.map((height) => height * zoomRatio));
      setColWidths((prev) => prev.map((width) => width * zoomRatio));
    }

    // Update refs
    prevGridRef.current = grid;
    prevZoomRef.current = zoom;
  }, [grid, zoom]);

  // Because the parent might not have loaded from local storage:
  // optionally do it here once on mount
  useEffect(() => {
    if (autoLoadLocalStorage) {
      console.log(
        "Initial load in GridView for grid",
        grid.index,
        "zoom:",
        grid.zoomLevel,
        "delimiter:",
        grid.delimiter
      );

      // We no longer need to load from localStorage here
      // The parent component (GridGalleryView) already loaded the grid

      // Just set up the UI state based on the grid model
      setZoom(grid.zoomLevel || 1.0);
      setCurrentDelimiter(grid.delimiter || "tab");

      console.log(
        "After setting state",
        "zoom:",
        grid.zoomLevel,
        "delimiter:",
        grid.delimiter
      );

      if (grid.selectedCell) {
        setCellSelection({
          startRow: grid.selectedCell.row,
          startCol: grid.selectedCell.col,
          endRow: grid.selectedCell.row,
          endCol: grid.selectedCell.col,
        });
      }

      // Position the viewport if a saved position exists
      if (grid.topLeftCell) {
        console.log("Restoring scroll position to:", grid.topLeftCell);

        // We need to wait until rowHeights and colWidths are properly initialized
        // Let's use a more reliable approach to calculate the scroll position
        const scrollTop = calculateScrollPosition(
          grid.topLeftCell.row,
          rowHeights
        );
        const scrollLeft = calculateScrollPosition(
          grid.topLeftCell.col,
          colWidths
        );

        console.log("Calculated scroll position:", { scrollTop, scrollLeft });

        if (gridContainerRef.current) {
          gridContainerRef.current.scrollTop = scrollTop;
          gridContainerRef.current.scrollLeft = scrollLeft;
        }
      }

      // Notify of potential changes instead of saving directly
      notifyGridChange();
    }
  }, [
    autoLoadLocalStorage,
    grid,
    baseRowHeight,
    baseColWidth,
    zoom,
    notifyGridChange,
    rowHeights,
    colWidths,
  ]);

  // Re-init rowHeights/colWidths if row/col count changes
  useEffect(() => {
    // For row heights - preserve existing sizes when possible
    setRowHeights((prev) => {
      const newRowCount = grid.rowCount;
      const currentRowCount = prev.length;

      if (newRowCount > currentRowCount) {
        // Grid expanded, add new rows with base height scaled by zoom
        const newRows = Array(newRowCount - currentRowCount).fill(
          baseRowHeight * zoom
        );
        return [...prev, ...newRows];
      } else if (newRowCount < currentRowCount) {
        // Grid shrunk, remove excess rows
        return prev.slice(0, newRowCount);
      }
      // Same size, no change needed
      return prev;
    });

    // For column widths - preserve existing sizes when possible
    setColWidths((prev) => {
      const newColCount = grid.columnCount;
      const currentColCount = prev.length;

      if (newColCount > currentColCount) {
        // Grid expanded, add new columns with base width scaled by zoom
        const newCols = Array(newColCount - currentColCount).fill(
          baseColWidth * zoom
        );
        return [...prev, ...newCols];
      } else if (newColCount < currentColCount) {
        // Grid shrunk, remove excess columns
        return prev.slice(0, newColCount);
      }
      // Same size, no change needed
      return prev;
    });
  }, [grid.rowCount, grid.columnCount, baseRowHeight, baseColWidth, zoom]);

  // Re-parse => styleMap => blockList => store to localStorage (or manager)

  const reparse = useCallback(() => {
    if (!isFormattingDisabled) {
      const { styleMap: sm, formatMap: fm, blockList } = parseAndFormatGrid(grid);
      setStyleMap(sm);
      blockListRef.current = blockList;
      
      // 🔍 DEBUG: Complete GridModel object for exploration
      console.log("🏗️ Complete GridModel Hierarchy:", grid);
      
      // 🔍 DEBUG: Detailed formatting analysis for each filled cell in each cluster
      console.group("🎨 Detailed Cell Formatting Analysis");
      console.log("📊 Blocks found:", blockList.length);
      
      blockList.forEach((block, blockIndex) => {
        if (block.cellClusters && block.cellClusters.length > 0) {
          console.group(`📦 Block ${blockIndex + 1} (${block.cellClusters.length} clusters)`);
          
          block.cellClusters.forEach((cluster, clusterIndex) => {
            const detectionResult = cluster.detectConstructType(grid);
            if (detectionResult && cluster.constructs.length > 0) {
              const construct = cluster.constructs[0];
              console.group(`🎯 Cluster ${clusterIndex + 1}: ${detectionResult.constructType} (Key: ${detectionResult.key})`);
              console.log(`   Bounds: R${cluster.topRow + 1}C${cluster.leftCol + 1}:R${cluster.bottomRow + 1}C${cluster.rightCol + 1}`);
              
              // Analyze each filled cell in this cluster
              cluster.filledPoints.forEach(point => {
                const row = point.row;
                const col = point.col;
                const content = grid.getCellRaw(row, col);
                const actualFormat = fm[`R${row}C${col}`] || null;
                
                // Determine what element this should be
                let expectedElementType = "unknown";
                let expectedFormatting = "none";
                
                if (construct.type === "tree") {
                  const treeConstruct = construct as any;
                  const element = treeConstruct.findElementAt(row, col);
                  if (element) {
                    if (element.isAnchor()) {
                      expectedElementType = "tree-anchor";
                      expectedFormatting = "bold, larger font, thick accent border";
                    } else if (element.isParent()) {
                      expectedElementType = "tree-parent";
                      expectedFormatting = "right AND bottom borders, centered";
                    } else if (element.isChildHeader()) {
                      expectedElementType = "tree-childHeader";
                      expectedFormatting = "centered";
                    } else if (element.isChild()) {
                      expectedElementType = "tree-child";
                      expectedFormatting = "centered";
                    } else {
                      expectedElementType = "tree-other";
                      expectedFormatting = "centered";
                    }
                  }
                  
                  // Check for nested constructs
                  if (treeConstruct.childConstructs) {
                    for (const childConstruct of treeConstruct.childConstructs) {
                      if (row >= childConstruct.bounds.topRow && row <= childConstruct.bounds.bottomRow &&
                          col >= childConstruct.bounds.leftCol && col <= childConstruct.bounds.rightCol) {
                        if (childConstruct.type === "matrix") {
                          // Check if this is primary header, secondary header, or body
                          if ((row === childConstruct.bounds.topRow && col > childConstruct.bounds.leftCol) ||
                              (col === childConstruct.bounds.leftCol && row > childConstruct.bounds.topRow)) {
                            expectedElementType = "matrix-header";
                            expectedFormatting = "thick border, centered, bold";
                          } else {
                            expectedElementType = "matrix-body";
                            expectedFormatting = "centered";
                          }
                        } else if (childConstruct.type === "table") {
                          expectedElementType = "table-cell";
                          expectedFormatting = "centered, possible header styling";
                        } else if (childConstruct.type === "key-value") {
                          expectedElementType = "key-value";
                          expectedFormatting = "keys: right border, italics, light green bg; values: centered";
                        }
                        break;
                      }
                    }
                  }
                } else if (construct.type === "matrix") {
                  expectedElementType = "matrix-cell";
                  expectedFormatting = "matrix header or body styling";
                } else if (construct.type === "table") {
                  expectedElementType = "table-cell";
                  expectedFormatting = "table header or body styling";
                } else if (construct.type === "key-value") {
                  expectedElementType = "key-value-cell";
                  expectedFormatting = "key or value styling";
                }
                
                console.log(`     📍 (${row + 1},${col + 1}) "${content}": Expected=${expectedElementType} (${expectedFormatting}), Actual=${actualFormat ? 'styled' : 'no style'}`);
                if (actualFormat) {
                  const formatDetails = [];
                  if (actualFormat.fontWeight === 'bold') formatDetails.push('bold');
                  if (actualFormat.fontStyle === 'italic') formatDetails.push('italic');
                  if (actualFormat.textAlign === 'center') formatDetails.push('centered');
                  if (actualFormat.borderBottom && actualFormat.borderBottom !== 'none') formatDetails.push('bottom-border');
                  if (actualFormat.borderRight && actualFormat.borderRight !== 'none') formatDetails.push('right-border');
                  if (actualFormat.backgroundColor && actualFormat.backgroundColor !== '#ffffff') formatDetails.push(`bg:${actualFormat.backgroundColor}`);
                  console.log(`       Applied: ${formatDetails.join(', ') || 'basic styling'}`);
                }
              });
              
              console.groupEnd();
            }
          });
          
          console.groupEnd();
        }
      });
      
      console.groupEnd();
    } else {
      setStyleMap({});
      blockListRef.current = [];
    }
    // After re-parse, we can also auto-save to manager so we keep updated
    if (autoLoadLocalStorage) {
      LocalStorageManager.saveGrid(grid); // minimal call if needed
    }
  }, [grid, isFormattingDisabled, autoLoadLocalStorage]);

  // Run parse whenever version changes
  useEffect(() => {
    reparse();
    
    // 🔍 Update global debug interface with current grid context
    if (typeof window !== 'undefined' && window.textruxDebug) {
      window.textruxDebug.parseGrid = () => {
        console.log("🔄 Re-parsing grid...");
        reparse();
      };
      
      window.textruxDebug.inspectCell = (row: number, col: number) => {
        const content = grid.getCellRaw(row, col);
        console.group(`🔍 Cell R${row}C${col}`);
        console.log("Content:", content ? `"${content}"` : "(empty)");
        
        // Find which block/cluster contains this cell
        const blocks = blockListRef.current;
        for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
          const block = blocks[blockIndex];
          if (block.cellClusters) {
            for (let clusterIndex = 0; clusterIndex < block.cellClusters.length; clusterIndex++) {
              const cluster = block.cellClusters[clusterIndex];
              const isInCluster = cluster.filledPoints.some(p => p.row === row && p.col === col);
              if (isInCluster) {
                const detection = cluster.detectConstructType(grid);
                console.log(`📦 In Block ${blockIndex + 1}, Cluster ${clusterIndex + 1}`);
                console.log(`🎯 Construct: ${detection?.constructType || 'unknown'} (Key: ${detection?.key || 'N/A'})`);
                break;
              }
            }
          }
        }
        console.groupEnd();
      };
      
      window.textruxDebug.showAllConstructs = () => {
        console.group("📋 All Detected Constructs");
        const blocks = blockListRef.current;
        let totalConstructs = 0;
        
        blocks.forEach((block, blockIndex) => {
          if (block.cellClusters && block.cellClusters.length > 0) {
            block.cellClusters.forEach((cluster, clusterIndex) => {
              const detection = cluster.detectConstructType(grid);
              if (detection) {
                totalConstructs++;
                console.log(`${totalConstructs}. ${detection.constructType} (Key: ${detection.key}) at R${cluster.topRow + 1}C${cluster.leftCol + 1}:R${cluster.bottomRow + 1}C${cluster.rightCol + 1}`);
              }
            });
          }
        });
        
        if (totalConstructs === 0) {
          console.log("No constructs found. Try adding some data to the grid!");
        }
        console.groupEnd();
      };
      
      window.textruxDebug.getGridData = () => {
        const csv = sheetToCsv(grid);
        console.group("📊 Grid Data (CSV)");
        console.log(csv);
        console.groupEnd();
        return csv;
      };

      window.textruxDebug.inspectGrid = () => {
        console.group("🏗️ Complete GridModel Object");
        console.log("📋 Full GridModel hierarchy with all layers:", grid);
        console.log("📐 Dimensions:", `${grid.rowCount} rows × ${grid.columnCount} columns`);
        console.log("🔢 Total cells:", grid.rowCount * grid.columnCount);
        console.log("📝 Filled cells:", grid.getFilledCells().length);
        if (grid.blockClusters) {
          console.log("🏢 Block clusters:", grid.blockClusters.length);
        }
        console.groupEnd();
        return grid;
      };

      (window.textruxDebug as any).inspectElements = (row?: number, col?: number) => {
        console.group("🔬 Element-Level Inspection");
        const blocks = blockListRef.current;
        
        blocks.forEach((block, blockIndex) => {
          if (block.cellClusters && block.cellClusters.length > 0) {
            block.cellClusters.forEach((cluster, clusterIndex) => {
              const construct = cluster.createConstruct(grid);
              if (construct) {
                // Filter by specific cell if provided
                if (row !== undefined && col !== undefined) {
                  const isInCluster = cluster.filledPoints.some(p => p.row === row && p.col === col);
                  if (!isInCluster) return;
                }
                
                console.group(`🎯 ${construct.type.toUpperCase()} at R${cluster.topRow + 1}C${cluster.leftCol + 1}:R${cluster.bottomRow + 1}C${cluster.rightCol + 1}`);
                
                if (construct.type === 'table') {
                  const table = construct as any; // Type assertion for table properties
                  console.log(`📊 Table Elements:`);
                  console.log(`  • Total cells: ${table.cells?.length || 0}`);
                  console.log(`  • Header cells: ${table.headerCells?.length || 0}`);
                  console.log(`  • Body cells: ${table.bodyCells?.length || 0}`);
                  if (table.headerCells?.length > 0) {
                    console.log(`  • Headers:`, table.headerCells.map((h: any) => `(${h.position.row},${h.position.col}): "${h.content}"`));
                  }
                  console.log(`  • Entities (rows): ${table.entities?.length || 0}`);
                  console.log(`  • Attributes (columns): ${table.attributes?.length || 0}`);
                }
                
                else if (construct.type === 'tree') {
                  const tree = construct as any; // Type assertion for tree properties
                  console.log(`🌳 Tree Elements:`);
                  console.log(`  • Total elements: ${tree.elements?.length || 0}`);
                  console.log(`  • Anchor: ${tree.anchorElement ? `(${tree.anchorElement.position.row},${tree.anchorElement.position.col}): "${tree.anchorElement.content}"` : 'none'}`);
                  console.log(`  • Parents: ${tree.parentElements?.length || 0}`);
                  console.log(`  • Children: ${tree.childElements?.length || 0}`);
                  console.log(`  • Max depth: ${tree.getMaxDepth ? tree.getMaxDepth() : 0}`);
                  
                  if (tree.elements?.length > 0) {
                    console.log(`  • Element details:`);
                    tree.elements.forEach((el: any) => {
                      const roles = [];
                      if (el.isAnchor?.()) roles.push('anchor');
                      if (el.isParent?.()) roles.push('parent');
                      if (el.isChild?.()) roles.push('child');
                      if (el.isChildHeader?.()) roles.push('child-header');
                      if (el.isPeer?.()) roles.push('peer');
                      console.log(`    (${el.position.row},${el.position.col}): "${el.content}" [${roles.join(', ')}, level ${el.level}]`);
                    });
                  }
                }
                
                else if (construct.type === 'matrix') {
                  const matrix = construct as any; // Type assertion for matrix properties
                  console.log(`🔢 Matrix Elements:`);
                  console.log(`  • Total cells: ${matrix.cells?.length || 0}`);
                  console.log(`  • Primary headers: ${matrix.primaryHeaders?.length || 0}`);
                  console.log(`  • Secondary headers: ${matrix.secondaryHeaders?.length || 0}`);
                  console.log(`  • Body cells: ${matrix.bodyCells?.length || 0}`);
                }
                
                else if (construct.type === 'key-value') {
                  const keyValue = construct as any; // Type assertion for key-value properties
                  console.log(`🗝️ Key-Value Elements:`);
                  console.log(`  • Total cells: ${keyValue.cells?.length || 0}`);
                  console.log(`  • Key cells: ${keyValue.keyCells?.length || 0}`);
                  console.log(`  • Value cells: ${keyValue.valueCells?.length || 0}`);
                  console.log(`  • Key-value pairs: ${keyValue.keyValuePairs?.length || 0}`);
                  console.log(`  • Main header: "${keyValue.getMainHeaderText ? keyValue.getMainHeaderText() : 'N/A'}"`);
                }
                
                else if (construct.type === 'list') {
                  const list = construct as any; // Type assertion for list properties
                  console.log(`📜 List Elements:`);
                  console.log(`  • Orientation: ${list.orientation || 'N/A'}`);
                  console.log(`  • Header: "${list.getHeaderContent ? list.getHeaderContent() : 'N/A'}"`);
                  console.log(`  • Items: ${list.itemCount || 0} [${list.getItemContents ? list.getItemContents().join(', ') : 'N/A'}]`);
                }
                
                console.groupEnd();
              }
            });
          }
        });
        console.groupEnd();
      };

      (window.textruxDebug as any).inspectCellElements = (row: number, col: number) => {
        console.log(`🔬 Inspecting elements at R${row}C${col}:`);
        (window.textruxDebug as any).inspectElements(row, col);
      };

      (window.textruxDebug as any).showElementSummary = () => {
        console.group("📈 Element Summary");
        const blocks = blockListRef.current;
        const summary = {
          tables: 0,
          trees: 0,
          matrices: 0,
          keyValues: 0,
          lists: 0,
          totalElements: 0
        };
        
        blocks.forEach((block) => {
          if (block.cellClusters) {
            block.cellClusters.forEach((cluster) => {
              const construct = cluster.createConstruct(grid);
              if (construct) {
                const anyConstruct = construct as any; // Type assertion for properties
                switch (construct.type) {
                  case 'table':
                    summary.tables++;
                    summary.totalElements += anyConstruct.cells?.length || 0;
                    break;
                  case 'tree':
                    summary.trees++;
                    summary.totalElements += anyConstruct.elements?.length || 0;
                    break;
                  case 'matrix':
                    summary.matrices++;
                    summary.totalElements += anyConstruct.cells?.length || 0;
                    break;
                  case 'key-value':
                    summary.keyValues++;
                    summary.totalElements += anyConstruct.cells?.length || 0;
                    break;
                  case 'list':
                    summary.lists++;
                    summary.totalElements += anyConstruct.cells?.length || 0;
                    break;
                }
              }
            });
          }
        });
        
        console.log(`📊 Construct Summary:`);
        console.log(`  • Tables: ${summary.tables}`);
        console.log(`  • Trees: ${summary.trees}`);
        console.log(`  • Matrices: ${summary.matrices}`);
        console.log(`  • Key-Values: ${summary.keyValues}`);
        console.log(`  • Lists: ${summary.lists}`);
        console.log(`  • Total elements across all constructs: ${summary.totalElements}`);
        console.groupEnd();
      };

      (window.textruxDebug as any).testFormattingPerformance = () => {
        console.group("⚡ Formatting Performance Test");
        const startTime = performance.now();
        
        // Test formatting for a range of cells
        const testRows = 50;
        const testCols = 20;
        let formatCalls = 0;
        
        console.log(`Testing formatting for ${testRows}x${testCols} grid (${testRows * testCols} cells)...`);
        
        for (let row = 1; row <= testRows; row++) {
          for (let col = 1; col <= testCols; col++) {
            grid.getCellFormat(row, col);
            formatCalls++;
          }
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        const callsPerMs = formatCalls / duration;
        
        console.log(`📊 Performance Results:`);
        console.log(`  • Total format calls: ${formatCalls}`);
        console.log(`  • Duration: ${duration.toFixed(2)}ms`);
        console.log(`  • Calls per millisecond: ${callsPerMs.toFixed(2)}`);
        console.log(`  • Average time per call: ${(duration / formatCalls).toFixed(4)}ms`);
        
        if (duration < 100) {
          console.log("✅ Excellent performance!");
        } else if (duration < 500) {
          console.log("⚠️ Good performance");
        } else {
          console.log("❌ Performance needs improvement");
        }
        
        console.groupEnd();
      };

      (window.textruxDebug as any).testSpecificPatterns = () => {
        console.group("🔍 Testing Specific Construct Patterns");
        
        // Test 1: Matrix pattern (empty top-left, other 3 filled)
        console.log("Test 1: Matrix pattern (empty top-left)");
        console.log("Expected: 2x2 with empty R1C1, filled R1C2, R2C1, R2C2");
        console.log("This should produce binary key 7 (0111) = Matrix");
        
        // Test 2: Vertical list pattern (2 cells, one on top of the other)
        console.log("\nTest 2: Vertical list pattern");
        console.log("Expected: 2 cells in single column, should be detected as VL (Vertical List)");
        
        // Show current grid status
        console.log("\n📊 Current Grid Analysis:");
        (window.textruxDebug as any).showAllConstructs();
        
        console.groupEnd();
      };

      (window.textruxDebug as any).testThemeAwareFormatting = () => {
        console.group("🎨 Theme-Aware Formatting Test");
        
        // Test different themes and modes
        const themes = ["default", "modern", "minimal", "bold"];
        const modes = [false, true]; // light and dark mode
        
        // Get some sample constructs
        const blocks = blockListRef.current;
        const testConstruct = blocks.find(block => 
          block.cellClusters?.some(cluster => cluster.createConstruct(grid))
        )?.cellClusters?.find(cluster => cluster.createConstruct(grid));
        
        if (!testConstruct) {
          console.log("❌ No constructs found to test formatting. Add some data to the grid first!");
          console.groupEnd();
          return;
        }
        
        const construct = testConstruct.createConstruct(grid);
        const firstCell = testConstruct.filledPoints[0];
        
        console.log(`🎯 Testing formatting on ${construct?.type || 'unknown'} construct at R${firstCell.row}C${firstCell.col}`);
        console.log("");
        
        themes.forEach(theme => {
          modes.forEach(isDark => {
            const modeLabel = isDark ? "Dark" : "Light";
            console.group(`${theme.toUpperCase()} theme (${modeLabel} mode)`);
            
            // Test the current grid's formatter
            const currentFormat = grid.getCellFormat(firstCell.row, firstCell.col);
            console.log("Current format:", currentFormat ? {
              backgroundColor: currentFormat.backgroundColor,
              color: currentFormat.color,
              fontWeight: currentFormat.fontWeight,
              borderStyle: currentFormat.borderStyle
            } : "none");
            
            // Test the ConstructFormatter directly
            const formatter = grid.getConstructFormatter();
            if (formatter) {
              const oldOptions = formatter.getOptions();
              formatter.updateOptions({ theme: theme as any, darkMode: isDark });
              
              const testFormat = formatter.getFormatForPosition(
                firstCell.row, 
                firstCell.col, 
                grid.getAllConstructs()
              );
              
              console.log("Direct formatter result:", testFormat ? {
                backgroundColor: testFormat.backgroundColor,
                color: testFormat.color,
                fontWeight: testFormat.fontWeight,
                borderStyle: testFormat.borderStyle
              } : "none");
              
              // Restore original options
              formatter.updateOptions(oldOptions);
            }
            
            console.groupEnd();
          });
        });
        
        console.log("✅ Theme testing complete!");
        console.groupEnd();
      };
      
      // 🎉 Show helpful console message
      console.log("🔍 Textrux Debug Interface Ready!");
      console.log("Available commands:");
      console.log("• textruxDebug.parseGrid() - Re-parse the current grid");
      console.log("• textruxDebug.inspectGrid() - Dump complete GridModel object for exploration");
      console.log("• textruxDebug.inspectCell(row, col) - Inspect a specific cell");
      console.log("• textruxDebug.showAllConstructs() - Show all detected constructs");
      console.log("• textruxDebug.inspectElements() - Show detailed element breakdown for all constructs");
      console.log("• textruxDebug.inspectCellElements(row, col) - Show elements for constructs containing specific cell");
      console.log("• textruxDebug.showElementSummary() - Show summary of all elements");
      console.log("• textruxDebug.testFormattingPerformance() - Test formatting system performance");
      console.log("• textruxDebug.testThemeAwareFormatting() - Test theme-aware formatting across all themes");
      console.log("• textruxDebug.testSpecificPatterns() - Test specific construct patterns");
      console.log("• textruxDebug.getGridData() - Get current grid as CSV");
    }
  }, [version, reparse, grid]);

  // Document-level mouse up/move for drag selection

  const dragSelectRef = useRef({
    active: false,
    anchorRow: 1,
    anchorCol: 1,
  });

  // Block dragging helper functions
  const startBlockDrag = useCallback(
    (r: number, c: number) => {
      const blocks = blockListRef.current;
      if (!blocks.length) return false;

      // Find block that contains the clicked cell
      const targetBlock = blocks.find((b) => isCellInBlockCanvas(b, r, c));
      if (!targetBlock) return false;

      // BEGIN TRANSACTION - This captures the initial state for undo/redo
      grid.beginTransaction();

      // Store original block data for restoration during dragging
      const originalData: Array<{ row: number; col: number; text: string }> =
        [];
      for (const pt of targetBlock.canvasPoints) {
        const txt = grid.getCellRaw(pt.row, pt.col);
        originalData.push({ row: pt.row, col: pt.col, text: txt });
      }

      // Store complete grid state for restoration during dragging
      const originalGridState: Array<{
        row: number;
        col: number;
        text: string;
      }> = [];

      const allFilledCells = grid.getFilledCells();
      for (const cell of allFilledCells) {
        originalGridState.push({
          row: cell.row,
          col: cell.col,
          text: cell.value,
        });
      }

      // Don't clear the original block position yet - wait until first move

      setIsDraggingBlock(true);
      setDraggedBlock(targetBlock);
      setDragStartPosition({ row: r, col: c });
      setDragCurrentPosition({ row: r, col: c });
      setDragPreviousPosition(null);
      setDragOriginalBlockData(originalData);
      setDragOriginalGridState(originalGridState);
      setIsFirstBlockMove(true);

      // Change cursor for visual feedback
      if (gridContainerRef.current) {
        gridContainerRef.current.classList.add("block-dragging");
      }

      return true;
    },
    [grid]
  );

  const startSelectionDrag = useCallback(
    (r: number, c: number) => {
      // BEGIN TRANSACTION - This captures the initial state for undo/redo
      grid.beginTransaction();

      // Get the selected cells data
      const { startRow, endRow, startCol, endCol } = selectionRange;

      const originalData: Array<{ row: number; col: number; text: string }> =
        [];
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const txt = grid.getCellRaw(row, col);
          originalData.push({ row, col, text: txt });
        }
      }

      // Store complete grid state for restoration during dragging
      const originalGridState: Array<{
        row: number;
        col: number;
        text: string;
      }> = [];

      const allFilledCells = grid.getFilledCells();
      for (const cell of allFilledCells) {
        originalGridState.push({
          row: cell.row,
          col: cell.col,
          text: cell.value,
        });
      }

      // Create a fake block object for the selection
      const selectionBlock = {
        topRow: startRow,
        bottomRow: endRow,
        leftCol: startCol,
        rightCol: endCol,
        canvasPoints: originalData.map((item) => ({
          row: item.row,
          col: item.col,
        })),
      };

      setIsDraggingBlock(true);
      setIsDraggingSelection(true);
      setDraggedBlock(selectionBlock as any); // Cast to Block type
      setDragStartPosition({ row: r, col: c });
      setDragCurrentPosition({ row: r, col: c });
      setDragPreviousPosition(null);
      setDragOriginalBlockData(originalData);
      setDragOriginalGridState(originalGridState);
      setIsFirstBlockMove(true);

      // Change cursor for visual feedback
      if (gridContainerRef.current) {
        gridContainerRef.current.classList.add("block-dragging");
      }

      return true;
    },
    [grid, selectionRange]
  );

  const updateBlockDrag = useCallback(
    (r: number, c: number) => {
      if (
        !isDraggingBlock ||
        !draggedBlock ||
        !dragStartPosition ||
        !dragOriginalGridState ||
        !dragOriginalBlockData
      )
        return;

      const dR = r - dragStartPosition.row;
      const dC = c - dragStartPosition.col;

      // If no movement from start position, don't do anything
      if (dR === 0 && dC === 0) {
        return;
      }

      // Check if the new position would be valid
      const newTop = draggedBlock.topRow + dR;
      const newBot = draggedBlock.bottomRow + dR;
      const newLeft = draggedBlock.leftCol + dC;
      const newRight = draggedBlock.rightCol + dC;

      if (
        newTop < 1 ||
        newBot > grid.rowCount ||
        newLeft < 1 ||
        newRight > grid.columnCount
      ) {
        return; // Invalid position
      }

      // Check for R1C1 lock
      for (const pt of draggedBlock.canvasPoints) {
        const newR = pt.row + dR;
        const newC = pt.col + dC;
        if (newR === 1 && newC === 1) {
          const r1c1Val = grid.getCellRaw(1, 1);
          if (r1c1Val.trim().startsWith("^")) {
            return; // locked => skip move
          }
        }
      }

      // Clear the entire grid first
      grid.clearAllCells(true);

      // Restore the original grid state (this includes all cells except the moving block)
      const blockCellKeys = new Set(
        dragOriginalBlockData.map((item) => `${item.row},${item.col}`)
      );

      for (const item of dragOriginalGridState) {
        const cellKey = `${item.row},${item.col}`;
        // Only restore cells that weren't part of the original block
        if (!blockCellKeys.has(cellKey)) {
          grid.setCellRaw(item.row, item.col, item.text);
        }
      }

      // Place the block at the new position
      for (const item of dragOriginalBlockData) {
        const newR = item.row + dR;
        const newC = item.col + dC;
        if (
          newR >= 1 &&
          newR <= grid.rowCount &&
          newC >= 1 &&
          newC <= grid.columnCount
        ) {
          grid.setCellRaw(newR, newC, item.text);
        }
      }

      // Mark that we've moved from the original position
      if (isFirstBlockMove) {
        setIsFirstBlockMove(false);
      }

      // Auto-scroll to keep the dragged block in view
      const newBlockTop = draggedBlock.topRow + dR;
      const newBlockBottom = draggedBlock.bottomRow + dR;
      const newBlockLeft = draggedBlock.leftCol + dC;
      const newBlockRight = draggedBlock.rightCol + dC;

      // Scroll to ensure the block is visible
      if (gridContainerRef.current) {
        const container = gridContainerRef.current;
        const containerRect = container.getBoundingClientRect();

        // Calculate the pixel positions of the block using helper functions
        const { start: blockTopPx, end: blockBottomPx } = calculatePixelRange(
          newBlockTop,
          newBlockBottom,
          rowHeights,
          baseRowHeight * zoom
        );

        const { start: blockLeftPx, end: blockRightPx } = calculatePixelRange(
          newBlockLeft,
          newBlockRight,
          colWidths,
          baseColWidth * zoom
        );

        // Check if we need to scroll
        const scrollTop = container.scrollTop;
        const scrollLeft = container.scrollLeft;
        const containerHeight = container.clientHeight;
        const containerWidth = container.clientWidth;

        let newScrollTop = scrollTop;
        let newScrollLeft = scrollLeft;

        // Vertical scrolling
        if (blockTopPx < scrollTop) {
          newScrollTop = blockTopPx;
        } else if (blockBottomPx > scrollTop + containerHeight) {
          newScrollTop = blockBottomPx - containerHeight;
        }

        // Horizontal scrolling
        if (blockLeftPx < scrollLeft) {
          newScrollLeft = blockLeftPx;
        } else if (blockRightPx > scrollLeft + containerWidth) {
          newScrollLeft = blockRightPx - containerWidth;
        }

        // Apply scrolling if needed
        if (newScrollTop !== scrollTop || newScrollLeft !== scrollLeft) {
          container.scrollTop = newScrollTop;
          container.scrollLeft = newScrollLeft;
        }
      }

      setDragPreviousPosition({ row: r, col: c });
      setDragCurrentPosition({ row: r, col: c });
      forceRefresh();
    },
    [
      isDraggingBlock,
      draggedBlock,
      dragStartPosition,
      dragOriginalBlockData,
      dragOriginalGridState,
      isFirstBlockMove,
      grid,
      forceRefresh,
      rowHeights,
      colWidths,
      baseRowHeight,
      baseColWidth,
      zoom,
    ]
  );

  const finishBlockDrag = useCallback(() => {
    if (
      !isDraggingBlock ||
      !draggedBlock ||
      !dragStartPosition ||
      !dragCurrentPosition ||
      !dragOriginalBlockData ||
      !dragOriginalGridState
    ) {
      return;
    }

    const dR = dragCurrentPosition.row - dragStartPosition.row;
    const dC = dragCurrentPosition.col - dragStartPosition.col;

    // Always end the transaction that was started in startBlockDrag
    // Only create the final state if there was actual movement
    if (dR !== 0 || dC !== 0) {
      // Update references before moving the block
      if (referenceUpdaterRef.current) {
        const cellMoves: CellMove[] = dragOriginalBlockData.map((item) => ({
          fromRow: item.row,
          fromCol: item.col,
          toRow: item.row + dR,
          toCol: item.col + dC,
        }));
        referenceUpdaterRef.current.updateReferencesForBlockMove(cellMoves);
      }

      // If in "cell" mode, store the current cell sizes before moving
      if (sizingMode === "cell" && gridSizingSettings) {
        for (const item of dragOriginalBlockData) {
          const oldCellKey = `R${item.row}C${item.col}`;
          const newCellKey = `R${item.row + dR}C${item.col + dC}`;

          // Get current cell format or create one with current grid dimensions
          const existingFormat = gridSizingSettings.cellFormats[oldCellKey];
          const currentHeight =
            rowHeights[item.row - 1] || baseRowHeight * zoom;
          const currentWidth = colWidths[item.col - 1] || baseColWidth * zoom;

          // Create or update the cell format with current dimensions
          const cellFormat = new CellFormat({
            ...existingFormat,
            width: existingFormat?.width || currentWidth,
            height: existingFormat?.height || currentHeight,
            lastWidthSource: existingFormat?.lastWidthSource || "auto",
            lastHeightSource: existingFormat?.lastHeightSource || "auto",
          });

          // Store the format for the new position
          const updatedSettings = { ...gridSizingSettings };
          updatedSettings.cellFormats[newCellKey] = cellFormat;

          // Remove the old format if it exists
          if (updatedSettings.cellFormats[oldCellKey]) {
            delete updatedSettings.cellFormats[oldCellKey];
          }

          grid.sizingSettings = updatedSettings;
          setGridSizingSettings(updatedSettings);
        }
      }

      // Clear the grid first
      grid.clearAllCells(true);

      // Restore original grid state excluding the moving block
      const blockCellKeys = new Set(
        dragOriginalBlockData.map((item) => `${item.row},${item.col}`)
      );

      for (const item of dragOriginalGridState) {
        const cellKey = `${item.row},${item.col}`;
        // Only restore cells that weren't part of the original block
        if (!blockCellKeys.has(cellKey)) {
          grid.setCellRaw(item.row, item.col, item.text);
        }
      }

      // Update block position (only if it's a real block, not a selection)
      if (!isDraggingSelection) {
        draggedBlock.topRow += dR;
        draggedBlock.bottomRow += dR;
        draggedBlock.leftCol += dC;
        draggedBlock.rightCol += dC;

        // Update canvas points
        for (let i = 0; i < draggedBlock.canvasPoints.length; i++) {
          draggedBlock.canvasPoints[i].row += dR;
          draggedBlock.canvasPoints[i].col += dC;
        }
      }

      // Place block at new position
      for (const item of dragOriginalBlockData) {
        const newR = item.row + dR;
        const newC = item.col + dC;
        grid.setCellRaw(newR, newC, item.text);
      }

      // Update active cell position
      const newActiveR = activeRow + dR;
      const newActiveC = activeCol + dC;
      setActiveRow(newActiveR);
      setActiveCol(newActiveC);

      if (isDraggingSelection) {
        // Update selection range to the new position
        const originalStartRow = draggedBlock.topRow - dR;
        const originalEndRow = draggedBlock.bottomRow - dR;
        const originalStartCol = draggedBlock.leftCol - dC;
        const originalEndCol = draggedBlock.rightCol - dC;

        setSelectionRange({
          startRow: originalStartRow + dR,
          endRow: originalEndRow + dR,
          startCol: originalStartCol + dC,
          endCol: originalEndCol + dC,
        });
      } else {
        setSelectionRange({
          startRow: newActiveR,
          endRow: newActiveR,
          startCol: newActiveC,
          endCol: newActiveC,
        });
      }

      scrollCellIntoView(
        newActiveR,
        newActiveC,
        rowHeights,
        colWidths,
        gridContainerRef.current
      );

      // End transaction - this captures the final state for undo/redo
      grid.endTransaction();

      // Save the changes to localStorage
      notifyGridChange();

      // Update grid dimensions based on cell formats after the move (for "cell" mode)
      if (sizingMode === "cell") {
        console.log("🔧 Block moved in cell mode, updating grid dimensions...");
        setTimeout(() => updateGridDimensionsFromCellFormats(), 50);
      }
    } else {
      // No movement, just restore original state and end the transaction
      grid.clearAllCells(true);
      for (const item of dragOriginalGridState) {
        grid.setCellRaw(item.row, item.col, item.text);
      }

      // End the transaction even though no change occurred
      grid.endTransaction();
    }

    // Reset drag state
    setIsDraggingBlock(false);
    setIsDraggingSelection(false);
    setDraggedBlock(null);
    setDragStartPosition(null);
    setDragCurrentPosition(null);
    setDragPreviousPosition(null);
    setDragOriginalBlockData(null);
    setDragOriginalGridState(null);
    setIsFirstBlockMove(false);
    isDragEligibleRef.current = false;

    // Reset cursor
    if (gridContainerRef.current) {
      gridContainerRef.current.classList.remove("block-dragging");
    }

    forceRefresh();
  }, [
    isDraggingBlock,
    isDraggingSelection,
    draggedBlock,
    dragStartPosition,
    dragCurrentPosition,
    dragOriginalBlockData,
    dragOriginalGridState,
    grid,
    activeRow,
    activeCol,
    rowHeights,
    colWidths,
    forceRefresh,
    sizingMode,
    gridSizingSettings,
    baseRowHeight,
    baseColWidth,
    zoom,
    updateGridDimensionsFromCellFormats,
    notifyGridChange,
  ]);

  const cancelBlockDrag = useCallback(() => {
    if (!isDraggingBlock || !dragOriginalBlockData || !dragOriginalGridState)
      return;

    // Clear the grid and restore complete original state
    grid.clearAllCells(true);
    for (const item of dragOriginalGridState) {
      grid.setCellRaw(item.row, item.col, item.text);
    }

    // End the transaction that was started in startBlockDrag
    grid.endTransaction();

    // Reset drag state
    setIsDraggingBlock(false);
    setIsDraggingSelection(false);
    setDraggedBlock(null);
    setDragStartPosition(null);
    setDragCurrentPosition(null);
    setDragPreviousPosition(null);
    setDragOriginalBlockData(null);
    setDragOriginalGridState(null);
    setIsFirstBlockMove(false);
    isDragEligibleRef.current = false;

    // Reset cursor
    if (gridContainerRef.current) {
      gridContainerRef.current.classList.remove("block-dragging");
    }

    forceRefresh();
  }, [
    isDraggingBlock,
    dragOriginalBlockData,
    dragOriginalGridState,
    grid,
    forceRefresh,
  ]);

  // Reference handle helper functions
  const calculateReferenceHandlePosition = useCallback(
    (range: SelectionRange) => {
      const container = gridContainerRef.current;
      if (!container) return null;

      // Calculate the pixel position of the selection using helper functions
      const { start: startRowPx, end: endRowPx } = calculatePixelRange(
        range.startRow,
        range.endRow,
        rowHeights,
        baseRowHeight * zoom
      );

      const { start: startColPx, end: endColPx } = calculatePixelRange(
        range.startCol,
        range.endCol,
        colWidths,
        baseColWidth * zoom
      );

      // Calculate center position within the grid
      const centerX = (startColPx + endColPx) / 2;
      const centerY = (startRowPx + endRowPx) / 2;

      // Get scroll position
      const scrollLeft = container.scrollLeft;
      const scrollTop = container.scrollTop;

      // Return position relative to the grid container viewport
      return {
        x: centerX - scrollLeft,
        y: centerY - scrollTop,
      };
    },
    [rowHeights, colWidths, baseRowHeight, baseColWidth, zoom]
  );

  const startReferenceCreation = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Clear any pending timeouts
      clearTimeoutRef(hideHandleTimeoutRef);
      clearTimeoutRef(showHandleTimeoutRef);

      // Reset hovering state since we're starting to drag
      setIsHoveringHandle(false);

      setIsDraggingReference(true);
      setReferenceSourceRange(selectionRange);

      // Calculate the source position based on the selection center
      const handlePos = calculateReferenceHandlePosition(selectionRange);
      if (handlePos && gridContainerRef.current) {
        const containerRect = gridContainerRef.current.getBoundingClientRect();
        // Store absolute screen coordinates for the visual feedback
        const absoluteX = containerRect.left + handlePos.x;
        const absoluteY = containerRect.top + handlePos.y;

        setReferenceDragStartPos({ x: absoluteX, y: absoluteY });
        setReferenceDragCurrentPos({ x: e.clientX, y: e.clientY });
      }

      setShowReferenceHandle(false);

      // Change cursor to indicate reference creation mode
      if (gridContainerRef.current) {
        gridContainerRef.current.classList.add("reference-dragging");
      }
    },
    [selectionRange, calculateReferenceHandlePosition]
  );

  const updateReferenceCreation = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingReference || !gridContainerRef.current) return;

      // Update current drag position for visual feedback
      setReferenceDragCurrentPos({ x: e.clientX, y: e.clientY });

      const container = gridContainerRef.current;
      const rect = container.getBoundingClientRect();

      // Calculate position relative to the grid content
      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      const hoveredRow = findRowByY(y, rowHeights);
      const hoveredCol = findColByX(x, colWidths);

      // Calculate target cell center position using helper function
      const targetRowPx =
        calculatePixelPosition(hoveredRow, rowHeights, baseRowHeight * zoom) +
        (rowHeights[hoveredRow - 1] || baseRowHeight * zoom) / 2;

      const targetColPx =
        calculatePixelPosition(hoveredCol, colWidths, baseColWidth * zoom) +
        (colWidths[hoveredCol - 1] || baseColWidth * zoom) / 2;

      // Convert to absolute screen coordinates for visual feedback
      const targetAbsoluteX = rect.left + targetColPx - container.scrollLeft;
      const targetAbsoluteY = rect.top + targetRowPx - container.scrollTop;

      setReferenceTargetPosition({
        x: targetAbsoluteX,
        y: targetAbsoluteY,
      });
    },
    [
      isDraggingReference,
      rowHeights,
      colWidths,
      baseRowHeight,
      baseColWidth,
      zoom,
    ]
  );

  const finishReferenceCreation = useCallback(
    (e: MouseEvent) => {
      if (
        !isDraggingReference ||
        !referenceSourceRange ||
        !gridContainerRef.current
      ) {
        return;
      }

      const container = gridContainerRef.current;
      const rect = container.getBoundingClientRect();

      // Calculate position relative to the grid content (same as existing mouse handlers)
      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      const targetRow = findRowByY(y, rowHeights);
      const targetCol = findColByX(x, colWidths);

      // Create the reference formula
      let referenceFormula = "";
      if (
        referenceSourceRange.startRow === referenceSourceRange.endRow &&
        referenceSourceRange.startCol === referenceSourceRange.endCol
      ) {
        // Single cell reference
        referenceFormula = `=R${referenceSourceRange.startRow}C${referenceSourceRange.startCol}`;
      } else {
        // Range reference
        referenceFormula = `=R${referenceSourceRange.startRow}C${referenceSourceRange.startCol}:R${referenceSourceRange.endRow}C${referenceSourceRange.endCol}`;
      }

      // Set the formula in the target cell
      grid.setCellRaw(targetRow, targetCol, referenceFormula);

      // Reset reference creation state
      setIsDraggingReference(false);
      setReferenceSourceRange(null);
      setReferenceDragStartPos(null);
      setReferenceDragCurrentPos(null);
      setReferenceTargetPosition(null);

      // Reset cursor
      if (gridContainerRef.current) {
        gridContainerRef.current.classList.remove("reference-dragging");
      }

      forceRefresh();
    },
    [
      isDraggingReference,
      referenceSourceRange,
      rowHeights,
      colWidths,
      grid,
      forceRefresh,
    ]
  );

  const handleCellMouseDown = useCallback(
    (r: number, c: number, e: React.MouseEvent) => {
      // Clear any pending show timeout since user is clicking (likely to drag)
      if (showHandleTimeoutRef.current) {
        clearTimeout(showHandleTimeoutRef.current);
        showHandleTimeoutRef.current = undefined;
      }

      // if we're editing a different cell, commit it first
      if (editingCell && (editingCell.row !== r || editingCell.col !== c)) {
        const oldVal = editingValue;
        setEditingCell(null);
        setEditingValue("");
        if (
          oldVal !== undefined &&
          editingCell &&
          grid.getCellValue(editingCell.row, editingCell.col) !== oldVal
        ) {
          // Update if changed
          grid.setCellRaw(editingCell.row, editingCell.col, oldVal);
          notifyGridChange();
          forceRefresh(); // Trigger parser/formatter
        }
      }

      // Select this cell (single-cell selection)
      if (!e.shiftKey) {
        setCellSelection({
          startRow: r,
          startCol: c,
          endRow: r,
          endCol: c,
        });
      }

      if (e.button === 0) {
        // Check if this cell is part of a block canvas for potential dragging
        const blocks = blockListRef.current;
        const isInBlockCanvas = blocks.some((b) =>
          isCellInBlockCanvas(b, r, c)
        );

        // Always allow regular drag selection to start immediately
        if (!isDraggingBlock) {
          dragSelectRef.current.active = true;
          dragSelectRef.current.anchorRow = r;
          dragSelectRef.current.anchorCol = c;
        }

        // Check if we should enable drag functionality
        const hasMultiCellSelection =
          selectionRange.startRow !== selectionRange.endRow ||
          selectionRange.startCol !== selectionRange.endCol;

        const isInSelection =
          r >= selectionRange.startRow &&
          r <= selectionRange.endRow &&
          c >= selectionRange.startCol &&
          c <= selectionRange.endCol;

        if ((hasMultiCellSelection && isInSelection) || isInBlockCanvas) {
          isDragEligibleRef.current = true;

          // Start long press timer for dragging
          window.clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = window.setTimeout(() => {
            if (isDragEligibleRef.current && !isDraggingBlock) {
              let success = false;

              if (hasMultiCellSelection && isInSelection) {
                // Drag selected cells
                success = startSelectionDrag(r, c);
              } else if (isInBlockCanvas) {
                // Drag block canvas
                success = startBlockDrag(r, c);
              }

              if (success) {
                // Disable regular drag selection since we're now in drag mode
                dragSelectRef.current.active = false;
              }
            }
          }, 500); // 500ms long press
        } else {
          isDragEligibleRef.current = false;
        }

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
          ctrlAStageRef.current = 0;
          lastCtrlACellRef.current = null;
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
          ctrlAStageRef.current = 0;
          lastCtrlACellRef.current = null;
        }

        // focus for keyboard
        if (!editingCell) {
          gridContainerRef.current?.focus();
        }
      }
    },
    [
      editingCell,
      editingValue,
      grid,
      isDraggingBlock,
      startBlockDrag,
      startSelectionDrag,
      setCellSelection,
      notifyGridChange,
      forceRefresh,
      selectionRange,
    ]
  );

  const handleCellClick = (r: number, c: number) => {
    setActiveRow(r);
    setActiveCol(c);
    setSelectionRange({
      startRow: r,
      endRow: r,
      startCol: c,
      endCol: c,
    });

    ctrlAStageRef.current = 0;
    lastCtrlACellRef.current = null;

    grid.selectedCell = { row: r, col: c };
    LocalStorageManager.saveGrid(grid);

    // Only clear editing state if we're not clicking on the cell that's currently being edited
    if (!editingCell || editingCell.row !== r || editingCell.col !== c) {
      setEditingCell(null);
      setEditingValue("");
      setFocusTarget(null);
    }
  };

  const handleCellDoubleClick = useCallback(
    (r: number, c: number) => {
      if (r === 1 && c === 1) {
        const r1c1 = grid.getCellRaw(1, 1);
        if (r1c1.trim().startsWith("^")) {
          return; // skip
        }
      }
      const raw = grid.getCellRaw(r, c);
      setEditingValue(raw);
      setEditingCell({ row: r, col: c });
      setFocusTarget("cell");
    },
    [grid]
  );

  /**
   * measureAndExpand => measure wrapped text by placing it in
   * an offscreen <textarea> or <div> with the same styles.
   */
  function measureAndExpand(r: number, c: number, text: string) {
    const hidden = document.createElement("textarea");
    hidden.style.position = "absolute";
    hidden.style.visibility = "hidden";
    hidden.style.zIndex = "-9999";

    hidden.style.whiteSpace = "pre-wrap";
    hidden.style.wordBreak = "break-word";
    hidden.style.overflowY = "scroll";
    hidden.style.lineHeight = "1.2";
    hidden.style.fontSize = baseFontSize * zoom + "px";
    hidden.style.padding = "4px";
    hidden.style.boxSizing = "border-box";

    const currentWidth = colWidths[c - 1] ?? baseColWidth * zoom;
    hidden.style.width = currentWidth + "px";

    hidden.value = text;
    document.body.appendChild(hidden);

    const neededWidth = hidden.scrollWidth;
    const neededHeight = hidden.scrollHeight;

    document.body.removeChild(hidden);

    const finalWidth = Math.min(neededWidth + 2, 6 * baseColWidth * zoom);
    const finalHeight = Math.min(neededHeight + 2, 6 * baseRowHeight * zoom);

    setColWidths((old) => {
      if (!old[c - 1]) return old;
      const current = old[c - 1];

      if (finalWidth - current >= 3) {
        const copy = [...old];
        copy[c - 1] = finalWidth;
        return copy;
      }
      return old;
    });

    setRowHeights((old) => {
      if (!old[r - 1]) return old;
      const current = old[r - 1];
      if (finalHeight - current >= 3) {
        const copy = [...old];
        copy[r - 1] = finalHeight;
        return copy;
      }
      return old;
    });
  }

  function handleKeyboardNav(
    r: number,
    c: number,
    direction: "up" | "down" | "left" | "right" | "down-right" | "down-left"
  ) {
    let newR = r;
    let newC = c;

    switch (direction) {
      case "up":
        newR = r - 1;
        break;
      case "down":
        newR = r + 1;
        break;
      case "left":
        newC = c - 1;
        break;
      case "right":
        newC = c + 1;
        break;
      case "down-right":
        newR = r + 1;
        newC = c + 1;
        break;
      case "down-left":
        newR = r + 1;
        newC = c - 1;
        break;
    }

    if (newR < 1) newR = 1;
    if (newR > grid.rowCount) newR = grid.rowCount;
    if (newC < 1) newC = 1;
    if (newC > grid.columnCount) newC = grid.columnCount;

    // Use helper function to update position state consistently
    updatePositionState(
      newR,
      newC,
      setActiveRow,
      setActiveCol,
      setSelectionRange
    );

    ctrlAStageRef.current = 0;
    lastCtrlACellRef.current = null;
    grid.selectedCell = { row: newR, col: newC };
    LocalStorageManager.saveGrid(grid);

    scrollCellIntoView(
      newR,
      newC,
      rowHeights,
      colWidths,
      gridContainerRef.current
    );

    // IMPORTANT: Re-focus the container so keystrokes go to it.
    // This fixes the "can't type after pressing Enter" issue.

    gridContainerRef.current?.focus();
  }

  const commitEdit = useCallback(
    (r: number, c: number, newValue: string, opts?: { escape?: boolean }) => {
      if (!opts?.escape) {
        grid.setCellRaw(r, c, newValue);
        measureAndExpand(r, c, newValue);

        // Auto-resize will be handled separately to avoid dependency ordering
        // autoResizeAfterEdit(r, c, newValue);
      }
      setEditingCell(null);
      setEditingValue("");
      setFocusTarget(null);

      if (isFormattingDisabled) {
        setFormattingDisabled(false);
      }
      forceRefresh();
    },
    [grid, measureAndExpand, forceRefresh, isFormattingDisabled]
  );

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      // Handle block dragging
      if (isDraggingBlock) {
        e.preventDefault();
        const container = gridContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left + container.scrollLeft;
        const y = e.clientY - rect.top + container.scrollTop;

        const hoveredRow = findRowByY(y, rowHeights);
        const hoveredCol = findColByX(x, colWidths);

        updateBlockDrag(hoveredRow, hoveredCol);
        return;
      }

      // Handle reference creation dragging
      if (isDraggingReference) {
        e.preventDefault();
        updateReferenceCreation(e);
        return;
      }

      // Cancel long press timer if user moves mouse during initial press and regular drag selection is active
      if (
        isDragEligibleRef.current &&
        !isDraggingBlock &&
        dragSelectRef.current.active
      ) {
        window.clearTimeout(longPressTimeoutRef.current);
        isDragEligibleRef.current = false;
      }

      // Handle regular selection dragging (but not if we're in block drag mode)
      if (!dragSelectRef.current.active || isDraggingBlock) return;
      e.preventDefault();
      const container = gridContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      const hoveredRow = findRowByY(y, rowHeights);
      const hoveredCol = findColByX(x, colWidths);

      const aR = dragSelectRef.current.anchorRow;
      const aC = dragSelectRef.current.anchorCol;
      setSelectionRange({
        startRow: Math.min(aR, hoveredRow),
        endRow: Math.max(aR, hoveredRow),
        startCol: Math.min(aC, hoveredCol),
        endCol: Math.max(aC, hoveredCol),
      });
      setActiveRow(hoveredRow);
      setActiveCol(hoveredCol);
      ctrlAStageRef.current = 0;
      lastCtrlACellRef.current = null;
      grid.selectedCell = { row: hoveredRow, col: hoveredCol };
      LocalStorageManager.saveGrid(grid);
    }
    function onMouseUp(e: MouseEvent) {
      if (e.button === 0) {
        // Cancel long press timer if mouse is released
        window.clearTimeout(longPressTimeoutRef.current);
        isDragEligibleRef.current = false;

        // Handle reference creation completion
        if (isDraggingReference) {
          finishReferenceCreation(e);
          return;
        }

        // Handle block drag completion
        if (isDraggingBlock) {
          finishBlockDrag();
          return;
        }

        // Handle regular selection
        dragSelectRef.current.active = false;
      }
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    rowHeights,
    colWidths,
    isDraggingBlock,
    isDraggingReference,
    updateBlockDrag,
    updateReferenceCreation,
    finishReferenceCreation,
    finishBlockDrag,
    grid,
  ]);

  // 1) Intermediary step: show the next elevated level
  const displayNextElevatedGrid = useCallback(() => {
    displayNextElevatedGridHelper(grid);
  }, [grid]);

  // 2) Actual "enter" the elevated grid
  const enterElevatedGrid = useCallback(() => {
    enterElevatedGridHelper(grid);
  }, [grid]);

  // 3) Exit back to a lower level
  const exitElevatedGrid = useCallback(() => {
    exitElevatedGridHelper(grid);
  }, [grid]);

  // pinch/middle-click drag from custom hook
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
    setZoom: handleZoomChange, // Use handleZoomChange instead of setZoom
    minZoom: 0.2,
    maxZoom: 10,
    colPx: baseColWidth,
    rowPx: baseRowHeight,
    displayNextElevatedGrid,
    enterElevatedGrid,
    exitElevatedGrid,
    gridContainerRef,
  });

  // Touch-based long-press logic
  useEffect(() => {
    function handleTouchMoveDoc(e: TouchEvent) {
      if (!isSelectingViaLongPressRef.current) return;
      e.preventDefault();
      if (e.touches.length !== 1) return;

      const container = gridContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const t = e.touches[0];
      const x = t.clientX - rect.left + container.scrollLeft;
      const y = t.clientY - rect.top + container.scrollTop;

      const anchor = selectionAnchorRef.current;
      if (!anchor) return;

      const hoveredRow = findRowByY(y, rowHeights);
      const hoveredCol = findColByX(x, colWidths);

      setSelectionRange({
        startRow: Math.min(anchor.row, hoveredRow),
        endRow: Math.max(anchor.row, hoveredRow),
        startCol: Math.min(anchor.col, hoveredCol),
        endCol: Math.max(anchor.col, hoveredCol),
      });
      setActiveRow(hoveredRow);
      setActiveCol(hoveredCol);
      ctrlAStageRef.current = 0;
      lastCtrlACellRef.current = null;
      grid.selectedCell = { row: hoveredRow, col: hoveredCol };
      LocalStorageManager.saveGrid(grid);
    }
    function handleTouchEndDoc() {
      isSelectingViaLongPressRef.current = false;
    }
    document.addEventListener("touchmove", handleTouchMoveDoc, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEndDoc);
    document.addEventListener("touchcancel", handleTouchEndDoc);
    return () => {
      document.removeEventListener("touchmove", handleTouchMoveDoc);
      document.removeEventListener("touchend", handleTouchEndDoc);
      document.removeEventListener("touchcancel", handleTouchEndDoc);
    };
  }, [
    rowHeights,
    colWidths,
    isSelectingViaLongPressRef,
    selectionAnchorRef,
    grid,
  ]);

  // Arrow navigation
  const arrowNav = useCallback(
    (key: string) => {
      let dR = 0,
        dC = 0;
      if (key === "ArrowUp") dR = -1;
      if (key === "ArrowDown") dR = 1;
      if (key === "ArrowLeft") dC = -1;
      if (key === "ArrowRight") dC = 1;

      const newR = Math.max(1, Math.min(grid.rowCount, activeRow + dR));
      const newC = Math.max(1, Math.min(grid.columnCount, activeCol + dC));

      updatePositionState(
        newR,
        newC,
        setActiveRow,
        setActiveCol,
        setSelectionRange
      );

      anchorRef.current = { row: newR, col: newC };
      ctrlAStageRef.current = 0;
      lastCtrlACellRef.current = null;
      grid.selectedCell = { row: newR, col: newC };
      LocalStorageManager.saveGrid(grid);
      scrollCellIntoView(
        newR,
        newC,
        rowHeights,
        colWidths,
        gridContainerRef.current
      );
    },
    [grid, activeRow, activeCol, rowHeights, colWidths]
  );

  // SHIFT+arrow extends selection
  const extendSelection = useCallback(
    (key: string) => {
      if (!anchorRef.current) {
        anchorRef.current = { row: activeRow, col: activeCol };
      }
      const start = anchorRef.current;

      let dR = 0,
        dC = 0;
      if (key === "ArrowUp") dR = -1;
      if (key === "ArrowDown") dR = 1;
      if (key === "ArrowLeft") dC = -1;
      if (key === "ArrowRight") dC = 1;

      let newR = activeRow + dR;
      let newC = activeCol + dC;
      if (newR < 1) newR = 1;
      if (newR > grid.rowCount) newR = grid.rowCount;
      if (newC < 1) newC = 1;
      if (newC > grid.columnCount) newC = grid.columnCount;

      setActiveRow(newR);
      setActiveCol(newC);
      setSelectionRange(
        createSelectionUpdate(
          Math.min(start.row, newR),
          Math.max(start.row, newR),
          Math.min(start.col, newC),
          Math.max(start.col, newC)
        )
      );
      ctrlAStageRef.current = 0;
      lastCtrlACellRef.current = null;
      grid.selectedCell = { row: newR, col: newC };
      LocalStorageManager.saveGrid(grid);
      scrollCellIntoView(
        newR,
        newC,
        rowHeights,
        colWidths,
        gridContainerRef.current
      );
    },
    [activeRow, activeCol, grid, rowHeights, colWidths]
  );

  // Ctrl+Arrow => move block
  const moveBlock = useCallback(
    (arrowKey: string, allowMerge: boolean) => {
      const blocks = blockListRef.current;
      if (!blocks.length) return;

      // find block that contains our active cell
      const targetBlock = blocks.find((b) =>
        isCellInBlockCanvas(b, activeRow, activeCol)
      );
      if (!targetBlock) return;

      let dR = 0,
        dC = 0;
      switch (arrowKey) {
        case "ArrowUp":
          dR = -1;
          break;
        case "ArrowDown":
          dR = 1;
          break;
        case "ArrowLeft":
          dC = -1;
          break;
        case "ArrowRight":
          dC = 1;
          break;
      }
      const newTop = targetBlock.topRow + dR;
      const newBot = targetBlock.bottomRow + dR;
      const newLeft = targetBlock.leftCol + dC;
      const newRight = targetBlock.rightCol + dC;
      if (
        newTop < 1 ||
        newBot > grid.rowCount ||
        newLeft < 1 ||
        newRight > grid.columnCount
      ) {
        return;
      }

      // check collisions if not allowMerge
      if (!allowMerge) {
        // Make sure none of the *canvas* cells tries to land on R1C1 if locked
        for (const pt of targetBlock.canvasPoints) {
          const newR = pt.row + dR;
          const newC = pt.col + dC;
          if (newR === 1 && newC === 1) {
            const r1c1Val = grid.getCellRaw(1, 1);
            if (r1c1Val.trim().startsWith("^")) {
              return; // locked => skip move
            }
          }
        }

        const framePad = 1; // how many rows/cols the frame extends beyond the block

        const newTop = targetBlock.topRow - framePad + dR;
        const newBot = targetBlock.bottomRow + framePad + dR;
        const newLeft = targetBlock.leftCol - framePad + dC;
        const newRight = targetBlock.rightCol + framePad + dC;

        // Now check all other blocks with their frame space too:
        for (const b of blocks) {
          if (b === targetBlock) continue;

          const bTop = b.topRow - framePad;
          const bBot = b.bottomRow + framePad;
          const bLeft = b.leftCol - framePad;
          const bRight = b.rightCol + framePad;

          // If these rectangles overlap, return without moving (prevents "merge"):
          const noOverlap =
            newRight < bLeft ||
            newLeft > bRight ||
            newBot < bTop ||
            newTop > bBot;
          if (!noOverlap) {
            return; // Skip the move entirely
          }
        }

        // If we get here, there's no collision => proceed with the move
      }

      // --- START TRANSACTION ---
      grid.beginTransaction();

      // gather old cell data
      const oldCells = targetBlock.canvasPoints;
      const buffer: Array<{ row: number; col: number; text: string }> = [];
      for (const pt of oldCells) {
        const txt = grid.getCellRaw(pt.row, pt.col);
        buffer.push({ row: pt.row, col: pt.col, text: txt });
        grid.setCellRaw(pt.row, pt.col, "");
      }

      // Update references before moving the block
      if (referenceUpdaterRef.current) {
        const cellMoves: CellMove[] = oldCells.map((pt) => ({
          fromRow: pt.row,
          fromCol: pt.col,
          toRow: pt.row + dR,
          toCol: pt.col + dC,
        }));
        referenceUpdaterRef.current.updateReferencesForBlockMove(cellMoves);
      }

      targetBlock.topRow += dR;
      targetBlock.bottomRow += dR;
      targetBlock.leftCol += dC;
      targetBlock.rightCol += dC;
      for (let i = 0; i < oldCells.length; i++) {
        oldCells[i].row += dR;
        oldCells[i].col += dC;
      }
      // re-insert
      for (const item of buffer) {
        const newR = item.row + dR;
        const newC = item.col + dC;
        grid.setCellRaw(newR, newC, item.text);
      }

      // Done editing cells => end the transaction
      grid.endTransaction();

      // Save the changes to localStorage
      notifyGridChange();

      forceRefresh();

      // shift active cell
      const newActiveR = activeRow + dR;
      const newActiveC = activeCol + dC;

      anchorRef.current = { row: newActiveR, col: newActiveC };

      setActiveRow(newActiveR);
      setActiveCol(newActiveC);
      setSelectionRange({
        startRow: newActiveR,
        endRow: newActiveR,
        startCol: newActiveC,
        endCol: newActiveC,
      });
      ctrlAStageRef.current = 0;
      lastCtrlACellRef.current = null;
      scrollCellIntoView(
        newActiveR,
        newActiveC,
        rowHeights,
        colWidths,
        gridContainerRef.current
      );

      // Update grid dimensions based on cell formats after the move (for "cell" mode)
      if (sizingMode === "cell") {
        console.log("🔧 Block moved in cell mode, updating grid dimensions...");
        setTimeout(() => updateGridDimensionsFromCellFormats(), 50);
      }
    },
    [
      activeRow,
      activeCol,
      rowHeights,
      colWidths,
      grid,
      forceRefresh,
      sizingMode,
      updateGridDimensionsFromCellFormats,
      notifyGridChange,
    ]
  );

  // Alt+Arrow => jump to nearest block
  const selectNearestBlock = useCallback(
    (arrowKey: string) => {
      const blocks = blockListRef.current;
      if (!blocks.length) return;

      // Find the current block, or treat the active cell as a 1x1 block.
      const curBlock = blocks.find((b) =>
        isCellInBlockCanvas(b, activeRow, activeCol)
      );

      const referenceBlock = curBlock || {
        topRow: activeRow,
        bottomRow: activeRow,
        leftCol: activeCol,
        rightCol: activeCol,
      };

      const refCenterR = (referenceBlock.topRow + referenceBlock.bottomRow) / 2;
      const refCenterC = (referenceBlock.leftCol + referenceBlock.rightCol) / 2;

      // Filter candidate blocks based on movement direction.
      const candidates = blocks.filter((b) => {
        if (b === curBlock) return false;
        switch (arrowKey) {
          case "ArrowRight":
            return b.leftCol > referenceBlock.rightCol;
          case "ArrowLeft":
            return b.rightCol < referenceBlock.leftCol;
          case "ArrowDown":
            return b.topRow > referenceBlock.bottomRow;
          case "ArrowUp":
            return b.bottomRow < referenceBlock.topRow;
          default:
            return false;
        }
      });

      if (!candidates.length) return;

      // Apply directional bias to penalize misalignment.
      const directionalBias = 3;
      let nearest: Block | null = null;
      let minDist = Infinity;

      for (const b of candidates) {
        const cR = (b.topRow + b.bottomRow) / 2;
        const cC = (b.leftCol + b.rightCol) / 2;

        // Adjust weight to prioritize the movement direction.
        let weightRow = 1,
          weightCol = 1;
        if (arrowKey === "ArrowRight" || arrowKey === "ArrowLeft") {
          weightRow = directionalBias; // Penalize row misalignment for horizontal movement.
        } else if (arrowKey === "ArrowUp" || arrowKey === "ArrowDown") {
          weightCol = directionalBias; // Penalize column misalignment for vertical movement.
        }

        const dRow = cR - refCenterR;
        const dCol = cC - refCenterC;
        const dist = Math.sqrt(
          (dRow * weightRow) ** 2 + (dCol * weightCol) ** 2
        );

        if (dist < minDist) {
          minDist = dist;
          nearest = b;
        }
      }

      if (!nearest) return;

      const midRow = Math.floor((nearest.topRow + nearest.bottomRow) / 2);
      const midCol = Math.floor((nearest.leftCol + nearest.rightCol) / 2);
      setActiveRow(midRow);
      setActiveCol(midCol);
      setSelectionRange({
        startRow: midRow,
        endRow: midRow,
        startCol: midCol,
        endCol: midCol,
      });
      grid.selectedCell = { row: midRow, col: midCol };
      LocalStorageManager.saveGrid(grid);

      ctrlAStageRef.current = 0;
      lastCtrlACellRef.current = null;
      scrollCellIntoView(
        midRow,
        midCol,
        rowHeights,
        colWidths,
        gridContainerRef.current
      );
    },
    [activeRow, activeCol, rowHeights, colWidths, grid]
  );

  const clearSelectedCells = useCallback(() => {
    const { startRow, endRow, startCol, endCol } = selectionRange;

    grid.beginTransaction();

    // Clear all cells in the selection range
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        grid.setCellRaw(r, c, "");
      }
    }

    grid.endTransaction();

    // Save the changes to localStorage
    notifyGridChange();

    forceRefresh();
  }, [selectionRange, grid, forceRefresh, notifyGridChange]);

  const enterEmbeddedGrid = useCallback(() => {
    grid.beginTransaction();
    // Markers / patterns used for embedded grids:
    //  - A cell that starts with "," indicates it has an embedded grid.
    //  - The first cell on the grid (R1C1) can contain '^' plus CSV for parent grid.
    //  - When we enter an embedded grid, the containing cell's contents are replaced with a marker like `<<)1(>>`in the parent CSV.
    //  - When we enter an embedded grid from an embedded grid, the `<<)1(>>`in the parent CSV is replaced with `<<(1),b,<<)2(>>,,(1)>>` where `<<)1(>>` is replaced with `<<(1)` and `(1)>>` and the CSV from the first embedded grid is placed inside with a marker (`<<)2(>>` showing which cell the second embedded grid is in)

    // 1) Get the raw text in the currently active cell
    let initialActiveCellContents = grid
      .getCellRaw(activeRow, activeCol)
      .trim();

    // 2) If it's empty, turn it into a comma cell
    if (!initialActiveCellContents) {
      initialActiveCellContents = ",";
      grid.setCellRaw(activeRow, activeCol, initialActiveCellContents);
    }

    // console.log("initialActiveCellContents", initialActiveCellContents);

    // 3) Only proceed if it starts with a comma (indicating a nested cell)
    if (!initialActiveCellContents.startsWith(",")) {
      return;
    }

    // 4) Determine current depth from R1C1 (top-left cell)
    const initialR1C1CellContents = grid.getCellRaw(1, 1);

    // console.log("initialR1C1CellContents", initialR1C1CellContents);

    let initialDepth = 0;
    if (initialR1C1CellContents.startsWith("^")) {
      // Attempt to see if there's a marker like `^...<<)2(>>...`
      initialDepth = getDepthFromCsv(initialR1C1CellContents);
    }

    // console.log("initialDepth", initialDepth);

    // 5) Insert a marker at the active cell for deeper nesting
    const nextDepth = initialDepth + 1;
    // console.log("nextDepth", nextDepth);

    const activeCellMarkerUsedInNextGrid = `<<)${nextDepth}(>>`;
    // console.log(
    //   "activeCellMarkerUsedInNextGrid",
    //   activeCellMarkerUsedInNextGrid
    // );

    grid.setCellRaw(activeRow, activeCol, activeCellMarkerUsedInNextGrid);
    // console.log(
    //   "setting active cell contents to ",
    //   activeCellMarkerUsedInNextGrid
    // );

    // 6) Convert the entire initial sheet to CSV (excluding the active cell)
    const initialSheetAsCsv = sheetToCsv(grid, true);
    // console.log("initialSheetAsCsv", initialSheetAsCsv);

    // 7) Wipe the entire grid to start fresh
    (grid as any).contentsMap = {};
    (grid as any).formulas = {};

    // console.log("clearing entire grid");

    // 8) Parse the child CSV (just "," for an empty grid) and fill the grid
    const initialActiveCellAsGrid = fromCSV(initialActiveCellContents);
    // console.log("initialActiveCellAsGrid", initialActiveCellAsGrid);

    // console.log("converting grid to initialActiveCellAsGrid");
    arrayToGrid(grid, initialActiveCellAsGrid);

    // console.log("R1C1 is now empty and needs to be populated");

    // 9) Update R1C1 to store the parent CSV correctly
    let nextR1C1Contents: string;
    if (initialDepth === 0) {
      // First-time nesting: store as `^` + CSV
      nextR1C1Contents = `^${initialSheetAsCsv}`;
    } else {
      // Deeper nesting: correctly replace the marker
      nextR1C1Contents = replaceDeepMarkerInWrapper(
        initialR1C1CellContents,
        initialDepth,
        initialSheetAsCsv
      );
    }

    // console.log("nextR1C1Contents:", nextR1C1Contents);
    if (initialDepth === 0 || initialR1C1CellContents.startsWith("^")) {
      // console.log("setting R1C1 to nextR1C1Contents");
      grid.setCellRaw(1, 1, nextR1C1Contents);
    }

    // 10) Move selection to R1C2
    setActiveRow(1);
    setActiveCol(2);
    setSelectionRange({
      startRow: 1,
      endRow: 1,
      startCol: 2,
      endCol: 2,
    });

    scrollCellIntoView(1, 1, rowHeights, colWidths, gridContainerRef.current);

    ctrlAStageRef.current = 0;
    lastCtrlACellRef.current = null;

    grid.endTransaction();

    // 11) Force a refresh of the UI
    forceRefresh();
  }, [
    grid,
    activeRow,
    activeCol,
    forceRefresh,
    setActiveRow,
    setActiveCol,
    setSelectionRange,
  ]);

  const exitEmbeddedGrid = useCallback(() => {
    grid.beginTransaction();
    // 1) Check R1C1. If it doesn't start with '^', there's no parent to return to.
    const initialR1C1Contents = grid.getCellRaw(1, 1);
    if (!initialR1C1Contents.startsWith("^")) {
      return; // Not nested
    }

    // 2) Figure out the current depth
    const initialDepth = getDepthFromCsv(initialR1C1Contents);
    if (initialDepth < 1) {
      // Means we can't go up any further
      return;
    }

    const initialR1C1ContentsWithoutCaret = initialR1C1Contents.substring(1); // remove the '^'

    // 3) Convert the entire *current* sheet to CSV, skipping R1C1 if it starts with '^':
    //    This is the "child CSV" that we want to embed back into the parent.
    let initialGridAsCsv = sheetToCsv(grid, true);
    if (!initialGridAsCsv.trim()) {
      initialGridAsCsv = ","; // Ensure there's at least one empty cell
    }

    // 4) Clear out the entire grid before restoring the parent
    (grid as any).contentsMap = {};
    (grid as any).formulas = {};

    let nextGridAsArray: string[][];
    let nextGridAsCsvWithMarker: string;
    let prevActiveRow = 1;
    let prevActiveCol = 1;

    if (initialDepth === 1) {
      nextGridAsCsvWithMarker = initialR1C1ContentsWithoutCaret;

      // we are returning to the base grid
      const nextGridAsCsvWithInitialGridEmbedded = embedGridIntoR1C1(
        initialR1C1ContentsWithoutCaret,
        initialDepth,
        initialGridAsCsv
      );

      // 7) Parse the parent text (which no longer has '^') and fill the grid
      nextGridAsArray = fromCSV(nextGridAsCsvWithInitialGridEmbedded);
    } else {
      // we are going from an embedded grid back out to another embedded grid

      // Look in the parent CSV (in cell R1C1)
      // and grab out the part of that CSV that represents the next highest level
      // So in the example below, if the currentDepth is 2 then grab out all
      // the CSV between <<(1) and (1)>> since that is the CSV for the next level
      // ^,,,
      // ,,,
      // ,,a,
      // ,,,<<(1),,,
      // ,,,
      // ,,b,
      // ,,,<<)2(>>(1)>>
      const nextDepth = initialDepth - 1;
      const nextGridWithoutTrailer = initialR1C1Contents.split(
        `(${nextDepth})>>`
      )[0]; // Get everything before "(depth)>>"
      nextGridAsCsvWithMarker = nextGridWithoutTrailer.split(
        `<<(${nextDepth})`
      )[1]; // Get everything after "<<(depth)"

      // In our example we now have this CSV for the next grid to replace the current grid
      // ,,,
      // ,,,
      // ,,b,
      // ,,,<<)2(>>

      // but before we can use this CSV to replace the contents of the current grid (level 2)
      // with the contents of the CSV from level 1 (from our example above)
      // we have to replace the <<)2(>> in that CSV with the current grid (level 2) as CSV

      // so first define <<)2(>>
      const initialGridMarker = `<<)${initialDepth}(>>`;
      const initialGridAsCsvEscaped = initialGridAsCsv.replace(/"/g, `""`); // Escape double quotes
      const initialGridAsCsvEscapedAndWrappedInQuotes = `"${initialGridAsCsvEscaped}"`; // Wrap the whole thing in quotes

      // now we need to replace the marker in the initialGridAsCsvEscapedAndWrappedInQuotes
      const initialGridAsCsvEscapedAndWrappedInQuotesWithMarkerReplaced =
        nextGridAsCsvWithMarker.replace(
          initialGridMarker,
          initialGridAsCsvEscapedAndWrappedInQuotes
        );

      // In our example we now have this CSV for the next grid to replace the current grid
      // notice the <<)2(>> has now ben replaced with the current grid converted to CSV
      // ,,,
      // ,,,
      // ,,b,
      // ,,,",c"

      // Now we are almost ready to replace the contents of the initial grid with the next grid.
      //  However, we need to add in the new parent CSV to R1C1 in our next grid

      // So first create that next level parent by replacing (from the parent CSV from our example)

      // <<(1),,,
      // ,,,
      // ,,b,
      // ,,,<<)2(>>(1)>>

      //with just

      // <<)1(>>
      const beginningOfNextInParent = `<<(${nextDepth})`;
      const endOfNextInParent = `(${nextDepth})>>`;
      const nextInParent = `${beginningOfNextInParent}${nextGridAsCsvWithMarker}${endOfNextInParent}`;
      const newNextInParent = `<<)${nextDepth}(>>`;
      const currentParentCsvWithNewNext = initialR1C1Contents.replace(
        nextInParent,
        newNextInParent
      );

      // Make sure we wrap the new parent cell in quotes
      const currentParentCsvWithNewNextWrappedInQuotes = `"${currentParentCsvWithNewNext}"`;

      // Now just add the new parent cell on to the beginning of the newly constructed
      // next level CSV
      const nextGridCsv = `${currentParentCsvWithNewNextWrappedInQuotes}${initialGridAsCsvEscapedAndWrappedInQuotesWithMarkerReplaced}`;

      // Convert back to an array
      nextGridAsArray = fromCSV(nextGridCsv);
    }

    const nextGridWithMarker = fromCSV(nextGridAsCsvWithMarker);

    // Find the position of `initialGridMarker` in `nextGridAsArray`
    for (let r = 0; r < nextGridWithMarker.length; r++) {
      for (let c = 0; c < nextGridWithMarker[r].length; c++) {
        if (nextGridWithMarker[r][c] === `<<)${initialDepth}(>>`) {
          prevActiveRow = r + 1; // Convert to 1-based index
          prevActiveCol = c + 1;
          break;
        }
      }
    }

    // Load the updated grid data
    arrayToGrid(grid, nextGridAsArray);

    // Restore selection to the cell that contained the embedded grid
    setActiveRow(prevActiveRow);
    setActiveCol(prevActiveCol);
    setSelectionRange({
      startRow: prevActiveRow,
      endRow: prevActiveRow,
      startCol: prevActiveCol,
      endCol: prevActiveCol,
    });

    ctrlAStageRef.current = 0;
    lastCtrlACellRef.current = null;

    // Ensure the restored cell is visible
    scrollCellIntoView(
      prevActiveRow,
      prevActiveCol,
      rowHeights,
      colWidths,
      gridContainerRef.current
    );

    grid.endTransaction();

    // 8) Force a refresh
    forceRefresh();
  }, [grid, forceRefresh, setActiveRow, setActiveCol, setSelectionRange]);

  /** Copy/Cut/Paste */
  const copySelection = useCallback(() => {
    const { startRow, endRow, startCol, endCol } = selectionRange;

    // Store the copied range for reference pasting
    setCopiedRange({ startRow, endRow, startCol, endCol });

    // Build a 2D array of the selected cells
    const rows = endRow - startRow + 1;
    const cols = endCol - startCol + 1;
    const out: string[][] = [];
    for (let r = 0; r < rows; r++) {
      out[r] = [];
      for (let c = 0; c < cols; c++) {
        const rr = startRow + r;
        const cc = startCol + c;
        out[r][c] = grid.getCellRaw(rr, cc) || "";
      }
    }

    // Store internally (so we can paste back *inside* the grid)
    setClipboardData(out);
    setIsCutMode(false);

    // Also copy to the actual system clipboard as CSV or TSV,
    // so the user can paste outside the app (e.g. Notepad).
    let textToCopy = "";
    if (currentDelimiter === "tab") {
      textToCopy = toTSV(out);
    } else {
      textToCopy = toCSV(out);
    }

    // Attempt modern async clipboard API
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(console.error);
    } else {
      // Fallback: create a hidden <textarea> and use document.execCommand('copy')
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.style.position = "fixed"; // avoid scrolling to bottom
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (e) {
        console.error("Fallback: Oops, unable to copy", e);
      }
      document.body.removeChild(textarea);
    }
  }, [
    selectionRange,
    grid,
    setClipboardData,
    setIsCutMode,
    currentDelimiter, // be sure it's in the dependency array
  ]);

  const cutSelection = useCallback(() => {
    // Reuse the copy logic to set the system clipboard:
    copySelection();

    // Then clear the original cells:
    const { startRow, endRow, startCol, endCol } = selectionRange;

    grid.beginTransaction();

    const cutArr = collectCellData(
      grid,
      startRow,
      endRow,
      startCol,
      endCol
    ).filter(({ text }) => text.trim() !== "");

    setCutCells(cutArr);
    setCutRange({ startRow, endRow, startCol, endCol });
    setIsCutMode(true);

    grid.endTransaction();
    forceRefresh();
  }, [selectionRange, grid, copySelection, forceRefresh]);

  const pasteSelection = useCallback(async () => {
    try {
      // 1) Read raw text from the system clipboard:
      const textFromClipboard = await navigator.clipboard.readText();
      if (!textFromClipboard) {
        return; // If clipboard is empty, do nothing
      }

      // 2) Decide whether it's tab-delimited or comma-delimited:
      const dataToPaste = textFromClipboard.includes("\t")
        ? fromTSV(textFromClipboard)
        : fromCSV(textFromClipboard);

      if (!dataToPaste) {
        return;
      }

      // 3) The selection rectangle dimensions
      const { startRow, endRow, startCol, endCol } = selectionRange;
      const selRows = endRow - startRow + 1;
      const selCols = endCol - startCol + 1;

      // Begin a transaction so we can undo/redo
      grid.beginTransaction();

      // Track every (row,col) we actually paste into
      const wrotePositions = new Set<string>();

      // --------------------------------------
      // Special Case: Pasting over the exact same range in cut mode
      // --------------------------------------
      if (
        isCutMode &&
        cutRange &&
        cutCells &&
        startRow === cutRange.startRow &&
        endRow === cutRange.endRow &&
        startCol === cutRange.startCol &&
        endCol === cutRange.endCol
      ) {
        // Restore the original cut cells to their original positions
        for (const cell of cutCells) {
          grid.setCellRaw(cell.row, cell.col, cell.text);
          wrotePositions.add(`R${cell.row}C${cell.col}`);
        }
        // Exit cut mode without further changes
        setCutCells(null);
        setCutRange(null);
        setIsCutMode(false);
        grid.endTransaction();
        forceRefresh();
        return;
      }

      // --------------------------------------
      // CASE A: Single selected cell => paste the entire block
      // --------------------------------------
      if (selRows === 1 && selCols === 1) {
        for (let r = 0; r < dataToPaste.length; r++) {
          for (let c = 0; c < dataToPaste[r].length; c++) {
            const rr = startRow + r;
            const cc = startCol + c;

            if (rr === 1 && cc === 1) {
              const r1c1 = grid.getCellRaw(1, 1);
              if (r1c1.trim().startsWith("^")) {
                continue; // skip writing
              }
            }
            if (rr > grid.rowCount) grid.resizeRows(rr);
            if (cc > grid.columnCount) grid.resizeCols(cc);

            LocalStorageManager.saveGrid(grid); // keep row/col changes

            grid.setCellRaw(rr, cc, dataToPaste[r][c]);
            wrotePositions.add(`R${rr}C${cc}`);
          }
        }

        // --------------------------------------
        // CASE B: Multi-cell selection => fill selection rectangle
        // --------------------------------------
      } else {
        const dataRows = dataToPaste.length;
        const dataCols = Math.max(...dataToPaste.map((a) => a.length));

        if (dataRows === 1 && dataCols === 1) {
          const val = dataToPaste[0][0];
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              grid.setCellRaw(r, c, val);
              wrotePositions.add(`R${r}C${c}`);
            }
          }
        } else {
          for (let r = 0; r < Math.min(dataRows, selRows); r++) {
            for (let c = 0; c < Math.min(dataCols, selCols); c++) {
              const rr = startRow + r;
              const cc = startCol + c;
              grid.setCellRaw(rr, cc, dataToPaste[r][c]);
              wrotePositions.add(`R${rr}C${cc}`);
            }
          }
        }
      }

      // --------------------------------------
      // If "Cut" mode was active and pasting to a different range, clear original cells
      // --------------------------------------
      if (isCutMode && cutCells && cutRange) {
        // Update references for cut/paste operation
        if (referenceUpdaterRef.current && cutRange) {
          const rangeMove: RangeMove = {
            fromStartRow: cutRange.startRow,
            fromStartCol: cutRange.startCol,
            fromEndRow: cutRange.endRow,
            fromEndCol: cutRange.endCol,
            toStartRow: startRow,
            toStartCol: startCol,
            toEndRow: startRow + (cutRange.endRow - cutRange.startRow),
            toEndCol: startCol + (cutRange.endCol - cutRange.startCol),
          };
          referenceUpdaterRef.current.updateReferencesForRangeMove(rangeMove);
        }

        for (const cell of cutCells) {
          const cellKey = `R${cell.row}C${cell.col}`;

          // If the cell was NOT written to, clear it
          if (!wrotePositions.has(cellKey)) {
            grid.setCellRaw(cell.row, cell.col, "");
          }
        }

        // Exit cut mode
        setCutCells(null);
        setCutRange(null);
        setIsCutMode(false);
      }

      // End the transaction and refresh
      grid.endTransaction();
      notifyGridChange();
      forceRefresh();
    } catch (err) {
      console.error("Failed to paste from system clipboard:", err);
    }
  }, [
    selectionRange,
    grid,
    isCutMode,
    cutCells,
    cutRange,
    forceRefresh,
    sizingMode,
    gridSizingSettings,
    rowHeights,
    colWidths,
    baseRowHeight,
    baseColWidth,
    zoom,
    notifyGridChange,
  ]);

  const pasteReference = useCallback(() => {
    if (!clipboardData || !copiedRange) {
      console.log("No copied data to paste as reference");
      return;
    }

    // Calculate the offset from the original copy range to the current selection
    const sourceStartRow = copiedRange.startRow;
    const sourceStartCol = copiedRange.startCol;
    const targetStartRow = selectionRange.startRow;
    const targetStartCol = selectionRange.startCol;

    const rowOffset = targetStartRow - sourceStartRow;
    const colOffset = targetStartCol - sourceStartCol;

    // For each cell in the selection range, create a reference formula
    const endRow = Math.min(
      selectionRange.endRow,
      selectionRange.startRow + (copiedRange.endRow - copiedRange.startRow)
    );
    const endCol = Math.min(
      selectionRange.endCol,
      selectionRange.startCol + (copiedRange.endCol - copiedRange.startCol)
    );

    grid.beginTransaction();

    for (let r = selectionRange.startRow; r <= endRow; r++) {
      for (let c = selectionRange.startCol; c <= endCol; c++) {
        // Calculate the corresponding source cell
        const sourceRow = r - rowOffset;
        const sourceCol = c - colOffset;

        // Create reference formula pointing to the source cell
        const referenceFormula = `=R${sourceRow}C${sourceCol}`;

        // Update the target cell with the reference formula
        grid.setCellRaw(r, c, referenceFormula);
      }
    }

    grid.endTransaction();
    console.log(
      `Pasted references from R${sourceStartRow}C${sourceStartCol}:R${copiedRange.endRow}C${copiedRange.endCol} to R${targetStartRow}C${targetStartCol}:R${endRow}C${endCol}`
    );

    // Save the changes to localStorage
    notifyGridChange();

    forceRefresh();
  }, [
    clipboardData,
    copiedRange,
    selectionRange,
    grid,
    forceRefresh,
    notifyGridChange,
  ]);

  // Main keydown
  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (fullscreenEditing) {
        // If user pressed ESC => discard
        if (e.key === "Escape") {
          e.preventDefault();
          discardFullscreenChanges();
        }
        // If user pressed Ctrl+Enter => commit
        else if (e.key === "Enter" && e.ctrlKey) {
          e.preventDefault();
          commitFullscreenChanges();
        }
        // If user typed a normal character => append to tempValue
        else if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
          e.preventDefault();
          setFullscreenEditing((prev) =>
            prev ? { ...prev, tempValue: prev.tempValue + e.key } : null
          );
        }
        // If user pressed Backspace => remove last char
        else if (e.key === "Backspace") {
          e.preventDefault();
          setFullscreenEditing((prev) =>
            prev ? { ...prev, tempValue: prev.tempValue.slice(0, -1) } : null
          );
        }
        // Plain Enter => do nothing (stay in full-screen mode)
        return;
      }

      if (editingCell) {
        // When editing a cell, let the input field handle typing naturally
        // Only intercept special navigation and control keys
        if (e.key === "Enter") {
          // Enter should commit the edit - let CellView handle this
          return;
        } else if (e.key === "Escape") {
          // Escape should cancel the edit - let CellView handle this
          return;
        } else if (e.key === "Tab") {
          // Tab should move to next cell - handle this here
          e.preventDefault();
          if (e.shiftKey) {
            arrowNav("ArrowLeft");
          } else {
            arrowNav("ArrowRight");
          }
          return;
        }
        // For all other keys (including regular typing), let the input field handle them
        return;
      }

      // Ctrl+Z => Undo
      if ((e.key === "z" || e.key === "Z") && e.ctrlKey) {
        e.preventDefault();
        grid.undo();
        forceRefresh();
        return;
      }
      // Ctrl+Y => Redo
      if ((e.key === "y" || e.key === "Y") && e.ctrlKey) {
        e.preventDefault();
        grid.redo();
        forceRefresh();
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();

        // Move one column right, or left if Shift is held
        if (e.shiftKey) {
          arrowNav("ArrowLeft"); // your existing logic that moves left
        } else {
          arrowNav("ArrowRight"); // your existing logic that moves right
        }
        return; // Done, skip further logic
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey && e.ctrlKey) {
          handleKeyboardNav(activeRow, activeCol, "down-left");
        } else if (e.shiftKey) {
          handleKeyboardNav(activeRow, activeCol, "down-right");
        } else {
          handleKeyboardNav(activeRow, activeCol, "down");
        }
        return;
      }

      // Not editing yet
      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        if (activeRow === 1 && activeCol === 1) {
          const r1c1 = grid.getCellRaw(1, 1);
          if (r1c1.trim().startsWith("^")) {
            return; // skip
          }
        }

        // first typed char => start editing
        e.preventDefault();
        setEditingCell({ row: activeRow, col: activeCol });
        setEditingValue(e.key);
        setFocusTarget("cell");
        measureAndExpand(activeRow, activeCol, e.key);
        return;
      }

      if (e.key.startsWith("Arrow")) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // move block
          const allowMerge = e.altKey;
          moveBlock(e.key, allowMerge);
        } else if (e.altKey) {
          e.preventDefault();
          selectNearestBlock(e.key);
        } else if (e.shiftKey) {
          e.preventDefault();
          extendSelection(e.key);
        } else {
          e.preventDefault();
          arrowNav(e.key);
        }
      } else if (e.key === "Delete") {
        e.preventDefault();
        clearSelectedCells();
      } else if (e.key === "F2" && e.shiftKey) {
        e.preventDefault();
        const rawText = grid.getCellRaw(activeRow, activeCol);
        setFullscreenEditing({
          row: activeRow,
          col: activeCol,
          originalValue: rawText,
          tempValue: rawText,
        });
        return;
      } else if (e.key === "F2") {
        e.preventDefault();
        handleCellDoubleClick(activeRow, activeCol);
      } else if (e.key === "F4") {
        e.preventDefault();
        enterEmbeddedGrid();
      } else if (e.key === "Escape") {
        e.preventDefault();
        // Cancel block dragging if active
        if (isDraggingBlock) {
          cancelBlockDrag();
        } else {
          exitEmbeddedGrid();
        }
      }
      // Copy/Cut/Paste
      else if ((e.key === "c" || e.key === "C") && e.ctrlKey) {
        e.preventDefault();
        copySelection();
      } else if ((e.key === "x" || e.key === "X") && e.ctrlKey) {
        e.preventDefault();
        cutSelection();
      } else if ((e.key === "v" || e.key === "V") && e.ctrlKey) {
        e.preventDefault();
        if (e.shiftKey) {
          // Ctrl+Shift+V => Paste Reference
          pasteReference();
        } else {
          // Ctrl+V => Regular paste
          (async () => {
            await pasteSelection();
          })();
        }
      } else if ((e.key === "a" || e.key === "A") && e.ctrlKey) {
        e.preventDefault();
        // Our new progressive function:
        handleCtrlA(e);
      }
      // Toggle structural formatting
      else if (e.key === "~" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setFormattingDisabled((prev) => {
          const newValue = !prev;
          // If we're enabling formatting, force a reparse to regenerate styles
          if (!newValue) {
            setTimeout(() => reparse(), 0);
          }
          return newValue;
        });
        forceRefresh();
      } else if ((e.key === "s" || e.key === "S") && e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        saveGridToFile();
        return;
      }
      // Another fallback for normal typed char
      else if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        e.preventDefault();
        setEditingCell({ row: activeRow, col: activeCol });
        setFocusTarget("cell");
        setEditingValue(e.key);
        measureAndExpand(activeRow, activeCol, e.key);
      }
    },
    [
      editingCell,
      activeRow,
      activeCol,
      measureAndExpand,
      arrowNav,
      extendSelection,
      moveBlock,
      selectNearestBlock,
      clearSelectedCells,
      enterEmbeddedGrid,
      exitEmbeddedGrid,
      copySelection,
      cutSelection,
      pasteSelection,
      setFormattingDisabled,
      forceRefresh,
      fullscreenEditing,
      discardFullscreenChanges,
      commitFullscreenChanges,
      isDraggingBlock,
      cancelBlockDrag,
      pasteReference,
    ]
  );

  // Formula bar logic
  const isEditingActiveCell =
    editingCell &&
    editingCell.row === activeRow &&
    editingCell.col === activeCol;
  const cellRaw = grid.getCellRaw(activeRow, activeCol);
  const formulaText = isEditingActiveCell ? editingValue : cellRaw;

  const onFormulaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFocusTarget("formula");
      if (!isEditingActiveCell) {
        setEditingCell({ row: activeRow, col: activeCol });
      }
      const newVal = e.target.value;
      setEditingValue(newVal);
      measureAndExpand(activeRow, activeCol, newVal);
    },
    [isEditingActiveCell, activeRow, activeCol, measureAndExpand]
  );

  const onFormulaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!editingCell) return;
      if (e.key === "Enter") {
        e.preventDefault();
        commitEdit(editingCell.row, editingCell.col, editingValue);
      } else if (e.key === "Escape") {
        e.preventDefault();
        commitEdit(editingCell.row, editingCell.col, cellRaw, { escape: true });
      }
    },
    [editingCell, editingValue, cellRaw, commitEdit]
  );

  // total grid dimension
  const totalGridWidth = useMemo(
    () => colWidths.reduce((a, b) => a + b, 0),
    [colWidths]
  );
  const totalGridHeight = useMemo(
    () => rowHeights.reduce((a, b) => a + b, 0),
    [rowHeights]
  );

  const addressText = `R${activeRow}C${activeCol}`;

  function openModal() {
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }

  function clearGrid() {
    grid.clearAllCells();

    forceRefresh();
  }
  function saveGridToFile() {
    const filledCells = grid.getFilledCells();
    if (filledCells.length === 0) return;

    let maxRowUsed = 0,
      maxColUsed = 0;
    for (const { row, col } of filledCells) {
      maxRowUsed = Math.max(maxRowUsed, row);
      maxColUsed = Math.max(maxColUsed, col);
    }

    const arr = Array.from({ length: maxRowUsed }, () =>
      Array(maxColUsed).fill("")
    );
    for (const { row, col, value } of filledCells) {
      arr[row - 1][col - 1] = value;
    }

    const text = currentDelimiter === "tab" ? toTSV(arr) : toCSV(arr);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });

    // Generate the timestamped filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:]/g, "").split(".")[0]; // Format YYYYMMDD_HHMMSS
    const fileExtension = currentDelimiter === "tab" ? "tsv" : "csv";
    const fileName = `${grid.name}___${timestamp}.${fileExtension}`;

    const link = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: fileName,
    });
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function loadGridFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      if (!target?.result) return;
      const content = target.result as string;

      const isTab = file.name.endsWith(".tsv") || content.includes("\t");

      const arr = isTab ? fromTSV(content) : fromCSV(content);

      const neededRows = arr.length;
      const neededCols = Math.max(...arr.map((row) => row.length), 0);

      grid.resizeRows(Math.max(grid.rowCount, neededRows));
      grid.resizeCols(Math.max(grid.columnCount, neededCols));

      grid.clearAllCells(true);

      // Set grid.name to the filename without everything after and including the three underscores
      const baseName = file.name.replace(/\.\w+$/, ""); // remove extension
      grid.name = baseName.split("___")[0];

      grid.beginTransaction();
      for (let r = 0; r < neededRows; r++) {
        for (let c = 0; c < arr[r].length; c++) {
          const val = arr[r][c].trim();
          if (val) grid.setCellRaw(r + 1, c + 1, val);
        }
      }
      grid.endTransaction();

      // Save to localStorage to ensure grid name and dimensions persist
      if (autoLoadLocalStorage) {
        LocalStorageManager.saveGrid(grid);
      }

      // Trigger UI refresh to reflect the updated grid name
      forceRefresh();
      if (onGridChange) {
        onGridChange(grid);
      }
    };
    reader.readAsText(file);
  }

  function loadExample(ex) {
    try {
      // Content is now directly available, no need to fetch
      const content = ex.content;
      const delim = content.includes("\t") ? "\t" : ",";
      const arr = delim === "\t" ? fromTSV(content) : fromCSV(content);

      const neededRows = arr.length;
      const neededCols = Math.max(...arr.map((row) => row.length), 0);

      grid.resizeRows(Math.max(grid.rowCount, neededRows));
      grid.resizeCols(Math.max(grid.columnCount, neededCols));

      clearGrid();

      grid.beginTransaction();

      for (let r = 0; r < neededRows; r++) {
        for (let c = 0; c < arr[r].length; c++) {
          const val = arr[r][c].trim();
          if (val) grid.setCellRaw(r + 1, c + 1, val);
        }
      }

      grid.endTransaction();

      forceRefresh();
    } catch (err) {
      console.error("Failed to load example", err);
    }
  }

  const onChangeDimensions = (newRowCount, newColCount) => {
    // If user is trying to shrink row/col counts, check for filled cells
    if (newRowCount < grid.rowCount || newColCount < grid.columnCount) {
      const filled = grid.getFilledCells();
      const wouldBeDeleted = filled.filter(
        (cell) => cell.row > newRowCount || cell.col > newColCount
      );
      if (wouldBeDeleted.length > 0) {
        const ok = window.confirm(
          "Reducing rows/columns will delete some filled cells. Are you sure?"
        );
        if (!ok) {
          return; // user cancelled
        }
        grid.beginTransaction();
        // Actually remove those cells from the grid
        for (const cell of wouldBeDeleted) {
          grid.setCellRaw(cell.row, cell.col, "");
        }
        grid.endTransaction();
      }
    }

    // Then do the resizing
    grid.resizeRows(newRowCount);
    grid.resizeCols(newColCount);

    // Save the updated dimensions to localStorage to ensure they persist
    if (autoLoadLocalStorage) {
      LocalStorageManager.saveGrid(grid);
    }

    // Notify parent component about the change
    if (onGridChange) {
      onGridChange(grid);
    }

    forceRefresh(); // re-render
  };

  const handleGridScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const gridContainer = e.currentTarget;

      if (!gridContainer) return;

      const scrollTop = gridContainer.scrollTop;
      const scrollLeft = gridContainer.scrollLeft;

      // Find the row and column indices for the current scroll position
      // Note that these functions return 1-based indices (not 0-based)
      const row = findFirstRowInView(scrollTop, rowHeights);
      const col = findFirstRowInView(scrollLeft, colWidths);

      // If we have a valid row and column, save them to the grid
      if (row > 0 && col > 0) {
        const topLeftCell = { row, col };
        grid.topLeftCell = topLeftCell;
        notifyGridChange();
      }
    },
    [rowHeights, colWidths, grid, notifyGridChange]
  );

  // Update the updateCellValue function
  const updateCellValue = (
    r: number,
    c: number,
    newValue: string,
    options: { saveToLocalStorage?: boolean } = {}
  ) => {
    const { saveToLocalStorage = true } = options;

    // Update the cell in the data model
    grid.setCellRaw(r, c, newValue);

    // If we should save (usually true)
    if (saveToLocalStorage) {
      notifyGridChange();
    }

    // Always force UI refresh
    forceRefresh();
  };

  // Add a helper function to calculate scroll position
  const calculateScrollPosition = (index: number, sizes: number[]): number => {
    return calculateCumulativePosition(index, sizes);
  };

  // Add an effect to restore scroll position when the grid changes (for tab switching)
  useEffect(() => {
    // Only run this effect if we have a grid with a saved topLeftCell
    if (grid && grid.topLeftCell && gridContainerRef.current) {
      // console.log(
      //   "Grid changed, restoring scroll position to:",
      //   grid.topLeftCell
      // );

      // Calculate scroll position based on the current rowHeights and colWidths
      const scrollTop = calculateScrollPosition(
        grid.topLeftCell.row,
        rowHeights
      );
      const scrollLeft = calculateScrollPosition(
        grid.topLeftCell.col,
        colWidths
      );

      // console.log("Calculated scroll position for grid change:", {
      //   scrollTop,
      //   scrollLeft,
      // });

      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        if (gridContainerRef.current) {
          gridContainerRef.current.scrollTop = scrollTop;
          gridContainerRef.current.scrollLeft = scrollLeft;
        }
      });
    }
  }, [grid, rowHeights, colWidths]);

  // Calculate viewport bounds for minimap
  const calculateViewportBounds = useCallback(() => {
    const container = gridContainerRef.current;
    if (!container) {
      return { top: 1, left: 1, bottom: 10, right: 10 };
    }

    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;

    // Find which rows and columns are visible
    let topRow = 1;
    let leftCol = 1;
    let bottomRow = 1;
    let rightCol = 1;

    // Calculate top row
    let currentHeight = 0;
    for (let i = 0; i < rowHeights.length; i++) {
      if (currentHeight + rowHeights[i] > scrollTop) {
        topRow = i + 1;
        break;
      }
      currentHeight += rowHeights[i];
    }

    // Calculate bottom row
    currentHeight = 0;
    for (let i = 0; i < rowHeights.length; i++) {
      currentHeight += rowHeights[i];
      if (currentHeight >= scrollTop + containerHeight) {
        bottomRow = i + 1;
        break;
      }
    }
    if (bottomRow === 1) bottomRow = rowHeights.length;

    // Calculate left column
    let currentWidth = 0;
    for (let i = 0; i < colWidths.length; i++) {
      if (currentWidth + colWidths[i] > scrollLeft) {
        leftCol = i + 1;
        break;
      }
      currentWidth += colWidths[i];
    }

    // Calculate right column
    currentWidth = 0;
    for (let i = 0; i < colWidths.length; i++) {
      currentWidth += colWidths[i];
      if (currentWidth >= scrollLeft + containerWidth) {
        rightCol = i + 1;
        break;
      }
    }
    if (rightCol === 1) rightCol = colWidths.length;

    return {
      top: topRow,
      left: leftCol,
      bottom: bottomRow,
      right: rightCol,
    };
  }, [rowHeights, colWidths]);

  // Calculate grid bounds that encompass all blocks
  const calculateGridBounds = useCallback(() => {
    const blocks = blockListRef.current;
    if (blocks.length === 0) {
      return { minRow: 1, maxRow: 10, minCol: 1, maxCol: 10 };
    }

    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    blocks.forEach((block) => {
      minRow = Math.min(minRow, block.topRow);
      maxRow = Math.max(maxRow, block.bottomRow);
      minCol = Math.min(minCol, block.leftCol);
      maxCol = Math.max(maxCol, block.rightCol);
    });

    return { minRow, maxRow, minCol, maxCol };
  }, []);

  // Handle viewport change from minimap
  const handleMinimapViewportChange = useCallback(
    (newBounds: {
      top: number;
      left: number;
      bottom: number;
      right: number;
    }) => {
      const container = gridContainerRef.current;
      if (!container) return;

      // Calculate scroll position to center the viewport on the new bounds
      const targetRow = Math.floor((newBounds.top + newBounds.bottom) / 2);
      const targetCol = Math.floor((newBounds.left + newBounds.right) / 2);

      const scrollTop = calculateScrollPosition(targetRow, rowHeights);
      const scrollLeft = calculateScrollPosition(targetCol, colWidths);

      // Adjust to center the viewport
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;

      container.scrollTop = Math.max(0, scrollTop - containerHeight / 2);
      container.scrollLeft = Math.max(0, scrollLeft - containerWidth / 2);
    },
    [rowHeights, colWidths]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideHandleTimeoutRef.current) {
        clearTimeout(hideHandleTimeoutRef.current);
      }
      if (showHandleTimeoutRef.current) {
        clearTimeout(showHandleTimeoutRef.current);
      }
    };
  }, []);

  // Load sizing settings from localStorage
  useEffect(() => {
    if (autoLoadLocalStorage) {
      const settings = LocalStorageManager.loadGridSizing(grid.index);
      if (settings) {
        setSizingModeState(settings.sizingMode);
        setGridSizingSettings(settings);
      } else {
        // Use default settings if none exist
        const defaultSettings = LocalStorageManager.getDefaultGridSizing(
          grid.rowCount,
          grid.columnCount,
          baseRowHeight * zoom,
          baseColWidth * zoom
        );
        setSizingModeState(defaultSettings.sizingMode);
        setGridSizingSettings(defaultSettings);
      }
    }
  }, [
    autoLoadLocalStorage,
    grid.index,
    grid.rowCount,
    grid.columnCount,
    baseRowHeight,
    baseColWidth,
    zoom,
  ]);

  // Sync React state with grid model's sizing settings when grid changes
  // This handles the case where autoLoadLocalStorage is false but the grid
  // has sizing settings loaded from its persisted state
  useEffect(() => {
    if (grid.sizingSettings) {
      console.log("Syncing sizing state from grid model:", grid.sizingSettings);
      setSizingModeState(grid.sizingSettings.sizingMode);
      setGridSizingSettings(grid.sizingSettings);
    } else if (!autoLoadLocalStorage) {
      // If no settings exist and autoLoadLocalStorage is false, create defaults
      const defaultSettings = LocalStorageManager.getDefaultGridSizing(
        grid.rowCount,
        grid.columnCount,
        baseRowHeight * zoom,
        baseColWidth * zoom
      );
      console.log(
        "Creating default sizing settings for grid:",
        defaultSettings
      );
      setSizingModeState(defaultSettings.sizingMode);
      setGridSizingSettings(defaultSettings);
      // Also set it on the grid model so it's available next time
      grid.sizingSettings = defaultSettings;
    }
  }, [
    grid,
    grid.sizingSettings,
    autoLoadLocalStorage,
    baseRowHeight,
    baseColWidth,
    zoom,
  ]);

  // Sync local sizing state when grid.sizingSettings changes (e.g., from localStorage load)
  useEffect(() => {
    if (grid.sizingSettings && grid.sizingSettings.sizingMode === "grid") {
      console.log(
        "Syncing sizing state from grid.sizingSettings:",
        grid.sizingSettings
      );

      if (
        grid.sizingSettings.rowHeights &&
        grid.sizingSettings.rowHeights.length === grid.rowCount
      ) {
        setRowHeights(grid.sizingSettings.rowHeights);
      }

      if (
        grid.sizingSettings.colWidths &&
        grid.sizingSettings.colWidths.length === grid.columnCount
      ) {
        setColWidths(grid.sizingSettings.colWidths);
      }

      setGridSizingSettings(grid.sizingSettings);
      setSizingModeState(grid.sizingSettings.sizingMode);
    }
  }, [grid.sizingSettings, grid.rowCount, grid.columnCount]);

  // Column resize handler
  const handleColumnResize = useCallback(
    (columnIndex: number, newWidth: number) => {
      console.log(
        `🔧 Resizing column ${columnIndex} to width ${newWidth}, sizingMode: ${sizingMode}`
      );

      if (sizingMode === "grid") {
        // Update grid-wide column width
        setColWidths((prev) => {
          const newWidths = [...prev];
          newWidths[columnIndex - 1] = newWidth;

          // Update the grid sizing settings to persist the change
          const updatedSettings: GridSizingSettings = {
            ...gridSizingSettings,
            sizingMode: "grid",
            rowHeights: rowHeights,
            colWidths: newWidths,
            cellFormats: gridSizingSettings?.cellFormats || {},
          };

          // Save to grid model and localStorage
          grid.sizingSettings = updatedSettings;
          setGridSizingSettings(updatedSettings);
          notifyGridChange();

          return newWidths;
        });
      } else {
        // In "cell" mode: store dimensions for filled cells and update grid immediately
        console.log(
          `📏 Cell mode: storing widths for filled cells in column ${columnIndex}`
        );

        setGridSizingSettings((prev) => {
          if (!prev) return prev;
          const newSettings = { ...prev };

          // Store the width for all filled cells in this column
          const filledCells = grid.getFilledCells();
          console.log(`📋 Found ${filledCells.length} filled cells total`);

          let cellsInColumn = 0;
          for (const { row, col } of filledCells) {
            if (col === columnIndex) {
              cellsInColumn++;
              const cellKey = `R${row}C${columnIndex}`;
              const existingFormat =
                newSettings.cellFormats[cellKey] || new CellFormat();
              newSettings.cellFormats[cellKey] = new CellFormat({
                ...existingFormat,
                width: newWidth,
                lastWidthSource: "manual",
              });
              console.log(`💾 Stored width ${newWidth} for cell ${cellKey}`);
            }
          }

          console.log(
            `📊 Updated ${cellsInColumn} cells in column ${columnIndex}`
          );
          console.log(
            `🗂️ Total cell formats now:`,
            Object.keys(newSettings.cellFormats).length
          );

          // Save to grid model and localStorage
          grid.sizingSettings = newSettings;
          notifyGridChange();

          return newSettings;
        });

        // Update the column width immediately for visual feedback
        setColWidths((prev) => {
          const newWidths = [...prev];
          newWidths[columnIndex - 1] = newWidth;
          console.log(
            `🎨 Updated column ${columnIndex} visual width to ${newWidth}`
          );
          return newWidths;
        });
      }
    },
    [sizingMode, grid, gridSizingSettings, rowHeights, notifyGridChange]
  );

  // Row resize handler
  const handleRowResize = useCallback(
    (rowIndex: number, newHeight: number) => {
      console.log(`Resizing row ${rowIndex} to height ${newHeight}`);

      if (sizingMode === "grid") {
        // Update grid-wide row height
        setRowHeights((prev) => {
          const newHeights = [...prev];
          newHeights[rowIndex - 1] = newHeight;

          // Update the grid sizing settings to persist the change
          const updatedSettings: GridSizingSettings = {
            ...gridSizingSettings,
            sizingMode: "grid",
            rowHeights: newHeights,
            colWidths: colWidths,
            cellFormats: gridSizingSettings?.cellFormats || {},
          };

          // Save to grid model and localStorage
          grid.sizingSettings = updatedSettings;
          setGridSizingSettings(updatedSettings);
          notifyGridChange();

          return newHeights;
        });
      } else {
        // In "cell" mode: store dimensions for filled cells and update grid immediately
        setGridSizingSettings((prev) => {
          if (!prev) return prev;
          const newSettings = { ...prev };

          // Store the height for all filled cells in this row
          const filledCells = grid.getFilledCells();
          for (const { row, col } of filledCells) {
            if (row === rowIndex) {
              const cellKey = `R${rowIndex}C${col}`;
              const existingFormat =
                newSettings.cellFormats[cellKey] || new CellFormat();
              newSettings.cellFormats[cellKey] = new CellFormat({
                ...existingFormat,
                height: newHeight,
                lastHeightSource: "manual",
              });
            }
          }

          // Save to grid model and localStorage
          grid.sizingSettings = newSettings;
          notifyGridChange();

          return newSettings;
        });

        // Update the row height immediately for visual feedback
        setRowHeights((prev) => {
          const newHeights = [...prev];
          newHeights[rowIndex - 1] = newHeight;
          return newHeights;
        });
      }
    },
    [sizingMode, grid, gridSizingSettings, colWidths, notifyGridChange]
  );

  // Auto-resize handlers
  const handleColumnAutoResize = useCallback(
    (columnIndex: number) => {
      // Calculate optimal width based on content
      let maxWidth = baseColWidth * zoom;
      let hasContent = false;

      for (let row = 1; row <= grid.rowCount; row++) {
        const content = grid.getCellRaw(row, columnIndex);
        if (content && content.trim()) {
          hasContent = true;
          // Estimate width based on content length and font size
          const estimatedWidth = Math.min(
            content.length * fontSize * 0.6 + 20,
            Math.min(3 * baseColWidth * zoom, 300)
          );
          maxWidth = Math.max(maxWidth, estimatedWidth);
        }
      }

      // If the column is empty or has no meaningful content, use the base width
      if (!hasContent) {
        maxWidth = baseColWidth * zoom;
      }

      handleColumnResize(columnIndex, maxWidth);
    },
    [baseColWidth, zoom, grid, fontSize, handleColumnResize]
  );

  const handleRowAutoResize = useCallback(
    (rowIndex: number) => {
      // Calculate optimal height based on content
      let maxHeight = baseRowHeight * zoom;

      for (let col = 1; col <= grid.columnCount; col++) {
        const content = grid.getCellRaw(rowIndex, col);
        if (content && content.trim()) {
          // Get the current column width to account for text wrapping
          const columnWidth = colWidths[col - 1] || baseColWidth * zoom;

          // Count explicit line breaks
          const explicitLines = content.split("\n");
          let totalLines = 0;

          // For each line, calculate how many display lines it will need based on wrapping
          explicitLines.forEach((line) => {
            if (line.trim() === "") {
              // Empty lines still take up space
              totalLines += 1;
            } else {
              // Estimate how many lines this content will wrap to
              const avgCharWidth = fontSize * 0.6;
              const availableWidth = columnWidth - 16; // Account for padding
              const charsPerLine = Math.max(
                1,
                Math.floor(availableWidth / avgCharWidth)
              );
              const wrappedLines = Math.ceil(line.length / charsPerLine);
              totalLines += Math.max(1, wrappedLines);
            }
          });

          // Calculate height with proper line spacing and padding
          // Use 1.4 line height (typical for good readability) + padding
          const lineHeight = fontSize * 1.4;
          const estimatedHeight = Math.min(
            totalLines * lineHeight + 16, // 16px total padding (8px top + 8px bottom)
            8 * baseRowHeight * zoom // Cap at 8x base height for very long content
          );

          maxHeight = Math.max(maxHeight, estimatedHeight);
        }
      }

      handleRowResize(rowIndex, maxHeight);
    },
    [
      baseRowHeight,
      zoom,
      grid,
      fontSize,
      handleRowResize,
      colWidths,
      baseColWidth,
    ]
  );

  // Auto-resize after editing
  const autoResizeAfterEdit = useCallback(
    (row: number, col: number, content: string) => {
      if (!content) return;

      // Auto-resize column
      const estimatedWidth = Math.min(
        content.length * fontSize * 0.6 + 20,
        Math.min(3 * baseColWidth * zoom, 300)
      );

      if (estimatedWidth > colWidths[col - 1]) {
        handleColumnResize(col, estimatedWidth);
      }

      // Auto-resize row if content has line breaks or is long
      if (content.includes("\n") || content.length > 30) {
        // Get the current column width to account for text wrapping
        const columnWidth = colWidths[col - 1] || baseColWidth * zoom;

        // Count explicit line breaks
        const explicitLines = content.split("\n");
        let totalLines = 0;

        // For each line, calculate how many display lines it will need based on wrapping
        explicitLines.forEach((line) => {
          if (line.trim() === "") {
            // Empty lines still take up space
            totalLines += 1;
          } else {
            // Estimate how many lines this content will wrap to
            const avgCharWidth = fontSize * 0.6;
            const availableWidth = columnWidth - 16; // Account for padding
            const charsPerLine = Math.max(
              1,
              Math.floor(availableWidth / avgCharWidth)
            );
            const wrappedLines = Math.ceil(line.length / charsPerLine);
            totalLines += Math.max(1, wrappedLines);
          }
        });

        // Calculate height with proper line spacing and padding
        const lineHeight = fontSize * 1.4;
        const estimatedHeight = Math.min(
          totalLines * lineHeight + 16, // 16px total padding
          8 * baseRowHeight * zoom // Cap at 8x base height
        );

        if (estimatedHeight > rowHeights[row - 1]) {
          handleRowResize(row, estimatedHeight);
        }
      }
    },
    [
      fontSize,
      baseColWidth,
      baseRowHeight,
      zoom,
      colWidths,
      rowHeights,
      handleColumnResize,
      handleRowResize,
    ]
  );

  // Handle default size changes
  // handleChangeDefaultSizes is now passed as a prop from parent component

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] =
    useState<AppearanceSettings>(() => {
      // Always load appearance settings since they're user preferences
      return LocalStorageManager.loadAppearanceSettings(grid.index);
    });

  // Handle appearance settings change
  const handleAppearanceSettingsChange = useCallback(
    (newSettings: AppearanceSettings) => {
      console.log(
        `🎯 GridView handleAppearanceSettingsChange called for grid ${grid.index}:`,
        newSettings
      );

      setAppearanceSettings(newSettings);

      // Always save appearance settings to localStorage since they're user preferences
      // that should persist regardless of autoLoadLocalStorage setting
      console.log(`💾 Always saving appearance settings to localStorage`);
      LocalStorageManager.saveAppearanceSettings(grid.index, newSettings);

      // Apply styles immediately
      console.log(`🎨 Applying styles with StyleManager`);
      StyleManager.updateStyles(newSettings);

      // Trigger style update
      console.log(`🔄 Triggering forceRefresh()`);
      forceRefresh();
    },
    [grid.index, forceRefresh]
  );

  // Load appearance settings when grid changes
  useEffect(() => {
    // Always load appearance settings since they're user preferences
    const settings = LocalStorageManager.loadAppearanceSettings(grid.index);
    setAppearanceSettings(settings);
    // Apply styles when loading
    StyleManager.updateStyles(settings);
  }, [grid.index]);

  // Apply styles when appearance settings change
  useEffect(() => {
    StyleManager.updateStyles(appearanceSettings);
  }, [appearanceSettings]);

  // Initialize styles on mount
  useEffect(() => {
    StyleManager.updateStyles(appearanceSettings);

    // Cleanup on unmount
    return () => {
      // Don't cleanup styles here as other grids might be using them
      // StyleManager.cleanup();
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden textrux-grid ${className}`}
      style={{ width, height, ...style }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
          // Check if it's a CSV or TSV file
          if (
            file.name.endsWith(".csv") ||
            file.name.endsWith(".tsv") ||
            file.type === "text/csv" ||
            file.type === "text/tab-separated-values"
          ) {
            // If we have the onLoadFileToNewGrid prop, use it to create a new grid tab
            if (onLoadFileToNewGrid) {
              onLoadFileToNewGrid(file);
            } else {
              // Fallback to the old behavior if the parent component doesn't support the new functionality
              loadGridFromFile(file);
            }
          } else {
            // For non-CSV/TSV files, continue with the existing behavior
            loadGridFromFile(file);
          }
        }
      }}
      onScroll={handleGridScroll}
    >
      {/* Formula bar */}
      <FormulaBar
        address={`R${activeRow}C${activeCol}`}
        formulaText={formulaText}
        onFormulaChange={onFormulaChange}
        onFormulaKeyDown={(e) => onFormulaKeyDown(e)}
        onFocus={() => {
          if (isR1C1Locked) return;
          setFocusTarget("formula");
          if (!editingCell) {
            setEditingCell({ row: activeRow, col: activeCol });
          }
        }}
        onGearClick={() => setModalOpen(true)}
        disabled={isR1C1Locked}
      />

      {/* Main area */}
      <div
        className="absolute left-0 right-0 bottom-[35px]"
        style={{ top: "3rem", overflow: "hidden" }}
      >
        {/* top-left corner cell */}
        <div
          className="absolute top-0 left-0 bg-gray-200 dark:bg-gray-700 border-b border-r border-gray-600 dark:border-gray-600 flex items-center justify-center z-10 dark:text-gray-100"
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
          onColumnResize={handleColumnResize}
          onColumnAutoResize={handleColumnAutoResize}
          zoom={zoom}
        />

        <RowHeaders
          grid={grid}
          rowHeights={rowHeights}
          colWidths={colWidths}
          fontSize={baseFontSize * zoom}
          version={version}
          gridContainerRef={gridContainerRef}
          onRowResize={handleRowResize}
          onRowAutoResize={handleRowAutoResize}
          zoom={zoom}
        />

        <div
          ref={gridContainerRef}
          className="absolute top-[30px] left-[50px] right-0 bottom-0 overflow-auto bg-white noselect"
          onMouseDown={onGridContainerMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onKeyDown={handleContainerKeyDown}
          onMouseMove={(e) => {
            // Don't show reference handle if we're dragging something
            if (
              isDraggingBlock ||
              isDraggingReference ||
              dragSelectRef.current.active
            ) {
              setShowReferenceHandle(false);
              // Clear any pending show/hide timeouts
              if (showHandleTimeoutRef.current) {
                clearTimeout(showHandleTimeoutRef.current);
                showHandleTimeoutRef.current = undefined;
              }
              if (hideHandleTimeoutRef.current) {
                clearTimeout(hideHandleTimeoutRef.current);
                hideHandleTimeoutRef.current = undefined;
              }
              return;
            }

            const container = gridContainerRef.current;
            if (!container) return;

            // Check if we're hovering over the reference handle or its close vicinity
            const target = e.target as HTMLElement;
            if (
              target.classList.contains("reference-handle") ||
              target.closest(".reference-handle") ||
              isHoveringHandle
            ) {
              // Clear any pending hide timeout and keep handle visible
              if (hideHandleTimeoutRef.current) {
                clearTimeout(hideHandleTimeoutRef.current);
                hideHandleTimeoutRef.current = undefined;
              }
              return;
            }

            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left + container.scrollLeft;
            const y = e.clientY - rect.top + container.scrollTop;

            const hoveredRow = findRowByY(y, rowHeights);
            const hoveredCol = findColByX(x, colWidths);

            // Check if mouse is over the current selection
            const isOverSelection =
              hoveredRow >= selectionRange.startRow &&
              hoveredRow <= selectionRange.endRow &&
              hoveredCol >= selectionRange.startCol &&
              hoveredCol <= selectionRange.endCol;

            if (isOverSelection) {
              // Clear any pending hide timeout
              if (hideHandleTimeoutRef.current) {
                clearTimeout(hideHandleTimeoutRef.current);
                hideHandleTimeoutRef.current = undefined;
              }

              // Only start show timeout if handle is not already visible and no timeout is pending
              if (!showReferenceHandle && !showHandleTimeoutRef.current) {
                showHandleTimeoutRef.current = window.setTimeout(() => {
                  const handlePos =
                    calculateReferenceHandlePosition(selectionRange);
                  if (handlePos) {
                    setReferenceHandlePosition(handlePos);
                    setShowReferenceHandle(true);
                  }
                  showHandleTimeoutRef.current = undefined;
                }, 500); // 500ms delay before showing
              }
            } else {
              // Clear any pending show timeout
              if (showHandleTimeoutRef.current) {
                clearTimeout(showHandleTimeoutRef.current);
                showHandleTimeoutRef.current = undefined;
              }

              // Only hide if we're not hovering over the handle
              if (!isHoveringHandle && !hideHandleTimeoutRef.current) {
                hideHandleTimeoutRef.current = window.setTimeout(() => {
                  setShowReferenceHandle(false);
                  hideHandleTimeoutRef.current = undefined;
                }, 100); // 100ms delay before hiding
              }
            }
          }}
          onMouseLeave={() => {
            // Clear any pending show timeout
            if (showHandleTimeoutRef.current) {
              clearTimeout(showHandleTimeoutRef.current);
              showHandleTimeoutRef.current = undefined;
            }

            // Use the same timeout mechanism for mouse leave, but only if not hovering over handle
            if (!isHoveringHandle && !hideHandleTimeoutRef.current) {
              hideHandleTimeoutRef.current = window.setTimeout(() => {
                setShowReferenceHandle(false);
                hideHandleTimeoutRef.current = undefined;
              }, 150); // Slightly longer delay for mouse leave
            }
          }}
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
              onCellMouseDown={handleCellMouseDown}
              onCellClick={handleCellClick}
              onCellDoubleClick={handleCellDoubleClick}
              onCommitEdit={commitEdit}
              onKeyboardNav={handleKeyboardNav}
              measureAndExpand={measureAndExpand}
              sharedEditingValue={editingValue}
              setSharedEditingValue={setEditingValue}
              styleMap={styleMap}
            />
          </div>
        </div>
      </div>

      {/* Scrubber */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "35px",
          overflow: "hidden",
        }}
      >
        <Scrubber />
      </div>

      <AppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentDelimiter={currentDelimiter}
        setCurrentDelimiter={(d) => {
          setCurrentDelimiter(d);
          grid.delimiter = d;
          LocalStorageManager.saveGrid(grid);
        }}
        clearGrid={clearGrid}
        clearAllGrids={clearAllGrids}
        saveGridToFile={saveGridToFile}
        loadGridFromFile={loadGridFromFile}
        onLoadExampleToNewGrid={onLoadExampleToNewGrid || loadExample}
        rowCount={grid.rowCount}
        colCount={grid.columnCount}
        onChangeDimensions={onChangeDimensions}
        showMinimap={showMinimap}
        setShowMinimap={setShowMinimap}
        sizingMode={sizingMode}
        setSizingMode={setSizingMode}
        baseRowHeight={baseRowHeight}
        baseColWidth={baseColWidth}
        gridIndex={grid.index}
        appearanceSettings={appearanceSettings}
        onAppearanceSettingsChange={handleAppearanceSettingsChange}
      />

      {fullscreenEditing && (
        <div
          style={{
            position: "absolute",
            zIndex: 9999,
            top: "3rem",
            left: 0,
            right: 0,
            bottom: "35px",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* A small header */}
          <div
            style={{
              background: "#ddd",
              borderBottom: "1px solid #999",
              padding: "4px",
            }}
          >
            <strong>
              Full-Screen Edit: R{fullscreenEditing.row}C{fullscreenEditing.col}
            </strong>
            <span style={{ marginLeft: 10, fontStyle: "italic" }}>
              (Esc = discard, Ctrl+Enter = commit)
            </span>
          </div>

          {/* The main editor area */}
          <div style={{ flexGrow: 1, overflow: "auto" }}>
            <Editor
              ref={editorRef}
              value={fullscreenEditing.tempValue}
              onValueChange={(newVal) => {
                setFullscreenEditing((prev) =>
                  prev ? { ...prev, tempValue: newVal } : null
                );
              }}
              highlight={(code) =>
                Prism.highlight(code, Prism.languages.javascript, "javascript")
              }
              padding={10}
              style={{
                minHeight: "100%",
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  discardFullscreenChanges();
                } else if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  commitFullscreenChanges();
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Minimap */}
      <Minimap
        blocks={blockListRef.current}
        viewportBounds={calculateViewportBounds()}
        gridBounds={calculateGridBounds()}
        onViewportChange={handleMinimapViewportChange}
        isVisible={showMinimap}
        position={minimapPosition}
      />

      {/* Reference Handle */}
      {showReferenceHandle && referenceHandlePosition && (
        <div
          className="absolute z-50 w-3 h-3 bg-blue-500 rounded-full reference-handle hover:bg-blue-600"
          style={{
            // Position relative to the grid container
            left: `calc(50px + ${referenceHandlePosition.x}px - 6px)`, // 50px for row headers, -6px to center
            top: `calc(3rem + 30px + ${referenceHandlePosition.y}px - 6px)`, // 3rem for formula bar, 30px for column headers, -6px to center
            pointerEvents: "auto",
          }}
          onMouseDown={startReferenceCreation}
          onDoubleClick={(e) => {
            // Prevent double-click from triggering cell edit mode
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            setIsHoveringHandle(true);
            // Clear any pending hide timeout when hovering over the handle
            if (hideHandleTimeoutRef.current) {
              clearTimeout(hideHandleTimeoutRef.current);
              hideHandleTimeoutRef.current = undefined;
            }
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            setIsHoveringHandle(false);
            // Don't set timeout on mouse leave from handle - let the parent container handle it
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
            setIsHoveringHandle(true);
            // Ensure no timeout is set while hovering over the handle
            if (hideHandleTimeoutRef.current) {
              clearTimeout(hideHandleTimeoutRef.current);
              hideHandleTimeoutRef.current = undefined;
            }
          }}
          title="Drag to create a reference to this cell/range"
        />
      )}

      {/* Reference Creation Visual Feedback */}
      {isDraggingReference &&
        referenceDragStartPos &&
        referenceDragCurrentPos && (
          <>
            {/* Source dot - positioned at absolute screen coordinates */}
            <div
              className="fixed z-50 w-3 h-3 bg-blue-500 rounded-full reference-source-dot"
              style={{
                left: referenceDragStartPos.x - 6,
                top: referenceDragStartPos.y - 6,
                pointerEvents: "none",
              }}
            />

            {/* Target dot - positioned at absolute screen coordinates */}
            {referenceTargetPosition && (
              <div
                className="fixed z-50 w-3 h-3 bg-green-500 rounded-full reference-target-dot"
                style={{
                  left: referenceTargetPosition.x - 6,
                  top: referenceTargetPosition.y - 6,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Connection line - use fixed positioning for proper overlay */}
            {referenceTargetPosition && (
              <svg
                className="fixed z-40 reference-line"
                style={{
                  left: 0,
                  top: 0,
                  width: "100vw",
                  height: "100vh",
                  pointerEvents: "none",
                }}
              >
                <line
                  x1={referenceDragStartPos.x}
                  y1={referenceDragStartPos.y}
                  x2={referenceTargetPosition.x}
                  y2={referenceTargetPosition.y}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            )}
          </>
        )}
    </div>
  );
}

// 🔍 GLOBAL DEBUG INTERFACE - Expose to window for console access
declare global {
  interface Window {
    textruxDebug: {
      parseGrid: () => void;
      inspectGrid: () => any;
      inspectCell: (row: number, col: number) => void;
      showAllConstructs: () => void;
      getGridData: () => string;
    };
  }
}

// Add debugging interface to window when in development
if (typeof window !== 'undefined') {
  (window as any).textruxDebug = {
    parseGrid: () => {
      console.log("🔄 Re-parsing grid...");
      // Note: This will be overridden by the actual reparse function in the component
    },
    inspectCell: (row: number, col: number) => {
      console.log(`🔍 Inspecting cell R${row}C${col}`);
      console.log("Use this in the browser console after the grid loads");
    },
    showAllConstructs: () => {
      console.log("📋 Use this in the browser console after the grid loads");
    },
    inspectElements: (row?: number, col?: number) => {
      console.log("🔬 Use this in the browser console after the grid loads");
    },
    inspectCellElements: (row: number, col: number) => {
      console.log(`🔬 Inspecting elements at R${row}C${col}`);
      console.log("Use this in the browser console after the grid loads");
    },
    showElementSummary: () => {
      console.log("📈 Use this in the browser console after the grid loads");
    },
    testFormattingPerformance: () => {
      console.log("⚡ Use this in the browser console after the grid loads");
    },
    getGridData: () => {
      console.log("📊 Use this in the browser console after the grid loads");
      return "";
    }
  };
}

/** Helper: find row index by a given Y offset */
function findRowByY(y: number, rowHeights: number[]): number {
  let cum = 0;
  for (let r = 0; r < rowHeights.length; r++) {
    const h = rowHeights[r];
    if (y < cum + h) {
      return r + 1;
    }
    cum += h;
  }
  return rowHeights.length;
}

/** Helper: find col index by a given X offset */
function findColByX(x: number, colWidths: number[]): number {
  let cum = 0;
  for (let c = 0; c < colWidths.length; c++) {
    const w = colWidths[c];
    if (x < cum + w) {
      return c + 1;
    }
    cum += w;
  }
  return colWidths.length;
}
