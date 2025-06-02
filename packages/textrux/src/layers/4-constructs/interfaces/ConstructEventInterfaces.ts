import { ConstructElement } from "./ConstructElementInterfaces";
import { BaseConstruct } from "./ConstructInterfaces";

/**
 * Base interface for construct events
 */
export interface ConstructEvent {
  /** Unique event ID */
  id: string;

  /** Type of event */
  type: string;

  /** Source construct that emitted the event */
  sourceConstruct: BaseConstruct;

  /** Element that triggered the event (if applicable) */
  sourceElement?: ConstructElement;

  /** Timestamp when event was created */
  timestamp: number;

  /** Event payload data */
  payload: Record<string, any>;

  /** Whether this event can be cancelled */
  cancellable: boolean;

  /** Whether this event has been cancelled */
  cancelled: boolean;

  /** Whether this event should propagate to parent elements/layouts */
  propagates: boolean;
}

/**
 * Structure change events (insert, delete, move operations)
 */
export interface StructureChangeEvent extends ConstructEvent {
  type: "structure-change";
  payload: {
    operation: "insert" | "delete" | "move" | "reorder";
    targetElement?: ConstructElement;
    position?: { row: number; col: number };
    relativePosition?: "before" | "after" | "inside";
    affectedElements: ConstructElement[];
    metadata?: Record<string, any>;
  };
}

/**
 * Selection change events
 */
export interface SelectionChangeEvent extends ConstructEvent {
  type: "selection-change";
  payload: {
    selectedElements: ConstructElement[];
    previousSelection: ConstructElement[];
    selectionType: "single" | "multiple" | "range";
  };
}

/**
 * Content change events
 */
export interface ContentChangeEvent extends ConstructEvent {
  type: "content-change";
  payload: {
    element: ConstructElement;
    oldContent: string;
    newContent: string;
    changeType: "edit" | "replace" | "clear";
  };
}

/**
 * Navigation events
 */
export interface NavigationEvent extends ConstructEvent {
  type: "navigation";
  payload: {
    direction: "up" | "down" | "left" | "right" | "in" | "out";
    fromElement?: ConstructElement;
    toElement?: ConstructElement;
    navigationMode: "cursor" | "selection" | "focus";
  };
}

/**
 * Layout coordination events
 */
export interface LayoutCoordinationEvent extends ConstructEvent {
  type: "layout-coordination";
  payload: {
    coordinationType:
      | "sync-height"
      | "sync-width"
      | "sync-selection"
      | "sync-scroll";
    targetConstructs: BaseConstruct[];
    coordinationData: Record<string, any>;
  };
}

/**
 * Event listener interface
 */
export interface ConstructEventListener {
  /** Event types this listener handles */
  eventTypes: string[];

  /** Handle an event */
  handleEvent(event: ConstructEvent): boolean | Promise<boolean>;

  /** Priority (higher = called first) */
  priority: number;
}

/**
 * Event emitter interface for constructs
 */
export interface ConstructEventEmitter {
  /** Emit an event */
  emit(event: ConstructEvent): Promise<void>;

  /** Add event listener */
  addEventListener(listener: ConstructEventListener): void;

  /** Remove event listener */
  removeEventListener(listener: ConstructEventListener): void;

  /** Get all listeners for a specific event type */
  getListeners(eventType: string): ConstructEventListener[];
}

/**
 * Event bus for global event coordination
 */
export interface ConstructEventBus extends ConstructEventEmitter {
  /** Subscribe to events from a specific construct */
  subscribeToConstruct(
    construct: BaseConstruct,
    listener: ConstructEventListener
  ): void;

  /** Unsubscribe from construct events */
  unsubscribeFromConstruct(
    construct: BaseConstruct,
    listener: ConstructEventListener
  ): void;

  /** Broadcast event to all subscribers */
  broadcast(event: ConstructEvent): Promise<void>;

  /** Get event history */
  getEventHistory(limit?: number): ConstructEvent[];

  /** Clear event history */
  clearHistory(): void;
}

/**
 * Event factory for creating typed events
 */
export interface ConstructEventFactory {
  /** Create a structure change event */
  createStructureChangeEvent(
    source: BaseConstruct,
    operation: "insert" | "delete" | "move" | "reorder",
    data: any
  ): StructureChangeEvent;

  /** Create a selection change event */
  createSelectionChangeEvent(
    source: BaseConstruct,
    selected: ConstructElement[],
    previous: ConstructElement[]
  ): SelectionChangeEvent;

  /** Create a content change event */
  createContentChangeEvent(
    source: BaseConstruct,
    element: ConstructElement,
    oldContent: string,
    newContent: string
  ): ContentChangeEvent;

  /** Create a navigation event */
  createNavigationEvent(
    source: BaseConstruct,
    direction: string,
    from?: ConstructElement,
    to?: ConstructElement
  ): NavigationEvent;

  /** Create a layout coordination event */
  createLayoutCoordinationEvent(
    source: BaseConstruct,
    coordinationType: string,
    targets: BaseConstruct[],
    data: any
  ): LayoutCoordinationEvent;
}
