import { ConstructSignature } from "../../interfaces/ConstructInterfaces";

/**
 * Signature definitions for identifying tree structures in cell clusters
 */
export const TreeSignatures: ConstructSignature[] = [
  {
    name: "vertical-indented-tree",
    description:
      "Vertical tree with consistent indentation (e.g., file explorer, organizational chart)",
    minConfidence: 0.7,
    requiredTraits: ["arrangement.isVertical", "content.hasTextualData"],
    optionalTraits: [
      "content.hasConsistentIndentation",
      "content.hasHierarchicalStructure",
      "content.hasBulletPoints",
      "spacing.hasConsistentRowSpacing",
      "boundaries.hasAlignedLeftEdge",
    ],
    traitWeights: {
      "content.hasConsistentIndentation": 0.3,
      "content.hasHierarchicalStructure": 0.4,
      "content.hasBulletPoints": 0.2,
      "spacing.hasConsistentRowSpacing": 0.1,
      "boundaries.hasAlignedLeftEdge": 0.1,
      "arrangement.isVertical": 0.2,
    },
    validate: (traits, cluster) => {
      // Must have at least 3 rows to be considered a tree
      const rowCount = cluster.bottomRow - cluster.topRow + 1;
      return rowCount >= 3;
    },
  },

  {
    name: "horizontal-indented-tree",
    description:
      "Horizontal tree with consistent indentation (transposed tree structure)",
    minConfidence: 0.7,
    requiredTraits: ["arrangement.isHorizontal", "content.hasTextualData"],
    optionalTraits: [
      "content.hasConsistentIndentation",
      "content.hasHierarchicalStructure",
      "spacing.hasConsistentColumnSpacing",
      "boundaries.hasAlignedTopEdge",
    ],
    traitWeights: {
      "content.hasConsistentIndentation": 0.3,
      "content.hasHierarchicalStructure": 0.4,
      "spacing.hasConsistentColumnSpacing": 0.15,
      "boundaries.hasAlignedTopEdge": 0.1,
      "arrangement.isHorizontal": 0.2,
    },
    validate: (traits, cluster) => {
      // Must have at least 3 columns to be considered a horizontal tree
      const colCount = cluster.rightCol - cluster.leftCol + 1;
      return colCount >= 3;
    },
  },

  {
    name: "branching-tree-with-connectors",
    description:
      "Tree structure with visual connectors (lines, branches, bullets)",
    minConfidence: 0.8,
    requiredTraits: ["content.hasTextualData", "content.hasBulletPoints"],
    optionalTraits: [
      "content.hasLineConnectors",
      "content.hasTreeSymbols",
      "content.hasConsistentIndentation",
      "spacing.hasVariableSpacing",
      "boundaries.hasIrregularShape",
    ],
    traitWeights: {
      "content.hasLineConnectors": 0.25,
      "content.hasTreeSymbols": 0.25,
      "content.hasBulletPoints": 0.2,
      "content.hasConsistentIndentation": 0.15,
      "spacing.hasVariableSpacing": 0.1,
      "boundaries.hasIrregularShape": 0.05,
    },
    validate: (traits, cluster) => {
      // Check for actual tree symbols or connectors in the content
      // This would need to examine the actual cell content
      return true; // Simplified for now
    },
  },

  {
    name: "outline-style-tree",
    description:
      "Outline-style tree with numbered or lettered hierarchy (1., 1.1, 1.1.1, etc.)",
    minConfidence: 0.75,
    requiredTraits: ["content.hasTextualData", "arrangement.isVertical"],
    optionalTraits: [
      "content.hasNumberedHierarchy",
      "content.hasLetterHierarchy",
      "content.hasConsistentIndentation",
      "spacing.hasConsistentRowSpacing",
      "content.hasHierarchicalStructure",
    ],
    traitWeights: {
      "content.hasNumberedHierarchy": 0.3,
      "content.hasLetterHierarchy": 0.3,
      "content.hasConsistentIndentation": 0.2,
      "content.hasHierarchicalStructure": 0.15,
      "spacing.hasConsistentRowSpacing": 0.05,
    },
    validate: (traits, cluster) => {
      // Should have numbering or lettering pattern
      // This would examine actual content for patterns like "1.", "1.1", "a.", "i.", etc.
      return true; // Simplified for now
    },
  },

  {
    name: "directory-tree",
    description: "File system or directory-like tree structure",
    minConfidence: 0.7,
    requiredTraits: ["content.hasTextualData", "arrangement.isVertical"],
    optionalTraits: [
      "content.hasFileExtensions",
      "content.hasDirectoryIndicators",
      "content.hasConsistentIndentation",
      "content.hasTreeSymbols",
      "spacing.hasConsistentRowSpacing",
    ],
    traitWeights: {
      "content.hasFileExtensions": 0.25,
      "content.hasDirectoryIndicators": 0.25,
      "content.hasConsistentIndentation": 0.2,
      "content.hasTreeSymbols": 0.15,
      "spacing.hasConsistentRowSpacing": 0.15,
    },
    validate: (traits, cluster) => {
      // Should have file/folder indicators
      // This would look for patterns like "/" at end of names, file extensions, etc.
      return true; // Simplified for now
    },
  },

  {
    name: "mind-map-tree",
    description: "Mind map or branching diagram with central topic",
    minConfidence: 0.65,
    requiredTraits: ["content.hasTextualData"],
    optionalTraits: [
      "arrangement.hasRadialPattern",
      "content.hasCentralNode",
      "spacing.hasVariableSpacing",
      "boundaries.hasIrregularShape",
      "content.hasConnectionLines",
    ],
    traitWeights: {
      "arrangement.hasRadialPattern": 0.3,
      "content.hasCentralNode": 0.25,
      "content.hasConnectionLines": 0.2,
      "spacing.hasVariableSpacing": 0.15,
      "boundaries.hasIrregularShape": 0.1,
    },
    validate: (traits, cluster) => {
      // Should have some kind of central focus or radial arrangement
      return true; // Simplified for now
    },
  },
];

/**
 * Get signature by name
 */
export function getTreeSignature(name: string): ConstructSignature | undefined {
  return TreeSignatures.find((sig) => sig.name === name);
}

/**
 * Get all signature names
 */
export function getTreeSignatureNames(): string[] {
  return TreeSignatures.map((sig) => sig.name);
}
