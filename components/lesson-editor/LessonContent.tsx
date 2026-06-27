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
      className="min-h-[420px] rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-sm outline-none ring-0 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
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
