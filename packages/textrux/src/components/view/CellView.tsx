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

  // The parent's callbacks:
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
    direction: "up" | "down" | "left" | "right"
  ) => void;

  // For real-time partial editing + dynamic sizing
  measureAndExpand: (r: number, c: number, text: string) => void;
  sharedEditingValue: string;
  setSharedEditingValue: (txt: string) => void;

  // Whether we should autoFocus the cell text area or not
  focusTarget: "cell" | "formula" | null;
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
  focusTarget,
}: CellViewProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Once we enter editing, if our parent's shared value is empty, fill with formula or current value
  useEffect(() => {
    if (isEditing && sharedEditingValue === "") {
      setSharedEditingValue(formula ?? value);
      measureAndExpand(row, col, formula ?? value);
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

  // If editing and focusTarget === 'cell', focus the textarea so subsequent chars go here
  useEffect(() => {
    if (isEditing && focusTarget === "cell" && textareaRef.current) {
      textareaRef.current.focus();
      // Optionally place cursor at end:
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing, focusTarget]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        // Removing e.preventDefault() so normal focus/click behavior can happen:
        // e.preventDefault();
        onCellMouseDown(row, col, e);
      }
    },
    [row, col, onCellMouseDown]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      onClick(row, col, e);
    },
    [row, col, onClick]
  );

  const handleDoubleClick = useCallback(() => {
    onDoubleClick(row, col);
  }, [row, col, onDoubleClick]);

  // If user types in the textarea
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;
      setSharedEditingValue(newVal);
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

  // If user blurs away from the textarea => commit partial
  const handleBlur = useCallback(() => {
    // Only commit if focusTarget === 'cell'. If user switched to formula bar,
    // we don't want to auto-commit the partial (the formula bar is continuing).
    if (focusTarget === "cell") {
      commitAndClose(sharedEditingValue);
    }
  }, [commitAndClose, sharedEditingValue, focusTarget]);

  // Keydown => alt+enter => newline, or arrow keys => commit & navigate
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
      // If user wants arrow keys to exit editing and move selection:
      else if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        commitAndClose(sharedEditingValue);
        if (e.key === "ArrowDown") onKeyboardNav(row, col, "down");
        if (e.key === "ArrowUp") onKeyboardNav(row, col, "up");
        if (e.key === "ArrowLeft") onKeyboardNav(row, col, "left");
        if (e.key === "ArrowRight") onKeyboardNav(row, col, "right");
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

  // Limit how big the editor can expand
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
          // Only autofocus if we're actually editing in the cell
          autoFocus={focusTarget === "cell"}
        />
      ) : (
        <div className="w-full h-full px-1 whitespace-pre-wrap">{value}</div>
      )}
    </div>
  );
}
