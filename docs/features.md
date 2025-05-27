# Features by Version

## Version 0.0.1 (Alpha)

### General Features

<!-- prettier-ignore -->
| Implemented | Description                                                                                                                         |
| :---------: | ----------------------------------------------------------------------------------------------------------------------------------- |
| ✅          | NPM-package-based development                                                                                                       |
| 🚧          | Headless usage allowed (parse and process CSV files in code without displaying in UI)                                               |
| ✅          | Pick up where you left off - all changes saved in local storage                                                                     |
| ✅          | Site still works offline                                                                                                            |
| ✅          | Web UI with gallery of grids each with row headers, column headers, and formula bar                                                 |
| ✅          | Grid virtualization to allow large grids to only load the cells in view to improve performance                                      |
| ✅          | Foundations defined (blocks, clusters, subclusters)                                                                                 |
| ✅          | Code-based foundation definitions                                                                                                   |
| ✅          | Parse foundations                                                                                                                   |
| ✅          | Format foundations                                                                                                                  |
| ❌          | Foundation traits defined                                                                                                           |
| ❌          | Core construct (trees and tables) signatures defined from foundation traits                                                         |
| 🚧          | Easily extensible construct definitions                                                                                             |
| ❌          | Code-based construct definitions                                                                                                    |
| ❌          | Construct definitions matched to SFDs                                                                                               |
| ❌          | Parse core constructs                                                                                                               |
| ❌          | Format core constructs                                                                                                              |
| ❌          | Core blueprints defined (APIs)                                                                                                      |
| ❌          | Code-based blueprints definitions                                                                                                   |
| ❌          | Parse blueprints                                                                                                                    |
| ❌          | Format blueprints                                                                                                                   |
| ❌          | Core explorers defined                                                                                                              |
| ❌          | Code-based explorers definitions                                                                                                    |
| ❌          | Core explorers produce artifacts                                                                                                    |
| ✅          | Basic references                                                                                                                    |
| ✅          | Basic formula evaluation                                                                                                            |
| ❌          | Basic interaction resolver                                                                                                          |
| ❌          | Basic context resolver                                                                                                              |
| ❌          | Basic abstraction resolver                                                                                                          |
| ✅          | Settings icon loads a modal window that displays settings, examples, instructions, and about                                        |
| ✅          | Settings include delimiter selection, row/column counts, clear grid, save/load grid from/to file                                    |
| ✅          | Cell size limited when it contains a large amount of content                                                                        |
| ❌          | Formatting follows cell (as block moves around, cell size stays consistent)                                                         |
| ❌          | Save gallery state to localStorage to preserve UI on refresh / reload                                                               |
| 🚧          | Save grid name, delimiter, contents, zoom level, top left visible cell, selected cell, row/col counts                               |     
| ❌          | Setting to allow tree parent nodes to expand down to fill height of child nodes                                                     |
| ❌          | Embedded grids algorithm and format defined                                                                                         |
| ✅          | `R1C1` cell is uneditable in embedded grid but can be deleted after prompt                                                          |
| 🚧          | Embedded grids                                                                                                                      |
| ❌          | Elevated grids algorithm and format defined                                                                                         |
| ❌          | Elevated grids                                                                                                                      |
| ❌          | Elevated grid borders                                                                                                               |
| ❌          | Elevated grid structural repositioning on change                                                                                    |
| 🚧          | Examples of every primary use case provided                                                                                         |
| ❌          | Basic evaluation resolver (with resolved value overlay and optional sequential scrubbing)                                           |
| ❌          | Grid Groups                                                                                                                         |
| ❌          | Grid group viewport (grid tabs appear bottom similar to traditional spreadsheet)                                                    |
| ❌          | Basic wave computing functionality defined                                                                                          |
| ❌          | Basic wave computing resolver defined                                                                                               |
| ❌          | Wave computing viewport (timeline scrubber at bottom matched to wave propagation)                                                   |

### Interaction Features

<!-- prettier-ignore -->
| Implemented | Desktop                           | Mobile | Description                                                                                             |
| :---------: | --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| ✅          | `Ctrl + Mouse Wheel`              |        | Zoom in or out on grid only (not formula bar)                                                          |
| ✅          | Middle-mouse button (hold + drag) |        | Pan around the grid                                                                                    |
| ✅          | `Ctrl + X / Ctrl + C / Ctrl + V`  |        | Cut/Copy/(Multi-)Paste inside or outside application                                                   |
| ✅          | `Ctrl + Arrow Key`                |        | Move the block one cell in that direction                                                              |
| ✅          | `Alt + Arrow Key`                 |        | Move selection to center of nearest block in that direction (weighted by direction)                    |
| 🚧          | `Ctrl + A` (multiple presses)     |        | Expands selection progressively: cell cluster → block canvas → block cluster → used range              |
| ✅          | `Ctrl + S`                        |        | Save the grid as a CSV file with grid name followed by triple underscores then date time               |
| ✅          | `Ctrl + Shift + ~`                |        | Toggle all formatting on or off                                                                        |
| ✅          | `Shift + Enter`                   |        | Move selection one row down and one column to the right                                                |
| ✅          | `Shift + Ctrl + Enter`            |        | Move selection one row down and one column to the left                                                 |
| ✅          | `F2`                              |        | Edit selected cell                                                                                     |
| ✅          | `Ctrl + F2`                       |        | Edit selected cell full screen                                                                         |
| ✅          | `F4`                              |        | Enter embedded grid                                                                                    |
| ✅          | `Esc`                             |        | Exit embedded grid                                                                                     |
| ✅          | `Ctrl + Z`                        |        | Undo                                                                                                   |
| ✅          | `Ctrl + Y`                        |        | Redo                                                                                                   |
| ✅          | Drag and Drop                     |        | Drop TSV/CSV file onto page to create new grid on new tab                                              |

## Version 0.1.0 (Beta)

### General Features

<!-- prettier-ignore -->
| Implemented | Description                                                                                                                        |
| :---------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| ❌          | Automated structural repositioning (adding a row to a block moves blocks below it down)                                            |
| ❌          | Content-based construct definitions (you can define a construct inside a grid and use it in that grid)                             |
| ❌          | Content-based layout definitions                                                                                                   |
| ❌          | Content-based blueprint definitions                                                                                                |
| ❌          | IDE viewport (selected cell full screen with file/folder tree next to it)                                                          |
| ❌          | Complex formula evaluation                                                                                                         |
| ❌          | Precedent / Dependent arrows                                                                                                       |
| ❌          | Construct-defined interaction definitions (`Shift + Enter` creates new child node in tree, adjusting other blocks as necessary)    |

## Version 1.0.0 (Release)

### General Features

<!-- prettier-ignore -->
| Implemented | Description                                                                                                                        |
| :---------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| ❌          | Full-flow viewport (4 grids in quadrant: top left=dev, bottom right=api, top right=ui, bottom left = db)                           |
| ❌          | Allow foundations, constructs, layouts, and blueprints to be redefined or overridden in code                                       |
| ❌          | Protocol defined for connecting to a remote grid for interactive editing                                                           |
| ❌          | Complex references (including cross-level pointers)                                                                                |
