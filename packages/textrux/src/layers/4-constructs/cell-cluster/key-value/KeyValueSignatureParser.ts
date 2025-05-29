import {
  ConstructSignatureParser,
  ConstructSignature,
  DirectionalOrientation,
} from "../../interfaces/ConstructInterfaces";
import KeyValue, { KeyValuePair } from "./KeyValue";
import { KeyValueSignatures } from "./KeyValueSignatures";
import CellCluster from "../../../3-foundation/cell-cluster/CellCluster";

/**
 * Parser for identifying and creating KeyValue constructs from cell clusters
 */
export class KeyValueSignatureParser
  implements ConstructSignatureParser<KeyValue>
{
  constructType: string = "key-value";
  signatures: ConstructSignature[] = KeyValueSignatures;

  parseConstruct(cluster: CellCluster): KeyValue[] {
    const keyValues: KeyValue[] = [];

    if (!cluster.traits) return keyValues;

    for (const signature of this.signatures) {
      const confidence = this.calculateConfidence(signature, cluster.traits);

      if (confidence >= signature.minConfidence) {
        if (
          signature.validate &&
          !signature.validate(cluster.traits, cluster)
        ) {
          continue;
        }

        const keyValue = this.createConstruct(signature, cluster, confidence);
        if (keyValue) {
          keyValues.push(keyValue);
        }
      }
    }

    return keyValues;
  }

  calculateConfidence(signature: ConstructSignature, traits: any): number {
    let score = 0;
    let totalWeight = 0;

    // Check required traits
    for (const requiredTrait of signature.requiredTraits) {
      if (!this.getTraitValue(traits, requiredTrait)) {
        return 0;
      }
    }

    // Calculate weighted score
    for (const [traitPath, weight] of Object.entries(signature.traitWeights)) {
      totalWeight += weight;
      const traitValue = this.getTraitValue(traits, traitPath);

      if (traitValue) {
        if (typeof traitValue === "boolean" && traitValue) {
          score += weight;
        } else if (typeof traitValue === "number") {
          score += weight * Math.min(traitValue, 1);
        }
      }
    }

    return totalWeight > 0 ? Math.min(score / totalWeight, 1.0) : 0;
  }

  createConstruct(
    signature: ConstructSignature,
    cluster: CellCluster,
    confidence: number
  ): KeyValue {
    const keyValueId = `keyvalue_${cluster.leftCol}_${
      cluster.topRow
    }_${Date.now()}`;

    // Determine orientation based on cluster dimensions
    const rowCount = cluster.bottomRow - cluster.topRow + 1;
    const colCount = cluster.rightCol - cluster.leftCol + 1;

    const orientation: DirectionalOrientation = {
      primary: rowCount > colCount ? "vertical" : "horizontal",
      secondary: rowCount > colCount ? "horizontal" : "vertical",
    };

    const keyValue = new KeyValue(
      keyValueId,
      confidence,
      signature.name,
      {
        topRow: cluster.topRow,
        bottomRow: cluster.bottomRow,
        leftCol: cluster.leftCol,
        rightCol: cluster.rightCol,
      },
      orientation
    );

    this.buildKeyValueStructure(keyValue, cluster, signature);
    keyValue.analyzeStructure();

    return keyValue;
  }

  private buildKeyValueStructure(
    keyValue: KeyValue,
    cluster: CellCluster,
    signature: ConstructSignature
  ): void {
    const rowCount = cluster.bottomRow - cluster.topRow + 1;
    const columnCount = cluster.rightCol - cluster.leftCol + 1;

    let pairIndex = 0;

    if (keyValue.orientation.primary === "vertical") {
      // Process row by row for vertical layout
      for (let row = 0; row < rowCount; row++) {
        const gridRow = cluster.topRow + row;

        if (columnCount === 1) {
          // Single column - look for key:value in same cell
          const content = this.getCellContent(gridRow, cluster.leftCol);
          const pair = this.parseInlinePair(
            content,
            gridRow,
            cluster.leftCol,
            pairIndex
          );
          if (pair) {
            keyValue.addPair(pair);
            pairIndex++;
          }
        } else if (columnCount >= 2) {
          // Multiple columns - key in first, value in second
          const keyContent = this.getCellContent(gridRow, cluster.leftCol);
          const valueContent = this.getCellContent(
            gridRow,
            cluster.leftCol + 1
          );

          if (keyContent && keyContent.trim()) {
            const pair: KeyValuePair = {
              keyPosition: {
                row: gridRow,
                col: cluster.leftCol,
                relativeRow: row,
                relativeCol: 0,
              },
              valuePosition: {
                row: gridRow,
                col: cluster.leftCol + 1,
                relativeRow: row,
                relativeCol: 1,
              },
              key: keyContent.trim(),
              value: valueContent?.trim() || "",
              separator: "",
              isSingleCell: false,
              valueType: "text",
              index: pairIndex,
            };

            keyValue.addPair(pair);
            pairIndex++;
          }
        }
      }
    } else {
      // Process column by column for horizontal layout
      for (let col = 0; col < columnCount; col++) {
        const gridCol = cluster.leftCol + col;

        if (rowCount === 1) {
          // Single row - look for key:value in same cell
          const content = this.getCellContent(cluster.topRow, gridCol);
          const pair = this.parseInlinePair(
            content,
            cluster.topRow,
            gridCol,
            pairIndex
          );
          if (pair) {
            keyValue.addPair(pair);
            pairIndex++;
          }
        } else if (rowCount >= 2) {
          // Multiple rows - key in first, value in second
          const keyContent = this.getCellContent(cluster.topRow, gridCol);
          const valueContent = this.getCellContent(cluster.topRow + 1, gridCol);

          if (keyContent && keyContent.trim()) {
            const pair: KeyValuePair = {
              keyPosition: {
                row: cluster.topRow,
                col: gridCol,
                relativeRow: 0,
                relativeCol: col,
              },
              valuePosition: {
                row: cluster.topRow + 1,
                col: gridCol,
                relativeRow: 1,
                relativeCol: col,
              },
              key: keyContent.trim(),
              value: valueContent?.trim() || "",
              separator: "",
              isSingleCell: false,
              valueType: "text",
              index: pairIndex,
            };

            keyValue.addPair(pair);
            pairIndex++;
          }
        }
      }
    }
  }

  private parseInlinePair(
    content: string,
    row: number,
    col: number,
    index: number
  ): KeyValuePair | null {
    if (!content || !content.trim()) return null;

    const separators = [":", "=", "->", "=>", "|"];
    let bestSeparator = "";
    let keyPart = "";
    let valuePart = "";

    // Find the best separator
    for (const sep of separators) {
      const parts = content.split(sep);
      if (parts.length === 2) {
        keyPart = parts[0].trim();
        valuePart = parts[1].trim();
        bestSeparator = sep;
        break;
      }
    }

    // If no separator found, treat whole content as key
    if (!bestSeparator) {
      keyPart = content.trim();
      valuePart = "";
      bestSeparator = "";
    }

    return {
      keyPosition: {
        row,
        col,
        relativeRow: row,
        relativeCol: col,
      },
      key: keyPart,
      value: valuePart,
      separator: bestSeparator,
      isSingleCell: true,
      valueType: "text",
      index,
    };
  }

  private getCellContent(row: number, col: number): string {
    // Placeholder - would integrate with actual GridModel
    return "";
  }

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
