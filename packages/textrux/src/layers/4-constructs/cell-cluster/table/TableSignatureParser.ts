import {
  ConstructSignatureParser,
  ConstructSignature,
} from "../../interfaces/ConstructInterfaces";
import Table, { TableCell } from "./Table";
import { TableSignatures } from "./TableSignatures";
import CellCluster from "../../../3-foundation/cell-cluster/CellCluster";

/**
 * Parser for identifying and creating Table constructs from cell clusters
 */
export class TableSignatureParser implements ConstructSignatureParser<Table> {
  constructType: string = "table";
  signatures: ConstructSignature[] = TableSignatures;

  /**
   * Parse a cell cluster and return Table construct instances if found
   */
  parseConstruct(cluster: CellCluster): Table[] {
    const tables: Table[] = [];

    if (!cluster.traits) {
      return tables;
    }

    // Try each signature to see if it matches
    for (const signature of this.signatures) {
      const confidence = this.calculateConfidence(signature, cluster.traits);

      if (confidence >= signature.minConfidence) {
        // Additional validation if specified
        if (
          signature.validate &&
          !signature.validate(cluster.traits, cluster)
        ) {
          continue;
        }

        const table = this.createConstruct(signature, cluster, confidence);
        if (table) {
          tables.push(table);
        }
      }
    }

    return tables;
  }

  /**
   * Calculate confidence score for a specific signature
   */
  calculateConfidence(signature: ConstructSignature, traits: any): number {
    let score = 0;
    let totalWeight = 0;

    // Check required traits (must all be present)
    for (const requiredTrait of signature.requiredTraits) {
      if (!this.getTraitValue(traits, requiredTrait)) {
        return 0; // Required trait missing, confidence is 0
      }
    }

    // Calculate weighted score from optional traits
    for (const [traitPath, weight] of Object.entries(signature.traitWeights)) {
      totalWeight += weight;
      const traitValue = this.getTraitValue(traits, traitPath);

      if (traitValue) {
        // If it's a boolean trait, use full weight
        // If it's a numeric trait, use proportional weight
        if (typeof traitValue === "boolean" && traitValue) {
          score += weight;
        } else if (typeof traitValue === "number") {
          score += weight * Math.min(traitValue, 1); // Cap at 1.0
        }
      }
    }

    // Normalize score
    return totalWeight > 0 ? Math.min(score / totalWeight, 1.0) : 0;
  }

  /**
   * Create Table construct instance from signature match
   */
  createConstruct(
    signature: ConstructSignature,
    cluster: CellCluster,
    confidence: number
  ): Table {
    const tableId = `table_${cluster.leftCol}_${cluster.topRow}_${Date.now()}`;

    // Create the table instance
    const table = new Table(tableId, confidence, signature.name, {
      topRow: cluster.topRow,
      bottomRow: cluster.bottomRow,
      leftCol: cluster.leftCol,
      rightCol: cluster.rightCol,
    });

    // Build the table structure from the cell cluster
    this.buildTableStructure(table, cluster, signature);

    // Analyze the table structure
    table.analyzeStructure();

    return table;
  }

  /**
   * Build the table structure from the cell cluster content
   */
  private buildTableStructure(
    table: Table,
    cluster: CellCluster,
    signature: ConstructSignature
  ): void {
    const rowCount = cluster.bottomRow - cluster.topRow + 1;
    const columnCount = cluster.rightCol - cluster.leftCol + 1;

    // Initialize table structure
    table.initializeStructure(rowCount, columnCount);

    // Populate cells
    for (let tableRow = 0; tableRow < rowCount; tableRow++) {
      for (let tableCol = 0; tableCol < columnCount; tableCol++) {
        const gridRow = cluster.topRow + tableRow;
        const gridCol = cluster.leftCol + tableCol;

        const content = this.getCellContent(gridRow, gridCol);
        const dataType = this.detectDataType(content);

        const cell: TableCell = {
          position: {
            row: gridRow,
            col: gridCol,
            relativeRow: tableRow,
            relativeCol: tableCol,
          },
          content: content || "",
          isHeader: false, // Will be determined later
          tableRow,
          tableColumn: tableCol,
          dataType,
        };

        table.addCell(cell);
      }
    }
  }

  /**
   * Detect data type of cell content
   */
  private detectDataType(
    content: string
  ): "text" | "number" | "date" | "boolean" | "formula" | "empty" {
    if (!content || !content.trim()) {
      return "empty";
    }

    const trimmed = content.trim();

    if (trimmed.startsWith("=")) {
      return "formula";
    }

    if (!isNaN(Number(trimmed)) && trimmed !== "") {
      return "number";
    }

    if (this.isDateLike(trimmed)) {
      return "date";
    }

    if (this.isBooleanLike(trimmed)) {
      return "boolean";
    }

    return "text";
  }

  /**
   * Check if content looks like a date
   */
  private isDateLike(content: string): boolean {
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY
      /^\d{1,2}\.\d{1,2}\.\d{4}$/, // MM.DD.YYYY
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i, // Month names
    ];

    return datePatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Check if content looks like a boolean
   */
  private isBooleanLike(content: string): boolean {
    const lower = content.toLowerCase().trim();
    const booleanValues = [
      "true",
      "false",
      "yes",
      "no",
      "y",
      "n",
      "1",
      "0",
      "on",
      "off",
      "enabled",
      "disabled",
      "active",
      "inactive",
    ];

    return booleanValues.includes(lower);
  }

  /**
   * Get cell content (placeholder - would integrate with actual grid)
   */
  private getCellContent(row: number, col: number): string {
    // This would integrate with the actual GridModel to get cell content
    // For now, return empty string
    return "";
  }

  /**
   * Get trait value from nested trait object using dot notation
   */
  private getTraitValue(traits: any, traitPath: string): any {
    const parts = traitPath.split(".");
    let current = traits;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }
}
