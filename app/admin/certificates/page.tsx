"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Award, Copy, Search, Loader2, RefreshCw } from "lucide-react";

import { getCertificates } from "@/services/admin/api";
import type { AdminCertificate } from "@/services/admin/types";

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function truncateCode(code: string, maxLen = 20): string {
  if (code.length <= maxLen) return code;
  return `${code.slice(0, maxLen)}...`;
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCertificates();
      setCertificates(data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load certificates");
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = useMemo(() => {
    if (!search.trim()) return certificates;

    const query = search.toLowerCase().trim();

    return certificates.filter((cert) => {
      const userName = cert.user.full_name.toLowerCase();
      const userEmail = cert.user.email.toLowerCase();
      const courseName = cert.course.name.toLowerCase();
      const certCode = cert.certificate_code.toLowerCase();

      return (
        userName.includes(query) ||
        userEmail.includes(query) ||
        courseName.includes(query) ||
        certCode.includes(query)
      );
    });
  }, [certificates, search]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success("Certificate code copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy certificate code");
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Award className="text-blue-600" size={30} />
            <h1 className="text-xl font-bold text-slate-900">
              Certificates
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-xs text-slate-500">
            Manage issued certificates
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user email, name, course name, or certificate code..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {error && !loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={loadCertificates}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Certificate Code
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Issued At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading && certificates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <Loader2 className="mx-auto text-slate-400 animate-spin" size={32} />
                      <p className="mt-3 text-sm text-slate-500">Loading certificates...</p>
                    </td>
                  </tr>
                ) : filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <Award className="mx-auto text-slate-300" size={48} />
                      <p className="mt-3 text-sm text-slate-500">
                        {search ? "No certificates match your search." : "No certificates found."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map((cert) => (
                    <tr
                      key={cert.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm font-medium text-slate-900">
                            {cert.user.full_name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {cert.user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {cert.course.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600 font-mono">
                            {truncateCode(cert.certificate_code)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(cert.certificate_code)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Copy certificate code"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatDateTime(cert.issued_at)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
