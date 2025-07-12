import CellCluster from "./CellCluster";
import {
  CellClusterTraits,
  CellClusterBaseTraits,
  CellClusterCompositeTraits,
  CellClusterDerivedTraits,
} from "./CellClusterTraits";
import GridModel from "../../1-substrate/GridModel";
import { 
  SpatialRelationshipTraits, 
  CornerAnalysis, 
  EdgeAnalysis, 
  ConnectivityAnalysis, 
  GrowthAnalysis, 
  IndentationAnalysis,
  Direction,
  GrowthPattern,
  ConnectivityPattern,
  CellPosition
} from "./SpatialRelationshipTraits";
import { 
  ContentPatternTraits,
  HierarchyAnalysis,
  StructureAnalysis,
  AlignmentAnalysis,
  ContentTypeAnalysis,
  TextualPatternAnalysis,
  SymbolAnalysis,
  HierarchyType,
  AlignmentType,
  ContentType
} from "./ContentPatternTraits";
import { 
  CellRoleTraits,
  TreeRoleAnalysis,
  TableRoleAnalysis,
  MatrixRoleAnalysis,
  KeyValueRoleAnalysis,
  RoleAssignment,
  CellRole
} from "./CellRoleTraits";
import { 
  ArrangementTraits,
  OrientationAnalysis,
  SpacingAnalysis,
  BoundaryAnalysis,
  FlowAnalysis,
  SymmetryAnalysis,
  GridAlignmentAnalysis,
  OrientationType,
  SpacingType,
  BoundaryType,
  FlowDirection
} from "./ArrangementTraits";

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
    
    // Parse enhanced trait categories
    const spatial = this.parseSpatialRelationshipTraits(cluster);
    const content = this.parseContentPatternTraits(cluster);
    const arrangement = this.parseArrangementTraits(cluster, spatial);
    const roles = this.parseCellRoleTraits(cluster, spatial, content, arrangement);

    return { 
      base, 
      composite, 
      derived,
      spatial,
      content,
      arrangement,
      roles
    };
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
    const contentTypes = this.getSimpleContentTypes(cellContents);
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

  private getSimpleContentTypes(contents: string[]): Set<string> {
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
      const types = this.getSimpleContentTypes(nonEmptyContents);
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

  // =====================================================================
  // Enhanced Trait Parsing Methods
  // =====================================================================

  /**
   * Parse spatial relationship traits for detailed construct detection
   */
  private parseSpatialRelationshipTraits(cluster: CellCluster): SpatialRelationshipTraits {
    const corners = this.analyzeCorners(cluster);
    const edges = this.analyzeEdges(cluster);
    const connectivity = this.analyzeConnectivity(cluster);
    const growth = this.analyzeGrowth(cluster);
    const indentation = this.analyzeIndentation(cluster);

    // Calculate overall spatial coherence
    const spatialCoherence = this.calculateSpatialCoherence(corners, edges, connectivity, growth);
    
    // Determine if cluster shows structural organization
    const hasStructuralOrganization = connectivity.hasParentChildRelationships || 
                                     connectivity.hasPeerRelationships ||
                                     edges.fullyFilledEdges.length > 0;
    
    // Determine dominant pattern
    const dominantPattern = this.determineDominantSpatialPattern(connectivity, growth, edges);
    
    // Calculate analysis confidence
    const analysisConfidence = (
      connectivity.connectivityPattern !== ConnectivityPattern.Scattered ? 0.3 : 0.0 +
      growth.primaryDirectionConfidence * 0.3 +
      spatialCoherence * 0.4
    );

    return {
      corners,
      edges,
      connectivity,
      growth,
      indentation,
      spatialCoherence,
      hasStructuralOrganization,
      dominantPattern,
      analysisConfidence
    };
  }

  /**
   * Analyze corner cells and patterns
   */
  private analyzeCorners(cluster: CellCluster): CornerAnalysis {
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;
    
    // Check each corner
    const topLeft = this.isCellFilled(cluster.topRow, cluster.leftCol);
    const topRight = this.isCellFilled(cluster.topRow, cluster.rightCol);
    const bottomLeft = this.isCellFilled(cluster.bottomRow, cluster.leftCol);
    const bottomRight = this.isCellFilled(cluster.bottomRow, cluster.rightCol);
    
    // Get corner contents
    const topLeftContent = topLeft ? this.grid.getCellRaw(cluster.topRow, cluster.leftCol) : "";
    const topRightContent = topRight ? this.grid.getCellRaw(cluster.topRow, cluster.rightCol) : "";
    const bottomLeftContent = bottomLeft ? this.grid.getCellRaw(cluster.bottomRow, cluster.leftCol) : "";
    const bottomRightContent = bottomRight ? this.grid.getCellRaw(cluster.bottomRow, cluster.rightCol) : "";
    
    const filledCornerCount = [topLeft, topRight, bottomLeft, bottomRight].filter(Boolean).length;
    const emptyCornerCount = 4 - filledCornerCount;
    
    // Determine primary corner (likely origin)
    let primaryCorner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | undefined;
    if (topLeft && !topRight && !bottomLeft) primaryCorner = "topLeft";
    else if (topRight && !topLeft && !bottomRight) primaryCorner = "topRight";
    else if (bottomLeft && !topLeft && !bottomRight) primaryCorner = "bottomLeft";
    else if (bottomRight && !topRight && !bottomLeft) primaryCorner = "bottomRight";
    
    return {
      topLeft: { 
        filled: topLeft, 
        content: topLeftContent,
        isEmpty: !topLeft && this.isCellInBounds(cluster.topRow, cluster.leftCol)
      },
      topRight: { 
        filled: topRight, 
        content: topRightContent,
        isEmpty: !topRight && this.isCellInBounds(cluster.topRow, cluster.rightCol)
      },
      bottomLeft: { 
        filled: bottomLeft, 
        content: bottomLeftContent,
        isEmpty: !bottomLeft && this.isCellInBounds(cluster.bottomRow, cluster.leftCol)
      },
      bottomRight: { 
        filled: bottomRight, 
        content: bottomRightContent,
        isEmpty: !bottomRight && this.isCellInBounds(cluster.bottomRow, cluster.rightCol)
      },
      filledCornerCount,
      emptyCornerCount,
      primaryCorner
    };
  }

  /**
   * Analyze edge patterns and density
   */
  private analyzeEdges(cluster: CellCluster): EdgeAnalysis {
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;
    
    // Analyze each edge
    const top = this.analyzeEdgePattern(cluster, "top");
    const bottom = this.analyzeEdgePattern(cluster, "bottom");
    const left = this.analyzeEdgePattern(cluster, "left");
    const right = this.analyzeEdgePattern(cluster, "right");
    
    const fullyFilledEdges: Array<"top" | "bottom" | "left" | "right"> = [];
    if (top.isFullyFilled) fullyFilledEdges.push("top");
    if (bottom.isFullyFilled) fullyFilledEdges.push("bottom");
    if (left.isFullyFilled) fullyFilledEdges.push("left");
    if (right.isFullyFilled) fullyFilledEdges.push("right");
    
    const regularEdges: Array<"top" | "bottom" | "left" | "right"> = [];
    if (!top.hasGaps && top.density > 0.5) regularEdges.push("top");
    if (!bottom.hasGaps && bottom.density > 0.5) regularEdges.push("bottom");
    if (!left.hasGaps && left.density > 0.5) regularEdges.push("left");
    if (!right.hasGaps && right.density > 0.5) regularEdges.push("right");
    
    return {
      top,
      bottom,
      left,
      right,
      fullyFilledEdges,
      regularEdges
    };
  }

  /**
   * Analyze edge pattern for a specific side
   */
  private analyzeEdgePattern(
    cluster: CellCluster, 
    edge: "top" | "bottom" | "left" | "right"
  ): {
    fillPattern: string;
    density: number;
    hasGaps: boolean;
    isFullyFilled: boolean;
    firstFilledIndex?: number;
    lastFilledIndex?: number;
  } {
    let cells: boolean[] = [];
    
    if (edge === "top") {
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        cells.push(this.isCellFilled(cluster.topRow, col));
      }
    } else if (edge === "bottom") {
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        cells.push(this.isCellFilled(cluster.bottomRow, col));
      }
    } else if (edge === "left") {
      for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
        cells.push(this.isCellFilled(row, cluster.leftCol));
      }
    } else { // right
      for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
        cells.push(this.isCellFilled(row, cluster.rightCol));
      }
    }
    
    const fillPattern = cells.map(c => c ? "1" : "0").join("");
    const filledCount = cells.filter(Boolean).length;
    const density = cells.length > 0 ? filledCount / cells.length : 0;
    const hasGaps = fillPattern.includes("0");
    const isFullyFilled = density === 1.0;
    
    const firstFilledIndex = cells.findIndex(c => c);
    const lastFilledIndex = cells.map((c, i) => c ? i : -1).filter(i => i >= 0).pop();
    
    return {
      fillPattern,
      density,
      hasGaps,
      isFullyFilled,
      firstFilledIndex: firstFilledIndex >= 0 ? firstFilledIndex : undefined,
      lastFilledIndex
    };
  }

  /**
   * Analyze cell connectivity and relationships
   */
  private analyzeConnectivity(cluster: CellCluster): ConnectivityAnalysis {
    const filledPositions = cluster.filledPoints.map(p => ({ row: p.row, col: p.col }));
    
    // Find potential parent-child relationships
    const parentChildPairs = this.findParentChildRelationships(filledPositions);
    const hasParentChildRelationships = parentChildPairs.length > 0;
    
    // Find peer relationships (cells at same indentation level)
    const peerGroups = this.findPeerGroups(filledPositions);
    const hasPeerRelationships = peerGroups.some(group => group.length > 1);
    
    // Calculate depth and branching
    const maxDepth = this.calculateMaxDepth(filledPositions, parentChildPairs);
    const branchingFactor = this.calculateBranchingFactor(parentChildPairs);
    
    // Determine connectivity pattern
    const connectivityPattern = this.determineConnectivityPattern(
      filledPositions, 
      parentChildPairs, 
      peerGroups
    );
    
    // Find potential root cells (corners or isolated cells)
    const potentialRootCells = this.findPotentialRootCells(cluster, filledPositions);
    
    // Identify parent and child cells
    const potentialParentCells = this.findPotentialParentCells(filledPositions, parentChildPairs);
    const potentialChildCells = this.findPotentialChildCells(filledPositions, parentChildPairs);
    
    return {
      hasParentChildRelationships,
      hasPeerRelationships,
      maxDepth,
      branchingFactor,
      connectivityPattern,
      potentialRootCells,
      potentialParentCells,
      potentialChildCells,
      peerGroups
    };
  }

  /**
   * Helper method to check if a cell is filled
   */
  private isCellFilled(row: number, col: number): boolean {
    const content = this.grid.getCellRaw(row, col);
    return content.trim() !== "";
  }

  /**
   * Helper method to check if a cell position is within grid bounds
   */
  private isCellInBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.grid.rowCount && 
           col >= 0 && col < this.grid.columnCount;
  }

  /**
   * Find parent-child relationships in filled positions
   */
  private findParentChildRelationships(positions: CellPosition[]): Array<{
    parent: CellPosition;
    child: CellPosition;
  }> {
    const relationships: Array<{ parent: CellPosition; child: CellPosition }> = [];
    
    for (const pos of positions) {
      // Check for children in primary directions (down, right)
      const potentialChildren = [
        { row: pos.row + 1, col: pos.col + 1 }, // down-right
        { row: pos.row + 1, col: pos.col },     // down
        { row: pos.row, col: pos.col + 1 },     // right
      ];
      
      for (const childPos of potentialChildren) {
        if (positions.some(p => p.row === childPos.row && p.col === childPos.col)) {
          relationships.push({ parent: pos, child: childPos });
        }
      }
    }
    
    return relationships;
  }

  /**
   * Find peer groups (cells at same hierarchical level)
   */
  private findPeerGroups(positions: CellPosition[]): CellPosition[][] {
    // Group cells by column (for vertical trees) or row (for horizontal trees)
    const columnGroups = new Map<number, CellPosition[]>();
    const rowGroups = new Map<number, CellPosition[]>();
    
    for (const pos of positions) {
      // Group by column
      if (!columnGroups.has(pos.col)) {
        columnGroups.set(pos.col, []);
      }
      columnGroups.get(pos.col)!.push(pos);
      
      // Group by row
      if (!rowGroups.has(pos.row)) {
        rowGroups.set(pos.row, []);
      }
      rowGroups.get(pos.row)!.push(pos);
    }
    
    // Return groups with more than one cell
    const peerGroups: CellPosition[][] = [];
    
    // Add column groups (for vertical trees)
    for (const group of columnGroups.values()) {
      if (group.length > 1) {
        peerGroups.push(group.sort((a, b) => a.row - b.row));
      }
    }
    
    return peerGroups;
  }

  // Additional helper methods would be implemented here...
  // For brevity, I'll implement key methods and leave placeholders for others

  private calculateMaxDepth(positions: CellPosition[], relationships: Array<{parent: CellPosition; child: CellPosition}>): number {
    // Simplified depth calculation
    return Math.min(Math.max(...positions.map(p => p.row)) - Math.min(...positions.map(p => p.row)), 5);
  }

  private calculateBranchingFactor(relationships: Array<{parent: CellPosition; child: CellPosition}>): number {
    if (relationships.length === 0) return 0;
    
    const parentCounts = new Map<string, number>();
    for (const rel of relationships) {
      const key = `${rel.parent.row},${rel.parent.col}`;
      parentCounts.set(key, (parentCounts.get(key) || 0) + 1);
    }
    
    const counts = Array.from(parentCounts.values());
    return counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
  }

  private determineConnectivityPattern(
    positions: CellPosition[], 
    relationships: Array<{parent: CellPosition; child: CellPosition}>,
    peerGroups: CellPosition[][]
  ): ConnectivityPattern {
    if (relationships.length > 0 && peerGroups.length > 0) {
      return ConnectivityPattern.Tree;
    } else if (positions.length > 4 && this.isRectangularPattern(positions)) {
      return ConnectivityPattern.Grid;
    } else if (this.isLinearPattern(positions)) {
      return ConnectivityPattern.Linear;
    } else {
      return ConnectivityPattern.Scattered;
    }
  }


  private isLinearPattern(positions: CellPosition[]): boolean {
    const rows = new Set(positions.map(p => p.row));
    const cols = new Set(positions.map(p => p.col));
    return rows.size === 1 || cols.size === 1;
  }

  private findPotentialRootCells(cluster: CellCluster, positions: CellPosition[]): CellPosition[] {
    // Look for corner cells as potential roots
    const corners = [
      { row: cluster.topRow, col: cluster.leftCol },
      { row: cluster.topRow, col: cluster.rightCol },
      { row: cluster.bottomRow, col: cluster.leftCol },
      { row: cluster.bottomRow, col: cluster.rightCol }
    ];
    
    return corners.filter(corner => 
      positions.some(p => p.row === corner.row && p.col === corner.col)
    );
  }

  private findPotentialParentCells(positions: CellPosition[], relationships: Array<{parent: CellPosition; child: CellPosition}>): CellPosition[] {
    const parentSet = new Set<string>();
    for (const rel of relationships) {
      parentSet.add(`${rel.parent.row},${rel.parent.col}`);
    }
    
    return positions.filter(p => parentSet.has(`${p.row},${p.col}`));
  }

  private findPotentialChildCells(positions: CellPosition[], relationships: Array<{parent: CellPosition; child: CellPosition}>): CellPosition[] {
    const childSet = new Set<string>();
    for (const rel of relationships) {
      childSet.add(`${rel.child.row},${rel.child.col}`);
    }
    
    return positions.filter(p => childSet.has(`${p.row},${p.col}`));
  }

  private analyzeGrowth(cluster: CellCluster): GrowthAnalysis {
    // Simplified growth analysis
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;
    
    let primaryDirection: Direction;
    let primaryDirectionConfidence: number;
    
    if (height > width) {
      primaryDirection = Direction.Down;
      primaryDirectionConfidence = Math.min((height / width) / 2, 1.0);
    } else if (width > height) {
      primaryDirection = Direction.Right;
      primaryDirectionConfidence = Math.min((width / height) / 2, 1.0);
    } else {
      primaryDirection = Direction.Down; // Default
      primaryDirectionConfidence = 0.5;
    }
    
    const secondaryDirection = primaryDirection === Direction.Down ? Direction.Right : Direction.Down;
    
    return {
      primaryDirection,
      secondaryDirection,
      growthPattern: width === 1 || height === 1 ? GrowthPattern.Linear : GrowthPattern.Expanding,
      primaryDirectionConfidence,
      hasConsistentGrowth: primaryDirectionConfidence > 0.7,
      growthOrigins: [{ row: cluster.topRow, col: cluster.leftCol }],
      growthTerminals: [{ row: cluster.bottomRow, col: cluster.rightCol }]
    };
  }

  private analyzeIndentation(cluster: CellCluster): IndentationAnalysis {
    // Simplified indentation analysis
    const positions = cluster.filledPoints;
    const columns = positions.map(p => p.col);
    const uniqueColumns = [...new Set(columns)].sort((a, b) => a - b);
    
    const hasConsistentIndentation = uniqueColumns.length > 1;
    const indentationLevels = uniqueColumns.length;
    const maxIndentation = Math.max(...uniqueColumns) - Math.min(...uniqueColumns);
    
    const cellsByIndentationLevel = new Map<number, CellPosition[]>();
    for (const pos of positions) {
      const level = uniqueColumns.indexOf(pos.col);
      if (!cellsByIndentationLevel.has(level)) {
        cellsByIndentationLevel.set(level, []);
      }
      cellsByIndentationLevel.get(level)!.push(pos);
    }
    
    return {
      hasConsistentIndentation,
      indentationLevels,
      maxIndentation,
      indentationDirection: Direction.Right,
      cellsByIndentationLevel,
      followsTreePattern: hasConsistentIndentation && indentationLevels > 1,
      followsListPattern: indentationLevels === 1
    };
  }

  private calculateSpatialCoherence(
    corners: CornerAnalysis, 
    edges: EdgeAnalysis, 
    connectivity: ConnectivityAnalysis, 
    growth: GrowthAnalysis
  ): number {
    let coherence = 0.0;
    
    // Coherence from corners
    if (corners.primaryCorner) coherence += 0.2;
    
    // Coherence from edges
    coherence += edges.fullyFilledEdges.length * 0.1;
    
    // Coherence from connectivity
    if (connectivity.hasParentChildRelationships) coherence += 0.3;
    if (connectivity.hasPeerRelationships) coherence += 0.2;
    
    // Coherence from growth
    coherence += growth.primaryDirectionConfidence * 0.2;
    
    return Math.min(coherence, 1.0);
  }

  private determineDominantSpatialPattern(
    connectivity: ConnectivityAnalysis, 
    growth: GrowthAnalysis, 
    edges: EdgeAnalysis
  ): "tree" | "table" | "matrix" | "list" | "scattered" | "mixed" {
    if (connectivity.connectivityPattern === ConnectivityPattern.Tree) {
      return "tree";
    } else if (connectivity.connectivityPattern === ConnectivityPattern.Grid) {
      return "table";
    } else if (growth.growthPattern === GrowthPattern.Linear) {
      return "list";
    } else {
      return "scattered";
    }
  }

  /**
   * Parse content pattern traits for detailed content analysis
   */
  private parseContentPatternTraits(cluster: CellCluster): ContentPatternTraits {
    const cellContents = cluster.filledPoints.map(p => 
      this.grid.getCellRaw(p.row, p.col).trim()
    );
    
    const hierarchy = this.analyzeHierarchy(cluster, cellContents);
    const structure = this.analyzeStructure(cluster, cellContents);
    const alignment = this.analyzeAlignment(cluster, cellContents);
    const contentTypes = this.analyzeContentTypes(cluster, cellContents);
    const textualPatterns = this.analyzeTextualPatterns(cellContents);
    const symbols = this.analyzeSymbols(cellContents);
    
    // Calculate overall content coherence
    const contentCoherence = this.calculateContentCoherence(
      hierarchy, structure, alignment, contentTypes
    );
    
    // Determine if content has identifiable patterns
    const hasIdentifiablePatterns = 
      hierarchy.hierarchyConfidence > 0.5 ||
      structure.structureConfidence > 0.5 ||
      contentTypes.contentTypeConfidence > 0.7;
    
    // Determine primary pattern type
    const primaryPatternType = this.determinePrimaryContentPattern(
      hierarchy, structure, contentTypes
    );
    
    // Calculate analysis confidence
    const analysisConfidence = Math.max(
      hierarchy.hierarchyConfidence,
      structure.structureConfidence,
      contentTypes.contentTypeConfidence
    );
    
    // Suggest construct types based on content patterns
    const suggestedConstructs = this.suggestConstructsFromContent(
      hierarchy, structure, contentTypes, symbols
    );
    
    return {
      hierarchy,
      structure,
      alignment,
      contentTypes,
      textualPatterns,
      symbols,
      contentCoherence,
      hasIdentifiablePatterns,
      primaryPatternType,
      analysisConfidence,
      suggestedConstructs
    };
  }

  /**
   * Analyze hierarchy indicators in SPATIAL PATTERNS (not content)
   * This analyzes the binary (filled/empty) spatial arrangement
   */
  private analyzeHierarchy(cluster: CellCluster, contents: string[]): HierarchyAnalysis {
    const positions = cluster.filledPoints;
    
    // Check for consistent SPATIAL indentation (based on position, not content)
    const indentationData = this.detectSpatialIndentationPattern(cluster);
    const hasConsistentIndentation = indentationData.isConsistent;
    
    // Analyze SPATIAL hierarchy patterns (binary position-based)
    const spatialHierarchyData = this.analyzeSpatialHierarchyPatterns(cluster);
    
    // These will be detected from CONTENT later, but hierarchy structure is spatial
    const hasNumberedHierarchy = false; // Content analysis - moved to later stage
    const hasLetterHierarchy = false;   // Content analysis - moved to later stage  
    const hasRomanHierarchy = false;    // Content analysis - moved to later stage
    const hasBulletPoints = false;      // Content analysis - moved to later stage
    const hasTreeSymbols = false;       // Content analysis - moved to later stage
    const hasDashHierarchy = false;     // Content analysis - moved to later stage
    
    // Determine maximum indentation level
    const maxIndentationLevel = indentationData.maxLevel;
    
    // Determine primary hierarchy type
    const primaryHierarchyType = this.determinePrimaryHierarchyType({
      hasNumberedHierarchy,
      hasLetterHierarchy,
      hasRomanHierarchy,
      hasBulletPoints,
      hasTreeSymbols,
      hasDashHierarchy,
      hasConsistentIndentation
    });
    
    // Group cells by hierarchy level
    const cellsByLevel = this.groupCellsByHierarchyLevel(cluster, indentationData);
    
    // Check if SPATIAL arrangement follows tree or list structure
    const followsTreeStructure = spatialHierarchyData.hasParentChildSpatialPattern && 
                                spatialHierarchyData.hasPeerSpatialPattern &&
                                hasConsistentIndentation && maxIndentationLevel > 1;
    const followsListStructure = !spatialHierarchyData.hasParentChildSpatialPattern && 
                               spatialHierarchyData.hasPeerSpatialPattern &&
                               maxIndentationLevel <= 1;
    
    // Calculate hierarchy confidence
    const hierarchyConfidence = this.calculateHierarchyConfidence({
      hasConsistentIndentation,
      hasNumberedHierarchy,
      hasLetterHierarchy,
      hasBulletPoints,
      hasTreeSymbols,
      followsTreeStructure,
      followsListStructure
    });
    
    return {
      hasConsistentIndentation,
      hasNumberedHierarchy,
      hasLetterHierarchy,
      hasRomanHierarchy,
      hasBulletPoints,
      hasTreeSymbols,
      hasDashHierarchy,
      maxIndentationLevel,
      primaryHierarchyType,
      cellsByLevel,
      followsTreeStructure,
      followsListStructure,
      hierarchyConfidence
    };
  }

  /**
   * Detect SPATIAL indentation patterns (binary position-based, not content-based)
   */
  private detectSpatialIndentationPattern(cluster: CellCluster): {
    isConsistent: boolean;
    maxLevel: number;
    levelsByPosition: Map<string, number>;
  } {
    const positions = cluster.filledPoints;
    const levelsByPosition = new Map<string, number>();
    
    // For vertical arrangements, use column position as indentation
    // For horizontal arrangements, use row position as indentation
    const isVertical = (cluster.bottomRow - cluster.topRow) > (cluster.rightCol - cluster.leftCol);
    
    if (isVertical) {
      const minCol = Math.min(...positions.map(p => p.col));
      for (const pos of positions) {
        const level = pos.col - minCol;
        levelsByPosition.set(`${pos.row},${pos.col}`, level);
      }
    } else {
      const minRow = Math.min(...positions.map(p => p.row));
      for (const pos of positions) {
        const level = pos.row - minRow;
        levelsByPosition.set(`${pos.row},${pos.col}`, level);
      }
    }
    
    const levels = Array.from(levelsByPosition.values());
    const uniqueLevels = [...new Set(levels)].sort((a, b) => a - b);
    const maxLevel = Math.max(...levels);
    
    // Check if spatial indentation is consistent (logical progression)
    const isConsistent = uniqueLevels.length > 1 && 
                        uniqueLevels.every((level, index) => index === 0 || level > uniqueLevels[index - 1]);
    
    return {
      isConsistent,
      maxLevel,
      levelsByPosition
    };
  }

  /**
   * Analyze spatial hierarchy patterns from binary cell positions
   * This is the core of Binary Spatial Semantics - analyzing filled vs empty patterns
   */
  private analyzeSpatialHierarchyPatterns(cluster: CellCluster): {
    hasParentChildSpatialPattern: boolean;
    hasPeerSpatialPattern: boolean;
    hasHeaderSpatialPattern: boolean;
    spatialTreeLikeness: number;
  } {
    const positions = cluster.filledPoints;
    
    // Detect parent-child spatial relationships
    // Example: 100
    //          010  <- child is down+right from parent
    //          000
    const parentChildPairs = this.findSpatialParentChildPairs(positions);
    const hasParentChildSpatialPattern = parentChildPairs.length > 0;
    
    // Detect peer spatial relationships  
    // Example: 100
    //          000
    //          100  <- peers are in same column (or row)
    const peerGroups = this.findSpatialPeerGroups(positions);
    const hasPeerSpatialPattern = peerGroups.some(group => group.length > 1);
    
    // Detect header spatial patterns
    // Example: 110  <- header above peers
    //          100
    //          100
    const hasHeaderSpatialPattern = this.detectSpatialHeaderPattern(cluster, positions);
    
    // Calculate how tree-like the spatial pattern is
    let spatialTreeLikeness = 0.0;
    if (hasParentChildSpatialPattern) spatialTreeLikeness += 0.4;
    if (hasPeerSpatialPattern) spatialTreeLikeness += 0.3;
    if (hasHeaderSpatialPattern) spatialTreeLikeness += 0.2;
    if (positions.length > 2 && this.hasConsistentSpatialDirection(positions)) spatialTreeLikeness += 0.1;
    
    return {
      hasParentChildSpatialPattern,
      hasPeerSpatialPattern,
      hasHeaderSpatialPattern,
      spatialTreeLikeness: Math.min(spatialTreeLikeness, 1.0)
    };
  }

  /**
   * Find spatial parent-child pairs based on binary position patterns
   */
  private findSpatialParentChildPairs(positions: CellPosition[]): Array<{
    parent: CellPosition;
    child: CellPosition;
  }> {
    const pairs: Array<{ parent: CellPosition; child: CellPosition }> = [];
    
    for (const parent of positions) {
      // Check for children in typical tree directions:
      // - Down+Right (most common): parent at (0,0), child at (1,1)
      // - Down only: parent at (0,0), child at (1,0)  
      // - Right only: parent at (0,0), child at (0,1)
      const potentialChildren = [
        { row: parent.row + 1, col: parent.col + 1 }, // down-right (typical tree)
        { row: parent.row + 1, col: parent.col },     // down
        { row: parent.row, col: parent.col + 1 },     // right
        { row: parent.row - 1, col: parent.col + 1 }, // up-right (alternative orientation)
        { row: parent.row + 1, col: parent.col - 1 }, // down-left (alternative orientation)
      ];
      
      for (const childPos of potentialChildren) {
        if (positions.some(p => p.row === childPos.row && p.col === childPos.col)) {
          pairs.push({ parent, child: childPos });
        }
      }
    }
    
    return pairs;
  }

  /**
   * Find spatial peer groups (cells at same hierarchical level)
   */
  private findSpatialPeerGroups(positions: CellPosition[]): CellPosition[][] {
    // Group cells by column (for vertical trees) and by row (for horizontal trees)
    const columnGroups = new Map<number, CellPosition[]>();
    const rowGroups = new Map<number, CellPosition[]>();
    
    for (const pos of positions) {
      // Group by column (peers in vertical trees)
      if (!columnGroups.has(pos.col)) {
        columnGroups.set(pos.col, []);
      }
      columnGroups.get(pos.col)!.push(pos);
      
      // Group by row (peers in horizontal trees)
      if (!rowGroups.has(pos.row)) {
        rowGroups.set(pos.row, []);
      }
      rowGroups.get(pos.row)!.push(pos);
    }
    
    const peerGroups: CellPosition[][] = [];
    
    // Add column groups with multiple cells (vertical tree peers)
    for (const group of columnGroups.values()) {
      if (group.length > 1) {
        peerGroups.push(group.sort((a, b) => a.row - b.row));
      }
    }
    
    // Add row groups with multiple cells (horizontal tree peers)  
    for (const group of rowGroups.values()) {
      if (group.length > 1) {
        peerGroups.push(group.sort((a, b) => a.col - b.col));
      }
    }
    
    return peerGroups;
  }

  /**
   * Detect spatial header patterns
   */
  private detectSpatialHeaderPattern(cluster: CellCluster, positions: CellPosition[]): boolean {
    // Look for filled cells above or to the left of peer groups
    // Example: Header cell above a column of peers
    const peerGroups = this.findSpatialPeerGroups(positions);
    
    for (const peerGroup of peerGroups) {
      if (peerGroup.length < 2) continue;
      
      // Check if there's a header cell above this peer group
      const firstPeer = peerGroup[0];
      const potentialHeaderAbove = { row: firstPeer.row - 1, col: firstPeer.col };
      const potentialHeaderLeft = { row: firstPeer.row, col: firstPeer.col - 1 };
      
      const hasHeaderAbove = positions.some(p => 
        p.row === potentialHeaderAbove.row && p.col === potentialHeaderAbove.col
      );
      const hasHeaderLeft = positions.some(p => 
        p.row === potentialHeaderLeft.row && p.col === potentialHeaderLeft.col
      );
      
      if (hasHeaderAbove || hasHeaderLeft) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if positions follow a consistent spatial direction
   */
  private hasConsistentSpatialDirection(positions: CellPosition[]): boolean {
    if (positions.length < 3) return false;
    
    const sortedPositions = [...positions].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });
    
    // Check if there's a consistent direction pattern
    let consistentDown = 0;
    let consistentRight = 0;
    
    for (let i = 1; i < sortedPositions.length; i++) {
      const prev = sortedPositions[i - 1];
      const curr = sortedPositions[i];
      
      if (curr.row > prev.row) consistentDown++;
      if (curr.col > prev.col) consistentRight++;
    }
    
    const total = sortedPositions.length - 1;
    return (consistentDown / total > 0.6) || (consistentRight / total > 0.6);
  }

  /**
   * Detect numbered hierarchy patterns (1., 1.1, 1.1.1, etc.)
   */
  private detectNumberedHierarchy(contents: string[]): boolean {
    const numberedPatterns = [
      /^\d+\./,           // 1., 2., 3.
      /^\d+\.\d+/,        // 1.1, 1.2, 2.1
      /^\d+\.\d+\.\d+/,   // 1.1.1, 1.2.1
      /^\(\d+\)/,         // (1), (2), (3)
      /^\d+\)/            // 1), 2), 3)
    ];
    
    const matchCount = contents.filter(content => 
      numberedPatterns.some(pattern => pattern.test(content))
    ).length;
    
    return matchCount >= 2 && matchCount / contents.length > 0.3;
  }

  /**
   * Detect letter hierarchy patterns (a., b., c., A., B., C.)
   */
  private detectLetterHierarchy(contents: string[]): boolean {
    const letterPatterns = [
      /^[a-z]\./,         // a., b., c.
      /^[A-Z]\./,         // A., B., C.
      /^\([a-z]\)/,       // (a), (b), (c)
      /^\([A-Z]\)/,       // (A), (B), (C)
      /^[a-z]\)/,         // a), b), c)
      /^[A-Z]\)/          // A), B), C)
    ];
    
    const matchCount = contents.filter(content => 
      letterPatterns.some(pattern => pattern.test(content))
    ).length;
    
    return matchCount >= 2 && matchCount / contents.length > 0.3;
  }

  /**
   * Detect Roman numeral hierarchy patterns
   */
  private detectRomanHierarchy(contents: string[]): boolean {
    const romanPatterns = [
      /^[ivxlcdm]+\./i,   // i., ii., iii., iv., v., etc.
      /^\([ivxlcdm]+\)/i, // (i), (ii), (iii), etc.
      /^[ivxlcdm]+\)/i    // i), ii), iii), etc.
    ];
    
    const matchCount = contents.filter(content => 
      romanPatterns.some(pattern => pattern.test(content))
    ).length;
    
    return matchCount >= 2 && matchCount / contents.length > 0.3;
  }

  /**
   * Detect bullet point patterns
   */
  private detectBulletPoints(contents: string[]): boolean {
    const bulletPatterns = [
      /^[•◦▪▫▸▹►‣⁃]/,     // Various bullet symbols
      /^[-*+]/,            // Dash, asterisk, plus
      /^>\s/,              // Greater than (quote style)
      /^\*\s/              // Asterisk with space
    ];
    
    const matchCount = contents.filter(content => 
      bulletPatterns.some(pattern => pattern.test(content))
    ).length;
    
    return matchCount >= 2 && matchCount / contents.length > 0.4;
  }

  /**
   * Detect tree drawing symbols
   */
  private detectTreeSymbols(contents: string[]): boolean {
    const treePatterns = [
      /[├└│─┌┐┘┤┬┴┼]/,    // Box drawing characters
      /[╔╗╚╝║═╠╣╦╩╬]/,    // Double line box drawing
      /[▲▼◄►]/             // Arrow symbols
    ];
    
    const matchCount = contents.filter(content => 
      treePatterns.some(pattern => pattern.test(content))
    ).length;
    
    return matchCount >= 1 && matchCount / contents.length > 0.2;
  }

  /**
   * Detect dash hierarchy patterns
   */
  private detectDashHierarchy(contents: string[]): boolean {
    const dashCounts = contents.map(content => {
      const match = content.match(/^(-+)\s/);
      return match ? match[1].length : 0;
    }).filter(count => count > 0);
    
    const uniqueCounts = [...new Set(dashCounts)];
    return uniqueCounts.length > 1 && dashCounts.length >= 2;
  }

  /**
   * Determine the primary hierarchy type
   */
  private determinePrimaryHierarchyType(indicators: {
    hasNumberedHierarchy: boolean;
    hasLetterHierarchy: boolean;
    hasRomanHierarchy: boolean;
    hasBulletPoints: boolean;
    hasTreeSymbols: boolean;
    hasDashHierarchy: boolean;
    hasConsistentIndentation: boolean;
  }): HierarchyType {
    if (indicators.hasTreeSymbols) return HierarchyType.TreeSymbols;
    if (indicators.hasNumberedHierarchy) return HierarchyType.Numbered;
    if (indicators.hasBulletPoints) return HierarchyType.Bullets;
    if (indicators.hasLetterHierarchy) return HierarchyType.Lettered;
    if (indicators.hasRomanHierarchy) return HierarchyType.Roman;
    if (indicators.hasDashHierarchy) return HierarchyType.Dashes;
    if (indicators.hasConsistentIndentation) return HierarchyType.Indentation;
    return HierarchyType.None;
  }

  /**
   * Group cells by hierarchy level
   */
  private groupCellsByHierarchyLevel(
    cluster: CellCluster, 
    indentationData: { levelsByPosition: Map<string, number> }
  ): Map<number, CellPosition[]> {
    const cellsByLevel = new Map<number, CellPosition[]>();
    
    for (const pos of cluster.filledPoints) {
      const key = `${pos.row},${pos.col}`;
      const level = indentationData.levelsByPosition.get(key) || 0;
      
      if (!cellsByLevel.has(level)) {
        cellsByLevel.set(level, []);
      }
      cellsByLevel.get(level)!.push(pos);
    }
    
    return cellsByLevel;
  }

  /**
   * Calculate hierarchy detection confidence
   */
  private calculateHierarchyConfidence(indicators: {
    hasConsistentIndentation: boolean;
    hasNumberedHierarchy: boolean;
    hasLetterHierarchy: boolean;
    hasBulletPoints: boolean;
    hasTreeSymbols: boolean;
    followsTreeStructure: boolean;
    followsListStructure: boolean;
  }): number {
    let confidence = 0.0;
    
    if (indicators.hasTreeSymbols) confidence += 0.4;
    if (indicators.hasNumberedHierarchy) confidence += 0.3;
    if (indicators.hasBulletPoints) confidence += 0.25;
    if (indicators.hasConsistentIndentation) confidence += 0.2;
    if (indicators.followsTreeStructure) confidence += 0.2;
    if (indicators.followsListStructure) confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Analyze structural SPATIAL patterns (binary position-based)
   */
  private analyzeStructure(cluster: CellCluster, contents: string[]): StructureAnalysis {
    const positions = cluster.filledPoints;
    
    // Check for SPATIAL header patterns (based on position, not content)
    const hasHeaderRow = this.detectSpatialHeaderRow(cluster);
    const hasHeaderColumn = this.detectSpatialHeaderColumn(cluster);
    
    // Check for consistent column types (table indicator)
    const hasConsistentColumnTypes = this.detectConsistentColumnTypes(cluster, contents);
    
    // Check for key-value pairs
    const hasKeyValuePairs = this.detectKeyValuePairs(cluster, contents);
    
    // Check for empty corner cell (matrix indicator)
    const hasEmptyCornerCell = this.detectEmptyCornerCell(cluster);
    
    // Determine structure patterns
    const followsTableStructure = hasConsistentColumnTypes && 
                                 (hasHeaderRow || hasHeaderColumn) &&
                                 this.isRectangularPattern(positions);
    
    const followsMatrixStructure = hasEmptyCornerCell && 
                                  (hasHeaderRow && hasHeaderColumn) &&
                                  this.isRectangularPattern(positions);
    
    const followsFormStructure = hasKeyValuePairs && !followsTableStructure;
    
    // Identify cell positions by role
    const headerCells = this.identifyHeaderCells(cluster, contents);
    const labelCells = this.identifyLabelCells(cluster, contents);
    const dataCells = this.identifyDataCells(cluster, contents, headerCells, labelCells);
    
    // Calculate structure confidence
    const structureConfidence = this.calculateStructureConfidence({
      followsTableStructure,
      followsMatrixStructure,
      followsFormStructure,
      hasConsistentColumnTypes,
      hasHeaderRow,
      hasHeaderColumn
    });
    
    return {
      hasHeaderRow,
      hasHeaderColumn,
      hasConsistentColumnTypes,
      hasKeyValuePairs,
      hasEmptyCornerCell,
      followsTableStructure,
      followsMatrixStructure,
      followsFormStructure,
      headerCells,
      labelCells,
      dataCells,
      structureConfidence
    };
  }

  /**
   * Detect SPATIAL header row patterns (based on position, not content)
   */
  private detectSpatialHeaderRow(cluster: CellCluster): boolean {
    const positions = cluster.filledPoints;
    
    // Check if top row has cells and there are cells in rows below
    const topRowCells = positions.filter(p => p.row === cluster.topRow);
    const nonTopRowCells = positions.filter(p => p.row > cluster.topRow);
    
    // Header row pattern: cells in top row with cells below
    const hasTopRowPattern = topRowCells.length > 0 && nonTopRowCells.length > 0;
    
    // Check if top row spans most/all columns (typical header pattern)
    if (hasTopRowPattern && cluster.rightCol > cluster.leftCol) {
      const topRowSpan = Math.max(...topRowCells.map(p => p.col)) - Math.min(...topRowCells.map(p => p.col)) + 1;
      const totalSpan = cluster.rightCol - cluster.leftCol + 1;
      const hasFullSpan = topRowSpan / totalSpan > 0.6;
      
      return hasFullSpan;
    }
    
    return hasTopRowPattern;
  }

  /**
   * Detect SPATIAL header column patterns (based on position, not content)
   */
  private detectSpatialHeaderColumn(cluster: CellCluster): boolean {
    const positions = cluster.filledPoints;
    
    // Check if leftmost column has cells and there are cells to the right
    const leftColCells = positions.filter(p => p.col === cluster.leftCol);
    const nonLeftColCells = positions.filter(p => p.col > cluster.leftCol);
    
    // Header column pattern: cells in leftmost column with cells to the right
    const hasLeftColPattern = leftColCells.length > 0 && nonLeftColCells.length > 0;
    
    // Check if left column spans most/all rows (typical header pattern)
    if (hasLeftColPattern && cluster.bottomRow > cluster.topRow) {
      const leftColSpan = Math.max(...leftColCells.map(p => p.row)) - Math.min(...leftColCells.map(p => p.row)) + 1;
      const totalSpan = cluster.bottomRow - cluster.topRow + 1;
      const hasFullSpan = leftColSpan / totalSpan > 0.6;
      
      return hasFullSpan;
    }
    
    return hasLeftColPattern;
  }

  /**
   * Check if positions form a rectangular pattern
   */
  private isRectangularPattern(positions: CellPosition[]): boolean {
    if (positions.length === 0) return false;
    
    const rows = [...new Set(positions.map(p => p.row))].sort((a, b) => a - b);
    const cols = [...new Set(positions.map(p => p.col))].sort((a, b) => a - b);
    
    // Check if we have a complete rectangular grid
    const expectedCount = rows.length * cols.length;
    const actualCount = positions.length;
    
    // Allow some tolerance for sparse rectangular patterns
    return actualCount / expectedCount > 0.7;
  }

  /**
   * OLD CONTENT-BASED header column detection - DEPRECATED
   * This is now replaced by detectSpatialHeaderColumn
   */
  private detectHeaderColumn(cluster: CellCluster, contents: string[]): boolean {
    // Check if left column contains primarily text and right columns contain different types
    const leftColCells = cluster.filledPoints.filter(p => p.col === cluster.leftCol);
    if (leftColCells.length === 0) return false;
    
    const leftColContents = leftColCells.map(p => 
      this.grid.getCellRaw(p.row, p.col).trim()
    );
    
    // Header should be mostly text, not numbers or formulas
    const textCount = leftColContents.filter(content => 
      !this.isNumber(content) && !content.startsWith('=')
    ).length;
    
    return textCount / leftColContents.length > 0.7;
  }

  /**
   * Detect consistent column data types (table indicator)
   */
  private detectConsistentColumnTypes(cluster: CellCluster, contents: string[]): boolean {
    if (!this.isRectangularPattern(cluster.filledPoints)) return false;
    
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;
    
    if (width < 2 || height < 2) return false;
    
    // Check each column for type consistency
    let consistentColumns = 0;
    
    for (let col = 0; col < width; col++) {
      const columnContents: string[] = [];
      
      for (let row = 0; row < height; row++) {
        const actualRow = cluster.topRow + row;
        const actualCol = cluster.leftCol + col;
        const content = this.grid.getCellRaw(actualRow, actualCol).trim();
        
        if (content !== "") {
          columnContents.push(content);
        }
      }
      
      if (columnContents.length > 1) {
        const types = columnContents.map(content => this.getContentType(content));
        const uniqueTypes = new Set(types);
        
        if (uniqueTypes.size <= 2) { // Allow some variation
          consistentColumns++;
        }
      }
    }
    
    return consistentColumns / width > 0.6;
  }

  /**
   * Detect key-value pair patterns
   */
  private detectKeyValuePairs(cluster: CellCluster, contents: string[]): boolean {
    const positions = cluster.filledPoints;
    
    // Look for patterns where text cells are followed by value cells
    let keyValuePairs = 0;
    
    for (const pos of positions) {
      const content = this.grid.getCellRaw(pos.row, pos.col).trim();
      
      // Check if this looks like a key (text, ends with :, etc.)
      if (this.looksLikeKey(content)) {
        // Check for value to the right or below
        const rightValue = this.grid.getCellRaw(pos.row, pos.col + 1).trim();
        const belowValue = this.grid.getCellRaw(pos.row + 1, pos.col).trim();
        
        if (rightValue !== "" || belowValue !== "") {
          keyValuePairs++;
        }
      }
    }
    
    return keyValuePairs >= 2 && keyValuePairs / positions.length > 0.3;
  }

  /**
   * Check if content looks like a key
   */
  private looksLikeKey(content: string): boolean {
    return content.endsWith(':') || 
           content.endsWith('=') ||
           (content.length > 2 && !this.isNumber(content) && !content.startsWith('='));
  }

  /**
   * Get content type for a cell value
   */
  private getContentType(content: string): ContentType {
    if (content === "") return ContentType.Empty;
    if (content.startsWith("=")) return ContentType.Formula;
    if (this.isNumber(content)) return ContentType.Number;
    if (this.isDatePattern(content)) return ContentType.Date;
    if (this.isBooleanPattern(content)) return ContentType.Boolean;
    return ContentType.Text;
  }

  /**
   * Check if content is a number
   */
  private isNumber(content: string): boolean {
    return !isNaN(Number(content)) && content.trim() !== "";
  }

  /**
   * Check if content matches date patterns
   */
  private isDatePattern(content: string): boolean {
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
      /^\d{1,2}\.\d{1,2}\.\d{4}$/
    ];
    return datePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if content matches boolean patterns
   */
  private isBooleanPattern(content: string): boolean {
    const lower = content.toLowerCase();
    return ["true", "false", "yes", "no", "y", "n", "1", "0"].includes(lower);
  }

  /**
   * Detect SPATIAL empty corner cell pattern (matrix indicator)
   * In a matrix, the top-left corner is typically empty
   */
  private detectEmptyCornerCell(cluster: CellCluster): boolean {
    const positions = cluster.filledPoints;
    const topLeftPos = { row: cluster.topRow, col: cluster.leftCol };
    
    // Check if top-left corner is empty (not in filled positions)
    const hasEmptyTopLeft = !positions.some(p => 
      p.row === topLeftPos.row && p.col === topLeftPos.col
    );
    
    // Matrix pattern: empty corner with filled cells in both header row and column
    if (hasEmptyTopLeft) {
      const hasFilledHeaderRow = positions.some(p => p.row === cluster.topRow && p.col > cluster.leftCol);
      const hasFilledHeaderCol = positions.some(p => p.col === cluster.leftCol && p.row > cluster.topRow);
      const hasBodyCells = positions.some(p => p.row > cluster.topRow && p.col > cluster.leftCol);
      
      return hasFilledHeaderRow && hasFilledHeaderCol && hasBodyCells;
    }
    
    return false;
  }

  /**
   * Identify header cells
   */
  private identifyHeaderCells(cluster: CellCluster, contents: string[]): CellPosition[] {
    const headerCells: CellPosition[] = [];
    
    // Add top row if it's a header
    if (this.detectSpatialHeaderRow(cluster)) {
      headerCells.push(...cluster.filledPoints.filter(p => p.row === cluster.topRow));
    }
    
    // Add left column if it's a header
    if (this.detectSpatialHeaderColumn(cluster)) {
      headerCells.push(...cluster.filledPoints.filter(p => p.col === cluster.leftCol));
    }
    
    return headerCells;
  }

  /**
   * Identify label cells
   */
  private identifyLabelCells(cluster: CellCluster, contents: string[]): CellPosition[] {
    const labelCells: CellPosition[] = [];
    
    for (const pos of cluster.filledPoints) {
      const content = this.grid.getCellRaw(pos.row, pos.col).trim();
      
      if (this.looksLikeKey(content)) {
        labelCells.push(pos);
      }
    }
    
    return labelCells;
  }

  /**
   * Identify data cells
   */
  private identifyDataCells(
    cluster: CellCluster, 
    contents: string[], 
    headerCells: CellPosition[], 
    labelCells: CellPosition[]
  ): CellPosition[] {
    const headerSet = new Set(headerCells.map(p => `${p.row},${p.col}`));
    const labelSet = new Set(labelCells.map(p => `${p.row},${p.col}`));
    
    return cluster.filledPoints.filter(pos => {
      const key = `${pos.row},${pos.col}`;
      return !headerSet.has(key) && !labelSet.has(key);
    });
  }

  /**
   * Calculate structure detection confidence
   */
  private calculateStructureConfidence(indicators: {
    followsTableStructure: boolean;
    followsMatrixStructure: boolean;
    followsFormStructure: boolean;
    hasConsistentColumnTypes: boolean;
    hasHeaderRow: boolean;
    hasHeaderColumn: boolean;
  }): number {
    let confidence = 0.0;
    
    if (indicators.followsMatrixStructure) confidence += 0.4;
    if (indicators.followsTableStructure) confidence += 0.35;
    if (indicators.followsFormStructure) confidence += 0.3;
    if (indicators.hasConsistentColumnTypes) confidence += 0.2;
    if (indicators.hasHeaderRow || indicators.hasHeaderColumn) confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Analyze content alignment patterns
   */
  private analyzeAlignment(cluster: CellCluster, contents: string[]): AlignmentAnalysis {
    // Simplified alignment analysis - would need actual cell formatting info
    // For now, analyze content patterns to infer alignment
    
    const leftAligned = true; // Default assumption
    const centerAligned = false;
    const rightAligned = false;
    const consistentAlignment = true;
    const primaryAlignment = AlignmentType.Left;
    
    const alignmentByRow = new Map<number, AlignmentType>();
    const alignmentByColumn = new Map<number, AlignmentType>();
    
    // Set default alignments
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      alignmentByRow.set(row, AlignmentType.Left);
    }
    for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
      alignmentByColumn.set(col, AlignmentType.Left);
    }
    
    const suggestsTabularData = this.isRectangularPattern(cluster.filledPoints) && 
                               contents.length > 4;
    
    return {
      leftAligned,
      centerAligned,
      rightAligned,
      consistentAlignment,
      primaryAlignment,
      alignmentByRow,
      alignmentByColumn,
      suggestsTabularData,
      alignmentConfidence: 0.6
    };
  }

  /**
   * Analyze content types and patterns
   */
  private analyzeContentTypes(cluster: CellCluster, contents: string[]): ContentTypeAnalysis {
    const contentTypeDistribution = new Map<ContentType, number>();
    
    // Analyze each content type
    for (const content of contents) {
      const type = this.getContentType(content);
      contentTypeDistribution.set(type, (contentTypeDistribution.get(type) || 0) + 1);
    }
    
    // Determine primary content type
    let primaryContentType = ContentType.Text;
    let maxCount = 0;
    
    for (const [type, count] of contentTypeDistribution) {
      if (count > maxCount) {
        maxCount = count;
        primaryContentType = type;
      }
    }
    
    // Analyze by columns if rectangular
    const contentTypeByColumn = new Map<number, ContentType>();
    const contentTypeByRow = new Map<number, ContentType>();
    
    if (this.isRectangularPattern(cluster.filledPoints)) {
      // Analyze column consistency
      const width = cluster.rightCol - cluster.leftCol + 1;
      const height = cluster.bottomRow - cluster.topRow + 1;
      
      for (let col = 0; col < width; col++) {
        const columnTypes = new Map<ContentType, number>();
        
        for (let row = 0; row < height; row++) {
          const actualRow = cluster.topRow + row;
          const actualCol = cluster.leftCol + col;
          const content = this.grid.getCellRaw(actualRow, actualCol).trim();
          
          if (content !== "") {
            const type = this.getContentType(content);
            columnTypes.set(type, (columnTypes.get(type) || 0) + 1);
          }
        }
        
        // Determine dominant type for this column
        let dominantType = ContentType.Text;
        let maxTypeCount = 0;
        for (const [type, count] of columnTypes) {
          if (count > maxTypeCount) {
            maxTypeCount = count;
            dominantType = type;
          }
        }
        
        contentTypeByColumn.set(col, dominantType);
      }
    }
    
    const hasConsistentColumnTypes = contentTypeByColumn.size > 0;
    const hasConsistentRowTypes = contentTypeByRow.size > 0;
    
    const hasDataPatterns = contents.some(content => 
      this.isNumber(content) || content.startsWith('=')
    );
    
    const suggestsCalculation = contents.some(content => content.startsWith('='));
    const suggestsDataEntry = !suggestsCalculation && hasDataPatterns;
    
    return {
      contentTypeDistribution,
      primaryContentType,
      hasConsistentColumnTypes,
      hasConsistentRowTypes,
      contentTypeByColumn,
      contentTypeByRow,
      hasDataPatterns,
      suggestsCalculation,
      suggestsDataEntry,
      contentTypeConfidence: 0.8
    };
  }

  /**
   * Analyze textual patterns
   */
  private analyzeTextualPatterns(contents: string[]): TextualPatternAnalysis {
    const patterns = {
      hasFileExtensions: contents.some(content => /\.[a-zA-Z]{2,4}$/.test(content)),
      hasDirectoryIndicators: contents.some(content => /[\/\\]/.test(content)),
      hasURLPatterns: contents.some(content => /https?:\/\//.test(content)),
      hasEmailPatterns: contents.some(content => /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(content)),
      hasPhonePatterns: contents.some(content => /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(content)),
      hasDateTimePatterns: contents.some(content => this.isDatePattern(content)),
      hasMonetaryPatterns: contents.some(content => /[$€£¥]/.test(content)),
      hasMeasurementUnits: contents.some(content => /\d+\s*(cm|mm|in|ft|kg|lb|g|oz|ml|l)/.test(content)),
      hasCodePatterns: contents.some(content => /[{}();]/.test(content))
    };
    
    const commonPrefixes: string[] = [];
    const commonSuffixes: string[] = [];
    
    // Simple prefix/suffix analysis
    if (contents.length > 2) {
      const prefixes = contents.map(content => content.substring(0, 2)).filter(p => p.length === 2);
      const suffixes = contents.map(content => content.substring(content.length - 2)).filter(s => s.length === 2);
      
      const prefixCounts = new Map<string, number>();
      const suffixCounts = new Map<string, number>();
      
      for (const prefix of prefixes) {
        prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
      }
      for (const suffix of suffixes) {
        suffixCounts.set(suffix, (suffixCounts.get(suffix) || 0) + 1);
      }
      
      for (const [prefix, count] of prefixCounts) {
        if (count > 1) commonPrefixes.push(prefix);
      }
      for (const [suffix, count] of suffixCounts) {
        if (count > 1) commonSuffixes.push(suffix);
      }
    }
    
    let suggestedDomain = "general";
    if (patterns.hasMonetaryPatterns) suggestedDomain = "financial";
    else if (patterns.hasCodePatterns) suggestedDomain = "technical";
    else if (patterns.hasFileExtensions) suggestedDomain = "filesystem";
    else if (patterns.hasEmailPatterns || patterns.hasURLPatterns) suggestedDomain = "communication";
    
    return {
      ...patterns,
      commonPrefixes,
      commonSuffixes,
      suggestedDomain,
      textualPatternConfidence: 0.7
    };
  }

  /**
   * Analyze symbols and special characters
   */
  private analyzeSymbols(contents: string[]): SymbolAnalysis {
    const allContent = contents.join(' ');
    
    const patterns = {
      hasTreeDrawingChars: /[├└│─┌┐┘┤┬┴┼]/.test(allContent),
      hasBoxDrawingChars: /[┌┐└┘]/.test(allContent),
      hasMathSymbols: /[+\-×÷=≠<>≤≥]/.test(allContent),
      hasCurrencySymbols: /[$€£¥¢]/.test(allContent),
      hasBulletSymbols: /[•◦▪▫▸▹►‣⁃]/.test(allContent),
      hasArrowSymbols: /[→←↑↓↔]/.test(allContent),
      hasCheckSymbols: /[✓✗☑☐]/.test(allContent),
      hasSpecialPunctuation: /[;:,.]/.test(allContent)
    };
    
    // Extract common symbols
    const symbolMatches = allContent.match(/[^\w\s]/g) || [];
    const symbolCounts = new Map<string, number>();
    
    for (const symbol of symbolMatches) {
      symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
    }
    
    const commonSymbols = Array.from(symbolCounts.entries())
      .filter(([symbol, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symbol]) => symbol);
    
    // Suggest construct types based on symbols
    const symbolsIndicateConstruct: string[] = [];
    if (patterns.hasTreeDrawingChars) symbolsIndicateConstruct.push("tree");
    if (patterns.hasBulletSymbols) symbolsIndicateConstruct.push("list", "tree");
    if (patterns.hasArrowSymbols) symbolsIndicateConstruct.push("flow", "process");
    if (patterns.hasCheckSymbols) symbolsIndicateConstruct.push("checklist", "form");
    
    return {
      ...patterns,
      commonSymbols,
      symbolsIndicateConstruct,
      symbolConfidence: 0.6
    };
  }

  /**
   * Calculate overall content coherence
   */
  private calculateContentCoherence(
    hierarchy: HierarchyAnalysis,
    structure: StructureAnalysis,
    alignment: AlignmentAnalysis,
    contentTypes: ContentTypeAnalysis
  ): number {
    let coherence = 0.0;
    
    coherence += hierarchy.hierarchyConfidence * 0.3;
    coherence += structure.structureConfidence * 0.3;
    coherence += alignment.alignmentConfidence * 0.2;
    coherence += contentTypes.contentTypeConfidence * 0.2;
    
    return Math.min(coherence, 1.0);
  }

  /**
   * Determine primary content pattern type
   */
  private determinePrimaryContentPattern(
    hierarchy: HierarchyAnalysis,
    structure: StructureAnalysis,
    contentTypes: ContentTypeAnalysis
  ): "tree" | "table" | "matrix" | "form" | "list" | "mixed" | "unknown" {
    if (structure.followsMatrixStructure) return "matrix";
    if (structure.followsTableStructure) return "table";
    if (hierarchy.followsTreeStructure) return "tree";
    if (hierarchy.followsListStructure) return "list";
    if (structure.followsFormStructure) return "form";
    if (hierarchy.hierarchyConfidence > 0.5 || structure.structureConfidence > 0.5) return "mixed";
    return "unknown";
  }

  /**
   * Suggest construct types based on content patterns
   */
  private suggestConstructsFromContent(
    hierarchy: HierarchyAnalysis,
    structure: StructureAnalysis,
    contentTypes: ContentTypeAnalysis,
    symbols: SymbolAnalysis
  ): string[] {
    const suggestions: string[] = [];
    
    if (structure.followsMatrixStructure) suggestions.push("matrix");
    if (structure.followsTableStructure) suggestions.push("table");
    if (hierarchy.followsTreeStructure) suggestions.push("tree");
    if (hierarchy.followsListStructure) suggestions.push("list");
    if (structure.followsFormStructure) suggestions.push("key-value", "form");
    
    // Add suggestions from symbols
    suggestions.push(...symbols.symbolsIndicateConstruct);
    
    // Remove duplicates
    return [...new Set(suggestions)];
  }

  private parseArrangementTraits(cluster: CellCluster, spatial: SpatialRelationshipTraits): ArrangementTraits {
    // TODO: Implement detailed arrangement analysis
    return {} as ArrangementTraits;
  }

  private parseCellRoleTraits(
    cluster: CellCluster, 
    spatial: SpatialRelationshipTraits, 
    content: ContentPatternTraits, 
    arrangement: ArrangementTraits
  ): CellRoleTraits {
    // TODO: Implement detailed cell role analysis
    return {} as CellRoleTraits;
  }\n\n  /**\n   * Analyze tree roles based on spatial relationships\n   */\n  private analyzeTreeRoles(\n    cluster: CellCluster,\n    spatial: SpatialRelationshipTraits,\n    arrangement: ArrangementTraits\n  ): TreeRoleAnalysis {\n    const positions = cluster.filledPoints;\n    const rootCells: RoleAssignment[] = [];\n    const parentCells: RoleAssignment[] = [];\n    const childCells: RoleAssignment[] = [];\n    const peerCells: RoleAssignment[] = [];\n    const headerCells: RoleAssignment[] = [];\n    const leafCells: RoleAssignment[] = [];\n    \n    // Use spatial parent-child relationships from spatial analysis\n    const parentChildRelationships = spatial.connectivity.parentChildRelationships;\n    const peerGroups = spatial.connectivity.peerGroups;\n    \n    // Create hierarchy mapping\n    const hierarchy = new Map<number, RoleAssignment[]>();\n    const parentChildMappings = new Map<string, string[]>();\n    \n    // Identify root cells (no parents)\n    const childPositions = new Set(parentChildRelationships.map(rel => `${rel.child.row},${rel.child.col}`));\n    const potentialRoots = positions.filter(pos => !childPositions.has(`${pos.row},${pos.col}`));\n    \n    potentialRoots.forEach((pos, index) => {\n      const rootRole: RoleAssignment = {\n        position: pos,\n        role: CellRole.TreeRoot,\n        secondaryRoles: [],\n        confidence: 0.8,\n        level: 0,\n        childPositions: [],\n        metadata: { isRoot: true }\n      };\n      rootCells.push(rootRole);\n    });\n    \n    // Process parent-child relationships\n    parentChildRelationships.forEach(rel => {\n      // Parent role\n      const parentRole: RoleAssignment = {\n        position: rel.parent,\n        role: CellRole.TreeParent,\n        secondaryRoles: [],\n        confidence: 0.7,\n        level: this.calculateTreeLevel(rel.parent, parentChildRelationships),\n        childPositions: [rel.child],\n        metadata: { hasChildren: true }\n      };\n      \n      if (!parentCells.some(p => p.position.row === rel.parent.row && p.position.col === rel.parent.col)) {\n        parentCells.push(parentRole);\n      }\n      \n      // Child role\n      const childRole: RoleAssignment = {\n        position: rel.child,\n        role: CellRole.TreeChild,\n        secondaryRoles: [],\n        confidence: 0.7,\n        level: this.calculateTreeLevel(rel.child, parentChildRelationships),\n        parentPosition: rel.parent,\n        metadata: { hasParent: true }\n      };\n      childCells.push(childRole);\n      \n      // Update parent-child mapping\n      const parentKey = `${rel.parent.row},${rel.parent.col}`;\n      if (!parentChildMappings.has(parentKey)) {\n        parentChildMappings.set(parentKey, []);\n      }\n      parentChildMappings.get(parentKey)!.push(`${rel.child.row},${rel.child.col}`);\n    });\n    \n    // Process peer groups\n    peerGroups.forEach(group => {\n      group.forEach(pos => {\n        const peerRole: RoleAssignment = {\n          position: pos,\n          role: CellRole.TreePeer,\n          secondaryRoles: [],\n          confidence: 0.6,\n          level: this.calculateTreeLevel(pos, parentChildRelationships),\n          peerPositions: group.filter(p => p !== pos),\n          metadata: { peerGroupSize: group.length }\n        };\n        peerCells.push(peerRole);\n      });\n    });\n    \n    // Identify leaf cells (no children)\n    const parentPositions = new Set(parentChildRelationships.map(rel => `${rel.parent.row},${rel.parent.col}`));\n    const leafPositions = positions.filter(pos => !parentPositions.has(`${pos.row},${pos.col}`));\n    \n    leafPositions.forEach(pos => {\n      if (!rootCells.some(r => r.position.row === pos.row && r.position.col === pos.col)) {\n        const leafRole: RoleAssignment = {\n          position: pos,\n          role: CellRole.TreeLeaf,\n          secondaryRoles: [],\n          confidence: 0.6,\n          level: this.calculateTreeLevel(pos, parentChildRelationships),\n          metadata: { isLeaf: true }\n        };\n        leafCells.push(leafRole);\n      }\n    });\n    \n    // All tree cells\n    const treeCells = [...rootCells, ...parentCells, ...childCells, ...peerCells, ...leafCells];\n    \n    // Build hierarchy by level\n    treeCells.forEach(cell => {\n      const level = cell.level || 0;\n      if (!hierarchy.has(level)) {\n        hierarchy.set(level, []);\n      }\n      hierarchy.get(level)!.push(cell);\n    });\n    \n    const maxDepth = Math.max(...Array.from(hierarchy.keys()));\n    const hasConsistentStructure = parentChildRelationships.length > 0 && peerGroups.length > 0;\n    const primaryGrowthDirection = arrangement.orientation.primaryDirection === Direction.Down ? \"down\" : \"right\";\n    const secondaryGrowthDirection = arrangement.orientation.secondaryDirection === Direction.Right ? \"right\" : \"down\";\n    \n    const confidence = this.calculateTreeConfidence({\n      hasRoots: rootCells.length > 0,\n      hasParentChild: parentChildRelationships.length > 0,\n      hasPeers: peerGroups.length > 0,\n      hasConsistentStructure,\n      maxDepth\n    });\n    \n    return {\n      rootCells,\n      parentCells,\n      childCells,\n      peerCells,\n      headerCells,\n      leafCells,\n      treeCells,\n      hierarchy,\n      parentChildMappings,\n      peerGroups,\n      maxDepth,\n      hasConsistentStructure,\n      primaryGrowthDirection,\n      secondaryGrowthDirection,\n      confidence\n    };\n  }\n  \n  /**\n   * Calculate tree level for a position\n   */\n  private calculateTreeLevel(position: CellPosition, relationships: Array<{parent: CellPosition; child: CellPosition}>): number {\n    let level = 0;\n    let currentPos = position;\n    \n    // Traverse up to find root\n    const visited = new Set<string>();\n    while (true) {\n      const posKey = `${currentPos.row},${currentPos.col}`;\n      if (visited.has(posKey)) break; // Prevent infinite loops\n      visited.add(posKey);\n      \n      const parentRel = relationships.find(rel => \n        rel.child.row === currentPos.row && rel.child.col === currentPos.col\n      );\n      \n      if (!parentRel) break;\n      \n      currentPos = parentRel.parent;\n      level++;\n    }\n    \n    return level;\n  }\n  \n  /**\n   * Calculate confidence for tree role detection\n   */\n  private calculateTreeConfidence(factors: {\n    hasRoots: boolean;\n    hasParentChild: boolean;\n    hasPeers: boolean;\n    hasConsistentStructure: boolean;\n    maxDepth: number;\n  }): number {\n    let confidence = 0;\n    \n    if (factors.hasRoots) confidence += 0.2;\n    if (factors.hasParentChild) confidence += 0.4;\n    if (factors.hasPeers) confidence += 0.2;\n    if (factors.hasConsistentStructure) confidence += 0.1;\n    if (factors.maxDepth > 1) confidence += 0.1;\n    \n    return Math.min(confidence, 1.0);\n  }\n\n  /**\n   * Analyze table roles - placeholder implementation\n   */\n  private analyzeTableRoles(\n    cluster: CellCluster,\n    spatial: SpatialRelationshipTraits,\n    content: ContentPatternTraits,\n    arrangement: ArrangementTraits\n  ): TableRoleAnalysis {\n    // TODO: Implement table role analysis\n    return {\n      headerCells: [],\n      rowHeaderCells: [],\n      columnHeaderCells: [],\n      dataCells: [],\n      tableCells: [],\n      rowStructure: new Map(),\n      columnStructure: new Map(),\n      headerRowCount: 0,\n      headerColumnCount: 0,\n      hasConsistentColumnTypes: false,\n      columnDataTypes: new Map(),\n      confidence: 0\n    };\n  }\n\n  /**\n   * Analyze matrix roles - placeholder implementation\n   */\n  private analyzeMatrixRoles(\n    cluster: CellCluster,\n    spatial: SpatialRelationshipTraits,\n    arrangement: ArrangementTraits\n  ): MatrixRoleAnalysis {\n    // TODO: Implement matrix role analysis\n    return {\n      primaryHeaderCells: [],\n      secondaryHeaderCells: [],\n      bodyCells: [],\n      matrixCells: [],\n      primaryHeaderDirection: \"row\",\n      secondaryHeaderDirection: \"column\",\n      dimensions: {\n        primaryHeaderCount: 0,\n        secondaryHeaderCount: 0,\n        bodyRowCount: 0,\n        bodyColumnCount: 0\n      },\n      headerRegions: {\n        primary: { topRow: 0, bottomRow: 0, leftCol: 0, rightCol: 0 },\n        secondary: { topRow: 0, bottomRow: 0, leftCol: 0, rightCol: 0 }\n      },\n      bodyRegion: { topRow: 0, bottomRow: 0, leftCol: 0, rightCol: 0 },\n      confidence: 0\n    };\n  }\n\n  /**\n   * Analyze key-value roles - placeholder implementation\n   */\n  private analyzeKeyValueRoles(\n    cluster: CellCluster,\n    spatial: SpatialRelationshipTraits,\n    content: ContentPatternTraits\n  ): KeyValueRoleAnalysis {\n    // TODO: Implement key-value role analysis\n    return {\n      keyValuePairs: [],\n      keyCells: [],\n      valueCells: [],\n      keyValueCells: [],\n      hierarchy: new Map(),\n      isNested: false,\n      maxNestingLevel: 0,\n      primaryDirection: \"horizontal\",\n      confidence: 0\n    };\n  }\n\n  // Arrangement Analysis Helper Methods\n\n  private analyzeOrientation(cluster: CellCluster, positions: CellPosition[]): OrientationAnalysis {\n    const width = cluster.rightCol - cluster.leftCol + 1;\n    const height = cluster.bottomRow - cluster.topRow + 1;\n    \n    const isVertical = height > width;\n    const isHorizontal = width > height;\n    const isRadial = false; // Would need more complex analysis\n    const isDiagonal = this.checkDiagonalPattern(positions);\n    \n    const primaryOrientation = isVertical ? OrientationType.Vertical : \n                              isHorizontal ? OrientationType.Horizontal :\n                              isDiagonal ? OrientationType.Diagonal : OrientationType.Mixed;\n    \n    return {\n      isVertical,\n      isHorizontal,\n      isRadial,\n      isDiagonal,\n      primaryOrientation,\n      primaryDirection: isVertical ? Direction.Down : Direction.Right,\n      secondaryDirection: isVertical ? Direction.Right : Direction.Down,\n      orientationConfidence: 0.8,\n      hasConsistentOrientation: true,\n      primaryAxisCells: positions,\n      secondaryAxisCells: []\n    };\n  }\n\n  private analyzeSpacing(cluster: CellCluster, positions: CellPosition[]): SpacingAnalysis {\n    // Simplified spacing analysis\n    return {\n      hasConsistentRowSpacing: true,\n      hasConsistentColumnSpacing: true,\n      hasHierarchicalSpacing: false,\n      hasIrregularSpacing: false,\n      isCompact: positions.length > 4,\n      isSparse: positions.length <= 4,\n      primarySpacingType: SpacingType.Regular,\n      averageRowSpacing: 1,\n      averageColumnSpacing: 1,\n      rowSpacingVariation: 0,\n      columnSpacingVariation: 0,\n      rowSpacingPattern: [],\n      columnSpacingPattern: [],\n      spacingSuggestsConstruct: [\"table\"],\n      spacingConfidence: 0.7\n    };\n  }\n\n  private analyzeBoundaries(cluster: CellCluster, positions: CellPosition[]): BoundaryAnalysis {\n    const hasRegularBoundary = this.isRectangularPattern(positions);\n    \n    return {\n      hasRegularBoundary,\n      hasAlignedLeftEdge: true,\n      hasAlignedRightEdge: true,\n      hasAlignedTopEdge: true,\n      hasAlignedBottomEdge: true,\n      hasSteppedBoundary: false,\n      hasIrregularBoundary: !hasRegularBoundary,\n      primaryBoundaryType: hasRegularBoundary ? BoundaryType.Rectangular : BoundaryType.Irregular,\n      boundaryPoints: positions,\n      boundarySuggestsConstruct: hasRegularBoundary ? [\"table\", \"matrix\"] : [\"tree\"],\n      boundaryConvexity: 1.0,\n      boundingRectangleAspectRatio: (cluster.rightCol - cluster.leftCol + 1) / (cluster.bottomRow - cluster.topRow + 1),\n      boundingRectangleFillRatio: positions.length / ((cluster.rightCol - cluster.leftCol + 1) * (cluster.bottomRow - cluster.topRow + 1)),\n      boundaryConfidence: 0.8\n    };\n  }\n\n  private analyzeFlow(cluster: CellCluster, positions: CellPosition[], spatial: SpatialRelationshipTraits): FlowAnalysis {\n    const hasParentChild = spatial.connectivity.parentChildRelationships.length > 0;\n    \n    return {\n      primaryFlowDirection: FlowDirection.TopToBottom,\n      hasLinearFlow: !hasParentChild,\n      hasHierarchicalFlow: hasParentChild,\n      hasTabularFlow: this.isRectangularPattern(positions),\n      hasRadialFlow: false,\n      flowStartPoints: [positions[0]] || [],\n      flowEndPoints: [positions[positions.length - 1]] || [],\n      flowPaths: [positions],\n      suggestsReadingOrder: true,\n      readingSequence: positions,\n      flowConfidence: 0.7\n    };\n  }\n\n  private analyzeSymmetry(cluster: CellCluster, positions: CellPosition[]): SymmetryAnalysis {\n    return {\n      hasLeftRightSymmetry: false,\n      hasTopBottomSymmetry: false,\n      hasRotationalSymmetry: false,\n      hasDiagonalSymmetry: false,\n      isBalanced: true,\n      centerOfMass: {\n        row: (cluster.topRow + cluster.bottomRow) / 2,\n        col: (cluster.leftCol + cluster.rightCol) / 2\n      },\n      symmetryConfidence: 0.5\n    };\n  }\n\n  private analyzeGridAlignment(cluster: CellCluster, positions: CellPosition[]): GridAlignmentAnalysis {\n    return {\n      alignsWithGridStructure: true,\n      rowsAlignWithGrid: true,\n      columnsAlignWithGrid: true,\n      gridStartPosition: positions[0] || { row: 0, col: 0 },\n      gridEndPosition: positions[positions.length - 1] || { row: 0, col: 0 },\n      spansMultipleRegions: false,\n      bridgesGridGaps: false,\n      gridUtilizationEfficiency: 0.8,\n      suggestsIntentionalLayout: true,\n      gridAlignmentConfidence: 0.8\n    };\n  }\n\n  private checkDiagonalPattern(positions: CellPosition[]): boolean {\n    if (positions.length < 2) return false;\n    \n    // Check if positions form a diagonal line\n    const sorted = [...positions].sort((a, b) => a.row - b.row || a.col - b.col);\n    const rowDiff = sorted[1].row - sorted[0].row;\n    const colDiff = sorted[1].col - sorted[0].col;\n    \n    if (rowDiff === 0 || colDiff === 0) return false; // Not diagonal\n    \n    return sorted.every((pos, i) => {\n      if (i === 0) return true;\n      const expectedRow = sorted[0].row + (rowDiff * i);\n      const expectedCol = sorted[0].col + (colDiff * i);\n      return pos.row === expectedRow && pos.col === expectedCol;\n    });\n  }\n\n  private calculateSpatialOrganization(factors: {\n    orientation: OrientationAnalysis;\n    spacing: SpacingAnalysis;\n    boundaries: BoundaryAnalysis;\n    flow: FlowAnalysis;\n    symmetry: SymmetryAnalysis;\n    gridAlignment: GridAlignmentAnalysis;\n  }): number {\n    const scores = [\n      factors.orientation.orientationConfidence,\n      factors.spacing.spacingConfidence,\n      factors.boundaries.boundaryConfidence,\n      factors.flow.flowConfidence,\n      factors.symmetry.symmetryConfidence,\n      factors.gridAlignment.gridAlignmentConfidence\n    ];\n    \n    return scores.reduce((sum, score) => sum + score, 0) / scores.length;\n  }\n\n  private determinePrimaryArrangementPattern(factors: {\n    orientation: OrientationAnalysis;\n    spacing: SpacingAnalysis;\n    boundaries: BoundaryAnalysis;\n    flow: FlowAnalysis;\n  }): \"linear\" | \"tabular\" | \"hierarchical\" | \"radial\" | \"scattered\" | \"mixed\" {\n    if (factors.boundaries.hasRegularBoundary && factors.spacing.hasConsistentRowSpacing) {\n      return \"tabular\";\n    }\n    if (factors.flow.hasHierarchicalFlow) {\n      return \"hierarchical\";\n    }\n    if (factors.orientation.isVertical || factors.orientation.isHorizontal) {\n      return \"linear\";\n    }\n    return \"mixed\";\n  }\n\n  private determineSecondaryArrangementPatterns(factors: {\n    orientation: OrientationAnalysis;\n    spacing: SpacingAnalysis;\n    boundaries: BoundaryAnalysis;\n    flow: FlowAnalysis;\n  }): string[] {\n    const patterns: string[] = [];\n    \n    if (factors.boundaries.hasRegularBoundary) patterns.push(\"rectangular\");\n    if (factors.spacing.isCompact) patterns.push(\"dense\");\n    if (factors.flow.hasLinearFlow) patterns.push(\"sequential\");\n    \n    return patterns;\n  }\n\n  private suggestConstructsFromArrangement(factors: {\n    orientation: OrientationAnalysis;\n    spacing: SpacingAnalysis;\n    boundaries: BoundaryAnalysis;\n    flow: FlowAnalysis;\n    symmetry: SymmetryAnalysis;\n  }): string[] {\n    const suggestions: string[] = [];\n    \n    if (factors.boundaries.hasRegularBoundary) {\n      suggestions.push(\"table\", \"matrix\");\n    }\n    if (factors.flow.hasHierarchicalFlow) {\n      suggestions.push(\"tree\");\n    }\n    if (factors.orientation.isVertical || factors.orientation.isHorizontal) {\n      suggestions.push(\"list\", \"key-value\");\n    }\n    \n    return suggestions;\n  }\n\n  private analyzeInteractionSuitability(factors: {\n    orientation: OrientationAnalysis;\n    spacing: SpacingAnalysis;\n    boundaries: BoundaryAnalysis;\n    flow: FlowAnalysis;\n  }): Map<string, number> {\n    const suitability = new Map<string, number>();\n    \n    suitability.set(\"navigation\", factors.flow.suggestsReadingOrder ? 0.8 : 0.4);\n    suitability.set(\"selection\", factors.boundaries.hasRegularBoundary ? 0.9 : 0.6);\n    suitability.set(\"editing\", factors.spacing.hasConsistentRowSpacing ? 0.8 : 0.5);\n    suitability.set(\"visualization\", factors.orientation.hasConsistentOrientation ? 0.7 : 0.4);\n    \n    return suitability;\n  }\n}
