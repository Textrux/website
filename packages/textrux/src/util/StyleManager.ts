import {
  AppearanceSettings,
  ThemeColors,
  DEFAULT_THEMES,
} from "../types/AppearanceSettings";

export class StyleManager {
  private static styleElement: HTMLStyleElement | null = null;

  static initialize() {
    if (!this.styleElement) {
      this.styleElement = document.createElement("style");
      this.styleElement.id = "textrux-dynamic-styles";
      document.head.appendChild(this.styleElement);
    }
  }

  static updateStyles(settings: AppearanceSettings) {
    this.initialize();

    if (!this.styleElement) return;

    const colors = this.getCurrentThemeColors(settings);
    const cellDefaults = settings.cellDefaults;

    const css = `
      /* Fix specific button color issues without making all buttons transparent */
      .textrux-grid button {
        background-color: #f3f4f6 !important;
        color: #374151 !important;
        border: 1px solid #d1d5db !important;
      }
      
      .textrux-grid button:hover {
        background-color: #e5e7eb !important;
      }
      
      /* Dark mode button fixes */
      .dark .textrux-grid button {
        background-color: #4b5563 !important;
        color: #f9fafb !important;
        border: 1px solid #6b7280 !important;
      }
      
      .dark .textrux-grid button:hover {
        background-color: #6b7280 !important;
      }

      /* Override problematic media query styles only for specific contexts */
      @media (prefers-color-scheme: light) {
        .textrux-grid button {
          background-color: #f3f4f6 !important;
        }
      }
      
      @media (prefers-color-scheme: dark) {
        .textrux-grid button {
          background-color: #4b5563 !important;
        }
      }

      /* Cell Default Styles */
      .grid-cell {
        text-align: ${cellDefaults.textAlign} !important;
        vertical-align: ${cellDefaults.verticalAlign} !important;
        font-weight: ${cellDefaults.fontWeight} !important;
        color: ${colors.filledCellFontColor} !important;
        background-color: ${colors.filledCellBackgroundColor} !important;
        ${
          cellDefaults.fontSize
            ? `font-size: ${cellDefaults.fontSize}px !important;`
            : ""
        }
        ${
          cellDefaults.fontFamily
            ? `font-family: ${cellDefaults.fontFamily} !important;`
            : ""
        }
      }

      /* Apply font size to editing cells as well */
      .grid-cell input, .grid-cell textarea {
        ${
          cellDefaults.fontSize
            ? `font-size: ${cellDefaults.fontSize}px !important;`
            : ""
        }
        ${
          cellDefaults.fontFamily
            ? `font-family: ${cellDefaults.fontFamily} !important;`
            : ""
        }
        color: inherit !important;
        background-color: transparent !important;
      }

      /* Block Structure Colors */
      .canvas-cell {
        background-color: ${colors.canvasCell} !important;
      }
      
      .canvas-empty-cell {
        background-color: ${colors.canvasEmptyCell} !important;
      }
      
      .cluster-empty-cell {
        background-color: ${colors.clusterEmptyCell} !important;
      }
      
      .border-cell {
        background-color: ${colors.borderCell} !important;
      }
      
      .frame-cell {
        background-color: ${colors.frameCell} !important;
      }
      
      .linked-cell {
        background-color: ${colors.linkedCell} !important;
      }
      
      .locked-cell {
        background-color: ${colors.lockedCell} !important;
      }
      
      .disabled-cell {
        background-color: ${colors.disabledCell} !important;
      }

      /* Ensure color classes override default styles */
      .bg-canvas-cell { background-color: ${colors.canvasCell} !important; }
      .bg-canvas-empty-cell { background-color: ${
        colors.canvasEmptyCell
      } !important; }
      .bg-cluster-empty-cell { background-color: ${
        colors.clusterEmptyCell
      } !important; }
      .bg-border-cell { background-color: ${colors.borderCell} !important; }
      .bg-frame-cell { background-color: ${colors.frameCell} !important; }
      .bg-linked-cell { background-color: ${colors.linkedCell} !important; }
      .bg-locked-cell { background-color: ${colors.lockedCell} !important; }
      .bg-disabled-cell { background-color: ${colors.disabledCell} !important; }
    `;

    this.styleElement.textContent = css;
  }

  private static getCurrentThemeColors(
    settings: AppearanceSettings
  ): ThemeColors {
    const mode = settings.isDarkMode ? "dark" : "light";
    const baseTheme = DEFAULT_THEMES[settings.currentTheme];
    const customColors = settings.customColors?.[mode] || {};

    if (!baseTheme) {
      return {
        ...DEFAULT_THEMES.Default[mode],
        ...customColors,
      };
    }

    return {
      ...baseTheme[mode],
      ...customColors,
    };
  }

  static cleanup() {
    if (this.styleElement) {
      document.head.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }
}
