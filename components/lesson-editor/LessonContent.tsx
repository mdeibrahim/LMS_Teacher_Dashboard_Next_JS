import {
  useEffect,
  forwardRef,
  type MouseEvent,
  type MutableRefObject,
} from "react";

interface LessonContentProps {
  value: string;
  onChange: (value: string) => void;
  onFocusSelection: () => void;
  onBlurSelection: () => void;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  showFormattingMarks?: boolean;
}

const LessonContent = forwardRef<
  HTMLDivElement,
  LessonContentProps
>(function LessonContent(
  {
    value,
    onChange,
    onFocusSelection,
    onBlurSelection,
    onClick,
    showFormattingMarks = false,
  },
  ref
) {
  const setContentRef = (
    node: HTMLDivElement | null
  ) => {
    if (!ref) return;

    if (typeof ref === "function") {
      ref(node);
      return;
    }

    (ref as MutableRefObject<HTMLDivElement | null>).current =
      node;
  };

  useEffect(() => {
    const element =
      typeof ref === "function"
        ? null
        : (ref as MutableRefObject<HTMLDivElement | null>).current;

    if (!element) {
      return;
    }

    if (element.innerHTML !== value) {
      element.innerHTML = value;
    }
  }, [ref, value]);

  return (
    <div
      ref={setContentRef}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      spellCheck
      className={`lesson-content min-h-[420px] rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-sm outline-none ring-0 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 ${showFormattingMarks ? "lesson-content--marks" : ""
        }`}
      data-placeholder="Start writing the lesson content here..."
      onInput={(event) => {
        onChange(event.currentTarget.innerHTML);
      }}
      onClick={onClick}
      onFocus={onFocusSelection}
      onBlur={onBlurSelection}
    />
  );
});

export default LessonContent;

/**
 * Word-style formatting marks (pilcrows for paragraphs, dots for spaces).
 * Rendered as CSS so the underlying HTML content is never mutated. Import
 * this once globally (e.g. in globals.css) or inline it via a <style> tag
 * near the editor.
 */
export const lessonContentMarksStyles = `
.lesson-content--marks p::after,
.lesson-content--marks div::after {
  content: "\\00B6";
  color: #94a3b8;
  margin-left: 2px;
  font-weight: 600;
}

.lesson-content--marks {
  word-spacing: 0.15em;
}
`;