/**
 * CellFormat defines all possible visual styling options for a cell.
 * This is used by structure classes to define consistent formatting
 * for different parts of structures.
 */
export class CellFormat {
  // Background properties
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundImage?: string;
  backgroundRepeat?: "repeat" | "no-repeat" | "repeat-x" | "repeat-y";
  backgroundSize?: string;
  backgroundPosition?: string;

  // Text properties
  color?: string;
  fontFamily?: string;
  fontWeight?: "normal" | "bold" | "lighter" | "bolder" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  fontSize?: string;
  fontStyle?: "normal" | "italic" | "oblique";
  textAlign?: "left" | "center" | "right" | "justify";
  textDecoration?: "none" | "underline" | "overline" | "line-through";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  lineHeight?: string | number;
  letterSpacing?: string;
  wordSpacing?: string;
  textShadow?: string;
  verticalAlign?: "top" | "middle" | "bottom" | "baseline";

  // Border properties - comprehensive border control
  borderColor?: string;
  borderStyle?: "none" | "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "inset" | "outset";
  borderWidth?: string;
  borderRadius?: string;
  
  // Individual border sides
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderTopStyle?: string;
  borderRightStyle?: string;
  borderBottomStyle?: string;
  borderLeftStyle?: string;
  borderTopWidth?: string;
  borderRightWidth?: string;
  borderBottomWidth?: string;
  borderLeftWidth?: string;

  // Spacing properties
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Cell-specific sizing (when "Size cells by" is set to "Cell")
  width?: number; // Last width this cell was set to
  height?: number; // Last height this cell was set to
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  lastWidthSource?: "auto" | "manual"; // How the width was last set
  lastHeightSource?: "auto" | "manual"; // How the height was last set

  // Effects and visual enhancements
  boxShadow?: string;
  transform?: string;
  transition?: string;
  filter?: string;
  backdropFilter?: string;

  // Layout properties
  display?: string;
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  whiteSpace?: "normal" | "nowrap" | "pre" | "pre-wrap" | "pre-line";

  // Interaction
  cursor?: string;
  pointerEvents?: React.CSSProperties["pointerEvents"];
  userSelect?: "none" | "auto" | "text" | "all";

  // Additional
  opacity?: number;
  zIndex?: number;

  // Theme-aware properties
  theme?: string; // Theme name for declarative theming
  variant?: string; // Style variant within theme
  role?: string; // Semantic role for context-aware styling

  // Store the original CSS class if needed for backward compatibility
  cssClass?: string;

  constructor(options: Partial<CellFormat> = {}) {
    Object.assign(this, options);
  }

  /**
   * Create a CellFormat from a predefined CSS class name
   */
  static fromCssClass(className: string): CellFormat {
    const format = new CellFormat({ cssClass: className });

    // Define the mappings from CSS classes to CellFormat properties
    switch (className) {
      case "canvas-cell":
        format.backgroundColor = "white";
        format.color = "black";
        format.fontWeight = "bold";
        format.textAlign = "center";
        break;

      case "canvas-empty-cell":
        format.backgroundColor = "#eef"; // Light blue
        break;

      case "border-cell":
        format.backgroundColor = "lightyellow";
        break;

      case "frame-cell":
        format.backgroundColor = "yellow";
        break;

      case "cluster-empty-cell":
        format.backgroundColor = "#bbf"; // Slightly darker blue
        break;

      case "linked-cell":
        format.backgroundColor = "orange";
        format.color = "white";
        break;

      case "locked-cell":
        format.backgroundColor = "red";
        format.color = "white";
        break;

      case "disabled-cell":
        format.backgroundColor = "#eee";
        format.color = "#999";
        format.cursor = "not-allowed";
        break;

      default:
        // For unknown classes, just store the class name
        break;
    }

    return format;
  }

  /**
   * Convert a CellFormat to CSS classes
   */
  toCssClasses(): string[] {
    const classes: string[] = [];

    // If there's an explicitly set CSS class, include it
    if (this.cssClass) {
      classes.push(this.cssClass);
    }

    // In the future, this could generate dynamic CSS classes based on properties

    return classes;
  }

