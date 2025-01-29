export interface Cell {
    row: number;
    col: number;
    key: string;
    value: string;
}
export interface Block {
    canvasCells: Cell[];
    emptyClusterCells: Cell[];
    borderCells: Cell[];
    frameCells: Cell[];
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
}
export interface Grid {
    cells: Map<string, Cell>;
    blocks: Block[];
    numberOfRows: number;
    numberOfColumns: number;
}
