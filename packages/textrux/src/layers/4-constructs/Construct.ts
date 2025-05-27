import ConstructFoundation from "./ConstructFoundation";
import ConstructResult from "./ConstructResult";

export default class Construct {
  Name: string;
  foundation: ConstructFoundation;
  Parse: () => void;
  Result: ConstructResult;
  Format: (cells: Cell[]) => void;
}
