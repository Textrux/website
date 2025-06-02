import { BaseConstruct } from "../../4-constructs/interfaces/ConstructInterfaces";
import { Layout } from "../../5-layouts/interfaces/LayoutInterfaces";
import { CellFormat } from "../../../style/CellFormat";

/**
 * Directional constraint for blueprint patterns
 */
export interface BlueprintDirection {
  primary: "horizontal" | "vertical";
  secondary: "horizontal" | "vertical";
  primaryFlow: "positive" | "negative"; // positive = right/down, negative = left/up
  secondaryFlow: "positive" | "negative";
}

/**
 * Spatial relationship between blueprint components
 */
export interface SpatialRelationship {
  /** Type of relationship */
  type: "adjacent" | "offset" | "aligned" | "relative" | "contained";

  /** Target component ID */
  targetId: string;

  /** Relationship configuration */
  config: {
    /** Offset in rows/columns */
    rowOffset?: number;
    colOffset?: number;

    /** Alignment constraints */
    alignment?: "start" | "center" | "end";

    /** Direction constraints */
    direction?: "same-row" | "same-column" | "diagonal";

    /** Tolerance for fuzzy matching */
    tolerance?: number;
  };
}

/**
 * Component within a blueprint pattern
 */
export interface BlueprintComponent {
  /** Unique identifier within the blueprint */
  id: string;

  /** Type of component */
  type:
    | "construct"
    | "layout"
    | "cell-cluster"
    | "text-pattern"
    | "empty-space";

  /** Required characteristics for matching */
  requirements: {
    /** Construct type if this is a construct component */
    constructType?: string;

    /** Layout type if this is a layout component */
    layoutType?: string;

    /** Text pattern for text matching */
    textPattern?: string | RegExp;

    /** Size constraints */
    minSize?: { rows: number; cols: number };
    maxSize?: { rows: number; cols: number };

    /** Required traits */
    requiredTraits?: string[];

    /** Cell formatting requirements */
    formatRequirements?: Partial<CellFormat>;
  };

  /** Spatial relationships to other components */
  relationships: SpatialRelationship[];

  /** Whether this component is required for blueprint match */
  required: boolean;

  /** Confidence weight for pattern matching */
  weight: number;
}

/**
 * Blueprint definition for spatial pattern detection
 */
export interface Blueprint {
  /** Unique identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Description of what this blueprint represents */
  description: string;

  /** Category/domain of this blueprint */
  category: string;

  /** Version for evolution tracking */
  version: string;

  /** Author/creator information */
  author: string;

  /** Directional constraints */
  direction: BlueprintDirection;

  /** Root component (anchor point for pattern matching) */
  rootComponentId: string;

  /** All components in this blueprint */
  components: Map<string, BlueprintComponent>;

  /** Minimum confidence threshold for match */
  minConfidence: number;

  /** Custom validation function */
  validate?: (candidates: Map<string, any>, grid: any) => boolean;

  /** Metadata for the blueprint */
  metadata: Record<string, any>;
}

/**
 * Result of blueprint pattern matching
 */
export interface BlueprintMatch {
  /** The matched blueprint */
  blueprint: Blueprint;

  /** Confidence score (0-1) */
  confidence: number;

  /** Matched components and their grid locations */
  componentMatches: Map<string, BlueprintComponentMatch>;

  /** Bounding box of the entire match */
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };

  /** Additional match metadata */
  metadata: Record<string, any>;
}

/**
 * Individual component match within a blueprint
 */
export interface BlueprintComponentMatch {
  /** The component definition */
  component: BlueprintComponent;

  /** Matched grid element (construct, layout, cell cluster, etc.) */
  matchedElement: any;

  /** Position in grid */
  position: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };

  /** Confidence of this specific component match */
  confidence: number;
}

/**
 * Blueprint detector for finding patterns in grids
 */
export interface BlueprintDetector {
  /** All registered blueprints */
  blueprints: Map<string, Blueprint>;

  /** Register a blueprint for detection */
  registerBlueprint(blueprint: Blueprint): void;

  /** Unregister a blueprint */
  unregisterBlueprint(blueprintId: string): boolean;

  /** Detect all blueprint matches in a grid */
  detectBlueprints(
    grid: any,
    constructs: BaseConstruct[],
    layouts: Layout[]
  ): BlueprintMatch[];

  /** Detect matches for a specific blueprint */
  detectBlueprint(
    blueprint: Blueprint,
    grid: any,
    constructs: BaseConstruct[],
    layouts: Layout[]
  ): BlueprintMatch[];

  /** Confidence threshold for detection */
  confidenceThreshold: number;
}

/**
 * Blueprint definition builder for creating blueprints from grid selections
 */
export interface BlueprintBuilder {
  /** Start building a blueprint from a grid selection */
  startFromSelection(
    grid: any,
    selection: GridSelection,
    constructs: BaseConstruct[],
    layouts: Layout[]
  ): BlueprintBuilder;

  /** Set blueprint metadata */
  setMetadata(
    name: string,
    description: string,
    category: string
  ): BlueprintBuilder;

  /** Add a component to the blueprint */
  addComponent(component: BlueprintComponent): BlueprintBuilder;

  /** Set directional constraints */
  setDirection(direction: BlueprintDirection): BlueprintBuilder;

  /** Set root component */
  setRootComponent(componentId: string): BlueprintBuilder;

  /** Build the final blueprint */
  build(): Blueprint;

  /** Validate the blueprint definition */
  validate(): string[]; // Returns validation errors
}

/**
 * Grid selection for blueprint creation
 */
export interface GridSelection {
  /** Selected cell ranges */
  ranges: Array<{
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  }>;

  /** Selected constructs */
  constructs: BaseConstruct[];

  /** Selected layouts */
  layouts: Layout[];

  /** Selection metadata */
  metadata: Record<string, any>;
}

/**
 * Blueprint serializer for storing/loading blueprint definitions
 */
export interface BlueprintSerializer {
  /** Serialize a blueprint to a storable format */
  serialize(blueprint: Blueprint): string;

  /** Deserialize a blueprint from stored format */
  deserialize(data: string): Blueprint;

  /** Store blueprint in grid as spatial representation */
  storeInGrid(
    blueprint: Blueprint,
    grid: any,
    position: { row: number; col: number }
  ): void;

  /** Load blueprint from grid spatial representation */
  loadFromGrid(
    grid: any,
    position: { row: number; col: number }
  ): Blueprint | null;
}

/**
 * Registry for managing blueprints
 */
export interface BlueprintRegistry {
  /** All available blueprints */
  blueprints: Map<string, Blueprint>;

  /** Register a blueprint */
  register(blueprint: Blueprint): void;

  /** Unregister a blueprint */
  unregister(blueprintId: string): boolean;

  /** Get blueprint by ID */
  getBlueprint(id: string): Blueprint | undefined;

  /** Get blueprints by category */
  getBlueprintsByCategory(category: string): Blueprint[];

  /** Search blueprints by name/description */
  searchBlueprints(query: string): Blueprint[];

  /** Import blueprints from external source */
  importBlueprints(source: string): Promise<Blueprint[]>;

  /** Export blueprints to external format */
  exportBlueprints(blueprintIds: string[]): Promise<string>;
}
