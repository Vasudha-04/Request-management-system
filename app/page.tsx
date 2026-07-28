"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Helpers ───

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-300",
  SUBMITTED: "bg-blue-100 text-blue-800 ring-blue-300",
  APPROVED: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  REJECTED: "bg-red-100 text-red-900 ring-red-300",
  CANCELLED: "bg-orange-100 text-orange-900 ring-orange-300",
};

interface RequestItem {
  id: string;
  title: string;
  description: string;
  status: string;
  createdBy: string;
}

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [role, setRole] = useState<"CREATOR" | "REVIEWER">("CREATOR");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null); // tracks which action is in progress
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss error after 4s
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/requests");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRequests(data);
    } catch {
      setError("Could not load requests. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setSubmitting("create");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, userId: "user1" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Creation failed");
      }
      setTitle("");
      setDescription("");
      await fetchRequests();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setSubmitting(`${id}-${status}`);
    try {
      const res = await fetch("/api/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }
      await fetchRequests();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(null);
    }
  };

  const isPending = (key: string) => submitting === key;
  const anyPending = submitting !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ─── Toast Error ─── */}
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
          <div className="flex items-center gap-3 bg-white border border-red-200 shadow-lg rounded-xl px-5 py-3.5">
            <svg
              className="w-5 h-5 text-red-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-400 hover:text-red-600 transition"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* ─── Header ─── */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-200">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Request Management
          </h1>
          <p className="mt-2 text-slate-500 text-sm sm:text-base">
            Submit requests, review submissions, and track approvals.
          </p>
        </header>

        {/* ─── Role Selector + Create Form ─── */}
        <section className="mb-10 space-y-6">
          {/* Role Selector */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <label htmlFor="role-select" className="block text-sm font-semibold text-slate-600 mb-2">
              Active Role
            </label>
            <select
              id="role-select"
              className="w-full sm:w-72 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value as "CREATOR" | "REVIEWER")}
            >
              <option value="CREATOR">Creator — Submit &amp; Cancel</option>
              <option value="REVIEWER">Reviewer — Approve &amp; Reject</option>
            </select>
            <p className="text-xs text-slate-400 mt-2">
              Actions are filtered based on your selected role.
            </p>
          </div>

          {/* Create Request */}
          {role === "CREATOR" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Create New Request</h2>
              <div className="space-y-4">
                <input
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition placeholder:text-slate-400"
                  placeholder="Request title (e.g., Annual Leave)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={anyPending}
                />
                <textarea
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none placeholder:text-slate-400"
                  placeholder="Provide details or reasons..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={anyPending}
                />
                <div className="flex justify-end">
                  <button
                    className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    onClick={createRequest}
                    disabled={anyPending || !title.trim() || !description.trim()}
                  >
                    {isPending("create") ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Create Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ─── Request List ─── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-slate-800">Requests</h2>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
              {requests.length}
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg className="animate-spin h-8 w-8 mb-3 text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm font-medium">Loading requests...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && requests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25-2.25M12 13.875V7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0Z" />
              </svg>
              <p className="text-lg font-semibold text-slate-500">No requests yet</p>
              <p className="text-sm text-slate-400 mt-1">
                {role === "CREATOR"
                  ? "Use the form above to submit your first request."
                  : "Switch to Creator role to submit a request."}
              </p>
            </div>
          )}

          {/* Request Cards */}
          {!loading && requests.length > 0 && (
            <ul className="space-y-4">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">{r.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ID: {r.id.substring(0, 8)}&hellip; &middot; by{" "}
                        <span className="font-medium text-slate-600">{r.createdBy}</span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ring-1 ring-inset ${
                        STATUS_STYLES[r.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    {r.description ? (
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        {r.description}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        No description provided.
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    {role === "CREATOR" && r.status === "DRAFT" && (
                      <button
                        className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        onClick={() => updateStatus(r.id, "SUBMITTED")}
                        disabled={anyPending}
                      >
                        {isPending(`${r.id}-SUBMITTED`) ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                        Submit
                      </button>
                    )}

                    {role === "CREATOR" && r.status !== "APPROVED" && r.status !== "CANCELLED" && (
                      <button
                        className="inline-flex items-center gap-1.5 bg-white text-red-600 text-sm font-semibold px-4 py-2 rounded-xl border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => updateStatus(r.id, "CANCELLED")}
                        disabled={anyPending}
                      >
                        {isPending(`${r.id}-CANCELLED`) ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        )}
                        Cancel
                      </button>
                    )}

                    {role === "REVIEWER" && r.status === "SUBMITTED" && (
                      <>
                        <button
                          className="inline-flex items-center gap-1.5 bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          onClick={() => updateStatus(r.id, "APPROVED")}
                          disabled={anyPending}
                        >
                          {isPending(`${r.id}-APPROVED`) ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          )}
                          Approve
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          onClick={() => updateStatus(r.id, "REJECTED")}
                          disabled={anyPending}
                        >
                          {isPending(`${r.id}-REJECTED`) ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          )}
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

