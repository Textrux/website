export class CellFormat {
  backgroundColor?: string;
  color?: string;
  fontWeight?: "normal" | "bold" = "normal";

  borderLeftWidth: number = 0;
  borderLeftColor: string = "";
  borderLeftStyle: string = "";

  borderTopWidth: number = 0;
  borderTopColor: string = "";
  borderTopStyle: string = "";

  borderRightWidth: number = 0;
  borderRightColor: string = "";
  borderRightStyle: string = "";

  borderBottomWidth: number = 0;
  borderBottomColor: string = "";
  borderBottomStyle: string = "";

  // Cell-specific sizing (when "Size cells by" is set to "Cell")
  width?: number; // Last width this cell was set to
  height?: number; // Last height this cell was set to
  lastWidthSource?: "auto" | "manual"; // How the width was last set
  lastHeightSource?: "auto" | "manual"; // How the height was last set

  constructor(init?: Partial<CellFormat>) {
    Object.assign(this, init);
  }
}
