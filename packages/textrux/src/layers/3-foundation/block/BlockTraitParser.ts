import Block from "./Block";
import {
  BlockTraits,
  BlockBaseTraits,
  BlockCompositeTraits,
  BlockDerivedTraits,
  BlockShape,
  BlockLayout,
} from "./BlockTraits";
import GridModel from "../../1-substrate/GridModel";

/**
 * Parses and analyzes Block instances to populate their trait properties
 * Focuses on geometric properties, spatial relationships, and overall block structure
 */
export class BlockTraitParser {
  private grid: GridModel;

  constructor(grid: GridModel) {
    this.grid = grid;
  }

  /**
   * Parse all traits for a Block instance
   */
  parseTraits(block: Block): BlockTraits {
    const base = this.parseBaseTraits(block);
    const composite = this.parseCompositeTraits(block, base);
    const derived = this.parseDerivedTraits(block, base, composite);

    return { base, composite, derived };
  }

  /**
   * Parse fundamental geometric and spatial properties
   */
  private parseBaseTraits(block: Block): BlockBaseTraits {
    const width = block.rightCol - block.leftCol + 1;
    const height = block.bottomRow - block.topRow + 1;
    const area = width * height;
    const aspectRatio = width / height;

    const centerRow = Math.floor((block.topRow + block.bottomRow) / 2);
    const centerCol = Math.floor((block.leftCol + block.rightCol) / 2);

    // Cell counts for different block regions
    const canvasCellCount = block.canvasPoints.length;
    const borderCellCount = block.borderPoints.length;
    const frameCellCount = block.framePoints.length;
    const totalBoundingCellCount = area;
    const canvasFillDensity = canvasCellCount / totalBoundingCellCount;

    // Shape analysis
    const blockShape = this.determineBlockShape(
      width,
      height,
      canvasCellCount,
      area
    );
    const isSquare = width === height;
    const isRectangular = true; // Blocks are always rectangular bounding boxes
    const isLinear = width === 1 || height === 1;
    const isHorizontalLine = height === 1 && width > 1;
    const isVerticalLine = width === 1 && height > 1;
    const isSingleCell = width === 1 && height === 1;

    // Boundary analysis
    const hasDefinedBoundary = borderCellCount > 0 || frameCellCount > 0;
    const boundaryRegularity = this.calculateBoundaryRegularity(block);

    return {
      width,
      height,
      area,
      aspectRatio,
      topRow: block.topRow,
      bottomRow: block.bottomRow,
      leftCol: block.leftCol,
      rightCol: block.rightCol,
      centerRow,
      centerCol,
      canvasCellCount,
      borderCellCount,
      frameCellCount,
      totalBoundingCellCount,
      canvasFillDensity,
      blockShape,
      isSquare,
      isRectangular,
      isLinear,
      isHorizontalLine,
      isVerticalLine,
      isSingleCell,
      hasDefinedBoundary,
      boundaryRegularity,
    };
  }

