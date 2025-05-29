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
  dominantContentType: string;

  // Data patterns
  hasSequentialData: boolean;
  hasRepeatingPattern: boolean;
  hasHierarchicalStructure: boolean;
  hasTabularStructure: boolean;

  // Content quality
  hasEmptySpaces: boolean;
  hasInconsistentTypes: boolean;
  dataQuality: number; // 0-1 score

  // Functional patterns
  isDataEntry: boolean;
  isCalculation: boolean;
  isLookupTable: boolean;
  isHeader: boolean;
  isLabel: boolean;

  // Visual patterns
  hasAlignment: boolean;
  hasConsistentFormatting: boolean;
  visualCoherence: number; // 0-1 score

  // Relationship to grid
  alignsWithGridStructure: boolean;
  bridgesMultipleRegions: boolean;
  isIsolated: boolean;

  // Data flow characteristics
  hasInputs: boolean;
  hasOutputs: boolean;
  isIntermediate: boolean;
  participatesInCalculation: boolean;
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
    | "mixed";

  // User interface elements
  isInteractive: boolean;
  isReadOnly: boolean;
  requiresValidation: boolean;
  hasConstraints: boolean;

  // Construct indicators
  indicatesConstruct: string[]; // 'table', 'form', 'list', 'calculation-block', etc.
  constructConfidence: number;

  // Business logic implications
  hasBusinessLogic: boolean;
  isRuleBasedInput: boolean;
  isAuditableData: boolean;
  requiresBackup: boolean;

  // Evolution characteristics
  isStable: boolean;
  isGrowthPoint: boolean;
  hasExtensionPotential: boolean;
  changeFrequency: "static" | "occasional" | "frequent" | "dynamic";

  // Quality and maintenance
  dataIntegrity: number; // 0-1 score
  maintainabilityScore: number; // 0-1 score
  complexity: "simple" | "moderate" | "complex" | "very-complex";

  // Performance implications
  computationComplexity: number; // 0-1 score
  updateFrequency: number; // 0-1 score representing how often this changes
  cachingBenefit: number; // 0-1 score for caching potential
}

/**
 * Complete CellClusterTraits combining all categories
 */
export interface CellClusterTraits {
  base: CellClusterBaseTraits;
  composite: CellClusterCompositeTraits;
  derived: CellClusterDerivedTraits;
}
