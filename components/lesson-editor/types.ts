export type MediaContentType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "youtube";

export interface MediaItem {
  id: number;
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
}

export interface AccordionSection {
  id: number;
  title: string;
  content: string;
  isOpenByDefault: boolean;
}

export interface AccordionDraft {
  title: string;
  content: string;
  isOpenByDefault: boolean;
}