  /**
   * Parse relationships and structural patterns at block level
   */
  private parseCompositeTraits(
    block: Block,
    base: BlockBaseTraits
  ): BlockCompositeTraits {
    // Cell cluster analysis
    const cellClusterCount = block.cellClusters?.length || 0;
    const clusterSizes =
      block.cellClusters?.map((c) => c.filledPoints.length) || [];
    const largestCellClusterSize =
      clusterSizes.length > 0 ? Math.max(...clusterSizes) : 0;
    const averageCellClusterSize =
      clusterSizes.length > 0
        ? clusterSizes.reduce((a, b) => a + b, 0) / clusterSizes.length
        : 0;
    const clusterSizeVariability = this.calculateVariability(clusterSizes);

    // Spatial arrangement
    const clusterLayout = this.determineClusterLayout(block);
    const clustersAreContiguous = this.clustersAreContiguous(block);
    const clustersAreAligned = this.clustersAreAligned(block);
    const clusterSpacing = this.analyzeClusterSpacing(block);

    // Boundary analysis
    const hasCompleteBorder = this.hasCompleteBoundary(
      block.borderPoints,
      base
    );
    const hasCompleteFrame = this.hasCompleteBoundary(block.framePoints, base);
    const borderThickness = this.calculateBorderThickness(block);
    const frameThickness = this.calculateFrameThickness(block);
    const borderGaps = this.countBoundaryGaps(block.borderPoints, base);
    const frameGaps = this.countBoundaryGaps(block.framePoints, base);
    const boundaryQuality = this.calculateBoundaryQuality(
      hasCompleteBorder,
      hasCompleteFrame,
      borderGaps,
      frameGaps
    );

    // Internal structure
    const hasInternalStructure = cellClusterCount > 1;
    const structuralComplexity = this.calculateStructuralComplexity(
      cellClusterCount,
      clusterLayout
    );
    const hasSymmetricLayout = this.hasSymmetricLayout(block);
    const hasRegularSpacing = this.hasRegularSpacing(block);

    // Connectivity patterns
    const clustersAreConnected = this.clustersAreConnected(block);
    const connectionDensity = this.calculateConnectionDensity(block);
    const hasHierarchicalRelations = this.hasHierarchicalRelations(block);
    const hasLinearFlow = this.hasLinearFlow(block);

    // Empty space utilization
    const emptySpaceRatio =
      (base.totalBoundingCellCount - base.canvasCellCount) /
      base.totalBoundingCellCount;
    const emptySpaceDistribution = this.analyzeEmptySpaceDistribution(block);
    const hasSignificantWhitespace = emptySpaceRatio > 0.3;

    return {
      cellClusterCount,
      largestCellClusterSize,
      averageCellClusterSize,
      clusterSizeVariability,
      clusterLayout,
      clustersAreContiguous,
      clustersAreAligned,
      clusterSpacing,
      hasCompleteBorder,
      hasCompleteFrame,
      borderThickness,
      frameThickness,
      borderGaps,
      frameGaps,
      boundaryQuality,
      hasInternalStructure,
      structuralComplexity,
      hasSymmetricLayout,
      hasRegularSpacing,
      clustersAreConnected,
      connectionDensity,
      hasHierarchicalRelations,
      hasLinearFlow,
      emptySpaceRatio,
      emptySpaceDistribution,
      hasSignificantWhitespace,
    };
  }

  /**
   * Parse high-level block purpose and relationships
   */
  private parseDerivedTraits(
    block: Block,
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): BlockDerivedTraits {
    // Structural role classification
    const structuralRole = this.determineStructuralRole(base, composite);
    const layoutPurpose = this.determineLayoutPurpose(base, composite);

    // Block relationships (simplified - would need broader context)
    const isParentBlock = composite.cellClusterCount > 1;
    const isChildBlock = base.area <= 16;
    const isSiblingBlock = !isParentBlock && !isChildBlock;
    const nestingLevel = 0; // Would need hierarchical context

    // Spatial relationships
    const primaryOrientation = this.determinePrimaryOrientation(
      base,
      composite
    );
    const secondaryOrientation = this.determineSecondaryOrientation(
      base,
      composite,
      primaryOrientation
    );
    const spatialImportance = this.calculateSpatialImportance(base, composite);

    // Functional characteristics
    const isStatic = composite.structuralComplexity < 0.3;
    const isDynamic = !isStatic;
    const isExpandable = this.isExpandable(base, composite);
    const isResizable = composite.hasInternalStructure;
    const isMoveable = base.area <= 64; // Smaller blocks are more moveable

    // Construct indicators
    const likelyBlockConstructs = this.identifyBlockConstructs(base, composite);
    const blockPurposeConfidence = this.calculatePurposeConfidence(
      likelyBlockConstructs,
      base,
      composite
    );

    // Quality metrics
    const structuralIntegrity = this.calculateStructuralIntegrity(
      base,
      composite
    );
    const maintainabilityScore = this.calculateMaintainabilityScore(
      base,
      composite
    );
    const complexity = this.determineComplexity(composite);

    // Performance implications
    const renderingComplexity = this.calculateRenderingComplexity(
      base,
      composite
    );
    const memoryFootprint = this.calculateMemoryFootprint(base);
    const scalability = this.calculateScalability(base, composite);

    return {
      structuralRole,
      layoutPurpose,
      isParentBlock,
      isChildBlock,
      isSiblingBlock,
      nestingLevel,
      primaryOrientation,
      secondaryOrientation,
      spatialImportance,
      isStatic,
      isDynamic,
      isExpandable,
      isResizable,
      isMoveable,
      likelyBlockConstructs,
      blockPurposeConfidence,
      structuralIntegrity,
      maintainabilityScore,
      complexity,
      renderingComplexity,
      memoryFootprint,
      scalability,
    };
  }

