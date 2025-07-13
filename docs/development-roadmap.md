# Development Roadmap: From Foundations to Constructs

## Current State and Goal

**Where we are**: Grid parsing and foundational structures (blocks, cell clusters, block subclusters) are working.

**Where we need to be**: Trees, tables, matrices, and key-value pairs are automatically parsed and formatted in the UI for July 21st conference submission.

**Core Philosophy**: Build trait-based parsing that discovers construct attributes rather than hard-coded construct-specific algorithms. This keeps the system future-proof and extensible.

## The Trait-Based Approach

Instead of writing algorithms that directly look for "trees" or "tables," we:

1. **Analyze spatial traits** of cell clusters and blocks
2. **Derive semantic attributes** from those traits
3. **Match attribute patterns** to construct types
4. **Apply construct-specific formatting and actions**

This mirrors how high-level language parsers work - they don't look for "if statements," they look for tokens and patterns that indicate conditional structures.

## Phase 1: Enhanced Trait Analysis (Weeks 1-2)

### 1.1 Spatial Relationship Traits
Expand the current trait system to capture more sophisticated spatial relationships:

**Parent-Child Analysis**:
```typescript
interface ParentChildTraits {
  hasParentCandidate: boolean;
  parentDirection: 'above' | 'left' | 'above-left' | null;
  childCandidates: Array<{
    direction: 'below' | 'right' | 'below-right';
    distance: number;
    alignment: 'aligned' | 'indented' | 'offset';
  }>;
  hierarchyDepth: number;
  isRootCandidate: boolean;
}
```

**Peer Relationship Analysis**:
```typescript
interface PeerTraits {
  peerCandidates: Array<{
    direction: 'above' | 'below' | 'left' | 'right';
    distance: number;
    alignment: 'perfect' | 'partial' | 'none';
  }>;
  isPartOfSequence: boolean;
  sequenceDirection: 'vertical' | 'horizontal' | null;
  sequencePosition: number | null;
}
```

**Containment Analysis**:
```typescript
interface ContainmentTraits {
  containsSubclusters: boolean;
  subclusters: Array<{
    role: 'header' | 'data' | 'label' | 'value' | 'unknown';
    position: 'top' | 'left' | 'center' | 'scattered';
  }>;
  hasHeaderPattern: boolean;
  headerOrientation: 'row' | 'column' | 'both' | null;
}
```

### 1.2 Content Pattern Analysis
Analyze the actual content to support trait-based detection:

**Text Analysis**:
```typescript
interface ContentTraits {
  contentTypes: Array<'text' | 'number' | 'date' | 'formula' | 'empty'>;
  textPatterns: {
    hasRepeatingPattern: boolean;
    hasCategoricalData: boolean;
    hasHierarchicalMarkers: boolean; // indentation, bullets, numbering
  };
  dataHomogeneity: 'homogeneous' | 'mixed' | 'structured_mixed';
}
```

### 1.3 Arrangement Traits
Capture how subclusters are arranged within a cell cluster:

**Grid Analysis**:
```typescript
interface ArrangementTraits {
  gridLikeness: number; // 0-1 score
  rowAlignment: 'strict' | 'loose' | 'none';
  columnAlignment: 'strict' | 'loose' | 'none';
  hasRegularSpacing: boolean;
  orientation: 'row-major' | 'column-major' | 'mixed';
}
```

## Phase 2: Construct Signature Definition (Week 3)

### 2.1 Tree Signatures
Define what spatial and content traits indicate a tree structure:

```typescript
interface TreeSignature {
  name: 'tree';
  requiredTraits: {
    parentChild: {
      hasHierarchicalStructure: true;
      maxDepth: number; // > 1
    };
    arrangement: {
      orientation: 'row-major' | 'column-major';
      hasRegularSpacing: true;
    };
    content: {
      hasHierarchicalMarkers?: boolean;
    };
  };
  confidence: (traits: CellClusterTraits) => number;
  orientationDetection: (traits: CellClusterTraits) => TreeOrientation;
}

type TreeOrientation = 
  | 'down-right'     // root top-left, children below and/or right
  | 'down-left'      // root top-right, children below and/or left  
  | 'up-right'       // root bottom-left, children above and/or right
  | 'up-left';       // root bottom-right, children above and/or left
```

