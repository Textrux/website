import {
  Blueprint,
  BlueprintComponent,
  BlueprintDirection,
  SpatialRelationship,
} from "../interfaces/BlueprintInterfaces";

/**
 * Example API Blueprint (like in the screenshot)
 * 
 * This blueprint defines the spatial pattern for an API definition structure:
 * - Root header cell with "API" text
 * - Schema section with tree-like metadata definitions  
 * - Metadata section with field definitions
 * - Layout coordination between tree and table structures
 */
export function createApiBlueprint(): Blueprint {
  const blueprint: Blueprint = {
    id: "api-blueprint-v1",
    name: "API Blueprint",
    description: "Spatial pattern for API definition with schema, metadata, and field definitions",
    category: "api-design",
    version: "1.0.0",
    author: "system",
    
    // Direction-agnostic pattern matching
    direction: {
      primary: "vertical",     // Primary growth direction (down)
      secondary: "horizontal", // Secondary growth direction (right)
      primaryFlow: "positive", // Grows downward
      secondaryFlow: "positive" // Grows rightward
    },
    
    rootComponentId: "api-root-header",
    components: new Map(),
    minConfidence: 0.75,
    metadata: {
      blueprintType: "api-definition",
      generatesArtifacts: ["csharp-classes", "openapi-spec", "documentation"],
      layoutType: "tree-table"
    }
  };

  // Root header component - must contain "API" text
  const rootHeader: BlueprintComponent = {
    id: "api-root-header",
    type: "text-pattern",
    requirements: {
      textPattern: /^API\s*$/i,
      minSize: { rows: 1, cols: 1 },
      maxSize: { rows: 1, cols: 3 }
    },
    relationships: [],
    required: true,
    weight: 20 // High weight for root component
  };

  // Schema section - tree structure in same column as root
  const schemaSection: BlueprintComponent = {
    id: "schema-section",
    type: "construct",
    requirements: {
      constructType: "tree",
      minSize: { rows: 2, cols: 2 }
    },
    relationships: [
      {
        type: "aligned",
        targetId: "api-root-header",
        config: {
          direction: "same-column",
          rowOffset: 2, // 2 rows below root
          alignment: "start"
        }
      }
    ],
    required: true,
    weight: 15
  };

  // Metadata header - in secondary direction from schema
  const metadataHeader: BlueprintComponent = {
    id: "metadata-header",
    type: "text-pattern", 
    requirements: {
      textPattern: /^Metadata\s*$/i,
      minSize: { rows: 1, cols: 1 }
    },
    relationships: [
      {
        type: "aligned",
        targetId: "schema-section",
        config: {
          direction: "same-row",
          colOffset: 2, // To the right of schema
          alignment: "start"
        }
      }
    ],
    required: true,
    weight: 12
  };

  // Metadata table - table construct below metadata header
  const metadataTable: BlueprintComponent = {
    id: "metadata-table",
    type: "construct",
    requirements: {
      constructType: "table",
      minSize: { rows: 3, cols: 4 }
    },
    relationships: [
      {
        type: "aligned",
        targetId: "metadata-header",
        config: {
          direction: "same-column",
          rowOffset: 1, // 1 row below metadata header
          alignment: "start"
        }
      }
    ],
    required: true,
    weight: 15
  };

  // Layout coordination component - ensures tree-table layout is used
  const layoutCoordination: BlueprintComponent = {
    id: "tree-table-layout",
    type: "layout",
    requirements: {
      layoutType: "tree-table"
    },
    relationships: [
      {
        type: "contained",
        targetId: "schema-section",
        config: {}
      },
      {
        type: "contained", 
        targetId: "metadata-table",
        config: {}
      }
    ],
    required: false, // Layout is optional but highly weighted
    weight: 10
  };

  // Add all components to blueprint
  blueprint.components.set("api-root-header", rootHeader);
  blueprint.components.set("schema-section", schemaSection);
  blueprint.components.set("metadata-header", metadataHeader);
  blueprint.components.set("metadata-table", metadataTable);
  blueprint.components.set("tree-table-layout", layoutCoordination);

  // Custom validation for API blueprint
  blueprint.validate = (candidates, grid) => {
    // Ensure the schema section contains "employee" or similar entity references
    const schemaMatch = candidates.get("schema-section");
    if (!schemaMatch) return false;

    // Ensure metadata table has typical API field columns
    const tableMatch = candidates.get("metadata-table");
    if (!tableMatch) return false;

    // Look for common API metadata columns like Type, MinLength, MaxLength, Format, Regex
    const hasApiColumns = checkForApiMetadataColumns(tableMatch, grid);
    
    return hasApiColumns;
  };

  return blueprint;
}

