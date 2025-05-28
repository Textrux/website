import { useEffect, useState } from "react";
import { examples, type ExampleData } from "../../examples";

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Props from the parent (GridView) so we can access and mutate the grid.
 */
export interface AppModalExtraProps {
  currentDelimiter: "tab" | ",";
  setCurrentDelimiter: (delim: "tab" | ",") => void;
  clearGrid: () => void;
  clearAllGrids?: () => void; // Optional function to reset all grids to defaults
  saveGridToFile: () => void;
  loadGridFromFile: (file: File) => void;
  loadExample: (ex: ExampleData) => void;

  rowCount: number; // The grid's current row count
  colCount: number; // The grid's current column count

  onChangeDimensions: (newRowCount: number, newColCount: number) => void;
}

type CombinedProps = AppModalProps & AppModalExtraProps;

export const AppModal: React.FC<CombinedProps> = ({
  isOpen,
  onClose,
  currentDelimiter,
  setCurrentDelimiter,
  clearGrid,
  clearAllGrids,
  saveGridToFile,
  loadGridFromFile,
  loadExample,
  rowCount,
  colCount,
  onChangeDimensions,
}) => {
  // Keep a local copy of the row/col so we only commit changes on "Save"
  const [localRowCount, setLocalRowCount] = useState(rowCount);
  const [localColCount, setLocalColCount] = useState(colCount);

  // If the modal re-opens, reset local fields to current grid counts:
  useEffect(() => {
    if (isOpen) {
      setLocalRowCount(rowCount);
      setLocalColCount(colCount);
    }
  }, [isOpen, rowCount, colCount]);

  const [activeTab, setActiveTab] = useState<
    "Settings" | "Examples" | "Instructions" | "About"
  >("Settings");
  const [selectedExample, setSelectedExample] = useState(examples[0]);

  // If the modal is closed, reset tab to Settings by default
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("Settings");
    }
  }, [isOpen]);

  function handleTabClick(
    tab: "Settings" | "Examples" | "Instructions" | "About"
  ) {
    setActiveTab(tab);
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  // <--- This is triggered by the "Load" button in the Examples tab
  function onLoadExampleClick() {
    console.log("selected example", selectedExample);
    loadExample(selectedExample);
    onClose();
  }

  function onClearAllGridsClick() {
    if (
      clearAllGrids &&
      window.confirm(
        "Are you sure you want to reset ALL grids to defaults? This cannot be undone."
      )
    ) {
      clearAllGrids();
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      id="modalOverlay"
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        id="popupBox"
        className="bg-white text-black dark:bg-gray-800 dark:text-gray-100 w-full max-w-md md:max-w-lg rounded-lg shadow-lg overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with title and close button */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
          <h2 className="text-xl font-semibold dark:text-gray-100">Textrux</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tab navigation - horizontal on desktop, horizontal scrollable on mobile */}
        <div className="border-b dark:border-gray-600 overflow-x-auto">
          <div className="flex">
            {(["Settings", "Examples", "Instructions", "About"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  className={`px-4 py-3 text-sm sm:text-base font-medium whitespace-nowrap ${
                    activeTab === tab
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* Content area with scrolling */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "Settings" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="font-medium dark:text-gray-200">
                  Export Format
                </div>
                <select
                  value={currentDelimiter}
                  onChange={(e) =>
                    setCurrentDelimiter(e.target.value as "tab" | ",")
                  }
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                >
                  <option value="tab">Tab-Separated Values (TSV)</option>
                  <option value=",">Comma-Separated Values (CSV)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="font-medium dark:text-gray-200">
                  Grid Dimensions
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Rows
                    </label>
                    <input
                      type="number"
                      value={localRowCount}
                      onChange={(e) => setLocalRowCount(e.target.valueAsNumber)}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Columns
                    </label>
                    <input
                      type="number"
                      value={localColCount}
                      onChange={(e) => setLocalColCount(e.target.valueAsNumber)}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      min="1"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    onChangeDimensions(localRowCount, localColCount);
                    onClose();
                  }}
                  className="w-full py-2 mt-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  Save Dimensions
                </button>
              </div>

              <div className="space-y-2">
                <div className="font-medium dark:text-gray-200">
                  Manage Grid Content
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to clear the entire grid?"
                        )
                      ) {
                        clearGrid();
                        onClose();
                      }
                    }}
                    className="py-2 px-4 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Clear Grid
                  </button>

                  <button
                    onClick={saveGridToFile}
                    className="py-2 px-4 border border-gray-300 bg-gray-50 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors"
                  >
                    Save to File
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="file"
                  id="loadGridFileInput"
                  accept=".csv,.tsv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      loadGridFromFile(file);
                      onClose();
                    }
                    (e.target as HTMLInputElement).value = "";
                  }}
                />

                <button
                  onClick={() =>
                    document.getElementById("loadGridFileInput")?.click()
                  }
                  className="w-full py-2 px-4 border border-gray-300 bg-gray-50 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors"
                >
                  Load from File
                </button>
              </div>

              {clearAllGrids && (
                <div>
                  <button
                    onClick={onClearAllGridsClick}
                    className="w-full py-2 px-4 border-2 border-red-500 text-red-600 font-medium rounded-md hover:bg-red-50 transition-colors"
                  >
                    Reset All Grids to Defaults
                  </button>
                  <div className="mt-1 text-xs text-gray-500">
                    This will delete all grids and create a single empty grid
                    with default settings.
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Examples" && (
            <div className="space-y-4">
              <div className="font-medium dark:text-gray-200">
                Select an example:
              </div>

              <div className="border rounded-md overflow-hidden dark:border-gray-600">
                <select
                  size={7}
                  className="w-full p-0 border-none focus:ring-0 focus:outline-none dark:bg-gray-700 dark:text-gray-100"
                  onChange={(e) => {
                    const ex = examples.find((x) => x.name === e.target.value);
                    if (ex) setSelectedExample(ex);
                  }}
                  onDoubleClick={() => {
                    // Double-click loads the currently selected example
                    onLoadExampleClick();
                  }}
                  value={selectedExample.name}
                >
                  {examples.map((ex) => (
                    <option
                      key={ex.name}
                      value={ex.name}
                      className="px-3 py-2 hover:bg-gray-100 focus:bg-blue-50 dark:hover:bg-gray-600 dark:focus:bg-blue-900"
                    >
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 border rounded-md p-3 text-sm min-h-[80px] max-h-[120px] overflow-y-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                <div className="font-medium mb-1">Description:</div>
                {selectedExample.description}
              </div>

              <button
                onClick={onLoadExampleClick}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                style={{ backgroundColor: "#2563EB" }}
              >
                Load Example
              </button>
            </div>
          )}

          {activeTab === "Instructions" && (
            <div className="space-y-4 text-sm dark:text-gray-100">
              <h3 className="text-lg font-medium dark:text-gray-100">
                How to Use Textrux
              </h3>

              <div>
                <div className="font-medium mb-1 dark:text-gray-200">
                  Basics
                </div>
                <p className="mb-2">
                  Enter text in cells to build text structures. The structures
                  are built from the placement of text in the grid.
                </p>
                <p className="mb-2">
                  The primary structure is a "block," which is outlined by a
                  light yellow border and a bright yellow frame. The inside area
                  is the canvas (white for filled cells, lightblue for empty).
                </p>
              </div>

              <div>
                <div className="font-medium mb-1 dark:text-gray-200">
                  Block Relationships
                </div>
                <p>
                  Blocks can overlap. Overlapping frames → linked (orange).
                  Overlapping frame + border → locked (red). These form
                  clusters.
                </p>
              </div>

              <div>
                <div className="font-medium mb-1 dark:text-gray-200">
                  Navigation
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Zoom:</strong> Pinch-zoom on mobile or{" "}
                    <span className="px-1 bg-gray-100 dark:bg-gray-600 rounded">
                      Ctrl+wheel
                    </span>{" "}
                    on desktop
                  </li>
                  <li>
                    <strong>Pan:</strong> Middle-click (scroll-wheel click) or
                    touch-drag
                  </li>
                  <li>
                    <strong>Jump to block:</strong>{" "}
                    <span className="px-1 bg-gray-100 dark:bg-gray-600 rounded">
                      Alt+ArrowKey
                    </span>{" "}
                    jumps to the nearest block in that direction
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-medium mb-1 dark:text-gray-200">
                  Editing
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Cut/Copy/Paste:</strong> Select cells, press{" "}
                    <span className="px-1 bg-gray-100 dark:bg-gray-600 rounded">
                      Ctrl+C
                    </span>{" "}
                    or{" "}
                    <span className="px-1 bg-gray-100 dark:bg-gray-600 rounded">
                      Ctrl+X
                    </span>
                    , then select a target cell and press{" "}
                    <span className="px-1 bg-gray-100 dark:bg-gray-600 rounded">
                      Ctrl+V
                    </span>
                  </li>
                  <li>
                    <strong>Move block:</strong> Select a cell in its canvas,
                    then press{" "}
                    <span className="px-1 bg-gray-100 dark:bg-gray-600 rounded">
                      Ctrl+ArrowKey
                    </span>{" "}
                    to move it
                  </li>
                  <li>
                    <strong>Merge with collisions:</strong> Use{" "}
                    <span className="px-1 bg-gray-100 dark:bg-gray-600 rounded">
                      Ctrl+Alt+ArrowKey
                    </span>
                  </li>
                  <li>
                    <strong>Toggle formatting:</strong>{" "}
                    <span className="px-1 bg-gray-100 dark:bg-gray-600 rounded">
                      Ctrl+Shift+~
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-medium mb-1 dark:text-gray-200">
                  Nested Grids
                </div>
                <p>
                  If a cell starts with "," it can contain a nested grid. Select
                  and press{" "}
                  <span className="px-1 bg-gray-100 dark:bg-gray-600 rounded">
                    F4
                  </span>{" "}
                  to enter,{" "}
                  <span className="px-1 bg-gray-100 dark:bg-gray-600 rounded">
                    Escape
                  </span>{" "}
                  to go back.
                </p>
              </div>
            </div>
          )}

          {activeTab === "About" && (
            <div className="space-y-4 dark:text-gray-100">
              <h3 className="text-lg font-medium dark:text-gray-100">
                About Textrux
              </h3>

              <p>
                Textrux (Text Structures) is a content-driven-formatting grid
                for discovering structure from text placement.
              </p>

              <p>
                See{" "}
                <a
                  href="https://github.com/Textrux/website"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  the Textrux GitHub repository
                </a>{" "}
                for more details and documentation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
