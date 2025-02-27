export class CellFormat {
  backgroundColor?: string;
  color?: string;
  fontWeight?: "normal" | "bold";
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

  constructor(init?: Partial<CellFormat>) {
    Object.assign(this, init);
  }
}
