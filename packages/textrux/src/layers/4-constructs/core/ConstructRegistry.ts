import { ConstructSignatureParser } from "../interfaces/ConstructInterfaces";
// Legacy signature parsers removed - replaced by unified SimpleConstructParser
import GridModel from "../../1-substrate/GridModel";
import { SimpleConstructParser } from "../SimpleConstructParser";

/**
 * Central registry for all construct signature parsers
 */
export class ConstructRegistry {
  private parsers: Map<string, ConstructSignatureParser<any>> = new Map();
  private grid?: GridModel;

  constructor(grid?: GridModel) {
    this.grid = grid;
    this.registerDefaultParsers();
  }

  /**
   * Register the default set of construct parsers
   */
  private registerDefaultParsers(): void {
    if (this.grid) {
      // Legacy signature parsers replaced by unified SimpleConstructParser
      const simpleParser = new SimpleConstructParser(this.grid);
    }
    // this.registerParser(new TableSignatureParser()); // Legacy removed
    // this.registerParser(new MatrixSignatureParser()); // Legacy removed  
    // this.registerParser(new KeyValueSignatureParser()); // Legacy removed
  }

  /**
   * Register a construct parser
   */
  registerParser(parser: ConstructSignatureParser<any>): void {
    this.parsers.set(parser.constructType, parser);
  }

  /**
   * Unregister a construct parser
   */
  unregisterParser(constructType: string): boolean {
    return this.parsers.delete(constructType);
  }

  /**
   * Get a specific parser by construct type
   */
  getParser(constructType: string): ConstructSignatureParser<any> | undefined {
    return this.parsers.get(constructType);
  }

  /**
   * Get all registered parsers
   */
  getAllParsers(): ConstructSignatureParser<any>[] {
    return Array.from(this.parsers.values());
  }

  /**
   * Get all registered construct types
   */
  getConstructTypes(): string[] {
    return Array.from(this.parsers.keys());
  }

  /**
   * Check if a construct type is registered
   */
  hasParser(constructType: string): boolean {
    return this.parsers.has(constructType);
  }

  /**
   * Clear all registered parsers
   */
  clear(): void {
    this.parsers.clear();
  }

  /**
   * Reset to default parsers
   */
  reset(): void {
    this.clear();
    this.registerDefaultParsers();
  }
}

/**
 * Default global construct registry instance
 */
export const defaultConstructRegistry = new ConstructRegistry();
