import CellCluster from "./CellCluster";
import {
  CellClusterTraits,
  CellClusterBaseTraits,
  CellClusterCompositeTraits,
  CellClusterDerivedTraits,
  TreeDetectionTraits,
  ConstructDetectionTraits,
  CornerAnalysis,
  EdgeAnalysis,
  IndentationAnalysis,
  Direction,
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
    
    // Parse consolidated trait categories for construct detection
    const treeDetection = this.parseTreeDetectionTraits(cluster);
    const constructDetection = this.parseConstructDetectionTraits(cluster, base);
    const corners = this.parseCornerAnalysis(cluster);
    const edges = this.parseEdgeAnalysis(cluster);
    const indentation = this.parseIndentationAnalysis(cluster);

    return { 
      base, 
      composite, 
      derived,
      treeDetection,
      constructDetection,
      corners,
      edges,
      indentation
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
   * Parse content patterns and structure analysis
   */
  private parseCompositeTraits(cluster: CellCluster, base: CellClusterBaseTraits): CellClusterCompositeTraits {
    const cellContents = cluster.filledPoints.map((pt) =>
      this.grid.getCellRaw(pt.row, pt.col).trim()
    );

    // Content type analysis
    const contentTypes = new Set<string>();
    let hasNumericContent = false;
    let hasTextContent = false;
    let hasFormulas = false;

    cellContents.forEach((content) => {
      if (content.startsWith("=")) {
        contentTypes.add("formula");
        hasFormulas = true;
      } else if (/^\d+(\.\d+)?$/.test(content)) {
        contentTypes.add("number");
        hasNumericContent = true;
      } else if (content.trim() !== "") {
        contentTypes.add("text");
        hasTextContent = true;
      }
    });

    const hasUniformContent = contentTypes.size <= 1;
    const hasMixedContent = contentTypes.size > 1;
    const dominantContentType = hasTextContent ? "text" : hasNumericContent ? "number" : "mixed";

    // Structural patterns
    const hasHeaders = this.detectHeaders(cluster);
    const hasColumnStructure = this.detectColumnStructure(cluster);
    const hasRowStructure = this.detectRowStructure(cluster);
    const hasTabularStructure = hasColumnStructure && hasRowStructure;
    const hasHierarchicalStructure = this.detectHierarchicalStructure(cluster);

    return {
      contentTypes,
      hasUniformContent,
      hasMixedContent,
      hasNumericContent,
      hasTextContent,
      hasFormulas,
      dominantContentType,
      hasHeaders,
      hasFooters: false, // TODO: Implement
      hasBorders: false, // TODO: Implement
      hasPattern: true,
      hasColumnStructure,
      hasRowStructure,
      contentAlignment: "left", // TODO: Implement proper detection
      hasConsistentAlignment: true,
      alignmentPattern: "left",
      dataTypes: Array.from(contentTypes),
      dominantDataType: dominantContentType,
      dataConsistency: hasUniformContent ? 1.0 : 0.5,
      hasSequentialData: false, // TODO: Implement
      hasRepeatingPattern: false, // TODO: Implement
      hasHierarchicalStructure,
      hasTabularStructure,
      hasCalculationPattern: hasFormulas,
      hasEmptySpaces: base.emptyCellCount > 0,
      hasInconsistentTypes: hasMixedContent,
      dataQuality: base.fillRatio,
      completenessRatio: base.fillRatio,
      isDataEntry: false, // TODO: Implement
      isCalculation: hasFormulas,
      isLookupTable: hasTabularStructure,
      isHeader: false, // TODO: Implement
      isLabel: false, // TODO: Implement
      isContainer: true,
      isNavigation: false,
      hasAlignment: true,
      hasConsistentFormatting: true,
      visualCoherence: 0.8,
      standsOutVisually: false,
      alignsWithGridStructure: true,
      bridgesMultipleRegions: false,
      isIsolated: false,
      connectsToOtherClusters: false,
      hasInputs: false,
      hasOutputs: false,
      isIntermediate: false,
      participatesInCalculation: hasFormulas,
      hasDataDependencies: hasFormulas
    };
  }

  /**
   * Parse derived semantic traits
   */
  private parseDerivedTraits(
    cluster: CellCluster,
    base: CellClusterBaseTraits,
    composite: CellClusterCompositeTraits
  ): CellClusterDerivedTraits {
    // Determine primary purpose
    let primaryPurpose: "data-storage" | "calculation" | "display" | "navigation" | "decoration" | "structure" = "data-storage";
    if (composite.hasCalculationPattern) primaryPurpose = "calculation";
    else if (composite.hasTabularStructure) primaryPurpose = "display";
    else if (composite.hasHierarchicalStructure) primaryPurpose = "structure";

    // Content semantics
    const likelyDataType = this.determineDataType(composite);
    const semanticRole = this.determineSemanticRole(composite, base);

    // Directional orientation
    const { primaryDirection, secondaryDirection } = this.determineDirections(base);

    // Construct indicators
    const indicatesConstruct = this.determineConstructTypes(composite, base);
    const constructConfidence = this.calculateConstructConfidence(indicatesConstruct);

    return {
      primaryPurpose,
      secondaryPurposes: [],
      confidence: 0.8,
      likelyDataType,
      semanticRole,
      isContainer: true,
      isLeaf: false,
      isHeader: composite.hasHeaders,
      isFooter: false,
      isData: true,
      isNavigation: false,
      isTitle: false,
      isSummary: false,
      primaryDirection,
      secondaryDirection,
      isInteractive: false,
      isReadOnly: true,
      requiresValidation: false,
      hasConstraints: false,
      isUserEditable: true,
      indicatesConstruct,
      constructConfidence,
      likelyConstructs: indicatesConstruct,
      importance: 0.5,
      hierarchyLevel: 0,
      isParent: false,
      isChild: false,
      isSibling: false,
      hasBusinessLogic: false,
      isRuleBasedInput: false,
      isAuditableData: false,
      requiresBackup: false,
      hasValidationRules: false,
      isStable: true,
      isGrowthPoint: false,
      hasExtensionPotential: false,
      changeFrequency: "static",
      isExpandable: false,
      dataIntegrity: 0.8,
      maintainabilityScore: 0.8,
      complexity: "simple",
      structuralIntegrity: 0.8,
      computationComplexity: 0.2,
      updateFrequency: 0.1,
      cachingBenefit: 0.8,
      renderingCost: 0.2
    };
  }

  /**
   * Parse Tree Detection Traits - Precise algorithmic constraints for tree identification
   */
  private parseTreeDetectionTraits(cluster: CellCluster): TreeDetectionTraits {
    // Performance optimization: skip complex analysis if all cells are filled
    const totalCells = (cluster.rightCol - cluster.leftCol + 1) * (cluster.bottomRow - cluster.topRow + 1);
    const allCellsFilled = cluster.filledPoints.length === totalCells;
    
    if (allCellsFilled) {
      // Quick return for filled areas (likely tables/matrices, not trees)
      return {
        allCellsFilled: true,
        filledTopLeftCell: true,
        maxRowIndentationIncrease: 0,
        maxColumnIndentationIncrease: 0,
        maxGapSizeInAnyRow: 0,
        maxGapSizeInAnyColumn: 0,
        maxGapCountInAnyRow: 0,
        maxGapCountInAnyColumn: 0,
        maxFilledCellsBeforeAnyRowGap: 0,
        maxFilledCellsBeforeAnyColumnGap: 0,
        nonParentRowsWithGap: 0,
        nonParentColumnsWithGap: 0
      };
    }

    // Check if top-left cell is filled
    const filledTopLeftCell = this.grid.getCellRaw(cluster.topRow, cluster.leftCol).trim() !== "";

    // Analyze indentation patterns
    const { maxRowIndentationIncrease, maxColumnIndentationIncrease } = this.analyzeIndentationIncrease(cluster);
    
    // Analyze gaps in rows and columns
    const { 
      maxGapSizeInAnyRow, 
      maxGapCountInAnyRow, 
      maxFilledCellsBeforeAnyRowGap,
      nonParentRowsWithGap
    } = this.analyzeRowGaps(cluster);
    
    const { 
      maxGapSizeInAnyColumn, 
      maxGapCountInAnyColumn, 
      maxFilledCellsBeforeAnyColumnGap,
      nonParentColumnsWithGap
    } = this.analyzeColumnGaps(cluster);

    return {
      allCellsFilled,
      filledTopLeftCell,
      maxRowIndentationIncrease,
      maxColumnIndentationIncrease,
      maxGapSizeInAnyRow,
      maxGapSizeInAnyColumn,
      maxGapCountInAnyRow,
      maxGapCountInAnyColumn,
      maxFilledCellsBeforeAnyRowGap,
      maxFilledCellsBeforeAnyColumnGap,
      nonParentRowsWithGap,
      nonParentColumnsWithGap
    };
  }

  /**
   * Parse Construct Detection Traits - High-level patterns for different constructs
   */
  private parseConstructDetectionTraits(cluster: CellCluster, base: CellClusterBaseTraits): ConstructDetectionTraits {
    const hasTopLeftAnchor = this.grid.getCellRaw(cluster.topRow, cluster.leftCol).trim() !== "";
    
    // Check if top row is filled
    let hasTopRowFilled = true;
    for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
      if (this.grid.getCellRaw(cluster.topRow, col).trim() === "") {
        hasTopRowFilled = false;
        break;
      }
    }

    // Check if left column is filled
    let hasLeftColumnFilled = true;
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      if (this.grid.getCellRaw(row, cluster.leftCol).trim() === "") {
        hasLeftColumnFilled = false;
        break;
      }
    }

    const hasTopAndLeftEdgesFilled = hasTopRowFilled && hasLeftColumnFilled;
    
    // Analyze structure patterns
    const hasHierarchicalIndentation = this.checkHierarchicalIndentation(cluster);
    const hasColumnAlignment = this.checkColumnAlignment(cluster);
    const hasKeyValuePairs = this.checkKeyValuePairs(cluster);
    const hasConsistentRowPairs = this.checkConsistentRowPairs(cluster);
    
    // Calculate structural metrics
    const fillDensity = base.fillRatio;
    const gridLikeness = this.calculateGridLikeness(cluster);
    const isRegular = base.isRectangular && gridLikeness > 0.7;

    // Determine structure types
    const hasTreeLikeStructure = hasTopLeftAnchor && hasHierarchicalIndentation && !isRegular;
    const hasTabularStructure = (hasTopRowFilled || hasColumnAlignment) && isRegular;
    const hasGridLikeStructure = hasTopAndLeftEdgesFilled && gridLikeness > 0.8;

    return {
      hasTopLeftAnchor,
      hasHierarchicalIndentation,
      hasTreeLikeStructure,
      hasTopRowFilled,
      hasColumnAlignment,
      hasTabularStructure,
      hasLeftColumnFilled,
      hasTopAndLeftEdgesFilled,
      hasGridLikeStructure,
      hasKeyValuePairs,
      hasConsistentRowPairs,
      fillDensity,
      gridLikeness,
      isRegular
    };
  }

  /**
   * Parse Corner Analysis
   */
  private parseCornerAnalysis(cluster: CellCluster): CornerAnalysis {
    const topLeft = {
      filled: this.grid.getCellRaw(cluster.topRow, cluster.leftCol).trim() !== "",
      content: this.grid.getCellRaw(cluster.topRow, cluster.leftCol),
      isEmpty: this.grid.getCellRaw(cluster.topRow, cluster.leftCol).trim() === ""
    };

    const topRight = {
      filled: this.grid.getCellRaw(cluster.topRow, cluster.rightCol).trim() !== "",
      content: this.grid.getCellRaw(cluster.topRow, cluster.rightCol),
      isEmpty: this.grid.getCellRaw(cluster.topRow, cluster.rightCol).trim() === ""
    };

    const bottomLeft = {
      filled: this.grid.getCellRaw(cluster.bottomRow, cluster.leftCol).trim() !== "",
      content: this.grid.getCellRaw(cluster.bottomRow, cluster.leftCol),
      isEmpty: this.grid.getCellRaw(cluster.bottomRow, cluster.leftCol).trim() === ""
    };

    const bottomRight = {
      filled: this.grid.getCellRaw(cluster.bottomRow, cluster.rightCol).trim() !== "",
      content: this.grid.getCellRaw(cluster.bottomRow, cluster.rightCol),
      isEmpty: this.grid.getCellRaw(cluster.bottomRow, cluster.rightCol).trim() === ""
    };

    const corners = [topLeft, topRight, bottomLeft, bottomRight];
    const filledCornerCount = corners.filter(corner => corner.filled).length;
    const emptyCornerCount = corners.filter(corner => corner.isEmpty).length;

    // Determine primary corner (usually top-left for trees)
    let primaryCorner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | undefined;
    if (topLeft.filled) primaryCorner = "topLeft";
    else if (topRight.filled) primaryCorner = "topRight";
    else if (bottomLeft.filled) primaryCorner = "bottomLeft";
    else if (bottomRight.filled) primaryCorner = "bottomRight";

    return {
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
      filledCornerCount,
      emptyCornerCount,
      primaryCorner
    };
  }

  /**
   * Parse Edge Analysis
   */
  private parseEdgeAnalysis(cluster: CellCluster): EdgeAnalysis {
    const analyzeEdge = (cells: string[]): {
      fillPattern: string;
      density: number;
      hasGaps: boolean;
      isFullyFilled: boolean;
      firstFilledIndex?: number;
      lastFilledIndex?: number;
    } => {
      const pattern = cells.map(cell => cell.trim() !== "" ? "1" : "0").join("");
      const filledCount = cells.filter(cell => cell.trim() !== "").length;
      const density = cells.length > 0 ? filledCount / cells.length : 0;
      const hasGaps = pattern.includes("0");
      const isFullyFilled = !hasGaps;
      
      let firstFilledIndex: number | undefined;
      let lastFilledIndex: number | undefined;
      
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].trim() !== "") {
          if (firstFilledIndex === undefined) firstFilledIndex = i;
          lastFilledIndex = i;
        }
      }

      return {
        fillPattern: pattern,
        density,
        hasGaps,
        isFullyFilled,
        firstFilledIndex,
        lastFilledIndex
      };
    };

    // Top edge
    const topCells: string[] = [];
    for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
      topCells.push(this.grid.getCellRaw(cluster.topRow, col));
    }

    // Bottom edge
    const bottomCells: string[] = [];
    for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
      bottomCells.push(this.grid.getCellRaw(cluster.bottomRow, col));
    }

    // Left edge
    const leftCells: string[] = [];
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      leftCells.push(this.grid.getCellRaw(row, cluster.leftCol));
    }

    // Right edge
    const rightCells: string[] = [];
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      rightCells.push(this.grid.getCellRaw(row, cluster.rightCol));
    }

    const top = analyzeEdge(topCells);
    const bottom = analyzeEdge(bottomCells);
    const left = analyzeEdge(leftCells);
    const right = analyzeEdge(rightCells);

    const fullyFilledEdges: Array<"top" | "bottom" | "left" | "right"> = [];
    if (top.isFullyFilled) fullyFilledEdges.push("top");
    if (bottom.isFullyFilled) fullyFilledEdges.push("bottom");
    if (left.isFullyFilled) fullyFilledEdges.push("left");
    if (right.isFullyFilled) fullyFilledEdges.push("right");

    const regularEdges: Array<"top" | "bottom" | "left" | "right"> = [];
    if (top.density > 0.8) regularEdges.push("top");
    if (bottom.density > 0.8) regularEdges.push("bottom");
    if (left.density > 0.8) regularEdges.push("left");
    if (right.density > 0.8) regularEdges.push("right");

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
   * Parse Indentation Analysis
   */
  private parseIndentationAnalysis(cluster: CellCluster): IndentationAnalysis {
    const indentations = new Set<number>();
    let maxIndentation = 0;
    let hasConsistentIndentation = true;
    
    // Analyze row-by-row indentation (primary direction down)
    const rowIndentations: number[] = [];
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      let firstFilledCol = -1;
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          firstFilledCol = col;
          break;
        }
      }
      if (firstFilledCol >= 0) {
        const indentation = firstFilledCol - cluster.leftCol;
        indentations.add(indentation);
        rowIndentations.push(indentation);
        maxIndentation = Math.max(maxIndentation, indentation);
      }
    }

    // Check for tree pattern (indentation can increase by 1 and decrease by any amount)
    let followsTreePattern = true;
    for (let i = 1; i < rowIndentations.length; i++) {
      const increase = rowIndentations[i] - rowIndentations[i - 1];
      if (increase > 1) { // Tree constraint: children can only be 1 level deeper
        followsTreePattern = false;
        break;
      }
    }

    // Check for list pattern (consistent indentation)
    const followsListPattern = indentations.size <= 2; // Lists typically have 0-1 indentation levels

    // Check consistency
    if (indentations.size > 3) {
      hasConsistentIndentation = false; // Too many different indentation levels
    }

    return {
      hasConsistentIndentation,
      indentationLevels: indentations.size,
      maxIndentation,
      indentationDirection: Direction.Right, // Primary indentation direction
      followsTreePattern,
      followsListPattern
    };
  }

  // Helper methods for gap and indentation analysis

  /**
   * Analyze indentation increase patterns for tree detection
   */
  private analyzeIndentationIncrease(cluster: CellCluster): { 
    maxRowIndentationIncrease: number;
    maxColumnIndentationIncrease: number;
  } {
    let maxRowIndentationIncrease = 0;
    let maxColumnIndentationIncrease = 0;

    // Analyze row-by-row indentation (for down-right trees)
    const rowIndentations: number[] = [];
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      let firstFilledCol = -1;
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          firstFilledCol = col;
          break;
        }
      }
      if (firstFilledCol >= 0) {
        rowIndentations.push(firstFilledCol - cluster.leftCol);
      }
    }

    // Calculate max indentation increase between consecutive rows
    for (let i = 1; i < rowIndentations.length; i++) {
      const increase = rowIndentations[i] - rowIndentations[i - 1];
      if (increase > maxRowIndentationIncrease) {
        maxRowIndentationIncrease = increase;
      }
    }

    // Analyze column-by-column indentation (for right-down trees)
    const colIndentations: number[] = [];
    for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
      let firstFilledRow = -1;
      for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          firstFilledRow = row;
          break;
        }
      }
      if (firstFilledRow >= 0) {
        colIndentations.push(firstFilledRow - cluster.topRow);
      }
    }

    // Calculate max indentation increase between consecutive columns
    for (let i = 1; i < colIndentations.length; i++) {
      const increase = colIndentations[i] - colIndentations[i - 1];
      if (increase > maxColumnIndentationIncrease) {
        maxColumnIndentationIncrease = increase;
      }
    }

    return { maxRowIndentationIncrease, maxColumnIndentationIncrease };
  }

  /**
   * Analyze gaps in rows for tree detection
   */
  private analyzeRowGaps(cluster: CellCluster): {
    maxGapSizeInAnyRow: number;
    maxGapCountInAnyRow: number;
    maxFilledCellsBeforeAnyRowGap: number;
    nonParentRowsWithGap: number;
  } {
    let maxGapSizeInAnyRow = 0;
    let maxGapCountInAnyRow = 0;
    let maxFilledCellsBeforeAnyRowGap = 0;
    let rowsWithGaps = 0;

    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      const rowCells: boolean[] = [];
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        rowCells.push(this.grid.getCellRaw(row, col).trim() !== "");
      }

      // Find gaps in this row
      const { gapCount, maxGapSize, filledCellsBeforeFirstGap } = this.analyzeGapsInSequence(rowCells);
      
      if (gapCount > 0) {
        rowsWithGaps++;
        maxGapSizeInAnyRow = Math.max(maxGapSizeInAnyRow, maxGapSize);
        maxGapCountInAnyRow = Math.max(maxGapCountInAnyRow, gapCount);
        maxFilledCellsBeforeAnyRowGap = Math.max(maxFilledCellsBeforeAnyRowGap, filledCellsBeforeFirstGap);
      }
    }

    // For tree detection, we need to identify which rows have gaps that are NOT parent rows
    // This is a simplified heuristic - in practice, we'd need more sophisticated parent detection
    const nonParentRowsWithGap = Math.max(0, rowsWithGaps - 1); // Assume at most 1 parent row can have gaps

    return {
      maxGapSizeInAnyRow,
      maxGapCountInAnyRow,
      maxFilledCellsBeforeAnyRowGap,
      nonParentRowsWithGap
    };
  }

  /**
   * Analyze gaps in columns for tree detection
   */
  private analyzeColumnGaps(cluster: CellCluster): {
    maxGapSizeInAnyColumn: number;
    maxGapCountInAnyColumn: number;
    maxFilledCellsBeforeAnyColumnGap: number;
    nonParentColumnsWithGap: number;
  } {
    let maxGapSizeInAnyColumn = 0;
    let maxGapCountInAnyColumn = 0;
    let maxFilledCellsBeforeAnyColumnGap = 0;
    let columnsWithGaps = 0;

    for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
      const colCells: boolean[] = [];
      for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
        colCells.push(this.grid.getCellRaw(row, col).trim() !== "");
      }

      // Find gaps in this column
      const { gapCount, maxGapSize, filledCellsBeforeFirstGap } = this.analyzeGapsInSequence(colCells);
      
      if (gapCount > 0) {
        columnsWithGaps++;
        maxGapSizeInAnyColumn = Math.max(maxGapSizeInAnyColumn, maxGapSize);
        maxGapCountInAnyColumn = Math.max(maxGapCountInAnyColumn, gapCount);
        maxFilledCellsBeforeAnyColumnGap = Math.max(maxFilledCellsBeforeAnyColumnGap, filledCellsBeforeFirstGap);
      }
    }

    // For tree detection, we need to identify which columns have gaps that are NOT parent columns
    const nonParentColumnsWithGap = Math.max(0, columnsWithGaps - 1); // Assume at most 1 parent column can have gaps

    return {
      maxGapSizeInAnyColumn,
      maxGapCountInAnyColumn,
      maxFilledCellsBeforeAnyColumnGap,
      nonParentColumnsWithGap
    };
  }

  /**
   * Analyze gaps in a sequence of filled/empty cells
   */
  private analyzeGapsInSequence(cells: boolean[]): {
    gapCount: number;
    maxGapSize: number;
    filledCellsBeforeFirstGap: number;
  } {
    let gapCount = 0;
    let maxGapSize = 0;
    let filledCellsBeforeFirstGap = 0;
    let currentGapSize = 0;
    let inGap = false;
    let firstGapFound = false;

    for (let i = 0; i < cells.length; i++) {
      const isFilled = cells[i];
      
      if (!isFilled && !inGap) {
        // Starting a new gap
        inGap = true;
        currentGapSize = 1;
        gapCount++;
        firstGapFound = true;
      } else if (!isFilled && inGap) {
        // Continuing a gap
        currentGapSize++;
      } else if (isFilled && inGap) {
        // Ending a gap
        inGap = false;
        maxGapSize = Math.max(maxGapSize, currentGapSize);
        currentGapSize = 0;
      } else if (isFilled && !firstGapFound) {
        // Counting filled cells before first gap
        filledCellsBeforeFirstGap++;
      }
    }

    // Handle case where sequence ends with a gap
    if (inGap) {
      maxGapSize = Math.max(maxGapSize, currentGapSize);
    }

    return { gapCount, maxGapSize, filledCellsBeforeFirstGap };
  }

  // Helper methods for pattern detection

  private checkHierarchicalIndentation(cluster: CellCluster): boolean {
    const indentationLevels = new Set<number>();
    
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      let firstFilledCol = -1;
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          firstFilledCol = col;
          break;
        }
      }
      if (firstFilledCol >= 0) {
        indentationLevels.add(firstFilledCol - cluster.leftCol);
      }
    }

    // Hierarchical if we have multiple indentation levels
    return indentationLevels.size > 1;
  }

  private checkColumnAlignment(cluster: CellCluster): boolean {
    // Check if filled cells align vertically in columns
    const columnHasFilled = new Map<number, boolean>();
    
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          columnHasFilled.set(col, true);
        }
      }
    }

    // Check if each column that has any filled cells has filled cells in most rows
    let alignedColumns = 0;
    for (const [col, hasFilled] of columnHasFilled) {
      if (hasFilled) {
        let filledInColumn = 0;
        for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
          if (this.grid.getCellRaw(row, col).trim() !== "") {
            filledInColumn++;
          }
        }
        const rowCount = cluster.bottomRow - cluster.topRow + 1;
        if (filledInColumn / rowCount > 0.6) { // 60% of rows have data in this column
          alignedColumns++;
        }
      }
    }

    return alignedColumns >= 2; // At least 2 well-aligned columns
  }

  private checkKeyValuePairs(cluster: CellCluster): boolean {
    let pairRows = 0;
    const totalRows = cluster.bottomRow - cluster.topRow + 1;

    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      let filledCells = 0;
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          filledCells++;
        }
      }
      // Consider it a key-value pair if exactly 2 cells are filled in the row
      if (filledCells === 2) {
        pairRows++;
      }
    }

    // Key-value pattern if most rows have exactly 2 filled cells
    return pairRows / totalRows > 0.6;
  }

  private checkConsistentRowPairs(cluster: CellCluster): boolean {
    const rowLengths: number[] = [];
    
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      let filledCells = 0;
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          filledCells++;
        }
      }
      if (filledCells > 0) {
        rowLengths.push(filledCells);
      }
    }

    // Check if most rows have the same number of filled cells
    if (rowLengths.length === 0) return false;
    
    const mostCommonLength = rowLengths.reduce((a, b, i, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    );
    
    const consistentRows = rowLengths.filter(length => length === mostCommonLength).length;
    return consistentRows / rowLengths.length > 0.7;
  }

  private calculateGridLikeness(cluster: CellCluster): number {
    const totalCells = (cluster.rightCol - cluster.leftCol + 1) * (cluster.bottomRow - cluster.topRow + 1);
    const filledCells = cluster.filledPoints.length;
    const fillRatio = filledCells / totalCells;

    // Check row consistency
    const rowFillCounts: number[] = [];
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      let filled = 0;
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          filled++;
        }
      }
      rowFillCounts.push(filled);
    }

    // Check column consistency
    const colFillCounts: number[] = [];
    for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
      let filled = 0;
      for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          filled++;
        }
      }
      colFillCounts.push(filled);
    }

    // Calculate consistency (low variance = more grid-like)
    const rowVariance = this.calculateVariance(rowFillCounts);
    const colVariance = this.calculateVariance(colFillCounts);
    const avgVariance = (rowVariance + colVariance) / 2;
    
    // Normalize: high fill ratio + low variance = high grid-likeness
    const consistencyScore = Math.max(0, 1 - (avgVariance / Math.max(1, Math.max(...rowFillCounts, ...colFillCounts))));
    
    return (fillRatio * 0.6) + (consistencyScore * 0.4);
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  // Basic helper methods for original base trait parsing

  private isRectangular(cluster: CellCluster): boolean {
    const width = cluster.rightCol - cluster.leftCol + 1;
    const height = cluster.bottomRow - cluster.topRow + 1;
    return cluster.filledPoints.length === width * height;
  }

  private isContiguous(cluster: CellCluster): boolean {
    // Simple check - in a contiguous cluster, all cells should be filled
    // This is a simplified implementation
    return this.isRectangular(cluster);
  }

  private hasConcavity(cluster: CellCluster): boolean {
    // Simple heuristic - if it's not rectangular and has gaps, likely has concavity
    return !this.isRectangular(cluster);
  }

  private detectHeaders(cluster: CellCluster): boolean {
    // Check if top row contains text while other rows contain numbers/formulas
    const topRowCells: string[] = [];
    for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
      topRowCells.push(this.grid.getCellRaw(cluster.topRow, col).trim());
    }

    const topRowHasText = topRowCells.some(cell => cell !== "" && !/^\d+(\.\d+)?$/.test(cell) && !cell.startsWith("="));
    return topRowHasText;
  }

  private detectColumnStructure(cluster: CellCluster): boolean {
    // Check if there are consistent columns of data
    const columnCount = cluster.rightCol - cluster.leftCol + 1;
    if (columnCount < 2) return false;

    let consistentColumns = 0;
    for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
      let filledInColumn = 0;
      for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          filledInColumn++;
        }
      }
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      if (filledInColumn / rowCount > 0.5) { // More than half the column is filled
        consistentColumns++;
      }
    }

    return consistentColumns >= 2;
  }

  private detectRowStructure(cluster: CellCluster): boolean {
    // Check if there are consistent rows of data
    const rowCount = cluster.bottomRow - cluster.topRow + 1;
    if (rowCount < 2) return false;

    let consistentRows = 0;
    for (let row = cluster.topRow; row <= cluster.bottomRow; row++) {
      let filledInRow = 0;
      for (let col = cluster.leftCol; col <= cluster.rightCol; col++) {
        if (this.grid.getCellRaw(row, col).trim() !== "") {
          filledInRow++;
        }
      }
      const columnCount = cluster.rightCol - cluster.leftCol + 1;
      if (filledInRow / columnCount > 0.5) { // More than half the row is filled
        consistentRows++;
      }
    }

    return consistentRows >= 2;
  }

  private detectHierarchicalStructure(cluster: CellCluster): boolean {
    return this.checkHierarchicalIndentation(cluster);
  }

  private determineDataType(composite: CellClusterCompositeTraits): "financial" | "personal" | "scientific" | "categorical" | "temporal" | "textual" | "mixed" {
    if (composite.hasNumericContent && composite.hasTextContent) return "mixed";
    if (composite.hasNumericContent) return "financial"; // Simple heuristic
    return "textual";
  }

  private determineSemanticRole(composite: CellClusterCompositeTraits, base: CellClusterBaseTraits): "header" | "data" | "summary" | "formula" | "constant" | "variable" | "title" | "navigation" | "footer" | "mixed" {
    if (composite.hasHeaders) return "header";
    if (composite.hasFormulas) return "formula";
    if (composite.hasTabularStructure) return "data";
    return "data";
  }

  private determineDirections(base: CellClusterBaseTraits): { primaryDirection: "horizontal" | "vertical" | "radial" | "none"; secondaryDirection: "horizontal" | "vertical" | "radial" | "none" } {
    if (base.aspectRatio > 1.5) {
      return { primaryDirection: "horizontal", secondaryDirection: "vertical" };
    } else if (base.aspectRatio < 0.67) {
      return { primaryDirection: "vertical", secondaryDirection: "horizontal" };
    }
    return { primaryDirection: "horizontal", secondaryDirection: "vertical" };
  }

  private determineConstructTypes(composite: CellClusterCompositeTraits, base: CellClusterBaseTraits): string[] {
    const constructs: string[] = [];
    
    if (composite.hasHierarchicalStructure) constructs.push("tree");
    if (composite.hasTabularStructure) constructs.push("table");
    if (base.isRectangular && base.fillRatio > 0.8) constructs.push("matrix");
    
    return constructs;
  }

  private calculateConstructConfidence(constructs: string[]): number {
    return constructs.length > 0 ? 0.8 : 0.2;
  }
}