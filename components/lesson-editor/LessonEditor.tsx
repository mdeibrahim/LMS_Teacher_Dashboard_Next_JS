"use client";

import { useEffect, useRef, useState } from "react";
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
  getLessons,
} from "@/services/lesson";
import {
  getModules,
  type Module,
} from "@/services/module";

import AccordionModal from "./accordion/AccordionModal";
import EditorToolbar from "./EditorToolbar";
import LessonContent from "./LessonContent";
import SaveStatus from "./SaveStatus";
import MediaModal from "./media/MediaModal";
import type {
  AccordionDraft,
  AccordionSection,
  MediaDraft,
  MediaItem,
} from "./types";

type SaveTone = "idle" | "dirty" | "saving" | "success" | "error";

interface LessonEditorProps {
  initialCourseId?: number;
  initialModuleId?: number;
}

function buildMetadataMarkup({
  mediaItems,
  accordionSections,
}: {
  mediaItems: MediaItem[];
  accordionSections: AccordionSection[];
}) {
  const payload = {
    mediaItems,
    accordionSections,
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

export default function LessonEditor({
  initialCourseId,
  initialModuleId,
}: LessonEditorProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const nextItemIdRef = useRef(1);
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
  const [saving, setSaving] = useState(false);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [accordionSections, setAccordionSections] = useState<
    AccordionSection[]
  >([]);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [accordionModalOpen, setAccordionModalOpen] = useState(false);
  const [editingMediaItem, setEditingMediaItem] =
    useState<MediaItem | null>(null);
  const [editingAccordionItem, setEditingAccordionItem] =
    useState<AccordionSection | null>(null);

  const activeCourseId = selectedCourseId ?? courses[0]?.id ?? null;
  const activeModuleId = selectedModuleId ?? modules[0]?.id ?? null;

  const selectedCourse =
    courses.find((course) => course.id === activeCourseId) ?? null;
  const selectedModule =
    modules.find((module) => module.id === activeModuleId) ?? null;

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
  }, [activeModuleId]);

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

  const executeCommand = (command: string, value: string | null = null) => {
    if (!contentRef.current) {
      return;
    }

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

  const insertMediaLink = (mediaId: number) => {
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
      "inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-blue-700";
    span.dataset.mediaId = String(mediaId);
    span.textContent = text;

    range.deleteContents();
    range.insertNode(span);
    selection.removeAllRanges();
    markDirty();
    return true;
  };

  const openMediaModal = () => {
    setEditingMediaItem(null);
    setMediaModalOpen(true);
  };

  const openAccordionModal = () => {
    setEditingAccordionItem(null);
    setAccordionModalOpen(true);
  };

  const handleMediaSave = (draft: MediaDraft) => {
    if (!draft.title) {
      toast.error("Media title is required");
      return;
    }

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
      title: draft.title,
      contentType: draft.contentType,
      textContent: draft.textContent,
      youtubeUrl: draft.youtubeUrl,
      fileName: draft.fileName || nextFile?.name || "",
    };

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

    setMediaModalOpen(false);
    setEditingMediaItem(null);
    markDirty();
  };

  const handleAccordionSave = (draft: AccordionDraft) => {
    if (!draft.title) {
      toast.error("Section title is required");
      return;
    }

    const nextSection: AccordionSection = {
      id: editingAccordionItem?.id ?? nextItemIdRef.current++,
      title: draft.title,
      content: draft.content,
      isOpenByDefault: draft.isOpenByDefault,
    };

    setAccordionSections((current) => {
      const existingIndex = current.findIndex(
        (item) => item.id === nextSection.id
      );

      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = nextSection;
        return next;
      }

      return [...current, nextSection];
    });

    setAccordionModalOpen(false);
    setEditingAccordionItem(null);
    markDirty();
  };

  const startEditingMedia = (mediaId: number) => {
    const item = mediaItems.find((entry) => entry.id === mediaId) ?? null;
    setEditingMediaItem(item);
    setMediaModalOpen(true);
  };

  const startEditingAccordion = (sectionId: number) => {
    const item =
      accordionSections.find((entry) => entry.id === sectionId) ?? null;
    setEditingAccordionItem(item);
    setAccordionModalOpen(true);
  };

  const deleteMediaItem = (mediaId: number) => {
    setMediaItems((current) =>
      current.filter((item) => item.id !== mediaId)
    );
    markDirty();
  };

  const deleteAccordionItem = (sectionId: number) => {
    setAccordionSections((current) =>
      current.filter((item) => item.id !== sectionId)
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

      const composedBody = `${contentRef.current?.innerHTML ?? ""}${buildMetadataMarkup({
        mediaItems,
        accordionSections,
      })}`;

      await createLesson(activeModuleId, {
        title: title.trim(),
        body_content: composedBody,
        order,
        is_published: isPublished,
        mediaItems,
        accordionSections,
        mediaFiles: mediaFilesRef.current,
      });

      setStatusTone("success");
      setStatusMessage("Lesson saved");
      toast.success("Lesson created successfully");

      setTimeout(() => {
        router.push("/manage-content/modules");
      }, 800);
    } catch (error) {
      console.error("Failed to create lesson", error);
      setStatusTone("error");
      setStatusMessage("Failed to save lesson");
      toast.error("Failed to create lesson");
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
              onClick={() => router.push("/manage-content/modules")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 transition hover:border-blue-200 hover:text-blue-700"
            >
              <ArrowLeft size={14} />
              Back to Modules
            </button>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Add Lesson
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Build a lesson with the same rich-editor workflow from the
            content studio, then publish it to a selected module.
          </p>
        </div>

        <SaveStatus tone={statusTone} message={statusMessage} />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Courses</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {courses.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Modules</p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-600">
            {moduleLoading ? "..." : modules.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Next Order</p>
          <h2 className="mt-2 text-3xl font-bold text-amber-600">
            {lessonsLoading ? "..." : order}
          </h2>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
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

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
            className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_180px]">
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(event) => {
                    setOrder(Number(event.target.value));
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) => {
                  setIsPublished(event.target.checked);
                  markDirty();
                }}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Publish lesson immediately
            </label>

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

                <button
                  type="button"
                  onClick={() => {
                    contentRef.current?.focus();
                    saveSelection();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <ShieldCheck size={14} />
                  Capture Selection
                </button>
              </div>

              <EditorToolbar
                onSaveSelection={saveSelection}
                onBold={() => executeCommand("bold")}
                onItalic={() => executeCommand("italic")}
                onUnderline={() => executeCommand("underline")}
                onList={() => executeCommand("insertUnorderedList")}
                onHighlight={handleHighlight}
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

              <LessonContent
                ref={contentRef}
                value=""
                onChange={markDirty}
                onFocusSelection={saveSelection}
                onBlurSelection={markDirty}
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
                {saving ? "Saving..." : "Save Lesson"}
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Media Library
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Link selected text to media cards stored with the lesson.
                </p>
              </div>

              <button
                type="button"
                onClick={openMediaModal}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {mediaItems.length ? (
                mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.contentType}
                          {item.fileName ? ` • ${item.fileName}` : ""}
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                        {item.contentType}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditingMedia(item.id)}
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMediaItem(item.id)}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!insertMediaLink(item.id)) {
                            toast.error("Select text in the editor first");
                          } else {
                            toast.success("Media linked to selected text");
                          }
                        }}
                        className="rounded-full border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                      >
                        Link selection
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  No media items yet. Add text, image, audio, video, or YouTube
                  resources to link from the body editor.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Accordion Sections
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Keep expandable notes and supporting explanations in one
                  place.
                </p>
              </div>

              <button
                type="button"
                onClick={openAccordionModal}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {accordionSections.length ? (
                accordionSections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {section.title}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          {section.isOpenByDefault
                            ? "Open by default"
                            : "Collapsed by default"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setAccordionSections((current) =>
                            current.map((item) =>
                              item.id === section.id
                                ? {
                                    ...item,
                                    isOpenByDefault: !item.isOpenByDefault,
                                  }
                                : item
                            )
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-white"
                      >
                        {section.isOpenByDefault ? (
                          <ChevronDown size={12} />
                        ) : (
                          <ChevronRight size={12} />
                        )}
                        Toggle
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditingAccordion(section.id)}
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAccordionItem(section.id)}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  No accordion sections yet. Add collapsible sections to mirror
                  the richer lesson editor workflow.
                </div>
              )}
            </div>
          </div>
        </aside>
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
      />

      <AccordionModal
        key={`accordion-${accordionModalOpen ? "open" : "closed"}-${editingAccordionItem?.id ?? "new"}`}
        open={accordionModalOpen}
        item={editingAccordionItem}
        onClose={() => {
          setAccordionModalOpen(false);
          setEditingAccordionItem(null);
        }}
        onSave={handleAccordionSave}
      />
    </div>
  );
}
