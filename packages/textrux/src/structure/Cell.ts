import CellFormat from "./CellFormat";

export default class Cell {
  row: number;
  col: number;
  value: string;
  formula: string;
  format: CellFormat;
}
