# Textrux

[Textrux.com](/docs/images/https://www.textrux.com)

Text Structures in simple CSV.

CSV is now a fully expressive, rich medium for expressing complex ideas, programs, and data in a well known, universal format.

[Textrux.com](/docs/images/https://www.textrux.com) is where you can see it in action. Enter text in the cells like you would do in any spreadsheet application, except you'll see that text come to life in structures that form based on where you enter that text.

### Create a table

### Create a tree

### Create a treetable

### Create a block cluster

## Embedded grids

CSV is a very versatile format, you can even put CSV inside CSV. When we do that it creates embedded grids.

## Elevated grids

In the same way that you can "zoom in" on a cell with CSV inside to see the embedded grid, you can also "zoom out" on a group of cells and see the cells merge to form an elevated grid. The original cells inside each merged cell are resolved to a single value visible in the elevated grid. Just as you can embed grids inside grids ad infinitum, you can also merge grids to form elevated grids ad infinitum.

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

#### Linked vs Locked

#### Contiguous Block Subcluster

## Patterns

### Pattern Levels

#### Cell Patterns

#### Cell Cluster Patterns

##### Contiguous Cell Subcluster Patterns

#### Block Patterns

#### Block Cluster Patterns

##### Contiguous Block Subcluster Patterns

## Templates

## Representations

# Meta Grids

## Embedded Grids

## Elevated Grids

## Grid Groups

# Resolvers

## Abstraction Resolver

## Context Resolver

## Evaluation Resolver

## Interaction Resolver
