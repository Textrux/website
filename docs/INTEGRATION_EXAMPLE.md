# Integration Example: From Grid to C# Code

This example demonstrates the complete flow from parsing a grid to generating C# classes, showing how all layers work together.

## Grid Input (from screenshot)

```
      C1    C2         C3         C4          C5         C6         C7         C8
R4           API
R5
R6           Schema                                       Metadata
R7
R8           Root        employee                        Type       MinLength  MaxLength  Format     Regex
R9
R10          firstName                                   string     2          50         -          -
R11          lastName                                    string     2          50         -          -
R12          dateOfBirth                                 date       -          -          yyyymmdd   -
R13          email                                       string     -          -          -          ^.*@.*$
```

## Complete Integration Flow

### 1. **GridParser Enhancement**

```typescript
// Enhanced GridParser.ts integration
export function parseAndFormatGridWithBlueprints(grid: GridModel): {
  styleMap: Record<string, string[]>;
  formatMap: Record<string, CellFormat>;
  blockList: Block[];
  structures: Structure[];
  artifacts: ExplorationArtifact[];
} {
  // Existing parsing
  const { styleMap, formatMap, blockList } = parseAndFormatGrid(grid);

  // New blueprint/structure processing
  const blueprintDetector = new BlueprintDetector();
  const structureFactory = new StructureFactory();
  const renovatorRegistry = new RenovatorRegistry();
  const explorerRegistry = new ExplorerRegistry();

  // 1. Detect blueprint patterns
  const blueprintMatches = blueprintDetector.detectBlueprints(
    grid,
    getAllConstructs(blockList),
    getAllLayouts(blockList)
  );

  // 2. Create structures from blueprint matches
  const structures: Structure[] = [];
  for (const match of blueprintMatches) {
    const structure = await structureFactory.createFromMatch(match, grid);
    structures.push(structure);
  }

  // 3. Apply renovations to structures
  for (const structure of structures) {
    // Type inference
    const typeInferenceRenovator =
      renovatorRegistry.getRenovator("type-inference");
    await typeInferenceRenovator.apply(
      { type: "structure", target: structure },
      context
    );

    // Validation
    const validationRenovator = renovatorRegistry.getRenovator("validation");
    await validationRenovator.apply(
      { type: "structure", target: structure },
      context
    );
  }

  // 4. Generate artifacts
  const artifacts: ExplorationArtifact[] = [];
  for (const structure of structures) {
    // Generate C# classes
    const csharpExplorer = explorerRegistry.getExplorer(
      "csharp-code-generator"
    );
    const result = await csharpExplorer.explore(structure, explorationContext);
    artifacts.push(...result.artifacts);

    // Generate OpenAPI spec
    const openApiExplorer = explorerRegistry.getExplorer("openapi-generator");
    const apiResult = await openApiExplorer.explore(
      structure,
      explorationContext
    );
    artifacts.push(...apiResult.artifacts);
  }

  // 5. Merge element formatting with existing format map
  for (const structure of structures) {
    if (structure.blueprint.metadata.layoutType === "tree-table") {
      const treeConstruct = getTreeConstruct(structure);
      const tableConstruct = getTableConstruct(structure);

      // Apply element-specific formatting
      if (treeConstruct?.elementContainer) {
        const elementFormatMap = treeConstruct.getElementFormatMap();
        for (const [position, format] of elementFormatMap) {
          const existing = formatMap[position];
          formatMap[position] = existing ? existing.merge(format) : format;
        }
      }
    }
  }

  return { styleMap, formatMap, blockList, structures, artifacts };
}
```

### 2. **Blueprint Detection Result**

