import BlockCluster from "./BlockCluster";
import {
  BlockClusterTraits,
  BlockClusterBaseTraits,
  BlockClusterCompositeTraits,
  BlockClusterDerivedTraits,
} from "./BlockClusterTraits";
import { BlockTraits } from "../block/BlockTraits";
import GridModel from "../../1-substrate/GridModel";

/**
 * Parses and analyzes BlockCluster instances to populate their trait properties
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
   * Parse fundamental properties of block groups
   */
  private parseBaseTraits(cluster: BlockCluster): BlockClusterBaseTraits {
    const blockCount = cluster.blocks.length;
    const totalArea = cluster.blocks.reduce(
      (sum, block) =>
        sum +
        (block.rightCol - block.leftCol + 1) *
          (block.bottomRow - block.topRow + 1),
      0
    );
    const averageBlockSize = totalArea / blockCount;

    const clusterWidth =
      cluster.clusterCanvas.right - cluster.clusterCanvas.left + 1;
    const clusterHeight =
      cluster.clusterCanvas.bottom - cluster.clusterCanvas.top + 1;
    const clusterArea = clusterWidth * clusterHeight;
    const clusterDensity = totalArea / clusterArea;
    const clusterAspectRatio = clusterWidth / clusterHeight;

    // Analyze block arrangement
    const { blocksInRow, blocksInColumn } =
      this.analyzeBlockArrangement(cluster);
    const hasRegularSpacing = this.detectRegularSpacing(cluster);
    const hasAlignment = this.detectAlignment(cluster);

    // Connectivity analysis
    const joinCount = cluster.blockJoins.length;
    const linkedPointCount = cluster.linkedPoints.length;
    const lockedPointCount = cluster.lockedPoints.length;

    // Simple connectivity ratio - could be more sophisticated
    const maxPossibleConnections = (blockCount * (blockCount - 1)) / 2;
    const connectivityRatio =
      maxPossibleConnections > 0
        ? (linkedPointCount + lockedPointCount) / (maxPossibleConnections * 10)
        : 0;

    return {
      blockCount,
      totalArea,
      averageBlockSize,
      clusterDensity,
      clusterWidth,
      clusterHeight,
      clusterAspectRatio,
      blocksInRow,
      blocksInColumn,
      hasRegularSpacing,
      hasAlignment,
      joinCount,
      linkedPointCount,
      lockedPointCount,
      connectivityRatio,
    };
  }

  /**
   * Parse relationships and structural patterns
   */
  private parseCompositeTraits(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): BlockClusterCompositeTraits {
    // Analyze block relationships
    const hasHierarchy = this.detectHierarchy(cluster);
    const hasSequencing = this.detectSequencing(cluster);
    const hasBranching = this.detectBranching(cluster);
    const hasSymmetry = this.detectSymmetry(cluster, base);

    // Content coherence analysis
    const blockTypes = this.analyzeBlockTypes(cluster);
    const hasUniformBlockTypes = blockTypes.size <= 2;
    const hasComplementaryBlocks = this.detectComplementaryBlocks(cluster);
    const hasMixedPurposes = this.detectMixedPurposes(cluster);

    // Structural pattern detection
    const isGrid = this.isGridPattern(cluster, base);
    const isTree = this.isTreePattern(cluster);
    const isList = this.isListPattern(cluster, base);
    const isNetwork = this.isNetworkPattern(cluster, base);
    const isFlow = this.isFlowPattern(cluster);

    // Directional flow analysis
    const { hasDirectionalFlow, flowDirection } = this.analyzeFlow(
      cluster,
      base
    );

    // Organization analysis
    const organizationBy = this.determineOrganizationPrinciple(cluster, base);
    const groupingStrength = this.calculateGroupingStrength(cluster, base);

    return {
      hasHierarchy,
      hasSequencing,
      hasBranching,
      hasSymmetry,
      hasUniformBlockTypes,
      hasComplementaryBlocks,
      hasMixedPurposes,
      isGrid,
      isTree,
      isList,
      isNetwork,
      isFlow,
      hasDirectionalFlow,
      flowDirection,
      organizationBy,
      groupingStrength,
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
    const isDataStructure = this.isDataStructure(composite);
    const isUserInterface = this.isUserInterface(base, composite);
    const isDocument = this.isDocument(composite);
    const isVisualization = this.isVisualization(base, composite);
    const isNavigation = this.isNavigation(composite);

    // Purpose inference
    const primaryPurpose = this.determinePrimaryPurpose(base, composite);
    const complexity = this.determineComplexity(base, composite);

    // User interaction analysis
    const isInteractive = this.isInteractive(composite);
    const isReadOnly = this.isReadOnly(composite);
    const requiresNavigation = base.blockCount > 4 || composite.hasHierarchy;

    // Layout characteristics
    const layoutStyle = this.determineLayoutStyle(base, composite);
    const visualBalance = this.calculateVisualBalance(cluster, base);

    // Evolution potential
    const isExtensible = this.isExtensible(base, composite);
    const growthDirection = this.determineGrowthDirection(base, composite);
    const stabilityScore = this.calculateStabilityScore(base, composite);

    return {
      likelyConstructs,
      confidence,
      isDataStructure,
      isUserInterface,
      isDocument,
      isVisualization,
      isNavigation,
      primaryPurpose,
      complexity,
      isInteractive,
      isReadOnly,
      requiresNavigation,
      layoutStyle,
      visualBalance,
      isExtensible,
      growthDirection,
      stabilityScore,
    };
  }

  // Helper methods for analysis

  private analyzeBlockArrangement(cluster: BlockCluster): {
    blocksInRow: number;
    blocksInColumn: number;
  } {
    // Group blocks by row and column positions
    const rowGroups = new Map<number, number>();
    const colGroups = new Map<number, number>();

    cluster.blocks.forEach((block) => {
      const centerRow = Math.floor((block.topRow + block.bottomRow) / 2);
      const centerCol = Math.floor((block.leftCol + block.rightCol) / 2);

      rowGroups.set(centerRow, (rowGroups.get(centerRow) || 0) + 1);
      colGroups.set(centerCol, (colGroups.get(centerCol) || 0) + 1);
    });

    const blocksInRow = Math.max(...rowGroups.values(), 1);
    const blocksInColumn = Math.max(...colGroups.values(), 1);

    return { blocksInRow, blocksInColumn };
  }

  private detectRegularSpacing(cluster: BlockCluster): boolean {
    if (cluster.blocks.length < 3) return false;

    // Analyze spacing between consecutive blocks
    const spacings: number[] = [];
    const sortedBlocks = [...cluster.blocks].sort(
      (a, b) => a.topRow - b.topRow || a.leftCol - b.leftCol
    );

    for (let i = 1; i < sortedBlocks.length; i++) {
      const spacing = Math.abs(
        sortedBlocks[i].topRow -
          sortedBlocks[i - 1].topRow +
          (sortedBlocks[i].leftCol - sortedBlocks[i - 1].leftCol)
      );
      spacings.push(spacing);
    }

    // Check if spacings are relatively uniform
    const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
    const variance =
      spacings.reduce(
        (sum, spacing) => sum + Math.pow(spacing - avgSpacing, 2),
        0
      ) / spacings.length;

    return variance < avgSpacing * 0.5; // Low variance indicates regular spacing
  }

  private detectAlignment(cluster: BlockCluster): boolean {
    // Check if blocks align on common rows or columns
    const topRows = cluster.blocks.map((b) => b.topRow);
    const leftCols = cluster.blocks.map((b) => b.leftCol);

    const uniqueTopRows = new Set(topRows);
    const uniqueLeftCols = new Set(leftCols);

    // If many blocks share the same starting positions, they're aligned
    return (
      uniqueTopRows.size < cluster.blocks.length * 0.7 ||
      uniqueLeftCols.size < cluster.blocks.length * 0.7
    );
  }

  private detectHierarchy(cluster: BlockCluster): boolean {
    // Look for size differences that suggest hierarchy
    const blockSizes = cluster.blocks.map(
      (block) =>
        (block.rightCol - block.leftCol + 1) *
        (block.bottomRow - block.topRow + 1)
    );

    const maxSize = Math.max(...blockSizes);
    const minSize = Math.min(...blockSizes);

    return maxSize > minSize * 2; // Significant size differences suggest hierarchy
  }

  private detectSequencing(cluster: BlockCluster): boolean {
    // Look for blocks arranged in a clear sequence
    return (
      cluster.blocks.length > 2 &&
      (this.isHorizontalSequence(cluster) || this.isVerticalSequence(cluster))
    );
  }

  private isHorizontalSequence(cluster: BlockCluster): boolean {
    const sorted = [...cluster.blocks].sort((a, b) => a.leftCol - b.leftCol);
    return sorted.every(
      (block, i) => i === 0 || block.leftCol > sorted[i - 1].rightCol
    );
  }

  private isVerticalSequence(cluster: BlockCluster): boolean {
    const sorted = [...cluster.blocks].sort((a, b) => a.topRow - b.topRow);
    return sorted.every(
      (block, i) => i === 0 || block.topRow > sorted[i - 1].bottomRow
    );
  }

  private detectBranching(cluster: BlockCluster): boolean {
    // Simplified branching detection based on join patterns
    return cluster.blockJoins.length > cluster.blocks.length - 1;
  }

  private detectSymmetry(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): boolean {
    // Simplified symmetry detection
    const centerRow =
      (cluster.clusterCanvas.top + cluster.clusterCanvas.bottom) / 2;
    const centerCol =
      (cluster.clusterCanvas.left + cluster.clusterCanvas.right) / 2;

    // Check if blocks are symmetrically distributed around center
    let symmetricPairs = 0;
    const tolerance = 2;

    cluster.blocks.forEach((block) => {
      const blockCenterRow = (block.topRow + block.bottomRow) / 2;
      const blockCenterCol = (block.leftCol + block.rightCol) / 2;

      const mirrorRow = 2 * centerRow - blockCenterRow;
      const mirrorCol = 2 * centerCol - blockCenterCol;

      const hasMirror = cluster.blocks.some((other) => {
        const otherCenterRow = (other.topRow + other.bottomRow) / 2;
        const otherCenterCol = (other.leftCol + other.rightCol) / 2;

        return (
          Math.abs(otherCenterRow - mirrorRow) <= tolerance &&
          Math.abs(otherCenterCol - mirrorCol) <= tolerance
        );
      });

      if (hasMirror) symmetricPairs++;
    });

    return symmetricPairs >= cluster.blocks.length * 0.6;
  }

  private analyzeBlockTypes(cluster: BlockCluster): Set<string> {
    const types = new Set<string>();

    cluster.blocks.forEach((block) => {
      // Simplified type classification based on block traits
      if (block.traits) {
        const traits = block.traits;
        if (traits.derived.isHeader) types.add("header");
        if (traits.derived.isData) types.add("data");
        if (traits.derived.isContainer) types.add("container");
        if (traits.derived.isNavigation) types.add("navigation");
      } else {
        types.add("unknown");
      }
    });

    return types;
  }

  private detectComplementaryBlocks(cluster: BlockCluster): boolean {
    const types = this.analyzeBlockTypes(cluster);
    // Complementary if we have headers and data, or containers and content
    return (
      (types.has("header") && types.has("data")) ||
      (types.has("container") && types.has("content"))
    );
  }

  private detectMixedPurposes(cluster: BlockCluster): boolean {
    const types = this.analyzeBlockTypes(cluster);
    return types.size > 2;
  }

  private isGridPattern(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): boolean {
    return (
      base.hasRegularSpacing &&
      base.hasAlignment &&
      base.blocksInRow > 1 &&
      base.blocksInColumn > 1
    );
  }

  private isTreePattern(cluster: BlockCluster): boolean {
    // Tree pattern: one root with branching connections
    if (cluster.blocks.length < 3) return false;

    // Look for a block that connects to many others
    const connectionCounts = new Map<any, number>();

    cluster.blockJoins.forEach((join) => {
      join.blocks.forEach((block) => {
        connectionCounts.set(block, (connectionCounts.get(block) || 0) + 1);
      });
    });

    const maxConnections = Math.max(...connectionCounts.values());
    return maxConnections >= cluster.blocks.length * 0.4;
  }

  private isListPattern(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): boolean {
    return (
      (base.blocksInRow === 1 && base.blocksInColumn > 1) ||
      (base.blocksInColumn === 1 && base.blocksInRow > 1)
    );
  }

  private isNetworkPattern(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): boolean {
    return base.connectivityRatio > 0.3 && cluster.blocks.length > 3;
  }

  private isFlowPattern(cluster: BlockCluster): boolean {
    // Flow pattern: sequential connections
    return cluster.blockJoins.length === cluster.blocks.length - 1;
  }

  private analyzeFlow(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): {
    hasDirectionalFlow: boolean;
    flowDirection: "horizontal" | "vertical" | "radial" | "mixed" | "none";
  } {
    if (base.clusterAspectRatio > 2) {
      return { hasDirectionalFlow: true, flowDirection: "horizontal" };
    }
    if (base.clusterAspectRatio < 0.5) {
      return { hasDirectionalFlow: true, flowDirection: "vertical" };
    }
    if (cluster.blockJoins.length > cluster.blocks.length) {
      return { hasDirectionalFlow: true, flowDirection: "radial" };
    }

    return { hasDirectionalFlow: false, flowDirection: "none" };
  }

  private determineOrganizationPrinciple(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): "position" | "content" | "function" | "hierarchy" | "mixed" {
    if (base.hasAlignment && base.hasRegularSpacing) return "position";
    if (this.detectHierarchy(cluster)) return "hierarchy";
    return "mixed";
  }

  private calculateGroupingStrength(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): number {
    let strength = 0.5; // Base strength

    if (base.hasAlignment) strength += 0.2;
    if (base.hasRegularSpacing) strength += 0.2;
    if (base.connectivityRatio > 0.1) strength += 0.1;

    return Math.min(strength, 1.0);
  }

  private identifyLikelyConstructs(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): string[] {
    const constructs: string[] = [];

    if (composite.isGrid && composite.hasUniformBlockTypes) {
      constructs.push("spreadsheet", "table");
    }

    if (composite.isTree) {
      constructs.push("hierarchy", "organization-chart");
    }

    if (composite.isList) {
      constructs.push("menu", "navigation");
    }

    if (composite.hasComplementaryBlocks) {
      constructs.push("dashboard", "form");
    }

    if (base.blockCount > 10 && composite.hasHierarchy) {
      constructs.push("complex-interface");
    }

    return constructs;
  }

  private calculateConstructConfidence(
    constructs: string[],
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): number {
    if (constructs.length === 0) return 0;

    let confidence = 0.6; // Base confidence

    if (composite.hasUniformBlockTypes) confidence += 0.1;
    if (base.hasRegularSpacing) confidence += 0.1;
    if (composite.groupingStrength > 0.7) confidence += 0.1;
    if (base.connectivityRatio > 0.2) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private isDataStructure(composite: BlockClusterCompositeTraits): boolean {
    return composite.isGrid || composite.hasUniformBlockTypes;
  }

  private isUserInterface(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): boolean {
    return (
      composite.hasComplementaryBlocks ||
      (base.blockCount > 3 && composite.hasHierarchy)
    );
  }

  private isDocument(composite: BlockClusterCompositeTraits): boolean {
    return composite.isList && !composite.hasDirectionalFlow;
  }

  private isVisualization(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): boolean {
    return composite.isTree || composite.isNetwork;
  }

  private isNavigation(composite: BlockClusterCompositeTraits): boolean {
    return composite.isList && composite.hasDirectionalFlow;
  }

  private determinePrimaryPurpose(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ):
    | "data-display"
    | "data-entry"
    | "calculation"
    | "navigation"
    | "decoration"
    | "mixed" {
    if (composite.isGrid) return "data-display";
    if (composite.hasComplementaryBlocks) return "data-entry";
    if (composite.isList) return "navigation";
    if (base.blockCount <= 2) return "decoration";
    return "mixed";
  }

  private determineComplexity(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): "simple" | "moderate" | "complex" | "very-complex" {
    if (base.blockCount <= 3) return "simple";
    if (base.blockCount <= 8 && !composite.hasHierarchy) return "moderate";
    if (base.blockCount <= 15 || composite.hasHierarchy) return "complex";
    return "very-complex";
  }

  private isInteractive(composite: BlockClusterCompositeTraits): boolean {
    return composite.hasComplementaryBlocks || composite.hasDirectionalFlow;
  }

  private isReadOnly(composite: BlockClusterCompositeTraits): boolean {
    return composite.isGrid && composite.hasUniformBlockTypes;
  }

  private determineLayoutStyle(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): "formal" | "informal" | "structured" | "organic" {
    if (base.hasRegularSpacing && base.hasAlignment) return "formal";
    if (composite.isGrid) return "structured";
    if (composite.isTree || composite.isNetwork) return "organic";
    return "informal";
  }

  private calculateVisualBalance(
    cluster: BlockCluster,
    base: BlockClusterBaseTraits
  ): number {
    // Simplified visual balance calculation
    let balance = 0.5;

    if (base.hasAlignment) balance += 0.2;
    if (base.hasRegularSpacing) balance += 0.2;
    if (Math.abs(base.clusterAspectRatio - 1) < 0.5) balance += 0.1; // Near square is balanced

    return Math.min(balance, 1.0);
  }

  private isExtensible(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): boolean {
    return composite.isGrid || composite.isList || base.hasRegularSpacing;
  }

  private determineGrowthDirection(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): "horizontal" | "vertical" | "both" | "none" {
    if (composite.isGrid) return "both";
    if (composite.flowDirection === "horizontal") return "horizontal";
    if (composite.flowDirection === "vertical") return "vertical";
    return "none";
  }

  private calculateStabilityScore(
    base: BlockClusterBaseTraits,
    composite: BlockClusterCompositeTraits
  ): number {
    let stability = 0.5;

    if (base.hasAlignment) stability += 0.2;
    if (composite.hasUniformBlockTypes) stability += 0.1;
    if (base.connectivityRatio > 0.1) stability += 0.1;
    if (composite.groupingStrength > 0.7) stability += 0.1;

    return Math.min(stability, 1.0);
  }
}
