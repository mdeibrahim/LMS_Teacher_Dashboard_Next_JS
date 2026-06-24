type SaveStatusTone = "idle" | "dirty" | "saving" | "success" | "error";

interface SaveStatusProps {
  tone: SaveStatusTone;
  message: string;
}

const toneClasses: Record<SaveStatusTone, string> = {
  idle: "bg-slate-100 text-slate-600 border-slate-200",
  dirty: "bg-amber-50 text-amber-700 border-amber-200",
  saving: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

export default function SaveStatus({ tone, message }: SaveStatusProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          tone === "error"
            ? "bg-red-500"
            : tone === "saving"
              ? "bg-blue-500"
              : tone === "success"
                ? "bg-emerald-500"
                : tone === "dirty"
                  ? "bg-amber-500"
                  : "bg-slate-400"
        }`}
      />
      {message}
    </div>
  );
}
