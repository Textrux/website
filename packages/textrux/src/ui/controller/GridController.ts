import { useCallback, useRef, useEffect } from "react";
import { Grid } from "../../structure/Grid";

export interface UseGridControllerOptions {
  grid: Grid; // The model
  zoom: number; // Current zoom factor
  setZoom: (z: number) => void;
  minZoom?: number; // Default 0.2
  maxZoom?: number; // Default 10
  colPx: number; // base col width
  rowPx: number; // base row height
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * A custom hook that sets up event handlers for pinch zoom, middle-click drag, etc.
 */
export function useGridController(options: UseGridControllerOptions) {
  const {
    grid,
    zoom,
    setZoom,
    minZoom = 0.2,
    maxZoom = 10,
    colPx,
    rowPx,
    gridContainerRef,
  } = options;

  // Refs for pinch
  const pinchInfoRef = useRef({
    active: false,
    startDist: 1,
    startZoom: 1,
    fracX: 0.5,
    fracY: 0.5,
  });

  // Refs for middle-click
  const midPanRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  // (A) Desktop Ctrl+wheel => zoom
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    function handleWheel(e: WheelEvent) {
      if (e.ctrlKey) {
        e.preventDefault();
        let newZoom = zoom * (e.deltaY < 0 ? 1.1 : 0.9);
        if (newZoom < minZoom) newZoom = minZoom;
        if (newZoom > maxZoom) newZoom = maxZoom;
        setZoom(newZoom);
      }
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [zoom, setZoom, minZoom, maxZoom, gridContainerRef]);

  // (B) Touch pinch
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        pinchInfoRef.current.active = true;
        pinchInfoRef.current.startDist = getTouchesDistance(
          e.touches[0],
          e.touches[1]
        );
        pinchInfoRef.current.startZoom = zoom;

        const container = gridContainerRef.current;
        if (container) {
          const oldW = grid.cols * colPx;
          const oldH = grid.rows * rowPx;
          pinchInfoRef.current.fracX = container.scrollLeft / oldW;
          pinchInfoRef.current.fracY = container.scrollTop / oldH;
        }
      }
    },
    [zoom, grid, colPx, rowPx, gridContainerRef]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pinchInfoRef.current.active) return;
      if (e.touches.length === 2) {
        e.preventDefault();
        const newDist = getTouchesDistance(e.touches[0], e.touches[1]);
        const ratio = newDist / pinchInfoRef.current.startDist;
        let newZoom = pinchInfoRef.current.startZoom * ratio;
        if (newZoom < minZoom) newZoom = minZoom;
        if (newZoom > maxZoom) newZoom = maxZoom;
        setZoom(newZoom);
      }
    },
    [setZoom, minZoom, maxZoom]
  );

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (pinchInfoRef.current.active && e.touches.length < 2) {
      pinchInfoRef.current.active = false;
    }
  }, []);

  // (C) Middle-click drag/pan
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        const container = gridContainerRef.current;
        if (!container) return;
        midPanRef.current.active = true;
        midPanRef.current.startX = e.clientX;
        midPanRef.current.startY = e.clientY;
        midPanRef.current.scrollLeft = container.scrollLeft;
        midPanRef.current.scrollTop = container.scrollTop;
        container.classList.add("grabbing");
      }
    },
    [gridContainerRef]
  );

  const onMouseMoveDoc = useCallback(
    (e: MouseEvent) => {
      if (midPanRef.current.active) {
        e.preventDefault();
        const container = gridContainerRef.current;
        if (!container) return;
        const dx = e.clientX - midPanRef.current.startX;
        const dy = e.clientY - midPanRef.current.startY;
        container.scrollLeft = midPanRef.current.scrollLeft - dx;
        container.scrollTop = midPanRef.current.scrollTop - dy;
      }
    },
    [gridContainerRef]
  );

  const onMouseUpDoc = useCallback(
    (e: MouseEvent) => {
      if (midPanRef.current.active && e.button === 1) {
        midPanRef.current.active = false;
        const container = gridContainerRef.current;
        if (container) {
          container.classList.remove("grabbing");
        }
      }
    },
    [gridContainerRef]
  );

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMoveDoc);
    document.addEventListener("mouseup", onMouseUpDoc);
    return () => {
      document.removeEventListener("mousemove", onMouseMoveDoc);
      document.removeEventListener("mouseup", onMouseUpDoc);
    };
  }, [onMouseMoveDoc, onMouseUpDoc]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
  };
}

function getTouchesDistance(t1: React.Touch, t2: React.Touch): number {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
