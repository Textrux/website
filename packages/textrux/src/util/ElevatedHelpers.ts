import GridModel from "../model/GridModel";
import Grid from "../model/GridModel";
import { toCSV } from "./CSV";

export function displayNextElevatedGridHelper(grid: GridModel) {
  console.log("displayNextElevatedGrid called for grid", grid.id);
  // TODO: This will eventually calculate where virtual higher-level cells
  // are on the elevated grid, based on block cluster perimeters, etc.
}

export function enterElevatedGridHelper(grid: GridModel) {
  console.log("enterElevatedGrid called for grid", grid.id);
  // TODO: This will eventually finalize the “higher-level” grid and navigate into it.
}

export function exitElevatedGridHelper(grid: GridModel) {
  console.log("exitElevatedGrid called for grid", grid.id);
  // TODO: This will back out to the next-lower-level grid, unless we’re already at the base.
}
