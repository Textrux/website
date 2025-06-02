import {
  ConstructEvent,
  ConstructEventBus,
  ConstructEventListener,
} from "../interfaces/ConstructEventInterfaces";
import { BaseConstruct } from "../interfaces/ConstructInterfaces";

/**
 * Base implementation of construct event bus
 */
export class BaseConstructEventBus implements ConstructEventBus {
  private globalListeners: Map<string, ConstructEventListener[]> = new Map();
  private constructListeners: Map<string, ConstructEventListener[]> = new Map();
  private eventHistory: ConstructEvent[] = [];
  private maxHistorySize: number = 1000;

  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Emit an event
   */
  async emit(event: ConstructEvent): Promise<void> {
    // Add to history
    this.addToHistory(event);

    // Check if event is cancelled
    if (event.cancelled) {
      return;
    }

    // Get all relevant listeners
    const listeners = this.getRelevantListeners(event);

    // Sort by priority (higher first)
    listeners.sort((a, b) => b.priority - a.priority);

    // Execute listeners
    for (const listener of listeners) {
      try {
        const result = await listener.handleEvent(event);
        if (result === false && event.cancellable) {
          event.cancelled = true;
          break;
        }
      } catch (error) {
        console.error("Error in event listener:", error);
      }

      // Stop if event was cancelled during handling
      if (event.cancelled) {
        break;
      }
    }
  }

  /**
   * Add event listener
   */
  addEventListener(listener: ConstructEventListener): void {
    for (const eventType of listener.eventTypes) {
      if (!this.globalListeners.has(eventType)) {
        this.globalListeners.set(eventType, []);
      }
      this.globalListeners.get(eventType)!.push(listener);
    }
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: ConstructEventListener): void {
    for (const eventType of listener.eventTypes) {
      const listeners = this.globalListeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  /**
   * Get all listeners for a specific event type
   */
  getListeners(eventType: string): ConstructEventListener[] {
    return this.globalListeners.get(eventType) || [];
  }

  /**
   * Subscribe to events from a specific construct
   */
  subscribeToConstruct(
    construct: BaseConstruct,
    listener: ConstructEventListener
  ): void {
    const constructKey = construct.id;
    if (!this.constructListeners.has(constructKey)) {
      this.constructListeners.set(constructKey, []);
    }
    this.constructListeners.get(constructKey)!.push(listener);
  }

  /**
   * Unsubscribe from construct events
   */
  unsubscribeFromConstruct(
    construct: BaseConstruct,
    listener: ConstructEventListener
  ): void {
    const constructKey = construct.id;
    const listeners = this.constructListeners.get(constructKey);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Broadcast event to all subscribers
   */
  async broadcast(event: ConstructEvent): Promise<void> {
    await this.emit(event);
  }

  /**
   * Get event history
   */
  getEventHistory(limit?: number): ConstructEvent[] {
    if (limit) {
      return this.eventHistory.slice(-limit);
    }
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get relevant listeners for an event
   */
  private getRelevantListeners(
    event: ConstructEvent
  ): ConstructEventListener[] {
    const listeners: ConstructEventListener[] = [];

    // Add global listeners for this event type
    const globalListeners = this.globalListeners.get(event.type) || [];
    listeners.push(...globalListeners);

    // Add construct-specific listeners
    const constructKey = event.sourceConstruct.id;
    const constructListeners = this.constructListeners.get(constructKey) || [];
    listeners.push(
      ...constructListeners.filter((l) => l.eventTypes.includes(event.type))
    );

    // Remove duplicates
    return Array.from(new Set(listeners));
  }

  /**
   * Add event to history
   */
  private addToHistory(event: ConstructEvent): void {
    this.eventHistory.push(event);

    // Trim history if it exceeds max size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Create a scoped event bus for a specific construct
   */
  createScopedBus(construct: BaseConstruct): ScopedEventBus {
    return new ScopedEventBus(this, construct);
  }

  /**
   * Get statistics about the event bus
   */
  getStatistics(): EventBusStatistics {
    return {
      globalListenerCount: Array.from(this.globalListeners.values()).reduce(
        (sum, listeners) => sum + listeners.length,
        0
      ),
      constructListenerCount: Array.from(
        this.constructListeners.values()
      ).reduce((sum, listeners) => sum + listeners.length, 0),
      eventHistorySize: this.eventHistory.length,
      uniqueEventTypes: new Set(this.eventHistory.map((e) => e.type)).size,
    };
  }
}

/**
 * Scoped event bus for a specific construct
 */
export class ScopedEventBus {
  constructor(
    private parentBus: BaseConstructEventBus,
    private construct: BaseConstruct
  ) {}

  /**
   * Emit an event from this construct
   */
  async emit(event: ConstructEvent): Promise<void> {
    // Ensure the source construct is set correctly
    event.sourceConstruct = this.construct;
    await this.parentBus.emit(event);
  }

  /**
   * Add listener for this construct
   */
  addEventListener(listener: ConstructEventListener): void {
    this.parentBus.subscribeToConstruct(this.construct, listener);
  }

  /**
   * Remove listener for this construct
   */
  removeEventListener(listener: ConstructEventListener): void {
    this.parentBus.unsubscribeFromConstruct(this.construct, listener);
  }
}

/**
 * Event bus statistics
 */
export interface EventBusStatistics {
  globalListenerCount: number;
  constructListenerCount: number;
  eventHistorySize: number;
  uniqueEventTypes: number;
}

/**
 * Default global event bus instance
 */
export const defaultEventBus = new BaseConstructEventBus();
