export interface Cell {
	row: number;
	col: number;
	key: string; // 'R{row}C{col}'
	value: string;
	gridValue: Grid;
}

export enum Direction {
	Right,
	Down,
	Left,
	Up
}

export interface Range {
	topRow: number;
	bottomRow: number;
	leftCol: number;
	rightCol: number;
}

// Base Structure Interface
export interface BaseStructure extends Range {
	rootCell: Cell;
	cells: Cell[];
	primaryDirection: Direction;
	secondaryDirection?: Direction;
	subStructures?: Structure[]; // Allows for nested structures
}

// Specific Tree and Table Interfaces with Nested Types
export interface TreeStructure extends BaseStructure {
	type: 'tree';
	nodes: TreeNodeStructure[]; // Tree nodes
}

export interface TableStructure extends BaseStructure {
	type: 'table';
	headers: TableHeaderStructure[];
	rows: TableRowStructure[];
}

// Matrix and Key-Value Structures
export interface MatrixStructure extends BaseStructure {
	type: 'matrix';
	matrixCells: Cell[][];
}

export interface KeyValuesStructure extends BaseStructure {
	type: 'keyValues';
	keyValuesMap: Map<Cell, Cell[]>; // Maps each key cell to one or more value cells
}

// New Compound Structure for Nested Types
export interface CompoundStructure extends BaseStructure {
	type: 'treeHeaderMatrix' | 'tableWithKeyValues'; // Compound types
	components: Structure[]; // Contains nested structures
}

// Definition of TreeNode, TableRow, TableHeader as Nested Variants
export interface TreeNodeStructure extends BaseStructure {
	type: 'treeNode';
	parent?: TreeNodeStructure;
	children: TreeNodeStructure[];
	subHeader: TreeNodeHeaderStructure;
}

export interface TreeNodeHeaderStructure extends BaseStructure {
	type: 'treeNodeHeader';
	headers: Cell[];
	parentNode?: TreeNodeStructure;
}

export interface TableHeaderStructure extends BaseStructure {
	type: 'tableHeader';
	columns: Cell[];
}

export interface TableRowStructure extends BaseStructure {
	type: 'tableRow';
	cells: Cell[];
}

// Unified Structure Type Including All Specific and Compound Types
export type Structure =
	| TreeStructure
	| TableStructure
	| MatrixStructure
	| KeyValuesStructure
	| CompoundStructure
	| TreeNodeStructure
	| TreeNodeHeaderStructure
	| TableHeaderStructure
	| TableRowStructure;

// Block, Grid, and Other Interfaces
export interface CellCluster extends Range {
	cells: Cell[];
	structures: Structure[];
}

export interface Block extends Range {
	canvasCells: Cell[];
	unclusteredCanvasCells: Cell[];
	borderCells: Cell[];
	frameCells: Cell[];
	cellClusters: CellCluster[];
	compoundStructures: Structure[];
}

export interface Grid {
	index: number;
	name?: string;
	cells: Map<string, Cell>;
	blocks: Block[];
	numberOfRows: number;
	numberOfColumns: number;
}

export interface Grids {
	grids: Grid[];
}
