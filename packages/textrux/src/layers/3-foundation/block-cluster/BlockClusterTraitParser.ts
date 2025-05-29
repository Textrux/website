import BlockCluster from "./BlockCluster";
import {
  BlockClusterTraits,
  BlockClusterBaseTraits,
  BlockClusterCompositeTraits,
  BlockClusterDerivedTraits,
  ConnectionPattern,
} from "./BlockClusterTraits";
import { BlockTraits } from "../block/BlockTraits";
import GridModel from "../../1-substrate/GridModel";

/**
 * Parses and analyzes BlockCluster instances (groups of BlockSubclusters) to populate their trait properties
 */
export class BlockClusterTraitParser {
  private grid: GridModel;

  constructor(grid: GridModel) {
    this.grid = grid;
  }

  /**
   * Parse all traits for a BlockCluster instance
   */
  parseTraits(cluster: BlockCluster): BlockClusterTraits {
    const base = this.parseBaseTraits(cluster);
    const composite = this.parseCompositeTraits(cluster, base);
    const derived = this.parseDerivedTraits(cluster, base, composite);

    return { base, composite, derived };
  }

  /**
   * Parse fundamental properties of subcluster groups
   */
  private parseBaseTraits(cluster: BlockCluster): BlockClusterBaseTraits {
    const subclusterCount = cluster.blockSubclusters.length;
    const totalArea = cluster.blockSubclusters.reduce(
      (sum, subcluster) =>
        sum +
        (subcluster.clusterCanvas.right - subcluster.clusterCanvas.left + 1) *
          (subcluster.clusterCanvas.bottom - subcluster.clusterCanvas.top + 1),
      0
    );
    const averageSubclusterSize = totalArea / subclusterCount;

    const clusterWidth =
      cluster.clusterCanvas.right - cluster.clusterCanvas.left + 1;
    const clusterHeight =
      cluster.clusterCanvas.bottom - cluster.clusterCanvas.top + 1;
    const clusterArea = clusterWidth * clusterHeight;
    const clusterDensity = totalArea / clusterArea;
    const clusterAspectRatio = clusterWidth / clusterHeight;

    // Analyze subcluster arrangement
    const { subclustersInRow, subclustersInColumn } =
      this.analyzeSubclusterArrangement(cluster);
    const hasRegularSpacing = this.detectRegularSpacing(cluster);
    const hasAlignment = this.detectAlignment(cluster);

    // Coverage analysis
    const canvasArea = cluster.canvasPoints.length;
    const perimeterArea = cluster.perimeterPoints.length;
    const bufferArea = cluster.bufferPoints.length;
    const utilizationRatio = totalArea / clusterArea;

    return {
      subclusterCount,
      totalArea,
      averageSubclusterSize,
      clusterDensity,
      clusterWidth,
      clusterHeight,
      clusterAspectRatio,
      subclustersInRow,
      subclustersInColumn,
      hasRegularSpacing,
      hasAlignment,
      canvasArea,
      perimeterArea,
      bufferArea,
      utilizationRatio,
    };
  }

  /**
   * Parse relationships and structural patterns between subclusters
   */
  private parseCompositeTraits(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): BlockClusterCompositeTraits {
    // Analyze subcluster relationships
    const hasHierarchy = this.detectHierarchy(cluster);
    const hasSequencing = this.detectSequencing(cluster);
    const hasSymmetry = this.detectSymmetry(cluster, base);
    const hasOverlap = this.detectOverlap(cluster);

    // Spatial pattern detection
    const isGrid = this.isGridPattern(cluster, base);
    const isLinear = this.isLinearPattern(cluster, base);
    const isScattered = this.isScatteredPattern(cluster, base);
    const isNested = this.isNestedPattern(cluster);

    // Organization analysis
    const organizationPattern = this.determineOrganizationPattern(
      cluster,
      base
    );
    const groupingStrength = this.calculateGroupingStrength(cluster, base);
    const spatialCoherence = this.calculateSpatialCoherence(cluster, base);

    // Directional analysis
    const { hasDirectionalFlow, flowDirection } = this.analyzeFlow(cluster);
    const primaryOrientation = this.determinePrimaryOrientation(cluster, base);

    return {
      hasHierarchy,
      hasSequencing,
      hasSymmetry,
      hasOverlap,
      isGrid,
      isLinear,
      isScattered,
      isNested,
      organizationPattern,
      groupingStrength,
      spatialCoherence,
      hasDirectionalFlow,
      flowDirection,
      primaryOrientation,
    };
  }

