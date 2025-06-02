import {
  TreeTableLayout,
  LayoutCoordinationRule,
  CoordinationAction,
} from "../interfaces/LayoutInterfaces";
import { BaseConstruct } from "../../4-constructs/interfaces/ConstructInterfaces";
import {
  ConstructEvent,
  StructureChangeEvent,
  LayoutCoordinationEvent,
} from "../../4-constructs/interfaces/ConstructEventInterfaces";
import { ConstructControl } from "../../4-constructs/interfaces/ConstructControlInterfaces";

/**
 * Tree-Table layout implementation that synchronizes trees and tables
 */
export class BaseTreeTableLayout implements TreeTableLayout {
  id: string;
  type: string = "tree-table";
  name: string = "Tree-Table Layout";
  description: string = "Coordinates a tree construct with a table construct";
  constructs: BaseConstruct[] = [];
  config: Record<string, any> = {};
  active: boolean = false;

  // TreeTableLayout specific properties
  treeConstruct?: BaseConstruct;
  tableConstruct?: BaseConstruct;
  syncConfig = {
    syncRowCount: true,
    syncSelection: true,
    syncStructure: true,
    defaultTableCellContent: "_",
  };

  // CoordinatedLayout properties
  coordinationRules: LayoutCoordinationRule[] = [];
  eventTypes: string[] = ["structure-change", "selection-change"];
  priority: number = 10;

  constructor(id: string, config?: Record<string, any>) {
    this.id = id;
    this.config = config || {};
    this.setupDefaultCoordinationRules();
  }

  /**
   * Initialize the layout
   */
  async initialize(): Promise<void> {
    // Setup coordination rules and event listeners
    this.setupDefaultCoordinationRules();
  }

  /**
   * Activate the layout
   */
  async activate(): Promise<void> {
    this.active = true;
    // Additional activation logic would go here
  }

  /**
   * Deactivate the layout
   */
  async deactivate(): Promise<void> {
    this.active = false;
    // Additional deactivation logic would go here
  }

  /**
   * Add a construct to this layout
   */
  addConstruct(construct: BaseConstruct): boolean {
    if (!this.canHandle([construct])) {
      return false;
    }

    this.constructs.push(construct);

    // Assign specific roles
    if (construct.type === "tree" && !this.treeConstruct) {
      this.treeConstruct = construct;
    } else if (construct.type === "table" && !this.tableConstruct) {
      this.tableConstruct = construct;
    }

    return true;
  }

  /**
   * Remove a construct from this layout
   */
  removeConstruct(construct: BaseConstruct): boolean {
    const index = this.constructs.indexOf(construct);
    if (index >= 0) {
      this.constructs.splice(index, 1);

      // Clear specific roles
      if (construct === this.treeConstruct) {
        this.treeConstruct = undefined;
      } else if (construct === this.tableConstruct) {
        this.tableConstruct = undefined;
      }

      return true;
    }
    return false;
  }

  /**
   * Check if this layout can handle the given constructs
   */
  canHandle(constructs: BaseConstruct[]): boolean {
    if (constructs.length > 2) return false;

    const hasTree = constructs.some((c) => c.type === "tree");
    const hasTable = constructs.some((c) => c.type === "table");

    return hasTree || hasTable; // Can handle tree-only, table-only, or tree-table
  }

  /**
   * Get layout-specific controls
   */
  getControls(): ConstructControl[] {
    // Return controls specific to tree-table coordination
    return [];
  }

  /**
   * Handle coordination between constructs
   */
  async coordinate(event: ConstructEvent): Promise<void> {
    if (!this.active) return;

    for (const rule of this.coordinationRules) {
      if (await this.shouldApplyRule(rule, event)) {
        await this.applyCoordinationRule(rule, event);
      }
    }
  }

