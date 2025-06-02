import {
  StructureControl,
  ControlContext,
  ControlResult,
  ControlTrigger,
  KeyboardTrigger,
} from "../../interfaces/ConstructControlInterfaces";
import {
  StructureChangeEvent,
  ConstructEventFactory,
} from "../../interfaces/ConstructEventInterfaces";
import { TreeNodeElement } from "./TreeElement";
import { HierarchicalElement } from "../../interfaces/ConstructElementInterfaces";

/**
 * Control for inserting a child node in a tree
 */
export class InsertChildNodeControl implements StructureControl {
  id: string = "tree-insert-child";
  name: string = "Insert Child Node";
  description: string = "Insert a new child node under the selected tree node";
  category: string = "structure";
  supportsUndo: boolean = true;

  /**
   * Check if this control can be executed
   */
  canExecute(context: ControlContext): boolean {
    // Must have a tree construct
    if (context.construct.type !== "tree") {
      return false;
    }

    // Must have exactly one selected element
    if (context.selectedElements.length !== 1) {
      return false;
    }

    // Selected element must be a tree node that can have children
    const selectedElement = context.selectedElements[0] as HierarchicalElement;
    return (
      selectedElement.type === "tree-node" && selectedElement.canHaveChildren
    );
  }

  /**
   * Execute the control
   */
  async execute(context: ControlContext): ControlResult {
    try {
      const selectedElement = context.selectedElements[0] as TreeNodeElement;
      const targetRow = selectedElement.position.row + 1;
      const newLevel = selectedElement.level + 1;

      // Create new child node element
      const newNodeId = `tree-node-${Date.now()}`;
      const newNode = new TreeNodeElement(
        newNodeId,
        {
          row: targetRow,
          col: selectedElement.position.col,
          relativeRow: targetRow - context.construct.bounds.topRow,
          relativeCol:
            selectedElement.position.col - context.construct.bounds.leftCol,
        },
        "", // Empty content for new node
        newLevel,
        selectedElement.id,
        "node"
      );

      // Update parent's children list
      selectedElement.addChild(newNodeId);

      // Create structure change event
      const eventFactory = new BaseConstructEventFactory();
      const structureEvent = eventFactory.createStructureChangeEvent(
        context.construct,
        "insert",
        {
          newElement: newNode,
          parentElement: selectedElement,
          insertPosition: targetRow,
        }
      );

      return {
        success: true,
        events: [structureEvent],
        updatedElements: [selectedElement, newNode],
        gridModified: true,
        metadata: {
          newElementId: newNodeId,
          parentElementId: selectedElement.id,
          insertRow: targetRow,
        },
      };
    } catch (error) {
      return {
        success: false,
        events: [],
        updatedElements: [],
        gridModified: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {},
      };
    }
  }

  /**
   * Undo the control execution
   */
  async undo(context: ControlContext): Promise<ControlResult> {
    // Implementation would remove the inserted node
    // This is a simplified version
    return {
      success: true,
      events: [],
      updatedElements: [],
      gridModified: true,
      metadata: { operation: "undo" },
    };
  }

  /**
   * Get keyboard trigger for this control
   */
  static getKeyboardTrigger(): KeyboardTrigger {
    return {
      type: "keyboard",
      config: {
        key: "Enter",
        modifiers: ["ctrl"],
        preventDefault: true,
        requireFocus: true,
      },
      priority: 10,
      matches: (input) => {
        return (
          input.type === "keyboard" &&
          input.data.key === "Enter" &&
          input.data.modifiers?.includes("ctrl")
        );
      },
    };
  }
}

/**
 * Control for moving tree nodes up/down
 */
export class MoveTreeNodeControl implements StructureControl {
  id: string = "tree-move-node";
  name: string = "Move Tree Node";
  description: string = "Move a tree node up or down in the hierarchy";
  category: string = "structure";
  supportsUndo: boolean = true;

  private direction: "up" | "down";

  constructor(direction: "up" | "down") {
    this.direction = direction;
    this.id = `tree-move-node-${direction}`;
    this.name = `Move Tree Node ${
      direction.charAt(0).toUpperCase() + direction.slice(1)
    }`;
  }

