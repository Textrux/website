// Appearance settings types for customizing grid appearance

export interface CellDefaults {
  textAlign: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
  fontWeight: "normal" | "bold";
  fontSize?: number;
  fontFamily?: string;
}

export interface ThemeColors {
  // Block structure colors
  canvasCell: string; // Filled canvas cells
  canvasEmptyCell: string; // Empty non-cluster canvas cells
  clusterEmptyCell: string; // Empty cluster canvas cells
  borderCell: string; // Block border
  frameCell: string; // Block frame
  linkedCell: string; // Linked blocks
  lockedCell: string; // Locked blocks
  disabledCell: string; // Disabled cells

  // Cell content colors
  filledCellFontColor: string; // Font color for filled cells
  filledCellBackgroundColor: string; // Background color for filled cells
}

export interface Theme {
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export interface AppearanceSettings {
  cellDefaults: CellDefaults;
  currentTheme: string;
  isDarkMode: boolean;
  customColors?: {
    light: Partial<ThemeColors>;
    dark: Partial<ThemeColors>;
  };
}

// Default themes
export const DEFAULT_THEMES: Record<string, Theme> = {
  Default: {
    name: "Default",
    light: {
      canvasCell: "#ffffff",
      canvasEmptyCell: "#eeeeff",
      clusterEmptyCell: "#bbbbff",
      borderCell: "#ffffe0",
      frameCell: "#ffff00",
      linkedCell: "#ffa500",
      lockedCell: "#ff0000",
      disabledCell: "#eeeeee",
      filledCellFontColor: "#000000",
      filledCellBackgroundColor: "#ffffff",
    },
    dark: {
      canvasCell: "#1f2937",
      canvasEmptyCell: "#312e81",
      clusterEmptyCell: "#1e3a8a",
      borderCell: "#451a03",
      frameCell: "#92400e",
      linkedCell: "#c2410c",
      lockedCell: "#dc2626",
      disabledCell: "#374151",
      filledCellFontColor: "#ffffff",
      filledCellBackgroundColor: "#212121",
    },
  },
  Ocean: {
    name: "Ocean",
    light: {
      canvasCell: "#ffffff",
      canvasEmptyCell: "#e0f2fe",
      clusterEmptyCell: "#b3e5fc",
      borderCell: "#e1f5fe",
      frameCell: "#00bcd4",
      linkedCell: "#0277bd",
      lockedCell: "#d32f2f",
      disabledCell: "#f5f5f5",
      filledCellFontColor: "#000000",
      filledCellBackgroundColor: "#ffffff",
    },
    dark: {
      canvasCell: "#263238",
      canvasEmptyCell: "#37474f",
      clusterEmptyCell: "#455a64",
      borderCell: "#546e7a",
      frameCell: "#00acc1",
      linkedCell: "#0288d1",
      lockedCell: "#d32f2f",
      disabledCell: "#37474f",
      filledCellFontColor: "#ffffff",
      filledCellBackgroundColor: "#212121",
    },
  },
  Forest: {
    name: "Forest",
    light: {
      canvasCell: "#ffffff",
      canvasEmptyCell: "#e8f5e8",
      clusterEmptyCell: "#c8e6c9",
      borderCell: "#f1f8e9",
      frameCell: "#8bc34a",
      linkedCell: "#689f38",
      lockedCell: "#d32f2f",
      disabledCell: "#f5f5f5",
      filledCellFontColor: "#000000",
      filledCellBackgroundColor: "#ffffff",
    },
    dark: {
      canvasCell: "#1b5e20",
      canvasEmptyCell: "#2e7d32",
      clusterEmptyCell: "#388e3c",
      borderCell: "#43a047",
      frameCell: "#66bb6a",
      linkedCell: "#81c784",
      lockedCell: "#d32f2f",
      disabledCell: "#2e7d32",
      filledCellFontColor: "#ffffff",
      filledCellBackgroundColor: "#212121",
    },
  },
  Sunset: {
    name: "Sunset",
    light: {
      canvasCell: "#ffffff",
      canvasEmptyCell: "#fff3e0",
      clusterEmptyCell: "#ffe0b2",
      borderCell: "#fce4ec",
      frameCell: "#ff9800",
      linkedCell: "#f57c00",
      lockedCell: "#d32f2f",
      disabledCell: "#fafafa",
      filledCellFontColor: "#000000",
      filledCellBackgroundColor: "#ffffff",
    },
    dark: {
      canvasCell: "#bf360c",
      canvasEmptyCell: "#d84315",
      clusterEmptyCell: "#f4511e",
      borderCell: "#ff5722",
      frameCell: "#ff7043",
      linkedCell: "#ff8a65",
      lockedCell: "#d32f2f",
      disabledCell: "#d84315",
      filledCellFontColor: "#ffffff",
      filledCellBackgroundColor: "#212121",
    },
  },
  Monochrome: {
    name: "Monochrome",
    light: {
      filledCellFontColor: "#000000",
      filledCellBackgroundColor: "#ffffff",
      canvasCell: "#ffffff",
      canvasEmptyCell: "#f5f5f5",
      clusterEmptyCell: "#e0e0e0",
      borderCell: "#eeeeee",
      frameCell: "#bdbdbd",
      linkedCell: "#757575",
      lockedCell: "#424242",
      disabledCell: "#f5f5f5",
    },
    dark: {
      filledCellFontColor: "#ffffff",
      filledCellBackgroundColor: "#212121",
      canvasCell: "#212121",
      canvasEmptyCell: "#424242",
      clusterEmptyCell: "#616161",
      borderCell: "#757575",
      frameCell: "#9e9e9e",
      linkedCell: "#bdbdbd",
      lockedCell: "#e0e0e0",
      disabledCell: "#424242",
    },
  },
};

export const DEFAULT_CELL_DEFAULTS: CellDefaults = {
  textAlign: "left",
  verticalAlign: "middle",
  fontWeight: "normal",
  fontSize: 12,
  fontFamily: "Arial",
};

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  cellDefaults: {
    textAlign: "left",
    verticalAlign: "middle",
    fontWeight: "normal",
    fontSize: 12,
    fontFamily: "Arial",
  },
  currentTheme: "Default",
  isDarkMode: false,
};