  /**
   * Convert a CellFormat to inline styles
   */
  toInlineStyles(): React.CSSProperties {
    const styles: React.CSSProperties = {};

    // Background properties
    if (this.backgroundColor) styles.backgroundColor = this.backgroundColor;
    if (this.backgroundOpacity !== undefined) styles.opacity = this.backgroundOpacity;
    if (this.backgroundImage) styles.backgroundImage = this.backgroundImage;
    if (this.backgroundRepeat) styles.backgroundRepeat = this.backgroundRepeat;
    if (this.backgroundSize) styles.backgroundSize = this.backgroundSize;
    if (this.backgroundPosition) styles.backgroundPosition = this.backgroundPosition;

    // Text properties
    if (this.color) styles.color = this.color;
    if (this.fontFamily) styles.fontFamily = this.fontFamily;
    if (this.fontWeight) styles.fontWeight = this.fontWeight;
    if (this.fontSize) styles.fontSize = this.fontSize;
    if (this.fontStyle) styles.fontStyle = this.fontStyle;
    if (this.textAlign) styles.textAlign = this.textAlign;
    if (this.textDecoration) styles.textDecoration = this.textDecoration;
    if (this.textTransform) styles.textTransform = this.textTransform;
    if (this.lineHeight) styles.lineHeight = this.lineHeight;
    if (this.letterSpacing) styles.letterSpacing = this.letterSpacing;
    if (this.wordSpacing) styles.wordSpacing = this.wordSpacing;
    if (this.textShadow) styles.textShadow = this.textShadow;
    if (this.verticalAlign) styles.verticalAlign = this.verticalAlign;

    // Border properties
    if (this.borderColor) styles.borderColor = this.borderColor;
    if (this.borderStyle) styles.borderStyle = this.borderStyle;
    if (this.borderWidth) styles.borderWidth = this.borderWidth;
    if (this.borderRadius) styles.borderRadius = this.borderRadius;
    
    // Individual border sides
    if (this.borderTop) styles.borderTop = this.borderTop;
    if (this.borderRight) styles.borderRight = this.borderRight;
    if (this.borderBottom) styles.borderBottom = this.borderBottom;
    if (this.borderLeft) styles.borderLeft = this.borderLeft;
    if (this.borderTopColor) styles.borderTopColor = this.borderTopColor;
    if (this.borderRightColor) styles.borderRightColor = this.borderRightColor;
    if (this.borderBottomColor) styles.borderBottomColor = this.borderBottomColor;
    if (this.borderLeftColor) styles.borderLeftColor = this.borderLeftColor;
    if (this.borderTopStyle) styles.borderTopStyle = this.borderTopStyle as any;
    if (this.borderRightStyle) styles.borderRightStyle = this.borderRightStyle as any;
    if (this.borderBottomStyle) styles.borderBottomStyle = this.borderBottomStyle as any;
    if (this.borderLeftStyle) styles.borderLeftStyle = this.borderLeftStyle as any;
    if (this.borderTopWidth) styles.borderTopWidth = this.borderTopWidth;
    if (this.borderRightWidth) styles.borderRightWidth = this.borderRightWidth;
    if (this.borderBottomWidth) styles.borderBottomWidth = this.borderBottomWidth;
    if (this.borderLeftWidth) styles.borderLeftWidth = this.borderLeftWidth;

    // Spacing properties
    if (this.padding) styles.padding = this.padding;
    if (this.paddingTop) styles.paddingTop = this.paddingTop;
    if (this.paddingRight) styles.paddingRight = this.paddingRight;
    if (this.paddingBottom) styles.paddingBottom = this.paddingBottom;
    if (this.paddingLeft) styles.paddingLeft = this.paddingLeft;
    if (this.margin) styles.margin = this.margin;
    if (this.marginTop) styles.marginTop = this.marginTop;
    if (this.marginRight) styles.marginRight = this.marginRight;
    if (this.marginBottom) styles.marginBottom = this.marginBottom;
    if (this.marginLeft) styles.marginLeft = this.marginLeft;

    // Size properties
    if (this.minWidth) styles.minWidth = this.minWidth;
    if (this.maxWidth) styles.maxWidth = this.maxWidth;
    if (this.minHeight) styles.minHeight = this.minHeight;
    if (this.maxHeight) styles.maxHeight = this.maxHeight;

    // Effects and visual enhancements
    if (this.boxShadow) styles.boxShadow = this.boxShadow;
    if (this.transform) styles.transform = this.transform;
    if (this.transition) styles.transition = this.transition;
    if (this.filter) styles.filter = this.filter;
    if (this.backdropFilter) styles.backdropFilter = this.backdropFilter;

    // Layout properties
    if (this.display) styles.display = this.display;
    if (this.position) styles.position = this.position;
    if (this.top) styles.top = this.top;
    if (this.right) styles.right = this.right;
    if (this.bottom) styles.bottom = this.bottom;
    if (this.left) styles.left = this.left;
    if (this.overflow) styles.overflow = this.overflow;
    if (this.whiteSpace) styles.whiteSpace = this.whiteSpace;

    // Interaction
    if (this.cursor) styles.cursor = this.cursor;
    if (this.pointerEvents) styles.pointerEvents = this.pointerEvents;
    if (this.userSelect) styles.userSelect = this.userSelect;

    // Additional
    if (this.opacity !== undefined) styles.opacity = this.opacity;
    if (this.zIndex !== undefined) styles.zIndex = this.zIndex;

    return styles;
  }

