import BlockJoin from "./BlockJoin";
import {
  BlockJoinTraits,
  BlockJoinBaseTraits,
  BlockJoinCompositeTraits,
  BlockJoinDerivedTraits,
} from "./BlockJoinTraits";
import Block from "../block/Block";
import GridModel from "../../1-substrate/GridModel";

/**
 * Parses and analyzes BlockJoin instances to populate their trait properties
 */
export class BlockJoinTraitParser {
  private grid: GridModel;

  constructor(grid: GridModel) {
    this.grid = grid;
  }

  /**
   * Parse all traits for a BlockJoin instance
   */
  parseTraits(join: BlockJoin): BlockJoinTraits {
    const base = this.parseBaseTraits(join);
    const composite = this.parseCompositeTraits(join, base);
    const derived = this.parseDerivedTraits(join, base, composite);

    return { base, composite, derived };
  }

  /**
   * Parse fundamental connection properties
   */
  private parseBaseTraits(join: BlockJoin): BlockJoinBaseTraits {
    const [block1, block2] = join.blocks;

    // Determine connection type and strength
    const { connectionType, connectionStrength, overlapArea } =
      this.analyzeConnectionGeometry(block1, block2);
    const proximityDistance = this.calculateProximityDistance(block1, block2);
    const connectionPoints =
      join.linkedPoints.length + join.lockedPoints.length;

    // Analyze relative properties
    const relativeSizes = this.analyzeRelativeSizes(block1, block2);
    const relativePositions = this.analyzeRelativePositions(block1, block2);

    // Directionality analysis
    const { isDirectional, direction } = this.analyzeDirectionality(
      join,
      block1,
      block2
    );

    // Lock/Link distribution
    const totalPoints = connectionPoints || 1; // Avoid division by zero
    const linkedPointRatio = join.linkedPoints.length / totalPoints;
    const lockedPointRatio = join.lockedPoints.length / totalPoints;
    const connectionBalance = 1 - Math.abs(linkedPointRatio - lockedPointRatio);

    return {
      connectionType,
      connectionStrength,
      overlapArea,
      proximityDistance,
      connectionPoints,
      relativeSizes,
      relativePositions,
      isDirectional,
      direction,
      linkedPointRatio,
      lockedPointRatio,
      connectionBalance,
    };
  }

  /**
   * Parse semantic and functional relationships
   */
  private parseCompositeTraits(
    join: BlockJoin,
    base: BlockJoinBaseTraits
  ): BlockJoinCompositeTraits {
    const [block1, block2] = join.blocks;

    // Relationship semantics
    const relationshipType = this.determineRelationshipType(
      join,
      base,
      block1,
      block2
    );
    const semanticStrength = this.calculateSemanticStrength(
      base,
      relationshipType
    );

    // Functional analysis
    const functionalTypes = this.analyzeFunctionalConnection(
      join,
      base,
      block1,
      block2
    );

    // Content relationship
    const contentRelationships = this.analyzeContentRelationship(
      block1,
      block2
    );

    // Interaction patterns
    const interactionPatterns = this.analyzeInteractionPatterns(
      base,
      relationshipType
    );

    // Visual connection
    const visualProperties = this.analyzeVisualConnection(
      join,
      base,
      block1,
      block2
    );

    // Stability
    const { connectionStability, resistanceToChange } =
      this.analyzeConnectionStability(base, join);

    return {
      relationshipType,
      semanticStrength,
      ...functionalTypes,
      ...contentRelationships,
      ...interactionPatterns,
      ...visualProperties,
      connectionStability,
      resistanceToChange,
    };
  }

  /**
   * Parse high-level connection implications
   */
  private parseDerivedTraits(
    join: BlockJoin,
    base: BlockJoinBaseTraits,
    composite: BlockJoinCompositeTraits
  ): BlockJoinDerivedTraits {
    // Purpose classification
    const { primaryPurpose, secondaryPurposes } = this.classifyPurpose(
      base,
      composite
    );

    // Construct indicators
    const { indicatesConstruct, constructConfidence } =
      this.analyzeConstructIndicators(base, composite);

    // User experience implications
    const uxImplications = this.analyzeUXImplications(base, composite);

    // Design patterns
    const { followsPattern, patternStrength } = this.analyzeDesignPatterns(
      base,
      composite
    );

    // Evolution indicators
    const evolutionMetrics = this.analyzeEvolutionPotential(
      join,
      base,
      composite
    );

    // Quality assessment
    const { connectionQuality, improvementSuggestions } =
      this.assessConnectionQuality(base, composite);

    // Structural importance
    const { structuralImportance, redundancy } = this.analyzeStructuralRole(
      join,
      base,
      composite
    );

    return {
      primaryPurpose,
      secondaryPurposes,
      indicatesConstruct,
      constructConfidence,
      ...uxImplications,
      followsPattern,
      patternStrength,
      ...evolutionMetrics,
      connectionQuality,
      improvementSuggestions,
      structuralImportance,
      redundancy,
    };
  }

