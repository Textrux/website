import React, { useState, useEffect } from "react";
import { GridConfig } from "../util/GridConfig";
import { fromCSV, toCSV } from "../util/CSV";
import { fromTSV, toTSV } from "../util/TSV";

// This is just like your old examples array
const examples = [
  {
    name: "Block Basics",
    file: "BlockBasics.csv",
    description:
      "A simple intro into the basic text structure called the block.",
  },
  {
    name: "JSON",
    file: "Json.csv",
    description:
      "A simple example of how JSON-style data can be represented as a text structure.",
  },
  {
    name: "JSON Schema",
    file: "JsonSchema.csv",
    description: "Include the schema and rules for JSON-style data.",
  },
  {
    name: "JSON Schema with Data",
    file: "JsonSchemaWithData.csv",
    description:
      "A text structure with a JSON-style schema and multiple tuples of data",
  },
  {
    name: "JSON Schema with Data Transposed",
    file: "JsonSchemaWithDataTransposed.csv",
    description:
      "A text structure with a JSON-style schema and multiple tuples of data oriented vertically (and arguably more naturally) instead of horizontally. ",
  },
  {
    name: "LISP",
    file: "LISP.csv",
    description: "Define and call a simple LISP-style function.",
  },
  {
    name: "LISP Recursive",
    file: "LISPRecursive.csv",
    description: "Define and call a recursive LISP-style function.",
  },
  {
    name: "State Machine Traffic Light",
    file: "StateMachineTrafficLight.csv",
    description:
      "Defining a simple state machine for a traffic light with a pedestrian crossing.",
  },
  {
    name: "Recursive Grid Cells",
    file: "RecursiveGridCells.csv",
    description:
      "A cell can contain another grid. Select a grid cell (a cell that starts with a comma) and hit <code>F3</code> to enter it. Continue down as many levels as you want adding content at each level. To go back up a level press <code>Esc</code>.",
  },
];

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppModal: React.FC<AppModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    "Settings" | "Examples" | "Instructions" | "About"
  >("Settings");
  const [delimiter, setDelimiter] = useState<"tab" | ",">(() => {
    const stored = localStorage.getItem("savedDelimiter") as "tab" | ",";
    return stored || GridConfig.defaultDelimiter; // from GridConfig
  });

  // If the modal is closed, reset tab to Settings by default
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("Settings");
    }
  }, [isOpen]);

  // Update localStorage whenever delimiter changes
  useEffect(() => {
    localStorage.setItem("savedDelimiter", delimiter);
  }, [delimiter]);

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

  const [selectedExample, setSelectedExample] = useState(examples[0]);

  async function loadExample(example: (typeof examples)[number]) {
    // Load from e.g. /packages/textrux/examples/... or wherever you host them
    const fileName = example.file;
    try {
      const resp = await fetch(`./packages/textrux/examples/${fileName}`);
      if (!resp.ok) {
        alert("Failed to load example: " + fileName);
        return;
      }
      const text = await resp.text();
      const delim = text.indexOf("\t") >= 0 ? "\t" : ",";
      let data: string[][] = delim === "\t" ? fromTSV(text) : fromCSV(text);

      // Wipe current grid
      (window as any).cellsData = {};

      // Put data in cellsData
      for (let r = 0; r < data.length; r++) {
        for (let c = 0; c < data[r].length; c++) {
          const val = data[r][c];
          if (val && val.trim() !== "") {
            const rowIndex = r + 1;
            const colIndex = c + 1;
            (window as any).cellsData[`R${rowIndex}C${colIndex}`] = val;
          }
        }
      }

      // Re-parse & format
      (window as any).parseAndFormatGrid?.();

      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Error loading example: " + err);
    }
  }

  function clearGrid() {
    if (!window.confirm("Are you sure you want to clear the entire grid?"))
      return;
    (window as any).cellsData = {};
    localStorage.removeItem("savedGridData");
    (window as any).parseAndFormatGrid?.();
    onClose();
  }

  function saveGridToFile() {
    // Same logic as your old “saveGridToFile” function
    const cellsData = (window as any).cellsData || {};
    let maxRow = 1,
      maxCol = 1;
    for (let key in cellsData) {
      const m = key.match(/R(\d+)C(\d+)/);
      if (!m) continue;
      const rr = parseInt(m[1], 10);
      const cc = parseInt(m[2], 10);
      if (rr > maxRow) maxRow = rr;
      if (cc > maxCol) maxCol = cc;
    }
    const arr2D: string[][] = [];
    for (let r = 0; r < maxRow; r++) {
      arr2D[r] = new Array(maxCol).fill("");
    }
    for (let key in cellsData) {
      const m = key.match(/R(\d+)C(\d+)/);
      if (!m) continue;
      const rr = parseInt(m[1], 10) - 1;
      const cc = parseInt(m[2], 10) - 1;
      arr2D[rr][cc] = cellsData[key];
    }

    const text = delimiter === "tab" ? toTSV(arr2D) : toCSV(arr2D);

    const now = new Date();
    const defaultName = `grid_${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
    let fileName = window.prompt(
      "Enter file name (without extension)",
      defaultName
    );
    if (fileName == null) {
      return;
    }
    if (!fileName) {
      fileName = defaultName;
    }
    fileName += delimiter === "tab" ? ".tsv" : ".csv";

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function loadGridFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      const text = ev.target?.result as string;
      const delim = text.indexOf("\t") >= 0 ? "\t" : ",";
      const data = delim === "\t" ? fromTSV(text) : fromCSV(text);

      // Clear
      (window as any).cellsData = {};

      // Expand grid if needed (in real code, you'd call addRows / addCols if needed)
      // For simplicity, let's assume the existing grid is large enough.

      // Populate
      for (let r = 0; r < data.length; r++) {
        for (let c = 0; c < data[r].length; c++) {
          const val = data[r][c];
          if (val.trim()) {
            (window as any).cellsData[`R${r + 1}C${c + 1}`] = val;
          }
        }
      }

      (window as any).parseAndFormatGrid?.();
      onClose();
    };
    reader.readAsText(file);
    e.target.value = "";
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
        className="bg-white text-black max-w-[600px] w-[90%] max-h-[80%] overflow-y-auto rounded-md relative p-4"
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
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value as "tab" | ",")}
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
                onClick={clearGrid}
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
                onChange={loadGridFromFile}
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
                  const ex = examples.find((ex) => ex.name === e.target.value);
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
                onClick={() => loadExample(selectedExample)}
              >
                Load
              </button>
            </div>
          )}

          {activeTab === "Instructions" && (
            <div>
              <h3>Instructions</h3>
              <p>
                <p>
                  Enter text in cells to build text structures. The structures
                  are built from the location of the filled cells on the grid.
                </p>
                <p>
                  The primary structure is a "block" which is surrounded by a
                  light yellow "border" and and bright yellow "frame".
                </p>
                <p>
                  The area inside the border of a block is called the "canvas".
                  The canvas has filled cells with a white background along with
                  empty canvas cells with a light blue background. Nearby filled
                  cells on a canvas form a "cell cluster" and the empty cells in
                  a cell cluster have a darker blue background.
                </p>
                <p>
                  When two blocks are placed close enough to each other their
                  borders and frames may overlap. If only the frames overlap,
                  the background color of those cells is orange. If a frame
                  overlaps with a border, the background color of those cells is
                  red. Blocks that share only orange cells are considered
                  "linked" while blocks that also share red cells are considered
                  "locked". These overlapping blocks form "block clusters".{" "}
                </p>
                <p>
                  Select a cell in a block's canvas and then hit{" "}
                  <code>Ctrl+ArrowKey</code> to move the cell in that direction
                  (but stop before merging with any blocks in its path).
                </p>
                <p>
                  Select a cell in a block's canvas and then hit{" "}
                  <code>Ctrl+Alt+ArrowKey</code> to move the cell in that
                  direction and merge with any blocks in its path.
                </p>
                <p>
                  Select a cell in a block's canvas and then hit{" "}
                  <code>Alt+ArrowKey</code> to select another block in that
                  direction.
                </p>
                <p>
                  To view the grid without any formatting press{" "}
                  <code>Ctrl+Shift+Tilde</code>.
                </p>
                <p>
                  To create a grid within a cell, select a cell and press{" "}
                  <code>F3</code>. Make changes and press <code>Esc</code> to
                  return to the outer grid. Can create any number of grid cells
                  at any number of levels (still a little buggy).
                </p>
              </p>
            </div>
          )}

          {activeTab === "About" && (
            <div>
              <h3>About</h3>
              <p>
                <p>
                  Textrux (short for Text Structures ... Text Strux ... Textrux)
                  is a content-driven-formatting grid that finds structures
                  using the placement of the text on the grid.
                </p>
                <p>
                  The Github repository for this site can be found{" "}
                  <a href="https://github.com/Textrux/website" target="_blank">
                    here
                  </a>
                  .
                </p>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