### 2.2 Table Signatures
```typescript
interface TableSignature {
  name: 'table';
  requiredTraits: {
    arrangement: {
      gridLikeness: number; // > 0.7
      rowAlignment: 'strict' | 'loose';
      columnAlignment: 'strict' | 'loose';
    };
    containment: {
      hasHeaderPattern: boolean;
      headerOrientation: 'row' | 'column' | 'both';
    };
  };
  confidence: (traits: CellClusterTraits) => number;
}
```

### 2.3 Matrix Signatures
```typescript
interface MatrixSignature {
  name: 'matrix';
  requiredTraits: {
    arrangement: {
      gridLikeness: number; // > 0.8
      orientation: 'mixed'; // both row and column headers
    };
    containment: {
      hasHeaderPattern: true;
      headerOrientation: 'both';
    };
  };
  confidence: (traits: CellClusterTraits) => number;
}
```

### 2.4 Key-Value Signatures
```typescript
interface KeyValueSignature {
  name: 'key-value';
  requiredTraits: {
    arrangement: {
      orientation: 'row-major' | 'column-major';
      hasRegularSpacing: true;
    };
    containment: {
      subclusters: Array<{ role: 'label' | 'value' }>;
    };
    peer: {
      isPartOfSequence: true;
    };
  };
  confidence: (traits: CellClusterTraits) => number;
}
```

## Phase 3: Construct Parser Implementation (Week 4)

### 3.1 Signature Matching Engine
```typescript
class ConstructParser {
  private signatures: ConstructSignature[] = [
    new TreeSignature(),
    new TableSignature(), 
    new MatrixSignature(),
    new KeyValueSignature()
  ];

  parseConstruct(cellCluster: CellCluster): BaseConstruct[] {
    const constructs: BaseConstruct[] = [];
    
    for (const signature of this.signatures) {
      const confidence = signature.confidence(cellCluster.traits);
      
      if (confidence > 0.6) { // threshold for detection
        const construct = this.createConstruct(signature, cellCluster, confidence);
        constructs.push(construct);
      }
    }
    
    return constructs.sort((a, b) => b.confidence - a.confidence);
  }
}
```

### 3.2 Construct Semantic Analysis
Once we identify a construct type, analyze its semantic structure:

**Tree Structure Analysis**:
```typescript
interface TreeConstruct extends BaseConstruct {
  type: 'tree';
  root: TreeNode;
  orientation: TreeOrientation;
  depth: number;
  nodes: TreeNode[];
  
  // Semantic structure
  getParent(node: TreeNode): TreeNode | null;
  getChildren(node: TreeNode): TreeNode[];
  getSiblings(node: TreeNode): TreeNode[];
  getLevel(node: TreeNode): number;
}

interface TreeNode {
  cellRange: CellRange;
  content: string;
  level: number;
  hasChildren: boolean;
  isExpanded?: boolean;
}
```

**Table Structure Analysis**:
```typescript
interface TableConstruct extends BaseConstruct {
  type: 'table';
  headers: {
    row?: CellRange[];
    column?: CellRange[];
  };
  dataRegion: CellRange;
  rows: TableRow[];
  columns: TableColumn[];
}
```

## Phase 4: UI Formatting Engine (Week 5)

### 4.1 Construct-Aware Formatting
Apply visual formatting based on detected constructs:

```typescript
class ConstructFormatter {
  formatTree(tree: TreeConstruct): CellFormat[] {
    const formats: CellFormat[] = [];
    
    for (const node of tree.nodes) {
      const format = new CellFormat({
        // Base tree formatting
        backgroundColor: this.getTreeLevelColor(node.level),
        borderLeft: node.level > 0 ? '2px solid #ccc' : 'none',
        paddingLeft: `${node.level * 20}px`,
        
        // Orientation-specific formatting
        ...this.getOrientationSpecificFormat(tree.orientation, node),
        
        // Interactive elements
        cursor: node.hasChildren ? 'pointer' : 'default',
        position: 'relative'
      });
      
      if (node.hasChildren) {
        format.addExpandCollapseIcon(node.isExpanded);
      }
      
      formats.push(format);
    }
    
    return formats;
  }
}
```

### 4.2 Dynamic Layout Adjustment
Handle different orientations automatically:

```typescript
class OrientationHandler {
  adjustForOrientation(construct: TreeConstruct): LayoutAdjustment {
    switch (construct.orientation) {
      case 'down-right':
        return {
          childDirection: 'right',
          siblingDirection: 'down',
          indentationAxis: 'horizontal'
        };
      case 'down-left':
        return {
          childDirection: 'left', 
          siblingDirection: 'down',
          indentationAxis: 'horizontal'
        };
      // ... other orientations
    }
  }
}
```