  // Helper methods for block analysis

  private determineBlockShape(
    width: number,
    height: number,
    canvasCellCount: number,
    area: number
  ): BlockShape {
    if (width === height) return BlockShape.Square;
    if (canvasCellCount === area) return BlockShape.Rectangle;
    return BlockShape.Irregular;
  }

  private calculateBoundaryRegularity(block: Block): number {
    // Simple regularity based on whether we have complete boundaries
    const hasBorder = block.borderPoints.length > 0;
    const hasFrame = block.framePoints.length > 0;
    if (hasBorder && hasFrame) return 1.0;
    if (hasBorder || hasFrame) return 0.5;
    return 0.0;
  }

  private calculateVariability(values: number[]): number {
    if (values.length <= 1) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance) / (mean + 1); // Normalized standard deviation
  }

  private determineClusterLayout(block: Block): BlockLayout {
    const clusterCount = block.cellClusters?.length || 0;
    if (clusterCount <= 1) return BlockLayout.Single;
    if (clusterCount <= 3) return BlockLayout.Linear;
    return BlockLayout.Grid; // Simplified - could be more sophisticated
  }

  private clustersAreContiguous(block: Block): boolean {
    // Simplified - would need to check if clusters touch each other
    return (block.cellClusters?.length || 0) <= 2;
  }

  private clustersAreAligned(block: Block): boolean {
    // Simplified alignment check
    if (!block.cellClusters || block.cellClusters.length <= 1) return true;
    return false; // Would need geometric analysis
  }

  private analyzeClusterSpacing(
    block: Block
  ): "tight" | "moderate" | "loose" | "mixed" {
    const emptyRatio =
      1 -
      block.canvasPoints.length /
        (block.rightCol - block.leftCol + 1) /
        (block.bottomRow - block.topRow + 1);
    if (emptyRatio < 0.2) return "tight";
    if (emptyRatio < 0.5) return "moderate";
    return "loose";
  }

  private hasCompleteBoundary(
    boundaryPoints: Array<{ row: number; col: number }>,
    base: BlockBaseTraits
  ): boolean {
    // Simplified - would need to check if boundary forms complete ring
    const expectedBoundarySize = 2 * (base.width + base.height - 2);
    return boundaryPoints.length >= expectedBoundarySize * 0.8;
  }

  private calculateBorderThickness(block: Block): number {
    return block.borderPoints.length > 0 ? 1 : 0; // Simplified
  }

  private calculateFrameThickness(block: Block): number {
    return block.framePoints.length > 0 ? 1 : 0; // Simplified
  }

  private countBoundaryGaps(
    boundaryPoints: Array<{ row: number; col: number }>,
    base: BlockBaseTraits
  ): number {
    // Simplified gap counting
    return 0; // Would need geometric analysis
  }

  private calculateBoundaryQuality(
    hasCompleteBorder: boolean,
    hasCompleteFrame: boolean,
    borderGaps: number,
    frameGaps: number
  ): number {
    let quality = 0;
    if (hasCompleteBorder) quality += 0.5;
    if (hasCompleteFrame) quality += 0.5;
    return Math.max(0, quality - (borderGaps + frameGaps) * 0.1);
  }

  private calculateStructuralComplexity(
    clusterCount: number,
    layout: BlockLayout
  ): number {
    const baseComplexity = Math.min(clusterCount / 10, 1); // Normalize to 0-1
    const layoutComplexity =
      layout === BlockLayout.Grid
        ? 0.3
        : layout === BlockLayout.Hierarchical
        ? 0.5
        : 0.1;
    return Math.min(baseComplexity + layoutComplexity, 1);
  }

  private hasSymmetricLayout(block: Block): boolean {
    return false; // Simplified - would need geometric analysis
  }

  private hasRegularSpacing(block: Block): boolean {
    return (block.cellClusters?.length || 0) <= 2; // Simplified
  }

  private clustersAreConnected(block: Block): boolean {
    return (block.cellClusters?.length || 0) <= 1; // Simplified
  }

  private calculateConnectionDensity(block: Block): number {
    const clusterCount = block.cellClusters?.length || 0;
    return clusterCount <= 1 ? 1.0 : 0.5; // Simplified
  }

  private hasHierarchicalRelations(block: Block): boolean {
    return false; // Would need cluster relationship analysis
  }

  private hasLinearFlow(block: Block): boolean {
    return (block.cellClusters?.length || 0) <= 3; // Simplified
  }

  private analyzeEmptySpaceDistribution(
    block: Block
  ): "uniform" | "clustered" | "random" | "structured" {
    return "uniform"; // Simplified - would need spatial analysis
  }

  private determineStructuralRole(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ):
    | "container"
    | "wrapper"
    | "separator"
    | "connector"
    | "standalone"
    | "composite" {
    if (composite.cellClusterCount > 3) return "container";
    if (base.canvasFillDensity < 0.3) return "wrapper";
    if (base.isLinear) return "separator";
    return "standalone";
  }

  private determineLayoutPurpose(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ):
    | "grid-organizer"
    | "list-container"
    | "tree-root"
    | "workspace"
    | "frame-provider"
    | "content-block" {
    if (composite.clusterLayout === BlockLayout.Grid) return "grid-organizer";
    if (composite.clusterLayout === BlockLayout.Linear) return "list-container";
    if (composite.hasCompleteBorder || composite.hasCompleteFrame)
      return "frame-provider";
    return "content-block";
  }

  private determinePrimaryOrientation(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): "horizontal" | "vertical" | "grid" | "radial" | "none" {
    if (base.isHorizontalLine) return "horizontal";
    if (base.isVerticalLine) return "vertical";
    if (composite.clusterLayout === BlockLayout.Grid) return "grid";
    return "none";
  }

  private determineSecondaryOrientation(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits,
    primary: string
  ): "horizontal" | "vertical" | "grid" | "radial" | "none" {
    if (primary === "horizontal") return "vertical";
    if (primary === "vertical") return "horizontal";
    return "none";
  }

  private calculateSpatialImportance(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): number {
    return Math.min(base.area / 100 + composite.structuralComplexity, 1);
  }

  private isExpandable(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): boolean {
    return composite.hasInternalStructure && base.canvasFillDensity < 0.8;
  }

  private identifyBlockConstructs(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): string[] {
    const constructs: string[] = [];
    if (composite.cellClusterCount > 1) constructs.push("container");
    if (composite.hasCompleteBorder || composite.hasCompleteFrame)
      constructs.push("wrapper");
    if (base.isLinear) constructs.push("organizer");
    return constructs;
  }

  private calculatePurposeConfidence(
    constructs: string[],
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): number {
    return constructs.length > 0 ? 0.7 : 0.3; // Simplified
  }

  private calculateStructuralIntegrity(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): number {
    return (
      composite.boundaryQuality * 0.5 + (base.canvasFillDensity > 0.1 ? 0.5 : 0)
    );
  }

  private calculateMaintainabilityScore(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): number {
    return 1.0 - composite.structuralComplexity;
  }

  private determineComplexity(
    composite: BlockCompositeTraits
  ): "simple" | "moderate" | "complex" | "very-complex" {
    if (composite.structuralComplexity < 0.25) return "simple";
    if (composite.structuralComplexity < 0.5) return "moderate";
    if (composite.structuralComplexity < 0.75) return "complex";
    return "very-complex";
  }

  private calculateRenderingComplexity(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): number {
    return Math.min(base.area / 1000 + composite.cellClusterCount / 20, 1);
  }

  private calculateMemoryFootprint(base: BlockBaseTraits): number {
    return Math.min(base.area / 10000, 1);
  }

  private calculateScalability(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): number {
    return composite.hasInternalStructure ? 0.8 : 0.5;
  }
}
