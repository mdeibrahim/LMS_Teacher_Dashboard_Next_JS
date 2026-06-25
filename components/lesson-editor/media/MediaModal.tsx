"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  AudioLines,
  FileText,
  Image as ImageIcon,
  Video,
  Play,
  X,
} from "lucide-react";

import type {
  MediaContentType,
  MediaDraft,
  MediaItem,
} from "../types";

interface MediaModalProps {
  open: boolean;
  item: MediaItem | null;
  onClose: () => void;
  onSave: (draft: MediaDraft) => void;
}

const types: {
  value: MediaContentType;
  label: string;
  icon: ReactNode;
}[] = [
  { value: "text", label: "Text", icon: <FileText size={14} /> },
  { value: "image", label: "Image", icon: <ImageIcon size={14} /> },
  { value: "audio", label: "Audio", icon: <AudioLines size={14} /> },
  { value: "video", label: "Video", icon: <Video size={14} /> },
  { value: "youtube", label: "YouTube", icon: <Play size={14} /> },
];

export default function MediaModal({
  open,
  item,
  onClose,
  onSave,
}: MediaModalProps) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [contentType, setContentType] =
    useState<MediaContentType>(item?.contentType ?? "text");
  const [textContent, setTextContent] = useState(
    item?.textContent ?? ""
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    item?.youtubeUrl ?? ""
  );
  const [fileName, setFileName] = useState(item?.fileName ?? "");
  const [file, setFile] = useState<File | null>(null);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {item ? "Edit Media Item" : "Add Media Item"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add supporting content and optionally link it to selected text.
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
              Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Demonstration video"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Content Type
            </label>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setContentType(type.value)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    contentType === type.value
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {contentType === "text" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Text Content
              </label>
              <textarea
                value={textContent}
                onChange={(event) =>
                  setTextContent(event.target.value)
                }
                rows={5}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter supporting text..."
              />
            </div>
          )}

          {contentType === "youtube" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                YouTube URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          )}

          {contentType !== "text" && contentType !== "youtube" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Upload File
              </label>
              <input
                type="file"
                accept={
                  contentType === "image"
                    ? "image/*"
                    : contentType === "audio"
                      ? "audio/*"
                      : "video/*"
                }
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setFile(file ?? null);
                  setFileName(file?.name ?? "");
                }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              {fileName ? (
                <p className="mt-2 text-xs text-slate-500">
                  Selected file: {fileName}
                </p>
              ) : null}
            </div>
          )}

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
                  contentType,
                  textContent,
                  youtubeUrl,
                  fileName,
                  file,
                })
              }
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Save Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
