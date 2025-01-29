export interface Cell {
    row: number;
    col: number;
    key: string;
    value: string;
}
export interface CellCluster {
    filledCells: Cell[];
    emptyCells: Cell[];
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
    borderCells: Cell[];
}
export interface Block {
    canvasCells: Cell[];
    emptyCells: Cell[];
    cellClusters: CellCluster[];
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
    canvasBorderCells: Cell[];
}
export interface GridModel {
    blocks: Block[];
    cellToBlockMap: Record<string, Block>;
}
