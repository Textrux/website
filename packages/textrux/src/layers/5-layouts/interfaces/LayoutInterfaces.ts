import { BaseConstruct } from "../../4-constructs/interfaces/ConstructInterfaces";
import {
  ConstructEvent,
  ConstructEventListener,
} from "../../4-constructs/interfaces/ConstructEventInterfaces";
import { ConstructControl } from "../../4-constructs/interfaces/ConstructControlInterfaces";

/**
 * Base interface for layouts
 */
export interface Layout {
  /** Unique identifier for this layout */
  id: string;

  /** Type of layout */
  type: string;

  /** Human-readable name */
  name: string;

  /** Description of this layout */
  description: string;

  /** Constructs participating in this layout */
  constructs: BaseConstruct[];

  /** Layout-specific configuration */
  config: Record<string, any>;

  /** Whether this layout is currently active */
  active: boolean;

  /** Initialize the layout */
  initialize(): Promise<void>;

  /** Activate the layout */
  activate(): Promise<void>;

  /** Deactivate the layout */
  deactivate(): Promise<void>;

  /** Add a construct to this layout */
  addConstruct(construct: BaseConstruct): boolean;

  /** Remove a construct from this layout */
  removeConstruct(construct: BaseConstruct): boolean;

  /** Check if this layout can handle the given constructs */
  canHandle(constructs: BaseConstruct[]): boolean;

  /** Get layout-specific controls */
  getControls(): ConstructControl[];
}

/**
 * Layout that coordinates between multiple constructs
 */
export interface CoordinatedLayout extends Layout, ConstructEventListener {
  /** Coordination rules for this layout */
  coordinationRules: LayoutCoordinationRule[];

  /** Handle coordination between constructs */
  coordinate(event: ConstructEvent): Promise<void>;

  /** Add a coordination rule */
  addCoordinationRule(rule: LayoutCoordinationRule): void;

  /** Remove a coordination rule */
  removeCoordinationRule(ruleId: string): boolean;
}

/**
 * Rule for coordinating between constructs in a layout
 */
export interface LayoutCoordinationRule {
  /** Unique identifier for this rule */
  id: string;

  /** Source event types that trigger this rule */
  sourceEventTypes: string[];

  /** Source construct types that this rule applies to */
  sourceConstructTypes: string[];

  /** Target construct types to coordinate with */
  targetConstructTypes: string[];

  /** Coordination action to perform */
  action: CoordinationAction;

  /** Priority for this rule (higher = executed first) */
  priority: number;

  /** Whether this rule is enabled */
  enabled: boolean;

  /** Custom condition for rule activation */
  condition?: (event: ConstructEvent, layout: Layout) => boolean;
}

/**
 * Actions that can be performed during coordination
 */
export interface CoordinationAction {
  /** Type of coordination action */
  type:
    | "sync-structure"
    | "sync-selection"
    | "sync-dimensions"
    | "sync-content"
    | "custom";

  /** Action configuration */
  config: Record<string, any>;

  /** Execute the coordination action */
  execute(
    sourceEvent: ConstructEvent,
    sourceConstruct: BaseConstruct,
    targetConstructs: BaseConstruct[],
    layout: Layout
  ): Promise<ConstructEvent[]>;
}

/**
 * Tree-Table layout for coordinating trees and tables
 */
export interface TreeTableLayout extends CoordinatedLayout {
  type: "tree-table";

  /** The tree construct in this layout */
  treeConstruct?: BaseConstruct;

  /** The table construct in this layout */
  tableConstruct?: BaseConstruct;

  /** Sync configuration */
  syncConfig: {
    /** Whether to sync row count */
    syncRowCount: boolean;

    /** Whether to sync selections */
    syncSelection: boolean;

    /** Whether to sync structural changes */
    syncStructure: boolean;

    /** Default content for new table cells */
    defaultTableCellContent: string;
  };
}

/**
 * Master-Detail layout for hierarchical relationships
 */
export interface MasterDetailLayout extends CoordinatedLayout {
  type: "master-detail";

  /** The master construct */
  masterConstruct?: BaseConstruct;

  /** The detail constructs */
  detailConstructs: BaseConstruct[];

  /** Relationship configuration */
  relationshipConfig: {
    /** How master selection affects detail display */
    selectionMode: "single" | "multiple" | "hierarchical";

    /** Whether details cascade changes */
    cascadeChanges: boolean;
  };
}

/**
 * Grid layout for organizing constructs in a grid pattern
 */
export interface GridLayout extends Layout {
  type: "grid";

  /** Grid dimensions */
  dimensions: {
    rows: number;
    columns: number;
  };

  /** Construct positions in the grid */
  constructPositions: Map<BaseConstruct, { row: number; col: number }>;

  /** Layout grid constraints */
  constraints: {
    /** Whether constructs can span multiple cells */
    allowSpanning: boolean;

    /** Whether empty cells are allowed */
    allowEmptyCells: boolean;

    /** Minimum/maximum dimensions for constructs */
    minDimensions?: { width: number; height: number };
    maxDimensions?: { width: number; height: number };
  };
}

/**
 * Layout manager for handling multiple layouts
 */
export interface LayoutManager {
  /** All registered layouts */
  layouts: Map<string, Layout>;

  /** Currently active layouts */
  activeLayouts: Set<Layout>;

  /** Register a layout */
  registerLayout(layout: Layout): void;

  /** Unregister a layout */
  unregisterLayout(layoutId: string): boolean;

  /** Get a layout by ID */
  getLayout(layoutId: string): Layout | undefined;

  /** Get layouts by type */
  getLayoutsByType(type: string): Layout[];

  /** Find suitable layouts for given constructs */
  findSuitableLayouts(constructs: BaseConstruct[]): Layout[];

  /** Activate a layout */
  activateLayout(layoutId: string): Promise<boolean>;

  /** Deactivate a layout */
  deactivateLayout(layoutId: string): Promise<boolean>;

  /** Auto-detect and activate appropriate layouts */
  autoActivateLayouts(constructs: BaseConstruct[]): Promise<Layout[]>;

  /** Get all controls from active layouts */
  getAllLayoutControls(): ConstructControl[];
}

/**
 * Layout registry for standard layouts
 */
export interface LayoutRegistry {
  /** Register a layout type */
  registerLayoutType(type: string, factory: LayoutFactory): void;

  /** Create a layout of the specified type */
  createLayout(type: string, config?: Record<string, any>): Layout | undefined;

  /** Get available layout types */
  getAvailableTypes(): string[];

  /** Check if a layout type is registered */
  hasLayoutType(type: string): boolean;
}

/**
 * Factory for creating layouts
 */
export interface LayoutFactory {
  /** Create a new layout instance */
  create(config?: Record<string, any>): Layout;

  /** Validate layout configuration */
  validateConfig(config: Record<string, any>): boolean;

  /** Get default configuration for this layout type */
  getDefaultConfig(): Record<string, any>;
}

/**
 * Layout detector for automatically identifying layout patterns
 */
export interface LayoutDetector {
  /** Detect potential layouts from given constructs */
  detectLayouts(constructs: BaseConstruct[]): LayoutDetectionResult[];

  /** Confidence threshold for layout detection */
  confidenceThreshold: number;
}

/**
 * Result of layout detection
 */
export interface LayoutDetectionResult {
  /** Type of layout detected */
  layoutType: string;

  /** Confidence score (0-1) */
  confidence: number;

  /** Constructs that would participate in this layout */
  participants: BaseConstruct[];

  /** Suggested configuration for the layout */
  suggestedConfig: Record<string, any>;

  /** Reasoning for this detection */
  reasoning: string;
}
