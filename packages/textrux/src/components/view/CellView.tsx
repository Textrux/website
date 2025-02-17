import { useCallback, useEffect, useState } from "react";
import { CellFormat } from "../model/GridModel";

/** Individual cell component. Renders either text or an input if editing. */
export function CellView({
  row,
  col,
  value,
  formula,
  format,
  isActive,
  inSelection,
  isEditing,
  top,
  left,
  width,
  height,
  fontSize,
  onClick,
  onDoubleClick,
  onCommitEdit,
}: {
  row: number;
  col: number;
  value: string;
  formula: string | null;
  format: CellFormat;
  isActive: boolean;
  inSelection: boolean;
  isEditing: boolean;
  top: number;
  left: number;
  width: number;
  height: number;
  fontSize: number;
  onClick: (r: number, c: number, e: React.MouseEvent) => void;
  onDoubleClick: (r: number, c: number) => void;
  onCommitEdit: (r: number, c: number, val: string) => void;
}) {
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    // If we just toggled into editing, load the formula if present, else the value
    if (isEditing) {
      setEditValue(formula || value);
    }
  }, [isEditing, formula, value]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      onClick(row, col, e);
    },
    [row, col, onClick]
  );

  const handleDoubleClick = useCallback(() => {
    onDoubleClick(row, col);
  }, [row, col, onDoubleClick]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    onCommitEdit(row, col, editValue);
  }, [row, col, editValue, onCommitEdit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onCommitEdit(row, col, editValue);
      } else if (e.key === "Escape") {
        e.preventDefault();
        // cancel edit => do nothing?
        onCommitEdit(row, col, value); // revert to old
      }
    },
    [row, col, editValue, value, onCommitEdit]
  );

  // Tailwind classes
  const borderColor = isActive ? "border-blue-500" : "border-gray-200";
  // highlight selection
  const bgColor = inSelection ? "bg-yellow-100" : "bg-white";
  // apply custom format
  const styleFormat: React.CSSProperties = {
    backgroundColor: format.backgroundColor,
    color: format.color,
    fontWeight: format.fontWeight,
  };

  return (
    <div
      className={`absolute box-border ${bgColor} ${
        isActive ? "outline-2 outline-blue-500" : ""
      } border ${borderColor} overflow-hidden text-ellipsis`}
      style={{
        top,
        left,
        width,
        height,
        fontSize,
        ...styleFormat,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          className="w-full h-full px-1 bg-white outline-none"
          autoFocus
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{ fontSize }}
        />
      ) : (
        <div className="w-full h-full px-1">{value}</div>
      )}
    </div>
  );
}
