import { ConstructSignature } from "../../interfaces/ConstructInterfaces";

/**
 * Signature definitions for identifying matrix structures in cell clusters
 */
export const MatrixSignatures: ConstructSignature[] = [
  {
    name: "numerical-matrix",
    description: "Mathematical matrix with primarily numerical values",
    minConfidence: 0.8,
    requiredTraits: ["arrangement.isRectangular", "content.hasNumericalData"],
    optionalTraits: [
      "content.hasMathematicalPattern",
      "content.hasUniformDataTypes",
      "spacing.hasUniformCellSizes",
      "arrangement.hasGridPattern",
      "content.lacksHeaders",
    ],
    traitWeights: {
      "content.hasNumericalData": 0.4,
      "content.hasMathematicalPattern": 0.2,
      "content.hasUniformDataTypes": 0.15,
      "spacing.hasUniformCellSizes": 0.15,
      "arrangement.hasGridPattern": 0.1,
    },
    validate: (traits, cluster) => {
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      const colCount = cluster.rightCol - cluster.leftCol + 1;
      return rowCount >= 2 && colCount >= 2;
    },
  },

  {
    name: "square-matrix",
    description: "Square matrix for mathematical operations",
    minConfidence: 0.85,
    requiredTraits: ["arrangement.isSquare", "content.hasNumericalData"],
    optionalTraits: [
      "content.hasSymmetricPattern",
      "content.hasDiagonalPattern",
      "content.hasIdentityPattern",
      "spacing.hasUniformCellSizes",
    ],
    traitWeights: {
      "content.hasNumericalData": 0.3,
      "content.hasSymmetricPattern": 0.25,
      "content.hasDiagonalPattern": 0.2,
      "content.hasIdentityPattern": 0.15,
      "spacing.hasUniformCellSizes": 0.1,
    },
    validate: (traits, cluster) => {
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      const colCount = cluster.rightCol - cluster.leftCol + 1;
      return rowCount === colCount && rowCount >= 2;
    },
  },

  {
    name: "correlation-matrix",
    description: "Correlation or covariance matrix with symmetric properties",
    minConfidence: 0.75,
    requiredTraits: ["arrangement.isSquare", "content.hasNumericalData"],
    optionalTraits: [
      "content.hasSymmetricPattern",
      "content.hasCorrelationValues",
      "content.hasDiagonalOnes",
      "content.hasRangeConstraints",
    ],
    traitWeights: {
      "content.hasSymmetricPattern": 0.35,
      "content.hasCorrelationValues": 0.25,
      "content.hasDiagonalOnes": 0.2,
      "content.hasRangeConstraints": 0.2,
    },
    validate: (traits, cluster) => {
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      return (
        rowCount === cluster.rightCol - cluster.leftCol + 1 && rowCount >= 3
      );
    },
  },
];

export function getMatrixSignature(
  name: string
): ConstructSignature | undefined {
  return MatrixSignatures.find((sig) => sig.name === name);
}
