import {
  BaseConstruct,
  ConstructPosition,
  DirectionalOrientation,
} from "../../interfaces/ConstructInterfaces";

/**
 * Represents a key-value pair in the structure
 */
export interface KeyValuePair {
  /** Position of the key in the grid */
  keyPosition: ConstructPosition;

  /** Position of the value in the grid (if separate) */
  valuePosition?: ConstructPosition;

  /** The key content */
  key: string;

  /** The value content */
  value: string;

  /** Separator used between key and value */
  separator: string;

  /** Whether key and value are in the same cell */
  isSingleCell: boolean;

  /** Data type of the value */
  valueType: "text" | "number" | "date" | "boolean" | "list" | "object";

  /** Index of this pair within the structure */
  index: number;
}

/**
 * KeyValue construct representing key-value pair structures
 */
export default class KeyValue implements BaseConstruct {
  id: string;
  type: string = "key-value";
  confidence: number;
  signatureImprint: string;
  bounds: {
    topRow: number;
    bottomRow: number;
    leftCol: number;
    rightCol: number;
  };
  metadata: Record<string, any>;

  /** All key-value pairs in the structure */
  pairs: KeyValuePair[];

  /** Orientation of the key-value structure */
  orientation: DirectionalOrientation;

  /** Common separator used in the structure */
  commonSeparator: string;

  /** Whether all pairs use consistent formatting */
  hasConsistentFormatting: boolean;

  /** Whether keys are aligned */
  hasAlignedKeys: boolean;

  /** Whether values are aligned */
  hasAlignedValues: boolean;

  /** Whether the structure uses nested values */
  hasNestedValues: boolean;

  /** Whether the structure represents a configuration/settings format */
  isConfiguration: boolean;

  /** Whether the structure represents a property list */
  isPropertyList: boolean;

  constructor(
    id: string,
    confidence: number,
    signatureImprint: string,
    bounds: any,
    orientation: DirectionalOrientation,
    metadata: Record<string, any> = {}
  ) {
    this.id = id;
    this.confidence = confidence;
    this.signatureImprint = signatureImprint;
    this.bounds = bounds;
    this.orientation = orientation;
    this.metadata = metadata;

    this.pairs = [];
    this.commonSeparator = ":";
    this.hasConsistentFormatting = false;
    this.hasAlignedKeys = false;
    this.hasAlignedValues = false;
    this.hasNestedValues = false;
    this.isConfiguration = false;
    this.isPropertyList = false;
  }

  /**
   * Add a key-value pair to the structure
   */
  addPair(pair: KeyValuePair): void {
    this.pairs.push(pair);
  }

  /**
   * Get a pair by its index
   */
  getPair(index: number): KeyValuePair | null {
    return index >= 0 && index < this.pairs.length ? this.pairs[index] : null;
  }

  /**
   * Find a pair by its key
   */
  findPairByKey(key: string): KeyValuePair | null {
    return (
      this.pairs.find((pair) => pair.key.toLowerCase() === key.toLowerCase()) ||
      null
    );
  }

  /**
   * Get all keys as an array
   */
  getKeys(): string[] {
    return this.pairs.map((pair) => pair.key);
  }

  /**
   * Get all values as an array
   */
  getValues(): string[] {
    return this.pairs.map((pair) => pair.value);
  }

  /**
   * Get the structure as a simple object
   */
  getAsObject(): Record<string, string> {
    const obj: Record<string, string> = {};
    this.pairs.forEach((pair) => {
      obj[pair.key] = pair.value;
    });
    return obj;
  }

  /**
   * Analyze the key-value structure and update metadata
   */
  analyzeStructure(): void {
    // Analyze formatting consistency
    this.analyzeFormatting();

    // Analyze alignment
    this.analyzeAlignment();

    // Analyze separators
    this.analyzeSeparators();

    // Analyze value types
    this.analyzeValueTypes();

    // Determine structure type
    this.determineStructureType();

    // Update metadata
    this.metadata.totalPairs = this.pairs.length;
    this.metadata.uniqueKeys = new Set(this.getKeys()).size;
    this.metadata.valueTypes = this.getValueTypeDistribution();
    this.metadata.averageKeyLength = this.calculateAverageKeyLength();
    this.metadata.averageValueLength = this.calculateAverageValueLength();
  }

  private analyzeFormatting(): void {
    if (this.pairs.length === 0) {
      this.hasConsistentFormatting = true;
      return;
    }

    // Check if all pairs use the same separator and formatting pattern
    const firstSeparator = this.pairs[0].separator;
    const firstIsSingleCell = this.pairs[0].isSingleCell;

    this.hasConsistentFormatting = this.pairs.every(
      (pair) =>
        pair.separator === firstSeparator &&
        pair.isSingleCell === firstIsSingleCell
    );
  }

