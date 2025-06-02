import React, { useState, useEffect, useCallback } from "react";
import {
  AppearanceSettings,
  CellDefaults,
  ThemeColors,
  DEFAULT_THEMES,
  DEFAULT_APPEARANCE_SETTINGS,
} from "../../types/AppearanceSettings";

interface AppearanceTabProps {
  gridIndex: number;
  settings: AppearanceSettings;
  onSettingsChange: (settings: AppearanceSettings) => void;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  gridIndex,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] =
    useState<AppearanceSettings>(settings);
  const [activeSection, setActiveSection] = useState<"cellDefaults" | "themes">(
    "cellDefaults"
  );

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleCellDefaultsChange = useCallback(
    (updates: Partial<CellDefaults>) => {
      const newSettings = {
        ...localSettings,
        cellDefaults: { ...localSettings.cellDefaults, ...updates },
      };
      console.log(
        `🔧 AppearanceTab handleCellDefaultsChange:`,
        updates,
        "New settings:",
        newSettings
      );
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);
    },
    [localSettings, onSettingsChange]
  );

  const handleThemeChange = useCallback(
    (themeName: string) => {
      const newSettings = { ...localSettings, currentTheme: themeName };
      console.log(
        `🎨 AppearanceTab handleThemeChange:`,
        themeName,
        "New settings:",
        newSettings
      );
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);
    },
    [localSettings, onSettingsChange]
  );

  const handleDarkModeToggle = useCallback(() => {
    const newSettings = {
      ...localSettings,
      isDarkMode: !localSettings.isDarkMode,
    };
    console.log(
      `🌙 AppearanceTab handleDarkModeToggle:`,
      !localSettings.isDarkMode,
      "New settings:",
      newSettings
    );
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  }, [localSettings, onSettingsChange]);

  const handleCustomColorChange = useCallback(
    (colorKey: keyof ThemeColors, color: string) => {
      const mode = localSettings.isDarkMode ? "dark" : "light";
      const newSettings = {
        ...localSettings,
        currentTheme: "Custom",
        customColors: {
          ...localSettings.customColors,
          [mode]: {
            ...localSettings.customColors?.[mode],
            [colorKey]: color,
          },
        },
      };
      console.log(
        `🎨 AppearanceTab handleCustomColorChange:`,
        colorKey,
        color,
        mode,
        "New settings:",
        newSettings
      );
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);
    },
    [localSettings, onSettingsChange]
  );

  const getCurrentThemeColors = (): ThemeColors => {
    const mode = localSettings.isDarkMode ? "dark" : "light";
    const baseTheme = DEFAULT_THEMES[localSettings.currentTheme];
    const customColors = localSettings.customColors?.[mode] || {};

    if (!baseTheme) {
      return DEFAULT_THEMES.Default[mode];
    }

    return {
      ...baseTheme[mode],
      ...customColors,
    };
  };

  // Function to convert color key names to friendly display names
  const getColorDisplayName = (key: string): string => {
    const nameMap: Record<string, string> = {
      canvasCell: "Canvas Cell",
      canvasEmptyCell: "Canvas Empty Cell",
      clusterEmptyCell: "Cluster Empty Cell",
      borderCell: "Border Cell",
      frameCell: "Frame Cell",
      linkedCell: "Linked Cell",
      lockedCell: "Locked Cell",
      disabledCell: "Disabled Cell",
      filledCellFontColor: "Filled Cell Font Color",
      filledCellBackgroundColor: "Filled Cell Background Color",
    };

    return nameMap[key] || key.replace(/([A-Z])/g, " $1").toLowerCase();
  };

  const currentColors = getCurrentThemeColors();
  const isCustomTheme = localSettings.currentTheme === "Custom";

  // Function to reorder colors so filled cell colors appear first
  const getOrderedColorEntries = () => {
    const colorEntries = Object.entries(currentColors);
    const filledCellColors = colorEntries.filter(
      ([key]) =>
        key === "filledCellFontColor" || key === "filledCellBackgroundColor"
    );
    const otherColors = colorEntries.filter(
      ([key]) =>
        key !== "filledCellFontColor" && key !== "filledCellBackgroundColor"
    );

    // Put filled cell colors first, then the rest
    return [...filledCellColors, ...otherColors];
  };

  return (
    <div className="space-y-6">
      {/* Section Toggle */}
      <div className="flex border rounded-lg dark:border-gray-600">
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeSection === "cellDefaults"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
          onClick={() => setActiveSection("cellDefaults")}
        >
          Cell Defaults
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeSection === "themes"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
          onClick={() => setActiveSection("themes")}
        >
          Themes & Colors
        </button>
      </div>

      {/* Cell Defaults Section */}
      {activeSection === "cellDefaults" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium dark:text-gray-100">
            Default Cell Formatting
          </h3>

          {/* Text Alignment */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horizontal Alignment
              </label>
              <select
                value={localSettings.cellDefaults.textAlign}
                onChange={(e) =>
                  handleCellDefaultsChange({ textAlign: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            {/* Vertical Alignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vertical Alignment
              </label>
              <select
                value={localSettings.cellDefaults.verticalAlign}
                onChange={(e) =>
                  handleCellDefaultsChange({
                    verticalAlign: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            {/* Font Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Weight
              </label>
              <select
                value={localSettings.cellDefaults.fontWeight}
                onChange={(e) =>
                  handleCellDefaultsChange({
                    fontWeight: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            {/* Font Size */}
            {localSettings.cellDefaults.fontSize && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size
                </label>
                <input
                  type="number"
                  value={localSettings.cellDefaults.fontSize}
                  onChange={(e) =>
                    handleCellDefaultsChange({
                      fontSize: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  min="8"
                  max="72"
                />
              </div>
            )}

            {/* Font Family */}
            {localSettings.cellDefaults.fontFamily && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Family
                </label>
                <input
                  type="text"
                  value={localSettings.cellDefaults.fontFamily}
                  onChange={(e) =>
                    handleCellDefaultsChange({
                      fontFamily: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Arial, sans-serif"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Themes Section */}
      {activeSection === "themes" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium dark:text-gray-100">
            Color Themes
          </h3>

          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium dark:text-gray-200">
              Theme
            </label>
            <select
              value={localSettings.currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            >
              {Object.keys(DEFAULT_THEMES).map((themeName) => (
                <option key={themeName} value={themeName}>
                  {themeName}
                </option>
              ))}
              <option value="Custom">Custom</option>
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="darkMode"
              checked={localSettings.isDarkMode}
              onChange={handleDarkModeToggle}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="darkMode" className="text-sm dark:text-gray-200">
              Dark Mode
            </label>
          </div>

          {/* Current Theme Preview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium dark:text-gray-200">
              Current Theme Colors
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {getOrderedColorEntries().map(([key, color]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="capitalize dark:text-gray-300">
                      {getColorDisplayName(key)}
                    </span>
                    {(isCustomTheme || localSettings.customColors) && (
                      <input
                        type="color"
                        value={color}
                        onChange={(e) =>
                          handleCustomColorChange(
                            key as keyof ThemeColors,
                            e.target.value
                          )
                        }
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                        title={`Change ${key} color`}
                      />
                    )}
                  </div>
                  <div
                    className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Custom Theme Note */}
          {isCustomTheme && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
              Custom theme: Colors will be saved separately for light and dark
              modes. Switch modes using the toggle above to customize each mode.
            </div>
          )}

          {/* Reset Button */}
          {(isCustomTheme || localSettings.customColors) && (
            <button
              onClick={() => {
                const resetSettings = {
                  ...localSettings,
                  currentTheme: "Default",
                  customColors: undefined,
                };
                setLocalSettings(resetSettings);
                onSettingsChange(resetSettings);
              }}
              className="w-full py-2 px-4 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
            >
              Reset to Default Theme
            </button>
          )}
        </div>
      )}
    </div>
  );
};
