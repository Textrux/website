import {
  Blueprint,
  BlueprintMatch,
} from "../../6-blueprints/interfaces/BlueprintInterfaces";
import { BaseConstruct } from "../../4-constructs/interfaces/ConstructInterfaces";
import { Layout } from "../../5-layouts/interfaces/LayoutInterfaces";
import { ConstructEvent } from "../../4-constructs/interfaces/ConstructEventInterfaces";

/**
 * Structure instance created from a blueprint match
 */
export interface Structure {
  /** Unique identifier for this structure instance */
  id: string;

  /** The blueprint this structure was created from */
  blueprint: Blueprint;

  /** The original blueprint match that created this structure */
  blueprintMatch: BlueprintMatch;

  /** Timestamp when structure was created */
  createdAt: number;

  /** Last modification timestamp */
  modifiedAt: number;

  /** Current version of this structure */
  version: number;

  /** All data components in this structure */
  components: Map<string, StructureComponent>;

  /** Relationships between components */
  relationships: StructureRelationship[];

  /** Current state of the structure */
  state: StructureState;

  /** Computed values and derived data */
  computedValues: Map<string, any>;

  /** Execution context for the structure */
  executionContext: StructureExecutionContext;

  /** Validation results */
  validation: StructureValidation;

  /** Structure metadata */
  metadata: Record<string, any>;
}

/**
 * Individual component within a structure
 */
export interface StructureComponent {
  /** Unique identifier within the structure */
  id: string;

  /** Type of component */
  type: "data" | "function" | "reference" | "computed" | "external";

  /** Original grid element this component represents */
  sourceElement: any;

  /** Raw content from the grid */
  rawContent: string;

  /** Parsed/interpreted content */
  parsedContent: any;

  /** Data type information */
  dataType: DataTypeInfo;

  /** Component relationships */
  relationships: string[]; // IDs of related components

  /** Component state */
  state: ComponentState;

  /** Execution information */
  execution: ComponentExecution;

  /** Component metadata */
  metadata: Record<string, any>;
}

/**
 * Data type information for structure components
 */
export interface DataTypeInfo {
  /** Primary type */
  primaryType:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "function"
    | "reference"
    | "unknown";

  /** Subtype for more specific typing */
  subType?: string;

  /** Schema information for complex types */
  schema?: any;

  /** Validation rules */
  constraints?: DataConstraint[];

  /** Type inference confidence */
  confidence: number;
}

/**
 * Data validation constraint
 */
export interface DataConstraint {
  /** Type of constraint */
  type: "required" | "format" | "range" | "length" | "pattern" | "custom";

  /** Constraint configuration */
  config: Record<string, any>;

  /** Validation function for custom constraints */
  validate?: (value: any) => boolean;

  /** Error message for constraint violations */
  errorMessage: string;
}

/**
 * State information for components
 */
export interface ComponentState {
  /** Current status */
  status: "valid" | "invalid" | "pending" | "executing" | "completed" | "error";

  /** Whether component has been modified */
  modified: boolean;

  /** Whether component is ready for execution */
  ready: boolean;

  /** Dependencies satisfied */
  dependenciesSatisfied: boolean;

  /** Validation errors */
  errors: string[];

  /** Warnings */
  warnings: string[];
}

/**
 * Execution information for components
 */
export interface ComponentExecution {
  /** Whether this component is executable */
  executable: boolean;

  /** Execution dependencies */
  dependencies: string[];

  /** Execution result */
  result?: any;

  /** Execution error */
  error?: string;

  /** Execution start time */
  startTime?: number;

  /** Execution end time */
  endTime?: number;

  /** Execution duration in milliseconds */
  duration?: number;
}

/**
 * Relationship between structure components
 */
export interface StructureRelationship {
  /** Unique relationship identifier */
  id: string;

  /** Type of relationship */
  type:
    | "dependency"
    | "reference"
    | "composition"
    | "inheritance"
    | "data-flow"
    | "control-flow";

  /** Source component ID */
  sourceId: string;

  /** Target component ID */
  targetId: string;

  /** Relationship strength/weight */
  strength: number;

  /** Directional (true) or bidirectional (false) */
  directional: boolean;

  /** Relationship metadata */
  metadata: Record<string, any>;
}

/**
 * Overall state of a structure
 */
export interface StructureState {
  /** Current phase */
  phase: "parsed" | "validated" | "ready" | "executing" | "completed" | "error";

  /** Overall health */
  health: "healthy" | "warning" | "error";

  /** Completion percentage */
  completion: number;

  /** Active operations */
  activeOperations: string[];

  /** State change history */
  history: StructureStateChange[];
}

/**
 * Structure state change record
 */
export interface StructureStateChange {
  /** Timestamp of change */
  timestamp: number;

  /** Previous phase */
  previousPhase: string;

  /** New phase */
  newPhase: string;

  /** Reason for change */
  reason: string;

  /** Additional metadata */
  metadata: Record<string, any>;
}

/**
 * Execution context for a structure
 */
export interface StructureExecutionContext {
  /** Available variables and their values */
  variables: Map<string, any>;

