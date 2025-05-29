import CellCluster from "./CellCluster";
import {
  CellClusterTraits,
  CellClusterBaseTraits,
  CellClusterCompositeTraits,
  CellClusterDerivedTraits,
} from "./CellClusterTraits";
import GridModel from "../../1-substrate/GridModel";

/**
 * Parses and analyzes CellCluster instances to populate their trait properties
 */
export class CellClusterTraitParser {
  private grid: GridModel;

  constructor(grid: GridModel) {
    this.grid = grid;
  }

  /**
   * Parse all traits for a CellCluster instance
   */
  parseTraits(cluster: CellCluster): CellClusterTraits {
    const base = this.parseBaseTraits(cluster);
    const composite = this.parseCompositeTraits(cluster, base);
    const derived = this.parseDerivedTraits(cluster, base, composite);

    return { base, composite, derived };
  }

  /**
   * Parse fundamental cell group properties
   */
  private parseBaseTraits(cluster: CellCluster): CellClusterBaseTraits {
    // Basic geometric properties
    const cellCount = cluster.filledPoints.length;
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;
    const area = width * height;
    const aspectRatio = width / height;

    // Content analysis
    const cellContents = cluster.filledPoints.map((pt) =>
      this.grid.getCellRaw(pt.row, pt.col).trim()
    );
    const nonEmptyCells = cellContents.filter((content) => content !== "");
    const nonEmptyCellCount = nonEmptyCells.length;
    const emptyCellCount = cellCount - nonEmptyCellCount;
    const fillRatio = cellCount > 0 ? nonEmptyCellCount / cellCount : 0;
    const density = fillRatio;

    // Shape characteristics
    const isRectangular = this.isRectangular(cluster);
    const isSquare = width === height && isRectangular;
    const isLinear = width === 1 || height === 1;
    const isHorizontalStrip = height === 1 && width > 1;
    const isVerticalStrip = width === 1 && height > 1;
    const isSingleCell = cellCount === 1;

    // Boundary analysis
    const hasRegularBoundary = isRectangular;
    const isContiguous = this.isContiguous(cluster);
    const hasConcavity = !isRectangular && this.hasConcavity(cluster);

    // Position properties
    const topRow = cluster.topRow;
    const bottomRow = cluster.bottomRow;
    const leftCol = cluster.leftCol;
    const rightCol = cluster.rightCol;
    const centerRow = Math.floor((topRow + bottomRow) / 2);
    const centerCol = Math.floor((leftCol + rightCol) / 2);

    return {
      cellCount,
      width,
      height,
      area,
      aspectRatio,
      density,
      emptyCellCount,
      nonEmptyCellCount,
      fillRatio,
      isRectangular,
      isSquare,
      isLinear,
      isHorizontalStrip,
      isVerticalStrip,
      isSingleCell,
      hasRegularBoundary,
      isContiguous,
      hasConcavity,
      topRow,
      bottomRow,
      leftCol,
      rightCol,
      centerRow,
      centerCol,
    };
  }

