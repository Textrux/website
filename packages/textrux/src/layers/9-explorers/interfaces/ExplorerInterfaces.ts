import {
  Structure,
  StructureComponent,
} from "../../7-structures/interfaces/StructureInterfaces";
import { RenovationArtifact } from "../../8-renovators/interfaces/RenovatorInterfaces";
import { ConstructEvent } from "../../4-constructs/interfaces/ConstructEventInterfaces";

/**
 * Explorer for generating artifacts from structures
 */
export interface Explorer {
  /** Unique identifier for the explorer */
  id: string;

  /** Human-readable name */
  name: string;

  /** Description of what this explorer generates */
  description: string;

  /** Category of explorer */
  category:
    | "code-generation"
    | "documentation"
    | "data-export"
    | "visualization"
    | "testing"
    | "deployment";

  /** Target formats this explorer can generate */
  targetFormats: string[];

  /** Explorer version */
  version: string;

  /** Supported structure types */
  supportedStructureTypes: string[];

  /** Check if explorer can process the structure */
  canExplore(structure: Structure): boolean;

  /** Generate artifacts from structure */
  explore(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationResult>;

  /** Validate structure for exploration */
  validate(structure: Structure): ExplorationValidation;

  /** Get exploration configuration schema */
  getConfigurationSchema(): ExplorationConfigSchema;
}

/**
 * Context for exploration operations
 */
export interface ExplorationContext {
  /** Target format for output */
  targetFormat: string;

  /** Output configuration */
  outputConfig: ExplorationOutputConfig;

  /** Available templates */
  templates: Map<string, ExplorationTemplate>;

  /** Variable substitutions */
  variables: Map<string, any>;

  /** External references */
  externalReferences: Map<string, any>;

  /** Exploration metadata */
  metadata: Record<string, any>;
}

/**
 * Output configuration for explorations
 */
export interface ExplorationOutputConfig {
  /** Output directory */
  outputDirectory?: string;

  /** File naming convention */
  fileNaming:
    | "kebab-case"
    | "camelCase"
    | "PascalCase"
    | "snake_case"
    | "custom";

  /** Custom file naming template */
  customNamingTemplate?: string;

  /** Whether to overwrite existing files */
  overwriteExisting: boolean;

  /** File encoding */
  encoding: "utf-8" | "ascii" | "base64";

  /** Include metadata in output */
  includeMetadata: boolean;

  /** Compression settings */
  compression?: CompressionConfig;
}

/**
 * Compression configuration
 */
export interface CompressionConfig {
  /** Compression algorithm */
  algorithm: "gzip" | "deflate" | "brotli" | "zip";

  /** Compression level */
  level: number;

  /** Whether to compress individual files or create archive */
  mode: "individual" | "archive";
}

/**
 * Exploration template for generating formatted output
 */
export interface ExplorationTemplate {
  /** Template identifier */
  id: string;

  /** Template name */
  name: string;

  /** Template content */
  content: string;

  /** Template engine type */
  engine: "handlebars" | "mustache" | "ejs" | "custom";

  /** Required variables */
  requiredVariables: string[];

  /** Optional variables with defaults */
  optionalVariables: Record<string, any>;

  /** Template metadata */
  metadata: Record<string, any>;
}

/**
 * Result of exploration operation
 */
export interface ExplorationResult {
  /** Whether exploration was successful */
  success: boolean;

  /** Generated artifacts */
  artifacts: ExplorationArtifact[];

  /** Exploration log */
  log: ExplorationLogEntry[];

  /** Performance metrics */
  metrics: ExplorationMetrics;

  /** Error information if failed */
  error?: ExplorationError;

  /** Result metadata */
  metadata: Record<string, any>;
}

/**
 * Artifact generated by exploration
 */
export interface ExplorationArtifact extends RenovationArtifact {
  /** Path where artifact should be saved */
  outputPath: string;

  /** Dependencies this artifact has on other artifacts */
  dependencies: string[];

  /** Artifact generation timestamp */
  generatedAt: number;

  /** Source structure component that generated this artifact */
  sourceComponentId?: string;

  /** Verification hash for integrity checking */
  hash: string;
}

/**
 * Log entry for exploration operations
 */
export interface ExplorationLogEntry {
  /** Timestamp */
  timestamp: number;

  /** Log level */
  level: "debug" | "info" | "warn" | "error";

  /** Log message */
  message: string;

  /** Explorer component that generated the log */
  source: string;

  /** Structure component being processed */
  componentId?: string;

