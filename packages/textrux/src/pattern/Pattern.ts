import Cell from "../structure/Cell";
import PatternLevel from "./PatternLevel";
import PatternResult from "./PatternResult";

export default class Pattern {
  Name: string;
  Level: PatternLevel;
  Parse: () => void;
  Result: PatternResult;
  Format: (cells: Cell[]) => void;
}
