# Textrux

[Textrux.com](/docs/images/https://www.textrux.com)

Text Structures in simple CSV.

CSV is now a fully expressive, rich medium for expressing complex ideas, programs, and data in a well known, universal format.

[Textrux.com](/docs/images/https://www.textrux.com) is where you can see it in action. Enter text in the cells like you would do in any spreadsheet application, except you'll see that text come to life in structures that form based on where you enter that text.

### Create a table

![table](/docs/images/table.png)

### Create a tree

![tree](/docs/images/tree.png)

### Create a treetable

![treetable](/docs/images/treetable.png)

### Create a block cluster

![block cluster](/docs/images/block-cluster-locked.png)

## Embedded grids

CSV is a very versatile format, you can even put CSV inside CSV. When we do that it creates embedded grids.

## Elevated grids

In the same way that you can "zoom in" on a cell with CSV inside to see the embedded grid, you can also "zoom out" on a group of cells and see each cell group merge to form a higher-level cell in an elevated grid. The original cells inside each merged cell are resolved to a single value visible in the elevated grid. Just as you can embed grids inside grids ad infinitum, you can also merge grids to form elevated grids ad infinitum.

## Grid groups

A single CSV file can represent everything in Textrux including multiple grids just like you would see tabs in a spreadsheet application.

# **Primitives**

Below are the primitives of textrux.

# Structures

The core structures are formed automatically based upon the placement of text in a grid (aka spreadsheet). Each cell is either considered set (has text) or free (doesn't have text). This binary arrangement allows a spatial parser to find pre-defined structures (and eventually custom defined structures) to form a higher level semantic (meaning) from these structures. This arrangement is called Binary Spatial Semantics which is the fundamental principle behind programming tenants (programming tenants are like programming languages except tenants give meaning to multi-dimensional structures whereas languages give meaning to symbols in a sequence).

## Core Structures

There are some basic structures in textrux that form the foundation of all semantics.

We'll look at the different parts of this example.

![block example](/docs/images/block-example.png)

The block is the whole thing including the frame, border, and canvas.

![block](/docs/images/block.png)

The canvas is the rectangular area that encompasses the set cells.

![canvas](/docs/images/canvas.png)

The frame is the outer perimeter of free cells around the canvas.

![frame](/docs/images/frame.png)

The border is the inner perimeter of free cells around the canvas.

![border](/docs/images/border.png)

The cell clusters are the groups of closely placed set cells on the canvas.

![cell cluster](/docs/images/cell-cluster.png)

The set cells are the cells with text in them. All other cells are free cells.

![set cells](/docs/images/set-cells.png)

You can have multiple blocks on a grid.

![blocks example](/docs/images/blocks-example.png)

There are two blocks on the grid now.

![blocks](/docs/images/blocks.png)

You can move the second block to the left.

![blocks closer](/docs/images/blocks-closer.png)

The two blocks are now right next to each other.

![blocks closer outlined](/docs/images/blocks-closer-outlined.png)

You can continue to move the second block to the left.

![blocks linked](/docs/images/blocks-linked.png)

The frames of the two blocks will now overlap.

![frames overlapping](/docs/images/frames-overlapping.png)

When two blocks overlap, they create a block cluster.

![block cluster](/docs/images/block-cluster.png)

Each pair of blocks in a block cluster (there can be more than just two blocks in a block cluster) has either a `linked` or a `locked` relationship. When only the frames of two blocks overlap, they are considered `linked`.

Here is that same block cluster showing that the blocks are linked.

![block cluster linked](/docs/images/block-cluster-linked.png)

If you continue to move the second block to the left, the blocks still form a block cluster.

![block cluster locked](/docs/images/block-cluster-locked.png)

However,now the frame of each block is now overlapping the border of the other.

![block cluster locked outlined](/docs/images/block-cluster-locked-outlined.png)

Now the blocks in the block cluster are considered `locked` instead of `linked`.

![block cluster locked outlined 2](/docs/images/block-cluster-locked-outlined-2.png)

All formatting is driven by the placement of the text in the grid. It is content-driven formatting like in an IDE, not user-driven formatting like in a word processor program like Microsoft Word.

With the content-driven formatting turned off, the grid would look like this:

![grid without formatting](/docs/images/grid-without-formatting.png)

## Semantic Layers

Blocks, cell clusters and block clusters work together to form semantic layers that can express complex semantics.

## Patterns

Now that we have defined the core structures, we can define `patterns` in those structures. A pattern is something you would find in a core structure. Each type of core structure affords different types of patterns.

#### Cell Patterns

A cell that starts with a `,` is a cell with an embedded grid (CSV inside the cell). A cell that starts with `_` represents a cell that is still parsed for its structural value but represents no textual value (often used when you know you want something there, you're just not sure what). A cell that starts with a `^` is used to hold the CSV that represents an embedded grid's parent grid (if it's in the first cell on the sheet). This is part of the trick to how embedded grids (discussed later) works.

#### Cell Cluster Patterns

Cell Clusters is where many fundamental patterns are defined such as `trees` and `tables`. A tree is a hierarchical structure that can represent anything with a hierarchy such as file systems, data objects, and much more. A table is just like you would find in Excel or a database, rows of data with column headers at the top explaining what type of data can be found in that column such as `Name` or `Address`.

#### Block Patterns

Block patterns are used to define multiple cell clusters arranged in a particular way. For instance one cell cluster might be sitting directly above another and considered a meta header for that lower cell cluster.

#### Block Cluster Patterns

When multiple blocks are clustered together in a certain way, they may be found to match a particular block cluster pattern. Block clusters often represent much more complex concepts that span multiple blocks related in unique ways. Think multiple modules of a program that are tightly integrated.

## Templates

Once you have core structures and patterns defined, you can then move on to define specific templates that can be created from these primitives.

For instance you might have a custom `API` template that defines the schema, rules, and data being sent back and forth between computers on the internet.

## Representations

Finally, we come to representations that allow the data in templates to be converted into something useful for another program to use.

# Meta Grids

The primary grid is called the `base grid` and is what you see when you first open the app. However, there are meta grids that can hold data as well.

## Embedded Grids

If you place CSV inside the cell of a grid, you have created an embedded grid. These can be "zoomed into" allowing you to see and manipulate that text in the cells in the embedded grid and "escaped" to go back to the base grid.

## Elevated Grids

If you "zoom out" on a base grid (or an embedded grid), you see an elevated grid where groups of cells merge to form a virtual higher-level grid. These can be useful for expressing complex relationships between larger components that could not be expressed in a base grid.

## Grid Groups

Multiple embedded grids can be grouped together in such a way that they create groups of grids that you can "zoom in" on and view like like tabs in a traditional spreadsheet application. However, grid groups allow you to place one or more of these groups of grids anywhere in another grid affording greater flexibility.

# Resolvers

Values can be consumed, zoomed, or interacted with in a variety of ways. Each one of these ways represents a different type of `resolver` that does so in a useful and consistent way.

## Abstraction Resolver

Complex concepts can be "zoomed out" on to reveal simpler concepts. This is accomplished with an `abstraction resolver` that knows how to manipulate these values properly for that purpose.

## Context Resolver

Multiple versions of the same grid can interact with each other, either on the same computer or across multiple computers, thanks to the help of a context resolver which properly coordinates these values. Think API, or version control.

## Evaluation Resolver

Cells with text that represents an operation can have operands placed down and to the right and an evaluation resolver will show you how those operations proceed over time to return a value. Think 2D LISP.

## Interaction Resolver

Users are used to interacting with spreadsheets and an interaction resolver allows you to program a grid to be treated as a user-editable spreadsheet in a controlled way. Forms can be completed by users with validation and coordination with the remote server thanks to the additional help of a context resolver.
