// Import all example CSV files as raw text
import BlockBasicsRaw from "./BlockBasics.csv?raw";
import JsonRaw from "./Json.csv?raw";
import JsonSchemaRaw from "./JsonSchema.csv?raw";
import JsonSchemaWithDataRaw from "./JsonSchemaWithData.csv?raw";
import JsonSchemaWithDataTransposedRaw from "./JsonSchemaWithDataTransposed.csv?raw";
import LISPRaw from "./LISP.csv?raw";
import LISPRecursiveRaw from "./LISPRecursive.csv?raw";
import StateMachineTrafficLightRaw from "./StateMachineTrafficLight.csv?raw";
import RecursiveGridCellsRaw from "./RecursiveGridCells.csv?raw";
import SICPLecture1ARaw from "./SICPLecture1A.csv?raw";

export interface ExampleData {
  name: string;
  content: string;
  description: string;
}

export const examples: ExampleData[] = [
  {
    name: "Block Basics",
    content: BlockBasicsRaw,
    description:
      "A simple intro into the basic text structure called the block.",
  },
  {
    name: "JSON",
    content: JsonRaw,
    description: "A simple example of how JSON-style data can be represented.",
  },
  {
    name: "JSON Schema",
    content: JsonSchemaRaw,
    description: "Include the schema and rules for JSON-style data.",
  },
  {
    name: "JSON Schema with Data",
    content: JsonSchemaWithDataRaw,
    description:
      "A text structure with a JSON-style schema and multiple tuples of data",
  },
  {
    name: "JSON Schema with Data Transposed",
    content: JsonSchemaWithDataTransposedRaw,
    description:
      "A text structure with a JSON-style schema and multiple tuples of data oriented vertically.",
  },
  {
    name: "LISP",
    content: LISPRaw,
    description: "Define and call a simple LISP-style function..",
  },
  {
    name: "LISP Recursive",
    content: LISPRecursiveRaw,
    description: "Define and call a recursive LISP-style function.",
  },
  {
    name: "State Machine Traffic Light",
    content: StateMachineTrafficLightRaw,
    description:
      "Defining a simple state machine for a traffic light with a pedestrian crossing.",
  },
  {
    name: "Recursive Grid Cells",
    content: RecursiveGridCellsRaw,
    description:
      "A cell can contain another grid. Select a cell that starts with a comma and press F4 to go deeper. Then press Escape to return up.",
  },
  {
    name: "SICP Lecture 1A",
    content: SICPLecture1ARaw,
    description:
      "How the LISP/Scheme functions from lecture 1A of the famous Structure and Interpretation of Computer Programs (SICP) lecture series from the 1980s could be defined and called in Textrux. https://www.youtube.com/watch?v=-J_xL4IGhJA",
  },
];

export default examples;
