// Orientation enum for CellCluster
export enum Orientation {
  Landscape = "landscape",
  Portrait = "portrait",
  Square = "square",
}

// Direction enums for derived traits
export enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

export enum RootCellPosition {
  TopLeft = "topLeft",
  TopRight = "topRight",
  BottomRight = "bottomRight",
  BottomLeft = "bottomLeft",
}

export enum DynamicCorePattern {
  TopLeftBottomRightDiagonal = "topLeftBottomRightDiagonal",
  TopRightBottomLeftDiagonal = "topRightBottomLeftDiagonal",
}

// Base trait interfaces
export interface PerimeterTraits {
  isFilled: boolean;
  cellCount: number;
  filledCount: number;
}

export interface EdgeTraits {
  isFilled: boolean;
  filledCellCount: number;
  percentFilled: number;
}

export interface DimensionTraits {
  isFilled: boolean;
  filledCellCount: number;
  percentFilled: number;
  firstFilledColumnFromLeft?: number;
  firstFilledColumnFromRight?: number;
  firstFilledRowFromTop?: number;
  firstFilledRowFromBottom?: number;
  maxContinuousRunOfFilledCellsCount: number;
  maxContinuousRunOfEmptyCellsCount: number;
  areAllFilledCellsContiguous: boolean;
}

export interface QuarterTraits {
  isFilled: boolean;
  rowCount: number;
  columnCount: number;
  cellCount: number;
  filledCount: number;
  staticCorePattern?: string;
}

export interface CornerTraits {
  isFilled: boolean;
}

export interface DiagonalTraits {
  isFilled: boolean;
  cellCount: number;
  filledCount: number;
  percentFilled: number;
}

export interface CenterCellTraits {
  isFilled: boolean;
  isOffsetFromCenter?: boolean;
}

export interface WeightedCenterCellTraits {
  isFilled: boolean;
}

// Composite trait interfaces
export interface FirstFilledPatternTraits {
  continuous: boolean;
  topDownMaxIndentation?: number;
  topDownMaxRetraction?: number;
  bottomUpMaxIndentation?: number;
  bottomUpMaxRetraction?: number;
  leftRightMaxIndentation?: number;
  leftRightMaxRetraction?: number;
  rightLeftMaxIndentation?: number;
  rightLeftMaxRetraction?: number;
}

export interface SymmetryTraits {
  leftRightSymmetry: boolean;
  topBottomSymmetry: boolean;
  quarterSymmetry: {
    topLeft: boolean;
    topRight: boolean;
    bottomRight: boolean;
    bottomLeft: boolean;
  };
}

/**
 * Base traits for CellCluster - fundamental cell group properties
 */
export interface CellClusterBaseTraits {
  // Size and geometry
  cellCount: number;
  width: number;
  height: number;
  area: number;
  aspectRatio: number;
  density: number; // non-empty cells / total cells

  // Content distribution
  emptyCellCount: number;
  nonEmptyCellCount: number;
  fillRatio: number; // non-empty / total

  // Shape characteristics
  isRectangular: boolean;
  isSquare: boolean;
  isLinear: boolean;
  isHorizontalStrip: boolean;
  isVerticalStrip: boolean;
  isSingleCell: boolean;

  // Boundary properties
  hasRegularBoundary: boolean;
  isContiguous: boolean;
  hasConcavity: boolean;

  // Position within grid
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;
  centerRow: number;
  centerCol: number;
}

/**
 * Composite traits for CellCluster - content and pattern analysis
 */
export interface CellClusterCompositeTraits {
  // Content types and distribution
  contentTypes: Set<string>; // 'text', 'number', 'formula', 'date', 'boolean'
  hasUniformContent: boolean;
  hasMixedContent: boolean;
  hasNumericContent: boolean;
  hasTextContent: boolean;
  hasFormulas: boolean;
  dominantContentType: string;

  // Structural patterns within cluster
  hasHeaders: boolean;
  hasFooters: boolean;
  hasBorders: boolean;
  hasPattern: boolean;
  hasColumnStructure: boolean;
  hasRowStructure: boolean;

  // Content alignment and organization
  contentAlignment: "left" | "right" | "center" | "mixed" | "none";
  hasConsistentAlignment: boolean;
  alignmentPattern: string;

