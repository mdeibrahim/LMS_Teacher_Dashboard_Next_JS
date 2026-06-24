"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type {
  AccordionDraft,
  AccordionSection,
} from "../types";

interface AccordionModalProps {
  open: boolean;
  item: AccordionSection | null;
  onClose: () => void;
  onSave: (draft: AccordionDraft) => void;
}

export default function AccordionModal({
  open,
  item,
  onClose,
  onSave,
}: AccordionModalProps) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [content, setContent] = useState(item?.content ?? "");
  const [isOpenByDefault, setIsOpenByDefault] = useState(
    item?.isOpenByDefault ?? false
  );

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {item ? "Edit Accordion Section" : "Add Accordion Section"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Build collapsible content blocks for the lesson sidebar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Section Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Key takeaways"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Content
            </label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={7}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter HTML or plain text content..."
            />
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isOpenByDefault}
              onChange={(event) =>
                setIsOpenByDefault(event.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Open by default
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                onSave({
                  title: title.trim(),
                  content,
                  isOpenByDefault,
                })
              }
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Save Section
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
