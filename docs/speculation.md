## Elevated Grids

Imagine looking at a spreadsheet and zooming out on it and seeing groups of cells merge together to form cells in a higher level grid.

Perhaps you only want to treat certain groups of cells as part of this elevated grid so when you zoomed out, only these cells merged to form higher-level cells and other cells are merged but showed no value and were grayed out. But perhaps you could click on one of these grayed out cells and included it in the elevated grid.

Each group of cells would need to be resolved to a value in that elevated grid. There could be different types of resolvers, such as an evaluation resolver or an abstraction resolver. An evaluation resolver would treat individuals cells as operators and operands depending upon their value and their relative position. An abstraction resolver might display the abstracted value of all the lower level values.

These elevated grids and their method of resolution would need to be tracked inside the CSV, just as embedded grids are tracked by using CSV as a value inside a CSV cell.

## Grid Groups

When you save an Excel file with multiple tabs as a CSV file, you will get an error saying "The selected file type does not support workbooks that contain multiple sheets." This means that traditionally, CSV is not a good format for saving multiple sheets.

However, using embedded grids, multiple CSV files can be saved inside a single CSV file. The contents of each CSV file are saved in individual cells in the main CSV file. Taking that one step further, grid groups allow you to give each of those CSV files a name and treat it just like tabs in Excel. You can choose to view these grid groups as flat values on a sheet or "launch" that grid group and view it like you would view an Excel workbook with multiple worksheets. However, you can have multiple of these grid groups on the same sheet and the tabs can be hierarchical instead of just a flat list, unlike Excel.

## File Systems

A CSV cell can contain any text, including commas and new line characters, as long as that text is surrounded by quotes and any existing quotes are "escaped" by doubling them. This is how you embed CSV inside CSV to make embedded grids. However, it is also how you can put the contents of any text file inside a CSV cell. Nearly all programming languages use plain text files to store the source code of a program. This means you can put the contents of each source code file into its own CSV cell and align these cells in a tree to mimic how they are saved on your computer. With an advanced code editor, you could then edit the source code of an entire program from one CSV file.

## Programming Tenants

Eventually it might be easier to extract the tokens from each source code file and place each one spatially on a grid so that it would have a location and a spatial relationship to other tokens. This is the idea of a programming tenant. Languages give sequences (of characters) meaning whereas tenants give structures meaning.

Traditionally the location of a token in a source code file is not useful to the developer or user of a program as all functions are referenced by their names, not by the location of that name in the text file (i.e., the starting and ending character index of that name). Programming languages are limited to a one-dimensional representation whereas programming tenants can inhabit multi-dimensional formats like CSV files.

When you allow tokens to inhabit a location, like a particular cell in a CSV file, you open up another layer of semantics that is not idiomatic with traditional programming languages. Now, tokens, like function names, do not have to be referenced by their name but simply by their location (think "=A4" in Excel). Therefore naming becomes less relevant in programming tenants compared with traditional programming languages.
