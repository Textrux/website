import { Direction } from "../cell-cluster/CellClusterTraits";

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
  dimensions: BlockJoinDimensionTraits;
  position: BlockJoinPositionTraits;
  strength: BlockJoinStrengthTraits;
  compatibility: BlockJoinCompatibilityTraits;
}

export interface BlockJoinCompositeTraits {
  isWellFormed: boolean;
  hasOptimalPlacement: boolean;
  providesStructuralIntegrity: boolean;
  enhancesFunctionality: boolean;
  maintainsVisualContinuity: boolean;
  overallQuality: number; // 0-1 score of join quality
}

export interface BlockJoinDerivedTraits {
  primaryFunction: string; // e.g., "structural", "navigational", "visual", "functional"
  joinRole: string; // e.g., "connector", "bridge", "anchor", "separator"
  interactionType: string; // e.g., "passive", "active", "conditional"
  visualImpact: number; // 0-1 score of visual prominence
  functionalCriticality: number; // 0-1 score of functional importance
}

// Main BlockJoinTraits interface
export interface BlockJoinTraits {
  base: BlockJoinBaseTraits;
  composite: BlockJoinCompositeTraits;
  derived: BlockJoinDerivedTraits;
}
