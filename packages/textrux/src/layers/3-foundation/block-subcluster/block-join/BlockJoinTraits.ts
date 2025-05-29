import { Direction } from "../../cell-cluster/CellClusterTraits";

// BlockJoin-specific enums
export enum JoinType {
  Linked = "linked",
  Locked = "locked",
  Mixed = "mixed",
}

export enum JoinStrength {
  Weak = "weak",
  Medium = "medium",
  Strong = "strong",
  Absolute = "absolute",
}

export enum JoinGeometry {
  Point = "point",
  Line = "line",
  Corner = "corner",
  Edge = "edge",
  Area = "area",
  Complex = "complex",
}

export enum JoinPosition {
  Center = "center",
  Edge = "edge",
  Corner = "corner",
  Offset = "offset",
}

// Base trait interfaces for BlockJoin
export interface BlockJoinDimensionTraits {
  linkedPointCount: number;
  lockedPointCount: number;
  totalOverlapCount: number;
  overlapArea: number;
  overlapPerimeter: number;
  overlapDensity: number; // points per unit area
  joinGeometry: JoinGeometry;
}

export interface BlockJoinPositionTraits {
  joinPosition: JoinPosition;
  relativePositionX: number; // -1 to 1, relative position within blocks
  relativePositionY: number; // -1 to 1, relative position within blocks
  distanceFromBlockCenters: number;
  alignmentDirection: Direction;
  isSymmetricPlacement: boolean;
}

export interface BlockJoinStrengthTraits {
  joinType: JoinType;
  joinStrength: JoinStrength;
  structuralImportance: number; // 0-1 score of how critical this join is
  connectionStability: number; // 0-1 score of how stable the connection is
  loadBearingCapacity: number; // 0-1 score of structural load capacity
}

export interface BlockJoinCompatibilityTraits {
  blockSizeCompatibility: number; // 0-1 score of how well block sizes match
  blockTypeCompatibility: number; // 0-1 score of how well block types work together
  orientationAlignment: number; // 0-1 score of orientation compatibility
  functionalSynergy: number; // 0-1 score of functional compatibility
}

// Main trait categories for BlockJoin
export interface BlockJoinBaseTraits {
  // Connection geometry
  connectionType: "adjacent" | "overlapping" | "nested" | "bridged" | "distant";
  connectionStrength: number; // 0-1 based on overlap/proximity

  // Spatial metrics
  overlapArea: number;
  proximityDistance: number;
  connectionPoints: number;

  // Block relationship
  relativeSizes: "equal" | "larger-first" | "smaller-first" | "varied";
  relativePositions: "horizontal" | "vertical" | "diagonal" | "nested";

  // Connection directionality
  isDirectional: boolean;
  direction: "bidirectional" | "first-to-second" | "second-to-first" | "none";

  // Lock/Link distribution
  linkedPointRatio: number; // linked / total connection points
  lockedPointRatio: number; // locked / total connection points
  connectionBalance: number; // how balanced the linked/locked distribution is
}

export interface BlockJoinCompositeTraits {
  // Relationship semantics
  relationshipType:
    | "parent-child"
    | "sibling"
    | "master-detail"
    | "peer"
    | "container-content"
    | "sequence";
  semanticStrength: number; // 0-1 how semantically meaningful the connection is

  // Functional connection
  isDataFlow: boolean;
  isControlFlow: boolean;
  isStructural: boolean;
  isDecorative: boolean;

  // Content relationship
  hasContentCohesion: boolean;
  hasComplementaryContent: boolean;
  hasDataContinuity: boolean;

  // Interaction patterns
  impliesNavigation: boolean;
  impliesSelection: boolean;
  impliesHierarchy: boolean;
  impliesSequence: boolean;

  // Visual connection
  hasVisualContinuity: boolean;
  createsVisualFlow: boolean;
  establishesBoundary: boolean;

  // Stability indicators
  connectionStability: "stable" | "flexible" | "dynamic" | "fragile";
  resistanceToChange: number; // 0-1 how resistant to modification
}

export interface BlockJoinDerivedTraits {
  // Purpose classification
  primaryPurpose:
    | "organization"
    | "navigation"
    | "data-relationship"
    | "visual-grouping"
    | "functional-link";
  secondaryPurposes: string[];

  // Construct indicators
  indicatesConstruct: string[]; // what higher-level constructs this join suggests
  constructConfidence: number;

  // User experience implications
  affectsUsability: boolean;
  improvesNavigation: boolean;
  clarifiesStructure: boolean;
  reducesComplexity: boolean;

  // Design patterns
  followsPattern: string; // 'master-detail', 'parent-child', 'sequential', etc.
  patternStrength: number;

  // Evolution indicators
  isEvolutionPoint: boolean; // likely place for structural changes
  extensibilityPotential: number; // 0-1 potential for adding more connections

  // Quality metrics
  connectionQuality: "excellent" | "good" | "adequate" | "poor";
  improvementSuggestions: string[];

  // Importance in overall structure
  structuralImportance: number; // 0-1 how critical this connection is
  redundancy: number; // 0-1 how redundant this connection is
}

// Main BlockJoinTraits interface
export interface BlockJoinTraits {
  base: BlockJoinBaseTraits;
  composite: BlockJoinCompositeTraits;
  derived: BlockJoinDerivedTraits;
}
