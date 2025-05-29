/**
 * CellSubclusterTraits - Fine-grained analysis of connected components within cell clusters
 * These traits focus on the properties of individual contiguous regions of filled cells
 */

// Enums for subcluster-specific traits
export enum SubclusterShape {
  Single = "single",
  LinearHorizontal = "linear-horizontal",
  LinearVertical = "linear-vertical",
  Rectangular = "rectangular",
  LShaped = "l-shaped",
  TShaped = "t-shaped",
  Cross = "cross",
  Irregular = "irregular",
}

export enum ConnectivityPattern {
  Isolated = "isolated", // Single cell
  Linear = "linear", // Straight line
  Branched = "branched", // Has branches
  Compact = "compact", // Dense, rectangular-ish
  Sparse = "sparse", // Spread out with gaps
  Complex = "complex", // Complex irregular shape
}

/**
 * Base traits for CellSubcluster - fundamental connected component properties
 */
export interface CellSubclusterBaseTraits {
  // Basic geometry
  cellCount: number;
  width: number;
  height: number;
  boundingArea: number;
  density: number; // cellCount / boundingArea

  // Position
  topRow: number;
  bottomRow: number;
  leftCol: number;
  rightCol: number;
  centerRow: number;
  centerCol: number;

  // Shape classification
  shape: SubclusterShape;
  isSingleCell: boolean;
  isLinear: boolean;
  isRectangular: boolean;
  isCompact: boolean;

  // Connectivity
  connectivityPattern: ConnectivityPattern;
  perimeterCellCount: number;
  internalCellCount: number; // cells not on perimeter

  // Spatial characteristics
  hasRegularShape: boolean;
  aspectRatio: number;
  elongationFactor: number; // how stretched the shape is
  compactnessFactor: number; // how close to circular
}

/**
 * Composite traits for CellSubcluster - content and structural analysis
 */
export interface CellSubclusterCompositeTraits {
  // Content uniformity
  hasUniformContent: boolean;
  contentVariability: number; // 0-1 measure of content variation
  dominantContentType: "text" | "number" | "formula" | "empty" | "mixed";

  // Content patterns within the subcluster
  hasSequentialPattern: boolean; // like A1, A2, A3
  hasCalculationChain: boolean; // formulas referencing each other
  hasConstantValues: boolean;

  // Local structure
  hasLocalSymmetry: boolean;
  hasRepeatingElements: boolean;
  followsGridAlignment: boolean;

  // Content density and distribution
  contentDensity: number; // non-empty cells / total cells
  hasEmptyInterior: boolean; // hollow shape
  hasEmptyPerimeter: boolean;

  // Functional coherence
  servesUnifiedPurpose: boolean;
  hasInternalLogic: boolean;
  isAtomicUnit: boolean; // shouldn't be subdivided further

  // Visual coherence
  hasConsistentFormatting: boolean;
  visualCohesion: number; // 0-1 score
  standsOutVisually: boolean;
}

/**
 * Derived traits for CellSubcluster - semantic and functional classification
 */
export interface CellSubclusterDerivedTraits {
  // Purpose classification
  primaryFunction:
    | "data-value" // Single value or small value group
    | "label" // Text identifier
    | "calculation" // Formula or calculation result
    | "structure" // Provides visual structure
    | "decoration" // Visual element
    | "connector"; // Bridges or connects other elements

  // Semantic role
  semanticRole:
    | "atomic-data" // Indivisible data unit
    | "compound-data" // Multi-part data
    | "identifier" // Name, label, ID
    | "value" // Numeric or calculated value
    | "formula" // Calculation logic
    | "spacer" // Visual spacing
    | "border" // Edge or boundary
    | "junction"; // Connection point

  // Content semantics
  dataType: "text" | "numeric" | "formula" | "identifier" | "mixed" | "empty";
  isConstant: boolean;
  isVariable: boolean;
  isCalculated: boolean;

  // Interaction patterns
  isUserEditable: boolean;
  isSystemGenerated: boolean;
  isReadOnly: boolean;
  requiresInput: boolean;

  // Relationship indicators
  isStandalone: boolean;
  dependsOnOthers: boolean;
  isReferencedByOthers: boolean;
  participatesInFormulas: boolean;

  // Quality metrics
  contentQuality: number; // 0-1 completeness and consistency
  structuralIntegrity: number; // 0-1 shape regularity
  functionalClarity: number; // 0-1 purpose clarity

  // Growth and change characteristics
  isStatic: boolean;
  isGrowthPoint: boolean;
  changesSeparately: boolean; // from parent cluster
  hasExtensionPotential: boolean;

  // Construct contribution
  constructRole: string[]; // roles this plays in larger constructs
  isConstructCore: boolean; // essential to parent construct
  isConstructDetail: boolean; // supplementary to parent construct

  // Performance characteristics
  computationalWeight: number; // 0-1 processing complexity
  updateFrequency: "never" | "rare" | "occasional" | "frequent";
  cachingValue: number; // 0-1 benefit of caching this subcluster
}

/**
 * Complete CellSubclusterTraits interface
 */
export interface CellSubclusterTraits {
  base: CellSubclusterBaseTraits;
  composite: CellSubclusterCompositeTraits;
  derived: CellSubclusterDerivedTraits;
}
