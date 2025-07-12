# From Letters and Tables on a Grid to Binary Spatial Semantics

## Introduction

Two-dimensional grids are among the most ubiquitous representations in computing and information systems. Whether appearing on a pixel display, in a spreadsheet application, or within a simple CSV file, grids offer a convenient, uniform structure for organizing data. However, the semantics of how meaning is derived from these grids can vary dramatically depending on context.

This paper explores three distinct interpretations of data on a grid: the holistic semantics found in bitmap letters, the group semantics characteristic of tables, and finally, Binary Spatial Semantics (BSS), a new framework that emphasizes the positional relationships of filled cells to convey meaning. By examining these in sequence, we can uncover how deeply our assumptions about grids shape our understanding of data, and why BSS represents a fundamental shift in perspective.

## The holistic semantics of letters

Consider how we display letters on a binary grid, such as a typical 5×5 pixel bitmap for the letter “A”:

```
 X
X X
XXX
X X
X X
```

In this representation, the individual pixels (or binary bits) have no intrinsic meaning on their own. A single filled cell does not convey any concept of a leg or crossbar. Instead, it is the **aggregate spatial configuration** of these filled cells that gives rise to the holistic recognition of the letter “A.”

The semantics here are purely **global to the shape**: meaning emerges from the visual pattern formed by the presence and absence of filled cells across the entire grid. This is common to all bitmap character representations. Each pattern, taken as a whole, maps to a symbolic meaning (a letter), but it lacks internal structure with independently meaningful subcomponents.

## The group semantics of tables

Contrast this with how grids are used in spreadsheets and CSV files. A typical CSV might appear as follows:

```csv
Name, Age, City
Alice,30,Paris
Bob,25,Tokyo
```

Although this is also a grid of cells, the semantics are entirely different. Here:

- Each **row** functions as a discrete unit, representing an entity or record (for example, a person).
- Each **column** conveys a particular attribute shared across all entities (such as Name, Age, or City).

This structure represents **group semantics**, where meaning is explicitly tied to groupings of cells by rows and columns. A single cell’s significance is not generally interpreted in isolation, but as part of these larger horizontal or vertical groups.

It is crucial to recognize that this interpretation is **not inherent in the CSV format itself**. A CSV file is, at its core, a simple listing of rows composed of comma-separated values. It carries no mandatory implication that each row must be an entity or each column an attribute. These meanings arise only through external conventions and shared agreements on how to read such files.

This distinction is often overlooked. Many people implicitly conflate the structure of a CSV file with the semantics of a table, assuming that CSV inherently encodes tabular relationships. In fact, the CSV format simply encodes data positionally, and the interpretation that rows are records and columns are fields is an overlay of meaning, not a property of the file itself. It is the **positional arrangement** combined with our conventions that makes a CSV act as a table.

## Binary Spatial Semantics: semantics from spatial relationships

Binary Spatial Semantics (BSS) offers a fundamentally different way to derive meaning from grids. Unlike bitmap letters, which rely on holistic patterns, or tables, which impose rectangular group structures, BSS centers on the **relative positioning of filled cells within a binary grid** to convey meaning.

In BSS:

- Each cell is either filled (for example, a 1 or a marked position) or empty.
- The primary semantics are determined not by individual cell values, nor by rows or columns treated as uniform groups, but by the **spatial relationships among the filled cells themselves**.

Through these relationships, BSS enables the encoding of complex structures such as:

- hierarchical and recursive data models,
- object schemas,
- API data layers,
- or even the file and source code structure of entire programs.

For instance, a particular spatial arrangement of filled cells within a CSV file—interpreted through BSS—might delineate a tree structure, with relative proximities or patterns indicating parent-child relationships. Another configuration could represent linked objects in an API schema, where adjacency implies connections. While text or values inside the cells may supplement the interpretation, under BSS the **primary layer of meaning is carried by the arrangement and structure of filled versus empty cells.**

## Implications and new possibilities

This approach is powerful precisely because it reveals that **the semantics of a grid are never dictated by the file format itself**. A CSV is simply a 2D array of values. It gains the semantics of a table only by agreed interpretation, just as a bitmap grid gains the semantics of letters only by holistic shape matching. BSS shows that the same humble CSV file—traditionally viewed as flat tabular data—can instead function as a spatial canvas for far more sophisticated meanings.

By emphasizing spatial relationships, BSS supports novel frameworks for representing data structures and program logic. This opens new avenues for creating 2D visual programming environments, advanced data visualization models, or systems for encoding entire software architectures within a single 2D binary map.

## Conclusion

Binary Spatial Semantics repositions our understanding of grids and CSV files. By focusing on the spatial arrangement of filled cells to encode meaning, it transcends the traditional constraints of both holistic bitmap patterns and table-based row-column semantics. This framework demonstrates that grids are inherently flexible representational tools: their semantics derive entirely from how we choose to interpret the positioning of their elements. In doing so, BSS not only offers a richer approach to representing complex data, logic, and systems but also challenges long-standing assumptions about what simple grid files like CSV can express.
