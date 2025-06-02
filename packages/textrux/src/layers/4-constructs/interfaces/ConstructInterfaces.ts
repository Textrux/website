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
 * Enhanced construct with element management capabilities
 */
export interface ElementAwareConstruct extends BaseConstruct {
  /** Element container for managing construct elements */
  elementContainer?: import("./ConstructElementInterfaces").ConstructElementContainer;

  /** Format provider for elements */
  formatProvider?: import("./ConstructElementInterfaces").ElementFormatProvider;

  /** Populate elements for this construct */
  populateElements?(): void;

  /** Get format map for all elements */
  getElementFormatMap?(): Map<
    string,
    import("../../../style/CellFormat").CellFormat
  >;
}

/**
 * Construct that can emit and handle events
 */
export interface EventAwareConstruct extends BaseConstruct {
  /** Event emitter for this construct */
  eventEmitter?: import("./ConstructEventInterfaces").ConstructEventEmitter;

  /** Emit an event from this construct */
  emit?(
    event: import("./ConstructEventInterfaces").ConstructEvent
  ): Promise<void>;

  /** Add event listener */
  addEventListener?(
    listener: import("./ConstructEventInterfaces").ConstructEventListener
  ): void;

  /** Remove event listener */
  removeEventListener?(
    listener: import("./ConstructEventInterfaces").ConstructEventListener
  ): void;
}

/**
 * Construct with control capabilities
 */
export interface ControlAwareConstruct extends BaseConstruct {
  /** Available controls for this construct */
  controls?: import("./ConstructControlInterfaces").ConstructControl[];

  /** Get controls for this construct */
  getControls?(): import("./ConstructControlInterfaces").ConstructControl[];

  /** Execute a control on this construct */
  executeControl?(
    controlId: string,
    context: import("./ConstructControlInterfaces").ControlContext
  ): Promise<import("./ConstructControlInterfaces").ControlResult>;
}

/**
 * Fully enhanced construct with all capabilities
 */
export interface EnhancedConstruct
  extends ElementAwareConstruct,
    EventAwareConstruct,
    ControlAwareConstruct {
  /** Initialize all enhanced capabilities */
  initializeEnhancements?(): Promise<void>;

  /** Whether this construct is fully initialized */
  fullyInitialized?: boolean;
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
