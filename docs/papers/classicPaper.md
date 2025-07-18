# TreeTable

## Summary

TreeTable is a programming tenant that allows meaning to reside in 2D structures in the same way that a programming language allows meaning to reside in 1D sequences of text. It is called a programming "tenant" instead of a "language" since tenants make structures meaningful whereas languages make sequences of characters meaningful.

TreeTable uses a Comma-Separated Value (CSV) file natively to represent these 2D structures. CSV has been traditionally used to represent tabular data only, however CSV is a data format that simply represents a 2D grid of cells. It doesn’t necessarily imply that the data contained within that 2D grid of cells is tabular.

TreeTable uses CSV files to represent a mix of hierarchical and tabular data formats including JSON, data tables, HTML, and LISP (computer programming instructions). These CSV files are parsed using the position of non-empty cells relative to one another. These groups of non-empty cells combine to form cell clusters, blocks, block clusters, and then a cell at a higher level of composition recursively. A structure, such as a specific cell cluster arrangement, generally has the same meaning at any level of recursion allowing for natural composition and abstraction.

Pointers between cells, at varying levels, give TreeTable structures (called "treets") additional expressive power and flexibility including portals, [strange loops](https://en.wikipedia.org/wiki/Strange_loop), and infinite composability. Treets provide a way for code, data, docs, and other conceptual elements to all live together inside the same data format. Additionally, since nearly any block of text, including a source code file, can be considered a 1-cell CSV file, TreeTable is fully backwards compatible and capable of incorporating legacy code anywhere in a structure.

## Simple Example

Below is a simple example of a LISP-style computer program.

> (+ 3 (\* 5 6) 8 2)

Many LISP editors will format this code more nicely for you making it look like this:

    (+
        3
        (*
            5
            6)
        8
        2
    )

In LISP, this program could be run by an interpreter which would give a result of `43`.

In LISP, the operators ( `+` and `*`) come before their respective operands (the numbers), not in between them as we would normally see them. We would normally see that same mathematical expression like this:

> 3 + (5 \* 6) + 8 + 2

In TreeTable, it would look very similar to the LISP version, though:

<style type="text/css" media="screen">
    table {
        border-collapse:collapse;
        background-color:black;
        border:1px solid white;
        color: white;
    }
    table td {
        margin:0px;
        padding:5px;
        width:30px;
        height:30px;
        border:1px solid white;
        text-align:center;
        vertical-align:center
    }
    #f {
        background-color:Gray;
    }
    #b {
        background-color:Beige
    }
    #ccf {
        background-color:white;
        color:black;
        font-weight:bold
    }
    #cce {
        background-color:#463E3F
    }
    #ce {
        background-color:#C2DFFF
    }
    #so {

    }
    #h {
        background-color:white;
        color:black;
        font-weight:bold;
        font-style:italic;
        text-decoration: underline;
    }