  /**
   * Parse content and pattern analysis
   */
  private parseCompositeTraits(
    cluster: CellCluster,
    base: CellClusterBaseTraits
  ): CellClusterCompositeTraits {
    const cellContents = cluster.filledPoints.map((pt) =>
      this.grid.getCellRaw(pt.row, pt.col).trim()
    );

    // Content type analysis
    const contentTypes = this.analyzeContentTypes(cellContents);
    const hasUniformContent = contentTypes.size <= 1;
    const hasMixedContent = contentTypes.size > 2;
    const hasNumericContent = contentTypes.has("number");
    const hasTextContent = contentTypes.has("text");
    const hasFormulas = contentTypes.has("formula");
    const dominantContentType = this.getDominantContentType(
      cellContents,
      contentTypes
    );

    // Data pattern analysis
    const hasSequentialData = this.hasSequentialData(cellContents, cluster);
    const hasRepeatingPattern = this.hasRepeatingPattern(cellContents);
    const hasHierarchicalStructure = this.hasHierarchicalStructure(
      cluster,
      base
    );
    const hasTabularStructure = this.hasTabularStructure(cluster, base);

    // Content quality
    const hasEmptySpaces = base.emptyCellCount > 0;
    const hasInconsistentTypes = this.hasInconsistentTypes(
      cellContents,
      cluster
    );
    const dataQuality = this.calculateDataQuality(cellContents, base);

    // Functional pattern analysis
    const functionalPatterns = this.analyzeFunctionalPatterns(
      cellContents,
      cluster,
      base
    );

    // Visual pattern analysis
    const visualPatterns = this.analyzeVisualPatterns(cluster, base);

    // Grid relationship analysis
    const gridRelationships = this.analyzeGridRelationships(cluster, base);

    // Data flow analysis
    const dataFlowCharacteristics = this.analyzeDataFlow(cellContents, cluster);

    return {
      // Content types and distribution
      contentTypes: new Set(contentTypes),
      hasUniformContent,
      hasMixedContent,
      hasNumericContent,
      hasTextContent,
      hasFormulas,
      dominantContentType,

      // Structural patterns within cluster
      hasHeaders: false, // Would need header detection logic
      hasFooters: false, // Would need footer detection logic
      hasBorders: false, // Would need border detection logic
      hasPattern: false, // Would need pattern detection logic
      hasColumnStructure: base.width > 1,
      hasRowStructure: base.height > 1,

      // Content alignment and organization
      contentAlignment: "mixed", // Simplified
      hasConsistentAlignment: false,
      alignmentPattern: "none",

      // Data characteristics
      dataTypes: Array.from(new Set(contentTypes)),
      dominantDataType: dominantContentType,
      dataConsistency: hasUniformContent ? 1.0 : 0.5,

      // Data patterns
      hasSequentialData,
      hasRepeatingPattern: false, // Simplified
      hasHierarchicalStructure,
      hasTabularStructure,
      hasCalculationPattern: hasFormulas,

      // Content quality
      hasEmptySpaces: base.emptyCellCount > 0,
      hasInconsistentTypes: hasMixedContent,
      dataQuality,
      completenessRatio: base.fillRatio,

      // Functional patterns
      isDataEntry: functionalPatterns.isDataEntry,
      isCalculation: functionalPatterns.isCalculation,
      isLookupTable: functionalPatterns.isLookupTable,
      isHeader: functionalPatterns.isHeader,
      isLabel: functionalPatterns.isLabel,
      isContainer: base.area > 4 && base.fillRatio < 0.7,
      isNavigation: false, // Simplified

      // Visual patterns
      hasAlignment: base.isRectangular,
      hasConsistentFormatting: hasUniformContent,
      visualCoherence: hasUniformContent ? 0.8 : 0.4,
      standsOutVisually: false, // Would need visual analysis

      // Relationship to grid
      alignsWithGridStructure: base.isRectangular,
      bridgesMultipleRegions: false, // Simplified
      isIsolated: true, // Simplified - would need cluster relationship analysis
      connectsToOtherClusters: false, // Simplified

      // Data flow characteristics
      hasInputs: !hasFormulas,
      hasOutputs: hasFormulas,
      isIntermediate: hasFormulas && hasNumericContent,
      participatesInCalculation: hasFormulas,
      hasDataDependencies: hasFormulas,
    };
  }

