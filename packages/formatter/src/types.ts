import { GridModel, Cell } from '@treetsheet/parser';

export interface FormattedCell {
  row: number;
  col: number;
  backgroundColor: string;
  borderColor: string;
  contents: string;
}

export interface FormattedGridModel {
  formattedCells: FormattedCell[];
}