```typescript
const apiBlueprint = {
  blueprint: createApiBlueprint(),
  confidence: 0.89,
  componentMatches: new Map([
    [
      "api-root-header",
      {
        component: rootHeaderComponent,
        matchedElement: { content: "API", position: { row: 4, col: 2 } },
        position: { topRow: 4, bottomRow: 4, leftCol: 2, rightCol: 2 },
        confidence: 0.95,
      },
    ],
    [
      "schema-section",
      {
        component: schemaSectionComponent,
        matchedElement: treeConstruct,
        position: { topRow: 8, bottomRow: 13, leftCol: 2, rightCol: 3 },
        confidence: 0.85,
      },
    ],
    [
      "metadata-table",
      {
        component: metadataTableComponent,
        matchedElement: tableConstruct,
        position: { topRow: 8, bottomRow: 13, leftCol: 5, rightCol: 8 },
        confidence: 0.9,
      },
    ],
  ]),
};
```

### 3. **Structure Creation**

```typescript
const apiStructure: Structure = {
  id: "api-structure-employee-v1",
  blueprint: apiBlueprint.blueprint,
  blueprintMatch: apiBlueprint,
  components: new Map([
    [
      "root-entity",
      {
        id: "root-entity",
        type: "data",
        sourceElement: treeRootNode,
        rawContent: "employee",
        parsedContent: { entityName: "employee", type: "object" },
        dataType: {
          primaryType: "object",
          subType: "entity",
          confidence: 0.95,
        },
      },
    ],
    [
      "firstName-field",
      {
        id: "firstName-field",
        type: "data",
        sourceElement: treeNode1,
        rawContent: "firstName",
        parsedContent: {
          fieldName: "firstName",
          type: "string",
          minLength: 2,
          maxLength: 50,
        },
        dataType: {
          primaryType: "string",
          constraints: [{ type: "length", config: { min: 2, max: 50 } }],
          confidence: 0.92,
        },
      },
    ],
    // ... more components
  ]),
  validation: { valid: true, errors: [], warnings: [] },
};
```

### 4. **Renovation Results**

```typescript
// Type Inference Renovation
const typeInferenceResult = {
  success: true,
  structure: apiStructure, // with enhanced type information
  artifacts: [],
  log: [
    { level: "info", message: "Inferred entity type: Employee" },
    {
      level: "info",
      message:
        "Inferred field types: firstName:string, lastName:string, dateOfBirth:Date, email:string",
    },
    {
      level: "info",
      message: "Applied validation constraints from metadata table",
    },
  ],
};

// Validation Renovation
const validationResult = {
  success: true,
  structure: apiStructure, // with validation rules applied
  artifacts: [],
  log: [
    { level: "info", message: "All fields have valid type constraints" },
    { level: "info", message: "Email regex pattern validated" },
    { level: "info", message: "Date format constraint applied" },
  ],
};
```

### 5. **Exploration Results**

```typescript
// C# Code Generation
const csharpResult = {
  success: true,
  artifacts: [
    {
      id: "employee-class",
      type: "file",
      mimeType: "text/x-csharp",
      fileName: "Employee.cs",
      outputPath: "./Models/Employee.cs",
      content: `
using System.ComponentModel.DataAnnotations;

namespace YourApi.Models
{
    public class Employee
    {
        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string LastName { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyyMMdd}")]
        public DateTime DateOfBirth { get; set; }

        [EmailAddress]
        [RegularExpression(@"^.*@.*$")]
        public string Email { get; set; }
    }
}`,
      generatedAt: Date.now(),
      hash: "sha256:abc123...",
    },
  ],
};

// OpenAPI Specification Generation
const openApiResult = {
  success: true,
  artifacts: [
    {
      id: "openapi-spec",
      type: "file",
      mimeType: "application/yaml",
      fileName: "api.yaml",
      outputPath: "./docs/api.yaml",
      content: `
openapi: 3.0.0
info:
  title: Employee API
  version: 1.0.0
components:
  schemas:
    Employee:
      type: object
      required:
        - firstName
        - lastName
        - dateOfBirth
        - email
      properties:
        firstName:
          type: string
          minLength: 2
          maxLength: 50
        lastName:
          type: string
          minLength: 2
          maxLength: 50
        dateOfBirth:
          type: string
          format: date
          pattern: '^\\d{8}$'
        email:
          type: string
          format: email
          pattern: '^.*@.*$'