  // Helper methods for geometric analysis

  private analyzeConnectionGeometry(
    block1: Block,
    block2: Block
  ): {
    connectionType:
      | "adjacent"
      | "overlapping"
      | "nested"
      | "bridged"
      | "distant";
    connectionStrength: number;
    overlapArea: number;
  } {
    const overlap = this.calculateOverlap(block1, block2);
    const distance = this.calculateMinDistance(block1, block2);

    let connectionType:
      | "adjacent"
      | "overlapping"
      | "nested"
      | "bridged"
      | "distant";
    let connectionStrength: number;

    if (overlap.area > 0) {
      if (this.isNested(block1, block2)) {
        connectionType = "nested";
        connectionStrength = 0.9;
      } else {
        connectionType = "overlapping";
        connectionStrength = 0.8;
      }
    } else if (distance <= 1) {
      connectionType = "adjacent";
      connectionStrength = 0.7;
    } else if (distance <= 3) {
      connectionType = "bridged";
      connectionStrength = 0.5;
    } else {
      connectionType = "distant";
      connectionStrength = 0.2;
    }

    return {
      connectionType,
      connectionStrength,
      overlapArea: overlap.area,
    };
  }

  private calculateOverlap(block1: Block, block2: Block): { area: number } {
    const left = Math.max(block1.leftCol, block2.leftCol);
    const right = Math.min(block1.rightCol, block2.rightCol);
    const top = Math.max(block1.topRow, block2.topRow);
    const bottom = Math.min(block1.bottomRow, block2.bottomRow);

    if (left <= right && top <= bottom) {
      return { area: (right - left + 1) * (bottom - top + 1) };
    }
    return { area: 0 };
  }

  private calculateMinDistance(block1: Block, block2: Block): number {
    // Calculate minimum distance between block boundaries
    const dx = Math.max(
      0,
      Math.max(
        block1.leftCol - block2.rightCol,
        block2.leftCol - block1.rightCol
      )
    );
    const dy = Math.max(
      0,
      Math.max(
        block1.topRow - block2.bottomRow,
        block2.topRow - block1.bottomRow
      )
    );
    return Math.sqrt(dx * dx + dy * dy);
  }

  private isNested(block1: Block, block2: Block): boolean {
    // Check if one block is completely inside the other
    const block1InsideBlock2 =
      block1.leftCol >= block2.leftCol &&
      block1.rightCol <= block2.rightCol &&
      block1.topRow >= block2.topRow &&
      block1.bottomRow <= block2.bottomRow;

    const block2InsideBlock1 =
      block2.leftCol >= block1.leftCol &&
      block2.rightCol <= block1.rightCol &&
      block2.topRow >= block1.topRow &&
      block2.bottomRow <= block1.bottomRow;

    return block1InsideBlock2 || block2InsideBlock1;
  }

  private calculateProximityDistance(block1: Block, block2: Block): number {
    const center1 = {
      row: (block1.topRow + block1.bottomRow) / 2,
      col: (block1.leftCol + block1.rightCol) / 2,
    };
    const center2 = {
      row: (block2.topRow + block2.bottomRow) / 2,
      col: (block2.leftCol + block2.rightCol) / 2,
    };

    return Math.sqrt(
      Math.pow(center2.row - center1.row, 2) +
        Math.pow(center2.col - center1.col, 2)
    );
  }

  private analyzeRelativeSizes(
    block1: Block,
    block2: Block
  ): "equal" | "larger-first" | "smaller-first" | "varied" {
    const area1 =
      (block1.rightCol - block1.leftCol + 1) *
      (block1.bottomRow - block1.topRow + 1);
    const area2 =
      (block2.rightCol - block2.leftCol + 1) *
      (block2.bottomRow - block2.topRow + 1);

    const ratio = area1 / area2;

    if (ratio > 1.5) return "larger-first";
    if (ratio < 0.67) return "smaller-first";
    return "equal";
  }

