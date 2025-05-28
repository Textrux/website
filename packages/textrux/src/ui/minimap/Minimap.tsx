import React, { useRef, useEffect, useState, useCallback } from "react";
import Block from "../../layers/3-foundation/block/Block";
import { isCellInBlockCanvas } from "../../util/GridHelper";

interface MinimapProps {
  blocks: Block[];
  viewportBounds: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  gridBounds: {
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
  };
  onViewportChange: (newBounds: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  }) => void;
  isVisible: boolean;
  position?: {
    bottom: number;
    right: number;
  };
}

export const Minimap: React.FC<MinimapProps> = ({
  blocks,
  viewportBounds,
  gridBounds,
  onViewportChange,
  isVisible,
  position,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastDrawnData, setLastDrawnData] = useState<string>("");

  const MINIMAP_WIDTH = 200;
  const MINIMAP_HEIGHT = 150;
  const PADDING = 10;

  // Create a hash of the current data to detect changes
  const createDataHash = useCallback(() => {
    const blockData = blocks
      .map((b) => `${b.topRow},${b.leftCol},${b.bottomRow},${b.rightCol}`)
      .join("|");
    const viewportData = `${viewportBounds.top},${viewportBounds.left},${viewportBounds.bottom},${viewportBounds.right}`;
    const gridData = `${gridBounds.minRow},${gridBounds.minCol},${gridBounds.maxRow},${gridBounds.maxCol}`;
    return `${blockData}:${viewportData}:${gridData}`;
  }, [blocks, viewportBounds, gridBounds]);

  // Calculate the bounds that encompass all blocks and the viewport
  const calculateDisplayBounds = useCallback(() => {
    if (blocks.length === 0) {
      // If no blocks, just show the viewport area
      return {
        minRow: viewportBounds.top,
        maxRow: viewportBounds.bottom,
        minCol: viewportBounds.left,
        maxCol: viewportBounds.right,
      };
    }

    let minRow = Math.min(viewportBounds.top, gridBounds.minRow);
    let maxRow = Math.max(viewportBounds.bottom, gridBounds.maxRow);
    let minCol = Math.min(viewportBounds.left, gridBounds.minCol);
    let maxCol = Math.max(viewportBounds.right, gridBounds.maxCol);

    // Add some padding around the bounds
    const rowPadding = Math.max(1, Math.ceil((maxRow - minRow) * 0.1));
    const colPadding = Math.max(1, Math.ceil((maxCol - minCol) * 0.1));

    minRow -= rowPadding;
    maxRow += rowPadding;
    minCol -= colPadding;
    maxCol += colPadding;

    return { minRow, maxRow, minCol, maxCol };
  }, [blocks, viewportBounds, gridBounds]);

  // Convert grid coordinates to minimap coordinates
  const gridToMinimap = useCallback(
    (row: number, col: number, displayBounds: any) => {
      const { minRow, maxRow, minCol, maxCol } = displayBounds;
      const gridWidth = maxCol - minCol;
      const gridHeight = maxRow - minRow;

      const x =
        ((col - minCol) / gridWidth) * (MINIMAP_WIDTH - 2 * PADDING) + PADDING;
      const y =
        ((row - minRow) / gridHeight) * (MINIMAP_HEIGHT - 2 * PADDING) +
        PADDING;

      return { x, y };
    },
    []
  );

  // Convert minimap coordinates to grid coordinates
  const minimapToGrid = useCallback(
    (x: number, y: number, displayBounds: any) => {
      const { minRow, maxRow, minCol, maxCol } = displayBounds;
      const gridWidth = maxCol - minCol;
      const gridHeight = maxRow - minRow;

      const col =
        ((x - PADDING) / (MINIMAP_WIDTH - 2 * PADDING)) * gridWidth + minCol;
      const row =
        ((y - PADDING) / (MINIMAP_HEIGHT - 2 * PADDING)) * gridHeight + minRow;

      return { row, col };
    },
    []
  );

  // Get block color based on its type
  const getBlockColor = useCallback((block: Block) => {
    // Updated colors for better visibility and professional appearance
    return {
      canvas: "rgba(59, 130, 246, 0.7)", // blue for canvas (more visible)
      border: "rgba(245, 158, 11, 0.9)", // amber for border (better contrast)
      frame: "rgba(245, 158, 11, 0.4)", // lighter amber for frame
    };
  }, []);

  // Draw the minimap
  const drawMinimap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displayBounds = calculateDisplayBounds();

    // Clear canvas
    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Draw background - darker for better contrast
    ctx.fillStyle = "rgba(30, 41, 59, 0.95)"; // dark slate background
    ctx.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Draw border
    ctx.strokeStyle = "rgba(148, 163, 184, 0.6)"; // lighter border
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Draw blocks
    blocks.forEach((block) => {
      const colors = getBlockColor(block);

      // Draw frame (larger area)
      const frameTopLeft = gridToMinimap(
        block.topRow - 1,
        block.leftCol - 1,
        displayBounds
      );
      const frameBottomRight = gridToMinimap(
        block.bottomRow + 1,
        block.rightCol + 1,
        displayBounds
      );

      ctx.fillStyle = colors.frame;
      ctx.fillRect(
        frameTopLeft.x,
        frameTopLeft.y,
        frameBottomRight.x - frameTopLeft.x,
        frameBottomRight.y - frameTopLeft.y
      );

      // Draw border
      const borderTopLeft = gridToMinimap(
        block.topRow,
        block.leftCol,
        displayBounds
      );
      const borderBottomRight = gridToMinimap(
        block.bottomRow,
        block.rightCol,
        displayBounds
      );

      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(
        borderTopLeft.x,
        borderTopLeft.y,
        borderBottomRight.x - borderTopLeft.x,
        borderBottomRight.y - borderTopLeft.y
      );

      // Draw canvas (filled cells)
      ctx.fillStyle = colors.canvas;
      block.canvasPoints.forEach((point) => {
        const pointPos = gridToMinimap(point.row, point.col, displayBounds);
        const cellWidth =
          (MINIMAP_WIDTH - 2 * PADDING) /
          (displayBounds.maxCol - displayBounds.minCol);
        const cellHeight =
          (MINIMAP_HEIGHT - 2 * PADDING) /
          (displayBounds.maxRow - displayBounds.minRow);

        ctx.fillRect(
          pointPos.x,
          pointPos.y,
          Math.max(1, cellWidth),
          Math.max(1, cellHeight)
        );
      });
    });

    // Draw viewport rectangle
    const viewportTopLeft = gridToMinimap(
      viewportBounds.top,
      viewportBounds.left,
      displayBounds
    );
    const viewportBottomRight = gridToMinimap(
      viewportBounds.bottom,
      viewportBounds.right,
      displayBounds
    );

    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"; // white border for visibility
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)"; // subtle white fill

    const viewportWidth = viewportBottomRight.x - viewportTopLeft.x;
    const viewportHeight = viewportBottomRight.y - viewportTopLeft.y;

    ctx.fillRect(
      viewportTopLeft.x,
      viewportTopLeft.y,
      viewportWidth,
      viewportHeight
    );
    ctx.strokeRect(
      viewportTopLeft.x,
      viewportTopLeft.y,
      viewportWidth,
      viewportHeight
    );
  }, [
    blocks,
    viewportBounds,
    calculateDisplayBounds,
    gridToMinimap,
    getBlockColor,
  ]);

  // Handle mouse events for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const displayBounds = calculateDisplayBounds();
      const gridPos = minimapToGrid(x, y, displayBounds);

      // Calculate viewport size
      const viewportWidth = viewportBounds.right - viewportBounds.left;
      const viewportHeight = viewportBounds.bottom - viewportBounds.top;

      // Center viewport on clicked position
      const newBounds = {
        left: gridPos.col - viewportWidth / 2,
        right: gridPos.col + viewportWidth / 2,
        top: gridPos.row - viewportHeight / 2,
        bottom: gridPos.row + viewportHeight / 2,
      };

      onViewportChange(newBounds);
    },
    [viewportBounds, calculateDisplayBounds, minimapToGrid, onViewportChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const displayBounds = calculateDisplayBounds();
      const gridPos = minimapToGrid(x, y, displayBounds);

      // Calculate viewport size
      const viewportWidth = viewportBounds.right - viewportBounds.left;
      const viewportHeight = viewportBounds.bottom - viewportBounds.top;

      // Center viewport on mouse position
      const newBounds = {
        left: gridPos.col - viewportWidth / 2,
        right: gridPos.col + viewportWidth / 2,
        top: gridPos.row - viewportHeight / 2,
        bottom: gridPos.row + viewportHeight / 2,
      };

      onViewportChange(newBounds);
    },
    [
      isDragging,
      viewportBounds,
      calculateDisplayBounds,
      minimapToGrid,
      onViewportChange,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse up listener
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isDragging]);

  // Redraw when dependencies change
  useEffect(() => {
    const currentDataHash = createDataHash();
    if (currentDataHash !== lastDrawnData) {
      drawMinimap();
      setLastDrawnData(currentDataHash);
    }
  }, [createDataHash, lastDrawnData, drawMinimap]);

  if (!isVisible) return null;

  const minimapPosition = position || { bottom: 16, right: 16 };

  return (
    <div
      ref={containerRef}
      className={`minimap-container ${isHovered ? "opacity-90" : "opacity-40"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: MINIMAP_WIDTH,
        height: MINIMAP_HEIGHT,
        bottom: minimapPosition.bottom,
        right: minimapPosition.right,
      }}
    >
      <canvas
        ref={canvasRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="minimap-canvas"
        style={{
          width: MINIMAP_WIDTH,
          height: MINIMAP_HEIGHT,
        }}
      />
    </div>
  );
};
