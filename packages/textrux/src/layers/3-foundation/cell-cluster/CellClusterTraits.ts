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

// Main trait categories
export interface CellClusterBaseTraits {
  isFilled: boolean;
  cellCount: number;
  rowCount: number;
  filledCount: number;
  percentFilled: number;
  columnCount: number;
  contiguousSubclusterCount: number;
  orientation: Orientation;
  aspectRatio: number;
  staticCorePattern?: string;

  dimensions: {
    perimeter: PerimeterTraits;
    edges: {
      leftEdge: EdgeTraits;
      topEdge: EdgeTraits;
      rightEdge: EdgeTraits;
      bottomEdge: EdgeTraits;
    };
    rowDimensions: DimensionTraits;
    columnDimensions: DimensionTraits;
    quarterDimensions: {
      topLeft: QuarterTraits;
      topRight: QuarterTraits;
      bottomRight: QuarterTraits;
      bottomLeft: QuarterTraits;
    };
    cornerDimensions: {
      topLeft: CornerTraits;
      topRight: CornerTraits;
      bottomRight: CornerTraits;
      bottomLeft: CornerTraits;
    };
    diagonalDimensions: {
      topLeftBottomRight: DiagonalTraits;
      topRightBottomLeft: DiagonalTraits;
    };
    centerDimensions: {
      centerCell: CenterCellTraits;
      weightedCenterCell: WeightedCenterCellTraits;
    };
  };
}

export interface CellClusterCompositeTraits {
  isRegular: boolean;
  firstFilledPatternLeftEdge: FirstFilledPatternTraits;
  firstFilledPatternRightEdge: FirstFilledPatternTraits;
  firstFilledPatternTopEdge: FirstFilledPatternTraits;
  firstFilledPatternBottomEdge: FirstFilledPatternTraits;
  symmetry: SymmetryTraits;
}

export interface CellClusterDerivedTraits {
  rootCell: RootCellPosition;
  dynamicCorePattern: DynamicCorePattern;
  primaryDirection: Direction;
  secondaryDirection: Direction;
}

// Main CellClusterTraits interface
export interface CellClusterTraits {
  base: CellClusterBaseTraits;
  composite: CellClusterCompositeTraits;
  derived: CellClusterDerivedTraits;
}