## Phase 5: Interactive Actions System (Week 6)

### 5.1 Construct-Aware Actions
Define actions that work with construct semantics:

```typescript
interface ConstructAction {
  name: string;
  applicableConstructs: string[];
  keyBinding?: string;
  execute(construct: BaseConstruct, context: ActionContext): void;
}

class TreeActions {
  static ADD_SIBLING: ConstructAction = {
    name: 'Add Sibling',
    applicableConstructs: ['tree'],
    keyBinding: 'Shift+Enter',
    execute(tree: TreeConstruct, context: ActionContext) {
      const currentNode = tree.getNodeAt(context.selectedCell);
      const newNodePosition = this.calculateSiblingPosition(tree, currentNode);
      
      // Adjust cell cluster boundaries
      this.expandCellCluster(tree.cellCluster, newNodePosition);
      
      // Move other blocks if necessary
      this.adjustNearbyBlocks(tree.parentBlock, newNodePosition);
      
      // Create new node
      tree.addSibling(currentNode, newNodePosition);
    }
  };
}
```

### 5.2 Spatial Adjustment System
When actions modify construct structure, automatically adjust layout:

```typescript
class SpatialAdjustmentEngine {
  adjustForNewNode(
    construct: BaseConstruct, 
    newNodePosition: CellPosition,
    insertionType: 'sibling' | 'child'
  ): AdjustmentPlan {
    
    // Calculate required space
    const spaceNeeded = this.calculateSpaceRequirement(construct, insertionType);
    
    // Check for conflicts with nearby blocks
    const conflicts = this.detectConflicts(construct.parentBlock, spaceNeeded);
    
    // Generate adjustment plan
    return {
      cellClusterResize: this.planCellClusterResize(construct.cellCluster, spaceNeeded),
      blockMovements: this.planBlockMovements(conflicts),
      formatUpdates: this.planFormatUpdates(construct)
    };
  }
}
```

## Phase 6: Integration and Testing (Week 7)

### 6.1 End-to-End Pipeline
Connect all components:

```typescript
class ConstructPipeline {
  process(grid: GridModel): void {
    // 1. Parse foundations (already working)
    const blocks = this.parseFoundations(grid);
    
    // 2. Analyze enhanced traits
    for (const block of blocks) {
      for (const cellCluster of block.cellClusters) {
        cellCluster.traits = this.enhancedTraitParser.analyze(cellCluster);
      }
    }
    
    // 3. Detect constructs
    for (const block of blocks) {
      for (const cellCluster of block.cellClusters) {
        const constructs = this.constructParser.parseConstruct(cellCluster);
        cellCluster.constructs = constructs;
      }
    }
    
    // 4. Apply formatting
    const formatMap = this.constructFormatter.formatAll(blocks);
    this.ui.applyFormatting(formatMap);
    
    // 5. Register actions
    this.actionRegistry.registerConstructActions(blocks);
  }
}
```

### 6.2 Test Cases
Create test grids for each construct type and orientation:

- **Trees**: Down-right, down-left, up-right, up-left orientations
- **Tables**: Row headers, column headers, both headers, no headers
- **Matrices**: Numeric data with row/column labels
- **Key-Value**: Horizontal and vertical orientations
- **Mixed constructs**: Multiple construct types in same block
- **Edge cases**: Partial patterns, ambiguous structures

## Implementation Priority

**Week 1-2**: Enhanced trait analysis (focus on parent-child and peer relationships)
**Week 3**: Tree signature definition and basic tree detection
**Week 4**: Tree parsing and semantic analysis
**Week 5**: Tree formatting for all orientations
**Week 6**: Tree actions (add sibling, add child, move nodes)
**Week 7**: Table/matrix/key-value signatures and basic detection

## Success Metrics for Conference Submission

1. ✅ Trees automatically detected in any orientation
2. ✅ Tree formatting shows hierarchy visually
3. ✅ Tree actions work (add sibling/child via keyboard)
4. ✅ Tables automatically detected and formatted
5. ✅ Basic matrices and key-value pairs detected
6. ✅ Multiple constructs can coexist in same grid
7. ✅ System remains extensible for future construct types

This approach builds incrementally while maintaining the trait-based architecture that will support future expansion into layouts, blueprints, and self-defining grids.