import BlockSubcluster from "./BlockSubcluster";
import {
  BlockSubclusterTraits,
  BlockSubclusterBaseTraits,
  BlockSubclusterCompositeTraits,
  BlockSubclusterDerivedTraits,
} from "./BlockSubclusterTraits";
import { BlockTraits } from "../block/BlockTraits";
import GridModel from "../../1-substrate/GridModel";

/**
 * Parses and analyzes BlockSubcluster instances to populate their trait properties
 */
export class BlockSubclusterTraitParser {
  private grid: GridModel;

  constructor(grid: GridModel) {
    this.grid = grid;
  }

  /**
   * Parse all traits for a BlockSubcluster instance
   */
  parseTraits(subcluster: BlockSubcluster): BlockSubclusterTraits {
    const base = this.parseBaseTraits(subcluster);
    const composite = this.parseCompositeTraits(subcluster, base);
    const derived = this.parseDerivedTraits(subcluster, base, composite);

    return { base, composite, derived };
  }

  /**
   * Parse fundamental properties of block groups
   */
  private parseBaseTraits(
    subcluster: BlockSubcluster
  ): BlockSubclusterBaseTraits {
    const blockCount = subcluster.blocks.length;
    const totalArea = subcluster.blocks.reduce(
      (sum, block) =>
        sum +
        (block.rightCol - block.leftCol + 1) *
          (block.bottomRow - block.topRow + 1),
      0
    );
    const averageBlockSize = totalArea / blockCount;

    const clusterWidth =
      subcluster.clusterCanvas.right - subcluster.clusterCanvas.left + 1;
    const clusterHeight =
      subcluster.clusterCanvas.bottom - subcluster.clusterCanvas.top + 1;
    const clusterArea = clusterWidth * clusterHeight;
    const clusterDensity = totalArea / clusterArea;
    const clusterAspectRatio = clusterWidth / clusterHeight;

    // Analyze block arrangement
    const { blocksInRow, blocksInColumn } =
      this.analyzeBlockArrangement(subcluster);
    const hasRegularSpacing = this.detectRegularSpacing(subcluster);
    const hasAlignment = this.detectAlignment(subcluster);

    // Connectivity analysis
    const joinCount = subcluster.blockJoins.length;
    const linkedPointCount = subcluster.linkedPoints.length;
    const lockedPointCount = subcluster.lockedPoints.length;

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
    subcluster: BlockSubcluster,
    base: BlockSubclusterBaseTraits
  ): BlockSubclusterCompositeTraits {
    // Analyze block relationships
    const hasHierarchy = this.detectHierarchy(subcluster);
    const hasSequencing = this.detectSequencing(subcluster);
    const hasBranching = this.detectBranching(subcluster);
    const hasSymmetry = this.detectSymmetry(subcluster, base);

    // Content coherence analysis
    const blockTypes = this.analyzeBlockTypes(subcluster);
    const hasUniformBlockTypes = blockTypes.size <= 2;
    const hasComplementaryBlocks = this.detectComplementaryBlocks(subcluster);
    const hasMixedPurposes = this.detectMixedPurposes(subcluster);

    // Structural pattern detection
    const isGrid = this.isGridPattern(subcluster, base);
    const isTree = this.isTreePattern(subcluster);
    const isList = this.isListPattern(subcluster, base);
    const isNetwork = this.isNetworkPattern(subcluster, base);
    const isFlow = this.isFlowPattern(subcluster);

    // Directional flow analysis
    const { hasDirectionalFlow, flowDirection } = this.analyzeFlow(
      subcluster,
      base
    );

    // Organization analysis
    const organizationBy = this.determineOrganizationPrinciple(
      subcluster,
      base
    );
    const groupingStrength = this.calculateGroupingStrength(subcluster, base);

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
    subcluster: BlockSubcluster,
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ): BlockSubclusterDerivedTraits {
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
    const visualBalance = this.calculateVisualBalance(
      subcluster,
      base,
      composite
    );

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

  // Implementation methods follow (same logic as original BlockClusterTraitParser but renamed)

  private analyzeBlockArrangement(subcluster: BlockSubcluster): {
    blocksInRow: number;
    blocksInColumn: number;
  } {
    // Simple heuristic: count unique rows and columns with blocks
    const blockRows = new Set(
      subcluster.blocks.map((b) => Math.round((b.topRow + b.bottomRow) / 2))
    );
    const blockCols = new Set(
      subcluster.blocks.map((b) => Math.round((b.leftCol + b.rightCol) / 2))
    );

    // Estimate how many blocks per row/column
    const blocksInRow = Math.ceil(subcluster.blocks.length / blockRows.size);
    const blocksInColumn = Math.ceil(subcluster.blocks.length / blockCols.size);

    return { blocksInRow, blocksInColumn };
  }

  private detectRegularSpacing(subcluster: BlockSubcluster): boolean {
    if (subcluster.blocks.length < 2) return true;

    // Check horizontal and vertical spacing consistency
    const blocks = subcluster.blocks.sort((a, b) => {
      if (a.topRow !== b.topRow) return a.topRow - b.topRow;
      return a.leftCol - b.leftCol;
    });

    const horizontalGaps: number[] = [];
    const verticalGaps: number[] = [];

    for (let i = 1; i < blocks.length; i++) {
      const prev = blocks[i - 1];
      const curr = blocks[i];

      if (Math.abs(prev.topRow - curr.topRow) <= 2) {
        // Same row, check horizontal gap
        horizontalGaps.push(curr.leftCol - prev.rightCol);
      } else {
        // Different row, check vertical gap
        verticalGaps.push(curr.topRow - prev.bottomRow);
      }
    }

    // Check if gaps are relatively consistent (within 2 cells)
    const isRegularHorizontal = this.hasConsistentGaps(horizontalGaps, 2);
    const isRegularVertical = this.hasConsistentGaps(verticalGaps, 2);

    return isRegularHorizontal && isRegularVertical;
  }

  private hasConsistentGaps(gaps: number[], tolerance: number): boolean {
    if (gaps.length === 0) return true;
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    return gaps.every((gap) => Math.abs(gap - avgGap) <= tolerance);
  }

  private detectAlignment(subcluster: BlockSubcluster): boolean {
    if (subcluster.blocks.length < 2) return true;

    // Check if blocks align on their edges or centers
    const leftEdges = subcluster.blocks.map((b) => b.leftCol);
    const rightEdges = subcluster.blocks.map((b) => b.rightCol);
    const topEdges = subcluster.blocks.map((b) => b.topRow);
    const bottomEdges = subcluster.blocks.map((b) => b.bottomRow);

    // Count how many blocks share the same edge positions
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

  private detectHierarchy(subcluster: BlockSubcluster): boolean {
    // Simple heuristic: look for blocks of different sizes suggesting hierarchy
    const blockSizes = subcluster.blocks.map(
      (b) => (b.rightCol - b.leftCol + 1) * (b.bottomRow - b.topRow + 1)
    );
    const uniqueSizes = new Set(blockSizes);

    // If we have significantly different block sizes, suggest hierarchy
    if (uniqueSizes.size > 1) {
      const minSize = Math.min(...blockSizes);
      const maxSize = Math.max(...blockSizes);
      return maxSize > minSize * 2; // At least 2x size difference
    }
    return false;
  }

  private detectSequencing(subcluster: BlockSubcluster): boolean {
    return (
      this.isHorizontalSequence(subcluster) ||
      this.isVerticalSequence(subcluster)
    );
  }

  private isHorizontalSequence(subcluster: BlockSubcluster): boolean {
    // Check if blocks are arranged in a horizontal sequence
    const sorted = subcluster.blocks.sort((a, b) => a.leftCol - b.leftCol);
    return sorted.length > 1 && this.areBlocksInSequence(sorted, "horizontal");
  }

  private isVerticalSequence(subcluster: BlockSubcluster): boolean {
    // Check if blocks are arranged in a vertical sequence
    const sorted = subcluster.blocks.sort((a, b) => a.topRow - b.topRow);
    return sorted.length > 1 && this.areBlocksInSequence(sorted, "vertical");
  }

  private areBlocksInSequence(
    blocks: any[],
    direction: "horizontal" | "vertical"
  ): boolean {
    // Simple check: blocks should be roughly aligned and evenly spaced
    const tolerance = 3; // cells

    if (direction === "horizontal") {
      // Check vertical alignment and horizontal spacing
      const avgTop =
        blocks.reduce((sum, b) => sum + b.topRow, 0) / blocks.length;
      return blocks.every((b) => Math.abs(b.topRow - avgTop) <= tolerance);
    } else {
      // Check horizontal alignment and vertical spacing
      const avgLeft =
        blocks.reduce((sum, b) => sum + b.leftCol, 0) / blocks.length;
      return blocks.every((b) => Math.abs(b.leftCol - avgLeft) <= tolerance);
    }
  }

  private detectBranching(subcluster: BlockSubcluster): boolean {
    // Look for blocks that have multiple connections (joins) suggesting branching
    return subcluster.blockJoins.length > subcluster.blocks.length - 1;
  }

  private detectSymmetry(
    subcluster: BlockSubcluster,
    base: BlockSubclusterBaseTraits
  ): boolean {
    if (subcluster.blocks.length < 2) return true;

    // Simple symmetry check: compare block positions relative to center
    const centerRow =
      (subcluster.clusterCanvas.top + subcluster.clusterCanvas.bottom) / 2;
    const centerCol =
      (subcluster.clusterCanvas.left + subcluster.clusterCanvas.right) / 2;

    // For now, just check if blocks are distributed somewhat evenly around center
    const leftBlocks = subcluster.blocks.filter(
      (b) => (b.leftCol + b.rightCol) / 2 < centerCol
    );
    const rightBlocks = subcluster.blocks.filter(
      (b) => (b.leftCol + b.rightCol) / 2 > centerCol
    );
    const topBlocks = subcluster.blocks.filter(
      (b) => (b.topRow + b.bottomRow) / 2 < centerRow
    );
    const bottomBlocks = subcluster.blocks.filter(
      (b) => (b.topRow + b.bottomRow) / 2 > centerRow
    );

    const horizontalBalance =
      Math.abs(leftBlocks.length - rightBlocks.length) <= 1;
    const verticalBalance =
      Math.abs(topBlocks.length - bottomBlocks.length) <= 1;

    return horizontalBalance || verticalBalance;
  }

  private analyzeBlockTypes(subcluster: BlockSubcluster): Set<string> {
    const types = new Set<string>();

    subcluster.blocks.forEach((block) => {
      if (block.traits) {
        // Add block shape based on traits
        if (block.traits.base.blockShape) {
          types.add(block.traits.base.blockShape.toString());
        }

        // Add other characteristics based on what's actually available
        if (block.traits.composite.cellClusterCount > 1)
          types.add("multi-cluster");
        if (block.traits.composite.hasInternalStructure)
          types.add("structured");
        if (block.traits.base.isSingleCell) types.add("single-cell");
      } else {
        // Fallback: categorize by size
        const area =
          (block.rightCol - block.leftCol + 1) *
          (block.bottomRow - block.topRow + 1);
        if (area === 1) types.add("single-cell");
        else if (area <= 4) types.add("small");
        else if (area <= 16) types.add("medium");
        else types.add("large");
      }
    });

    return types;
  }

  private detectComplementaryBlocks(subcluster: BlockSubcluster): boolean {
    // Look for blocks that seem to complement each other (headers + data, labels + values, etc.)
    const blockTypes = this.analyzeBlockTypes(subcluster);

    // Simple heuristic: if we have different types, they might be complementary
    if (blockTypes.has("header") && blockTypes.has("data")) return true;
    if (blockTypes.has("small") && blockTypes.has("large")) return true;
    if (blockTypes.size > 1 && subcluster.blocks.length >= 2) return true;

    return false;
  }

  private detectMixedPurposes(subcluster: BlockSubcluster): boolean {
    // Simple heuristic: mixed purposes if we have many different block types
    const blockTypes = this.analyzeBlockTypes(subcluster);
    return blockTypes.size > 2;
  }

  private isGridPattern(
    subcluster: BlockSubcluster,
    base: BlockSubclusterBaseTraits
  ): boolean {
    // Grid pattern: multiple rows and columns with regular arrangement
    return (
      base.blocksInRow > 1 &&
      base.blocksInColumn > 1 &&
      base.hasRegularSpacing &&
      base.hasAlignment
    );
  }

  private isTreePattern(subcluster: BlockSubcluster): boolean {
    // Tree pattern: hierarchical with branching but no cycles
    if (subcluster.blocks.length < 3) return false;

    // Simple heuristic: more joins than a simple linear arrangement
    // but not fully connected like a mesh
    const joinCount = subcluster.blockJoins.length;
    const blockCount = subcluster.blocks.length;

    // Tree should have exactly blockCount - 1 edges
    return joinCount === blockCount - 1 && this.detectHierarchy(subcluster);
  }

  private isListPattern(
    subcluster: BlockSubcluster,
    base: BlockSubclusterBaseTraits
  ): boolean {
    // List pattern: sequential arrangement in one dimension
    return (
      this.detectSequencing(subcluster) &&
      (base.blocksInRow === 1 || base.blocksInColumn === 1)
    );
  }

  private isNetworkPattern(
    subcluster: BlockSubcluster,
    base: BlockSubclusterBaseTraits
  ): boolean {
    // Network pattern: many interconnections, not strictly hierarchical
    const joinCount = subcluster.blockJoins.length;
    const blockCount = subcluster.blocks.length;
    const maxPossibleJoins = (blockCount * (blockCount - 1)) / 2;

    return joinCount > blockCount && joinCount > maxPossibleJoins * 0.3;
  }

  private isFlowPattern(subcluster: BlockSubcluster): boolean {
    // Flow pattern: directional arrangement suggesting process flow
    return (
      this.detectSequencing(subcluster) && this.detectBranching(subcluster)
    );
  }

  private analyzeFlow(
    subcluster: BlockSubcluster,
    base: BlockSubclusterBaseTraits
  ): {
    hasDirectionalFlow: boolean;
    flowDirection: "horizontal" | "vertical" | "radial" | "mixed" | "none";
  } {
    const hasHorizontalFlow = this.isHorizontalSequence(subcluster);
    const hasVerticalFlow = this.isVerticalSequence(subcluster);

    if (hasHorizontalFlow && hasVerticalFlow) {
      return { hasDirectionalFlow: true, flowDirection: "mixed" };
    } else if (hasHorizontalFlow) {
      return { hasDirectionalFlow: true, flowDirection: "horizontal" };
    } else if (hasVerticalFlow) {
      return { hasDirectionalFlow: true, flowDirection: "vertical" };
    } else if (this.detectBranching(subcluster)) {
      return { hasDirectionalFlow: true, flowDirection: "radial" };
    } else {
      return { hasDirectionalFlow: false, flowDirection: "none" };
    }
  }

  private determineOrganizationPrinciple(
    subcluster: BlockSubcluster,
    base: BlockSubclusterBaseTraits
  ): "position" | "content" | "function" | "hierarchy" | "mixed" {
    if (this.detectHierarchy(subcluster)) return "hierarchy";
    if (base.hasRegularSpacing && base.hasAlignment) return "position";
    if (this.detectComplementaryBlocks(subcluster)) return "function";
    return "mixed";
  }

  private calculateGroupingStrength(
    subcluster: BlockSubcluster,
    base: BlockSubclusterBaseTraits
  ): number {
    let strength = 0;

    // Add strength for various cohesive factors
    if (base.hasAlignment) strength += 0.3;
    if (base.hasRegularSpacing) strength += 0.3;
    if (base.connectivityRatio > 0.1) strength += 0.2;
    if (base.clusterDensity > 0.5) strength += 0.2;

    return Math.min(1, strength);
  }

  // Continue with the remaining methods from the original file...
  // (Due to length, I'll include the method signatures)

  private identifyLikelyConstructs(
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ): string[] {
    const constructs: string[] = [];

    if (composite.isGrid) constructs.push("spreadsheet", "table", "matrix");
    if (composite.isList) constructs.push("menu", "list", "index");
    if (composite.isTree)
      constructs.push("hierarchy", "org-chart", "navigation");
    if (composite.isFlow) constructs.push("process", "workflow", "flowchart");
    if (composite.isNetwork) constructs.push("diagram", "graph", "network");

    // Add more sophisticated analysis based on size and arrangement
    if (base.blockCount === 1) constructs.push("single-item", "focus");
    if (base.blockCount >= 10) constructs.push("dashboard", "complex-layout");

    return constructs;
  }

  private calculateConstructConfidence(
    constructs: string[],
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on strong indicators
    if (base.hasRegularSpacing && base.hasAlignment) confidence += 0.2;
    if (base.connectivityRatio > 0.2) confidence += 0.1;
    if (constructs.length <= 2) confidence += 0.1; // Clear classification
    if (constructs.length > 4) confidence -= 0.1; // Uncertain classification

    return Math.min(1, Math.max(0, confidence));
  }

  private isDataStructure(composite: BlockSubclusterCompositeTraits): boolean {
    return (
      composite.isGrid || composite.isList || composite.hasUniformBlockTypes
    );
  }

  private isUserInterface(
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ): boolean {
    return (
      composite.hasDirectionalFlow || composite.isNetwork || base.blockCount > 3
    );
  }

  private isDocument(composite: BlockSubclusterCompositeTraits): boolean {
    return composite.hasSequencing && !composite.isGrid;
  }

  private isVisualization(
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ): boolean {
    return (
      composite.isNetwork ||
      composite.isTree ||
      (base.blockCount > 5 && composite.hasSymmetry)
    );
  }

  private isNavigation(composite: BlockSubclusterCompositeTraits): boolean {
    return composite.isList || composite.isTree || composite.hasSequencing;
  }

  private determinePrimaryPurpose(
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ):
    | "data-display"
    | "data-entry"
    | "calculation"
    | "navigation"
    | "decoration"
    | "mixed" {
    if (composite.isGrid && composite.hasUniformBlockTypes)
      return "data-display";
    if (composite.isList || composite.isTree) return "navigation";
    if (composite.hasComplementaryBlocks) return "data-entry";
    if (base.blockCount === 1) return "decoration";
    return "mixed";
  }

  private determineComplexity(
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ): "simple" | "moderate" | "complex" | "very-complex" {
    let complexity = 0;

    complexity += base.blockCount / 10; // More blocks = more complex
    if (composite.hasBranching) complexity += 0.5;
    if (composite.hasHierarchy) complexity += 0.3;
    if (composite.hasMixedPurposes) complexity += 0.3;
    if (base.connectivityRatio > 0.3) complexity += 0.2;

    if (complexity < 0.5) return "simple";
    if (complexity < 1.0) return "moderate";
    if (complexity < 2.0) return "complex";
    return "very-complex";
  }

  private isInteractive(composite: BlockSubclusterCompositeTraits): boolean {
    return (
      composite.hasDirectionalFlow ||
      composite.isNetwork ||
      composite.hasBranching
    );
  }

  private isReadOnly(composite: BlockSubclusterCompositeTraits): boolean {
    return (
      composite.isGrid &&
      composite.hasUniformBlockTypes &&
      !composite.hasComplementaryBlocks
    );
  }

  private determineLayoutStyle(
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ): "formal" | "informal" | "structured" | "organic" {
    if (base.hasRegularSpacing && base.hasAlignment && composite.isGrid) {
      return "formal";
    }
    if (composite.isTree || composite.hasHierarchy) {
      return "structured";
    }
    if (base.hasAlignment || base.hasRegularSpacing) {
      return "structured";
    }
    if (composite.isNetwork && !composite.hasSymmetry) {
      return "organic";
    }
    return "informal";
  }

  private calculateVisualBalance(
    subcluster: BlockSubcluster,
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
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
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ): boolean {
    return (
      composite.isList ||
      composite.isGrid ||
      (base.hasRegularSpacing && !composite.isNetwork)
    );
  }

  private determineGrowthDirection(
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ): "horizontal" | "vertical" | "both" | "none" {
    if (composite.isGrid) return "both";
    if (base.blocksInRow > base.blocksInColumn) return "horizontal";
    if (base.blocksInColumn > base.blocksInRow) return "vertical";
    if (composite.isList) {
      return composite.flowDirection === "horizontal"
        ? "horizontal"
        : "vertical";
    }
    return "none";
  }

  private calculateStabilityScore(
    base: BlockSubclusterBaseTraits,
    composite: BlockSubclusterCompositeTraits
  ): number {
    let stability = 0.5;

    if (base.hasAlignment) stability += 0.2;
    if (base.hasRegularSpacing) stability += 0.2;
    if (composite.hasSymmetry) stability += 0.1;
    if (base.connectivityRatio > 0.2) stability += 0.1;
    if (composite.isGrid || composite.isList) stability += 0.1;

    return Math.min(1, stability);
  }
}
