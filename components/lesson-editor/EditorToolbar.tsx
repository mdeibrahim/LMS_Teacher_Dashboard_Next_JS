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
  Text,
  ALargeSmall,
  ZoomIn,
  ZoomOut,
  Eraser,
  WandSparkles,
  Pilcrow,
  SortAsc,
  Rows3,
  Grid3x3,
  Link2,
  TextCursorInput,
  IndentIncrease,
  IndentDecrease,
  Undo,
  Redo,
  Table,
  Image,
  Link,
  ArrowDown,
  Clipboard,
} from "lucide-react";

interface EditorToolbarProps {
  onSaveSelection: () => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onFontFamily: () => void;
  onFontSize: () => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeCase: () => void;
  onClearFormatting: () => void;
  onTextEffects: () => void;
  onFontColor: () => void;
  onHighlightColor: () => void;
  onList: () => void;
  onListOrdered: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  onSort: () => void;
  onToggleFormattingMarks: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignJustify: () => void;
  onLineHeight: () => void;
  onShading: () => void;
  onBorders: () => void;
  onQuote?: () => void;
  onOpenMedia: () => void;
  onSubscript: () => void;
  onSuperscript: () => void;
  onHighlight: () => void;
}

const toolbarButtonClass =
  "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700";

type ToolbarButtonProps = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  onSaveSelection: () => void;
};

const ToolbarButton = ({
  icon: Icon,
  label,
  onClick,
  onSaveSelection,
}: ToolbarButtonProps) => (
  <button
    type="button"
    className={toolbarButtonClass}
    onMouseDown={onSaveSelection}
    onClick={onClick}
  >
    <Icon size={16} />
    <span>{label}</span>
  </button>
);

type ButtonConfig = {
  icon: React.ElementType;
  label: string;
  action: () => void;
};

type ToolbarGroup = {
  title: string;
  buttons: ButtonConfig[];
};

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
}: EditorToolbarProps) {
  const groups: ToolbarGroup[] = [
    {
      title: "Font",
      buttons: [
        { icon: Bold, label: "Bold", action: onBold },
        { icon: Italic, label: "Italic", action: onItalic },
        { icon: Underline, label: "Underline", action: onUnderline },
        { icon: Strikethrough, label: "Strike", action: onStrikethrough },
        { icon: Text, label: "Font", action: onFontFamily },
        { icon: ALargeSmall, label: "Size", action: onFontSize },
        { icon: ZoomIn, label: "A+", action: onIncreaseFontSize },
        { icon: ZoomOut, label: "A-", action: onDecreaseFontSize },
        { icon: TextCursorInput, label: "Aa", action: onChangeCase },
        { icon: Eraser, label: "Clear", action: onClearFormatting },
        { icon: WandSparkles, label: "Effects", action: onTextEffects },
        { icon: Paintbrush, label: "Color", action: onFontColor },
        { icon: Highlighter, label: "Highlight", action: onHighlightColor },
        { icon: Subscript, label: "Sub", action: onSubscript },
        { icon: Superscript, label: "Super", action: onSuperscript },
      ],
    },
    {
      title: "Paragraph",
      buttons: [
        { icon: List, label: "Bullets", action: onList },
        { icon: ListOrdered, label: "Number", action: onListOrdered },
        { icon: IndentIncrease, label: "Indent", action: onIndent },
        { icon: IndentDecrease, label: "Outdent", action: onOutdent },
        { icon: SortAsc, label: "Sort", action: onSort },
        { icon: Pilcrow, label: "Marks", action: onToggleFormattingMarks },
        { icon: AlignLeft, label: "Left", action: onAlignLeft },
        { icon: AlignCenter, label: "Center", action: onAlignCenter },
        { icon: AlignRight, label: "Right", action: onAlignRight },
        { icon: AlignJustify, label: "Justify", action: onAlignJustify },
        { icon: Rows3, label: "Spacing", action: onLineHeight },
        { icon: Square, label: "Shading", action: onShading },
        { icon: Grid3x3, label: "Borders", action: onBorders },
      ],
    },
  ];

  return (
    <div className="flex flex-wrap items-stretch gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      {groups.map((group, groupIndex) => (
        <div key={group.title} className="flex items-stretch gap-3">
          {/* Vertical separator between groups */}
          {groupIndex > 0 && (
            <div className="w-px self-stretch bg-slate-200" />
          )}

          <div className="flex flex-col gap-1">
            <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {group.title}
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {group.buttons.map(({ icon, label, action }) => (
                <ToolbarButton
                  key={label}
                  icon={icon}
                  label={label}
                  onClick={action}
                  onSaveSelection={onSaveSelection}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Separator before Insert section */}
      <div className="w-px self-stretch bg-slate-200" />

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