  /**
   * Parse high-level construct indicators and functional classification
   */
  private parseDerivedTraits(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): BlockClusterDerivedTraits {
    // Construct identification
    const likelyConstructs = this.identifyLikelyConstructs(base, composite);
    const confidence = this.calculateConstructConfidence(
      likelyConstructs,
      base,
      composite
    );

    // Functional classification
    const isLayoutStructure = this.isLayoutStructure(composite);
    const isContentStructure = this.isContentStructure(base, composite);
    const isNavigationStructure = this.isNavigationStructure(composite);
    const isDecorativeStructure = this.isDecorativeStructure(base, composite);

    // Purpose inference
    const primaryPurpose = this.determinePrimaryPurpose(base, composite);
    const complexity = this.determineComplexity(base, composite);

    // Structural characteristics
    const structuralRole = this.determineStructuralRole(base, composite);
    const layoutStyle = this.determineLayoutStyle(base, composite);
    const visualBalance = this.calculateVisualBalance(cluster, base, composite);

    // Evolution potential
    const isExtensible = this.isExtensible(base, composite);
    const growthDirection = this.determineGrowthDirection(base, composite);
    const stabilityScore = this.calculateStabilityScore(base, composite);

    return {
      likelyConstructs,
      confidence,
      isLayoutStructure,
      isContentStructure,
      isNavigationStructure,
      isDecorativeStructure,
      primaryPurpose,
      complexity,
      structuralRole,
      layoutStyle,
      visualBalance,
      isExtensible,
      growthDirection,
      stabilityScore,
    };
  }

  // Implementation methods for analyzing BlockSubcluster groups

  private analyzeSubclusterArrangement(cluster: BlockCluster): {
    subclustersInRow: number;
    subclustersInColumn: number;
  } {
    // Simple heuristic: count unique rows and columns with subclusters
    const subclusterRows = new Set(
      cluster.blockSubclusters.map((sc) =>
        Math.round((sc.clusterCanvas.top + sc.clusterCanvas.bottom) / 2)
      )
    );
    const subclusterCols = new Set(
      cluster.blockSubclusters.map((sc) =>
        Math.round((sc.clusterCanvas.left + sc.clusterCanvas.right) / 2)
      )
    );

    // Estimate how many subclusters per row/column
    const subclustersInRow = Math.ceil(
      cluster.blockSubclusters.length / subclusterRows.size
    );
    const subclustersInColumn = Math.ceil(
      cluster.blockSubclusters.length / subclusterCols.size
    );

    return { subclustersInRow, subclustersInColumn };
  }

  private detectRegularSpacing(cluster: BlockCluster): boolean {
    if (cluster.blockSubclusters.length < 2) return true;

    // Check horizontal and vertical spacing consistency between subclusters
    const subclusters = cluster.blockSubclusters.sort((a, b) => {
      if (a.clusterCanvas.top !== b.clusterCanvas.top) {
        return a.clusterCanvas.top - b.clusterCanvas.top;
      }
      return a.clusterCanvas.left - b.clusterCanvas.left;
    });

    const horizontalGaps: number[] = [];
    const verticalGaps: number[] = [];

    for (let i = 1; i < subclusters.length; i++) {
      const prev = subclusters[i - 1];
      const curr = subclusters[i];

      if (Math.abs(prev.clusterCanvas.top - curr.clusterCanvas.top) <= 3) {
        // Same row, check horizontal gap
        horizontalGaps.push(curr.clusterCanvas.left - prev.clusterCanvas.right);
      } else {
        // Different row, check vertical gap
        verticalGaps.push(curr.clusterCanvas.top - prev.clusterCanvas.bottom);
      }
    }

    // Check if gaps are relatively consistent (within 3 cells)
    const isRegularHorizontal = this.hasConsistentGaps(horizontalGaps, 3);
    const isRegularVertical = this.hasConsistentGaps(verticalGaps, 3);

    return isRegularHorizontal && isRegularVertical;
  }

