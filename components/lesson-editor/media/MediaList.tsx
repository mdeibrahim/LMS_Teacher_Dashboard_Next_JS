"use client";

import {
  AudioLines,
  FileText,
  Image as ImageIcon,
  Link2,
  Pencil,
  Play,
  Plus,
  Trash2,
  Video,
} from "lucide-react";

import type { MediaContentType, MediaItem } from "../types";

interface MediaListProps {
  mediaItems: MediaItem[];
  onAddMedia: () => void;
  onEditMedia: (mediaId: number) => void;
  onDeleteMedia: (mediaId: number) => void;
}

const contentTypeIcon: Record<MediaContentType, React.ElementType> = {
  text: FileText,
  image: ImageIcon,
  audio: AudioLines,
  video: Video,
  youtube: Play,
};

const contentTypeLabel: Record<MediaContentType, string> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  video: "Video",
  youtube: "YouTube",
};

export default function MediaList({
  mediaItems,
  onAddMedia,
  onEditMedia,
  onDeleteMedia,
}: MediaListProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Link2 size={16} className="text-blue-600" />
            Linked Media
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Items you attach here can be linked to highlighted text in the
            lesson body.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddMedia}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
        >
          <Plus size={14} />
          Add Media
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {mediaItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
            No media linked yet. Add one, or highlight text in the editor
            and click &ldquo;Link Media&rdquo;.
          </p>
        ) : (
          mediaItems.map((item) => {
            const Icon = contentTypeIcon[item.contentType];

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    <Icon size={15} />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {item.title || "Untitled"}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      {contentTypeLabel[item.contentType]}
                      {item.fileName ? ` · ${item.fileName}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditMedia(item.id)}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                    title="Edit media"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteMedia(item.id)}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    title="Remove media"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}