# Construct Scaffolding System

This document describes the new scaffolding system for constructs, elements, events, controls, and layouts in the Textrux application.

## Overview

The scaffolding provides a comprehensive framework for:

1. **Element Management** - Breaking constructs down into manageable elements with individual formatting and interaction capabilities
2. **Event System** - Allowing constructs to emit events and respond to changes
3. **Control System** - Abstract controls that can be triggered by keyboard, API, or other means
4. **Layout System** - Coordinating changes between multiple constructs

## Architecture

### 1. Construct Elements (`4-constructs/interfaces/ConstructElementInterfaces.ts`)

Elements are the individual components within a construct that can be formatted and interacted with separately.

**Key Interfaces:**

- `ConstructElement` - Base element interface
- `SelectableElement` - Elements that can be selected
- `HierarchicalElement` - Elements in hierarchical structures (trees)
- `TabularElement` - Elements in tabular structures (tables)
- `ConstructElementContainer` - Manages collections of elements

**Example Usage:**

```typescript
// Tree nodes as hierarchical elements
const treeNode = new TreeNodeElement(
  "node-1",
  { row: 5, col: 3 },
  "My Node",
  1, // level
  "parent-id"
);

// Add to element container
elementContainer.addElement(treeNode);
```

### 2. Event System (`4-constructs/interfaces/ConstructEventInterfaces.ts`)

Events allow constructs to communicate changes and coordinate with layouts.

**Key Event Types:**

- `StructureChangeEvent` - When elements are added, removed, or moved
- `SelectionChangeEvent` - When element selection changes
- `ContentChangeEvent` - When element content is modified
- `NavigationEvent` - When cursor/focus moves between elements
- `LayoutCoordinationEvent` - For coordinating between constructs

**Example Usage:**

```typescript
// Emit a structure change event
const structureEvent = eventFactory.createStructureChangeEvent(
  treeConstruct,
  "insert",
  { newElement: childNode, parentElement: parentNode }
);

await eventBus.emit(structureEvent);
```

### 3. Control System (`4-constructs/interfaces/ConstructControlInterfaces.ts`)

Controls provide abstract actions that can be triggered by different means.

**Key Components:**

- `ConstructControl` - Base control interface
- `ControlTrigger` - Ways to activate controls (keyboard, API, etc.)
- `ControlBinding` - Associates triggers with controls
- `ControlRegistry` - Manages available controls

**Example Usage:**

```typescript
// Register a control with keyboard trigger
const insertChildControl = new InsertChildNodeControl();
const keyboardTrigger = InsertChildNodeControl.getKeyboardTrigger(); // Ctrl+Enter

const binding: ControlBinding = {
  control: insertChildControl,
  triggers: [keyboardTrigger],
  enabled: true,
};

controlRegistry.registerBinding(binding);
```

### 4. Layout System (`5-layouts/interfaces/LayoutInterfaces.ts`)

Layouts coordinate changes between multiple constructs.

**Key Interfaces:**

- `Layout` - Base layout interface
- `CoordinatedLayout` - Layouts that handle event coordination
- `TreeTableLayout` - Specific layout for tree-table coordination
- `LayoutCoordinationRule` - Rules for how layouts respond to events

**Example Usage:**

```typescript
// Create a tree-table layout
const layout = new BaseTreeTableLayout("layout-1");
layout.addConstruct(treeConstruct);
layout.addConstruct(tableConstruct);
await layout.activate();

// Layout will automatically coordinate structure changes between tree and table
```

## Example Implementation: Tree with Ctrl+Enter Control

Here's how the system works together for a tree construct:

1. **Tree Elements**: Tree nodes are represented as `TreeNodeElement` instances with hierarchical relationships
2. **Insert Child Control**: `InsertChildNodeControl` responds to Ctrl+Enter to insert new child nodes
3. **Structure Events**: When a child is inserted, a `StructureChangeEvent` is emitted
4. **Layout Coordination**: If a `TreeTableLayout` is active, it responds to the tree structure change by inserting a corresponding row in the linked table

## Integration Points

### GridParser Integration

The existing `GridParser.ts` already calls `cellCluster.addConstruct(construct)` for identified constructs. The new scaffolding extends this by:

1. **Enhanced Constructs**: Constructs can now implement `EnhancedConstruct` interface for full capabilities
2. **Element Population**: After constructs are added, call `construct.populateElements()` to create elements
3. **Event Bus Connection**: Connect constructs to the global event bus for coordination
4. **Layout Detection**: Automatically detect and activate appropriate layouts

### Format Map Integration

The new element formatting integrates with the existing format system:

```typescript
// Get element formats and merge with existing format map
const elementFormatMap = construct.getElementFormatMap();
for (const [position, format] of elementFormatMap) {
  // Merge with existing formatMap from GridParser
  formatMap[position] = existingFormat?.merge(format) || format;
}
```

## Usage Example

```typescript
// 1. Create enhanced construct
const tree = new EnhancedTree(/* ... */);
await tree.initializeEnhancements();

// 2. Set up controls
const controlRegistry = new ControlRegistry();
controlRegistry.registerControl(new InsertChildNodeControl());

// 3. Set up layout
const treeTableLayout = new BaseTreeTableLayout("layout-1");
treeTableLayout.addConstruct(tree);
treeTableLayout.addConstruct(table);
await treeTableLayout.activate();

// 4. Connect to event bus
const eventBus = new BaseConstructEventBus();
tree.eventEmitter = eventBus.createScopedBus(tree);

// 5. Handle keyboard input
document.addEventListener("keydown", async (event) => {
  if (event.ctrlKey && event.key === "Enter") {
    const context = createControlContext(tree, selectedElements);
    await controlRegistry.executeControl(keyboardInput, context);
  }
});
```

## Benefits

1. **Separation of Concerns**: Elements, events, controls, and layouts are cleanly separated
2. **Extensibility**: Easy to add new construct types, controls, and layouts
3. **Coordination**: Layouts automatically handle complex interactions between constructs
4. **Flexibility**: Controls can be triggered by keyboard, API, voice, etc.
5. **Backward Compatibility**: Existing constructs continue to work while gaining new capabilities

## Next Steps

1. **Enhance Existing Constructs**: Extend `Tree`, `Table`, etc. to implement `EnhancedConstruct`
2. **Format Providers**: Create specific format providers for different construct types
3. **More Controls**: Implement additional controls for navigation, editing, etc.
4. **Layout Detection**: Add automatic layout detection based on construct relationships
5. **UI Integration**: Connect the control system to the actual UI keyboard handling

The scaffolding is designed to be incrementally adoptable - existing functionality continues to work while new capabilities can be gradually integrated.
