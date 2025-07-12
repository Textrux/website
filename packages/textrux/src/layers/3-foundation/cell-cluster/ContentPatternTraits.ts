/**
 * Content pattern traits for analyzing text content and formatting patterns
 * within cell clusters to detect construct types
 */

import { CellPosition } from "./SpatialRelationshipTraits";

export enum ContentType {
  Text = "text",
  Number = "number",
  Formula = "formula",
  Date = "date",
  Boolean = "boolean",
  Empty = "empty",
  Mixed = "mixed",
}

export enum HierarchyType {
  Numbered = "numbered",     // 1., 1.1, 1.1.1
  Lettered = "lettered",     // a., b., c. or A., B., C.
  Roman = "roman",           // i., ii., iii. or I., II., III.
  Bullets = "bullets",       // •, ◦, ▪, ▫
  Dashes = "dashes",         // -, --, ---
  TreeSymbols = "tree",      // ├, └, │, ─
  Indentation = "indentation", // Spaces or tabs only
  None = "none",
}

export enum AlignmentType {
  Left = "left",
  Center = "center", 
  Right = "right",
  Mixed = "mixed",
  None = "none",
}

/**
 * Analysis of hierarchical indicators in content
 */
export interface HierarchyAnalysis {
  /** Whether content shows consistent indentation patterns */
  hasConsistentIndentation: boolean;
  
  /** Whether content uses numbered hierarchy (1., 1.1, 1.1.1) */
  hasNumberedHierarchy: boolean;
  
  /** Whether content uses lettered hierarchy (a., b., c.) */
  hasLetterHierarchy: boolean;
  
  /** Whether content uses Roman numeral hierarchy */
  hasRomanHierarchy: boolean;
  
  /** Whether content uses bullet points */
  hasBulletPoints: boolean;
  
  /** Whether content uses tree symbols (├, └, │, ─) */
  hasTreeSymbols: boolean;
  
  /** Whether content uses dashes for hierarchy */
  hasDashHierarchy: boolean;
  
  /** Maximum indentation level detected */
  maxIndentationLevel: number;
  
  /** Primary hierarchy type detected */
  primaryHierarchyType: HierarchyType;
  
  /** Cells that appear to be at each hierarchy level */
  cellsByLevel: Map<number, CellPosition[]>;
  
  /** Whether hierarchy follows a tree structure */
  followsTreeStructure: boolean;
  
  /** Whether hierarchy follows a list structure */
  followsListStructure: boolean;
  
  /** Confidence in hierarchy detection (0-1) */
  hierarchyConfidence: number;
}

/**
 * Analysis of structural content patterns
 */
export interface StructureAnalysis {
  /** Whether there's a clear header row */
  hasHeaderRow: boolean;
  
  /** Whether there's a clear header column */
  hasHeaderColumn: boolean;
  
  /** Whether columns have consistent data types */
  hasConsistentColumnTypes: boolean;
  
  /** Whether there are key-value pairs */
  hasKeyValuePairs: boolean;
  
  /** Whether there's an empty corner cell (matrix indicator) */
  hasEmptyCornerCell: boolean;
  
  /** Whether content follows a table structure */
  followsTableStructure: boolean;
  
  /** Whether content follows a matrix structure */
  followsMatrixStructure: boolean;
  
  /** Whether content follows a form structure */
  followsFormStructure: boolean;
  
  /** Positions of detected header cells */
  headerCells: CellPosition[];
  
  /** Positions of detected label/key cells */
  labelCells: CellPosition[];
  
  /** Positions of detected data/value cells */
  dataCells: CellPosition[];
  
  /** Confidence in structure detection (0-1) */
  structureConfidence: number;
}

/**
 * Analysis of content alignment and formatting
 */
export interface AlignmentAnalysis {
  /** Whether content is primarily left-aligned */
  leftAligned: boolean;
  
  /** Whether content is primarily center-aligned */
  centerAligned: boolean;
  
  /** Whether content is primarily right-aligned */
  rightAligned: boolean;
  
  /** Whether alignment is consistent across the cluster */
  consistentAlignment: boolean;
  
  /** Primary alignment type detected */
  primaryAlignment: AlignmentType;
  
  /** Alignment pattern by row/column */
  alignmentByRow: Map<number, AlignmentType>;
  alignmentByColumn: Map<number, AlignmentType>;
  
  /** Whether alignment suggests tabular data */
  suggestsTabularData: boolean;
  
  /** Confidence in alignment analysis (0-1) */
  alignmentConfidence: number;
}

/**
 * Analysis of content types and data patterns
 */
export interface ContentTypeAnalysis {
  /** Distribution of content types */
  contentTypeDistribution: Map<ContentType, number>;
  
