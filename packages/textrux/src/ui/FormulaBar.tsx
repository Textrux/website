import React, { useMemo } from "react";

import GearIcon from "./img/gear-icon.png";

interface FormulaBarProps {
  address: string; // e.g. "R1C1"
  formulaText: string; // the raw formula or cell text
  onFormulaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormulaKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onGearClick: () => void; // opens the settings modal
  disabled?: boolean;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  address,
  formulaText,
  onFormulaChange,
  onFormulaKeyDown,
  onFocus,
  onGearClick,
  disabled,
}) => {
  // Calculate font size based on address length
  const addressStyle = useMemo(() => {
    const baseSize = 16; // Base font size in pixels
    const minSize = 11; // Minimum font size we'll go down to
    const maxWidth = 110; // Maximum width in pixels

    // Reduce font size for longer addresses
    let fontSize = baseSize;
    if (address.length > 4) {
      fontSize = Math.max(baseSize - (address.length - 4), minSize);
    }

    return {
      minWidth: "4rem",
      maxWidth: `${maxWidth}px`,
      width: address.length <= 4 ? "4rem" : "auto",
      paddingRight: "0.5rem",
      flexShrink: 0,
      fontSize: `${fontSize}px`,
    };
  }, [address]);

  return (
    <div className="w-full h-12 bg-gray-300 dark:bg-gray-700 flex items-center px-2 z-50 border-b border-gray-400 dark:border-gray-600">
      <div
        className="mr-2 text-right font-bold overflow-hidden whitespace-nowrap dark:text-gray-100"
        style={addressStyle}
        title={address}
      >
        {address}
      </div>

      <input
        className={`flex-1 h-8 text-sm px-2 border rounded dark:border-gray-600 ${
          disabled
            ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed dark:text-gray-400"
            : "bg-white dark:bg-gray-800 dark:text-gray-100"
        }`}
        type="text"
        value={formulaText}
        onChange={onFormulaChange}
        onKeyDown={onFormulaKeyDown}
        onFocus={onFocus}
        disabled={disabled}
      />

      <img
        src={GearIcon}
        alt="Settings"
        title="Settings"
        className="ml-2 cursor-pointer dark:filter dark:invert"
        style={{ width: "24px", height: "24px" }}
        onClick={onGearClick}
      />
    </div>
  );
};