  private analyzeRelativePositions(
    block1: Block,
    block2: Block
  ): "horizontal" | "vertical" | "diagonal" | "nested" {
    if (this.isNested(block1, block2)) return "nested";

    const center1 = {
      row: (block1.topRow + block1.bottomRow) / 2,
      col: (block1.leftCol + block1.rightCol) / 2,
    };
    const center2 = {
      row: (block2.topRow + block2.bottomRow) / 2,
      col: (block2.leftCol + block2.rightCol) / 2,
    };

    const dx = Math.abs(center2.col - center1.col);
    const dy = Math.abs(center2.row - center1.row);

    if (dx > dy * 2) return "horizontal";
    if (dy > dx * 2) return "vertical";
    return "diagonal";
  }

  private analyzeDirectionality(
    join: BlockJoin,
    block1: Block,
    block2: Block
  ): {
    isDirectional: boolean;
    direction: "bidirectional" | "first-to-second" | "second-to-first" | "none";
  } {
    // Simplified directionality analysis based on content and position
    const hasFormulas1 = this.hasFormulas(block1);
    const hasFormulas2 = this.hasFormulas(block2);

    if (hasFormulas1 && !hasFormulas2) {
      return { isDirectional: true, direction: "second-to-first" };
    }
    if (!hasFormulas1 && hasFormulas2) {
      return { isDirectional: true, direction: "first-to-second" };
    }
    if (hasFormulas1 || hasFormulas2) {
      return { isDirectional: true, direction: "bidirectional" };
    }

    return { isDirectional: false, direction: "none" };
  }

  private hasFormulas(block: Block): boolean {
    return block.canvasPoints.some((pt) =>
      this.grid.getCellRaw(pt.row, pt.col).trim().startsWith("=")
    );
  }

  // Semantic and functional analysis methods

  private determineRelationshipType(
    join: BlockJoin,
    base: BlockJoinBaseTraits,
    block1: Block,
    block2: Block
  ):
    | "parent-child"
    | "sibling"
    | "master-detail"
    | "peer"
    | "container-content"
    | "sequence" {
    if (base.connectionType === "nested") {
      return "container-content";
    }

    if (
      base.relativeSizes === "larger-first" ||
      base.relativeSizes === "smaller-first"
    ) {
      return "parent-child";
    }

    if (base.isDirectional) {
      return "master-detail";
    }

    if (
      base.relativePositions === "horizontal" ||
      base.relativePositions === "vertical"
    ) {
      return "sequence";
    }

    return "peer";
  }

  private calculateSemanticStrength(
    base: BlockJoinBaseTraits,
    relationshipType: string
  ): number {
    let strength = base.connectionStrength;

    // Boost strength for meaningful relationships
    if (
      relationshipType === "parent-child" ||
      relationshipType === "master-detail"
    ) {
      strength += 0.1;
    }

    if (base.connectionBalance > 0.7) {
      strength += 0.1;
    }

    return Math.min(strength, 1.0);
  }

  private analyzeFunctionalConnection(
    join: BlockJoin,
    base: BlockJoinBaseTraits,
    block1: Block,
    block2: Block
  ): {
    isDataFlow: boolean;
    isControlFlow: boolean;
    isStructural: boolean;
    isDecorative: boolean;
  } {
    const hasFormulas1 = this.hasFormulas(block1);
    const hasFormulas2 = this.hasFormulas(block2);

    const isDataFlow = hasFormulas1 || hasFormulas2;
    const isControlFlow = base.isDirectional && (hasFormulas1 || hasFormulas2);
    const isStructural = base.connectionStrength > 0.6;
    const isDecorative = base.connectionStrength < 0.3 && !isDataFlow;

    return { isDataFlow, isControlFlow, isStructural, isDecorative };
  }

  private analyzeContentRelationship(
    block1: Block,
    block2: Block
  ): {
    hasContentCohesion: boolean;
    hasComplementaryContent: boolean;
    hasDataContinuity: boolean;
  } {
    // Simplified content analysis
    const content1 = this.getBlockContentTypes(block1);
    const content2 = this.getBlockContentTypes(block2);

    const hasContentCohesion = content1.some((type) => content2.includes(type));
    const hasComplementaryContent =
      (content1.includes("text") && content2.includes("number")) ||
      (content1.includes("header") && content2.includes("data"));
    const hasDataContinuity =
      content1.includes("formula") || content2.includes("formula");

    return { hasContentCohesion, hasComplementaryContent, hasDataContinuity };
  }

