"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Highlighter,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Subscript,
  Superscript,
  Strikethrough,
  Paintbrush,
  Square,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Eraser,
  WandSparkles,
  Pilcrow,
  ArrowDownAZ,
  Rows3,
  Grid3x3,
  Link2,
  CaseSensitive,
  IndentIncrease,
  IndentDecrease,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shared option lists (mirrors Microsoft Word's own picker values)  */
/* ------------------------------------------------------------------ */

const FONT_FAMILIES = [
  "Calibri",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Garamond",
  "Comic Sans MS",
];

// execCommand("fontSize") only accepts legacy sizes 1-7. We map those onto
// the point sizes Word actually shows, so the dropdown reads naturally.
const FONT_SIZES: { label: string; execValue: string }[] = [
  { label: "8", execValue: "1" },
  { label: "10", execValue: "2" },
  { label: "12", execValue: "3" },
  { label: "14", execValue: "4" },
  { label: "18", execValue: "5" },
  { label: "24", execValue: "6" },
  { label: "36", execValue: "7" },
];

const THEME_COLORS = [
  "#0F172A",
  "#DC2626",
  "#EA580C",
  "#CA8A04",
  "#16A34A",
  "#0891B2",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#FFFFFF",
];

const HIGHLIGHT_COLORS = [
  "#FEF08A",
  "#BBF7D0",
  "#BFDBFE",
  "#FBCFE8",
  "#FED7AA",
  "#DDD6FE",
  "#FCA5A5",
  "#A5F3FC",
  "transparent",
];

const LINE_HEIGHTS = ["1", "1.15", "1.5", "2", "2.5"];

interface EditorToolbarProps {
  onSaveSelection: () => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onFontFamily: (font: string) => void;
  onFontSize: (execValue: string) => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeCase: (mode: "upper" | "lower" | "title" | "sentence") => void;
  onClearFormatting: () => void;
  onTextEffects: (mode: "shadow" | "outline" | "none") => void;
  onFontColor: (color: string) => void;
  onHighlightColor: (color: string) => void;
  onList: () => void;
  onListOrdered: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  onSort: () => void;
  onToggleFormattingMarks: () => void;
  formattingMarksVisible: boolean;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignJustify: () => void;
  onLineHeight: (value: string) => void;
  onShading: (color: string) => void;
  onBorders: (style: "all" | "bottom" | "box" | "none") => void;
  onQuote?: () => void;
  onOpenMedia: () => void;
  onSubscript: () => void;
  onSuperscript: () => void;
  onHighlight: () => void;
}

const toolbarButtonClass =
  "inline-flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1.5 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100";

/* ------------------------------------------------------------------ */
/*  Small building blocks                                             */
/* ------------------------------------------------------------------ */

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);

  return ref;
}

function IconButton({
  icon: Icon,
  title,
  active,
  onSaveSelection,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  active?: boolean;
  onSaveSelection: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onMouseDown={onSaveSelection}
      onClick={onClick}
      className={`${toolbarButtonClass} ${active ? "border-blue-300 bg-blue-50 text-blue-700" : ""
        }`}
    >
      <Icon size={16} />
    </button>
  );
}

function Dropdown({
  label,
  icon: Icon,
  width = "w-44",
  onSaveSelection,
  trigger,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  width?: string;
  onSaveSelection: () => void;
  trigger?: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={label}
        onMouseDown={onSaveSelection}
        onClick={() => setOpen((v) => !v)}
        className={`${toolbarButtonClass} ${open ? "border-slate-300 bg-slate-100" : ""
          }`}
      >
        {trigger ?? (
          <>
            {Icon ? <Icon size={16} /> : null}
            <span className="max-w-[6.5rem] truncate text-xs">{label}</span>
          </>
        )}
        <ChevronDown size={12} className="text-slate-400" />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-[calc(100%+4px)] z-30 ${width} rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function ColorSwatchGrid({
  colors,
  onPick,
}: {
  colors: string[];
  onPick: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1 p-1">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          title={color === "transparent" ? "No color" : color}
          onClick={() => onPick(color)}
          className="h-6 w-6 rounded border border-slate-200 shadow-sm"
          style={{
            background:
              color === "transparent"
                ? "repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 50% / 8px 8px"
                : color,
          }}
        />
      ))}
    </div>
  );
}

const menuItemClass =
  "block w-full rounded-md px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700";

/* ------------------------------------------------------------------ */
/*  Toolbar                                                            */
/* ------------------------------------------------------------------ */