  private hasConsistentGaps(gaps: number[], tolerance: number): boolean {
    if (gaps.length === 0) return true;
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    return gaps.every((gap) => Math.abs(gap - avgGap) <= tolerance);
  }

  private detectAlignment(cluster: BlockCluster): boolean {
    if (cluster.blockSubclusters.length < 2) return true;

    // Check if subclusters align on their edges or centers
    const leftEdges = cluster.blockSubclusters.map(
      (sc) => sc.clusterCanvas.left
    );
    const rightEdges = cluster.blockSubclusters.map(
      (sc) => sc.clusterCanvas.right
    );
    const topEdges = cluster.blockSubclusters.map((sc) => sc.clusterCanvas.top);
    const bottomEdges = cluster.blockSubclusters.map(
      (sc) => sc.clusterCanvas.bottom
    );

    // Count how many subclusters share the same edge positions
    const hasVerticalAlignment =
      this.hasSharedPositions(leftEdges, 2) ||
      this.hasSharedPositions(rightEdges, 2);
    const hasHorizontalAlignment =
      this.hasSharedPositions(topEdges, 2) ||
      this.hasSharedPositions(bottomEdges, 2);

    return hasVerticalAlignment || hasHorizontalAlignment;
  }

  private hasSharedPositions(positions: number[], minCount: number): boolean {
    const counts = new Map<number, number>();
    positions.forEach((pos) => {
      counts.set(pos, (counts.get(pos) || 0) + 1);
    });
    return Array.from(counts.values()).some((count) => count >= minCount);
  }

  private detectHierarchy(cluster: BlockCluster): boolean {
    // Look for subclusters of different sizes suggesting hierarchy
    const subclusterSizes = cluster.blockSubclusters.map(
      (sc) =>
        (sc.clusterCanvas.right - sc.clusterCanvas.left + 1) *
        (sc.clusterCanvas.bottom - sc.clusterCanvas.top + 1)
    );
    const uniqueSizes = new Set(subclusterSizes);

    // If we have significantly different subcluster sizes, suggest hierarchy
    if (uniqueSizes.size > 1) {
      const minSize = Math.min(...subclusterSizes);
      const maxSize = Math.max(...subclusterSizes);
      return maxSize > minSize * 2; // At least 2x size difference
    }
    return false;
  }

  private detectSequencing(cluster: BlockCluster): boolean {
    return (
      this.isHorizontalSequence(cluster) || this.isVerticalSequence(cluster)
    );
  }

  private isHorizontalSequence(cluster: BlockCluster): boolean {
    // Check if subclusters are arranged in a horizontal sequence
    const sorted = cluster.blockSubclusters.sort(
      (a, b) => a.clusterCanvas.left - b.clusterCanvas.left
    );
    return (
      sorted.length > 1 && this.areSubclustersInSequence(sorted, "horizontal")
    );
  }

  private isVerticalSequence(cluster: BlockCluster): boolean {
    // Check if subclusters are arranged in a vertical sequence
    const sorted = cluster.blockSubclusters.sort(
      (a, b) => a.clusterCanvas.top - b.clusterCanvas.top
    );
    return (
      sorted.length > 1 && this.areSubclustersInSequence(sorted, "vertical")
    );
  }

