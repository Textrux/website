# Features by Version

## Version 0.0.1 (Alpha)

### General Features

<!-- prettier-ignore -->
| Implemented | Description                                                                                                  |
| :---------: | ------------------------------------------------------------------------------------------------------------ |
| ✅          | NPM-package-based development                                                                                |
| 🚧          | Headless usage allowed (parse and process CSV files in code without displaying in UI)                        |
| 🚧          | Web UI with gallery of projects each with a grid with row headers, column headers, and formula bar           |
| ✅          | Grid virtualization to allow large grids to only load the cells in view to improve performance               |
| ✅          | Core structures defined (blocks and clusters)                                                                |
| 🚧          | Easily extensible structural definitions                                                                     |
| ✅          | Code-based core structure definitions                                                                        |
| ✅          | Parse core structures                                                                                        |
| ✅          | Format core structures                                                                                       |
| ❌          | Core patterns defined (trees and tables)                                                                     |
| ❌          | Code-based pattern definitions                                                                               |
| ❌          | Structural Feature Definitions (SFD) created                                                                 |
| ❌          | Pattern definitions matched to SFDs                                                                          |
| ❌          | Parse core patterns                                                                                          |
| ❌          | Format core patterns                                                                                         |
| ❌          | Core templates defined (APIs)                                                                                |
| ❌          | Code-based template definitions                                                                              |
| ❌          | Parse templates                                                                                              |
| ❌          | Format templates                                                                                             |
| ❌          | Core representations defined                                                                                 |
| ❌          | Code-based representations definitions                                                                       |
| ❌          | Parse representations                                                                                        |
| ✅          | Basic references                                                                                             |
| ✅          | Basic formula evaluation                                                                                     |
| ❌          | Basic interaction resolver                                                                                   |
| ❌          | Basic context resolver                                                                                       |
| ❌          | Basic abstraction resolver                                                                                   |
| ✅          | Settings icon loads a modal window that displays settings, examples, instructions, and about                 |
| ✅          | Settings include delimiter selection, row/column counts, clear grid, save/load grid from/to file             |
| ✅          | Cell size limited when it contains a large amount of content                                                 |
| ❌          | Formatting follows cell (as block moves around, cell size stays consistent)                                  |
| ❌          | Save gallery state to localStorage to preserve UI on refresh / reload                                        |
| 🚧          | Save project name, delimiter, contents, zoom level, top left visible cell, selected cell, row/col counts     |     
| ❌          | Setting to allow tree parent nodes to expand down to fill height of child nodes                              |
| ❌          | Grid group viewport (grid tabs appear bottom similar to traditional spreadsheet)                             |
| ❌          | Embedded grids algorithm and format defined                                                                  |
| ✅          | `R1C1` cell is uneditable in embedded grid but can be deleted after prompt                                   |
| 🚧          | Embedded grids                                                                                               |
| ❌          | Elevated grids algorithm and format defined                                                                  |
| ❌          | Elevated grids                                                                                               |
| ❌          | Elevated grid borders                                                                                        |
| ❌          | Automated structural repositioning (adding a row to a block moves blocks below it down)                      |
| ❌          | Elevated grid structural repositioning on change                                                             |
| 🚧          | Examples of every primary use case provided                                                                  |
| ❌          | Basic evaluation resolver (with resolved value overlay and optional sequential scrubbing)                    |
| ❌          | Grid Groups                                                                                                  |
| ❌          | Basic wave computing functionality defined                                                                   |
| ❌          | Basic wave computing resolver defined                                                                        |
| ❌          | Wave computing viewport (timeline scrubber at bottom matched to wave propagation)                            |

### Interaction Features

<!-- prettier-ignore -->
| Implemented | Desktop                           | Mobile | Description                                                                                             |
| :---------: | --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| ✅          | `Ctrl + Mouse Wheel`              |        | Zoom in or out on grid only (not formula bar)                                                          |
| ✅          | Middle-mouse button (hold + drag) |        | Pan around the grid                                                                                    |
| ✅          | `Ctrl + X / Ctrl + C / Ctrl + V`  |        | Cut/Copy/(Multi-)Paste inside or outside application                                                   |
| ✅          | `Ctrl + Arrow Key`                |        | Move the block one cell in that direction                                                              |
| ✅          | `Alt + Arrow Key`                 |        | Move selection to center of nearest block in that direction (weighted by direction)                    |
| ✅          | `Ctrl + A`                        |        | Select block if canvas cell selected or select used range otherwise                                    |
| ❌          | `Ctrl + A` (multiple presses)     |        | Expands selection progressively: cell cluster → block canvas → block cluster → used range              |
| 🚧          | `Ctrl + S`                        |        | Save the grid as a CSV file with project name followed by triple underscores then date time            |
| ✅          | `Ctrl + Shift + ~`                |        | Toggle all formatting on or off                                                                        |
| ✅          | `Shift + Enter`                   |        | Move selection one row down and one column to the right                                                |
| ✅          | `Shift + Ctrl + Enter`            |        | Move selection one row down and one column to the left                                                 |
| ✅          | `F2`                              |        | Edit selected cell                                                                                     |
| ❌          | `Ctrl + F2`                       |        | Edit selected cell full screen                                                                         |
| ✅          | `F4`                              |        | Enter embedded grid                                                                                    |
| ✅          | `Esc`                             |        | Exit embedded grid                                                                                     |
| ✅          | `Ctrl + Z`                        |        | Undo                                                                                                   |
| ✅          | `Ctrl + Y`                        |        | Redo                                                                                                   |
| 🚧          | Drag and Drop                     |        | Drop TSV/CSV file onto page to create new project                                                      |

## Version 0.1.0 (Beta)

### General Features

<!-- prettier-ignore -->
| Implemented | Description                                                                                             |
| :---------: | ------------------------------------------------------------------------------------------------------- |
|             | Content-based pattern definitions (you can define a pattern inside a grid and use it in that grid)      |
|             | Content-based template definitions                                                                      |
|             | Content-based representation definitions                                                                |
|             | IDE viewport (selected cell full screen with file/folder tree next to it)                               |
|             | Complex formula evaluation                                                                              |
|             | Precedent / Dependent arrows                                                                            |
|             | Structure-defined interaction definitions (`Shift + Enter` creates new child node in tree, adjusting other blocks as necessary)|
|             | Complex references (including cross-level pointers)                                                     |

## Version 1.0.0 (Release)

### General Features

<!-- prettier-ignore -->
| Implemented | Description                                                                                             |
| :---------: | ------------------------------------------------------------------------------------------------------- |
|             | Full-flow viewport (4 grids in quadrant: top left=dev, bottom right=api, top right=ui, bottom left = db)|
|             | Allow core structures, patterns, templates, and representations to be re-definable in code              |
|             | Protocol for connecting (live if needed) to a remote grid defined                                       |
