import { useCallback, useEffect, useRef } from "react";
import { CellFormat } from "../style/CellFormat";

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
    direction: "up" | "down" | "left" | "right" | "down-right" | "down-left"
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

  const prevIsEditingRef = useRef(false);

  // If editing newly begins, initialize the sharedEditingValue:
  useEffect(() => {
    // Only initialize once, right as we go from not-editing to editing:
    if (!prevIsEditingRef.current && isEditing && sharedEditingValue === "") {
      setSharedEditingValue(formula ?? value);
      measureAndExpand(row, col, formula ?? value);
    }
    prevIsEditingRef.current = isEditing;
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
  // Focus if we're the editing cell
  useEffect(() => {
    if (isEditing && textareaRef.current) {
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
          // Insert a newline without committing
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
          return; // Don't commit yet
        }

        // Normal Enter: commit and move selection
        e.preventDefault();
        commitAndClose(sharedEditingValue);
        onKeyboardNav(row, col, e.shiftKey ? "down-right" : "down");
      } else if (e.key === "Escape") {
        e.preventDefault();
        // Discard changes
        commitAndClose(value, { escape: true });
      } else if (e.key === "Tab") {
        e.preventDefault();
        // Commit and tab over
        commitAndClose(sharedEditingValue);
        onKeyboardNav(row, col, e.shiftKey ? "left" : "right");
      } else if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        // Commit and arrow-move
        commitAndClose(sharedEditingValue);
        onKeyboardNav(
          row,
          col,
          e.key === "ArrowDown"
            ? "down"
            : e.key === "ArrowUp"
            ? "up"
            : e.key === "ArrowLeft"
            ? "left"
            : "right"
        );
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

  // Use complete CellFormat formatting instead of manual property mapping
  const styleFormat: React.CSSProperties = format.toInlineStyles();
  
  // Check if construct formatting is being applied
  const hasConstructFormatting = styleFormat.fontWeight || styleFormat.borderBottom || styleFormat.borderRight || 
                                 styleFormat.borderTop || styleFormat.borderLeft || styleFormat.textAlign;
  
  // Only apply conflicting Tailwind classes when there's no construct formatting
  const borderColor = isActive && !hasConstructFormatting ? "!border-blue-500" : 
                     !hasConstructFormatting ? "border-gray-200" : "";
  const bgColor = inSelection && !hasConstructFormatting
    ? "!border-1 !border-dashed !border-slate-600 "
    : !hasConstructFormatting ? "bg-white" : "";

  // Filter out conflicting style classes when construct formatting is applied
  const filteredStyleClasses = hasConstructFormatting 
    ? styleClasses.filter(cls => 
        // Keep non-conflicting classes, remove border/font/text classes that might conflict
        !cls.includes('border') && 
        !cls.includes('font-') && 
        !cls.includes('text-') &&
        !cls.includes('bg-') &&
        !cls.includes('!'))
    : styleClasses;

  const combinedClasses = [
    "absolute",
    "box-border",
    "grid-cell",
    borderColor,
    bgColor,
    "overflow-hidden",
    "text-ellipsis",
    isActive ? "outline-2 outline-blue-500" : "",
    ...filteredStyleClasses,
  ]
    .filter(Boolean)
    .join(" ");

  // max growth in each direction
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
        // Apply default border only if no specific border formatting is provided
        border: styleFormat.borderWidth || styleFormat.borderStyle || styleFormat.borderColor
          ? undefined 
          : ".5px solid #D2D2D2",
        ...styleFormat,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="w-full h-full p-1 bg-white outline-none resize-none dark:bg-gray-800 dark:text-gray-100"
          value={sharedEditingValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            fontSize,
            maxWidth: maxEditorWidth,
            maxHeight: maxEditorHeight,
            // Force wrapping
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            // Ensure text is visible in dark mode
            color: "inherit",
            backgroundColor: "inherit",
          }}
          autoFocus={focusTarget === "cell"}
        />
      ) : (
        <div className="w-full h-full px-1 whitespace-pre-wrap dark:text-gray-100 flex items-center">
          <span className="w-full">{value}</span>
        </div>
      )}
    </div>
  );
}