  private analyzeAlignment(): void {
    if (this.pairs.length < 2) {
      this.hasAlignedKeys = true;
      this.hasAlignedValues = true;
      return;
    }

    // Check key alignment (for vertical orientation)
    if (this.orientation.primary === "vertical") {
      const keyColumns = this.pairs.map((pair) => pair.keyPosition.col);
      this.hasAlignedKeys = keyColumns.every((col) => col === keyColumns[0]);

      if (!this.pairs[0].isSingleCell) {
        const valueColumns = this.pairs
          .filter((pair) => pair.valuePosition)
          .map((pair) => pair.valuePosition!.col);
        this.hasAlignedValues = valueColumns.every(
          (col) => col === valueColumns[0]
        );
      }
    } else {
      // For horizontal orientation, check row alignment
      const keyRows = this.pairs.map((pair) => pair.keyPosition.row);
      this.hasAlignedKeys = keyRows.every((row) => row === keyRows[0]);

      if (!this.pairs[0].isSingleCell) {
        const valueRows = this.pairs
          .filter((pair) => pair.valuePosition)
          .map((pair) => pair.valuePosition!.row);
        this.hasAlignedValues = valueRows.every((row) => row === valueRows[0]);
      }
    }
  }

  private analyzeSeparators(): void {
    const separators = this.pairs.map((pair) => pair.separator);
    const separatorCounts = new Map<string, number>();

    separators.forEach((sep) => {
      separatorCounts.set(sep, (separatorCounts.get(sep) || 0) + 1);
    });

    // Find the most common separator
    let maxCount = 0;
    let mostCommon = ":";

    separatorCounts.forEach((count, separator) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = separator;
      }
    });

    this.commonSeparator = mostCommon;
  }

  private analyzeValueTypes(): void {
    this.pairs.forEach((pair) => {
      pair.valueType = this.detectValueType(pair.value);
    });

    // Check for nested structures
    this.hasNestedValues = this.pairs.some(
      (pair) => pair.valueType === "list" || pair.valueType === "object"
    );
  }

  private detectValueType(
    value: string
  ): "text" | "number" | "date" | "boolean" | "list" | "object" {
    const trimmed = value.trim();

    if (!trimmed) return "text";

    // Check for list-like values
    if (trimmed.includes(",") && !trimmed.includes(":")) {
      return "list";
    }

    // Check for object-like values (contains key-value separators)
    if (trimmed.includes(":") || trimmed.includes("=")) {
      return "object";
    }

    // Check for boolean
    const lower = trimmed.toLowerCase();
    if (
      [
        "true",
        "false",
        "yes",
        "no",
        "on",
        "off",
        "enabled",
        "disabled",
      ].includes(lower)
    ) {
      return "boolean";
    }

    // Check for number
    if (!isNaN(Number(trimmed)) && trimmed !== "") {
      return "number";
    }

    // Check for date
    if (this.isDateLike(trimmed)) {
      return "date";
    }

    return "text";
  }

  private isDateLike(value: string): boolean {
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
    ];

    return datePatterns.some((pattern) => pattern.test(value));
  }

  private determineStructureType(): void {
    const keys = this.getKeys().map((k) => k.toLowerCase());

    // Check for configuration patterns
    const configPatterns = [
      "config",
      "setting",
      "option",
      "preference",
      "parameter",
      "host",
      "port",
      "timeout",
      "enabled",
      "disabled",
      "path",
    ];

    this.isConfiguration = keys.some((key) =>
      configPatterns.some((pattern) => key.includes(pattern))
    );

    // Check for property list patterns
    const propertyPatterns = [
      "name",
      "value",
      "type",
      "id",
      "description",
      "title",
      "author",
      "date",
      "version",
      "status",
    ];

    this.isPropertyList = keys.some((key) =>
      propertyPatterns.some((pattern) => key.includes(pattern))
    );
  }

  private getValueTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};

    this.pairs.forEach((pair) => {
      const type = pair.valueType;
      distribution[type] = (distribution[type] || 0) + 1;
    });

    return distribution;
  }

  private calculateAverageKeyLength(): number {
    if (this.pairs.length === 0) return 0;
    const totalLength = this.pairs.reduce(
      (sum, pair) => sum + pair.key.length,
      0
    );
    return totalLength / this.pairs.length;
  }

  private calculateAverageValueLength(): number {
    if (this.pairs.length === 0) return 0;
    const totalLength = this.pairs.reduce(
      (sum, pair) => sum + pair.value.length,
      0
    );
    return totalLength / this.pairs.length;
  }
}