  /** Primary content type */
  primaryContentType: ContentType;
  
  /** Whether content types are consistent within columns */
  hasConsistentColumnTypes: boolean;
  
  /** Whether content types are consistent within rows */
  hasConsistentRowTypes: boolean;
  
  /** Content type by column */
  contentTypeByColumn: Map<number, ContentType>;
  
  /** Content type by row */
  contentTypeByRow: Map<number, ContentType>;
  
  /** Whether there are clear data patterns (sequences, formulas) */
  hasDataPatterns: boolean;
  
  /** Whether content suggests calculation/formula usage */
  suggestsCalculation: boolean;
  
  /** Whether content suggests data entry/form usage */
  suggestsDataEntry: boolean;
  
  /** Confidence in content type analysis (0-1) */
  contentTypeConfidence: number;
}

/**
 * Analysis of textual patterns and markers
 */
export interface TextualPatternAnalysis {
  /** Whether text contains file extensions (.txt, .pdf, etc.) */
  hasFileExtensions: boolean;
  
  /** Whether text contains directory indicators (/, \, folder names) */
  hasDirectoryIndicators: boolean;
  
  /** Whether text contains URL patterns */
  hasURLPatterns: boolean;
  
  /** Whether text contains email patterns */
  hasEmailPatterns: boolean;
  
  /** Whether text contains phone number patterns */
  hasPhonePatterns: boolean;
  
  /** Whether text contains date/time patterns */
  hasDateTimePatterns: boolean;
  
  /** Whether text contains monetary patterns ($, €, etc.) */
  hasMonetaryPatterns: boolean;
  
  /** Whether text contains measurement units */
  hasMeasurementUnits: boolean;
  
  /** Whether text contains code-like patterns */
  hasCodePatterns: boolean;
  
  /** Common prefixes or suffixes detected */
  commonPrefixes: string[];
  commonSuffixes: string[];
  
  /** Whether text suggests specific domain (financial, technical, etc.) */
  suggestedDomain: string;
  
  /** Confidence in textual pattern analysis (0-1) */
  textualPatternConfidence: number;
}

/**
 * Analysis of special characters and symbols
 */
export interface SymbolAnalysis {
  /** Tree drawing characters (├, └, │, ─, ┌, ┐, etc.) */
  hasTreeDrawingChars: boolean;
  
  /** Box drawing characters (┌, ┐, └, ┘, etc.) */
  hasBoxDrawingChars: boolean;
  
  /** Mathematical symbols (+, -, ×, ÷, =, etc.) */
  hasMathSymbols: boolean;
  
  /** Currency symbols ($, €, £, ¥, etc.) */
  hasCurrencySymbols: boolean;
  
  /** Bullet symbols (•, ◦, ▪, ▫, ▸, ▹) */
  hasBulletSymbols: boolean;
  
  /** Arrow symbols (→, ←, ↑, ↓, etc.) */
  hasArrowSymbols: boolean;
  
  /** Checkmark/cross symbols (✓, ✗, ☑, ☐) */
  hasCheckSymbols: boolean;
  
  /** Special punctuation (; : , . etc. in specific patterns) */
  hasSpecialPunctuation: boolean;
  
  /** Most common symbols detected */
  commonSymbols: string[];
  
  /** Whether symbols suggest specific construct types */
  symbolsIndicateConstruct: string[];
  
  /** Confidence in symbol analysis (0-1) */
  symbolConfidence: number;
}

/**
 * Complete content pattern traits for a cell cluster
 */
export interface ContentPatternTraits {
  /** Analysis of hierarchical content indicators */
  hierarchy: HierarchyAnalysis;
  
  /** Analysis of structural content patterns */
  structure: StructureAnalysis;
  
  /** Analysis of content alignment and formatting */
  alignment: AlignmentAnalysis;
  
  /** Analysis of content types and data patterns */
  contentTypes: ContentTypeAnalysis;
  
  /** Analysis of textual patterns and markers */
  textualPatterns: TextualPatternAnalysis;
  
  /** Analysis of special characters and symbols */
  symbols: SymbolAnalysis;
  
  /** Overall content coherence score (0-1) */
  contentCoherence: number;
  
  /** Whether content shows clear patterns */
  hasIdentifiablePatterns: boolean;
  
  /** Primary pattern type suggested by content */
  primaryPatternType: "tree" | "table" | "matrix" | "form" | "list" | "mixed" | "unknown";
  
  /** Confidence in the overall content analysis (0-1) */
  analysisConfidence: number;
  
  /** Suggested construct types based on content patterns */
  suggestedConstructs: string[];
}