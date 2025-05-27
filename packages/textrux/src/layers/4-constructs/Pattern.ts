
import ConstructFoundation from "./ConstructFoundation";
import PatternResult from "./PatternResult";

export default class Pattern {
  Name: string;
  foundation: ConstructFoundation;
  Parse: () => void;
  Result: PatternResult;
  Format: (cells: Cell[]) => void;
}