  /** Additional log data */
  data?: any;
}

/**
 * Performance metrics for explorations
 */
export interface ExplorationMetrics {
  /** Total exploration time */
  explorationTime: number;

  /** Number of artifacts generated */
  artifactCount: number;

  /** Total output size in bytes */
  outputSize: number;

  /** Template processing time */
  templateProcessingTime: number;

  /** File I/O time */
  fileIOTime: number;

  /** Custom metrics */
  customMetrics: Record<string, number>;
}

/**
 * Error information for failed explorations
 */
export interface ExplorationError {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Stack trace if available */
  stackTrace?: string;

  /** Component where error occurred */
  componentId?: string;

  /** Template that caused the error */
  templateId?: string;

  /** Error context */
  context: Record<string, any>;
}

/**
 * Validation result for structure exploration
 */
export interface ExplorationValidation {
  /** Whether structure is valid for exploration */
  valid: boolean;

  /** Validation errors */
  errors: ExplorationValidationError[];

  /** Validation warnings */
  warnings: ExplorationValidationWarning[];

  /** Missing required components */
  missingComponents: string[];

  /** Conflicting configurations */
  conflicts: string[];
}

/**
 * Exploration validation error
 */
export interface ExplorationValidationError {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Component causing the error */
  componentId?: string;

  /** Severity level */
  severity: "error" | "warning";

  /** Suggested fix */
  suggestedFix?: string;
}

/**
 * Exploration validation warning
 */
export interface ExplorationValidationWarning {
  /** Warning code */
  code: string;

  /** Warning message */
  message: string;

  /** Component causing the warning */
  componentId?: string;

  /** Recommendation */
  recommendation?: string;
}

/**
 * Configuration schema for explorer
 */
export interface ExplorationConfigSchema {
  /** Schema identifier */
  id: string;

  /** JSON schema for configuration */
  schema: any;

  /** Default configuration values */
  defaults: Record<string, any>;

  /** Configuration examples */
  examples: Record<string, any>;
}

/**
 * Code generation explorer for programming languages
 */
export interface CodeGenerationExplorer extends Explorer {
  category: "code-generation";

  /** Programming language being generated */
  targetLanguage: string;

