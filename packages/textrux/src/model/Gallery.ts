import Project from "./Project";

export default class Gallery {
  public projects: Project[];
  public activeProjectIndex: number;

  constructor() {
    // Start with no projects by default
    this.projects = [];
    // We can track which project is "active" (selected tab)
    this.activeProjectIndex = 0;
  }
}
