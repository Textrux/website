import React, { useMemo } from "react";
// @ts-expect-error - Image file exists at runtime but TypeScript can't find it
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
    <div className="w-full h-12 bg-gray-300 flex items-center px-2 z-50 border-b border-gray-400">
      <div
        className="mr-2 text-right font-bold overflow-hidden whitespace-nowrap"
        style={addressStyle}
        title={address}
      >
        {address}
      </div>

      <input
        className={`flex-1 h-8 text-sm px-2 border rounded ${
          disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"
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
        className="ml-2 cursor-pointer"
        style={{ width: "24px", height: "24px" }}
        onClick={onGearClick}
      />
    </div>
  );
};
