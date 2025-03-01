import { useEffect, useState } from "react";

// UPDATED: Notice the file paths now use "/examples/" as the prefix:
const examples = [
  {
    name: "Block Basics",
    file: "/examples/BlockBasics.csv", // changed
    description:
      "A simple intro into the basic text structure called the block.",
  },
  {
    name: "JSON",
    file: "/examples/Json.csv", // changed
    description: "A simple example of how JSON-style data can be represented.",
  },
  {
    name: "JSON Schema",
    file: "/examples/JsonSchema.csv", // changed
    description: "Include the schema and rules for JSON-style data.",
  },
  {
    name: "JSON Schema with Data",
    file: "/examples/JsonSchemaWithData.csv", // changed
    description:
      "A text structure with a JSON-style schema and multiple tuples of data",
  },
  {
    name: "JSON Schema with Data Transposed",
    file: "/examples/JsonSchemaWithDataTransposed.csv", // changed
    description:
      "A text structure with a JSON-style schema and multiple tuples of data oriented vertically.",
  },
  {
    name: "LISP",
    file: "/examples/LISP.csv", // changed
    description: "Define and call a simple LISP-style function.",
  },
  {
    name: "LISP Recursive",
    file: "/examples/LISPRecursive.csv", // changed
    description: "Define and call a recursive LISP-style function.",
  },
  {
    name: "State Machine Traffic Light",
    file: "/examples/StateMachineTrafficLight.csv", // changed
    description:
      "Defining a simple state machine for a traffic light with a pedestrian crossing.",
  },
  {
    name: "Recursive Grid Cells",
    file: "/examples/RecursiveGridCells.csv", // changed
    description:
      "A cell can contain another grid. Select a cell that starts with a comma and press F3 to go deeper. Then press Escape to return up.",
  },
];

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
  saveGridToFile: () => void;
  loadGridFromFile: (file: File) => void;
  loadExample: (ex: {
    name: string;
    file: string;
    description: string;
  }) => void;
}

type CombinedProps = AppModalProps & AppModalExtraProps;

export const AppModal: React.FC<CombinedProps> = ({
  isOpen,
  onClose,
  currentDelimiter,
  setCurrentDelimiter,
  clearGrid,
  saveGridToFile,
  loadGridFromFile,
  loadExample,
}) => {
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

  if (!isOpen) return null;

  return (
    <div
      id="modalOverlay"
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        id="popupBox"
        className="bg-white text-black max-w-[600px] w-[90%] h-[60%] overflow-y-auto rounded-md relative p-4"
      >
        {/* Header with close button */}
        <div id="popupHeader" className="flex justify-end items-center">
          <span
            id="popupCloseButton"
            className="text-2xl font-bold cursor-pointer"
            onClick={onClose}
          >
            &times;
          </span>
        </div>

        {/* Tabs */}
        <div id="popupTabs" className="flex items-center mt-2">
          {(["Settings", "Examples", "Instructions", "About"] as const).map(
            (tab) => (
              <div
                key={tab}
                className={`popupTab px-3 py-2 mr-2 border border-b-0 rounded-t cursor-pointer ${
                  activeTab === tab ? "bg-gray-200" : "bg-white"
                }`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </div>
            )
          )}
        </div>
        <hr />

        <div id="popupContent" className="p-3">
          {activeTab === "Settings" && (
            <div>
              <label htmlFor="delimiterSelect" className="font-bold">
                Copy as:
              </label>
              <select
                id="delimiterSelect"
                value={currentDelimiter}
                onChange={(e) =>
                  setCurrentDelimiter(e.target.value as "tab" | ",")
                }
                className="ml-2"
              >
                <option value="tab">TSV</option>
                <option value=",">CSV</option>
              </select>

              <br />
              <br />

              <button
                id="clearGridButton"
                className="mt-2 px-3 py-1 border bg-gray-100"
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
              >
                Clear Grid
              </button>

              <br />
              <br />

              <button
                id="saveGridButton"
                className="px-3 py-1 border bg-gray-100"
                onClick={saveGridToFile}
              >
                Save Grid to File
              </button>

              <br />
              <br />

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
                id="loadGridButton"
                className="px-3 py-1 border bg-gray-100"
                onClick={() =>
                  document.getElementById("loadGridFileInput")?.click()
                }
              >
                Load Grid from File
              </button>
            </div>
          )}

          {activeTab === "Examples" && (
            <div>
              <p>Select an example below:</p>
              <select
                id="exampleSelect"
                size={10}
                className="w-full mb-2"
                onChange={(e) => {
                  const ex = examples.find((x) => x.name === e.target.value);
                  if (ex) setSelectedExample(ex);
                }}
                value={selectedExample.name}
              >
                {examples.map((ex) => (
                  <option key={ex.name} value={ex.name}>
                    {ex.name}
                  </option>
                ))}
              </select>

              <div
                id="exampleDescription"
                className="border border-gray-300 p-2 min-h-[100px] mb-2"
              >
                {selectedExample.description}
              </div>

              <button
                id="loadExampleButton"
                className="px-3 py-1 border bg-gray-100"
                onClick={onLoadExampleClick}
              >
                Load
              </button>
            </div>
          )}

          {activeTab === "Instructions" && (
            <div>
              <h3>Instructions</h3>
              <p>
                Enter text in cells to build text structures. The structures are
                built from the placement of text in the grid.
              </p>
              <p>
                The primary structure is a "block," which is outlined by a light
                yellow border and a bright yellow frame. The inside area is the
                canvas (white for filled cells, lightblue for empty).
              </p>
              <p>
                Blocks can overlap. Overlapping frames → linked (orange).
                Overlapping frame + border → locked (red). These form clusters.
              </p>
              <p>
                <strong>Pinch-zoom</strong> on mobile or <code>Ctrl+wheel</code>{" "}
                on desktop to zoom.
              </p>
              <p>
                <strong>Middle-click</strong> (scroll-wheel click) or{" "}
                <strong>touch-drag</strong> to pan around.
              </p>
              <p>
                <strong>Cut/Copy/Paste:</strong> Select cells, press Ctrl+C or
                Ctrl+X, then select a target cell and press Ctrl+V.
              </p>
              <p>
                <strong>Move entire block:</strong> Select a cell in its canvas,
                then press <code>Ctrl+ArrowKey</code> to move it. Use
                <code>Ctrl+Alt+ArrowKey</code> to merge with collisions.
              </p>
              <p>
                <strong>Alt+ArrowKey</strong> jumps to the nearest block in that
                direction.
              </p>
              <p>
                <strong>Ctrl+Shift+~</strong> toggles structural formatting.
              </p>
              <p>
                <strong>Nested cells:</strong> If a cell starts with "," it can
                contain a nested grid. Select and press F3 to enter, Escape to
                go back.
              </p>
            </div>
          )}

          {activeTab === "About" && (
            <div>
              <h3>About</h3>
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
                >
                  the Textrux GitHub repository
                </a>{" "}
                for details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
