import React from "react";
import GearIcon from "./img/gear-icon.png";

interface FormulaBarProps {
  address: string; // e.g. "R1C1"
  formulaText: string; // the raw formula or cell text
  onFormulaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormulaKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onGearClick: () => void; // opens the settings modal
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  address,
  formulaText,
  onFormulaChange,
  onFormulaKeyDown,
  onFocus,
  onGearClick,
}) => {
  return (
    <div className="w-full h-12 bg-gray-300 flex items-center px-2 z-50 border-b border-gray-400">
      <div
        className="mr-2 text-right font-bold overflow-hidden whitespace-nowrap truncate"
        style={{
          width: "4rem",
          minWidth: 0,
          textOverflow: "ellipsis",
        }}
        title={address}
      >
        {address}
      </div>

      <input
        className="flex-1 h-8 text-sm px-2 bg-white"
        type="text"
        value={formulaText}
        onChange={onFormulaChange}
        onKeyDown={onFormulaKeyDown}
        onFocus={onFocus}
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
