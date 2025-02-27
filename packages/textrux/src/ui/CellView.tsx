import { useCallback, useEffect, useRef } from "react";
import { CellFormat } from "../structure/CellFormat";

interface CellViewProps {
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

  measureAndExpand: (r: number, c: number, text: string) => void;
  sharedEditingValue: string;
  setSharedEditingValue: (txt: string) => void;
  focusTarget?: "cell" | "formula" | null;

  // classes from styleMap
  styleClasses: string[];
}

export function CellView(props: CellViewProps) {
  const {
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
    styleClasses,
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // If editing newly begins, initialize the sharedEditingValue:
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

  // Focus if we’re the editing cell
  useEffect(() => {
    if (isEditing && focusTarget === "cell" && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing, focusTarget]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;
      setSharedEditingValue(newVal);
      measureAndExpand(row, col, newVal);
    },
    [row, col, setSharedEditingValue, measureAndExpand]
  );

  const commitAndClose = useCallback(
    (newVal: string, opts?: { escape?: boolean }) => {
      onCommitEdit(row, col, newVal, opts);
    },
    [row, col, onCommitEdit]
  );

  const handleBlur = useCallback(() => {
    if (focusTarget === "cell") {
      commitAndClose(sharedEditingValue);
    }
  }, [commitAndClose, sharedEditingValue, focusTarget]);

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
          // normal Enter => commit
          e.preventDefault();
          commitAndClose(sharedEditingValue);
          onKeyboardNav(row, col, "down");
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        commitAndClose(value, { escape: true });
      } else if (e.key === "Tab") {
        e.preventDefault();
        commitAndClose(sharedEditingValue);
        if (e.shiftKey) {
          onKeyboardNav(row, col, "left");
        } else {
          onKeyboardNav(row, col, "right");
        }
      } else if (
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

  const borderColor = isActive ? "border-blue-500" : "border-gray-200";
  const bgColor = inSelection ? "bg-yellow-100" : "bg-white";

  const styleFormat: React.CSSProperties = {
    backgroundColor: format.backgroundColor,
    color: format.color,
    fontWeight: format.fontWeight,
  };

  const combinedClasses = [
    "absolute",
    "box-border",
    bgColor,
    borderColor,
    "overflow-hidden",
    "text-ellipsis",
    isActive ? "outline-2 outline-blue-500" : "",
    ...styleClasses,
  ]
    .filter(Boolean)
    .join(" ");

  const maxEditorWidth = 6 * width;
  const maxEditorHeight = 6 * height;

  return (
    <div
      className={combinedClasses}
      style={{
        top,
        left,
        width,
        height,
        fontSize,
        ...styleFormat,
        border: ".5px solid #D2D2D2",
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
          autoFocus={focusTarget === "cell"}
        />
      ) : (
        <div className="w-full h-full px-1 whitespace-pre-wrap">{value}</div>
      )}
    </div>
  );
}