  private areSubclustersInSequence(
    subclusters: any[],
    direction: "horizontal" | "vertical"
  ): boolean {
    // Simple check: subclusters should be roughly aligned and evenly spaced
    const tolerance = 4; // cells

    if (direction === "horizontal") {
      // Check vertical alignment and horizontal spacing
      const avgTop =
        subclusters.reduce((sum, sc) => sum + sc.clusterCanvas.top, 0) /
        subclusters.length;
      return subclusters.every(
        (sc) => Math.abs(sc.clusterCanvas.top - avgTop) <= tolerance
      );
    } else {
      // Check horizontal alignment and vertical spacing
      const avgLeft =
        subclusters.reduce((sum, sc) => sum + sc.clusterCanvas.left, 0) /
        subclusters.length;
      return subclusters.every(
        (sc) => Math.abs(sc.clusterCanvas.left - avgLeft) <= tolerance
      );
    }
  }

  private detectSymmetry(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): boolean {
    if (cluster.blockSubclusters.length < 2) return true;

    // Simple symmetry check: compare subcluster positions relative to center
    const centerRow =
      (cluster.clusterCanvas.top + cluster.clusterCanvas.bottom) / 2;
    const centerCol =
      (cluster.clusterCanvas.left + cluster.clusterCanvas.right) / 2;

    // Check if subclusters are distributed somewhat evenly around center
    const leftSubclusters = cluster.blockSubclusters.filter(
      (sc) => (sc.clusterCanvas.left + sc.clusterCanvas.right) / 2 < centerCol
    );
    const rightSubclusters = cluster.blockSubclusters.filter(
      (sc) => (sc.clusterCanvas.left + sc.clusterCanvas.right) / 2 > centerCol
    );
    const topSubclusters = cluster.blockSubclusters.filter(
      (sc) => (sc.clusterCanvas.top + sc.clusterCanvas.bottom) / 2 < centerRow
    );
    const bottomSubclusters = cluster.blockSubclusters.filter(
      (sc) => (sc.clusterCanvas.top + sc.clusterCanvas.bottom) / 2 > centerRow
    );

    const horizontalBalance =
      Math.abs(leftSubclusters.length - rightSubclusters.length) <= 1;
    const verticalBalance =
      Math.abs(topSubclusters.length - bottomSubclusters.length) <= 1;

    return horizontalBalance || verticalBalance;
  }

  private detectOverlap(cluster: BlockCluster): boolean {
    // Check if any subclusters actually overlap (not just their perimeters)
    for (let i = 0; i < cluster.blockSubclusters.length; i++) {
      for (let j = i + 1; j < cluster.blockSubclusters.length; j++) {
        const sc1 = cluster.blockSubclusters[i];
        const sc2 = cluster.blockSubclusters[j];

        // Check if canvases overlap
        if (this.rectanglesOverlap(sc1.clusterCanvas, sc2.clusterCanvas)) {
          return true;
        }
      }
    }
    return false;
  }

  private rectanglesOverlap(
    rect1: { top: number; left: number; bottom: number; right: number },
    rect2: { top: number; left: number; bottom: number; right: number }
  ): boolean {
    return !(
      rect1.right < rect2.left ||
      rect2.right < rect1.left ||
      rect1.bottom < rect2.top ||
      rect2.bottom < rect1.top
    );
  }

  private isGridPattern(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): boolean {
    // Grid pattern: multiple rows and columns with regular arrangement
    return (
      base.subclustersInRow > 1 &&
      base.subclustersInColumn > 1 &&
      base.hasRegularSpacing &&
      base.hasAlignment
    );
  }

  private isLinearPattern(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): boolean {
    // Linear pattern: sequential arrangement in one dimension
    return (
      this.detectSequencing(cluster) &&
      (base.subclustersInRow === 1 || base.subclustersInColumn === 1)
    );
  }

  private isScatteredPattern(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): boolean {
    // Scattered pattern: irregular spacing and alignment
    return (
      !base.hasRegularSpacing && !base.hasAlignment && base.subclusterCount > 2
    );
  }

  private isNestedPattern(cluster: BlockCluster): boolean {
    // Nested pattern: subclusters contained within others (based on size hierarchy)
    return (
      this.detectHierarchy(cluster) && cluster.blockSubclusters.length >= 2
    );
  }