  // Data characteristics
  dataTypes: string[]; // ['number', 'text', 'date', 'formula', etc.]
  dominantDataType: string;
  dataConsistency: number; // 0-1 how consistent the data types are

  // Data patterns
  hasSequentialData: boolean;
  hasRepeatingPattern: boolean;
  hasHierarchicalStructure: boolean;
  hasTabularStructure: boolean;
  hasCalculationPattern: boolean;

  // Content quality
  hasEmptySpaces: boolean;
  hasInconsistentTypes: boolean;
  dataQuality: number; // 0-1 score
  completenessRatio: number; // filled cells / total cells

  // Functional patterns
  isDataEntry: boolean;
  isCalculation: boolean;
  isLookupTable: boolean;
  isHeader: boolean;
  isLabel: boolean;
  isContainer: boolean;
  isNavigation: boolean;

  // Visual patterns
  hasAlignment: boolean;
  hasConsistentFormatting: boolean;
  visualCoherence: number; // 0-1 score
  standsOutVisually: boolean;

  // Relationship to grid
  alignsWithGridStructure: boolean;
  bridgesMultipleRegions: boolean;
  isIsolated: boolean;
  connectsToOtherClusters: boolean;

  // Data flow characteristics
  hasInputs: boolean;
  hasOutputs: boolean;
  isIntermediate: boolean;
  participatesInCalculation: boolean;
  hasDataDependencies: boolean;
}

/**
 * Derived traits for CellCluster - high-level semantic understanding
 */
export interface CellClusterDerivedTraits {
  // Purpose classification
  primaryPurpose:
    | "data-storage"
    | "calculation"
    | "display"
    | "navigation"
    | "decoration"
    | "structure";
  secondaryPurposes: string[];
  confidence: number;

  // Content semantics
  likelyDataType:
    | "financial"
    | "personal"
    | "scientific"
    | "categorical"
    | "temporal"
    | "textual"
    | "mixed";
  semanticRole:
    | "header"
    | "data"
    | "summary"
    | "formula"
    | "constant"
    | "variable"
    | "title"
    | "navigation"
    | "footer"
    | "mixed";

  // Behavioral hints (moved from BlockTraits)
  isContainer: boolean;
  isLeaf: boolean;
  isHeader: boolean;
  isFooter: boolean;
  isData: boolean;
  isNavigation: boolean;
  isTitle: boolean;
  isSummary: boolean;

  // Directional orientation
  primaryDirection: "horizontal" | "vertical" | "radial" | "none";
  secondaryDirection: "horizontal" | "vertical" | "radial" | "none";

  // User interface elements
  isInteractive: boolean;
  isReadOnly: boolean;
  requiresValidation: boolean;
  hasConstraints: boolean;
  isUserEditable: boolean;

  // Construct indicators
  indicatesConstruct: string[]; // 'table', 'form', 'list', 'calculation-block', etc.
  constructConfidence: number;
  likelyConstructs: string[]; // Additional construct possibilities

  // Content importance and hierarchy
  importance: number; // 0-1 relative importance score
  hierarchyLevel: number; // nesting depth
  isParent: boolean;
  isChild: boolean;
  isSibling: boolean;

  // Business logic implications
  hasBusinessLogic: boolean;
  isRuleBasedInput: boolean;
  isAuditableData: boolean;
  requiresBackup: boolean;
  hasValidationRules: boolean;

  // Evolution characteristics
  isStable: boolean;
  isGrowthPoint: boolean;
  hasExtensionPotential: boolean;
  changeFrequency: "static" | "occasional" | "frequent" | "dynamic";
  isExpandable: boolean;

  // Quality and maintenance
  dataIntegrity: number; // 0-1 score
  maintainabilityScore: number; // 0-1 score
  complexity: "simple" | "moderate" | "complex" | "very-complex";
  structuralIntegrity: number; // 0-1 score

  // Performance implications
  computationComplexity: number; // 0-1 score
  updateFrequency: number; // 0-1 score representing how often this changes
  cachingBenefit: number; // 0-1 score for caching potential
  renderingCost: number; // 0-1 cost to display
}

/**
 * Tree Detection Traits - Precise algorithmic constraints for tree identification
 */
export interface TreeDetectionTraits {
  // Primary tree constraints
  allCellsFilled: boolean;                    // false for trees (would be table if true)
  filledTopLeftCell: boolean;                 // true for trees (anchor point)
  
