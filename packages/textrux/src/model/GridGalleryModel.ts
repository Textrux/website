import GridModel from "./GridModel";

export default class GridGalleryModel {
  public grids: GridModel[];
  public activeGridIndex: number;
  public nextGridIndex: number;

  constructor() {
    this.grids = [];
    this.activeGridIndex = 0;
    this.nextGridIndex = 0;
  }

  createNewGrid(defaultRows: number, defaultCols: number): GridModel {
    const newGrid = new GridModel(defaultRows, defaultCols, this.nextGridIndex);
    this.grids.push(newGrid);
    this.nextGridIndex++;
    return newGrid;
  }
}