  /**
   * Add a coordination rule
   */
  addCoordinationRule(rule: LayoutCoordinationRule): void {
    this.coordinationRules.push(rule);
    // Sort by priority
    this.coordinationRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Remove a coordination rule
   */
  removeCoordinationRule(ruleId: string): boolean {
    const index = this.coordinationRules.findIndex((r) => r.id === ruleId);
    if (index >= 0) {
      this.coordinationRules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Handle event (ConstructEventListener interface)
   */
  async handleEvent(event: ConstructEvent): Promise<boolean> {
    await this.coordinate(event);
    return true; // Don't cancel events
  }

  /**
   * Setup default coordination rules for tree-table layouts
   */
  private setupDefaultCoordinationRules(): void {
    // Rule 1: When tree structure changes, sync table structure
    this.addCoordinationRule({
      id: "tree-to-table-structure-sync",
      sourceEventTypes: ["structure-change"],
      sourceConstructTypes: ["tree"],
      targetConstructTypes: ["table"],
      action: new TreeToTableStructureSyncAction(),
      priority: 10,
      enabled: true,
      condition: (event) => this.syncConfig.syncStructure,
    });

    // Rule 2: When table structure changes, sync tree structure
    this.addCoordinationRule({
      id: "table-to-tree-structure-sync",
      sourceEventTypes: ["structure-change"],
      sourceConstructTypes: ["table"],
      targetConstructTypes: ["tree"],
      action: new TableToTreeStructureSyncAction(),
      priority: 9,
      enabled: true,
      condition: (event) => this.syncConfig.syncStructure,
    });

    // Rule 3: Selection synchronization
    this.addCoordinationRule({
      id: "selection-sync",
      sourceEventTypes: ["selection-change"],
      sourceConstructTypes: ["tree", "table"],
      targetConstructTypes: ["tree", "table"],
      action: new SelectionSyncAction(),
      priority: 5,
      enabled: true,
      condition: (event) => this.syncConfig.syncSelection,
    });
  }

  /**
   * Check if a coordination rule should be applied
   */
  private async shouldApplyRule(
    rule: LayoutCoordinationRule,
    event: ConstructEvent
  ): Promise<boolean> {
    // Check if rule is enabled
    if (!rule.enabled) return false;

    // Check event type
    if (!rule.sourceEventTypes.includes(event.type)) return false;

    // Check source construct type
    if (!rule.sourceConstructTypes.includes(event.sourceConstruct.type)) {
      return false;
    }

    // Check custom condition
    if (rule.condition && !rule.condition(event, this)) return false;

    return true;
  }

  /**
   * Apply a coordination rule
   */
  private async applyCoordinationRule(
    rule: LayoutCoordinationRule,
    event: ConstructEvent
  ): Promise<void> {
    // Find target constructs
    const targetConstructs = this.constructs.filter((c) =>
      rule.targetConstructTypes.includes(c.type)
    );

    if (targetConstructs.length === 0) return;

    // Execute the coordination action
    try {
      const resultEvents = await rule.action.execute(
        event,
        event.sourceConstruct,
        targetConstructs,
        this
      );

      // Emit any resulting events (would integrate with event bus in real implementation)
      for (const resultEvent of resultEvents) {
        console.log("Layout coordination event:", resultEvent);
      }
    } catch (error) {
      console.error("Error applying coordination rule:", error);
    }
  }
}

/**
 * Coordination action for syncing tree structure changes to table
 */
class TreeToTableStructureSyncAction implements CoordinationAction {
  type = "sync-structure" as const;
  config = {};

  async execute(
    sourceEvent: ConstructEvent,
    sourceConstruct: BaseConstruct,
    targetConstructs: BaseConstruct[],
    layout: TreeTableLayout
  ): Promise<ConstructEvent[]> {
    const structureEvent = sourceEvent as StructureChangeEvent;
    const tableConstruct = targetConstructs.find((c) => c.type === "table");

    if (!tableConstruct) return [];

    // Create corresponding table modification event
    const coordinationEvent: LayoutCoordinationEvent = {
      id: `coord-${Date.now()}`,
      type: "layout-coordination",
      sourceConstruct: sourceConstruct,
      timestamp: Date.now(),
      payload: {
        coordinationType: "sync-structure",
        targetConstructs: [tableConstruct],
        coordinationData: {
          operation: structureEvent.payload.operation,
          sourceElement: structureEvent.payload.targetElement,
          defaultCellContent: layout.syncConfig.defaultTableCellContent,
        },
      },
      cancellable: false,
      cancelled: false,
      propagates: true,
    };

    return [coordinationEvent];
  }
}

/**
 * Coordination action for syncing table structure changes to tree
 */
class TableToTreeStructureSyncAction implements CoordinationAction {
  type = "sync-structure" as const;
  config = {};

  async execute(
    sourceEvent: ConstructEvent,
    sourceConstruct: BaseConstruct,
    targetConstructs: BaseConstruct[],
    layout: TreeTableLayout
  ): Promise<ConstructEvent[]> {
    const structureEvent = sourceEvent as StructureChangeEvent;
    const treeConstruct = targetConstructs.find((c) => c.type === "tree");

    if (!treeConstruct) return [];

    // Create corresponding tree modification event
    const coordinationEvent: LayoutCoordinationEvent = {
      id: `coord-${Date.now()}`,
      type: "layout-coordination",
      sourceConstruct: sourceConstruct,
      timestamp: Date.now(),
      payload: {
        coordinationType: "sync-structure",
        targetConstructs: [treeConstruct],
        coordinationData: {
          operation: structureEvent.payload.operation,
          sourceElement: structureEvent.payload.targetElement,
        },
      },
      cancellable: false,
      cancelled: false,
      propagates: true,
    };

    return [coordinationEvent];
  }
}

/**
 * Coordination action for syncing selections between constructs
 */
class SelectionSyncAction implements CoordinationAction {
  type = "sync-selection" as const;
  config = {};

  async execute(
    sourceEvent: ConstructEvent,
    sourceConstruct: BaseConstruct,
    targetConstructs: BaseConstruct[],
    layout: TreeTableLayout
  ): Promise<ConstructEvent[]> {
    // Filter out the source construct from targets
    const targets = targetConstructs.filter((c) => c.id !== sourceConstruct.id);

    if (targets.length === 0) return [];

    // Create selection sync event for each target
    const events: LayoutCoordinationEvent[] = targets.map((target) => ({
      id: `coord-${Date.now()}-${target.id}`,
      type: "layout-coordination",
      sourceConstruct: sourceConstruct,
      timestamp: Date.now(),
      payload: {
        coordinationType: "sync-selection",
        targetConstructs: [target],
        coordinationData: {
          selectedElements: (sourceEvent as any).payload.selectedElements,
          selectionType: (sourceEvent as any).payload.selectionType,
        },
      },
      cancellable: false,
      cancelled: false,
      propagates: true,
    }));

    return events;
  }
}