  // Indentation analysis (critical for trees)
  maxRowIndentationIncrease: number;          // ≤1 for trees (children max 1 column right of parent)
  maxColumnIndentationIncrease: number;       // ≤1 for transposed trees
  
  // Gap analysis in rows/columns
  maxGapSizeInAnyRow: number;                 // ≤1 for trees (max contiguous empty cells between filled)
  maxGapSizeInAnyColumn: number;              // ≤1 for transposed trees
  maxGapCountInAnyRow: number;                // ≤1 for trees (max number of gap instances)
  maxGapCountInAnyColumn: number;             // ≤1 for transposed trees
  
  // Gap positioning constraints
  maxFilledCellsBeforeAnyRowGap: number;      // ≤1 for trees (gap only next to parent)
  maxFilledCellsBeforeAnyColumnGap: number;   // ≤1 for transposed trees
  
  // Parent-specific gap constraints
  nonParentRowsWithGap: number;               // 0 for trees (gaps only on parent rows)
  nonParentColumnsWithGap: number;            // 0 for transposed trees
}

/**
 * Consolidated Corner Analysis from SpatialRelationshipTraits
 */
export interface CornerAnalysis {
  topLeft: {
    filled: boolean;
    content?: string;
    isEmpty: boolean;
  };
  topRight: {
    filled: boolean;
    content?: string;
    isEmpty: boolean;
  };
  bottomLeft: {
    filled: boolean;
    content?: string;
    isEmpty: boolean;
  };
  bottomRight: {
    filled: boolean;
    content?: string;
    isEmpty: boolean;
  };
  
  filledCornerCount: number;
  emptyCornerCount: number;
  primaryCorner?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}

/**
 * Consolidated Edge Analysis from SpatialRelationshipTraits
 */
export interface EdgeAnalysis {
  top: {
    fillPattern: string;
    density: number;
    hasGaps: boolean;
    isFullyFilled: boolean;
    firstFilledIndex?: number;
    lastFilledIndex?: number;
  };
  bottom: {
    fillPattern: string;
    density: number;
    hasGaps: boolean;
    isFullyFilled: boolean;
    firstFilledIndex?: number;
    lastFilledIndex?: number;
  };
  left: {
    fillPattern: string;
    density: number;
    hasGaps: boolean;
    isFullyFilled: boolean;
    firstFilledIndex?: number;
    lastFilledIndex?: number;
  };
  right: {
    fillPattern: string;
    density: number;
    hasGaps: boolean;
    isFullyFilled: boolean;
    firstFilledIndex?: number;
    lastFilledIndex?: number;
  };
  
  fullyFilledEdges: Array<"top" | "bottom" | "left" | "right">;
  regularEdges: Array<"top" | "bottom" | "left" | "right">;
}

/**
 * Consolidated Indentation Analysis from SpatialRelationshipTraits
 */
export interface IndentationAnalysis {
  hasConsistentIndentation: boolean;
  indentationLevels: number;
  maxIndentation: number;
  indentationDirection: Direction;
  followsTreePattern: boolean;
  followsListPattern: boolean;
}

/**
 * Construct Detection Traits - High-level patterns for different constructs
 */
export interface ConstructDetectionTraits {
  // Tree indicators
  hasTopLeftAnchor: boolean;
  hasHierarchicalIndentation: boolean;
  hasTreeLikeStructure: boolean;
  
  // Table indicators  
  hasTopRowFilled: boolean;
  hasColumnAlignment: boolean;
  hasTabularStructure: boolean;
  
  // Matrix indicators
  hasLeftColumnFilled: boolean;
  hasTopAndLeftEdgesFilled: boolean;
  hasGridLikeStructure: boolean;
  
  // Key-Value indicators
  hasKeyValuePairs: boolean;
  hasConsistentRowPairs: boolean;
  
  // General structure
  fillDensity: number;
  gridLikeness: number;
  isRegular: boolean;
}

/**
 * Complete CellClusterTraits combining all categories
 */
export interface CellClusterTraits {
  base: CellClusterBaseTraits;
  composite: CellClusterCompositeTraits;
  derived: CellClusterDerivedTraits;
  
  // Enhanced trait categories for construct detection
  treeDetection: TreeDetectionTraits;
  constructDetection: ConstructDetectionTraits;
  corners: CornerAnalysis;
  edges: EdgeAnalysis;
  indentation: IndentationAnalysis;
}
