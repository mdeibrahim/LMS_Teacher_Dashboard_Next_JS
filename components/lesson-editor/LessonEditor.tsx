"use client";

import { useEffect, useRef, useState } from "react";
import { type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { getCourses, type Course } from "@/services/courses";
import {
  createLesson,
  getLesson,
  getLessons,
  updateLesson,
  type ResourcePayload,
} from "@/services/lesson";
import { getNextResourceId } from "@/services/resource";
import {
  getModules,
  type Module,
} from "@/services/module";

import EditorToolbar from "./EditorToolbar";
import LessonContent, { lessonContentMarksStyles } from "./LessonContent";
import SaveStatus from "./SaveStatus";
import MediaModal from "./media/MediaModal";
import MediaList from "./media/MediaList";
import type {
  MediaDraft,
  MediaItem,
} from "./types";
import {
  buildLegacyToContentIdMap,
  buildLinkedResourceAttributes,
  extractLessonSaveArtifacts,
  findMediaItemByLinkedId,
  getLinkedResourceIdFromTarget,
  repairLegacyLinkedMediaHtml,
} from "@/lib/lesson-media-link";

type SaveTone = "idle" | "dirty" | "saving" | "success" | "error";

interface LessonEditorProps {
  initialCourseId?: number;
  initialModuleId?: number;
  initialLessonId?: number;
}

function buildMetadataMarkup({
  mediaItems,
}: {
  mediaItems: MediaItem[];
}) {
  const payload = {
    mediaItems,
  };

  const json = JSON.stringify(payload).replace(
    /</g,
    "\\u003c"
  );

  return `<script type="application/json" data-lesson-editor-meta="true">${json}</script>`;
}

function isValidId(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeId(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function extractLessonContent(
  html: string
) {
  const metaMatch = html.match(
    /<script type="application\/json" data-lesson-editor-meta="true">([\s\S]*?)<\/script>/i
  );

  const bodyContent = metaMatch
    ? html.replace(metaMatch[0], "")
    : html;

  if (!metaMatch?.[1]) {
    return {
      bodyContent,
      mediaItems: [] as MediaItem[],
    };
  }

  try {
    const parsed = JSON.parse(metaMatch[1]) as {
      mediaItems?: MediaItem[];
    };

    return {
      bodyContent,
      mediaItems: parsed.mediaItems ?? [],
    };
  } catch (error) {
    console.warn("Failed to parse lesson metadata", error);
    return {
      bodyContent,
      mediaItems: [] as MediaItem[],
    };
  }
}

export default function LessonEditor({
  initialCourseId,
  initialModuleId,
  initialLessonId,
}: LessonEditorProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const nextItemIdRef = useRef(1);
  const nextResourceIdRef = useRef<number | null>(null);
  const mediaFilesRef = useRef<Map<number, File>>(new Map());

  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    normalizeId(initialCourseId)
  );
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(
    normalizeId(initialModuleId)
  );

  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [statusTone, setStatusTone] = useState<SaveTone>("idle");
  const [statusMessage, setStatusMessage] = useState("Ready to draft");
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [bodyContent, setBodyContent] = useState("");

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [formattingMarksVisible, setFormattingMarksVisible] = useState(false);
  const [editingMediaItem, setEditingMediaItem] =
    useState<MediaItem | null>(null);
  const editingLessonId = normalizeId(initialLessonId);
  const isEditingLesson = isValidId(editingLessonId);

  const activeCourseId = selectedCourseId ?? courses[0]?.id ?? null;
  const activeModuleId = selectedModuleId ?? modules[0]?.id ?? null;

  const selectedCourse =
    courses.find((course) => course.id === activeCourseId) ?? null;
  const selectedModule =
    modules.find((module) => module.id === activeModuleId) ?? null;

  useEffect(() => {
    let cancelled = false;

    const fetchNextResourceId = async () => {
      try {
        const nextResourceId = await getNextResourceId();
        if (!cancelled && nextResourceId) {
          nextResourceIdRef.current = nextResourceId;
        }
      } catch (error) {
        console.warn("Failed to preload next resource id", error);
      }
    };

    void fetchNextResourceId();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses", error);
        toast.error("Failed to load courses");
        setStatusTone("error");
        setStatusMessage("Unable to load courses");
      } finally {
        setLoading(false);
      }
    };

    void fetchCourses();
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      if (!isValidId(activeCourseId)) {
        setModules([]);
        return;
      }

      try {
        setModuleLoading(true);
        const data = await getModules(activeCourseId);
        setModules(data);
      } catch (error) {
        console.error("Failed to load modules", error);
        toast.error("Failed to load modules for this course");
        setStatusTone("error");
        setStatusMessage("Unable to load modules");
        setModules([]);
      } finally {
        setModuleLoading(false);
      }
    };

    void fetchModules();
  }, [activeCourseId]);

  useEffect(() => {
    const fetchLessonCount = async () => {
      if (isEditingLesson) {
        return;
      }

      if (!isValidId(activeModuleId)) {
        return;
      }

      try {
        setLessonsLoading(true);
        const lessons = await getLessons(activeModuleId);
        setOrder(lessons.length + 1);
      } catch (error) {
        console.error("Failed to load lessons", error);
      } finally {
        setLessonsLoading(false);
      }
    };

    void fetchLessonCount();
  }, [activeModuleId, isEditingLesson]);

  useEffect(() => {
    let cancelled = false;

    const fetchLesson = async () => {
      if (!isEditingLesson) {
        return;
      }

      try {
        setLessonLoading(true);
        const data = await getLesson(editingLessonId as number);

        if (cancelled) {
          return;
        }

        const extracted = extractLessonContent(data.body_content);

        setTitle(data.title);
        setOrder(data.order);
        setIsPublished(data.is_published);
        setBodyContent(extracted.bodyContent);
        setMediaItems(extracted.mediaItems);
        nextItemIdRef.current =
          Math.max(
            0,
            ...extracted.mediaItems.map((item) => item.id)
          ) + 1;

        if (data.course_id && !initialCourseId) {
          setSelectedCourseId(data.course_id);
        }
        if (data.module && !initialModuleId) {
          setSelectedModuleId(data.module);
        }

        setStatusTone("idle");
        setStatusMessage("Lesson loaded");
      } catch (error) {
        console.error("Failed to load lesson", error);
        toast.error("Failed to load lesson");
        setStatusTone("error");
        setStatusMessage("Unable to load lesson");
      } finally {
        if (!cancelled) {
          setLessonLoading(false);
        }
      }
    };

    void fetchLesson();

    return () => {
      cancelled = true;
    };
  }, [editingLessonId, isEditingLesson, initialCourseId, initialModuleId]);

  const markDirty = () => {
    setStatusTone("dirty");
    setStatusMessage("Unsaved changes");
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (
      contentRef.current &&
      contentRef.current.contains(range.commonAncestorContainer)
    ) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = savedRangeRef.current;

    if (!selection || !range) {
      return false;
    }

    selection.removeAllRanges();
    selection.addRange(range);

    return true;
  };

  const executeCommand = (command: string, value?: string) => {
    if (!contentRef.current) {
      return;
    }

    contentRef.current.focus();

    const result = document.execCommand(command, false, value);
    if (result) {
      markDirty();
    }
  };

  // Same as executeCommand, but re-applies the saved selection first. Needed
  // for anything that opens a dropdown menu before the value is picked,
  // since opening the menu can steal focus away from the editable region.
  const applyCommandWithSelection = (command: string, value?: string) => {
    if (!contentRef.current) {
      return;
    }

    restoreSelection();
    contentRef.current.focus();

    const result = document.execCommand(command, false, value);
    if (result) {
      markDirty();
    }
  };

  const handleHighlight = () => {
    if (!restoreSelection()) {
      return;
    }

    const highlighted =
      document.execCommand("hiliteColor", false, "#fde68a") ||
      document.execCommand("backColor", false, "#fde68a");

    if (highlighted) {
      markDirty();
    }
  };

  const handleFontFamily = (font: string) => {
    applyCommandWithSelection("fontName", font);
  };

  const handleFontSize = (execValue: string) => {
    applyCommandWithSelection("fontSize", execValue);
  };

  const handleFontColor = (color: string) => {
    applyCommandWithSelection("foreColor", color);
  };

  const handleHighlightColor = (color: string) => {
    if (!contentRef.current) {
      return;
    }

    restoreSelection();
    contentRef.current.focus();

    const applied =
      document.execCommand("hiliteColor", false, color) ||
      document.execCommand("backColor", false, color);

    if (applied) {
      markDirty();
    }
  };

  function transformCase(
    text: string,
    mode: "upper" | "lower" | "title" | "sentence"
  ) {
    switch (mode) {
      case "upper":
        return text.toUpperCase();
      case "lower":
        return text.toLowerCase();
      case "title":
        return text.replace(
          /\w\S*/g,
          (word) => word[0].toUpperCase() + word.slice(1).toLowerCase()
        );
      case "sentence": {
        const lower = text.toLowerCase();
        return lower.replace(
          /(^\s*[a-z]|[.!?]\s+[a-z])/g,
          (match) => match.toUpperCase()
        );
      }
      default:
        return text;
    }
  }

  const handleChangeCase = (
    mode: "upper" | "lower" | "title" | "sentence"
  ) => {
    if (!restoreSelection()) {
      toast("Select some text first");
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      toast("Select some text first");
      return;
    }

    const text = selection.toString();
    if (!text) {
      return;
    }

    contentRef.current?.focus();
    const transformed = transformCase(text, mode);
    const applied = document.execCommand("insertText", false, transformed);

    if (applied) {
      markDirty();
    }
  };

  const handleTextEffects = (mode: "shadow" | "outline" | "none") => {
    if (!restoreSelection()) {
      toast("Select some text first");
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      toast("Select some text first");
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");

    if (mode === "shadow") {
      span.style.textShadow = "1px 1px 2px rgba(15, 23, 42, 0.45)";
    } else if (mode === "outline") {
      span.style.setProperty("-webkit-text-stroke", "0.6px #0f172a");
    } else {
      span.style.textShadow = "none";
      span.style.setProperty("-webkit-text-stroke", "0px");
    }

    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);
    selection.removeAllRanges();
    markDirty();
  };

  const BLOCK_TAGS = [
    "P",
    "DIV",
    "LI",
    "BLOCKQUOTE",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
  ];

  function findBlockAncestor(range: Range): HTMLElement | null {
    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    let element = node as HTMLElement | null;
    while (
      element &&
      element !== contentRef.current &&
      !BLOCK_TAGS.includes(element.tagName)
    ) {
      element = element.parentElement;
    }

    return element && element !== contentRef.current ? element : null;
  }

  const handleLineHeight = (value: string) => {
    if (!restoreSelection()) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const target = findBlockAncestor(range) ?? contentRef.current;

    if (target) {
      target.style.lineHeight = value;
      markDirty();
    }
  };

  const handleShading = (color: string) => {
    if (!restoreSelection()) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const target = findBlockAncestor(range);

    if (!target) {
      toast("Click inside a paragraph first");
      return;
    }

    const isClear = color === "transparent";
    target.style.backgroundColor = isClear ? "" : color;
    target.style.borderRadius = isClear ? "" : "6px";
    target.style.padding = isClear ? "" : "4px 8px";
    markDirty();
  };

  const handleBorders = (style: "all" | "bottom" | "box" | "none") => {
    if (!restoreSelection()) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const target = findBlockAncestor(range);

    if (!target) {
      toast("Click inside a paragraph first");
      return;
    }

    target.style.border = "";
    target.style.borderBottom = "";
    target.style.padding = style === "none" ? "" : "6px 10px";

    if (style === "box") {
      target.style.border = "1px solid #cbd5e1";
    } else if (style === "bottom") {
      target.style.borderBottom = "1px solid #cbd5e1";
    } else if (style === "all") {
      target.style.border = "2px double #94a3b8";
    }

    markDirty();
  };

  const handleSort = () => {
    if (!restoreSelection()) {
      toast("Click inside a list to sort it");
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    let element = node as HTMLElement | null;
    while (
      element &&
      element !== contentRef.current &&
      element.tagName !== "UL" &&
      element.tagName !== "OL"
    ) {
      element = element.parentElement;
    }

    if (element && (element.tagName === "UL" || element.tagName === "OL")) {
      const items = Array.from(element.children) as HTMLElement[];
      items
        .sort((a, b) =>
          (a.textContent ?? "")
            .trim()
            .localeCompare((b.textContent ?? "").trim())
        )
        .forEach((item) => element!.appendChild(item));
      markDirty();
      return;
    }

    toast("Sort works inside a bulleted or numbered list");
  };

  const handleToggleFormattingMarks = () => {
    setFormattingMarksVisible((visible) => !visible);
  };

  const insertMediaLink = (item: MediaItem) => {
    if (!restoreSelection()) {
      return false;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const text = range.toString();
    if (!text.trim()) {
      return false;
    }

    const span = document.createElement("span");
    span.className =
      "inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 underline decoration-blue-300 decoration-dotted underline-offset-2 cursor-pointer hover:bg-blue-200";
    const linkedAttributes = buildLinkedResourceAttributes(
      item.resourceId ?? item.id
    );

    if (linkedAttributes["data-content-id"]) {
      span.dataset.contentId = linkedAttributes["data-content-id"];
    }
    span.contentEditable = "false";
    span.title = "Click to view linked media";
    span.textContent = text;

    range.deleteContents();
    range.insertNode(span);
    selection.removeAllRanges();
    markDirty();
    return true;
  };

  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    const mediaId = getLinkedResourceIdFromTarget(event.target);
    if (!Number.isFinite(mediaId)) {
      return;
    }

    const item = findMediaItemByLinkedId(mediaItems, mediaId);
    if (!item) {
      toast.error("Linked media could not be found");
      return;
    }

    event.preventDefault();
    setEditingMediaItem(item);
    setMediaModalOpen(true);
  };

  const openMediaModal = () => {
    // Save the current text selection so we can link it after creating the media item
    saveSelection();
    setEditingMediaItem(null);
    setMediaModalOpen(true);
  }


  const handleMediaSave = (draft: MediaDraft) => {

    const requiresFile =
      draft.contentType === "image" ||
      draft.contentType === "audio" ||
      draft.contentType === "video";

    const existingFile = editingMediaItem
      ? mediaFilesRef.current.get(editingMediaItem.id) ?? null
      : null;
    const nextFile = draft.file ?? existingFile;

    if (requiresFile && !nextFile) {
      toast.error("Please select a file for this media item");
      return;
    }

    const nextMediaItem: MediaItem = {
      id: editingMediaItem?.id ?? nextItemIdRef.current++,
      resourceId:
        editingMediaItem?.resourceId ??
        nextResourceIdRef.current ??
        undefined,
      title: draft.title,
      contentType: draft.contentType,
      textContent: draft.textContent,
      youtubeUrl: draft.youtubeUrl,
      fileName: draft.fileName || nextFile?.name || "",
    };

    if (
      nextMediaItem.resourceId == null &&
      nextResourceIdRef.current != null
    ) {
      nextMediaItem.resourceId = nextResourceIdRef.current;
      nextResourceIdRef.current += 1;
    } else if (
      editingMediaItem?.resourceId == null &&
      nextMediaItem.resourceId != null
    ) {
      nextResourceIdRef.current =
        Math.max(
          nextResourceIdRef.current ?? nextMediaItem.resourceId + 1,
          nextMediaItem.resourceId + 1
        );
    }

    setMediaItems((current) => {
      const existingIndex = current.findIndex(
        (item) => item.id === nextMediaItem.id
      );

      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = nextMediaItem;
        return next;
      }

      return [...current, nextMediaItem];
    });

    if (requiresFile && nextFile) {
      mediaFilesRef.current.set(nextMediaItem.id, nextFile);
    } else {
      mediaFilesRef.current.delete(nextMediaItem.id);
    }

    // If a text range was saved before opening the modal, insert a link to the newly created media item
    if (savedRangeRef.current) {
      if (restoreSelection()) {
        insertMediaLink(nextMediaItem);
      }
      // Clear the saved range after linking
      savedRangeRef.current = null;
    }

    setMediaModalOpen(false);
    setEditingMediaItem(null);
    markDirty();
  };

  const startEditingMedia = (mediaId: number) => {
    const item = mediaItems.find((entry) => entry.id === mediaId) ?? null;
    setEditingMediaItem(item);
    setMediaModalOpen(true);
  };

  const deleteMediaItem = (mediaId: number) => {
    setMediaItems((current) =>
      current.filter((item) => item.id !== mediaId)
    );
    markDirty();
  };

  const handleSave = async () => {
    if (!isValidId(activeModuleId)) {
      toast.error("Please select a module first");
      return;
    }

    if (!title.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    try {
      setSaving(true);
      setStatusTone("saving");
      setStatusMessage("Saving lesson...");

      const bodyHtml = contentRef.current?.innerHTML ?? "";
      let predictedNextResourceId = nextResourceIdRef.current;
      if (
        mediaItems.some((item) => item.resourceId == null) &&
        predictedNextResourceId == null
      ) {
        predictedNextResourceId = await getNextResourceId();
        if (predictedNextResourceId != null) {
          nextResourceIdRef.current = predictedNextResourceId;
        }
      }

      const mediaItemsWithResourceIds = mediaItems.map((item) => {
        if (item.resourceId != null) {
          return item;
        }

        if (predictedNextResourceId == null) {
          return item;
        }

        const resourceId = predictedNextResourceId;
        predictedNextResourceId += 1;

        return {
          ...item,
          resourceId,
        };
      });

      if (predictedNextResourceId != null) {
        nextResourceIdRef.current = predictedNextResourceId;
      }

      const composedBody = `${bodyHtml}${buildMetadataMarkup({
        mediaItems: mediaItemsWithResourceIds,
      })}`;
      const mediaFiles = Object.fromEntries(
        mediaFilesRef.current
      ) as Record<string, File>;
      const resources: ResourcePayload[] = mediaItemsWithResourceIds.map(
        (item, index) => ({
          id: item.resourceId ?? undefined,
          title: item.title,
          content_type: item.contentType,
          text_content:
            item.contentType === "text" ? item.textContent : undefined,
          external_url:
            item.contentType === "youtube"
              ? item.youtubeUrl
              : undefined,
          embed_url:
            item.contentType === "youtube"
              ? item.youtubeUrl
              : undefined,
          order: index + 1,
          is_preview: false,
          is_published: true,
          file_key:
            item.contentType === "image" ||
              item.contentType === "audio" ||
              item.contentType === "video"
              ? String(item.id)
              : undefined,
        })
      );
      console.log("Posting linked media ids:", {
        draftMediaIds: mediaItems.map((item) => item.id),
        draftResourceIds: mediaItemsWithResourceIds.map(
          (item) => item.resourceId ?? null
        ),
      });

      const lessonPayload = {
        title: title.trim(),
        body_content: composedBody,
        order,
        is_published: isPublished,
        resources,
        mediaFiles,
        module_id: activeModuleId ?? undefined,
      };

      const saveResponse = isEditingLesson
        ? await updateLesson(editingLessonId as number, lessonPayload)
        : await createLesson(activeModuleId, lessonPayload);

      const { lessonId: newLessonId, resourceIds } =
        extractLessonSaveArtifacts(saveResponse);

      const lessonId = isEditingLesson
        ? (editingLessonId as number)
        : newLessonId;

      console.log("Backend returned content ids:", {
        lessonId,
        resourceIds,
      });

      const legacyToContentIdMap = buildLegacyToContentIdMap(
        mediaItems,
        mediaItemsWithResourceIds.map((item) => item.resourceId ?? null)
      );

      if (legacyToContentIdMap.size > 0) {
        console.log(
          "Legacy to content id map:",
          Array.from(legacyToContentIdMap.entries())
        );
      }

      if (
        lessonId &&
        legacyToContentIdMap.size > 0
      ) {
        const repairedBody = repairLegacyLinkedMediaHtml(
          composedBody,
          legacyToContentIdMap
        );

        if (repairedBody !== composedBody) {
          try {
            await updateLesson(lessonId, {
              body_content: repairedBody,
            });
          } catch (patchError) {
            console.warn("Failed to repair linked media ids", patchError);
          }
        }
      }

      setStatusTone("success");
      setStatusMessage("Lesson saved");
      toast.success(
        isEditingLesson
          ? "Lesson updated successfully"
          : "Lesson created successfully"
      );

      setTimeout(() => {
        router.push("/manage-content/lessons");
      }, 800);
    } catch (error) {
      console.error("Failed to save lesson", error);
      setStatusTone("error");
      setStatusMessage("Failed to save lesson");
      toast.error(
        isEditingLesson ? "Failed to update lesson" : "Failed to create lesson"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500">Loading lesson editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <button
              type="button"
              onClick={() => router.push("/manage-content/lessons")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 transition hover:border-blue-200 hover:text-blue-700"
            >
              <ArrowLeft size={14} />
              Back to Lessons
            </button>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isEditingLesson ? "Edit Lesson" : "Edit Lesson"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            {isEditingLesson
              ? "Update the lesson content, media, and settings below."
              : "Build a lesson with the same rich-editor workflow from the content studio, then publish it to a selected module."}
          </p>
          {lessonLoading && (
            <p className="mt-1 text-xs text-blue-600">Loading lesson...</p>
          )}
        </div>

        <SaveStatus tone={statusTone} message={statusMessage} />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* 2/3 Width */}
        <div className="md:col-span-2">
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Lesson Context
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {selectedCourse ? selectedCourse.name : "Select a course"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedModule
                    ? selectedModule.title
                    : "Choose a module to attach this lesson."}
                </p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                {selectedCourse ? (
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-600" />
                    {selectedCourse.name}
                  </div>
                ) : (
                  "No course selected"
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Course
                </label>
                <select
                  value={selectedCourseId ?? activeCourseId ?? ""}
                  onChange={(event) => {
                    const nextId = Number(event.target.value);
                    setSelectedCourseId(Number.isFinite(nextId) ? nextId : null);
                    setSelectedModuleId(null);
                    setModules([]);
                    setStatusTone("dirty");
                    setStatusMessage("Course selection updated");
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Module
                </label>
                <select
                  value={selectedModuleId ?? activeModuleId ?? ""}
                  onChange={(event) => {
                    const nextId = Number(event.target.value);
                    setSelectedModuleId(Number.isFinite(nextId) ? nextId : null);
                    setStatusTone("dirty");
                    setStatusMessage("Module selection updated");
                  }}
                  disabled={!selectedCourseId || moduleLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                >
                  <option value="">
                    {moduleLoading ? "Loading modules..." : "Select module"}
                  </option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 1/3 Width */}
        <div className="gap-3 grid md:grid-rows-2">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center text-center p-0">
            <p className="text-sm text-slate-500">Total Modules</p>
            <h2 className="mt-2 text-3xl font-bold text-emerald-600">
              {moduleLoading ? "..." : modules.length}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center text-center p-0">
            <p className="text-sm text-slate-500">Next Order</p>
            <h2 className="mt-2 text-3xl font-bold text-amber-600">
              {lessonsLoading ? "..." : order}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
            className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] items-end">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Lesson Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    markDirty();
                  }}
                  placeholder="Enter lesson title"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex md:justify-end">
                <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50 md:w-auto">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(event) => {
                      setIsPublished(event.target.checked);
                      markDirty();
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Publish Lesson
                    </p>
                    
                  </div>
                </label>
              </div>
            </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Lesson Content
                </label>
                <p className="mt-1 text-xs text-slate-500">
                    Highlight text, apply formatting, link selected words to
                    media items, and store sidebar resources in the lesson body.
                  </p>
                </div>
              </div>

              <EditorToolbar
                onSaveSelection={saveSelection}
                onBold={() => executeCommand("bold")}
                onItalic={() => executeCommand("italic")}
                onUnderline={() => executeCommand("underline")}
                onList={() => executeCommand("insertUnorderedList")}
                onListOrdered={() => executeCommand("insertOrderedList")}
                onHighlight={handleHighlight}
                onFontColor={handleFontColor}
                onHighlightColor={handleHighlightColor}
                onFontSize={handleFontSize}
                onFontFamily={handleFontFamily}
                onIncreaseFontSize={() => executeCommand("fontSize", "5")}
                onDecreaseFontSize={() => executeCommand("fontSize", "2")}
                onChangeCase={handleChangeCase}
                onClearFormatting={() => executeCommand("removeFormat")}
                onTextEffects={handleTextEffects}
                onStrikethrough={() => executeCommand("strikeThrough")}
                onAlignLeft={() => executeCommand("justifyLeft")}
                onAlignCenter={() => executeCommand("justifyCenter")}
                onAlignRight={() => executeCommand("justifyRight")}
                onAlignJustify={() => executeCommand("justifyFull")}
                onIndent={() => executeCommand("indent")}
                onOutdent={() => executeCommand("outdent")}
                onSubscript={() => executeCommand("subscript")}
                onSuperscript={() => executeCommand("superscript")}
                onQuote={() => executeCommand("formatBlock", "blockquote")}
                onLineHeight={handleLineHeight}
                onShading={handleShading}
                onBorders={handleBorders}
                onSort={handleSort}
                onToggleFormattingMarks={handleToggleFormattingMarks}
                formattingMarksVisible={formattingMarksVisible}
                onOpenMedia={() => {
                  saveSelection();

                  const selectionText =
                    savedRangeRef.current?.toString().trim() ?? "";

                  if (selectionText) {
                    setMediaModalOpen(true);
                  } else {
                    toast(
                      "Select some text first if you want to link media"
                    );
                    setMediaModalOpen(true);
                  }
                }}
              />

              <style>{lessonContentMarksStyles}</style>
              <LessonContent
                ref={contentRef}
                value={bodyContent}
                onChange={markDirty}
                onFocusSelection={saveSelection}
                onBlurSelection={markDirty}
                onClick={handleContentClick}
                showFormattingMarks={formattingMarksVisible}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => router.push("/manage-content/modules")}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={14} />
                {saving
                  ? "Saving..."
                  : isEditingLesson
                    ? "Update Lesson"
                    : "Save Lesson"}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <MediaList
            mediaItems={mediaItems}
            onAddMedia={openMediaModal}
            onEditMedia={startEditingMedia}
            onDeleteMedia={deleteMediaItem}
          />
        </div>
      </div>

      <MediaModal
        key={`media-${mediaModalOpen ? "open" : "closed"}-${editingMediaItem?.id ?? "new"}`}
        open={mediaModalOpen}
        item={editingMediaItem}
        onClose={() => {
          setMediaModalOpen(false);
          setEditingMediaItem(null);
        }}
        onSave={handleMediaSave}
        onRemove={
          editingMediaItem
            ? () => {
                deleteMediaItem(editingMediaItem.id);
                setMediaModalOpen(false);
                setEditingMediaItem(null);
              }
            : undefined
        }
      />
    </div>
  );
}