export type MediaContentType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "youtube";

export interface MediaItem {
  id: number;
  resourceId?: number;
  title: string;
  contentType: MediaContentType;
  textContent: string;
  youtubeUrl: string;
  fileName: string;
}

export interface MediaDraft {
  title: string;
  contentType: MediaContentType;
  textContent: string;
  youtubeUrl: string;
  fileName: string;
  file: File | null;
}