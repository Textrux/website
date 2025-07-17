/**
 * Base element interface for all construct elements
 */
export interface BaseElement {
  /** Position in the grid */
  position: { row: number; col: number };
  
  /** Text content of the element */
  content: string;
  
  /** Role/type within the construct (specific to each construct type) */
  cellType: string;
}

/**
 * Base interface for all constructs
 */
export interface BaseConstruct {
  /** Unique identifier for the construct instance */
  id: string;

  /** Type of construct (tree, table, matrix, key-value, list) */
  type: string;

  /** The key pattern that identified this construct */
  keyPattern: string;

  /** Bounding box of the construct within the cell cluster */
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };

  /** Elements contained within this construct for console navigation */
  baseElements: BaseElement[];

  /** Metadata specific to the construct type */
  metadata: Record<string, any>;

  /** Child constructs nested within this construct */
  childConstructs?: BaseConstruct[];

  /** Get element at specific position */
  getElementAt?(row: number, col: number): BaseElement | null;
  
  /** Check if position is within construct bounds */
  containsPosition?(row: number, col: number): boolean;
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
 * Interface for binary key-based construct detection
 * Replaces complex signature parsers with elegant key system
 */
export interface KeyBasedDetection {
  /** Binary key or string pattern that identifies the construct */
  key: number | string;

  /** Construct type identified by this key */
  constructType: "table" | "matrix" | "key-value" | "tree" | "list";

  /** Orientation if applicable */
  orientation?: "regular" | "transposed";

  /** Additional flags for construct variants */
  hasChildHeader?: boolean;
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
