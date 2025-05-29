import { ConstructSignature } from "../../interfaces/ConstructInterfaces";

/**
 * Signature definitions for identifying key-value structures in cell clusters
 */
export const KeyValueSignatures: ConstructSignature[] = [
  {
    name: "colon-separated-pairs",
    description: "Key-value pairs separated by colons (key: value)",
    minConfidence: 0.7,
    requiredTraits: ["content.hasTextualData"],
    optionalTraits: [
      "content.hasKeyValuePairs",
      "content.hasColonSeparators",
      "content.hasLabelValueStructure",
      "arrangement.hasVerticalLayout",
      "spacing.hasConsistentPairSpacing",
    ],
    traitWeights: {
      "content.hasKeyValuePairs": 0.4,
      "content.hasColonSeparators": 0.3,
      "content.hasLabelValueStructure": 0.15,
      "arrangement.hasVerticalLayout": 0.1,
      "spacing.hasConsistentPairSpacing": 0.05,
    },
    validate: (traits, cluster) => {
      return true; // Flexible validation
    },
  },

  {
    name: "configuration-settings",
    description: "Configuration or settings format with key-value pairs",
    minConfidence: 0.65,
    requiredTraits: ["content.hasTextualData", "content.hasKeyValuePairs"],
    optionalTraits: [
      "content.hasConfigurationPattern",
      "content.hasSettingsTerminology",
      "content.hasEqualsSignSeparators",
      "content.hasBooleanValues",
      "content.hasPathValues",
    ],
    traitWeights: {
      "content.hasConfigurationPattern": 0.3,
      "content.hasSettingsTerminology": 0.25,
      "content.hasEqualsSignSeparators": 0.2,
      "content.hasBooleanValues": 0.15,
      "content.hasPathValues": 0.1,
    },
    validate: (traits, cluster) => {
      return true;
    },
  },

  {
    name: "property-list",
    description: "Property list or metadata structure",
    minConfidence: 0.6,
    requiredTraits: [
      "content.hasTextualData",
      "content.hasLabelValueStructure",
    ],
    optionalTraits: [
      "content.hasPropertyTerminology",
      "content.hasMetadataPattern",
      "content.hasDescriptiveKeys",
      "arrangement.hasTwoColumnLayout",
      "content.hasVariedValueTypes",
    ],
    traitWeights: {
      "content.hasPropertyTerminology": 0.25,
      "content.hasMetadataPattern": 0.25,
      "content.hasDescriptiveKeys": 0.2,
      "arrangement.hasTwoColumnLayout": 0.2,
      "content.hasVariedValueTypes": 0.1,
    },
    validate: (traits, cluster) => {
      return true;
    },
  },

  {
    name: "form-fields",
    description: "Form-like structure with field labels and values",
    minConfidence: 0.65,
    requiredTraits: [
      "content.hasTextualData",
      "content.hasLabelValueStructure",
    ],
    optionalTraits: [
      "content.hasFormFieldPattern",
      "content.hasInputLabels",
      "content.hasUserEnteredData",
      "arrangement.hasFormLayout",
      "content.hasRequiredFields",
    ],
    traitWeights: {
      "content.hasFormFieldPattern": 0.3,
      "content.hasInputLabels": 0.25,
      "content.hasUserEnteredData": 0.2,
      "arrangement.hasFormLayout": 0.15,
      "content.hasRequiredFields": 0.1,
    },
    validate: (traits, cluster) => {
      return true;
    },
  },

  {
    name: "definition-list",
    description: "Definition list with terms and definitions",
    minConfidence: 0.6,
    requiredTraits: ["content.hasTextualData"],
    optionalTraits: [
      "content.hasDefinitionPattern",
      "content.hasTermDefinitionPairs",
      "content.hasExplanationText",
      "arrangement.hasDefinitionLayout",
      "content.hasAcademicTerminology",
    ],
    traitWeights: {
      "content.hasDefinitionPattern": 0.35,
      "content.hasTermDefinitionPairs": 0.3,
      "content.hasExplanationText": 0.2,
      "arrangement.hasDefinitionLayout": 0.1,
      "content.hasAcademicTerminology": 0.05,
    },
    validate: (traits, cluster) => {
      return true;
    },
  },
];

export function getKeyValueSignature(
  name: string
): ConstructSignature | undefined {
  return KeyValueSignatures.find((sig) => sig.name === name);
}