</style>
<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td> +</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td> 3</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td> *</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td> 5</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td> 6</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td> 8</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td> 2</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Notice that each element (whether it's an operator like `+` or an operand like a number) appears in its own cell, the elements are physically grouped near each other on the grid, and that the group as a whole is not positioned at any particularly significant location on the grid but the positioning of the elements relative to one another is very important.

In fact the positioning of the elements in TreeTable looks very similar to the positioning of the elements in the LISP editor after they've been formatted, as we saw above. This is significant. Many code editors attempt to format code in a 2-dimensional fashion so you as the user can easily make sense of the 1-dimensional linear text code. The programming language interpreter itself, though, ignores the second dimension and simply processes the text as a sequential, 1-dimensional list of characters.

In TreeTable, this second dimension is actually a key part of the tenant itself. It is much more than just a way for you as the user to understand the code more clearly. <mark>Interpreting the structure of the code in this second dimension is the key idea behind TreeTable.</mark>

Let's look at some basic definitions of terms used in TreeTable.

## Basic Definitions

- **Grid** - A 2-dimensional arrangement of cells much like a spreadsheet
- **Cell** - Much the same as a "cell" in a spreadsheet except that cells can exist as groupings of lower-level cells recursively
- **Filled Cell** - A cell that contains text
- **Empty Cell** - A cell that does not contain any text
- **Cell Cluster** - When multiple filled cells are close enough to each other that a rectangular box of empty cells cannot exist between them
- **Block** - When one or more cell clusters are close enough to each other that two successive rectangular boxes of empty cells cannot exist between them
- **Canvas** - The part of the block that contains the cell clusters but not the two successive rectangular boxes of empty cells around them
- **Border** - The inner rectangular box of empty cells surrounding a block canvas
- **Frame** - The outer rectangular box of empty cells surrounding a block canvas and its border
- **Block Cluster** - Any set of blocks that have overlapping frames
- **Linked** - When the frames of two blocks overlap each other
- **Locked** - When the frames of two blocks overlap the border of the other
- **Structure** - A generic name used to refer to any kind of shape present on a grid in TreeTable

(At the very bottom of this page you will find many more examples.)

## Formatting

Visually formatting a TreeTable grid can help users understand what structures are present on the grid much like a text editor used by developers can color-code certain keywords.

However, this kind of content-driven formatting is only present when certain structures are present. Text cannot be manually formatted in an IDE, neither can structures be manually formatted in a TreeTable viewer/editor. Ultimately, a TreeTable grid can always be reduced down to a CSV file which does not contain any formatting since CSV is a plain text format.

### Formatting Example

Below is the same grid as appeared above, except this time formatted to aide in visually understanding its structure.

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> +</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 3</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> *</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 5</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 6</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 8</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue"> 2</td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="b" style="border-left:2px solid blue">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

### Key

- **Grid** - The grid is made up of all the visible squares
- **Cell** - Each square is a cell
- **Filled Cell** - The white cells with black text
- **Empty Cell** - All other cells
- **Cell Cluster** - There is only one cell cluster on the canvas (canvases can contain multiple cell clusters as will be seen later)
- **Block** - The entire grouping of formatted cells including the canvas, border, and frame is called a block
- **Canvas** - Has a blue outline; Filled cells on the canvas have a white background with black text, empty cells on the canvas have a dark gray background
- **Border** - The beige cells
- **Frame** - The light gray cells
- **Block Cluster** - There is only only block in this block cluster (all blocks are a part of a block cluster, even if there is only one block in the cluster)
- **Linked** - Since there is only one block above, no blocks are linked
- **Locked** - Since there is only one block above, no blocks are locked

## Movement

TreeTable structures (again, often called "treets"), such as blocks, can be moved around on a grid even while the grid remains stationary.

For example, if the block in the grid above were moved two columns to the left, it would look like this:

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> +</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 3</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> *</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 5</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 6</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 8</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue"> 2</td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="b" style="border-left:2px solid blue">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Conceptually, the structures on a TreeTable grid can be thought of as "sitting on" the grid which allows them to be slid across the grid (something very easy to do in TreeTable viewers/editors).

## Adding Text

As soon as text is entered into an empty cell, such as the text `Hi` below ...

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> +</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>Hi</td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue"></td><td id="cce">  </td><td id="ccf"> 3</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> *</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td> </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 5</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 6</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 8</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue"> 2</td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="b" style="border-left:2px solid blue">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

... the TreeTable viewer/editor formats the grid appropriately.

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> +</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf" style="border:2px solid blue">Hi</td><td id="b">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 3</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> *</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 5</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 6</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 8</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue"> 2</td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="b" style="border-left:2px solid blue">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Now we have 2 blocks right next to each other. However, these blocks don't overlap. In fact, lets move the new block one column to the right just to better see how they are separate blocks.

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> +</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  <td>  </td></td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf" style="border:2px solid blue">Hi</td><td id="b">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 3</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  <td>  </td></td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> *</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  <td>  </td></td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 5</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 6</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 8</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue"> 2</td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="b" style="border-left:2px solid blue">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

In this case, the right side of the frame on the new block is no longer visible on the grid,
but that's okay because block borders and block frames are just for our benefit as users to better understand where blocks begin and end.
Only the canvas of a block must be displayed on the grid. The filled cells, which are always on a canvas, are ultimately what are saved to the CSV file.

Let's move the new block back to where it was.

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> +</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf" style="border:2px solid blue">Hi</td><td id="b">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 3</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> *</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 5</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 6</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 8</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue"> 2</td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="b" style="border-left:2px solid blue">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

We still just have two separate blocks.

Now let's move the new block one more column to the left.

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td style="background-color:Yellow"> 🔗</td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">   </td><td style="background-color:Yellow"> 🔗</td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> +</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td style="background-color:Yellow"> 🔗</td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf" style="border:2px solid blue">Hi</td><td id="b">  </td><td id="f">  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 3</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td style="background-color:Yellow"> 🔗</td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> *</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td style="background-color:Yellow"> 🔗</td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 5</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 6</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 8</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue"> 2</td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="b" style="border-left:2px solid blue">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Now we have created a block cluster with two blocks in it.
These blocks are linked now, as can be seen by the yellow background and the `🔗` symbols which are just formatting symbols automatically added by the editor for our benefit (but will not be saved to the underlying CSV file).

If we keep moving the new block one more column to the left, then we still have a block cluster with two blocks in it, but now they are locked, not just linked:

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td style="background-color:Yellow"> 🔗</td><td style="background-color:Yellow"> 🔗</td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td style="background-color:Orange"> 🔒</td><td style="background-color:Orange"> 🔒</td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> +</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue">  </td><td style="background-color:Orange"> 🔒</td><td style="border-right:2px solid blue;background-color:Orange"> 🔒</td><td id="ccf" style="border:2px solid blue">Hi</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 3</td><td id="cce" style="border-right:2px solid blue">  </td><td style="background-color:Orange"> 🔒</td><td style="background-color:Orange"> 🔒</td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> *</td><td id="cce" style="border-right:2px solid blue">  </td><td style="background-color:Orange"> 🔒</td><td style="background-color:Yellow"> 🔗</td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 5</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue"> 6</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 8</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue"> 2</td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="b" style="border-left:2px solid blue">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Some border/frame cells are yellow with a `🔗` symbol in them and other border/frame cells are orange with a `🔒` symbol in them. Which color and symbol is used depends upon whether or not that cell is where just the frames from the two blocks overlap (yellow with a `🔗` symbol) or if that cell is where a frame and a border from two separate blocks overlap (orange with a `🔒` symbol).

If _any_ border/frame cells shared by two blocks are orange and have a `🔒` symbol in them, then that means those blocks are locked together.

Only two blocks are ever linked or locked, not more, even though there may be more than 2 blocks in a block cluster. Each pair of overlapping blocks in that cluster would have a unique linked/locked relationship.

Linked block pairs or locked block pairs can be used to better convey the relationships between the concepts represented by two blocks. We'll talk a little bit more about how these linked/locked block relationships can be used later.

Ok, so let's keep moving our new block one column to the left and see what happens....

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> +</td><td id="cce">  </td><td style="background-color:#463E3F;border-right:2px solid yellow">  </td><td style="border-right:2px solid yellow;background-color:#C2DFFF">  </td><td id="ccf" style="border-top:2px solid blue; border-right:2px solid blue">Hi</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 3</td><td style="background-color:#463E3F;border-right:2px solid yellow">  </td><td style="background-color:#C2DFFF"></td><td style="background-color:#C2DFFF;border-right:2px solid blue"></td><td id="b">  </td><td id="f">  <td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> *</td><td style="background-color:#463E3F;border-right:2px solid yellow">  </td><td style="background-color:#C2DFFF"></td><td style="background-color:#C2DFFF;border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td style="border-right:2px solid yellow;background-color:white;color:black;font-weight:bold"> 5</td><td style="background-color:#C2DFFF"></td><td style="background-color:#C2DFFF;border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td style="border-right:2px solid yellow;background-color:white;color:black;font-weight:bold"> 6</td><td style="background-color:#C2DFFF"></td><td style="background-color:#C2DFFF;border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 8</td><td style="background-color:#463E3F;border-right:2px solid yellow">  </td><td style=";background-color:#C2DFFF"></td><td style=";border-right:2px solid blue;background-color:#C2DFFF"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue"> 2</td><td style="background-color:#463E3F;border-bottom:2px solid blue;border-right:2px solid yellow">  </td><td style="border-bottom:2px solid blue;background-color:#C2DFFF"></td><td style="border-bottom:2px solid blue;border-right:2px solid blue;background-color:#C2DFFF"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

The two blocks have now merged into one. This new block still has only one canvas, as all blocks do. However, the canvas now has **two** _cell clusters_ on it. The first cell cluster is the LISP-style code that we added originally. The second cell cluster only has a single filled cell with the word `Hi` in it.

The empty part of the canvas where there are no cell clusters is light blue. Each cell cluster on the canvas is outlined with the color yellow (except where it overlaps with the blue canvas outline).

> Notice how the cell cluster on the left has a rectangular shape even though all the cells in that cell cluster are not filled (the ones that have a dark gray background). Cell clusters are always rectangular shaped even if all the cells in that cell cluster are not filled cells. This makes cell clusters much easier to use and reason about. The same is true for canvases. The canvas of every block is always rectangular-shaped even if the filled cells on it don't form a perfect rectangle.

A canvas can have many cell clusters on it and the positioning of these cell clusters relative to one another on the canvas is very important for conveying data relationships as we'll see later.

Now that these cell clusters are both a part of the same block, they move together across the surface of the grid.
Let's move this block one column to the right to demonstrate that.

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> +</td><td id="cce">  </td><td style="background-color:#463E3F;border-right:2px solid yellow">  </td><td style="border-right:2px solid yellow;background-color:#C2DFFF">  </td><td id="ccf" style="border-top:2px solid blue; border-right:2px solid blue">Hi</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 3</td><td style="background-color:#463E3F;border-right:2px solid yellow">  </td><td style="background-color:#C2DFFF"></td><td style="background-color:#C2DFFF;border-right:2px solid blue"></td><td id="b">  </td><td id="f">  <td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> *</td><td style="background-color:#463E3F;border-right:2px solid yellow">  </td><td style="background-color:#C2DFFF"></td><td style="background-color:#C2DFFF;border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td style="border-right:2px solid yellow;background-color:white;color:black;font-weight:bold"> 5</td><td style="background-color:#C2DFFF"></td><td style="background-color:#C2DFFF;border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td style="border-right:2px solid yellow;background-color:white;color:black;font-weight:bold"> 6</td><td style="background-color:#C2DFFF"></td><td style="background-color:#C2DFFF;border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf"> 8</td><td style="background-color:#463E3F;;border-right:2px solid yellow">  </td><td style=";background-color:#C2DFFF"></td><td style=";border-right:2px solid blue;background-color:#C2DFFF"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue"> 2</td><td style="background-color:#463E3F;border-bottom:2px solid blue;border-right:2px solid yellow">  </td><td style="border-bottom:2px solid blue;background-color:#C2DFFF"></td><td style="border-bottom:2px solid blue;border-right:2px solid blue;background-color:#C2DFFF"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Cell clusters, blocks, and block clusters can be very useful for representing very complex concepts and data in a very clear manner.
We'll look more at them in just a bit.

For now, let's see how this data will be saved to the underlying CSV file.

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td> +</td><td>  </td><td>  </td><td>  </td><td>Hi</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 3</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td> *</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td> 5</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td> 6</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 8</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 2</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

All formatting is lost when the grid is saved in the underlying CSV file format because CSV is just a plain text file format.

However, that is not a problem because the TreeTable editor will simply reproduce the formatting when the file is reopened in that editor. This is much like what happens in an IDE (used by programmers to write software) when opening a plain text source code file. The IDE highlights and formats the plain text to make it easier for the developer to understand the source code.

By being able to save the data to a plain text format like CSV, treets can easily be transmitted across the internet to other users and programs.

# Execution Model

Let's look at how functions execute in TreeTable.

When a cell cluster contains a tree structure, that tree can be used to represent hierarchical data. Computer programming instructions can be thought of as hierarchical data. An example of this is the LISP code we just looked at (`(+ 3 (* 5 6) 8 2)`) and were able to represent as a tree-like structure on a grid:

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td> +</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 3</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td> *</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td> 5</td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td> 6</td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 8</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 2</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

The way those programming instructions were represented on a grid was first by splitting up every element (called a "token" in programming) and putting each element in its own cell (except for the parentheses which were there merely to represent how the elements were grouped together into a hierarchy). As mentioned earlier, <mark>the positioning of elements on a grid in relation to one another is the key concept in TreeTable</mark>.

The first element (again, not considering the parentheses) was the element `+` which represents an operator (aka function). An operator usually needs arguments to be sent to it in order to have something to operate on. Those arguments, also called operands, appear beginning in the cell that is one row down and one column to the right of the operator.

The operands then continue in the cells sequentially downwards from there in a list one after the other. However, an operand can also be an operator as well so the second operand to the `+` operator is another operator, the `*` symbol which represents the multiplication operator. The first argument to this multiplication operator appears in the cell one row down and one column to the right, the `5`.

Once we are ready to turn operators and operands into a result, in other words once we are ready to run the functions, the question is - what exactly happens and in what order?

As we talked about with "pure functions", the nice thing is that we can process any of the functions in any order as long as the inputs are ready. So, in the case of the multiplication operator `*`, the operands are `5` and `6` which are just simple numbers and are ready to be processed at any time. Since that operation is the most deeply-nested operations in our treet, we could process it first.

To process `(* 5 6)` we could run the calculation and return a result. In this case the result is 30. We could then replace the _operator_ in the grid with that _result_ and then remove the operands. When we remove the operands (`5` and `6`) we can also remove those rows from the treet which moves the `8` and `2` up also, like this:

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td> +</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 3</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>30</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 8</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 2</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

We've now replaced an operator and some operands with a _result_.

From here, we can do the same thing with the `+` operation and replace that _operator_ with its _result_:

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>43</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

That's how operations "execute" in TreeTable.

First, the operations are replaced with their result. Second, the surrounding elements are repositioned to accommodate.

The nice thing about this execution model is that you can see the operations as they process. TreeTable calls this "resolving." In this case, the operations were resolved to their calculated result.

There are multiple types of "resolvers" in TreeTable, though.

- Some execute operations, like this.
- Others, allow you to "zoom out" on recursive grids to see how the groups of cells combine into a single cell. (These types of resolvers can be combined with the first type to "execute" these recursive grids as well.)
- Other resolvers might be used for teaching where you might show a concept in it's simplest form and then "zoom in" to more complex versions of that concept according to certain rules.

These resolvers are the set of rules that tell a TreeTable viewer/program how to modify the cells as certain actions are taken (by the user or another program).

The resolvers that execute functions like this work basically the same way on a recursive grid. Let's look at those next.

# Recursion

TreeTable offers a multitude of ways to take advantage of recursion.

Recursion is when a part is the same as the whole.

For instance, if a picture is recursive then a part of that picture looks the same as the whole picture. What's weird then is that inner whole also has a part that looks like the whole, which also has a part that looks like the whole, which also has a part that looks like the wholew ... and we could go on forever.

Recursion is kinda like a cycle or a loop. Different programming languages have different ways of doing things. Some programming languages use loops to do something repeatedly, other programming languages use recursion instead of loops.

Recursive functions have a part that does the same thing as the whole function. However, in order to prevent the developer from having to copy and paste part of that function over and over again (like you might literally have to do if you were making a recursive picture), the developer will just use the name of that function inside the function itself - meaning the function will reach a point where it calls itself.

In a computer this makes sense only because the data used by the function is placed on the stack before it is called, so calling that function from within that function just means that another block of data for that function is then placed even higher on the stack and the function is called again with that new data. This process happens over and over again, depending upon how many times it takes the recursive function to reach a "terminal" state where it doesn't have to call itself again.

Then the function "returns" that terminal value, which is received by the previous call of that function. That previous call of the function then "returns" its value which is received by the function call prior to that, and on and on until the very first call of the function gets back control. This type of recursive function causes the stack to grow with each function call meaning the stack may eventually run out of room, causing a "stack overflow."

However, there are ways of writing recursive functions that don't have to "return" all the way back to the first call of the function. Instead, whenever the "terminal" state is reached then the recursive function is finished. These types of recursive functions are called "tail call" functions and are generally preferred.

## Recursive Cells and Grids

In TreeTable, you can have recursive functions. You can also have recursive cells, though, where a part of that cell looks like the whole cell. In other words, a cell can have a grid inside of it. This can be a literal grid, like a block of text in CSV format, or it can be a virtual grid because the cell merely contains a link to a grid somewhere else. You can then use a TreeTable editor to "zoom in" on this cell and view the grid inside of it. You could then "zoom out" of that inner grid to see the cell again.

When you zoom in to a cell that has a grid inside of it, that cell is recursive and is called a "recursive cell."

When you zoom out of a grid and you end up in a cell, that grid is recursive and is called a "recursive grid."

So recursive cell has a recursive grid inside of it, and a recursive grid is inside a recursive cell. Of course, this could be layered ad infinitum so that a recusive grid has a recursive cell inside which has a recursive grid, etc, etc.

You could also have a grid that is not inside a CSV file that is still recursive, though. You can place special markers around one area of a grid that you want to treat as recursive and then use a TreeTable editor to "zoom out" on this area of the grid to form a smaller grid - or even a single cell.

# Types of Data Files

Data files are traditionally grouped into 3 different categories:

- **Unstructured Data Files** - These files aren't usually text files so they don't have any structure to the data inside them, except in a compressed binary format like JPEG or PDF.
- **Semi-Structured Data Files** - These files are text files and have some structure and schema associated with them and this structure helps programs to interpet them. XML and JSON are in this category.
- **Structured Data Files** - These are the files behind large database systems where all the data is highly structured and information about the data and its relationships can easily be determined by the program, even though these files are usually binary files and not text files.

## TreeTable Introduces a New Data Category

Due to the more complex relationships that can be represented by treets, TreeTable introduces a new category of data formats.

- **Self-Structured Data** - These files contain not only the data and the schema but all rules associated with the data which allow these files to act as stand-alone data repositories requiring no external dependencies, besides a TreeTable parsing library like this one.

For example, below is a self-structured treet that could be used to replace JSON in an API call.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Schema</td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ccf">Rules</td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ccf">Data</td><td id="ccf"> 1</td><td id="ccf"> 2</td><td id="ccf"> 3</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="h">Root</td><td id="cce">  </td><td id="cce">  </td><td id="ce">  </td><td id="h">Type</td><td id="h">Min</td><td id="h">Max</td><td id="h">Req</td><td id="h">Next</td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">employee</td><td id="cce">  </td><td id="cce">  </td><td id="ce">  </td><td id="ccf">object</td><td id="ccf">`</td><td id="ccf">`</td><td id="ccf">Y</td><td id="ccf">`</td><td id="ce">  </td><td id="ce">  </td><td id="ccf">`</td><td id="ccf">`</td><td id="ccf">`</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">id</td><td id="cce">  </td><td id="ce">  </td><td id="ccf">integer</td><td id="ccf">1</td><td id="ccf">500</td><td id="ccf">Y</td><td id="ccf">124</td><td id="ce">  </td><td id="ce">  </td><td id="ccf">121</td><td id="ccf">108</td><td id="ccf">123</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">name</td><td id="cce">  </td><td id="ce">  </td><td id="ccf">object</td><td id="ccf">`</td><td id="ccf">`</td><td id="ccf">N</td><td id="ccf">`</td><td id="ce">  </td><td id="ce">  </td><td id="ccf">`</td><td id="ccf">`</td><td id="ccf">`</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">first</td><td id="ce">  </td><td id="ccf">string</td><td id="ccf">5</td><td id="ccf">50</td><td id="ccf">Y</td><td id="ccf">`</td><td id="ce">  </td><td id="ce">  </td><td id="ccf">Martha</td><td id="ccf">Phil</td><td id="ccf">Ed</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">last</td><td id="ce">  </td><td id="ccf">string</td><td id="ccf">5</td><td id="ccf">50</td><td id="ccf">Y</td><td id="ccf">`</td><td id="ce">  </td><td id="ce">  </td><td id="ccf">Jones</td><td id="ccf">Smith</td><td id="ccf">Garcia</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">team</td><td id="cce">  </td><td id="ce">  </td><td id="ccf">object</td><td id="ccf">`</td><td id="ccf">`</td><td id="ccf">N</td><td id="ccf">`</td><td id="ce">  </td><td id="ce">  </td><td id="ccf">`</td><td id="ccf">`</td><td id="ccf">`</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">id</td><td id="ce">  </td><td id="ccf">integer</td><td id="ccf">1</td><td id="ccf">100</td><td id="ccf">Y</td><td id="ccf">13</td><td id="ce">  </td><td id="ce">  </td><td id="ccf">8</td><td id="ccf">3</td><td id="ccf">5</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

This treet allows the schema, rules and data to all be conveyed inside the same small 2-dimensional structure. Any program capable of converting a CSV file into TreeTable structures (possible with this library among others) can determine how this data is structured and can verify that the validation rules have been followed.

Some of these structural definitions are a part of TreeTable itself, while others can be created by the user. In order to convey the definitions of all these structures together in the same file, a way of defining structural patterns and their meanings must be available. These structural definitions help other programs understand the meaning of the data in a TreeTable file. All of these structural definitions can be conveyed inside the same CSV file as the data itself making a TreeTable file truly self-structured.

Let's look more at how parsing of these TreeTable CSV files happens.

# Parsing CSV Files into TreeTable Structures

At its most basic level, a spreadsheet is a 2-dimensional arrangement of squares that [tile the plane](https://en.wikipedia.org/wiki/Tessellation), or in other words cover a surface without leaving any gaps. Various shapes like a square, hexagon, and equilateral triangle will tile the plane. You could also think of each cell in a spreadsheet as a point instead of a square. In that sense, the points are positioned in a regular pattern on a plane and can be thought of as having vertical and horizontal lines that connect each point to the points nearby.

TreeTable starts with the assumption of a 2-dimensional plane with these squares, or points, regularly positioned in rows and columns. However, this is a limited view of what is possible when interpreting structures to have specific meanings as TreeTable does. For instance, it would also be possible to think of 3-dimensional structures that have certain patterns and convey certain meanings or to think of each cell as a hexagon instead of a square which would allow a completely different set of 2-dimensional structures to be defined versus what is possible with a 2-dimensional plane covered with squares.

However, due to the ubiquity of the spreadsheet model, there are many benefits to creating a programming tenant that is limited to a subset of the possible multi-dimensional structures that could be defined, namely structures that can inhabit a 2-dimensional plane of squares. Therefore, this is the start of TreeTable but is by no means the only possibility for programming in this way.

## Parsing Blocks

One of the first things a TreeTable parser would need to do is find all the blocks in the grid. Various algorithms are available to do this, but we'll consider a simple one that first looks through all the cells in the grid to find the filled cells and then attempts to find a rectangle of empty cells around each filled cell.

If the parser can find a rectangle of empty cells around a filled cell, then it may have found a block with a single filled cell on its canvas. However, a block does not have only one rectangle of empty cells around the canvas, but two.

So, once the parser found the first rectangle of empty cells around the filled cell, it would then keep going and attempt to find another rectangle of empty cells around that. If it succeeded, it would have found its first block on the grid. Again, that block would have one cell (and therefore one cell cluster) on its canvas.

Let's look at a picture of it.

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf" style="border:2px solid blue">Hi</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

The light gray cells are the outer rectangle of empty cells (called the frame) and the beige cells are the inner rectangle of empty cells (called the border). The canvas has a blue outline and only has one filled cell on it with the text `Hi` inside.

Again, the color coding and formatting is automatically added by the TreeTable editor and is _not_ controlled by the user. However, the formatting assists the user in seeing how the parser is interpreting the structures on the grid.

It is possible to edit TreeTable grids in a plain text editor since they are just CSV files. However, TreeTable editors can be very helpful for the user much like professional text editors (also called Integrated Development Environments or "IDE"s) can be very helpful for writing programs using traditional programming languages.

In fact, since traditional programming language text files can fit inside cells on a TreeTable grid, many TreeTable editors combine the benefits of an IDE for traditional programming languages with the structural formatting useful for TreeTable editing. This feature is what allows so many different programs written in different languages to interact so well on a TreeTable grid.

### Defining Positions

If you look at the block above, including its canvas, frame, and border, you'll notice that it is a 5x5 rectangle. A 5x5 rectangle has 25 squares in it. The english alphabet has 26 letters in it. This allows us to conveniently name each of these squares in the 5x5 grid after a letter of the alphabet and have one letter left over.

Let's add those letters to the grid (except for `m` which is where the filled cell resides):

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td id="f"> a</td><td id="f"> b</td><td id="f"> c</td><td id="f"> d</td><td id="f"> e</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td id="f"> f</td><td style="background-color:Beige;color:black"> g</td><td style="border-bottom:2px solid blue;background-color:Beige;color:black"> h</td><td style="background-color:Beige;color:black"> i</td><td id="f"> j</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td id="f"> k</td><td style="border-right:2px solid blue;background-color:Beige;color:black"> l</td><td id="ccf" style="border:2px solid blue">Hi</td><td style="background-color:Beige;color:black"> n</td><td id="f"> o</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td id="f"> p</td><td style="background-color:Beige;color:black"> q</td><td style="background-color:Beige;color:black"> r</td><td style="background-color:Beige;color:black"> s</td><td id="f"> t</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td id="f"> u</td><td id="f"> v</td><td id="f"> w</td><td id="f"> x</td><td id="f"> y</td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

These letters give us a clear way to refer to the cells around a particular cell. For instance, since this is a one-cell block, we know that all the cells represented by the letters are empty except the cell represented by the letter `m`.

As we continue to parse blocks to see what structures are inside of them, we'll place this virtual 5x5 grid of letters over each filled cell (always with the letter `m` representing the filled cell) so we can be able to easily refer to the cells around that filled cell. This will help us to both define structures when we are creating our program and find structures when we are parsing through a CSV file to understand a program that we have been given.

The letter `z` would represent a 5x5 grid of cells that is completely empty.

### Defining Directions

In addition to defining the position of cells relative to one another using the alphabetical grid above, we'll also need a way to define the different directions we can move around a grid from any particular cell. For that, we'll use numbers.

For instance, let's look at the same block as above, except without any formatting.

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>Hi</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Now, let's consider all the directions you could move from this cell and overlay the numbers 1-9 in those directions (except for the number 5 which would be where the word `Hi` is).

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 1</td><td> 2</td><td> 3</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 4</td><td>Hi</td><td> 6</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td> 7</td><td> 8</td><td> 9</td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

If we were to move in the `1` direction, then we would move diagonally up and to the left. If we were to move in the `6` direction, then we would move to the right, and so on.

As with our alphabetical grid, we have one number left over that we can't fit in the 3x3 rectangle: the number `0`. We'll use the number zero to represent the direction towards us, in other words "zooming out" from the surface of the grid to a higher level.

Again, as we mentioned in the beginning, one of the main differences between a TreeTable grid and a spreadsheet is the idea that you can zoom out to a higher level grid or even zoom in to a lower-level grid, which is what direction the number `5` will represent for us. So `0` zooms out, `5` zooms in, and every other number represents a direction we can travel on the existing level.

### 2D Regex

In order to parse a block from a grid, you don't have to know all the contents of all the cells on the grid. You merely have to have a binary representation of the grid with 1 representing a filled cell and 0 representing an empty cell. Reducing a CSV file down to a binary grid makes it much easier and faster to parse through the grid to find structures.

This type of binary parsing is how we'll do much of our parsing in this library. We'll find the positions of filled cells relative to one another and be able to tell what types of structures we're dealing with, even if we don't know the contents of the cells in those structures. (Eventually this will lead us to highly-efficient data transfer formats for treets that allow complex structures to be transmitted over the wire using a very small number of bytes. We'll see more about this later.)

However, it would also be nice to use the contents of cells when parsing so we can start defining more detailed structures that consider more than just the relative positioning of the filled cells on the grid. For that we need something like "regular expressions" (regex for short) which are used to find patterns in sequences of text.

Ideally, we would be able to combine these two things, defining and parsing structures on a grid purely based upon the relative positioning of filled cells and secondly being able to consider the contents of the filled cells when defining and parsing through the structures. This leads to the idea of a 2D regex.

A traditional regex uses a sequence of text to define the patterns that might be found in another sequence of text. The patterns are represented with special characters that might mean things like "look for the text pattern 'ABC' to occur at least one time"

> (ABC)+

or "find the letters CAA or CDH followed by 7 digits"

> (CAA|CDH)[0-9]{7}

However, traditional regular expressions don't have any way to consider a 2-dimensional grid of cells and how there might be structural patterns present in that grid.

To help us achieve this, we'll need to create some kind of system to define and identify structural patterns on a 2-dimensional grid of cells. Also, since we may need to consider text patterns that may be present in multiple cells at the same time, we'll need a way to combine the traditional regular expression language with this structural pattern language in order to achieve maximum flexibility.

We want to be able to say "look for a tree-like structure that has text starting with 'API' in it's root cell". This pattern may help us to define a treet that we use frequently to represent the routes and methods used in each of our API apps, for instance. We saw an example of this in our earlier API sample treet.

Before we define the details of our 2D regex system, though, we'll need to know what can be assumed about the input before we parse it.

### Assumptions

1. We are only dealing with 2-dimensional grids, not 3-dimensional grids or any other type
2. The 2-dimensional grid is perfectly covered with cells (aka squares or points) that are aligned horizontally in rows and vertically in columns. We are not considering other arrangements of points on a plane.
3. Any grid is considered to be a rectangular cutout from an infinite plane. Grids can grow or shrink without any consequences to the structures inside the grid. A grid is used just to give structures locality but the boundaries of the grid have no significant impact on the structures on the grid.
4. Each cell on the grid can contain text and text only
5. Cells that have text (other than just whitespace characters like tabs or new-lines) are considered "filled cells". All other cells are considered "empty cells".
6. All grids can be saved as a CSV file
7. The grid can also be represented in binary form with 1s representing filled cells and 0s representing empty cells
8. The initial parsing of blocks, cell clusters, and block clusters happens at the "ground level".
   - Multiple cells can be combined to make higher level cells
   - Individual cells can contain lower level cells (because they contain CSV inside of them, a pointer to a grid somewhere else, or otherwise)
9. Once the ground level is parsed, parsing continues at all lower level cells recursively followed by all higher level cells recursively
   - Typically higher-level cells will not be automatically parsed unless special markers are present on the grid indicating that an area of the grid should be parsed for higher-level grids. Since groups of squares can be successively combined into larger and large groups of squares ad infinitum, these special markers will typically indicate how many levels up the higher-level cells should be parsed.
10. TreeTable assumes that the root of a cell cluster is at the top left. This works whether or not the clusters have been transposed or not (much like when copying a range of cells on a spreadsheet and "transposing" the cells when pasting them back to the spreadsheet) as the top left does not change in either case. For instance, trees grown down and to the right, or to the right and down. Tables grown down or to the right.
    - Aligning multiple cell clusters in a vertical orientation as opposed to the default horizontal orientation can be helpful for viewing multiple aspects of a dataset at the same time such as the schema, rules, and data rows as we saw in the earlier API example.
11. Once the structure _inside_ each cell cluster is parsed, then the relationships _between_ these cell clusters can be parsed.
    - For instance in the API example, one cell cluster containing a tree is often associated row by row with another cell cluster containing a table. This arrangement can tell a more meaningful story about the data than either data set alone and is frequently used (thus the name TreeTable).
    - This is one of the primary places where user-defined structural definitions are used. Users can specify what a specific set of cell clusters in certain positions mean which can be used later by another program to interpret these structures. These definitions use the 2D Regex system discussed earlier which allows the user to refer to either the content of certain cells, the position of cell clusters on the canvas, or both when creating their structural definition.

### Tenant-Defined Structures

Out of the box, the TreeTable programming tenant will automatically find the following structures on a grid. These predefined structures are much like keywords in a traditional programming language as they form the foundation that allows the user to convey more complex concepts by combining these predefined structures.

- **Blocks** which include a canvas, border, and frame
- **Cell Clusters** which exist on the canvas of a block

  Structures parsed _inside_ cell clusters:

  - **Trees** - These usually represent hierarchical data like files and folders on your computer, org charts, or nested data like you would typically find in a JSON file.
  - **Tables** - These are found frequently in spreadsheets with an optional header row and then one or more rows of data. Every row of data shares the same column names and types, each row just having different values in those columns.
  - **Lists** - a simple linear grouping of items
  - **Key & Value(s)** - These represent data where a single label is associated with a single value, often called key/value pairs or a dictionary.
  - **Mixed Structures** - A tree can contain a node whose value is a table. A table can contain a cell whose value is a tree. Virtually any combination of structures can be used in a cell cluster. Here are a few examples:

    - **Example 1** - Example 1 description

- **Block Clusters** typically exist when the frames of multiple blocks overlap each other. A block cluster can contain a single block, though, just like a block canvas can contain a single cell cluster or a cell cluster can contain a single cell. If a block cluster contains multiple blocks then each _pair_ of overlapping blocks is considered to be either **linked** or **locked**. A single block in a cluster can be in a linked relationship with one block while also being in a locked relationship with another block, depending upon how the frames of these blocks overlap each other.
  - **Linked** blocks refers to a pair of two blocks in a block cluster that have frames that overlap the other block's frame but not its border.
    - Linked blocks may represent a general relationship two blocks have with each other, such as one block that has specific details on how to parse another block.
  - **Locked** blocks refers to a pair of two blocks in a block cluster that have frames that overlap the other block's frame _and_ its border.
    - Locked blocks could be used to match up two blocks to each other row-to-row (when positioned horizontally next to each other), or column-to-column (when positioned vertically one above the other). These locked blocks could be used to convey specific relationships between the rows of the blocks much like cell clusters can be matched up row-to-row to denote a specific relationship that exists between each row in one cluster and the corresponding row in the other cluster like in the API example we saw earlier.

### User-Defined Structures

- **Cluster Templates**

  - **Cell Cluster Templates**

    Once the structures _inside_ each cell cluster are parsed, then the relationships _between_ these cell clusters can be parsed.

    - For instance, as in the API example we saw at the beginning, one cell cluster containing a tree is often associated row by row with another cell cluster containing a table, in other words a tree-table as mentioned earlier.
    - This is one of the primary places where user-defined structural definitions are used.

  - **Block Cluster Templates**

    Once the blocks _inside_ each block cluster are parsed, then the relationships _between_ the blocks can be parsed. Typically there is only one block in a block cluster, so this step is not needed. However, block cluster templates are very powerful and are used to model much larger data relationships than can typically fit inside a single block.

    - For instance, ...

  - **Combining Cell and Block Cluster Templates**

    Cluster templates can incoporate definitions of both cell cluster templates and block cluster templates allowing for highly complex and configurable templates to be created. These templates can be used to document very complex domains and architectures.

### Parsing Cells

Each individual cell is either filled or empty. If it is filled, then it has text and only text inside of it (no images or binary data of any kind). Certain combinations of text characters have special meaning in TreeTable. For instance, here is a list of characters that change the meaning of the cell if they appear at the very _beginning_ of the text in the cell:

| Character(s) |  Description  |                                      Explanation of Use                                       |
| :----------: | :-----------: | :-------------------------------------------------------------------------------------------: |
|    **,**     |     Comma     |                                      Cell w/ CSV inside                                       |
|    **`**     |   Backtick    |                 Structural only, no content. Comment can be added afterwards.                 |
|    **//**    | 2 Backslashes | Structural only, no content. Indicates not to use this cell. Comment can be added afterwards. |
|    **?**     |       ?       |                                          Pointer to                                           |

#### Additional Syntax (Work in Progress)

<<-(https://example.com/1)->>

<<-\[The Name\]\(https://thelink.com\)->>

<<-(A1:B3)->>

<<-(R1C1:R3C2)->>

<<-)3(->>

<<-|ID1234|->>

<<->ABC<->>

<<-{ABC123}->>

# Compiling Treets into High-Level Languages

Much as compilers are used to convert source code files written in high-level languages like Java or Python into various low-level assembly languages, TreeTable source code files can be compiled down into various high-level languages. This allows TreeTable functions to be defined using treets and then various compilers could interpret those TreeTable files and produce the source code files needed to run those functions in a specific high-level language, like Python.

This allows TreeTable files to be more like configuration files than source code files. Configuration files generally express less detail and more user intent than source code files. However, because they are created in a very structured way, a program can be written that understands the intent behind the TreeTable structures and can translate that intent into source code files in various high-level languages.

This interpretation could even be done on the fly. For instance, servers can express the intent of the application and clients can then interpret that intent according to the programming language and platform that they're using. This loose coupling affords many new use cases that were not feasible before.

You could for instance have a ‘remove non-alpha numeric characters’ function that could be defined in TreeTable and then used in both SQL and in a traditional programming language like C#. The compiler would just have to create SQL code and C-sharp code for that function based on the configuration for that function in TreeTable. This would allow users to share the same basic constructs across very different paradigms and think at much higher levels of abstraction than is possible even with a high-level language like Python that can be run on multiple types of computers.

## Configuration-Based Applications

Since code written in high-level languages would no longer need to be written manually in this model, just as assembly language is no longer written manually, applications could move more towards being configuration-based rather than code-based. As long as the user can express their intent by configuring a predefined TreeTable template, or even defining their own template, then that template can be used by the compiler to automatically write the high-level language code on behalf of the user without the need for a developer. Of course, the creation of these templates requires more advanced knowledge, as does their use to some extent, but the knowledge level required to configure these applications may be no more advanced than that of experienced spreadsheet users.

TreeTable also allows the user to see _how_ a request was processed since you can display the definition of a function right next to the data used by any one particular run of that function (perhaps by using a block cluster with two locked blocks matched up row-to-row, for instance). The treets used to show how a request was processed might even be interactive, allowing the user to toy with the function and/or the data from specific runs of the function while seeing the new results as they update the functions. This way they can see if they can figure out how to fix the problem by being able to directly manipulate the code and data.

This "live debugging" would allow a much more gentle learning curve for users to go from configuring applications based on templates to actually building the templates themselves. Using the templates, and potentially correcting them on the fly, lets users understand how the templates themselves work and how they might build them in the future.

# Positioning of Treets

Every cell has a position on a grid, therefore the contents of every cell have a position too. This means that functions have a position. That’s true of functions in 1-dimensional text files as well, however the locations of function names on this dimension are not used within that file to refer to that function. It’s only after the text file is parsed by a compiler are the references to functions made by name only, not location (at least not location in the source file, only location in memory).

TreeTable is different in that references to functions can be made by location from inside the source file itself. These references don’t necessarily have to be calls to the function but can provide much more subtle linkages that allow a richer semantic model to be composed.

And, of course, not just functions have positions but every cell and every structure has a position. This can allow for more extreme decoupling since data can just exist on a grid without any knowledge that other cells/structures are linking to it.

## Mixing Paradigms

TreeTable is a 2-dimensional paradigm which makes it essentially orthogonal to the 1-dimensional world of text. The location of source code files generally doesn't matter in relation to other source code files as long as linkages between modules can be maintained when one code file references another. Giving source code files a unique location on a grid adds an interesting new avenue of exploration.

Entire architectures can be placed on a grid with the application code, rules, requirements, documentation, database schema, and even data present together in a meaningful way. The structures that house the elements and their placement on the grid reflect the relationships of these components to one another.

Microservices are generally hailed as a way to completely decouple the code and data created by one team from the code and data created by another team. However, TreeTable allows you to place these completely different slices of architecture together on the same grid to be able to reason about them together, even though they may not share programming languages or database technology. Since the 2-dimensional placement of source code on a grid is completely outside the paradigm of traditional programming languages, TreeTable can be used to coordinate and understand these relationships without affecting their execution environment.

# Communication Model Between Functions

Another form of decoupling occurs in the communication pathways between treets. Typically in a computer, all communication is linear since that is the nature of CPUs, RAM, motherboards, network connections, etc. They all use wires to transfer data which are a strictly linear medium. In TreeTable, as in most other programming languages, you create links between things by using a name or a location, or both. In file systems, for instance, such as that found on Windows computers, the name and the location of a file are synonymous with each other. Changing a file name changes its location in the file system.

Using a name and/or a location is typically the only way to draw a virtual line from one thing to another. In TreeTable, for instance, you can create a pointer from one cell to the location of another cell or you can refer to the contents of a cell by name, such as calling a function by using its name.

However, treets exist on a multi-dimensional plane and communication does not have to happen in a strictly linear fashion. When you move from a linear text format for encoding programming instructions (like traditional programming languages) to a multi-dimensional format for encoding programming instructions (like TreeTable), you begin to think about communication between components a little differently.

## Pure Functions

Two of the most frequent considerations in programming are "pure functions" and "side effects". The output produced by a pure function is strictly dependent upon the inputs passed to that function. Pure functions also don't change anything in their environment (creating "side effects"). It's a bit like someone being sick in bed.

1. You don't want them to get up so you bring them everything they need.
2. You don't want them to have to think about anything complicated so you keep your communications with them very short and simple.
3. You can always expect the same answer when you ask them something because they're just kinda going through the motions ("How you feeling?" "Not good.").
4. You keep them away from anyone else so they don't get them sick too.

Pure functions are the same way.

1. They don't go out and get anything they need, its all delivered to them via parameters.
2. You generally keep these functions small with only a few simple parameters. (not a required attribute for a function to be "pure" but is usually true)
3. They are very predictable because they always produce the same output when they're given the same input.
4. They have no effect on other functions or data in the environment.

When you think about functions in the light of TreeTable, though, you start to see their capabilities a little differently.

Traditionally, a function accepts inputs via its parameters. These inputs are usually passed to the function by putting the data for each parameter at a different location on the stack, and then "calling" the function and letting it know the location on the stack for each parameter. When finished, the function puts its output back on the stack at a specific location and the caller can then retrieve it after the function call completes.

This is a strictly linear process that only allows one set of programming instructions to be running at any point in time, whether its the function or the caller. Multiple cores on CPUs and the use of multiple CPUs to parallelize programming has given this linear process increased bandwidth but conceptually it still remains a strictly linear process.

The recent popularity of pure functions has come with the increased demand for parallel processing in the cloud. Pure functions prevent shared data from being locked during processing, since they don't share any data with anything else. It doesn't matter which computer, CPU, or core runs each function or even in what order, as long as the inputs are ready when the function is called. This allows functions later in the pipe to be called earlier if their inputs become ready early. Running a function takes time so preprocessing functions can speed up the whole program dramatically.

Also, there is a related programming technique called "partial function application" that allows functions to be called when only some of their inputs are ready. The result is typically another function with only the remaining inputs as parameters. This allows the original function to be "partially applied" to its inputs even though not all of its inputs are ready at the same time.

## Visualizing Function Execution

In TreeTable, the entire definition of a function along with its processing state during any one instantiation of that function can be visualized and preserved at any step along the way using TreeTable. You can see inside the function as it works and know exactly what it is doing because the process can be conceptualized as a tree and displayed as a treet. Even if the function has not complete processing, you can still see every step it has performed so far and what steps it hasn't yet performed. You could even go into that tree and change the function execution in real time. (This is very similar to Jonathan Edward's idea of "[reified programming](https://vimeo.com/228372549/8f5e39658b).")

With that in mind, partial function application could be even more robustly expanded to the point that you don’t just return a smaller function when not all the inputs are passed, but you hold a function in a partially completed state of execution awaiting its other inputs.

Here is brief example of a function in one block and its execution history in a linked block, for instance, showing a partially completed execution:

> Function Execution Example

Interrelated functions could even be visualized together on the same grid. You could imagine it as a holistic process that allows you to see how an entire program executes over time. But, of course, if you don't have linear routing of data from one one location to another, how do you get inputs to a function and then where do you route their outputs?

If you imagine a holistic process where everything that can happen across an entire grid of functions is happening at the same time, then data anywhere is data everywhere. Functions just begin processing automatically when their inputs become available and their outputs are then made available to other waiting functions instantaneously. Data is ubiquitously available instead of merely flowing through a pipe on its way to a destination.

The obvious question then is, how does ubiquitous data get routed properly? When a function is ready for an input, how does that data get properly matched to that function parameter if all the data is just available everywhere?

# Wave Computing

In computing, we rarely using broadcasting. We have cell phones that broadcast data...to a specific cell tower, but that is still just a linear transmission of data. No other phones in our area "hear" that signal or at least pay any attention to it. They merely wait on communication to come from a specific cell tower nearby. Point-to-point communication is how computing is done.

However, in other types of communication, such as walkie-talkies or even just speaking into a room full of people, people can communicate with one another non-linearly. There are multiple recipients of the communication, and multiple senders, all on the same "channel" (at least in the case of talking, not so much walkie-talkies which only really allow one person to speak at a time although multiple people can hear it).

How would computing change if we considered how to utilize a paradigm where nodes communicate via a medium that does not enforce linear communication? How would you "program" these nodes? How would these nodes take advantage of this new medium to perform logic, calculations, and communications?

Imagine how different life would be if we didn't have sound. We wouldn't know all the subtleties about our environment that we pick up by passively listening to it. We can tell when someone is walking up behind us because we can hear them. We can tell how hard an engine is working by the sound it produces. We can hear our name called in a busy restaurant when our order is ready, and so can everyone else. There is a lot of information available to us but we don’t use most of it. We just know what to listen for.

Functions don’t have ambient awareness of the events taking place around them. Their inputs must specifically be assigned to them using some sort of linear process.

What if functions did have ambient awareness? What if they were always passively “listening” like we do?

In fact, what if there were a bunch of functions all listening to each other but they didn’t do anything until they heard something they knew to listen for. Then there could be constant activity amongst these functions like the conversations in a busy restaurant.

Some functions might be programmed to only process inputs from certain other functions, like you might only listen to the conversation at your table. However, they might also benefit from listening passively to other functions or even just for certain messages, such as you listening for the restaurant staff to say your name when your order is ready or responding if anyone loudly says “Fire!”

These functions could still be pure and have no side effects, even though their actions might still produce “sounds” in the environment as they processed their inputs. Other functions could then listen for specific sounds from these functions and potentially even predict their output before they produced it.

The functions might even take a back seat to the messages being sent around. Each function wouldn’t necessarily produce a complete meaningful result but a partial result that could be combined with the partial results from other functions to produce an end result. This would be very similar to the idea of partial function _application_ except it would be partial function _results_.

## Programming Nonlinear Nodes in TreeTable

This is where TreeTable allows more expanded exploration into the possibilities of nonlinear computing. Imagine multiple recursive cells (cells with CSV inside of them) scattered across a grid in very specific locations. Each recursive cell contained a treet with a function that performed certain calculations. These treets were placed inside recursive cells so that each treet would only take up one cell on the grid, giving each function a very specific location relative to the others.

Now imagine this grid was reproduced in the real world by using nodes on a board where the nodes had the exact same layout as the recursive cells on the grid. The nodes on the board could be tiny computers with antennae that listened for inputs and then broadcast their outputs after running the function programmed into them from that recursive cell on the grid.

Computation could flow like waves across this array of nodes creating something we'll call "wave computing". Wave computing could be programmed in TreeTable using various paradigms and methods. The functions could listen for certain messages on certain frequencies, process those messages, and then broadcast a new message on a separate frequency. Frequencies may represent channels of communication or they may represent individual variables with the value for that variable being produced by multiple nodes at the same time. Radio waves could be used to communicate between the nodes, or light, or even sound.

The relative positioning of the nodes on the grid would affect how quickly messages would propagate between the nodes and these propagation characteristics could also be used somehow to facilitate even more interesting and complex computations.

Nodes could also use the relative strength of the signals being sent between various nodes. These combined signals could be used for computation where multiple nodes could calculate a result using different methods and the answer with the strongest combined signal wins.

This process would feel much like a spreadsheet recalculating all its values any time one cell value is changed. In fact, there may be two types of wave computers, digital and analogue.

Digital wave computers would work like a spreadsheet where discrete changes are made and then all the nodes on the grid update accordingly. Computing would proceed in this manner over and over one discrete change at a time.

Analog wave computers, on the other hand, would have nodes responding constantly to changes in the environment and other nodes would then respond to those nodes which could trigger some of the original nodes to respond and on and on, creating a constant ebb and flow of changes in the environment. Imagine a trading floor where traders constantly call out bids and asks while listening constantly for everyone else’s bids and asks so they can make a deal. There would be a constant hive of activity, all of it with a purpose which may not be obvious to observers.

Analog wave computers might still settle into a specific state, like digital wave computers. The difference is twofold. The settled state of an analog wave computer might be a repeating pattern of activity, not simply a situation where all nodes stop changing. Second, the settled state of an analog wave computer

A somewhat similar project to what we are discussing here was the [QUEN processor](https://www.jhuapl.edu/Content/techdigest/pdf/V10-N03/10-03-Dolecek.pdf) which was a Memory-linked Wavefront Array Processor (MWAP). It used the characteristics of propagating waves (not true broadcast waves, but messages moving linearly through nodes) of computation to process results using recursive functions running on each compute node. It achieved some remarkable results.

We'll look more at Wave Computing in the examples at the end of the page, but for now we'll look at some basic operators that could be used in wave computing. Here are some things you might want to do in a wave function and what operator you would use for that:

## Send Operators

| Operator |   Name    |     Values      | Persistence  |
| :------: | :-------: | :-------------: | :----------: |
|   `(`    |   pulse   |     1 value     |    1 time    |
|   `((`   | broadcast |     1 value     | continuously |
|  `(((`   |  packet   | multiple values |    1 time    |
|  `((((`  |  stream   | multiple values | continuously |

The operators above would be used when messages needed to be sent to other functions.

The equivalent functions below would be used when those types of messages needed to be received by a function (the direction of the operators is just reversed).

## Receive Operators

| Operator |   Name    |     Values      | Persistence  |
| :------: | :-------: | :-------------: | :----------: |
|   `)`    |   pulse   |     1 value     |    1 time    |
|   `))`   | broadcast |     1 value     | continuously |
|  `)))`   |  packet   | multiple values |    1 time    |
|  `))))`  |  stream   | multiple values | continuously |

For instance, if you wanted to create a function that just pulsed the number 3 once on channel 1 as soon as the computer turned on, you would create it like this:

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf"> (</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue">  C1</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue">  3</td><td id="b" style="border-left:2px solid blue">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

The first operand to the `(` operator could just be the channel you wanted to use (`C1` in this case for `Channel 1`) and the second operand could be the value you want to use (`3` in this case).

Of course, how would this function know what `Channel 1` meant? For this, you could convert the block above into a formal function with parameters and one of those parameters could be the channel to use.

Let's look at a little more interesting of an example for a function named `Add1UnlessOverMax` that:

1. accepted three parameters

   1. a variable named `Max`
   2. a channel named `Channel_A`
   3. a channel named `Channel_B`

2. waited for a pulse on `Channel_A` before it continued processing
3. when it heard a pulse, it would put the value of that pulse in a variable named `Value`
4. it would then check to see if the value of `Value` is less than or equal to `Max`
5. if so, it would add 1 to `Value` (using the `++` operator) and broadcast the new `Value` on `Channel_B`
6. started over at step 2 waiting for a pulse

In other words, this function would increment a number (the value of the pulse on `Channel_A`) if that number was less than or equal to the Max.

Here is what that would look like in TreeTable:

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf">Define</td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="cce" style="border-top:2px solid blue; border-right:2px solid blue"> </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf" style="color:blue">Add1UnlessOverMax</td><td id="cce">  </td><td id="cce">  </td><td  id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  <td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Max</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Channel_A</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Channel_B</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf">)</td><td id="cce">  </td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Channel_A</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Value</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf">if</td><td id="cce">  </td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf"><=</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Value</td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Max</td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">(</td><td id="cce">  </td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Channel_B</td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">++</td><td id="cce" style="border-right:2px solid blue"></td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-right:2px solid blue;border-bottom:2px solid blue">Value</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

The function could then be used like this:

<table>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b" style="border-bottom:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="ccf">Add1UnlessOverMax</td><td id="cce" style="border-right:2px solid blue">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue">  5</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce">  </td><td id="ccf" style="border-right:2px solid blue">440HZ</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b" style="border-right:2px solid blue">  </td><td id="cce" style="border-bottom:2px solid blue">  </td><td id="ccf" style="border-bottom:2px solid blue">110HZ</td><td id="b" style="border-left:2px solid blue">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
<tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Of course, as a block by itself, it's not very useful.

So, you could make it a part of a larger set of blocks that processed data in a loop up to 5 times.

> Insert Treet Here

There could even be special predicates (functions that only return a `true` or a `false`) in wave computing that could trigger other code to run only when they were true. For instance, what if you only wanted to do something if there is a change in a signal on a channel (it starts, stops, or the value of the signal changes) or if the channel has a certain status (nothing is being broadcast or something is being broadcast). Then you could use these operators that accept only a channel as a parameter.

| Operator | (Character) |   Name    |                   Description                   |
| :------: | :---------: | :-------: | :---------------------------------------------: |
|   `-`    |    dash     |  starts   |    a signal starts broadcasting on a channel    |
|   `.`    |     dot     |   stops   |    a signal stops broadcasting on a channel     |
|   `^`    |    caret    |  changes  |   the value of a signal on a channel changes    |
|   `~`    |    tilde    |  nothing  |  there is nothing being broadcast on a channel  |
|   `_`    | underscore  | something | there is something being broadcast on a channel |

These could be used like this:

> Insert Treet Here

You might also want to consider time as a part of these predicates and, say, look back at the history of statuses on a channel and see if they match up to a certain pattern before continuing.

For instance, you could retrieve the last 10 seconds on a channel and see if the status changes on that channel match the pattern `-.-`. In other words, in the last 10 seconds was there ever a point where a signal started, stopped, and then started again?

Wave computing could also think of each node as being "charged" and allowing it to lose energy over time, either reducing it's available output power gradually (analog) or waiting until the power output has reached a certain threshold and then it would not be able to broadcast at all (digital). The node could then be "charged up" by hearing certain inputs. As it heard more and more of those inputs, its energy would increase and it could start gradually (analog) or after a threshold (digital) start outputting a signal again.

# Exchanging Treets

A TreeTable grid can be exchanged with another user or computer by converting it to a CSV file and then sending that file over the internet. CSV files are often compressed using GZIP before being sent over the internet using the HTTP protocol allowing for very efficient transmission of treets. However, there are ways to make this process even more efficient.

## Binary Encoding of Treets

A TreeTable grid can be converted into a form that makes it highly efficient to transmit over the internet. First the grid needs to be resized (if necessary) to have as many rows as columns (making it square). The square can then be expanded down and to the right by 1 empty row on the bottom and 1 empty column on the right (at the same time). This expansion occurs 1 step at a time (each step adds 1 empty row and 1 empty column to the bottom and the right at the same time) until the total number of cells in that entire grid is a multiple of 8.

For instance, if you have a grid like this with 6 columns and 5 rows...

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td> a</td><td> b</td><td> c</td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td> 1</td><td> 2</td><td> 3</td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

... then you have a grid that is not square.

So, first you would need to make the grid square by adding an extra row ...

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td> a</td><td> b</td><td> c</td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td> 1</td><td> 2</td><td> 3</td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

... making it a 6 x 6 grid. However, this grid has 36 cells total which is not a multiple of 8.

So, let's add 1 empty row and 1 empty column (at the same time) to expand the grid.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td> a</td><td> b</td><td> c</td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td> 1</td><td> 2</td><td> 3</td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Now, we have a 7x7 grid. However, this grid has 49 cells total which is also not a multiple of 8. So, let's add another row and column.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td> a</td><td> b</td><td> c</td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td> 1</td><td> 2</td><td> 3</td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Now, we have an 8x8 grid. This grid has 64 cells total which is a multiple of 8. So now we have what we want: a square grid whose total number of cells is a multiple of 8.

So then, let's convert this into a binary representation using 1 to represent filled cells and 0 to represent empty cells:

    00000000
    00111000
    00111000
    00000000
    00000000
    00000000
    00000000
    00000000

We have now produced what we'll call a **SQUIB**, which is short for **SQU**arable **I**nline **B**its. Since the total number of cells on this grid is evenly divisible by 8, we can send this SQUIB to someone else as a series of 8 bytes (64 bits divided by 8 bits per per byte equals 8 bytes) in an inline fashion with the assumption that the user knows these inline bits are "squarable", or capable of being converted back to a square, on their end. That stream of bytes would look like this:

    00000000 00111000 00111000 00000000 00000000 00000000 00000000 00000000

The recipient now has a binary representation of our grid in only 8 bytes. We can then separately send a list of the contents of the filled cells as a CSV file, like this:

    a,b,c,1,2,3

The recipient would then just need to match up the first cell in the CSV file to the location of the first 1 in the binary grid (going left to right, top to bottom through the binary grid) to know its location, the same for the second cell in the CSV file, and so on and so on.

This method can save quite a bit of space when sending large CSV files over the internet. However, for very large CSV files, this method may not be efficient enough.

An even more efficient method for sending a very large treet over the internet is to send it as a **SQUIBBLE**, which is short for **SQU**arable **I**nline **B**its with **B**inary **L**evel-**E**ncoding.

The problem with regular SQUIBs is that you have to use a bit to represent every single cell on the grid and you have to make sure that the grid is perfectly square, which may mean adding a lot of unnecessary rows and columns to it before it can be sent.

A SQUIBBLE works by considering groups of cells together and assigning that group a 1 if any of the cells in that group are filled and 0 if all cells in that group are empty. This method of combining groups of cells together into a single cell and representing that single cell as either a 1 or a 0 (depending upon the contents of the cells in that group) can happen over and over again recursively, creating multiple levels of cells.

The number of levels a SQUIBBLE has is dependent upon how many cells were in the original grid. However, the highest level reached in a SQUIBBLE is always an 8x8 grid.

When the recipient receives these first 8 bytes (representing this top-level 8x8 grid), the number of 1s in those 64 bits determines how many 8-byte sets will be used to populate the next level of the grid.

For instance, if the first 8 bytes (representing the topmost 8x8 grid) have three 1s in them ...

    00000000
    01000000
    00010000
    00000100
    00000000
    00000000
    00000000
    00000000

... then each 1 in that grid represents an 8x8 grid at a lower level. So, for instance, we might get these three 8-byte sets next:

    11111111
    00000000
    11111111
    00000000
    11111111
    00000000
    11111111
    00000000

    10101010
    10101010
    10101010
    10101010
    10101010
    10101010
    10101010
    10101010

    11111111
    11111111
    11111111
    11111111
    11111111
    11111111
    11111111
    11111111

To recreate the original grid from this SQUIBBLE, we would first need to understand how many cells the original grid had. In this case, we know that the original grid was bigger than 8x8 (64 cells). That's because we received more than 8 bytes in the SQUIBBLE. If the original grid were only 8x8, then we wouldn't have needed more than 8 bytes to represent it. We would have received the 8 bytes and then been able to recreate the 8x8 grid no problem. In fact, in that case, an 8x8 SQUIBBLE and an 8x8 SQUIB would be the same (just 8 bytes). It's only when you get into grids larger than 64 cells do SQUIBBLEs and SQUIBs diverge.

So since we received four 8-byte sets, we know that the original grid was larger than 64 cells, and we can also know that the there are only 2 levels in this SQUIBBLE. How? Because the three 8-byte sets we received at the end perfectly match up to the number of 1s in the first 8-byte set we received. Each 1 in the first 8-byte set really just represented a 64-cell grid at that location. In fact, every bit in every byte in that first 8-byte set represented a 64-cell grid at that location. It's just that most of those bits were 0s, and 0 represents a 64-cell grid with all empty cells. So those 0 bits were all ignored.

When you go down another level using SQUIBBLEs, you multiply the cell count on the previous level by 64 to know how many total cells that next level has. For instance, we just said that we know that there are only 2 levels in this SQUIBBLE (since we received four 8-byte sets total and the first 8-byte set had three 1s in it - meaning everything fits together perfectly to represent a two-level SQUIBBLE). So how many cells did the original grid have in this case?

Since the first level had 64 cells in it, then we would multiple this cell count by 64 to know how many total cells the second level has. 64 x 64 = 4,096. That means that although we could only represent grids with 64 cells using a 1-level SQUIBBLE, we can represent grids with 4,096 cells using a 2-level SQUIBBLE. If we needed to represent a grid with up to 262,144 cells in it, we could use a 3-level SQUIBBLE (4,096 x 64 = 262,144).

The space savings from a SQUIBBLE comes when you have large parts of the grid that are unpopulated. The nice thing about TreeTable is that you can spread out your treets across the grid so you can see them all at once (when you zoom out) and get a better sense of what your program is doing. However, by spreading out your treets like this, you make the SQUIB needed to transmit them much larger. SQUIBBLES solve this problem by giving you a much more compact way to transmit these grids quickly because SQUIBBLEs can ignore large portions of the grid that are unpopulated.

To try to make it a little more clear, the SQUIBBLE above could also be sent as a SQUIB, like this:

    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000

    00000000 11111111 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 11111111 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 11111111 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 11111111 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000

    00000000 00000000 00000000 10101010 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 10101010 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 10101010 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 10101010 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 10101010 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 10101010 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 10101010 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 10101010 00000000 00000000 00000000 00000000

    00000000 00000000 00000000 00000000 00000000 11111111 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 11111111 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 11111111 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 11111111 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 11111111 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 11111111 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 11111111 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 11111111 00000000 00000000

    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000

    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000

    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000

    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
    00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000

As you can tell, the SQUIB in this case is much much larger (4,096 bits / 512 bytes) whereas the SQUIBBLE needed to represent the same grid is much smaller (256 bits / 32 bytes). SQUIBBLE is basically a compressed bitmap, if you are familiar with those. SQUIBBLE is most efficient when representing large, sparsely populated grids.

Adding layers to a SQUIBBLE means treating each 1 at the previous layer, not as a filled cell on a grid, but as the location of an 8x8 grid at a lower level.

So in our SQUIBBLE example above, if we received more than 4 8-byte sets, then we would know that each 1 in the second, third, and fourth 8-byte sets would not represent filled cells in a grid, but 8x8 grids at a lower (third) level.

Again, that third level would represent a grid that has 512 rows and columns (262,144 cells) because the second level has 64 rows and columns (4,096 cells) and each cell now represents an 8x8 grid (64 cells). So 4,096 x 64 = 262,144.

So, that is how SQUIBBLEs work. There are likely better, more efficient ways to represent TreeTable grids. This method just makes it easy to send the grid over the wire since it requires no header information whatsoever, only the bytes themselves. The recipient would just need to know that the bytes represent a SQUIBBLE and they should be able to decode the structure of the grid right away. Once they receive the corresponding CSV file with the filled cells in the right order, they should be able to reproduce the entire grid, contents and all.

# TreeTable Maturity Model

Programming tenants have a lot of capabilities and possibilities for adoption. However, it can be difficult to see how you would put a tenant like TreeTable to use right away in your organization.

Below is a sample incremental adoption approach you could take.

1. Documentation Only

   1. Create treets to document JSON schemas

      - Prior to programming tenants, there were generally limited ways to document a JSON schema outside of using JSON itself. For instance, here are a couple of different answers to a [question](https://stackoverflow.com/questions/3953692) posed on the StackOverflow website about the best way to document JSON.

        > In theory [JSON Schema](http://json-schema.org/) could serve this purpose, but in practice I am not sure it does. Worth mentioning I hope. Other than this, my personal opinion is that since JSON is predominantly used for transferring objects

        > For more complex data models such as yours, I have not seen any good solution. There are some JSON schema proposals, but that seems to go against the spirit of JSON, and seems too heavyweight for your purpose of just documenting.

      - The examples at the bottom of this page include various examples of documenting JSON schemas along with their corresponding rules and even data.

   2. Create cluster templates to document the shape of specifications for a certain application type, like an API

      - Initially these cluster templates could just be used as a reference for the developer when coding the new application.

   3. Create cluster templates to document a slice of architecture

      - All the schemas, functions, documentation and even data can be contained inside the same treet as a way to capture an entire slice of multi-layered architecture. As the maturity of TreeTable in the organization improves, these same templates could be reused later to automatically build these slices of architecture instead of just document them.

2. Live Documentation with a Manual Workflow

   Create a program that acts as an interpreter for a specific cluster template. That interpreter takes an instance of that cluster template as input and produces source code files as output, automating the creation of an application with that particular shape. However, feeding the inputs to the interpreter would still be a manual process.

3. Live Documentation with an Automated Workflow

   When changes are made to a cluster template instance and automatically fed to the interpeter to produce new source code files. Those updated source code files automatically are automatically pushed to a GIT repo which is part of a CI/CD pipeline that automatically moves those changes into a test or staging environment.

4. Live Local Interaction

   When a TreeTable grid is monitored by an interpreter which looks for changes and immediately updates the grid to display the effects of those changes, such as showing results of functions when parameter values become available. This would be similar to the idea of REPLs used idea in traditional programming languages which display the results of selected code immediately instead of waiting for the whole program to be completed and compiled to see results.

   Code and data reside together in computer memory. This was one of the key advancements of the so-called Von Neumann architecture that most modern computers use. However, rarely do we see code and data reside side-by-side statically. We see a function. Later we run that function and see the result in another window. We don't see a run (and especially not multiple runs) of a function side by side with the function definition itself.

   "Running" a function produces a result but "defining" a function is a wholly separate process. Those things don't _feel_ like they should go together. However, this may just be a limitation of our current notation and tooling paradigms. With programming tenants you can easily see code and data side by side.

5. Live Remote Interaction, Testing and Versioning

   1. Live Remote Interaction

      Allow the user to interact with the server via a live, interactive treet. This treet could be made available to the user via a program on their computer like a web browser or a spreadsheet-style program. As they made changes in the interactive treet, those changes would flow back to the server as smaller treets that represented just those changes. This would allow the client and server to sync to the latest version of a shared treet.

      This would allow for partial program application where a program could be run with all available data and then send the user a link to an interactive treet where they could enter the data needed to complete that run of the application. The treet itself could include interaction rules that only allowed the user to enter valid data in the right cells in the treet.

   2. Live Remote Testing

      In addition to interacting with the application's data, users could also interact with the application's code, testing changes to it via interactive treets. The user could then use live interaction to see test how those changes would affect the production results.

   3. Live Remote Versioning

      In addition to interact with the application's data and code, user's could also version the application once they have done enough testing to know what changes need to be made. The version tree of the application would grow and the users could update the application for their needs but not affect any other users. Eventually the application manager could mark their version as the production version if it met the requirements of others users as well, or the other users themselves could mark it as their production version once they tested it on their own data.

      This allows applications to be version agnostic and allows users to change versions at will.

6. Live Schemas

   In addition to allowing users to use any application version they like, treets could also be used to allow users to use any schema version they like. This would mean a much more robust understanding of abstraction/concretion separation beforehand in order to allow equality between abstract concepts to be identified, even with very different concrete representations of these concepts in the different schemas.

7. Replace JSON with Treets

   Replace the format of the data being sent to and from an API. Instead of using JSON, use treets.

8. Generic Interpreters

   Document functions that can be used across multiple languages (such as SQL and C# as mentioned earlier) and then use generic interpreters to write the necessary code in the necessary language on demand.

# Prior Art & Inspirations

TreeTable shares many fundamental ideas with other projects.

- SICP / LISP

  - Professor Harold Abelson in [Lecture 1A](https://youtu.be/-J_xL4IGhJA?t=2103) of the famous 1980s MIT course "Structure and Interpretation of Computer Programs" (SICP for short) draws a LISP-style program on the chalkboard in sequential text format `(+ 3 (* 5 6) 8 2)` and then he redraws it in a 2-dimensional tree-like format and says

    > We're writing these trees, and parentheses are just a way to write this 2-dimensional structure as a linear character string. At least when LISP first started and people had teletypes or punch cards, this was more convenient. Maybe if LISP started today, the syntax of LISP would look like that [2-dimensional format].

- Visual Programming Languages

  - Margaret Burnett wrote a great [article](https://www.researchgate.net/publication/220391588_Visual_object-oriented_programming) a while back (available for free) about the history of Visual Programming Languages (VPLs). The article begins with an explanation of VPLs and how their notion of "tokens" is different from traditional programming languages:

    > Visual programming is programming in which more than one dimension is used to convey semantics. Examples of such additional dimensions are the use of multi-dimensional objects, the use of spatial relationships...Each potentially-significant multi-dimensional object or relationship is a token (just as in traditional textual programming languages each word is a token) and the collection of one or more such tokens is a visual expression.

    and continues later about how modern IDEs are multi-dimensional, but only in a very limited sense:

    > Although traditional textual programming languages often incorporate two-dimensional syntax devices in a limited way--an x-dimension to convey a legal linear string in the language, and a y-dimension allowing optional line spacing as a documentation device or for limited semantics (such as “continued from previous line”)--only one of these dimensions conveys semantics, and the second dimension has been limited to a teletype notion of spatial relationships so as to be expressible in a one-dimensional string grammar. Thus, multidimensionality is the essential difference between VPLs and strictly textual languages.

    One of the things she touches on in her article is the idea of notation and how important it is in programming (as Jonathan Edwards also mentions below) and she references research into the [Cognitive dimensions of notations](https://en.m.wikipedia.org/wiki/Cognitive_dimensions_of_notations) which are fascinating in and of themselves.

- Jonathan Edwards

  - Jonathan Edwards on his [blog](https://alarmingdevelopment.org) has many great posts about how programming is constrained by the use of the linear text format. For instance, on his very [first post](https://alarmingdevelopment.org/?m=200406) he says

    > Much of what we know about programming language design is about clever ways to encode structure in text, and fancy ontologies to rationalize naming. Discarding the textual representation suddenly makes all this irrelevant, and opens a whole new space of design choices.

  - The closest I've ever seen anyone come to TreeTable is at the end of one of Jonathan's videos on his Vimeo [page](https://vimeo.com/jonathoda) titled [No ifs, ands, or buts](https://vimeo.com/140738254) where he says

    > These three very different kinds of control structures [if-then-else, switch, and polymorphism] all collapse into the same thing in the schematic table [2-dimensional structure]. This has to be telling us something. I think what it's telling us is that much of the design of our programming languages is an artifact of the linear nature of text. My conclusion is, notation matters. This has been proven over and over again in the history of science and mathematics. The right notation is half of the solution. The right notation should embody the semantics of its domain. That's what I've tried to achieve in the design of schematic tables. Automatic layout and canonical representation suppress irrelevant syntactic noise. High-level editing lets us directly manipulate the graph structure of a computation or the boolean algebra of decisions instead of inserting and deleting characters in a string. The point, of course, is that computers let us invent completely new kinds of notations that simply aren't possible on a teletype. What I hope this means is that the history of programming languages is not over. There are better ways to represent programs than text strings. Onward into the second dimension.

- JSON

  - Douglas Crockford who came up wih the ubiquitous data format called JavaScript Object Notation (JSON) but found that other companies would not use the new format because they had already committed to the "standardized" XML format said in an [interview](https://www.youtube.com/watch?v=kc8BAR7SHJI&t=219s):

    > I decided if I want to be able to use this thing, I need to make it a standard. So I bought [JSON.org](https://json.org/) and put up a web page and sort of declared "it's a standard." That's it. That's all I did. I didn't go around trying to convince industry and government and everybody that this is what they should do, I just put up a website basically, one page website, and over the years people discovered it and then realized "Oh yeah, this is so much easier. I'm just going to do that."

  - This page is an attempt to do the same thing for TreeTable.

- Future of Software Development Interfaces

  - Amjad Masad, CEO of Replit, discussed in a [Y Combinator podcast interview](https://www.youtube.com/watch?v=oOylEw3tPQ8) his vision for the future of software development, stating that in the next 5-10 years it will be possible to invent a new way to build software that is "higher level" - focused on defining how you want the software to work and look, rather than writing traditional code. This vision aligns closely with the spatial semantic approach of BSS, which enables developers to express intent through spatial arrangements rather than linear text.

  - In a July 2025 discussion on visual programming and user interfaces, important insights emerged about the limitations of current development paradigms:

    > A question I had related to that point is about the user interface. So for something like Cursor or Windsurf, it's pretty obvious that the primary UI element is the code. You see code, you have a little chat window, but primarily it's about diffs, it's about changes to code. And for a tool like Repl.it, the primary interface is the graphical user interface. It's the buttons and the fonts. With WYSIWYG, you see what you're building. Exactly, and that's great for building user interfaces. But when you're trying to build more complicated logical flows, I found it a little bit difficult because there was no way I could see the code. I can't visualize what's going on behind the scenes. It's almost a black box. Fast forwarding here, if you're trying to build more complex internal workflows, how does a product manager or an operations manager at a big company visualize that workflow and the kind of logical branching that happens?

    The discussion continues with insights about visual programming history and future possibilities:

    > If you look back in the history of computing, there was always this vision of visual programming. It never worked very well because ultimately it's about Turing completeness. These systems are not universal computing devices. And now we go to CodeGen. Obviously CodeGen is Turing complete, but you're interfacing with it primarily via natural language. Natural language is fuzzy. It's really hard to know whether it's doing the right thing. I think the synthesis of these two things is probably coming, where you are interfacing with natural language, but you can, instead of just staring at code, there's maybe an interface or a different view on top of code.

    This points toward exactly the kind of spatial semantic approach that BSS provides - a way to visualize and manipulate program structure that goes beyond traditional text while maintaining computational completeness.

- Data Flow Programming

  - A quote from a journal [article](https://www.deepdyve.com/lp/spie/on-programming-languages-for-vlsi-array-processors-AzLDUYymgD) titled "On Programming Languages for VLSI Array Processors" gives a very good explanation of data flow programming that also applies well to TreeTable.

    > In a data flow computer, an operation is performed as soon as its operands have been computed. The machine language is an explicit representation of the data dependencies of program operations. Its programs are directed data flow graphs whose nodes are called operators. The role of operators in a data flow machine is similar to the role of instructions in a von Neumann machine. The execution of an instruction corresponds to the firing of an operator. Whenever an operation fires, it absorbs tokens at its input ports and produces tokens at its output ports.

~~- Why F# - Why is this library written in F# and not some other language like C# or JavaScript? Well, mostly because of Scott Wlaschin. He runs a website called [FSharp for Fun and Profit](https://fsharpforfunandprofit.com/) and it is this website, and Scott's various video that made F# clear for me. Not only clear in the sense that I learned how to program in it, but also clear that this is the right language for such a weird, new thing like TreeTable which requires a lot of conceptual clarity and a lot of parsing. Once you get it, you won't go back (unless you can't find a company that uses F#, in which case you will :-) ).~~

# Future Directions

- Category Theory

  - Category Theory is an overarching mathematical theory that uses a 2-dimensional plane with dots (formally called "objects") and arrows (formally called "morphisms") on it to represent other mathematical concepts. The arrows can be composed together to form a new unified arrow between two dots that only existed previously as multiple arrows running between those same dots and other dots along the way.

- Seed Tables

  - Due to the inherent "concreteness" of TreeTable structures, it is difficult to quickly and easily change them to another concrete structure that may represent the same underlying abstract concept in a different way (such as a different grouping of the data like you might do with the SQL 'GROUP BY' statement). So, it seems to me that there should be some underlying concept of "seed tables" that "grow" "tree tables" according to some specifications. This seems to relate in some way in my mind to Category Theory, although, I can't yet imagine the details. I wonder if these "seed tables" would be much like graph databases where you keep the "nodes" in one table (which are similar to "objects" in category theory) and the "edges" in another table (which are similar to "morphisms" in category theory). These dots and arrows, or what I'll call points and pointers, could be used to then "grow" new "tree tables" depending upon the query criteria you use. Just as compilers for TreeTable can quickly and easily generate source code in a target programming language from TreeTable structures, the seed tables could be used by a compiler to quickly and easily generate the TreeTable structures themselves. This would mean the user would likely start working with the seed tables themselves to express intent, rather than the TreeTable structures.

- Fruit Tables

  - Another concept related to seed tables would be the idea of fruit tables that are "extracted" from tree tables to provide immediate benefit to the user in some way. Perhaps a tree table is far too big and cumbersome to be able to pass around or use for one particular use case. In that case, the user could somehow "query" the tree table structures to extract just the information needed at that moment. The format of fruit tables might be the same as seed tables with nodes and edges in a database table. This would potentially allow new seed tables to be extracted from these fruit tables to grow a new tree table. This may be stretching the metaphors a bit, but finding a way to create a closed loop in the TreeTable ecosystem may be a helpful way to guide future progress.

- Abstraction/Concretion Separation

  - As our experience with computer programming continues, we think of ourselves as doing things in a more and more abstract manner. When we produce software, we often imagine that we are working solely in the world of abstraction since our code is being stored as simple combinations of 1s and 0s which are about as abstract as you can get seemingly. However, we also realize that we should "program to an abstraction, not a concrete implementation" which means we recognize at some level that our code has "concrete" implementations in it that are not purely abstract. How then do we rethink the purest version of "abstract" and what it means to have no "concretion" whatsoever?

  - Uniref

    - When you think of ASCII or Unicode, you think of a code that represents characters on a screen. For instance the byte `01110010` represents the lowercase `r` in ASCII. So if someone asked you what that byte represented in ASCII, you would probably say a "character" or a "letter". But if you wrote down the lowercase letter `r` on a piece of paper and I wrote down the lowercase letter `r` on a piece of paper, we would have drawn slightly different shapes. The binary pattern `01110010` doesn't represent your `r` or my `r`. It merely represents the idea of a `lowercase letter r`. This is an important distinction. ASCII and Unicode represent specific ideas, not specific shapes or pixel patterns. So the question then is, why do we only have a universal encoding system that only works for characters but not other types of ideas?
    - What would be possible if we thought of concepts not as the words we use to represent them but truly as abstract things that could be referenced in a multitude of ways? To some extent we already do this by having different words for the same concept in different languages. However, rarely do we recognize that the thing all these words represent is truly the same underneath. Behind the words `green` and `verde` and `žalias` is the same concept, for instance. What if we catalogued these concepts somehow and made them available for reference in code. It would take the programming principle of "Don't Repeat Yourself" (DRY) to a whole new level.
    - There might end up being multiple levels of these conceptual references in a hierarchy, like so:
      - Uniref (Unified Reference System)
        - Unicode (characters)
        - Unicon (concepts)
        - Unifact (artifacts)
          - Artifact as used in the most general sense of the term. There is probably a very clear technical defition for this, but examples would be "The Constitution of the United States" or "Microsoft's .NET Framework Version 3.1" or "1995 Air Jordans". These aren't really 'concepts' per se. They're more like things that were created or produced in some way.
        - Uni? (should there be more, less, one?)
    - Perhaps these references would boil down to a simple ID or number as they do for characters in Unicode. However, having an abstract thing, like the concept behind the words `green`, `verde` and `žalias`, be represented by a concrete ID violates the Abstraction/Concretion Separation principle. We want to completely separate the abstract (the concept) from the concrete (the word or ID used to refer to it).
    - What is the most abstract way to refer to a concept? A lot of times we put a concept somewhere, such as in our heads. Even if we don't remember the name of that concept at the moment or we barely even know what it is, we have still given it a location - in our head.
    - Perhaps we could use an empty cell on a grid as a representation for an abstract concept. We could always point concrete things to that empty cell, such as the text `green`, but there would be nothing concrete at that location. We could then map synonyms for that concept to the same location, such as `verde` and `žalias`. Later we could map the locations of the concepts in our grid to the locations of concepts somewhere else to match them up so that our recipient could understand the message we are sending them. Perhaps location is the most abstract way to refer to a concrete concept.

  - Fundamental Theorem of Software Engineering

    - There is a tongue-in-cheek idea in programming called the [Fundamental Theorem of Software Engineering](https://en.wikipedia.org/wiki/Fundamental_theorem_of_software_engineering) that states:

      > We can solve any problem by introducing an extra level of indirection.

      This is an idea that you will encounter over and over again in programming. By thinking of a single concept as actually two different concepts with a bridge in between, you often find that you can be a lot more productive as a programmer.

    - The character encoding systems we use are a reflection of this idea. Originally ASCII was a character encoding system for American English characters which became widely used. Over time, the need for a more broad system that encoded other types of characters was made apparent.
    - ASCII used 7 bits to encode characters, allowing up to 128 characters to be encoded. The additional bit in the one-byte ASCII system was used by various parties for various things with no universal standard. With ASCII, the number representing a character, such as the number `01110010` in binary (`114` in decimal) for `lowercase letter r`, was directly connected to the pattern of bits used to represent that number (again `01110010`).
    - Unicode was going to have countless more characters to encode. However, for backwards compatibility it would be nice if the files encoded in an ASCII system could also be interpreted in a Unicode system. However, how would you keep using a 1-byte system if you were going to encode a large number of new characters beyond the number that could be represented by a single byte?
    - Unicode itself was just a mapping system that mapped a certain number to a certain character. However, Unicode itself did not directly map those numbers onto bit patterns. Instead, there was a different encoding standard called the "Unicode Transformation Format" (UTF) which was used to map those Unicode character numbers onto different bit patterns.
    - This is one of the uses of the Fundamental Theorem of Software Engineering. Unicode split the idea of a identifier and its representation in binary.
    - This allowed multiple systems, including UTF-8 and UTF-16, to represent those Unicode identifiers using different bit patterns according to the needs of the application. Using UTF-8, for instance, you could still encode ASCII with a single byte and you could encode non-American-English characters using multipe bytes taking advantage of the first bit in each byte to denote if that byte represented ASCII or not. It was a clever hack made possible by adding another layer of indirection where it did not exist before.

- As-if Databases

  - When using pure functions, databases are always a problem. You can't think of a database being pure because it is always changing and there is no real good way to refer back to an old version of the database as if it were an immutable snapshot of the database at that moment.
  - For a database to be truly considered functional and immutable, we would need to always be able to query a database as if we were querying it at some point in the past and _always_ get back the same result. We would need to abstract away the concept of time and be able to include the _as-if_ criteria in our query.
  - For instance, we might want the result _as-if_ the query was run on May 3, 2008 at midnight UTC. Whether it was actually run at that time or we were just running the query _as-if_ that were true, we would always get back the same result. We could also include other _as-if_ criteria inside our query other than just time, including the role of the person running the query. We want the results from this query _as-if_ we were the Accounting Manager, for instance.
  - This brings up some interesting questions about how you keep the _as-if_ criteria the same over long periods of time, but similar databases are already being used in production systems including [Datomic](https://www.datomic.com/).

- APIs

  - If the entire state of a program along with a particular instance of that program could be included on the same grid using TreeTable, then barriers that used to exist between client and server kind of disappear. For instance, traditionally a client sends a request to a server and receives a response. This is true of simple web page requests in a browser and it is true of requests that programs send to each other via APIs.
  - This separation between clients and servers makes sense, especially in the early days of the web when web pages were static and you just requested them as if they were a page in a book. You got back simple HTML with very little, if any, bells and whistles like JavaScript. As the client, you just received content but you didn't really do much with that content besides consume it.
  - As the web progressed though, a lot of the computing logic started to be run on the client and no longer on the server. Servers sent clients instructions (using JavaScript) for what computing logic needed to be run and the client's browser then processed that computing logic at the appropriate time.
  - This move of computing logic from strictly server-based to a shared responsibility of client and server has allowed some pretty interesting new possiblities for what is possible with websites - including complex games and graphics.
  - Perhaps APIs can undergo this same kind of shift from server-centric logic to a shared responsibility between clients and servers. How would servers share this logic with clients if they are strictly limited to JSON as their means of transporting data to the client. JSON does not do a good job of representing computing logic. It's supposed to only represent data but, of course, code can be treated as data and sent via JSON with some special syntax. However, treating the entire programming space of the server as something that can be moved to the client easily via JSON is just not practical. It would take a much more robust data-encoding format to accomplish that. This is where TreeTable can help.

- New Kinds of Hardware

  - There is no fundamental sequentiality to 2-dimensional structures like there is with 1-dimensional structures. That’s one thing that makes TreeTables fundamentally different from traditional programming. It’s also likely to make clock-based hardware unnecessary for treets. This was implied above in the section on Wave Computing, but may lead to other types of new hardware beyond the 'nodes on a board' idea.

- User Interfaces (UIs)

  - A UI is a schema for an experience. However, the schema of the UI does not have to be set in stone by the server/vendor. The server could simply produce a treet that outlined the requirements that any UI must have, including the rules for interacting with the server (such as might be used when filling out a form), and the client could use those requirements to produce their own UI.
    These specs could also be used by third party vendors to produce a generic UI with a certain "theme" where users could view and interact with all their favorite websites in the same way according to how they wanted to experience it, not according to how the vendors wanted them to experience it.
  - This is another example of the "Fundamental Theorem of Software Engineering" where two things that were generally thought to be conflated (the vendor and the schema of their website) can be disentangled to allow for more flexibility and possibilities.

- Automatic Schema Negotiation

  - As schemas change, clients break. This makes it more difficult for developers to create new schemas since they always have to consider how it will affect users of the old schema.

- Wave Computing

  - Data is stored somewhere and all data is abstracted away cleanly and available via name or location. However, what if you did not know the name or location of certain data. You would typically use a search engine which has specifically gone out to each website and asked what data resides there. It then catalogues the result and makes it available to you as results.
  - What if search engines were replaced with broadcast messages, much like a roll call.
    - "Stewart?"
    - "Here."
  - These messages could be contained to certain areas, such as the inside of a data center. The data center could be full of tiny nodes that listen for requests for the data they hold ("First Name of Employee ID 876?") and could respond with their location ("Here.") The data could then be requested from that node and sent over wires to save broadcast bandwidth.

- Notifications

  - Notifying multiple parties of status or changes in real time can be difficult. Often there is a fundamental format difference between data that is used for reporting and data this is used for processing.

# Some Final Thoughts

- TreeTable gives the average person easy access to five of the most powerful tools in computer programming: pointers, trees, recursion, composition and identity.

# References

- Understanding "Trees"
  - A [video](https://m.youtube.com/watch?v=7tCNu4CnjVc) on the Computerphile YouTube channel explains the usefulness of tree data structures used in computer programming and how programs convert linear text trees like `3 * (y + x)` into a form usable by the computer.

# Examples of Treets

Let's look at some real-world examples of TreeTable structures. We won't explain each of them, but this should give you some idea of the various structures that can be created in TreeTable.

## Horizontal List

If a single continuous linear _row_ of filled cells is encountered, it is assumed to be a simple list of items.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Apple</td><td id="ccf">Banana</td><td id="ccf">Cherry</td><td id="b">  </td><td id="f">  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Vertical List

If a single continuous linear _column_ of filled cells is encountered, it is also assumed to be a simple list of items.

TreeTable is designed to interpret the same data in the same way whether it is going down or going to the right. This is true of more complex structures as well.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Apple</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Banana</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Cherry</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Simple Table

When TreeTable encounters a filled rectangular cluster of cells, it automatically assumes it is a table with a header. This allows tables from existing spreadsheets to easily be interpreted when copied into TreeTable.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf"><i>ID</i></td><td id="ccf"><i>Name</i></td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">1</td><td id="ccf">Apple</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">2</td><td id="ccf">Banana</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">3</td><td id="ccf">Cherry</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Simple Table with No Headers

TreeTable always assumes a table has a header. However, if your table does not have a header then this is where you can use the backtick (`` ` ``) character for the header cells. This character at the beginning of a cell's content causes TreeTable to assume that cell is a filled cell for structural purposes but also assume it is an empty cell for content purposes.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf"><i>`</i></td><td id="ccf"><i>`</i></td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">1</td><td id="ccf">Apple</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">2</td><td id="ccf">Banana</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">3</td><td id="ccf">Cherry</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Simple Tree

This tree has one root node, two child nodes, and five grandchild nodes.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">My Stuff</td><td id="cce">  </td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Pets</td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Rufus</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Furball</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Goldie</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Cars</td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Honda</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Mini</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Simple Tree Transposed

This is the same tree as above, just transposed so it grows to the right and down, instead of down and to the right.

(not finished)

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">My Stuff</td><td id="cce">  </td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Pets</td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Rufus</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Furball</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Goldie</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Cars</td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Honda</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce">  </td><td id="ccf">Mini</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>

</table>

## Tree with List of Key & Value

There are no filled cells on the same row as the tree node (`Me`), meaning the value of this tree node is not a table. Since this is not a table and there are two columns of filled cells, the first cell is considered a key and the second column is considered its value.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Me</td><td id="cce">  </td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf"><i>Name</i></td><td id="ccf">Herbert</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf"><i>Age</i></td><td id="ccf">42</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf"><i>City</i></td><td id="ccf">NYC</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Tree with List of Key & Values (Plural)

Each key is not restricted to having a single value but can have one or more values.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Me</td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf"><i>Kids</i></td><td id="ccf">Stu</td><td id="ccf">Fran</td><td id="ccf">Stan</td><td id="ccf">Bill</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf"><i>Shoes</i></td><td id="ccf">Boots</td><td id="ccf">Sandals</td><td id="ccf">Sneakers</td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf"><i>Hobbies</i></td><td id="ccf">Sleeping</td><td id="cce">  </td><td id="cce">  </td><td id="cce"></td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Tree with Table

This is a table, not key & value(s), because there are filled cells on the same row as the tree node (`Kids`). These filled cells are treated as the header for a table.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Kids</td><td id="ccf"><i>Name</i></td><td id="ccf"><i>Age</i></td><td id="ccf"><i>Height</i></td><td id="ccf"><i>Income</i></td><td id="ccf"><i>Honors</i></td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Stu</td><td id="ccf">8</td><td id="ccf">4'5"</td><td id="ccf">0</td><td id="ccf">Smartest</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Fran</td><td id="ccf">11</td><td id="ccf">4'8"</td><td id="ccf">50</td><td id="ccf">Fastest</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Stan</td><td id="ccf">12</td><td id="ccf">5"3</td><td id="ccf">300</td><td id="ccf">Funniest</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Bill</td><td id="ccf">31</td><td id="ccf">6'2"</td><td id="ccf">10,000</td><td id="ccf">Tallest</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Tree with Matrix

A matrix in TreeTable is basically keys with tabular values. These are very useful when defining a function (such as `Multiply` below) and listing out the parameters (`a` and `b`) because you can immediately create the validation rules for those parameters.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Define</td><td id="cce">  </td></td><td id="cce">  </td></td><td id="cce">  </td></td><td id="cce">  </td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf" style="color:blue">Multiply</td><td id="cce">  </td><td id="ccf"><i>Type</i></td><td id="ccf"><i>Required</i></td><td id="ccf"><i>Min</i></td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce"><i>  </i></td><td id="ccf"><i>a</i></td><td id="ccf">int</td><td id="ccf">yes</td><td id="ccf">1</td><td id="b"><td id="f"></td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce"><i>  </i></td><td id="ccf"><i>b</i></td><td id="ccf">int</td><td id="ccf">yes</td><td id="ccf">1</td><td id="b"><td id="f"></td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf"><i>*</i></td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="cce"></td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce"><i>  </i></td><td id="ccf">a</td><td id="cce">  </td><td id="cce">  </td><td id="cce"></td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="cce"><i>  </i></td><td id="ccf">b</td><td id="cce">  </td><td id="cce">  </td><td id="cce"></td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Calling a Function

You can call a function you've already defined like you would use any other operator in TreeTable. You put the list of parameters to that function in a list starting with the cell down and to the right of the operator.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Multiply</td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">3</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">5</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

Using TreeTable's execution model we discussed earlier, this function call would resolve to the following (based on the `Multiply` method we defined above):

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">15</td><td id="b"><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Table with Tree Inside

Just like a tree can have a table inside, a table can have a tree inside. The branches of the tree split the table open vertically and horizontally causing blank rows and columns where those branches exist. This makes it easy to hide those subtrees when necessary, a feature of many TreeTable editors.

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf"><i>Name</i></td><td id="cce">  </td><td id="ccf"><i>Age</i></td><td id="ccf"><i>Height</i></td><td id="ccf"><i>Income</i></td><td id="ccf"><i>Honors</i></td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Stu</td><td id="cce">  </td><td id="ccf">8</td><td id="ccf">4'5"</td><td id="ccf">0</td><td id="ccf">Smartest</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Fran</td><td id="cce">  </td><td id="ccf">11</td><td id="ccf">4'8"</td><td id="ccf">50</td><td id="ccf">Fastest</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Stan</td><td id="ccf"><i>Nickname</i></td><td id="ccf">12</td><td id="ccf">5"3</td><td id="ccf">300</td><td id="ccf">Funniest</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">The Man</td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Bill</td><td id="cce">  </td><td id="ccf">31</td><td id="ccf">6'2"</td><td id="ccf">10,000</td><td id="ccf">Tallest</td><td id="b"><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">   </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Canvas with Multiple Related Cell Clusters

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Canvas with Multiple Related Cell Clusters Including a Title Cluster

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## JSON Schema

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## JSON Schema with Validation Rules

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## JSON Schema with Validation Rules and Data

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## JSON Schema with Validation Rules and Data Transposed into a Vertical Orientation

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## JSON with a Link to a List of Data

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## JSON with a Recursive Cell with a List of Data

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Basic Function Definition and Use

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Function that Returns a List

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Function with a Lambda Function Inside

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Recursive Function

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Function that Returns a Function

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Function with a Special Form

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## HTML with CSS

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## HTML with CSS and Functions

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## HTML Block Cluster With Notes on Each Element

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Simple State Machine for a Turnstile

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Turnstile</td><td id="ce">  </td><td id="ccf">Action</td><td id="cce">  </td><td id="cce">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ce">  </td><td id="ce">  </td><td id="cce">  </td><td id="ccf">Coin</td><td id="ccf">Push</td><td id="b"></td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">State</td><td id="cce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Locked</td><td id="ce">  </td><td id="ccf">Unlocked</td><td id="ccf">Locked</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Unlocked</td><td id="ce">  </td><td id="ccf">Unlocked</td><td id="ccf">Locked</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td id="b"><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## More Complex State Machine for a Stove

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">Stove</td><td id="ce">  </td><td id="ccf">Action</td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="cce">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ce">  </td><td id="ce">  </td><td id="cce">  </td><td id="ccf">Press Button</td><td id="ccf">Open Door</td><td id="ccf">Close Door</td><td id="ccf">Timer Up</td><td id="b"></td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="ccf">State</td><td id="cce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="ce">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Ready</td><td id="ce">  </td><td id="ccf">Cooking</td><td id="ccf">Open</td><td id="ccf">`</td><td id="ccf">(ignored)</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Cooking</td><td id="ce">  </td><td id="ccf">Extended</td><td id="ccf">Interrupted</td><td id="ccf">`</td><td id="ccf">Done</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Done</td><td id="ce">  </td><td id="ccf">Cooking</td><td id="ccf">Open</td><td id="ccf">`</td><td id="ccf">`</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Interrupted</td><td id="ce">  </td><td id="ccf">(ignored)</td><td id="ccf">`</td><td id="ccf">Ready</td><td id="ccf">(ignored)</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Open</td><td id="ce">  </td><td id="ccf">(ignored)</td><td id="ccf">`</td><td id="ccf">Ready</td><td id="ccf">`</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="cce">  </td><td id="ccf">Extended</td><td id="ce">  </td><td id="ccf">Extended</td><td id="ccf">Interrupted</td><td id="ccf">`</td><td id="ccf">Done</td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td><td id="b">  </td id="b"><td id="b">  </td><td id="b">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td id="f">  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

## Using Multiple Programming Languages Together

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>

# Wave Computing Examples

## Simple Wave Computing Example

<table>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
    <tr><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td><td>  </td></tr>
</table>