paths:
  /employees:
    get:
      summary: Get all employees
      responses:
        '200':
          description: List of employees
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Employee'
    post:
      summary: Create employee
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Employee'
      responses:
        '201':
          description: Employee created`,
      generatedAt: Date.now(),
      hash: "sha256:def456...",
    },
  ],
};
```

### 6. **Element Formatting Integration**

```typescript
// Tree node formatting based on role
const treeElementFormats = new Map([
  ["R8C2", CellFormat.fromCssClass("tree-root-node")], // 'employee' root
  ["R10C2", CellFormat.fromCssClass("tree-leaf-node")], // 'firstName'
  ["R11C2", CellFormat.fromCssClass("tree-leaf-node")], // 'lastName'
  ["R12C2", CellFormat.fromCssClass("tree-leaf-node")], // 'dateOfBirth'
  ["R13C2", CellFormat.fromCssClass("tree-leaf-node")], // 'email'
]);

// Table header formatting
const tableElementFormats = new Map([
  ["R8C5", CellFormat.fromCssClass("table-header-cell")], // 'Type'
  ["R8C6", CellFormat.fromCssClass("table-header-cell")], // 'MinLength'
  ["R8C7", CellFormat.fromCssClass("table-header-cell")], // 'MaxLength'
  ["R8C8", CellFormat.fromCssClass("table-header-cell")], // 'Format'
]);

// Merge with existing formatMap
for (const [position, format] of treeElementFormats) {
  const existing = formatMap[position];
  formatMap[position] = existing ? existing.merge(format) : format;
}
```

### 7. **Live Programming Features**

```typescript
// Real-time updates when grid changes
grid.addEventListener("cellChange", async (event) => {
  if (isInApiStructure(event.row, event.col)) {
    // Re-parse affected structure
    const updatedStructure = await updateStructureFromGridChange(
      apiStructure,
      event.row,
      event.col,
      event.newValue
    );

    // Re-generate affected artifacts
    const updatedArtifacts = await regenerateArtifacts(updatedStructure, [
      "csharp-classes",
    ]);

    // Update UI with new generated code
    updateCodePreview(updatedArtifacts);

    // Show validation feedback
    updateValidationFeedback(updatedStructure.validation);
  }
});

// Control integration
document.addEventListener("keydown", async (event) => {
  if (event.ctrlKey && event.key === "Enter") {
    const selectedCell = getCurrentSelection();
    const structure = getStructureContainingCell(selectedCell);

    if (structure) {
      const context = createControlContext(structure, [selectedCell]);
      const result = await controlRegistry.executeControl(
        { type: "keyboard", data: { key: "Enter", modifiers: ["ctrl"] } },
        context
      );

      if (result.success) {
        // Update grid with new structure
        updateGridFromStructureChange(result);

        // Re-generate artifacts
        const newArtifacts = await regenerateArtifacts(result.structure);
        updateArtifactDisplay(newArtifacts);
      }
    }
  }
});
```

## Key Integration Points

### **1. Backward Compatibility**

- Existing `parseAndFormatGrid()` continues to work unchanged
- New functionality is additive, not replacing
- All existing constructs and layouts remain functional

### **2. Format Map Enhancement**

- Element-specific formatting merges with existing cell formatting
- Tree node roles (root, leaf) get different visual treatments
- Table headers and data cells maintain distinct styling

### **3. Event Integration**

- Layout coordination events integrate with existing event system
- Tree-table synchronization works through existing layout mechanisms
- Control events flow through existing UI event handling

### **4. Performance Optimization**

- Blueprint detection only runs on grid changes that affect structure areas
- Artifact generation is incremental - only regenerate what changed
- Structure validation is cached and only re-runs when necessary

### **5. UI Integration**

- Generated artifacts display in side panels or tabs
- Real-time code preview updates as grid changes
- Validation feedback shows inline with grid cells
- Control hints display contextually based on current selection

This integration demonstrates how the spatial programming protocol seamlessly extends the existing Textrux system while maintaining all current functionality and adding powerful new capabilities for metacircular spatial programming.