  /**
   * Parse high-level semantic understanding
   */
  private parseDerivedTraits(
    cluster: CellCluster,
    base: CellClusterBaseTraits,
    composite: CellClusterCompositeTraits
  ): CellClusterDerivedTraits {
    const cellContents = cluster.filledPoints.map((pt) =>
      this.grid.getCellRaw(pt.row, pt.col).trim()
    );

    // Purpose classification
    const { primaryPurpose, secondaryPurposes, confidence } =
      this.classifyPurpose(base, composite, cellContents);

    // Content semantics
    const { likelyDataType, semanticRole } = this.analyzeContentSemantics(
      cellContents,
      base,
      composite
    );

    // UI element analysis
    const uiCharacteristics = this.analyzeUICharacteristics(
      base,
      composite,
      cellContents
    );

    // Construct indicators
    const { indicatesConstruct, constructConfidence } =
      this.analyzeConstructIndicators(base, composite);

    // Business logic analysis
    const businessLogicTraits = this.analyzeBusinessLogic(
      cellContents,
      composite
    );

    // Evolution characteristics
    const evolutionTraits = this.analyzeEvolutionCharacteristics(
      base,
      composite,
      cellContents
    );

    // Quality and maintenance
    const qualityTraits = this.analyzeQualityAndMaintenance(
      base,
      composite,
      cellContents
    );

    // Performance implications
    const performanceTraits = this.analyzePerformanceImplications(
      cellContents,
      composite
    );

    return {
      // Purpose classification
      primaryPurpose,
      secondaryPurposes: [],
      confidence,

      // Content semantics
      likelyDataType,
      semanticRole,

      // Behavioral hints (moved from BlockTraits)
      isContainer: base.area > 4 && base.fillRatio < 0.7,
      isLeaf: base.isSingleCell,
      isHeader: composite.isHeader,
      isFooter: false, // Simplified
      isData: composite.isDataEntry,
      isNavigation: composite.isNavigation,
      isTitle: false, // Simplified
      isSummary: false, // Simplified

      // Directional orientation
      primaryDirection:
        base.width > base.height
          ? "horizontal"
          : base.height > base.width
          ? "vertical"
          : "none",
      secondaryDirection: "none",

      // User interface elements
      isInteractive: !composite.isCalculation,
      isReadOnly: composite.isCalculation,
      requiresValidation:
        composite.isDataEntry && composite.dominantContentType === "number",
      hasConstraints: composite.isLookupTable || composite.hasSequentialData,
      isUserEditable: !composite.isCalculation,

      // Construct indicators
      indicatesConstruct,
      constructConfidence: confidence,
      likelyConstructs: indicatesConstruct,

      // Content importance and hierarchy
      importance: confidence,
      hierarchyLevel: 0, // Simplified
      isParent: base.area > 9,
      isChild: base.area <= 4,
      isSibling: base.area > 4 && base.area <= 9,

      // Business logic implications
      hasBusinessLogic: composite.hasFormulas,
      isRuleBasedInput: false, // Simplified
      isAuditableData: composite.isDataEntry,
      requiresBackup: composite.isDataEntry,
      hasValidationRules:
        composite.isDataEntry && composite.dominantContentType === "number",

      // Evolution characteristics
      isStable: !composite.hasFormulas,
      isGrowthPoint: base.area <= 4,
      hasExtensionPotential: base.fillRatio < 0.8,
      changeFrequency: composite.hasFormulas ? "frequent" : "static",
      isExpandable: base.fillRatio < 0.8,

      // Quality and maintenance
      dataIntegrity: composite.dataQuality,
      maintainabilityScore: Math.min(
        0.7 +
          (composite.hasConsistentFormatting ? 0.1 : 0) +
          (composite.hasUniformContent ? 0.1 : 0),
        1.0
      ),
      complexity: composite.hasFormulas ? "complex" : "simple",
      structuralIntegrity: base.isRectangular ? 0.8 : 0.5,

      // Performance implications
      computationComplexity: composite.hasFormulas
        ? composite.contentTypes.size / composite.contentTypes.size
        : 0,
      updateFrequency: composite.isDataEntry
        ? 0.8
        : composite.isCalculation
        ? 0.9
        : composite.isHeader
        ? 0.1
        : 0.3,
      cachingBenefit:
        composite.isCalculation && !composite.isDataEntry ? 0.8 : 0.3,
      renderingCost: Math.min(base.area / 100, 1),
    };
  }

  // Helper methods for base trait analysis

  private isRectangular(cluster: CellCluster): boolean {
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;
    const expectedCellCount = width * height;
    return cluster.filledPoints.length === expectedCellCount;
  }

  private isContiguous(cluster: CellCluster): boolean {
    // Simple contiguity check - all cells should be reachable from first cell
    if (cluster.filledPoints.length <= 1) return true;

    const visited = new Set<string>();
    const toVisit = [cluster.filledPoints[0]];
    const pointSet = new Set(
      cluster.filledPoints.map((p) => `${p.row},${p.col}`)
    );

    while (toVisit.length > 0) {
      const current = toVisit.pop()!;
      const key = `${current.row},${current.col}`;

      if (visited.has(key)) continue;
      visited.add(key);

      // Check adjacent cells
      const neighbors = [
        { row: current.row - 1, col: current.col },
        { row: current.row + 1, col: current.col },
        { row: current.row, col: current.col - 1 },
        { row: current.row, col: current.col + 1 },
      ];

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        if (pointSet.has(neighborKey) && !visited.has(neighborKey)) {
          toVisit.push(neighbor);
        }
      }
    }

