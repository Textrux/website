// CellView.tsx

import { useCallback, useEffect, useRef } from "react";
import { CellFormat } from "../model/GridModel";

interface CellViewProps {
  row: number;
  col: number;
  value: string; // the final stored value from the model
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

  // The parent's multi-purpose callbacks:
  onCellMouseDown: (r: number, c: number, e: React.MouseEvent) => void;
  onClick: (r: number, c: number, e: React.MouseEvent) => void;
  onDoubleClick: (r: number, c: number) => void;
  onCommitEdit: (
    r: number,
    c: number,
    val: string,
    opts?: { escape?: boolean }
  ) => void;
  onKeyboardNav: (
    r: number,
    c: number,
    direction: "down" | "right" | "left"
  ) => void;

  // For real-time partial editing + dynamic resizing:
  measureAndExpand: (r: number, c: number, text: string) => void;
  sharedEditingValue: string;
  setSharedEditingValue: (txt: string) => void;
}

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
  onCellMouseDown,
  onClick,
  onDoubleClick,
  onCommitEdit,
  onKeyboardNav,
  measureAndExpand,
  sharedEditingValue,
  setSharedEditingValue,
}: CellViewProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // If we just toggled into editing, ensure parent's sharedEditingValue is correct:
  useEffect(() => {
    if (isEditing) {
      // If parent's sharedEditingValue is still from a different cell,
      // or empty, we can set it to formula or value
      // We'll do a simple check: if shared is different from formula
      // For safety, we might do:
      if (sharedEditingValue === "") {
        setSharedEditingValue(formula ?? value);
        measureAndExpand(row, col, formula ?? value);
      }
    }
  }, [
    isEditing,
    formula,
    value,
    sharedEditingValue,
    setSharedEditingValue,
    measureAndExpand,
    row,
    col,
  ]);

  // Mousedown => start selection
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        e.preventDefault();
        onCellMouseDown(row, col, e);
      }
    },
    [row, col, onCellMouseDown]
  );

  // Single-click => no-op in here (the parent does selection)
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      onClick(row, col, e);
    },
    [row, col, onClick]
  );

  // Double-click => edit
  const handleDoubleClick = useCallback(() => {
    onDoubleClick(row, col);
  }, [row, col, onDoubleClick]);

  // Called each time user types in the textarea
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;
      setSharedEditingValue(newVal);
      // Expand the cell in real time
      measureAndExpand(row, col, newVal);
    },
    [row, col, setSharedEditingValue, measureAndExpand]
  );

  // Commit
  const commitAndClose = useCallback(
    (newVal: string, opts?: { escape?: boolean }) => {
      onCommitEdit(row, col, newVal, opts);
    },
    [row, col, onCommitEdit]
  );

  // If user blurs away => commit the partial text
  const handleBlur = useCallback(() => {
    commitAndClose(sharedEditingValue);
  }, [commitAndClose, sharedEditingValue]);

  // Keydown => alt+enter => newline, etc.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        if (e.altKey) {
          // Insert a newline
          e.preventDefault();
          const target = e.currentTarget;
          const start = target.selectionStart ?? 0;
          const end = target.selectionEnd ?? 0;
          const before = sharedEditingValue.slice(0, start);
          const after = sharedEditingValue.slice(end);
          const newVal = before + "\n" + after;
          setSharedEditingValue(newVal);
          // measure expansion
          measureAndExpand(row, col, newVal);
          requestAnimationFrame(() => {
            target.selectionStart = target.selectionEnd = start + 1;
          });
        } else {
          // normal Enter => commit & move down
          e.preventDefault();
          commitAndClose(sharedEditingValue);
          onKeyboardNav(row, col, "down");
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        // revert => old value
        commitAndClose(value, { escape: true });
      } else if (e.key === "Tab") {
        e.preventDefault();
        commitAndClose(sharedEditingValue);
        if (e.shiftKey) {
          onKeyboardNav(row, col, "left");
        } else {
          onKeyboardNav(row, col, "right");
        }
      }
    },
    [
      row,
      col,
      sharedEditingValue,
      value,
      commitAndClose,
      onKeyboardNav,
      setSharedEditingValue,
      measureAndExpand,
    ]
  );

  // Some styling
  const borderColor = isActive ? "border-blue-500" : "border-gray-200";
  const bgColor = inSelection ? "bg-yellow-100" : "bg-white";
  const styleFormat: React.CSSProperties = {
    backgroundColor: format.backgroundColor,
    color: format.color,
    fontWeight: format.fontWeight,
  };

  // Let user expand up to 5-6x in each dimension, or you can do more
  // We'll do 6x here for demonstration
  const maxEditorWidth = 6 * width;
  const maxEditorHeight = 6 * height;

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
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="w-full h-full p-1 bg-white outline-none resize-none"
          value={sharedEditingValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            fontSize,
            maxWidth: maxEditorWidth,
            maxHeight: maxEditorHeight,
            overflow: "auto",
          }}
          autoFocus
        />
      ) : (
        <div className="w-full h-full px-1 whitespace-pre-wrap">{value}</div>
      )}
    </div>
  );
}