  private getBlockContentTypes(block: Block): string[] {
    const types: string[] = [];
    const contents = block.canvasPoints.map((pt) =>
      this.grid.getCellRaw(pt.row, pt.col).trim()
    );

    const hasNumbers = contents.some(
      (content) => !isNaN(Number(content)) && content !== ""
    );
    const hasText = contents.some(
      (content) =>
        isNaN(Number(content)) && !content.startsWith("=") && content !== ""
    );
    const hasFormulas = contents.some((content) => content.startsWith("="));

    if (hasNumbers) types.push("number");
    if (hasText) types.push("text");
    if (hasFormulas) types.push("formula");

    // Simple heuristics for header/data
    if (block.topRow <= 3 && hasText && !hasNumbers) types.push("header");
    if (hasNumbers && !hasText) types.push("data");

    return types;
  }

  private analyzeInteractionPatterns(
    base: BlockJoinBaseTraits,
    relationshipType: string
  ): {
    impliesNavigation: boolean;
    impliesSelection: boolean;
    impliesHierarchy: boolean;
    impliesSequence: boolean;
  } {
    const impliesNavigation =
      base.relativePositions === "horizontal" ||
      base.relativePositions === "vertical";
    const impliesSelection = relationshipType === "master-detail";
    const impliesHierarchy =
      relationshipType === "parent-child" || base.connectionType === "nested";
    const impliesSequence = relationshipType === "sequence";

    return {
      impliesNavigation,
      impliesSelection,
      impliesHierarchy,
      impliesSequence,
    };
  }

  private analyzeVisualConnection(
    join: BlockJoin,
    base: BlockJoinBaseTraits,
    block1: Block,
    block2: Block
  ): {
    hasVisualContinuity: boolean;
    createsVisualFlow: boolean;
    establishesBoundary: boolean;
  } {
    const hasVisualContinuity = base.connectionStrength > 0.5;
    const createsVisualFlow = base.relativePositions !== "diagonal";
    const establishesBoundary =
      base.connectionType === "adjacent" && join.linkedPoints.length > 0;

    return { hasVisualContinuity, createsVisualFlow, establishesBoundary };
  }

  private analyzeConnectionStability(
    base: BlockJoinBaseTraits,
    join: BlockJoin
  ): {
    connectionStability: "stable" | "flexible" | "dynamic" | "fragile";
    resistanceToChange: number;
  } {
    let stability: "stable" | "flexible" | "dynamic" | "fragile";
    let resistanceToChange = 0.5;

    if (base.connectionStrength > 0.8) {
      stability = "stable";
      resistanceToChange = 0.8;
    } else if (base.connectionStrength > 0.6) {
      stability = "flexible";
      resistanceToChange = 0.6;
    } else if (base.connectionStrength > 0.3) {
      stability = "dynamic";
      resistanceToChange = 0.4;
    } else {
      stability = "fragile";
      resistanceToChange = 0.2;
    }

    return { connectionStability: stability, resistanceToChange };
  }

  // High-level analysis methods

  private classifyPurpose(
    base: BlockJoinBaseTraits,
    composite: BlockJoinCompositeTraits
  ): {
    primaryPurpose:
      | "organization"
      | "navigation"
      | "data-relationship"
      | "visual-grouping"
      | "functional-link";
    secondaryPurposes: string[];
  } {
    let primaryPurpose:
      | "organization"
      | "navigation"
      | "data-relationship"
      | "visual-grouping"
      | "functional-link";
    const secondaryPurposes: string[] = [];

    if (composite.isDataFlow) {
      primaryPurpose = "data-relationship";
    } else if (composite.impliesNavigation) {
      primaryPurpose = "navigation";
    } else if (composite.impliesHierarchy) {
      primaryPurpose = "organization";
    } else if (composite.createsVisualFlow) {
      primaryPurpose = "visual-grouping";
    } else {
      primaryPurpose = "functional-link";
    }

    // Add secondary purposes
    if (composite.isStructural && primaryPurpose !== "organization") {
      secondaryPurposes.push("organization");
    }
    if (composite.hasVisualContinuity && primaryPurpose !== "visual-grouping") {
      secondaryPurposes.push("visual-grouping");
    }

    return { primaryPurpose, secondaryPurposes };
  }

