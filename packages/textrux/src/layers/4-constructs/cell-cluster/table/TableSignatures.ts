import { ConstructSignature } from "../../interfaces/ConstructInterfaces";

/**
 * Signature definitions for identifying table structures in cell clusters
 */
export const TableSignatures: ConstructSignature[] = [
  {
    name: "standard-data-table",
    description:
      "Standard data table with headers and consistent column structure",
    minConfidence: 0.8,
    requiredTraits: ["arrangement.isRectangular", "content.hasTextualData"],
    optionalTraits: [
      "content.hasHeaders",
      "content.hasConsistentColumns",
      "content.hasNumericalData",
      "spacing.hasConsistentRowSpacing",
      "spacing.hasConsistentColumnSpacing",
      "boundaries.hasWellDefinedEdges",
    ],
    traitWeights: {
      "content.hasHeaders": 0.25,
      "content.hasConsistentColumns": 0.3,
      "content.hasNumericalData": 0.15,
      "spacing.hasConsistentRowSpacing": 0.1,
      "spacing.hasConsistentColumnSpacing": 0.15,
      "boundaries.hasWellDefinedEdges": 0.05,
    },
    validate: (traits, cluster) => {
      // Must have at least 2 rows and 2 columns to be a table
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      const colCount = cluster.rightCol - cluster.leftCol + 1;
      return rowCount >= 2 && colCount >= 2;
    },
  },

  {
    name: "header-only-table",
    description: "Table with prominent headers but minimal data",
    minConfidence: 0.7,
    requiredTraits: ["arrangement.isRectangular", "content.hasHeaders"],
    optionalTraits: [
      "content.hasTextualData",
      "content.hasMinimalData",
      "spacing.hasConsistentColumnSpacing",
      "arrangement.hasHeaderRow",
    ],
    traitWeights: {
      "content.hasHeaders": 0.4,
      "content.hasMinimalData": 0.2,
      "spacing.hasConsistentColumnSpacing": 0.2,
      "arrangement.hasHeaderRow": 0.2,
    },
    validate: (traits, cluster) => {
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      const colCount = cluster.rightCol - cluster.leftCol + 1;
      return rowCount >= 1 && colCount >= 2;
    },
  },

  {
    name: "numerical-grid-table",
    description: "Table primarily containing numerical data in grid format",
    minConfidence: 0.75,
    requiredTraits: ["arrangement.isRectangular", "content.hasNumericalData"],
    optionalTraits: [
      "content.hasMathematicalPattern",
      "content.hasStatisticalData",
      "spacing.hasUniformCellSizes",
      "arrangement.hasGridPattern",
      "content.hasCalculatedValues",
    ],
    traitWeights: {
      "content.hasNumericalData": 0.3,
      "content.hasMathematicalPattern": 0.2,
      "content.hasStatisticalData": 0.2,
      "spacing.hasUniformCellSizes": 0.15,
      "arrangement.hasGridPattern": 0.15,
    },
    validate: (traits, cluster) => {
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      const colCount = cluster.rightCol - cluster.leftCol + 1;
      return rowCount >= 2 && colCount >= 2;
    },
  },

  {
    name: "list-style-table",
    description: "Table formatted as a list with consistent structure",
    minConfidence: 0.65,
    requiredTraits: ["arrangement.isVertical", "content.hasTextualData"],
    optionalTraits: [
      "content.hasListMarkers",
      "content.hasConsistentItemStructure",
      "spacing.hasConsistentRowSpacing",
      "arrangement.hasLeftAlignment",
      "content.hasRepeatingPattern",
    ],
    traitWeights: {
      "content.hasListMarkers": 0.25,
      "content.hasConsistentItemStructure": 0.3,
      "spacing.hasConsistentRowSpacing": 0.2,
      "arrangement.hasLeftAlignment": 0.15,
      "content.hasRepeatingPattern": 0.1,
    },
    validate: (traits, cluster) => {
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      return rowCount >= 3;
    },
  },

  {
    name: "comparison-table",
    description: "Table designed for comparing items or features",
    minConfidence: 0.7,
    requiredTraits: ["arrangement.isRectangular", "content.hasTextualData"],
    optionalTraits: [
      "content.hasComparisonStructure",
      "content.hasFeatureComparison",
      "content.hasBooleanData",
      "arrangement.hasHeaderColumn",
      "content.hasAlternatingData",
    ],
    traitWeights: {
      "content.hasComparisonStructure": 0.3,
      "content.hasFeatureComparison": 0.25,
      "content.hasBooleanData": 0.2,
      "arrangement.hasHeaderColumn": 0.15,
      "content.hasAlternatingData": 0.1,
    },
    validate: (traits, cluster) => {
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      const colCount = cluster.rightCol - cluster.leftCol + 1;
      return rowCount >= 2 && colCount >= 3;
    },
  },

  {
    name: "summary-table",
    description: "Table showing summary or aggregate information",
    minConfidence: 0.65,
    requiredTraits: ["arrangement.isRectangular", "content.hasNumericalData"],
    optionalTraits: [
      "content.hasSummaryData",
      "content.hasTotalRows",
      "content.hasAggregateValues",
      "content.hasStatisticalSummary",
      "arrangement.hasCalculatedFooter",
    ],
    traitWeights: {
      "content.hasSummaryData": 0.3,
      "content.hasTotalRows": 0.25,
      "content.hasAggregateValues": 0.2,
      "content.hasStatisticalSummary": 0.15,
      "arrangement.hasCalculatedFooter": 0.1,
    },
    validate: (traits, cluster) => {
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      const colCount = cluster.rightCol - cluster.leftCol + 1;
      return rowCount >= 2 && colCount >= 2;
    },
  },

  {
    name: "schedule-table",
    description: "Table representing a schedule or timetable",
    minConfidence: 0.7,
    requiredTraits: ["arrangement.isRectangular", "content.hasTextualData"],
    optionalTraits: [
      "content.hasTimeData",
      "content.hasDateData",
      "content.hasSchedulePattern",
      "arrangement.hasTimeBasedHeaders",
      "content.hasRecurringEvents",
    ],
    traitWeights: {
      "content.hasTimeData": 0.3,
      "content.hasDateData": 0.25,
      "content.hasSchedulePattern": 0.2,
      "arrangement.hasTimeBasedHeaders": 0.15,
      "content.hasRecurringEvents": 0.1,
    },
    validate: (traits, cluster) => {
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      const colCount = cluster.rightCol - cluster.leftCol + 1;
      return rowCount >= 2 && colCount >= 2;
    },
  },

  {
    name: "key-value-table",
    description: "Table structured as key-value pairs",
    minConfidence: 0.6,
    requiredTraits: ["content.hasTextualData"],
    optionalTraits: [
      "content.hasKeyValuePairs",
      "content.hasLabelValueStructure",
      "arrangement.hasTwoColumnLayout",
      "content.hasPropertyList",
      "spacing.hasConsistentPairSpacing",
    ],
    traitWeights: {
      "content.hasKeyValuePairs": 0.35,
      "content.hasLabelValueStructure": 0.25,
      "arrangement.hasTwoColumnLayout": 0.2,
      "content.hasPropertyList": 0.15,
      "spacing.hasConsistentPairSpacing": 0.05,
    },
    validate: (traits, cluster) => {
      const colCount = cluster.rightCol - cluster.leftCol + 1;
      return colCount === 2 || colCount === 1; // Can be 1 column with : separator
    },
  },
];

/**
 * Get signature by name
 */
export function getTableSignature(
  name: string
): ConstructSignature | undefined {
  return TableSignatures.find((sig) => sig.name === name);
}

/**
 * Get all signature names
 */
export function getTableSignatureNames(): string[] {
  return TableSignatures.map((sig) => sig.name);
}
