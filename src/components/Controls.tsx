import { useGridStore } from "../store/useGridStore";

export const Controls = () => {
  const { undo, redo, zoom, setZoom } = useGridStore();

  return (
    <div className="flex space-x-2 mt-5">
      <button
        onClick={undo}
        className="px-4 py-2 bg-gray-500 text-white rounded-md"
      >
        Undo
      </button>
      <button
        onClick={redo}
        className="px-4 py-2 bg-gray-500 text-white rounded-md"
      >
        Redo
      </button>
      <button
        onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Zoom Out
      </button>
      <button
        onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Zoom In
      </button>
    </div>
  );
};
