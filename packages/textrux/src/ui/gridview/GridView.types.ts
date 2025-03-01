import { Grid } from "../../structure/Grid";

/**
 * The row/col selection range in the spreadsheet.
 */
export interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

/** Props for the main GridView */
export interface GridViewProps {
  grid: Grid;
  /** Overall width of the component (default "100%") */
  width?: number | string;
  /** Overall height of the component (default "100%") */
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  /** Base row height in px (before zoom) */
  baseRowHeight?: number;
  /** Base column width in px (before zoom) */
  baseColWidth?: number;
  /** Base font size in px (before zoom) */
  baseFontSize?: number;
  /** If true, auto-load from localStorage on mount */
  autoLoadLocalStorage?: boolean;
}
