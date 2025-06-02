import {
  ConstructElement,
  ConstructElementContainer,
  ConstructPosition,
} from "../interfaces/ConstructElementInterfaces";

/**
 * Base implementation of construct element container
 */
export class BaseConstructElementContainer
  implements ConstructElementContainer
{
  elements: Map<string, ConstructElement> = new Map();

  constructor() {
    this.elements = new Map();
  }

  /**
   * Get element by ID
   */
  getElement(id: string): ConstructElement | undefined {
    return this.elements.get(id);
  }

  /**
   * Get elements by type
   */
  getElementsByType(type: string): ConstructElement[] {
    return Array.from(this.elements.values()).filter(
      (element) => element.type === type
    );
  }

  /**
   * Get elements by role
   */
  getElementsByRole(role: string): ConstructElement[] {
    return Array.from(this.elements.values()).filter(
      (element) => element.role === role
    );
  }

  /**
   * Add an element
   */
  addElement(element: ConstructElement): void {
    this.elements.set(element.id, element);
  }

  /**
   * Remove an element
   */
  removeElement(id: string): boolean {
    return this.elements.delete(id);
  }

  /**
   * Get all element positions
   */
  getAllPositions(): ConstructPosition[] {
    return Array.from(this.elements.values()).map(
      (element) => element.position
    );
  }

  /**
   * Find element at a specific position
   */
  getElementAtPosition(row: number, col: number): ConstructElement | undefined {
    return Array.from(this.elements.values()).find(
      (element) => element.position.row === row && element.position.col === col
    );
  }

  /**
   * Update element position
   */
  updateElementPosition(
    elementId: string,
    position: ConstructPosition
  ): boolean {
    const element = this.elements.get(elementId);
    if (!element) return false;

    element.position = position;
    return true;
  }

  /**
   * Get elements in a rectangular region
   */
  getElementsInRegion(
    topRow: number,
    bottomRow: number,
    leftCol: number,
    rightCol: number
  ): ConstructElement[] {
    return Array.from(this.elements.values()).filter((element) => {
      const pos = element.position;
      return (
        pos.row >= topRow &&
        pos.row <= bottomRow &&
        pos.col >= leftCol &&
        pos.col <= rightCol
      );
    });
  }

  /**
   * Clear all elements
   */
  clear(): void {
    this.elements.clear();
  }

  /**
   * Get element count
   */
  getElementCount(): number {
    return this.elements.size;
  }

  /**
   * Check if container has elements
   */
  isEmpty(): boolean {
    return this.elements.size === 0;
  }

  /**
   * Get all element IDs
   */
  getAllElementIds(): string[] {
    return Array.from(this.elements.keys());
  }

  /**
   * Clone the container
   */
  clone(): BaseConstructElementContainer {
    const cloned = new BaseConstructElementContainer();
    this.elements.forEach((element, id) => {
      cloned.elements.set(id, { ...element });
    });
    return cloned;
  }
}