  private analyzeConstructIndicators(
    base: BlockJoinBaseTraits,
    composite: BlockJoinCompositeTraits
  ): {
    indicatesConstruct: string[];
    constructConfidence: number;
  } {
    const constructs: string[] = [];
    let confidence = 0.5;

    if (composite.relationshipType === "master-detail") {
      constructs.push("dashboard", "data-browser");
      confidence += 0.2;
    }

    if (composite.impliesHierarchy) {
      constructs.push("tree", "organization-chart");
      confidence += 0.15;
    }

    if (composite.impliesSequence) {
      constructs.push("workflow", "timeline");
      confidence += 0.15;
    }

    if (composite.isDataFlow) {
      constructs.push("spreadsheet", "calculation-model");
      confidence += 0.1;
    }

    return {
      indicatesConstruct: constructs,
      constructConfidence: Math.min(confidence, 1.0),
    };
  }

  private analyzeUXImplications(
    base: BlockJoinBaseTraits,
    composite: BlockJoinCompositeTraits
  ): {
    affectsUsability: boolean;
    improvesNavigation: boolean;
    clarifiesStructure: boolean;
    reducesComplexity: boolean;
  } {
    const affectsUsability = base.connectionStrength > 0.4;
    const improvesNavigation =
      composite.impliesNavigation && base.connectionStrength > 0.5;
    const clarifiesStructure =
      composite.impliesHierarchy ||
      composite.relationshipType === "parent-child";
    const reducesComplexity =
      composite.hasContentCohesion && base.connectionBalance > 0.6;

    return {
      affectsUsability,
      improvesNavigation,
      clarifiesStructure,
      reducesComplexity,
    };
  }

  private analyzeDesignPatterns(
    base: BlockJoinBaseTraits,
    composite: BlockJoinCompositeTraits
  ): {
    followsPattern: string;
    patternStrength: number;
  } {
    let followsPattern = "none";
    let patternStrength = 0;

    if (composite.relationshipType === "master-detail") {
      followsPattern = "master-detail";
      patternStrength = base.connectionStrength;
    } else if (composite.relationshipType === "parent-child") {
      followsPattern = "parent-child";
      patternStrength = base.connectionStrength;
    } else if (composite.impliesSequence) {
      followsPattern = "sequential";
      patternStrength = base.connectionStrength * 0.8;
    }

    return { followsPattern, patternStrength };
  }

  private analyzeEvolutionPotential(
    join: BlockJoin,
    base: BlockJoinBaseTraits,
    composite: BlockJoinCompositeTraits
  ): {
    isEvolutionPoint: boolean;
    extensibilityPotential: number;
  } {
    const isEvolutionPoint =
      composite.connectionStability === "flexible" ||
      composite.connectionStability === "dynamic";

    let extensibilityPotential = 0.3; // Base potential

    if (composite.impliesSequence) extensibilityPotential += 0.2;
    if (composite.impliesHierarchy) extensibilityPotential += 0.15;
    if (base.connectionStrength > 0.6) extensibilityPotential += 0.1;

    return {
      isEvolutionPoint,
      extensibilityPotential: Math.min(extensibilityPotential, 1.0),
    };
  }

  private assessConnectionQuality(
    base: BlockJoinBaseTraits,
    composite: BlockJoinCompositeTraits
  ): {
    connectionQuality: "excellent" | "good" | "adequate" | "poor";
    improvementSuggestions: string[];
  } {
    const qualityScore =
      (base.connectionStrength +
        composite.semanticStrength +
        base.connectionBalance) /
      3;
    const suggestions: string[] = [];

    let quality: "excellent" | "good" | "adequate" | "poor";

    if (qualityScore > 0.8) {
      quality = "excellent";
    } else if (qualityScore > 0.6) {
      quality = "good";
    } else if (qualityScore > 0.4) {
      quality = "adequate";
      if (base.connectionBalance < 0.5) {
        suggestions.push("Balance linked and locked points");
      }
    } else {
      quality = "poor";
      suggestions.push("Strengthen connection between blocks");
      if (!composite.hasContentCohesion) {
        suggestions.push("Improve content relationship");
      }
    }

    return { connectionQuality: quality, improvementSuggestions: suggestions };
  }

  private analyzeStructuralRole(
    join: BlockJoin,
    base: BlockJoinBaseTraits,
    composite: BlockJoinCompositeTraits
  ): {
    structuralImportance: number;
    redundancy: number;
  } {
    let importance = base.connectionStrength;

    // Boost importance for critical relationships
    if (composite.isStructural) importance += 0.2;
    if (composite.isDataFlow) importance += 0.15;
    if (composite.impliesHierarchy) importance += 0.1;

    // Calculate redundancy (simplified)
    const redundancy = composite.isDecorative ? 0.8 : 0.2;

    return {
      structuralImportance: Math.min(importance, 1.0),
      redundancy,
    };
  }
}
