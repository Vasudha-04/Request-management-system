"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [role, setRole] = useState("CREATOR");

  const fetchRequests = async () => {
    const res = await fetch("/api/requests");
    const data = await res.json();
    setRequests(data);
  };

  const createRequest = async () => {
    await fetch("/api/requests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ title, description, userId: "user1" }),
  }); 
    setTitle("");
    setDescription("");
    fetchRequests();
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/requests", {
      method: "PUT",
      body: JSON.stringify({ id, status, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error); // show backend error
    }

    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ... (keep your existing imports, states, and functions at the top)

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-900">
        Request Management System
      </h1>

      {/* --- Section 1: Controls (Role & Create) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        
        {/* Role Selector Card */}
        <div className="md:col-span-1 bg-white p-6 shadow-lg rounded-2xl border border-gray-100 flex flex-col justify-center">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Active Role
          </label>
          <select
            className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="CREATOR">Creator (Submit & Cancel)</option>
            <option value="REVIEWER">Reviewer (Approve & Reject)</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Switching roles changes which actions you can perform below.
          </p>
        </div>

        {/* Create Request Card */}
        <div className="md:col-span-2 bg-white p-6 shadow-lg rounded-2xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-5 text-gray-800">Create New Request</h2>
          
          <div className="flex flex-col gap-4">
            {/* Title */}
            <input
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Request Title (e.g., Annual Leave Request)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            {/* Description */}
            <textarea
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              placeholder="Provide more details or reasons..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            
            {/* Action Button */}
            <button
              className="w-full md:w-auto self-end bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition duration-150 shadow-md hover:shadow-lg"
              onClick={createRequest}
            >
              Initialize Request
            </button>
          </div>
        </div>
      </div>


      {/* --- Section 2: Request List --- */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-gray-200 pb-3">
          All Requests
        </h2>

        {requests.length === 0 && (
          <div className="text-center bg-white p-12 rounded-2xl shadow-inner border border-dashed border-gray-300">
            <p className="text-2xl font-semibold text-gray-400">No requests submitted yet.</p>
            <p className="text-gray-500 mt-2">Use the form above to get started.</p>
          </div>
        )}

        <ul className="space-y-6">
          {requests.map((r) => (
            <li key={r.id} className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover:border-blue-100 transition hover:shadow-2xl">
              
              {/* Header: Title, Status, and Meta */}
              <div className="flex justify-between items-start gap-4 mb-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Request ID: {r.id.substring(0, 8)}... | Created by: <span className="font-medium text-gray-700">{r.createdBy || "user1"}</span>
                  </p>
                </div>
                
                {/* Status Badge */}
                <span
                  className={`inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-inner 
                    ${
                      r.status === "DRAFT"
                        ? "bg-gray-100 text-gray-700"
                        : r.status === "SUBMITTED"
                        ? "bg-blue-100 text-blue-800"
                        : r.status === "APPROVED"
                        ? "bg-green-100 text-green-900"
                        : "bg-red-100 text-red-900" // Cancelled / Rejected
                    }`}
                >
                  {r.status}
                </span>
              </div>

              {/* Description Body */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {r.description || <span className="text-gray-400 italic">No description provided.</span>}
                </p>
              </div>

              {/* Action Buttons: Conditional Logic */}
              <div className="mt-5 flex gap-3 flex-wrap pt-4 border-t border-gray-100">
                {role === "CREATOR" && r.status === "DRAFT" && (
                  <button
                    className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition"
                    onClick={() => updateStatus(r.id, "SUBMITTED")}
                  >
                    Submit for Review
                  </button>
                )}

                {role === "CREATOR" && r.status !== "APPROVED" && r.status !== "CANCELLED" && (
                  <button
                    className="bg-white text-red-600 font-semibold px-5 py-2.5 rounded-xl border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition"
                    onClick={() => updateStatus(r.id, "CANCELLED")}
                  >
                    Cancel Request
                  </button>
                )}

                {role === "REVIEWER" && r.status === "SUBMITTED" && (
                  <>
                    <button
                      className="bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-green-800 transition"
                      onClick={() => updateStatus(r.id, "APPROVED")}
                    >
                      Approve Request
                    </button>
                    <button
                      className="bg-yellow-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-yellow-600 transition"
                      onClick={() => updateStatus(r.id, "REJECTED")}
                    >
                      Reject Request
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}