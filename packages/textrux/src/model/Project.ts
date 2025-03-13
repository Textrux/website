import GridModel from "./GridModel";

export default class Project {
  public name: string;
  public grid: GridModel;

  constructor(name: string, grid?: GridModel) {
    this.name = name;
    // If no GridModel is passed in, create a new one
    this.grid = grid || new GridModel();
  }
}
