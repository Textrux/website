import {
  ConstructSignatureParser,
  ConstructSignature,
} from "../../interfaces/ConstructInterfaces";
import Matrix, { MatrixCell } from "./Matrix";
import { MatrixSignatures } from "./MatrixSignatures";
import CellCluster from "../../../3-foundation/cell-cluster/CellCluster";

/**
 * Parser for identifying and creating Matrix constructs from cell clusters
 */
export class MatrixSignatureParser implements ConstructSignatureParser<Matrix> {
  constructType: string = "matrix";
  signatures: ConstructSignature[] = MatrixSignatures;

  parseConstruct(cluster: CellCluster): Matrix[] {
    const matrices: Matrix[] = [];

    if (!cluster.traits) return matrices;

    for (const signature of this.signatures) {
      const confidence = this.calculateConfidence(signature, cluster.traits);

      if (confidence >= signature.minConfidence) {
        if (
          signature.validate &&
          !signature.validate(cluster.traits, cluster)
        ) {
          continue;
        }

        const matrix = this.createConstruct(signature, cluster, confidence);
        if (matrix) {
          matrices.push(matrix);
        }
      }
    }

    return matrices;
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
  ): Matrix {
    const matrixId = `matrix_${cluster.leftCol}_${
      cluster.topRow
    }_${Date.now()}`;

    const matrix = new Matrix(matrixId, confidence, signature.name, {
      topRow: cluster.topRow,
      bottomRow: cluster.bottomRow,
      leftCol: cluster.leftCol,
      rightCol: cluster.rightCol,
    });

    this.buildMatrixStructure(matrix, cluster, signature);
    matrix.analyzeStructure();

    return matrix;
  }

  private buildMatrixStructure(
    matrix: Matrix,
    cluster: CellCluster,
    signature: ConstructSignature
  ): void {
    const rowCount = cluster.bottomRow - cluster.topRow + 1;
    const columnCount = cluster.rightCol - cluster.leftCol + 1;

    matrix.initializeStructure(rowCount, columnCount);

    for (let matrixRow = 0; matrixRow < rowCount; matrixRow++) {
      for (let matrixCol = 0; matrixCol < columnCount; matrixCol++) {
        const gridRow = cluster.topRow + matrixRow;
        const gridCol = cluster.leftCol + matrixCol;

        const content = this.getCellContent(gridRow, gridCol);
        const numericValue = this.parseNumericValue(content);

        const cell: MatrixCell = {
          position: {
            row: gridRow,
            col: gridCol,
            relativeRow: matrixRow,
            relativeCol: matrixCol,
          },
          value: numericValue,
          content: content || "",
          matrixRow,
          matrixColumn: matrixCol,
          isFormula: content?.startsWith("=") || false,
          isEmpty: !content || content.trim() === "",
        };

        matrix.addCell(cell);
      }
    }
  }

  private parseNumericValue(content: string): number {
    if (!content || !content.trim()) return 0;

    const trimmed = content.trim();
    if (trimmed.startsWith("=")) {
      // Handle formulas - for now just return 0
      return 0;
    }

    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? 0 : parsed;
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