    return visited.size === cluster.filledPoints.length;
  }

  private hasConcavity(cluster: CellCluster): boolean {
    // Simplified concavity detection - if bounding box area > actual cell count
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;
    const boundingArea = width * height;
    return boundingArea > cluster.filledPoints.length;
  }

  // Content analysis methods

  private analyzeContentTypes(contents: string[]): Set<string> {
    const types = new Set<string>();

    contents.forEach((content) => {
      if (content === "") return;

      if (content.startsWith("=")) {
        types.add("formula");
      } else if (!isNaN(Number(content))) {
        types.add("number");
      } else if (this.isDate(content)) {
        types.add("date");
      } else if (this.isBoolean(content)) {
        types.add("boolean");
      } else {
        types.add("text");
      }
    });

    return types;
  }

  private isDate(content: string): boolean {
    // Simple date detection
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
    ];
    return datePatterns.some((pattern) => pattern.test(content));
  }

  private isBoolean(content: string): boolean {
    const lower = content.toLowerCase();
    return ["true", "false", "yes", "no", "y", "n"].includes(lower);
  }

  private getDominantContentType(
    contents: string[],
    types: Set<string>
  ): string {
    if (types.size === 0) return "empty";
    if (types.size === 1) return Array.from(types)[0];

    // Count occurrences of each type
    const typeCounts = new Map<string, number>();

    contents.forEach((content) => {
      if (content === "") return;

      let type = "text";
      if (content.startsWith("=")) type = "formula";
      else if (!isNaN(Number(content))) type = "number";
      else if (this.isDate(content)) type = "date";
      else if (this.isBoolean(content)) type = "boolean";

      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    let maxCount = 0;
    let dominantType = "mixed";

    for (const [type, count] of typeCounts) {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type;
      }
    }

    return dominantType;
  }

  private hasSequentialData(contents: string[], cluster: CellCluster): boolean {
    // Check if numeric data increases sequentially
    const numbers = contents
      .map((content) => Number(content))
      .filter((num) => !isNaN(num));

    if (numbers.length < 3) return false;

    // Check if differences are consistent
    const differences = [];
    for (let i = 1; i < numbers.length; i++) {
      differences.push(numbers[i] - numbers[i - 1]);
    }

    const firstDiff = differences[0];
    return differences.every((diff) => Math.abs(diff - firstDiff) < 0.01);
  }

  private hasRepeatingPattern(contents: string[]): boolean {
    if (contents.length < 4) return false;

    // Check for patterns of length 2, 3, 4
    for (
      let patternLength = 2;
      patternLength <= Math.min(4, Math.floor(contents.length / 2));
      patternLength++
    ) {
      const pattern = contents.slice(0, patternLength);
      let isRepeating = true;

      for (let i = patternLength; i < contents.length; i += patternLength) {
        const segment = contents.slice(i, i + patternLength);
        if (
          segment.length !== pattern.length ||
          !this.arraysEqual(segment, pattern)
        ) {
          isRepeating = false;
          break;
        }
      }

      if (isRepeating) return true;
    }

    return false;
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  private hasHierarchicalStructure(
    cluster: CellCluster,
    base: CellClusterBaseTraits
  ): boolean {
    // Simple heuristic: multi-row structure with varying indentation or formatting
    return base.height > 2 && !base.isLinear && base.width > 3;
  }

  private hasTabularStructure(
    cluster: CellCluster,
    base: CellClusterBaseTraits
  ): boolean {
    // Rectangular structure with multiple rows and columns
    return base.isRectangular && base.width > 1 && base.height > 1;
  }

  private hasInconsistentTypes(
    contents: string[],
    cluster: CellCluster
  ): boolean {
    // Check if columns have inconsistent data types
    if (!this.isRectangular(cluster)) return false;

    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;

    for (let col = 0; col < width; col++) {
      const columnTypes = new Set<string>();

      for (let row = 0; row < height; row++) {
        const index = row * width + col;
        if (index >= contents.length) continue;

        const content = contents[index];
        if (content === "") continue;

        let type = "text";
        if (content.startsWith("=")) type = "formula";
        else if (!isNaN(Number(content))) type = "number";
        else if (this.isDate(content)) type = "date";
        else if (this.isBoolean(content)) type = "boolean";

        columnTypes.add(type);
      }

      if (columnTypes.size > 2) return true; // Too many types in one column
    }

    return false;
  }

  private calculateDataQuality(
    contents: string[],
    base: CellClusterBaseTraits
  ): number {
    let quality = 1.0;

    // Penalize empty cells
    if (base.fillRatio < 0.8) quality -= (0.8 - base.fillRatio) * 0.5;

    // Penalize inconsistent content
    const nonEmptyContents = contents.filter((c) => c !== "");
    if (nonEmptyContents.length > 0) {
      const types = this.analyzeContentTypes(nonEmptyContents);
      if (types.size > 3) quality -= 0.2; // Too many different types
    }

    return Math.max(quality, 0);
  }

  // Functional pattern analysis

  private analyzeFunctionalPatterns(
    contents: string[],
    cluster: CellCluster,
    base: CellClusterBaseTraits
  ): {
    isDataEntry: boolean;
    isCalculation: boolean;
    isLookupTable: boolean;
    isHeader: boolean;
    isLabel: boolean;
  } {
    const hasFormulas = contents.some((c) => c.startsWith("="));
    const hasNumbers = contents.some((c) => !isNaN(Number(c)) && c !== "");
    const hasText = contents.some(
      (c) => isNaN(Number(c)) && !c.startsWith("=") && c !== ""
    );

    const isCalculation = hasFormulas;
    const isDataEntry = hasNumbers && !hasFormulas && base.fillRatio > 0.5;
    const hasTabularStructure = this.hasTabularStructure(cluster, base);
    const isLookupTable = hasTabularStructure && hasNumbers && hasText;
    const isHeader = base.topRow <= 3 && hasText && !hasNumbers && !hasFormulas;
    const isLabel =
      (base.isLinear || base.cellCount <= 3) && hasText && !hasNumbers;

    return { isDataEntry, isCalculation, isLookupTable, isHeader, isLabel };
  }

  // Visual pattern analysis

  private analyzeVisualPatterns(
    cluster: CellCluster,
    base: CellClusterBaseTraits
  ): {
    hasAlignment: boolean;
    hasConsistentFormatting: boolean;
    visualCoherence: number;
  } {
    const hasAlignment = base.isRectangular || base.isLinear;
    const hasConsistentFormatting = base.hasRegularBoundary;
    const visualCoherence = base.isRectangular
      ? 0.9
      : base.isContiguous
      ? 0.7
      : 0.4;

    return { hasAlignment, hasConsistentFormatting, visualCoherence };
  }

  // Grid relationship analysis

  private analyzeGridRelationships(
    cluster: CellCluster,
    base: CellClusterBaseTraits
  ): {
    alignsWithGridStructure: boolean;
    bridgesMultipleRegions: boolean;
    isIsolated: boolean;
  } {
    const alignsWithGridStructure = base.isRectangular;
    const bridgesMultipleRegions = base.width > 10 || base.height > 10;
    const isIsolated = base.cellCount <= 3 && base.isContiguous;

    return { alignsWithGridStructure, bridgesMultipleRegions, isIsolated };
  }

  // Data flow analysis

  private analyzeDataFlow(
    contents: string[],
    cluster: CellCluster
  ): {
    hasInputs: boolean;
    hasOutputs: boolean;
    isIntermediate: boolean;
    participatesInCalculation: boolean;
  } {
    const hasFormulas = contents.some((c) => c.startsWith("="));
    const hasNumbers = contents.some((c) => !isNaN(Number(c)) && c !== "");
    const hasText = contents.some(
      (c) => isNaN(Number(c)) && !c.startsWith("=") && c !== ""
    );

    const hasInputs = hasNumbers && !hasFormulas;
    const hasOutputs = hasFormulas;
    const isIntermediate = hasFormulas && hasNumbers;
    const participatesInCalculation = hasFormulas || (hasNumbers && !hasText);

    return { hasInputs, hasOutputs, isIntermediate, participatesInCalculation };
  }

  // High-level semantic analysis methods

  private classifyPurpose(
    base: CellClusterBaseTraits,
    composite: CellClusterCompositeTraits,
    contents: string[]
  ): {
    primaryPurpose:
      | "data-storage"
      | "calculation"
      | "display"
      | "navigation"
      | "decoration"
      | "structure";
    secondaryPurposes: string[];
    confidence: number;
  } {
    let primaryPurpose:
      | "data-storage"
      | "calculation"
      | "display"
      | "navigation"
      | "decoration"
      | "structure";
    const secondaryPurposes: string[] = [];
    let confidence = 0.6;

    if (composite.isCalculation) {
      primaryPurpose = "calculation";
      confidence = 0.8;
    } else if (composite.isDataEntry) {
      primaryPurpose = "data-storage";
      confidence = 0.7;
    } else if (composite.isHeader || composite.isLabel) {
      primaryPurpose = "structure";
      confidence = 0.7;
    } else if (base.cellCount <= 3 && !composite.participatesInCalculation) {
      primaryPurpose = "decoration";
      confidence = 0.6;
    } else if (composite.hasTabularStructure) {
      primaryPurpose = "display";
      confidence = 0.7;
    } else {
      primaryPurpose = "data-storage";
      confidence = 0.5;
    }

    // Add secondary purposes
    if (composite.hasTabularStructure && primaryPurpose !== "display") {
      secondaryPurposes.push("display");
    }
    if (composite.isHeader && primaryPurpose !== "structure") {
      secondaryPurposes.push("structure");
    }

    return { primaryPurpose, secondaryPurposes, confidence };
  }

  private analyzeContentSemantics(
    contents: string[],
    base: CellClusterBaseTraits,
    composite: CellClusterCompositeTraits
  ): {
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
  } {
    // Simple heuristics for data type classification
    let likelyDataType:
      | "financial"
      | "personal"
      | "scientific"
      | "categorical"
      | "temporal"
      | "textual"
      | "mixed" = "mixed";

    const hasNumbers = composite.contentTypes.has("number");
    const hasText = composite.contentTypes.has("text");
    const hasFormulas = composite.contentTypes.has("formula");
    const hasDates = composite.contentTypes.has("date");

    if (hasDates) likelyDataType = "temporal";
    else if (hasNumbers && hasText) likelyDataType = "categorical";
    else if (hasNumbers && !hasText) likelyDataType = "financial";
    else if (hasText && !hasNumbers) likelyDataType = "textual";

    // Semantic role classification
    let semanticRole:
      | "header"
      | "data"
      | "summary"
      | "formula"
      | "constant"
      | "variable"
      | "mixed" = "mixed";

    if (composite.isHeader) semanticRole = "header";
    else if (hasFormulas) semanticRole = "formula";
    else if (composite.isDataEntry && !composite.participatesInCalculation)
      semanticRole = "constant";
    else if (composite.participatesInCalculation) semanticRole = "variable";
    else if (hasNumbers || hasText) semanticRole = "data";

    return { likelyDataType, semanticRole };
  }

  private analyzeUICharacteristics(
    base: CellClusterBaseTraits,
    composite: CellClusterCompositeTraits,
    contents: string[]
  ): {
    isInteractive: boolean;
    isReadOnly: boolean;
    requiresValidation: boolean;
    hasConstraints: boolean;
  } {
    const isInteractive = composite.isDataEntry && !composite.isCalculation;
    const isReadOnly = composite.isCalculation || composite.isHeader;
    const requiresValidation =
      composite.isDataEntry && composite.dominantContentType === "number";
    const hasConstraints =
      composite.isLookupTable || composite.hasSequentialData;

    return { isInteractive, isReadOnly, requiresValidation, hasConstraints };
  }

  private analyzeConstructIndicators(
    base: CellClusterBaseTraits,
    composite: CellClusterCompositeTraits
  ): {
    indicatesConstruct: string[];
    constructConfidence: number;
  } {
    const constructs: string[] = [];
    let confidence = 0.5;

    if (composite.hasTabularStructure && composite.isLookupTable) {
      constructs.push("table", "spreadsheet");
      confidence += 0.2;
    }

    if (composite.isDataEntry && !composite.hasTabularStructure) {
      constructs.push("form", "input-field");
      confidence += 0.15;
    }

    if (composite.isCalculation) {
      constructs.push("calculation-block", "formula-group");
      confidence += 0.15;
    }

    if (composite.isHeader || composite.isLabel) {
      constructs.push("label", "header-section");
      confidence += 0.1;
    }

    if (base.isLinear && composite.hasUniformContent) {
      constructs.push("list", "sequence");
      confidence += 0.1;
    }

    return {
      indicatesConstruct: constructs,
      constructConfidence: Math.min(confidence, 1.0),
    };
  }

  private analyzeBusinessLogic(
    contents: string[],
    composite: CellClusterCompositeTraits
  ): {
    hasBusinessLogic: boolean;
    isRuleBasedInput: boolean;
    isAuditableData: boolean;
    requiresBackup: boolean;
  } {
    const hasBusinessLogic = composite.isCalculation || composite.isLookupTable;
    const isRuleBasedInput =
      composite.isLookupTable || composite.hasSequentialData;
    const isAuditableData =
      composite.isDataEntry && composite.dominantContentType === "number";
    const requiresBackup = hasBusinessLogic || isAuditableData;

    return {
      hasBusinessLogic,
      isRuleBasedInput,
      isAuditableData,
      requiresBackup,
    };
  }

  private analyzeEvolutionCharacteristics(
    base: CellClusterBaseTraits,
    composite: CellClusterCompositeTraits,
    contents: string[]
  ): {
    isStable: boolean;
    isGrowthPoint: boolean;
    hasExtensionPotential: boolean;
    changeFrequency: "static" | "occasional" | "frequent" | "dynamic";
  } {
    const isStable =
      composite.isHeader || (composite.isCalculation && !composite.isDataEntry);
    const isGrowthPoint = composite.hasTabularStructure && base.isRectangular;
    const hasExtensionPotential =
      base.isLinear || (base.isRectangular && base.width > 3);

    let changeFrequency: "static" | "occasional" | "frequent" | "dynamic";
    if (composite.isHeader) changeFrequency = "static";
    else if (composite.isCalculation) changeFrequency = "dynamic";
    else if (composite.isDataEntry) changeFrequency = "frequent";
    else changeFrequency = "occasional";

    return { isStable, isGrowthPoint, hasExtensionPotential, changeFrequency };
  }

  private analyzeQualityAndMaintenance(
    base: CellClusterBaseTraits,
    composite: CellClusterCompositeTraits,
    contents: string[]
  ): {
    dataIntegrity: number;
    maintainabilityScore: number;
    complexity: "simple" | "moderate" | "complex" | "very-complex";
  } {
    const dataIntegrity = composite.dataQuality;

    let maintainabilityScore = 0.7;
    if (composite.hasConsistentFormatting) maintainabilityScore += 0.1;
    if (!composite.hasInconsistentTypes) maintainabilityScore += 0.1;
    if (base.isRectangular) maintainabilityScore += 0.1;

    maintainabilityScore = Math.min(maintainabilityScore, 1.0);

    let complexity: "simple" | "moderate" | "complex" | "very-complex";
    if (base.cellCount <= 5) complexity = "simple";
    else if (base.cellCount <= 20 && !composite.isCalculation)
      complexity = "moderate";
    else if (base.cellCount <= 50 || composite.isCalculation)
      complexity = "complex";
    else complexity = "very-complex";

    return { dataIntegrity, maintainabilityScore, complexity };
  }

  private analyzePerformanceImplications(
    contents: string[],
    composite: CellClusterCompositeTraits
  ): {
    computationComplexity: number;
    updateFrequency: number;
    cachingBenefit: number;
  } {
    const formulaCount = contents.filter((c) => c.startsWith("=")).length;
    const totalCells = contents.length;

    const computationComplexity =
      totalCells > 0 ? formulaCount / totalCells : 0;

    let updateFrequency = 0.3; // Base frequency
    if (composite.isDataEntry) updateFrequency = 0.8;
    else if (composite.isCalculation) updateFrequency = 0.9;
    else if (composite.isHeader) updateFrequency = 0.1;

    const cachingBenefit =
      composite.isCalculation && !composite.isDataEntry ? 0.8 : 0.3;

    return { computationComplexity, updateFrequency, cachingBenefit };
  }
}