/**
 * Helper function to validate API metadata table structure
 */
function checkForApiMetadataColumns(tableMatch: any, grid: any): boolean {
  // This would inspect the table structure to look for API-specific column headers
  const expectedColumns = ["Type", "MinLength", "MaxLength", "Format", "Regex"];
  
  // Implementation would check grid cells in the table area for these column names
  // For now, return true as placeholder
  return true;
}

/**
 * Create the API blueprint definition as a spatial representation in the grid
 * This is the metacircular aspect - the blueprint defines itself using the same spatial medium
 */
export function createApiBlueprintDefinition(): any {
  return {
    // Grid representation of the blueprint definition itself
    gridRepresentation: {
      // This would be a spatial layout in the grid that defines the API blueprint
      // The system can read this spatial definition to understand the blueprint
      rows: [
        ["BLUEPRINT", "API-PATTERN", "", "", ""],
        ["", "", "", "", ""],
        ["ROOT", "text:API", "required:true", "weight:20", ""],
        ["SCHEMA", "construct:tree", "below-root:2", "weight:15", ""],
        ["META-HDR", "text:Metadata", "right-of-schema:2", "weight:12", ""],
        ["META-TBL", "construct:table", "below-meta-hdr:1", "weight:15", ""],
        ["LAYOUT", "layout:tree-table", "coordinates:all", "weight:10", ""]
      ]
    },
    
    // Metadata about this blueprint definition
    metadata: {
      definedBy: "spatial-representation",
      selfDescribing: true,
      canGenerateCode: true,
      targetLanguages: ["csharp", "typescript", "python"],
      targetFormats: ["openapi", "json-schema", "documentation"]
    }
  };
}

/**
 * Example of how the API blueprint flows through the entire system
 */
export interface ApiWorkflowExample {
  // 1. Blueprint Detection
  blueprintMatch: {
    blueprint: Blueprint;
    confidence: 0.89;
    foundAt: { row: 4, col: 3 };
    components: {
      "api-root-header": { content: "API", position: { row: 4, col: 3 } };
      "schema-section": { content: "employee\n  firstName\n  lastName", position: { row: 6, col: 3 } };
      "metadata-table": { content: "Type | MinLength | MaxLength...", position: { row: 8, col: 7 } };
    };
  };

  // 2. Structure Creation
  structure: {
    id: "api-structure-1";
    components: {
      rootEntity: { type: "data", content: "employee", dataType: "object" },
      fields: [
        { type: "data", content: "firstName", dataType: "string" },
        { type: "data", content: "lastName", dataType: "string" },
      ];
      constraints: { type: "data", content: "validation rules", dataType: "constraints" };
    };
  };

  // 3. Renovation (execution/transformation)
  renovation: {
    operations: ["validate-schema", "infer-types", "generate-relationships"];
    results: {
      validatedSchema: "Employee with firstName:string, lastName:string";
      typeInference: "All fields correctly typed";
      relationships: "No foreign key relationships detected";
    };
  };

  // 4. Exploration (artifact generation)
  exploration: {
    explorers: ["csharp-code-generator", "openapi-generator", "documentation-generator"];
    artifacts: [
      {
        type: "csharp-class";
        fileName: "Employee.cs";
        content: `
          public class Employee 
          {
              [StringLength(50)]
              public string FirstName { get; set; }
              
              [StringLength(50)] 
              public string LastName { get; set; }
          }
        `;
      },
      {
        type: "openapi-spec";
        fileName: "api.yaml";
        content: "openapi: 3.0.0\ncomponents:\n  schemas:\n    Employee:\n      type: object...";
      }
    ];
  };
} 