export default function EditorToolbar({
  onSaveSelection,
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onList,
  onHighlight,
  onOpenMedia,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onSubscript,
  onSuperscript,
  onAlignJustify,
  onListOrdered,
  onLineHeight,
  onShading,
  onBorders,
  onFontFamily,
  onFontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onChangeCase,
  onClearFormatting,
  onTextEffects,
  onFontColor,
  onHighlightColor,
  onIndent,
  onOutdent,
  onSort,
  onToggleFormattingMarks,
  formattingMarksVisible,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-stretch gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      {/* ---------------- FONT GROUP ---------------- */}
      <div className="flex flex-col gap-1">
        <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Font
        </span>

        <div className="flex flex-wrap items-center gap-1">
          <Dropdown label="Calibri" width="w-48" onSaveSelection={onSaveSelection}>
            {(close) => (
              <div className="max-h-56 overflow-y-auto">
                {FONT_FAMILIES.map((font) => (
                  <button
                    key={font}
                    type="button"
                    style={{ fontFamily: font }}
                    className={menuItemClass}
                    onClick={() => {
                      onFontFamily(font);
                      close();
                    }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </Dropdown>

          <Dropdown label="12" width="w-24" onSaveSelection={onSaveSelection}>
            {(close) => (
              <div className="max-h-56 overflow-y-auto">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size.label}
                    type="button"
                    className={menuItemClass}
                    onClick={() => {
                      onFontSize(size.execValue);
                      close();
                    }}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            )}
          </Dropdown>

          <IconButton
            icon={ZoomIn}
            title="Grow font"
            onSaveSelection={onSaveSelection}
            onClick={onIncreaseFontSize}
          />
          <IconButton
            icon={ZoomOut}
            title="Shrink font"
            onSaveSelection={onSaveSelection}
            onClick={onDecreaseFontSize}
          />

          <div className="mx-1 h-6 w-px bg-slate-200" />

          <IconButton icon={Bold} title="Bold" onSaveSelection={onSaveSelection} onClick={onBold} />
          <IconButton icon={Italic} title="Italic" onSaveSelection={onSaveSelection} onClick={onItalic} />
          <IconButton
            icon={Underline}
            title="Underline"
            onSaveSelection={onSaveSelection}
            onClick={onUnderline}
          />
          <IconButton
            icon={Strikethrough}
            title="Strikethrough"
            onSaveSelection={onSaveSelection}
            onClick={onStrikethrough}
          />
          <IconButton
            icon={Subscript}
            title="Subscript"
            onSaveSelection={onSaveSelection}
            onClick={onSubscript}
          />
          <IconButton
            icon={Superscript}
            title="Superscript"
            onSaveSelection={onSaveSelection}
            onClick={onSuperscript}
          />

          <div className="mx-1 h-6 w-px bg-slate-200" />

          <Dropdown
            label="Case"
            icon={CaseSensitive}
            width="w-40"
            onSaveSelection={onSaveSelection}
          >
            {(close) => (
              <div>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onChangeCase("sentence");
                    close();
                  }}
                >
                  Sentence case.
                </button>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onChangeCase("lower");
                    close();
                  }}
                >
                  lowercase
                </button>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onChangeCase("upper");
                    close();
                  }}
                >
                  UPPERCASE
                </button>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onChangeCase("title");
                    close();
                  }}
                >
                  Capitalize Each Word
                </button>
              </div>
            )}
          </Dropdown>

          <IconButton
            icon={Eraser}
            title="Clear formatting"
            onSaveSelection={onSaveSelection}
            onClick={onClearFormatting}
          />

          <Dropdown
            label="Effects"
            icon={WandSparkles}
            width="w-40"
            onSaveSelection={onSaveSelection}
          >
            {(close) => (
              <div>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onTextEffects("shadow");
                    close();
                  }}
                >
                  Shadow
                </button>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onTextEffects("outline");
                    close();
                  }}
                >
                  Outline
                </button>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onTextEffects("none");
                    close();
                  }}
                >
                  Remove effect
                </button>
              </div>
            )}
          </Dropdown>

          <Dropdown
            label="Color"
            icon={Paintbrush}
            width="w-40"
            onSaveSelection={onSaveSelection}
            trigger={
              <span className="flex flex-col items-center leading-none">
                <Paintbrush size={16} />
                <span className="mt-0.5 h-1 w-4 rounded-sm bg-red-600" />
              </span>
            }
          >
            {(close) => (
              <ColorSwatchGrid
                colors={THEME_COLORS}
                onPick={(color) => {
                  onFontColor(color);
                  close();
                }}
              />
            )}
          </Dropdown>

          <Dropdown
            label="Highlight"
            icon={Highlighter}
            width="w-40"
            onSaveSelection={onSaveSelection}
            trigger={
              <span className="flex flex-col items-center leading-none">
                <Highlighter size={16} />
                <span className="mt-0.5 h-1 w-4 rounded-sm bg-yellow-300" />
              </span>
            }
          >
            {(close) => (
              <ColorSwatchGrid
                colors={HIGHLIGHT_COLORS}
                onPick={(color) => {
                  onHighlightColor(color);
                  close();
                }}
              />
            )}
          </Dropdown>

          <IconButton
            icon={Highlighter}
            title="Quick highlight"
            onSaveSelection={onSaveSelection}
            onClick={onHighlight}
          />
        </div>
      </div>

      <div className="w-px self-stretch bg-slate-200" />

      {/* ---------------- PARAGRAPH GROUP ---------------- */}
      <div className="flex flex-col gap-1">
        <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Paragraph
        </span>

        <div className="flex flex-wrap items-center gap-1">
          <IconButton icon={List} title="Bulleted list" onSaveSelection={onSaveSelection} onClick={onList} />
          <IconButton
            icon={ListOrdered}
            title="Numbered list"
            onSaveSelection={onSaveSelection}
            onClick={onListOrdered}
          />
          <IconButton
            icon={IndentIncrease}
            title="Increase indent"
            onSaveSelection={onSaveSelection}
            onClick={onIndent}
          />
          <IconButton
            icon={IndentDecrease}
            title="Decrease indent"
            onSaveSelection={onSaveSelection}
            onClick={onOutdent}
          />
          <IconButton
            icon={ArrowDownAZ}
            title="Sort A to Z"
            onSaveSelection={onSaveSelection}
            onClick={onSort}
          />
          <IconButton
            icon={Pilcrow}
            title="Show/hide formatting marks"
            active={formattingMarksVisible}
            onSaveSelection={onSaveSelection}
            onClick={onToggleFormattingMarks}
          />

          <div className="mx-1 h-6 w-px bg-slate-200" />

          <IconButton
            icon={AlignLeft}
            title="Align left"
            onSaveSelection={onSaveSelection}
            onClick={onAlignLeft}
          />
          <IconButton
            icon={AlignCenter}
            title="Center"
            onSaveSelection={onSaveSelection}
            onClick={onAlignCenter}
          />
          <IconButton
            icon={AlignRight}
            title="Align right"
            onSaveSelection={onSaveSelection}
            onClick={onAlignRight}
          />
          <IconButton
            icon={AlignJustify}
            title="Justify"
            onSaveSelection={onSaveSelection}
            onClick={onAlignJustify}
          />

          <div className="mx-1 h-6 w-px bg-slate-200" />

          <Dropdown
            label="Spacing"
            icon={Rows3}
            width="w-28"
            onSaveSelection={onSaveSelection}
          >
            {(close) => (
              <div>
                {LINE_HEIGHTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={menuItemClass}
                    onClick={() => {
                      onLineHeight(value);
                      close();
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </Dropdown>

          <Dropdown
            label="Shading"
            icon={Square}
            width="w-40"
            onSaveSelection={onSaveSelection}
          >
            {(close) => (
              <ColorSwatchGrid
                colors={HIGHLIGHT_COLORS}
                onPick={(color) => {
                  onShading(color);
                  close();
                }}
              />
            )}
          </Dropdown>

          <Dropdown
            label="Borders"
            icon={Grid3x3}
            width="w-40"
            onSaveSelection={onSaveSelection}
          >
            {(close) => (
              <div>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onBorders("box");
                    close();
                  }}
                >
                  Box border
                </button>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onBorders("bottom");
                    close();
                  }}
                >
                  Bottom border
                </button>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onBorders("all");
                    close();
                  }}
                >
                  All borders (table-style)
                </button>
                <button
                  className={menuItemClass}
                  onClick={() => {
                    onBorders("none");
                    close();
                  }}
                >
                  No border
                </button>
              </div>
            )}
          </Dropdown>
        </div>
      </div>

      <div className="w-px self-stretch bg-slate-200" />

      {/* ---------------- INSERT GROUP ---------------- */}
      <div className="flex flex-col gap-1">
        <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Insert
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onMouseDown={onSaveSelection}
            onClick={onOpenMedia}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-blue-300 bg-white px-2.5 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
          >
            <Link2 size={16} />
            <span>Link Media</span>
          </button>
        </div>
      </div>
    </div>
  );
}