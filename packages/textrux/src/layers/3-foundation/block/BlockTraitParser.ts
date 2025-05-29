import Block from "./Block";
import {
  BlockTraits,
  BlockBaseTraits,
  BlockCompositeTraits,
  BlockDerivedTraits,
} from "./BlockTraits";
import GridModel from "../../1-substrate/GridModel";

/**
 * Parses and analyzes Block instances to populate their trait properties
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

    const canvasCellCount = block.canvasPoints.length;
    const totalBoundingCellCount = area;
    const fillDensity = canvasCellCount / totalBoundingCellCount;

    // Shape analysis
    const isSquare = width === height;
    const isRectangular = width !== height;
    const isLinear = width === 1 || height === 1;
    const isHorizontalLine = height === 1 && width > 1;
    const isVerticalLine = width === 1 && height > 1;
    const isSingleCell = width === 1 && height === 1;

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
      totalBoundingCellCount,
      fillDensity,
      isSquare,
      isRectangular,
      isLinear,
      isHorizontalLine,
      isVerticalLine,
      isSingleCell,
    };
  }

  /**
   * Parse content and structural patterns
   */
  private parseCompositeTraits(
    block: Block,
    base: BlockBaseTraits
  ): BlockCompositeTraits {
    // Analyze content of canvas cells
    const cellContents = block.canvasPoints
      .map((pt) => this.grid.getCellRaw(pt.row, pt.col).trim())
      .filter((content) => content.length > 0);

    // Content type analysis
    const numericCells = cellContents.filter((content) =>
      this.isNumeric(content)
    );
    const formulaCells = cellContents.filter((content) =>
      content.startsWith("=")
    );
    const textCells = cellContents.filter(
      (content) => !this.isNumeric(content) && !content.startsWith("=")
    );

    const hasNumericContent = numericCells.length > 0;
    const hasTextContent = textCells.length > 0;
    const hasFormulas = formulaCells.length > 0;
    const hasMixedContent =
      [hasNumericContent, hasTextContent, hasFormulas].filter(Boolean).length >
      1;
    const hasUniformContent = !hasMixedContent && cellContents.length > 0;

    // Data type classification
    const dataTypes: string[] = [];
    if (hasNumericContent) dataTypes.push("number");
    if (hasTextContent) dataTypes.push("text");
    if (hasFormulas) dataTypes.push("formula");

    const dominantDataType = this.getDominantDataType(
      numericCells,
      textCells,
      formulaCells
    );

    // Structural analysis
    const hasHeaders = this.detectHeaders(block, base);
    const hasFooters = this.detectFooters(block, base);
    const hasBorders = this.detectBorders(block);
    const hasPattern = this.detectPattern(block);

    // Content alignment analysis
    const contentAlignment = this.analyzeContentAlignment(block);
    const hasColumnStructure = this.detectColumnStructure(block, base);
    const hasRowStructure = this.detectRowStructure(block, base);

    // Empty space analysis
    const emptyToFilledRatio =
      (base.totalBoundingCellCount - base.canvasCellCount) /
      base.totalBoundingCellCount;
    const hasSignificantWhitespace = emptyToFilledRatio > 0.3;

    return {
      hasUniformContent,
      hasNumericContent,
      hasTextContent,
      hasFormulas,
      hasMixedContent,
      hasHeaders,
      hasFooters,
      hasBorders,
      hasPattern,
      contentAlignment,
      hasColumnStructure,
      hasRowStructure,
      dataTypes,
      dominantDataType,
      hasSignificantWhitespace,
      emptyToFilledRatio,
    };
  }

  /**
   * Parse high-level interpretations and construct indicators
   */
  private parseDerivedTraits(
    block: Block,
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): BlockDerivedTraits {
    // Analyze potential constructs
    const likelyConstructs = this.identifyLikelyConstructs(base, composite);
    const confidence = this.calculateConstructConfidence(
      likelyConstructs,
      base,
      composite
    );

    // Behavioral classification
    const isContainer = base.fillDensity < 0.5 && base.area > 4;
    const isLeaf =
      base.isSingleCell || (base.area <= 4 && base.fillDensity > 0.8);
    const isHeader = this.isLikelyHeader(block, base, composite);
    const isFooter = this.isLikelyFooter(block, base, composite);
    const isData = composite.hasNumericContent && !isHeader && !isFooter;
    const isNavigation = this.isLikelyNavigation(base, composite);

    // Directional analysis
    const primaryDirection = this.determinePrimaryDirection(base, composite);
    const secondaryDirection = this.determineSecondaryDirection(
      base,
      composite,
      primaryDirection
    );

    // Relationship indicators (simplified for now - would need broader context)
    const isParent = isContainer;
    const isChild = !isContainer && base.area <= 16;
    const isSibling = !isParent && !isChild;
    const nestingLevel = 0; // Would need hierarchical analysis

    // Semantic analysis
    const semanticRole = this.determineSemanticRole(
      base,
      composite,
      isHeader,
      isFooter,
      isData
    );
    const importance = this.calculateImportance(base, composite, semanticRole);

    return {
      likelyConstructs,
      confidence,
      isContainer,
      isLeaf,
      isHeader,
      isFooter,
      isData,
      isNavigation,
      primaryDirection,
      secondaryDirection,
      isParent,
      isChild,
      isSibling,
      nestingLevel,
      semanticRole,
      importance,
    };
  }

  // Helper methods for content analysis
  private isNumeric(content: string): boolean {
    return !isNaN(Number(content)) && content.trim() !== "";
  }

  private getDominantDataType(
    numeric: string[],
    text: string[],
    formulas: string[]
  ): string {
    const counts: Record<string, number> = {
      text: text.length,
      number: numeric.length,
      formula: formulas.length,
    };

    return Object.entries(counts).reduce(
      (a, b) => (counts[a[0]] > counts[b[0]] ? a : b),
      ["text", 0]
    )[0];
  }

  private detectHeaders(block: Block, base: BlockBaseTraits): boolean {
    // Check if top row has text content
    const topRowCells = block.canvasPoints
      .filter((pt) => pt.row === base.topRow)
      .map((pt) => this.grid.getCellRaw(pt.row, pt.col).trim());

    return (
      topRowCells.length > 0 &&
      topRowCells.every(
        (content) =>
          content.length > 0 &&
          !this.isNumeric(content) &&
          !content.startsWith("=")
      )
    );
  }

  private detectFooters(block: Block, base: BlockBaseTraits): boolean {
    // Check if bottom row has summary-like content
    const bottomRowCells = block.canvasPoints
      .filter((pt) => pt.row === base.bottomRow)
      .map((pt) => this.grid.getCellRaw(pt.row, pt.col).trim());

    return bottomRowCells.some(
      (content) =>
        content.toLowerCase().includes("total") ||
        content.toLowerCase().includes("sum") ||
        content.startsWith("=")
    );
  }

  private detectBorders(block: Block): boolean {
    // Simplified border detection - check if border points exist
    return block.borderPoints.length > 0;
  }

  private detectPattern(block: Block): boolean {
    // Simplified pattern detection - check for repeating structures
    if (block.canvasPoints.length < 4) return false;

    const contents = block.canvasPoints.map((pt) =>
      this.grid.getCellRaw(pt.row, pt.col).trim()
    );

    // Look for alternating patterns or sequences
    const uniqueContents = new Set(contents.filter((c) => c.length > 0));
    return uniqueContents.size > 1 && uniqueContents.size < contents.length / 2;
  }

  private analyzeContentAlignment(
    block: Block
  ): "left" | "right" | "center" | "mixed" | "none" {
    // Simplified alignment analysis
    return "mixed"; // Would need more sophisticated text analysis
  }

  private detectColumnStructure(block: Block, base: BlockBaseTraits): boolean {
    return base.width > 1 && base.height > 1;
  }

  private detectRowStructure(block: Block, base: BlockBaseTraits): boolean {
    return base.height > 1 && base.width > 1;
  }

  private identifyLikelyConstructs(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): string[] {
    const constructs: string[] = [];

    // Table detection
    if (
      composite.hasHeaders &&
      composite.hasRowStructure &&
      composite.hasColumnStructure
    ) {
      constructs.push("table");
    }

    // List detection
    if (
      base.isVerticalLine ||
      (base.height > base.width && composite.hasRowStructure)
    ) {
      constructs.push("list");
    }

    // Header detection
    if (
      composite.hasTextContent &&
      !composite.hasNumericContent &&
      base.isHorizontalLine
    ) {
      constructs.push("header");
    }

    // Tree detection (simplified)
    if (composite.hasSignificantWhitespace && composite.hasMixedContent) {
      constructs.push("tree");
    }

    return constructs;
  }

  private calculateConstructConfidence(
    constructs: string[],
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): number {
    if (constructs.length === 0) return 0;

    // Simple confidence calculation based on trait strength
    let confidence = 0.5; // Base confidence

    if (composite.hasHeaders) confidence += 0.2;
    if (composite.hasPattern) confidence += 0.1;
    if (base.fillDensity > 0.7) confidence += 0.1;
    if (!composite.hasMixedContent) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private isLikelyHeader(
    block: Block,
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): boolean {
    return (
      base.topRow <= 3 &&
      composite.hasTextContent &&
      !composite.hasNumericContent
    );
  }

  private isLikelyFooter(
    block: Block,
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): boolean {
    return composite.hasFormulas || base.bottomRow >= this.grid.rowCount - 2;
  }

  private isLikelyNavigation(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): boolean {
    return (
      base.isLinear && composite.hasTextContent && !composite.hasNumericContent
    );
  }

  private determinePrimaryDirection(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits
  ): "horizontal" | "vertical" | "radial" | "none" {
    if (base.isHorizontalLine) return "horizontal";
    if (base.isVerticalLine) return "vertical";
    if (base.width > base.height * 1.5) return "horizontal";
    if (base.height > base.width * 1.5) return "vertical";
    return "none";
  }

  private determineSecondaryDirection(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits,
    primary: string
  ): "horizontal" | "vertical" | "radial" | "none" {
    if (primary === "horizontal" && base.height > 1) return "vertical";
    if (primary === "vertical" && base.width > 1) return "horizontal";
    return "none";
  }

  private determineSemanticRole(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits,
    isHeader: boolean,
    isFooter: boolean,
    isData: boolean
  ): string {
    if (isHeader) return "header";
    if (isFooter) return "footer";
    if (isData) return "data";
    if (composite.hasTextContent && !composite.hasNumericContent)
      return "label";
    return "content";
  }

  private calculateImportance(
    base: BlockBaseTraits,
    composite: BlockCompositeTraits,
    semanticRole: string
  ): number {
    let importance = 0.5; // Base importance

    // Size contributes to importance
    importance += Math.min(base.area / 100, 0.2);

    // Position contributes (top-left is more important)
    if (base.topRow <= 3) importance += 0.1;
    if (base.leftCol <= 3) importance += 0.05;

    // Role contributes
    if (semanticRole === "header") importance += 0.2;
    if (semanticRole === "footer") importance += 0.1;
    if (composite.hasFormulas) importance += 0.1;

    return Math.min(importance, 1.0);
  }
}