  /** Generate class definitions */
  generateClasses(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate function definitions */
  generateFunctions(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate data models */
  generateDataModels(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate API endpoints */
  generateApiEndpoints(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate configuration files */
  generateConfiguration(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;
}

/**
 * Documentation explorer for generating docs
 */
export interface DocumentationExplorer extends Explorer {
  category: "documentation";

  /** Documentation format */
  documentationFormat:
    | "markdown"
    | "html"
    | "pdf"
    | "docx"
    | "confluence"
    | "custom";

  /** Generate API documentation */
  generateApiDocs(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate user documentation */
  generateUserDocs(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate technical specifications */
  generateSpecs(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate diagrams */
  generateDiagrams(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;
}

/**
 * Data export explorer for various data formats
 */
export interface DataExportExplorer extends Explorer {
  category: "data-export";

  /** Export to JSON format */
  exportToJson(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact>;

  /** Export to XML format */
  exportToXml(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact>;

  /** Export to CSV format */
  exportToCsv(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact>;

  /** Export to database schema */
  exportToSchema(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact>;

  /** Export to configuration format */
  exportToConfig(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact>;
}

/**
 * Testing explorer for generating test code
 */
export interface TestingExplorer extends Explorer {
  category: "testing";

  /** Testing framework */
  testingFramework: string;

  /** Generate unit tests */
  generateUnitTests(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate integration tests */
  generateIntegrationTests(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate test data */
  generateTestData(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate performance tests */
  generatePerformanceTests(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;
}

/**
 * Explorer registry for managing explorers
 */
export interface ExplorerRegistry {
  /** All registered explorers */
  explorers: Map<string, Explorer>;

  /** Register an explorer */
  register(explorer: Explorer): void;

  /** Unregister an explorer */
  unregister(explorerId: string): boolean;

  /** Get explorer by ID */
  getExplorer(id: string): Explorer | undefined;

  /** Get explorers by category */
  getExplorersByCategory(category: string): Explorer[];

  /** Find explorers that can process structure */
  findCompatibleExplorers(structure: Structure): Explorer[];

  /** Get explorers that can generate specific format */
  getExplorersByFormat(format: string): Explorer[];
}

/**
 * Exploration pipeline for multi-step artifact generation
 */
export interface ExplorationPipeline {
  /** Pipeline identifier */
  id: string;

  /** Pipeline name */
  name: string;

  /** Ordered list of exploration steps */
  steps: ExplorationPipelineStep[];

  /** Execute the entire pipeline */
  execute(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationResult>;

  /** Execute up to a specific step */
  executeToStep(
    structure: Structure,
    stepIndex: number,
    context: ExplorationContext
  ): Promise<ExplorationResult>;

  /** Validate pipeline configuration */
  validate(): string[];
}

/**
 * Step in an exploration pipeline
 */
export interface ExplorationPipelineStep {
  /** Step identifier */
  id: string;

  /** Explorer to use */
  explorer: Explorer;

  /** Step-specific configuration */
  config: Record<string, any>;

  /** Conditions for step execution */
  conditions?: ExplorationCondition[];

  /** Whether to continue pipeline if this step fails */
  continueOnFailure: boolean;

  /** Dependencies on other steps */
  dependencies: string[];
}

/**
 * Condition for conditional exploration steps
 */
export interface ExplorationCondition {
  /** Condition type */
  type: "structure-has-component" | "format-supported" | "custom";

  /** Condition configuration */
  config: Record<string, any>;

  /** Evaluate the condition */
  evaluate(structure: Structure, context: ExplorationContext): boolean;
}

/**
 * Exploration scheduler for managing exploration tasks
 */
export interface ExplorationScheduler {
  /** Schedule an exploration */
  schedule(
    structure: Structure,
    explorer: Explorer,
    context: ExplorationContext,
    priority?: number
  ): Promise<string>; // Returns task ID

  /** Schedule an exploration pipeline */
  schedulePipeline(
    structure: Structure,
    pipeline: ExplorationPipeline,
    context: ExplorationContext,
    priority?: number
  ): Promise<string>;

  /** Cancel a scheduled task */
  cancel(taskId: string): boolean;

  /** Get task status */
  getTaskStatus(taskId: string): ExplorationTaskStatus | undefined;

  /** Get all active tasks */
  getActiveTasks(): ExplorationTaskStatus[];
}

/**
 * Status of an exploration task
 */
export interface ExplorationTaskStatus {
  /** Task identifier */
  id: string;

  /** Current status */
  status: "pending" | "running" | "completed" | "failed" | "cancelled";

  /** Progress percentage */
  progress: number;

  /** Start time */
  startTime?: number;

  /** End time */
  endTime?: number;

  /** Current step if running pipeline */
  currentStep?: string;

  /** Result if completed */
  result?: ExplorationResult;

  /** Error if failed */
  error?: ExplorationError;
}

/**
 * Exploration event for notifications
 */
export interface ExplorationEvent extends ConstructEvent {
  /** The structure being explored */
  structure: Structure;

  /** The explorer being used */
  explorer: Explorer;

  /** Type of exploration event */
  explorationEventType:
    | "started"
    | "completed"
    | "failed"
    | "progress"
    | "artifact-generated";

  /** Additional exploration data */
  explorationData: any;
}

/**
 * Built-in explorer implementations
 */

/**
 * C# code generator
 */
export interface CSharpCodeExplorer extends CodeGenerationExplorer {
  targetLanguage: "csharp";

  /** Generate C# classes with properties and methods */
  generateCSharpClasses(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate C# interfaces */
  generateCSharpInterfaces(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate Entity Framework models */
  generateEntityFrameworkModels(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate ASP.NET Core controllers */
  generateAspNetControllers(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;
}

/**
 * TypeScript code generator
 */
export interface TypeScriptCodeExplorer extends CodeGenerationExplorer {
  targetLanguage: "typescript";

  /** Generate TypeScript interfaces */
  generateTypeScriptInterfaces(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate React components */
  generateReactComponents(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate Express.js routes */
  generateExpressRoutes(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;
}

/**
 * OpenAPI specification generator
 */
export interface OpenApiExplorer extends DocumentationExplorer {
  documentationFormat: "openapi";

  /** Generate OpenAPI specification */
  generateOpenApiSpec(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact>;

  /** Generate Swagger UI files */
  generateSwaggerUI(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;
}

/**
 * Database schema generator
 */
export interface DatabaseSchemaExplorer extends DataExportExplorer {
  /** Database type */
  databaseType: "postgresql" | "mysql" | "sqlserver" | "oracle" | "sqlite";

  /** Generate DDL scripts */
  generateDDL(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact>;

  /** Generate migration scripts */
  generateMigrations(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;

  /** Generate seed data scripts */
  generateSeedData(
    structure: Structure,
    context: ExplorationContext
  ): Promise<ExplorationArtifact[]>;
}
