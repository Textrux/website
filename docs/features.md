# Features by Version

## Version 0.0.1 (Alpha)

<!-- prettier-ignore -->
| Implemented | Desktop                           | Mobile | Description                                                                                             |
| :---------: | --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| ...         |                                   |        | Web UI with gallery of projects each with a grid with row headers, column headers, and formula bar      |
| ✅          |                                   |        | Grid virtualization to allow large grids to only load the cells in view to improve performance         |
| ✅          |                                   |        | Parsing and formatting of core structures: blocks and clusters                                         |
| ✅          |                                   |        | Basic cell formula evaluation                                                                          |
| ✅          |                                   |        | Settings icon loads a modal window that displays settings, examples, instructions, and about           |
| ✅          |                                   |        | Settings include `Copy and Save as: TSV/CSV`, row/column counts, clear grid, save grid to file, load grid from file|
| ✅          |                                   |        | Cell size limited when it contains a large amount of content                                           |
| ✅          | `Ctrl + Mouse Wheel`              |        | Zoom in or out on grid only (not formula bar)                                                          |
| ✅          | Middle-mouse button (hold + drag) |        | Pan around the grid                                                                                    |
| ✅          | `Ctrl + X / Ctrl + C / Ctrl + V`  |        | Cut/Copy/(Multi-)Paste inside or outside application                                                   |
| ✅          | `Ctrl + Arrow Key`                |        | Move the block one cell in that direction                                                              |
| ✅          | `Alt + Arrow Key`                 |        | Move selection to center of nearest block in that direction (weighted by direction)                    |
| ✅          | `Ctrl + A`                        |        | Select block if canvas cell selected or select used range otherwise                                    |
| ❌          | `Ctrl + A` (multiple presses)     |        | Expands selection progressively: cell cluster → block canvas → block cluster → used range              |
| ...         | `Ctrl + S`                        |        | Save the grid as a CSV file with project name followed by triple underscores then date time            |
| ✅          | `Ctrl + Shift + ~`                |        | Toggle all formatting on or off                                                                        |
| ✅          | `Shift + Enter`                   |        | Move selection one row down and one column to the right                                                |
| ✅          | `Shift + Ctrl + Enter`            |        | Move selection one row down and one column to the left                                                 |
| ✅          | `F2`                              |        | Edit selected cell                                                                                     |
| ❌          | `Ctrl + F2`                       |        | Edit selected cell full screen                                                                         |
| ✅          | `F4`                              |        | Enter embedded grid                                                                                    |
| ✅          | `Esc`                             |        | Exit embedded grid                                                                                     |
| ❌          | Drag and Drop                     |        | Drop TSV/CSV file onto page to create new project                                                      |
| ✅          |                                   |        | `R1C1` cell is uneditable in embedded grid but can be deleted after prompt                             |
| ❌          |                                   |        | Formatting follows cell (as block moves around, cell size stays consistent)                            |
| ❌          |                                   |        | Structural feature definitions                                                                         |
| ❌          |                                   |        | Trie-based pattern feature definitions                                                                 |
| ❌          |                                   |        | Code-based pattern definitions                                                                         |
| ❌          |                                   |        | Use localStorage to Track and reimplement full grid state by project upon refresh including project name (same as tab name), selected delimiter, grid contents, grid zoom level, top left cell in viewable region, selected cell, row count, column count|     
| ❌          |                                   |        | Setting to allow tree parent nodes to expand down to fill height of child nodes                        |
| ❌          |                                   |        | Grid group viewport (grid tabs appear bottom similar to traditional spreadsheet)                       |
| ❌          |                                   |        | Basic wave computing functionality implemented                                                         |
| ❌          |                                   |        | Wave computing viewport (timeline scrubber at bottom matched to wave propagation)                      |
| ❌          |                                   |        | IDE viewport (selected cell full screen with file/folder tree next to it)                              |

## Version 0.1.0 (Beta)

<!-- prettier-ignore -->
| Implemented | Desktop                           | Mobile | Description                                                                                             |
| :---------: | --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
|             |                                   |        | Content-based pattern definitions (you can define a pattern inside the grid with that pattern)          |

## Version 1.0.0 (Release)

<!-- prettier-ignore -->
| Implemented | Desktop                           | Mobile | Description                                                                                             |
| :---------: | --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
|             |                                   |        |  Full-flow viewport (4 grids in quadrant: top left=dev, bottom right=api, top right=ui, bottom left = db) |