  private determineOrganizationPattern(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): ConnectionPattern {
    if (this.isGridPattern(cluster, base)) return ConnectionPattern.Grid;
    if (this.detectSequencing(cluster)) return ConnectionPattern.Sequential;
    if (base.hasAlignment) return ConnectionPattern.Parallel;
    if (this.detectHierarchy(cluster)) return ConnectionPattern.Hierarchical;
    if (this.isScatteredPattern(cluster, base))
      return ConnectionPattern.Scattered;
    return ConnectionPattern.Proximity;
  }

  private calculateGroupingStrength(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): number {
    let strength = 0;

    // Add strength for various cohesive factors
    if (base.hasAlignment) strength += 0.3;
    if (base.hasRegularSpacing) strength += 0.3;
    if (base.utilizationRatio > 0.5) strength += 0.2;
    if (base.clusterDensity > 0.5) strength += 0.2;

    return Math.min(1, strength);
  }

  private calculateSpatialCoherence(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): number {
    let coherence = 0.5; // Base coherence

    if (base.hasAlignment) coherence += 0.2;
    if (base.hasRegularSpacing) coherence += 0.2;
    if (base.clusterDensity > 0.6) coherence += 0.1;
    if (Math.abs(base.clusterAspectRatio - 1) < 0.5) coherence += 0.1; // Close to square

    return Math.min(1, coherence);
  }

  private analyzeFlow(cluster: BlockCluster): {
    hasDirectionalFlow: boolean;
    flowDirection: "horizontal" | "vertical" | "radial" | "mixed" | "none";
  } {
    const hasHorizontalFlow = this.isHorizontalSequence(cluster);
    const hasVerticalFlow = this.isVerticalSequence(cluster);

    if (hasHorizontalFlow && hasVerticalFlow) {
      return { hasDirectionalFlow: true, flowDirection: "mixed" };
    } else if (hasHorizontalFlow) {
      return { hasDirectionalFlow: true, flowDirection: "horizontal" };
    } else if (hasVerticalFlow) {
      return { hasDirectionalFlow: true, flowDirection: "vertical" };
    } else if (this.detectHierarchy(cluster)) {
      return { hasDirectionalFlow: true, flowDirection: "radial" };
    } else {
      return { hasDirectionalFlow: false, flowDirection: "none" };
    }
  }

  private determinePrimaryOrientation(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): "horizontal" | "vertical" | "diagonal" | "radial" | "none" {
    if (base.subclustersInRow > base.subclustersInColumn * 1.5) {
      return "horizontal";
    }
    if (base.subclustersInColumn > base.subclustersInRow * 1.5) {
      return "vertical";
    }
    if (this.detectHierarchy(cluster)) {
      return "radial";
    }
    return "none";
  }

  // Additional helper methods for derived traits analysis

  private identifyLikelyConstructs(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): string[] {
    const constructs: string[] = [];

    if (composite.isGrid)
      constructs.push("dashboard", "table-layout", "matrix");
    if (composite.isLinear) constructs.push("menu", "toolbar", "sequence");
    if (composite.isNested)
      constructs.push("hierarchy", "outline", "tree-view");
    if (composite.isScattered)
      constructs.push("workspace", "canvas", "free-form");

    // Add more sophisticated analysis based on size and arrangement
    if (base.subclusterCount === 1)
      constructs.push("single-focus", "container");
    if (base.subclusterCount >= 6)
      constructs.push("complex-layout", "multi-pane");

    return constructs;
  }

  private calculateConstructConfidence(
    constructs: string[],
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on strong indicators
    if (base.hasRegularSpacing && base.hasAlignment) confidence += 0.2;
    if (composite.spatialCoherence > 0.7) confidence += 0.1;
    if (constructs.length <= 2) confidence += 0.1; // Clear classification
    if (constructs.length > 4) confidence -= 0.1; // Uncertain classification

    return Math.min(1, Math.max(0, confidence));
  }

  private isLayoutStructure(composite: BlockClusterCompositeTraits): boolean {
    return composite.isGrid || composite.isLinear;
  }

