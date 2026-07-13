"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  CreditCard,
  Loader2,
  X,
  ImageIcon,
  CalendarDays,
} from "lucide-react";

import {
  getPaymentInstructions,
  createPaymentInstruction,
  updatePaymentInstruction,
  deletePaymentInstruction,
} from "@/services/admin/api";
import type {
  AdminPaymentInstruction,
  PaymentInstructionCreateData,
  PaymentInstructionUpdateData,
} from "@/services/admin/types";

type FormState = {
  id: number | null;
  payment_method_name: string;
  details: string;
  image: File | null;
  imagePreview: string | null;
};

const emptyForm: FormState = {
  id: null,
  payment_method_name: "",
  details: "",
  image: null,
  imagePreview: null,
};

export default function PaymentInstructionsPage() {
  const [instructions, setInstructions] = useState<AdminPaymentInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminPaymentInstruction | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  async function loadInstructions() {
    try {
      setLoading(true);
      setError(false);
      const response = await getPaymentInstructions();
      setInstructions(response.data);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Failed to load payment instructions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadInstructions();
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const setObjectPreview = (url: string) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = url;
  };

  const openAdd = () => {
    setForm({ ...emptyForm });
  };

  const openEdit = (instruction: AdminPaymentInstruction) => {
    setForm({
      id: instruction.id,
      payment_method_name: instruction.payment_method_name,
      details: instruction.details,
      image: null,
      imagePreview: instruction.image,
    });
  };

  const closeForm = () => {
    if (saving) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setForm(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setForm((prev) =>
        prev ? { ...prev, image: null } : prev
      );
      return;
    }

    const preview = URL.createObjectURL(file);
    setObjectPreview(preview);
    setForm((prev) =>
      prev ? { ...prev, image: file, imagePreview: preview } : prev
    );
  };

  const removeImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setForm((prev) =>
      prev ? { ...prev, image: null, imagePreview: null } : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    if (!form.payment_method_name.trim()) {
      toast.error("Payment method name is required");
      return;
    }

    if (!form.details.trim()) {
      toast.error("Details are required");
      return;
    }

    try {
      setSaving(true);

      if (form.id === null) {
        const payload: PaymentInstructionCreateData = {
          payment_method_name: form.payment_method_name.trim(),
          details: form.details.trim(),
          image: form.image,
        };

        const response = await createPaymentInstruction(payload);
        toast.success(response.message || "Payment instruction created successfully");
      } else {
        const payload: PaymentInstructionUpdateData = {
          payment_method_name: form.payment_method_name.trim(),
          details: form.details.trim(),
        };

        if (form.image) {
          payload.image = form.image;
        }

        const response = await updatePaymentInstruction(form.id, payload);
        toast.success(response.message || "Payment instruction updated successfully");
      }

      closeForm();
      void loadInstructions();
    } catch (err) {
      console.error(err);
      toast.error(
        form.id === null
          ? "Failed to create payment instruction"
          : "Failed to update payment instruction"
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const response = await deletePaymentInstruction(deleteTarget.id);
      toast.success(response.message || "Payment instruction deleted successfully");
      setDeleteTarget(null);
      void loadInstructions();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete payment instruction");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <CreditCard className="text-blue-600" size={28} />
            <h1 className="text-xl font-bold text-slate-900">
              Payment Instructions
            </h1>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Manage payment methods and instructions
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Payment Instruction
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20">
          <Loader2 className="mx-auto text-slate-400 animate-spin" size={32} />
          <p className="mt-3 text-center text-sm text-slate-500">
            Loading payment instructions...
          </p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <FileText className="mx-auto text-slate-300" size={48} />
          <p className="mt-3 text-sm text-slate-500">
            Could not load payment instructions.
          </p>
          <button
            onClick={() => void loadInstructions()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Try Again
          </button>
        </div>
      ) : instructions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <CreditCard className="mx-auto text-slate-300" size={48} />
          <p className="mt-3 text-sm text-slate-500">
            No payment instructions yet. Add one to get started.
          </p>
          <button
            onClick={openAdd}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Payment Instruction
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {instructions.map((instruction) => (
            <div
              key={instruction.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {instruction.payment_method_name}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(instruction)}
                    className="p-2 rounded-xl text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(instruction)}
                    className="p-2 rounded-xl text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {instruction.image ? (
                <img
                  src={instruction.image}
                  alt={`${instruction.payment_method_name} instructions`}
                  className="mt-4 h-40 w-full rounded-xl border border-slate-200 object-contain bg-slate-50"
                />
              ) : (
                <div className="mt-4 flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <ImageIcon className="text-slate-300" size={32} />
                </div>
              )}

              <p className="mt-4 flex-1 whitespace-pre-wrap break-words text-sm text-slate-600">
                {instruction.details}
              </p>

              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-400">
                <CalendarDays size={14} />
                <span>Created {formatDate(instruction.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                {form.id === null ? "Add Payment Instruction" : "Edit Payment Instruction"}
              </h2>
              <button
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-60"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method Name
                </label>
                <input
                  type="text"
                  value={form.payment_method_name}
                  onChange={(e) =>
                    setForm({ ...form, payment_method_name: e.target.value })
                  }
                  placeholder="e.g. Bkash, Nagad, Bank Transfer"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Details
                </label>
                <textarea
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  placeholder="Enter payment instructions, account number, etc."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Image (QR code or instructions)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full cursor-pointer rounded-xl border border-slate-200 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />

                {form.imagePreview && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-lg border border-slate-200 object-contain bg-slate-50"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-700">
                        {form.image ? form.image.name : "Current image"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {form.image ? "New image selected" : "Existing image"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {!form.imagePreview && (
                  <div className="mt-3 flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                    <ImageIcon className="text-slate-300" size={28} />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : form.id === null
                    ? "Create"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete Payment Instruction?
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-medium text-slate-700">
                  {deleteTarget.payment_method_name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  if (deleting) return;
                  setDeleteTarget(null);
                }}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
