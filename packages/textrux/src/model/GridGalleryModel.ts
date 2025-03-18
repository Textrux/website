import GridModel from "./GridModel";

export default class GridGalleryModel {
  public grids: GridModel[];
  public activeGridIndex: number;
  public nextGridIndex: number;

  constructor() {
    // Start with no grids by default
    this.grids = [];
    // We can track which grid is "active" (selected tab)
    this.activeGridIndex = 0;
  }
}