  private isContentStructure(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): boolean {
    return (
      composite.isNested || composite.hasHierarchy || base.subclusterCount > 1
    );
  }

  private isNavigationStructure(
    composite: BlockClusterCompositeTraits
  ): boolean {
    return (
      composite.isLinear ||
      composite.hasSequencing ||
      composite.hasDirectionalFlow
    );
  }

  private isDecorativeStructure(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): boolean {
    return (
      base.subclusterCount === 1 ||
      (composite.hasSymmetry && !composite.hasDirectionalFlow)
    );
  }

  private determinePrimaryPurpose(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ):
    | "layout-organization"
    | "content-grouping"
    | "spatial-division"
    | "visual-structure"
    | "functional-grouping"
    | "mixed" {
    if (composite.isGrid && base.hasRegularSpacing)
      return "layout-organization";
    if (composite.hasHierarchy || composite.isNested) return "content-grouping";
    if (composite.isLinear) return "spatial-division";
    if (composite.hasSymmetry) return "visual-structure";
    if (base.subclusterCount > 1) return "functional-grouping";
    return "mixed";
  }

  private determineComplexity(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): "simple" | "moderate" | "complex" | "very-complex" {
    let complexity = 0;

    complexity += base.subclusterCount / 5; // More subclusters = more complex
    if (composite.hasHierarchy) complexity += 0.5;
    if (composite.hasOverlap) complexity += 0.3;
    if (composite.isScattered) complexity += 0.3;
    if (composite.spatialCoherence < 0.5) complexity += 0.2;

    if (complexity < 0.5) return "simple";
    if (complexity < 1.0) return "moderate";
    if (complexity < 2.0) return "complex";
    return "very-complex";
  }

  private determineStructuralRole(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): "container" | "organizer" | "separator" | "coordinator" | "composite" {
    if (base.subclusterCount === 1) return "container";
    if (composite.isGrid || base.hasRegularSpacing) return "organizer";
    if (composite.isLinear) return "separator";
    if (composite.hasDirectionalFlow) return "coordinator";
    return "composite";
  }

  private determineLayoutStyle(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): "formal" | "informal" | "structured" | "organic" {
    if (base.hasRegularSpacing && base.hasAlignment && composite.isGrid) {
      return "formal";
    }
    if (composite.hasHierarchy || composite.isNested) {
      return "structured";
    }
    if (base.hasAlignment || base.hasRegularSpacing) {
      return "structured";
    }
    if (composite.isScattered && !composite.hasSymmetry) {
      return "organic";
    }
    return "informal";
  }

  private calculateVisualBalance(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): number {
    // Simple balance calculation based on spatial distribution
    let balance = 0.5; // Start with neutral

    if (composite.hasSymmetry) balance += 0.3;
    if (base.hasAlignment) balance += 0.2;
    if (base.hasRegularSpacing) balance += 0.2;
    if (Math.abs(base.clusterAspectRatio - 1) < 0.5) balance += 0.1; // Close to square

    return Math.min(1, balance);
  }

  private isExtensible(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): boolean {
    return (
      composite.isLinear ||
      composite.isGrid ||
      (base.hasRegularSpacing && !composite.isScattered)
    );
  }

  private determineGrowthDirection(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): "horizontal" | "vertical" | "both" | "none" {
    if (composite.isGrid) return "both";
    if (base.subclustersInRow > base.subclustersInColumn) return "horizontal";
    if (base.subclustersInColumn > base.subclustersInRow) return "vertical";
    if (composite.isLinear) {
      return composite.flowDirection === "horizontal"
        ? "horizontal"
        : "vertical";
    }
    return "none";
  }

  private calculateStabilityScore(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): number {
    let stability = 0.5;

    if (base.hasAlignment) stability += 0.2;
    if (base.hasRegularSpacing) stability += 0.2;
    if (composite.hasSymmetry) stability += 0.1;
    if (composite.spatialCoherence > 0.7) stability += 0.1;
    if (composite.isGrid || composite.isLinear) stability += 0.1;

    return Math.min(1, stability);
  }
}