  /**
   * Check if this control can be executed
   */
  canExecute(context: ControlContext): boolean {
    if (context.construct.type !== "tree") {
      return false;
    }

    if (context.selectedElements.length !== 1) {
      return false;
    }

    const selectedElement = context.selectedElements[0] as HierarchicalElement;
    return selectedElement.type === "tree-node";
  }

  /**
   * Execute the control
   */
  async execute(context: ControlContext): ControlResult {
    try {
      const selectedElement = context.selectedElements[0] as TreeNodeElement;
      const moveAmount = this.direction === "up" ? -1 : 1;
      const newRow = selectedElement.position.row + moveAmount;

      // Update position
      const oldPosition = { ...selectedElement.position };
      selectedElement.position.row = newRow;
      selectedElement.position.relativeRow =
        newRow - context.construct.bounds.topRow;

      // Create structure change event
      const eventFactory = new BaseConstructEventFactory();
      const structureEvent = eventFactory.createStructureChangeEvent(
        context.construct,
        "move",
        {
          element: selectedElement,
          oldPosition,
          newPosition: selectedElement.position,
          direction: this.direction,
        }
      );

      return {
        success: true,
        events: [structureEvent],
        updatedElements: [selectedElement],
        gridModified: true,
        metadata: {
          elementId: selectedElement.id,
          oldRow: oldPosition.row,
          newRow: newRow,
          direction: this.direction,
        },
      };
    } catch (error) {
      return {
        success: false,
        events: [],
        updatedElements: [],
        gridModified: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {},
      };
    }
  }

  /**
   * Undo the control execution
   */
  async undo(context: ControlContext): Promise<ControlResult> {
    // Implementation would move the node back to its original position
    return {
      success: true,
      events: [],
      updatedElements: [],
      gridModified: true,
      metadata: { operation: "undo" },
    };
  }
}

/**
 * Basic implementation of construct event factory for demonstrations
 */
class BaseConstructEventFactory implements ConstructEventFactory {
  createStructureChangeEvent(
    source: any,
    operation: any,
    data: any
  ): StructureChangeEvent {
    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "structure-change",
      sourceConstruct: source,
      timestamp: Date.now(),
      payload: {
        operation,
        targetElement: data.element || data.newElement,
        position: data.newPosition || data.insertPosition,
        affectedElements: data.element ? [data.element] : [data.newElement],
        metadata: data,
      },
      cancellable: true,
      cancelled: false,
      propagates: true,
    };
  }

  createSelectionChangeEvent(
    source: any,
    selected: any[],
    previous: any[]
  ): any {
    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "selection-change",
      sourceConstruct: source,
      timestamp: Date.now(),
      payload: {
        selectedElements: selected,
        previousSelection: previous,
        selectionType: selected.length > 1 ? "multiple" : "single",
      },
      cancellable: false,
      cancelled: false,
      propagates: true,
    };
  }

  createContentChangeEvent(
    source: any,
    element: any,
    oldContent: string,
    newContent: string
  ): any {
    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "content-change",
      sourceConstruct: source,
      timestamp: Date.now(),
      payload: {
        element,
        oldContent,
        newContent,
        changeType: "edit",
      },
      cancellable: true,
      cancelled: false,
      propagates: true,
    };
  }

  createNavigationEvent(
    source: any,
    direction: string,
    from?: any,
    to?: any
  ): any {
    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "navigation",
      sourceConstruct: source,
      timestamp: Date.now(),
      payload: {
        direction,
        fromElement: from,
        toElement: to,
        navigationMode: "cursor",
      },
      cancellable: false,
      cancelled: false,
      propagates: true,
    };
  }

  createLayoutCoordinationEvent(
    source: any,
    coordinationType: string,
    targets: any[],
    data: any
  ): any {
    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "layout-coordination",
      sourceConstruct: source,
      timestamp: Date.now(),
      payload: {
        coordinationType,
        targetConstructs: targets,
        coordinationData: data,
      },
      cancellable: false,
      cancelled: false,
      propagates: true,
    };
  }
}