  /** Available functions */
  functions: Map<string, Function>;

  /** External references */
  externalReferences: Map<string, any>;

  /** Execution environment configuration */
  environment: Record<string, any>;

  /** Security constraints */
  security: SecurityContext;
}

/**
 * Security context for structure execution
 */
export interface SecurityContext {
  /** Allowed operations */
  allowedOperations: string[];

  /** Blocked operations */
  blockedOperations: string[];

  /** Resource limits */
  resourceLimits: {
    maxMemory?: number;
    maxExecutionTime?: number;
    maxFileSize?: number;
  };

  /** Sandbox configuration */
  sandbox: boolean;
}

/**
 * Structure validation results
 */
export interface StructureValidation {
  /** Overall validation status */
  valid: boolean;

  /** Validation errors */
  errors: ValidationError[];

  /** Validation warnings */
  warnings: ValidationWarning[];

  /** Validation timestamp */
  timestamp: number;

  /** Validation context */
  context: string;
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Component ID where error occurred */
  componentId?: string;

  /** Severity level */
  severity: "error" | "warning" | "info";

  /** Suggested fix */
  suggestedFix?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;

  /** Warning message */
  message: string;

  /** Component ID where warning occurred */
  componentId?: string;

  /** Recommendation */
  recommendation?: string;
}

/**
 * Factory for creating structures from blueprint matches
 */
export interface StructureFactory {
  /** Create a structure from a blueprint match */
  createFromMatch(
    blueprintMatch: BlueprintMatch,
    grid: any
  ): Promise<Structure>;

  /** Create a structure from a blueprint and explicit data */
  createFromBlueprint(
    blueprint: Blueprint,
    data: Map<string, any>
  ): Promise<Structure>;

  /** Clone an existing structure */
  clone(structure: Structure): Promise<Structure>;

  /** Merge multiple structures */
  merge(structures: Structure[]): Promise<Structure>;
}

/**
 * Structure analyzer for parsing and validating structures
 */
export interface StructureAnalyzer {
  /** Parse components from grid data */
  parseComponents(
    blueprintMatch: BlueprintMatch,
    grid: any
  ): Promise<Map<string, StructureComponent>>;

  /** Analyze relationships between components */
  analyzeRelationships(
    components: Map<string, StructureComponent>
  ): Promise<StructureRelationship[]>;

  /** Validate structure integrity */
  validateStructure(structure: Structure): Promise<StructureValidation>;

  /** Infer data types for components */
  inferDataTypes(components: Map<string, StructureComponent>): Promise<void>;

  /** Analyze dependencies */
  analyzeDependencies(structure: Structure): Promise<Map<string, string[]>>;
}

/**
 * Structure registry for managing structure instances
 */
export interface StructureRegistry {
  /** All registered structures */
  structures: Map<string, Structure>;

  /** Register a structure */
  register(structure: Structure): void;

  /** Unregister a structure */
  unregister(structureId: string): boolean;

  /** Get structure by ID */
  getStructure(id: string): Structure | undefined;

  /** Get structures by blueprint */
  getStructuresByBlueprint(blueprintId: string): Structure[];

  /** Find structures by criteria */
  findStructures(criteria: StructureSearchCriteria): Structure[];

  /** Get structure dependencies */
  getDependencies(structureId: string): Structure[];

  /** Get structures that depend on given structure */
  getDependents(structureId: string): Structure[];
}

/**
 * Search criteria for finding structures
 */
export interface StructureSearchCriteria {
  /** Blueprint ID filter */
  blueprintId?: string;

  /** State filter */
  state?: string;

  /** Health filter */
  health?: string;

  /** Component type filter */
  hasComponentType?: string;

  /** Metadata filters */
  metadata?: Record<string, any>;

  /** Date range filters */
  createdAfter?: number;
  createdBefore?: number;
  modifiedAfter?: number;
  modifiedBefore?: number;
}

/**
 * Structure event for notifications
 */
export interface StructureEvent extends ConstructEvent {
  /** The structure that triggered the event */
  structure: Structure;

  /** Type of structure event */
  structureEventType:
    | "created"
    | "modified"
    | "validated"
    | "executed"
    | "completed"
    | "error";
}

/**
 * Structure change tracking
 */
export interface StructureChangeTracker {
  /** Start tracking changes for a structure */
  startTracking(structure: Structure): void;

  /** Stop tracking changes */
  stopTracking(structureId: string): void;

  /** Get change history */
  getChangeHistory(structureId: string): StructureChange[];

  /** Record a change */
  recordChange(structureId: string, change: StructureChange): void;
}

/**
 * Structure change record
 */
export interface StructureChange {
  /** Change timestamp */
  timestamp: number;

  /** Type of change */
  type:
    | "component-added"
    | "component-removed"
    | "component-modified"
    | "relationship-added"
    | "relationship-removed"
    | "state-changed";

  /** Changed element ID */
  elementId: string;

  /** Previous value */
  previousValue?: any;

  /** New value */
  newValue?: any;

  /** Change reason */
  reason: string;

  /** Change metadata */
  metadata: Record<string, any>;
}
