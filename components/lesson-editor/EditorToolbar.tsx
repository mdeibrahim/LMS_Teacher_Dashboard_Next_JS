import {
  Bold,
  Highlighter,
  Italic,
  Link2,
  List,
  Underline,
} from "lucide-react";

interface EditorToolbarProps {
  onSaveSelection: () => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onList: () => void;
  onHighlight: () => void;
  onOpenMedia: () => void;
}

const toolbarButtonClass =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700";

export default function EditorToolbar({
  onSaveSelection,
  onBold,
  onItalic,
  onUnderline,
  onList,
  onHighlight,
  onOpenMedia,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <button
        type="button"
        className={toolbarButtonClass}
        onMouseDown={onSaveSelection}
        onClick={onBold}
      >
        <Bold size={14} />
        Bold
      </button>

      <button
        type="button"
        className={toolbarButtonClass}
        onMouseDown={onSaveSelection}
        onClick={onItalic}
      >
        <Italic size={14} />
        Italic
      </button>

      <button
        type="button"
        className={toolbarButtonClass}
        onMouseDown={onSaveSelection}
        onClick={onUnderline}
      >
        <Underline size={14} />
        Underline
      </button>

      <button
        type="button"
        className={toolbarButtonClass}
        onMouseDown={onSaveSelection}
        onClick={onList}
      >
        <List size={14} />
        List
      </button>

      <button
        type="button"
        className={toolbarButtonClass}
        onMouseDown={onSaveSelection}
        onClick={onHighlight}
      >
        <Highlighter size={14} />
        Highlight
      </button>

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
        onMouseDown={onSaveSelection}
        onClick={onOpenMedia}
      >
        <Link2 size={14} />
        Link Media
      </button>
    </div>
  );
}