  /**
   * Create a cell format from a serialized string (for future use)
   */
  static fromString(formatStr: string): CellFormat {
    try {
      // This could parse a custom format string syntax in the future
      // For now, just try to parse as JSON
      return new CellFormat(JSON.parse(formatStr));
    } catch (e) {
      console.error("Failed to parse cell format string:", e);
      return new CellFormat();
    }
  }

  /**
   * Serialize to string (for future use in storing formats in the grid)
   */
  toString(): string {
    // In the future, this could use a custom syntax
    // For now, just use JSON
    return JSON.stringify(this);
  }

  /**
   * Create a new CellFormat by merging with another one
   */
  merge(other: CellFormat): CellFormat {
    return new CellFormat({
      ...this,
      ...other,
    });
  }

  /**
   * Apply a theme to this cell format
   */
  applyTheme(theme: CellTheme): CellFormat {
    const themedFormat = new CellFormat(this);
    
    // Apply theme-specific properties
    if (theme.colors) {
      if (theme.colors.background) themedFormat.backgroundColor = theme.colors.background;
      if (theme.colors.text) themedFormat.color = theme.colors.text;
      if (theme.colors.border) themedFormat.borderColor = theme.colors.border;
    }
    
    if (theme.typography) {
      if (theme.typography.fontFamily) themedFormat.fontFamily = theme.typography.fontFamily;
      if (theme.typography.fontSize) themedFormat.fontSize = theme.typography.fontSize;
      if (theme.typography.fontWeight) themedFormat.fontWeight = theme.typography.fontWeight as any;
      if (theme.typography.lineHeight) themedFormat.lineHeight = theme.typography.lineHeight;
    }
    
    if (theme.borders) {
      if (theme.borders.style) themedFormat.borderStyle = theme.borders.style;
      if (theme.borders.width) themedFormat.borderWidth = theme.borders.width;
      if (theme.borders.radius) themedFormat.borderRadius = theme.borders.radius;
    }
    
    if (theme.spacing) {
      if (theme.spacing.padding) themedFormat.padding = theme.spacing.padding;
      if (theme.spacing.margin) themedFormat.margin = theme.spacing.margin;
    }
    
    if (theme.effects) {
      if (theme.effects.boxShadow) themedFormat.boxShadow = theme.effects.boxShadow;
      if (theme.effects.transition) themedFormat.transition = theme.effects.transition;
    }
    
    return themedFormat;
  }

  /**
   * Create a declarative format from theme and role
   */
  static fromTheme(theme: CellTheme, role?: string, variant?: string): CellFormat {
    const format = new CellFormat({ theme: theme.name, role, variant });
    return format.applyTheme(theme);
  }

