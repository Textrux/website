/**
 * Base interface for all constructs
 */
export interface BaseConstruct {
  /** Unique identifier for the construct instance */
  id: string;

  /** Type of construct (tree, table, matrix, key-value) */
  type: string;

  /** Confidence score (0-1) of the construct identification */
  confidence: number;

  /** The signature imprint that identified this construct */
  signatureImprint: string;

  /** Bounding box of the construct within the cell cluster */
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };

  /** Metadata specific to the construct type */
  metadata: Record<string, any>;
}

/**
 * Interface for construct signatures
 */
export interface ConstructSignature {
  /** Name of the signature imprint */
  name: string;

  /** Description of what this signature identifies */
  description: string;

  /** Minimum confidence threshold for this signature */
  minConfidence: number;

  /** Required traits for this signature */
  requiredTraits: string[];

  /** Optional traits that boost confidence */
  optionalTraits: string[];

  /** Trait weight mappings for confidence calculation */
  traitWeights: Record<string, number>;

  /** Custom validation function for complex patterns */
  validate?: (traits: any, cluster: any) => boolean;
}

/**
 * Interface for signature parsers
 */
export interface ConstructSignatureParser<T extends BaseConstruct> {
  /** Type of construct this parser creates */
  constructType: string;

  /** All available signatures for this construct type */
  signatures: ConstructSignature[];

  /** Parse a cell cluster and return construct instances if found */
  parseConstruct(cluster: any): T[];

  /** Calculate confidence score for a specific signature */
  calculateConfidence(signature: ConstructSignature, traits: any): number;

  /** Create construct instance from signature match */
  createConstruct(
    signature: ConstructSignature,
    cluster: any,
    confidence: number
  ): T;
}

/**
 * Directional orientation for constructs
 */
export interface DirectionalOrientation {
  primary: "horizontal" | "vertical";
  secondary: "horizontal" | "vertical";
}

/**
 * Position reference within a construct
 */
export interface ConstructPosition {
  row: number;
  col: number;
  relativeRow?: number; // relative to construct bounds
  relativeCol?: number; // relative to construct bounds
}
