/// <reference types="vite/client" />

// Declare module types for CSS files
declare module "*.css" {
  const content: string;
  export default content;
}

// Declare module types for image files
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

// Declare module types for CSV files imported as raw text
declare module "*.csv?raw" {
  const content: string;
  export default content;
}

// Global debug interface for Textrux
interface TextruxDebugInterface {
  parseGrid: () => void;
  inspectGrid: () => any;
  inspectCell: (row: number, col: number) => void;
  showAllConstructs: () => void;
  inspectElements: (row?: number, col?: number) => void;
  inspectCellElements: (row: number, col: number) => void;
  showElementSummary: () => void;
  testFormattingPerformance: () => void;
  testThemeAwareFormatting: () => void;
  getGridData: () => string;
}

declare global {
  interface Window {
    textruxDebug: TextruxDebugInterface;
  }
}