  /**
   * Create utility methods for common styling patterns
   */
  static createBorders(options: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
    style?: string;
    width?: string;
    color?: string;
  }): Partial<CellFormat> {
    const format: Partial<CellFormat> = {};
    
    if (options.top) {
      format.borderTopStyle = options.style || 'solid';
      format.borderTopWidth = options.width || '1px';
      format.borderTopColor = options.color || '#000';
    }
    if (options.right) {
      format.borderRightStyle = options.style || 'solid';
      format.borderRightWidth = options.width || '1px';
      format.borderRightColor = options.color || '#000';
    }
    if (options.bottom) {
      format.borderBottomStyle = options.style || 'solid';
      format.borderBottomWidth = options.width || '1px';
      format.borderBottomColor = options.color || '#000';
    }
    if (options.left) {
      format.borderLeftStyle = options.style || 'solid';
      format.borderLeftWidth = options.width || '1px';
      format.borderLeftColor = options.color || '#000';
    }
    
    return format;
  }

  /**
   * Create a text styling format
   */
  static createText(options: {
    size?: string;
    weight?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
    transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    decoration?: 'none' | 'underline' | 'overline' | 'line-through';
  }): Partial<CellFormat> {
    return {
      fontSize: options.size,
      fontWeight: options.weight as any,
      textAlign: options.align,
      color: options.color,
      textTransform: options.transform,
      textDecoration: options.decoration,
    };
  }

  /**
   * Create a background styling format
   */
  static createBackground(options: {
    color?: string;
    opacity?: number;
    image?: string;
    repeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
    size?: string;
    position?: string;
  }): Partial<CellFormat> {
    return {
      backgroundColor: options.color,
      backgroundOpacity: options.opacity,
      backgroundImage: options.image,
      backgroundRepeat: options.repeat,
      backgroundSize: options.size,
      backgroundPosition: options.position,
    };
  }

  /**
   * Create construct-specific styling formats
   */
  static constructs = {
    /**
     * Matrix primary header styling
     */
    matrixPrimaryHeader: (orientation: 'regular' | 'transposed' = 'regular', theme: CellTheme = CELL_THEMES.default): CellFormat => {
      const format = new CellFormat({
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'normal',
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
      
      // Apply orientation-specific border
      if (orientation === 'regular') {
        format.borderBottom = `2px solid ${theme.colors?.border || '#e1e5e9'}`;
      } else {
        format.borderRight = `2px solid ${theme.colors?.border || '#e1e5e9'}`;
      }
      
      return format;
    },

    /**
     * Matrix secondary header styling
     */
    matrixSecondaryHeader: (orientation: 'regular' | 'transposed' = 'regular', theme: CellTheme = CELL_THEMES.default): CellFormat => {
      const format = new CellFormat({
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'italic',
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
      
      // Apply orientation-specific border
      if (orientation === 'regular') {
        format.borderRight = `1px solid ${theme.colors?.border || '#e1e5e9'}`;
      } else {
        format.borderBottom = `1px solid ${theme.colors?.border || '#e1e5e9'}`;
      }
      
      return format;
    },

    /**
     * Matrix body cell styling
     */
    matrixBody: (theme: CellTheme = CELL_THEMES.default): CellFormat => {
      return new CellFormat({
        textAlign: 'center',
        fontWeight: 'normal',
        fontStyle: 'normal',
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
    },

    /**
     * Table header styling
     */
    tableHeader: (orientation: 'regular' | 'transposed' = 'regular', theme: CellTheme = CELL_THEMES.default): CellFormat => {
      const format = new CellFormat({
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'normal',
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
      
      // Apply orientation-specific border
      if (orientation === 'regular') {
        format.borderBottom = `2px solid ${theme.colors?.border || '#e1e5e9'}`;
      } else {
        format.borderRight = `2px solid ${theme.colors?.border || '#e1e5e9'}`;
      }
      
      return format;
    },

    /**
     * Table body cell styling
     */
    tableBody: (theme: CellTheme = CELL_THEMES.default): CellFormat => {
      return new CellFormat({
        textAlign: 'center',
        fontWeight: 'normal',
        fontStyle: 'normal',
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
    },

    /**
     * Key-value key styling
     */
    keyValueKey: (orientation: 'regular' | 'transposed' = 'regular', theme: CellTheme = CELL_THEMES.default): CellFormat => {
      const format = new CellFormat({
        textAlign: 'center',
        fontWeight: 'normal',
        fontStyle: 'italic',
        backgroundColor: '#f0f9ff', // Light blue-green background
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
      
      // Apply orientation-specific border
      if (orientation === 'regular') {
        format.borderRight = `1px solid ${theme.colors?.border || '#e1e5e9'}`;
      } else {
        format.borderBottom = `1px solid ${theme.colors?.border || '#e1e5e9'}`;
      }
      
      return format;
    },

    /**
     * Key-value value styling
     */
    keyValueValue: (theme: CellTheme = CELL_THEMES.default): CellFormat => {
      return new CellFormat({
        textAlign: 'center',
        fontWeight: 'normal',
        fontStyle: 'normal',
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
    },

    /**
     * Tree anchor styling
     */
    treeAnchor: (orientation: 'regular' | 'transposed' = 'regular', theme: CellTheme = CELL_THEMES.default): CellFormat => {
      const format = new CellFormat({
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'normal',
        fontSize: '16px', // 1-2 sizes larger
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
      
      // Apply orientation-specific border
      if (orientation === 'regular') {
        format.borderBottom = `3px solid ${theme.colors?.accent || '#4f46e5'}`;
      } else {
        format.borderRight = `3px solid ${theme.colors?.accent || '#4f46e5'}`;
      }
      
      return format;
    },

    /**
     * Tree parent styling
     */
    treeParent: (theme: CellTheme = CELL_THEMES.default): CellFormat => {
      return new CellFormat({
        textAlign: 'center',
        fontWeight: 'normal',
        fontStyle: 'normal',
        borderRight: `1px solid ${theme.colors?.border || '#e1e5e9'}`,
        borderBottom: `1px solid ${theme.colors?.border || '#e1e5e9'}`,
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
    },

    /**
     * Tree child/element styling
     */
    treeChild: (theme: CellTheme = CELL_THEMES.default): CellFormat => {
      return new CellFormat({
        textAlign: 'center',
        fontWeight: 'normal',
        fontStyle: 'normal',
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
    },

    /**
     * Horizontal list header styling
     */
    listHorizontalHeader: (theme: CellTheme = CELL_THEMES.default): CellFormat => {
      return new CellFormat({
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'normal',
        borderRight: `2px solid ${theme.colors?.border || '#e1e5e9'}`,
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
    },

    /**
     * Vertical list header styling
     */
    listVerticalHeader: (theme: CellTheme = CELL_THEMES.default): CellFormat => {
      return new CellFormat({
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'normal',
        borderBottom: `2px solid ${theme.colors?.border || '#e1e5e9'}`,
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
    },

    /**
     * List item styling
     */
    listItem: (theme: CellTheme = CELL_THEMES.default): CellFormat => {
      return new CellFormat({
        textAlign: 'center',
        fontWeight: 'normal',
        fontStyle: 'normal',
        backgroundColor: theme.colors?.background || '#ffffff',
        fontFamily: theme.typography?.fontFamily,
        fontSize: theme.typography?.fontSize,
        padding: theme.spacing?.padding,
        transition: theme.effects?.transition,
      });
    },
  };
}

/**
 * Theme definition interface for declarative styling
 */
export interface CellTheme {
  name: string;
  colors?: {
    background?: string;
    text?: string;
    border?: string;
    accent?: string;
    muted?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string | number;
  };
  borders?: {
    style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
    width?: string;
    radius?: string;
  };
  spacing?: {
    padding?: string;
    margin?: string;
  };
  effects?: {
    boxShadow?: string;
    transition?: string;
  };
}

/**
 * Predefined themes for common use cases
 */
export const CELL_THEMES: Record<string, CellTheme> = {
  default: {
    name: 'default',
    colors: {
      background: '#ffffff',
      text: '#1a1a1a',
      border: '#e1e5e9',
      accent: '#4f46e5',
      muted: '#6b7280',
    },
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: 1.5,
    },
    borders: {
      style: 'solid',
      width: '1px',
      radius: '4px',
    },
    spacing: {
      padding: '10px 12px',
      margin: '0px',
    },
    effects: {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  modern: {
    name: 'modern',
    colors: {
      background: '#f8f9fa',
      text: '#212529',
      border: '#dee2e6',
      accent: '#6c5ce7',
      muted: '#8d9aaf',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: 1.5,
    },
    borders: {
      style: 'solid',
      width: '1px',
      radius: '6px',
    },
    spacing: {
      padding: '12px',
      margin: '2px',
    },
    effects: {
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  minimal: {
    name: 'minimal',
    colors: {
      background: 'transparent',
      text: '#1a1a1a',
      border: '#e5e5e5',
      accent: '#000000',
      muted: '#666666',
    },
    typography: {
      fontFamily: 'SF Pro Text, -apple-system, sans-serif',
      fontSize: '13px',
      fontWeight: '400',
      lineHeight: 1.4,
    },
    borders: {
      style: 'solid',
      width: '1px',
      radius: '0px',
    },
    spacing: {
      padding: '6px 10px',
      margin: '0px',
    },
    effects: {
      boxShadow: 'none',
      transition: 'opacity 0.2s ease',
    },
  },
  
  bold: {
    name: 'bold',
    colors: {
      background: '#000000',
      text: '#ffffff',
      border: '#333333',
      accent: '#ff6b6b',
      muted: '#999999',
    },
    typography: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: 1.3,
    },
    borders: {
      style: 'solid',
      width: '2px',
      radius: '4px',
    },
    spacing: {
      padding: '10px 14px',
      margin: '1px',
    },
    effects: {
      boxShadow: '0 0 0 2px rgba(255,107,107,0.2)',
      transition: 'all 0.15s ease-out',
    },
  },
};
