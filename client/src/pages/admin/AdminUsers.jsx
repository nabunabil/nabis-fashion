import React, { useState, useEffect } from "react";
import { Users, Search, Mail } from "lucide-react";
import { api } from "../../lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination state (15 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("page", String(currentPage));
      query.set("limit", "15"); // 15 users per page
      if (search.trim()) query.set("search", search.trim());

      const res = await api.get(`/user/admin/users?${query.toString()}`);
      if (res?.success && Array.isArray(res.data)) {
        setUsers(res.data);
        setTotalUsers(res.totalUsers || res.data.length);
        setTotalPages(res.totalPages || 1);
      } else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error loading users from server:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
          Customer Directory
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          View registered clients, account roles, and contact options
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-premium flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or email address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl text-xs text-[#111827] placeholder-[#6B7280] outline-none focus:border-[#21453A]/40 transition-colors"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card-premium space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#21453A]"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-[#6B7280]">
            <Users className="w-10 h-10 mx-auto text-[#ECECEC] mb-2" />
            <p className="text-xs font-semibold">No registered customers found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#ECECEC] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECECEC] text-[#111827]">
                  {users.map((u) => {
                    const isAdmin = u.role?.toLowerCase() === "admin";
                    return (
                      <tr key={u.id} className="hover:bg-[#F7F8FA] transition-colors group">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {u.image ? (
                              <img
                                src={u.image}
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover border border-[#ECECEC]"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#21453A] text-white flex items-center justify-center font-bold text-xs">
                                {(u.name || "U").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-[#111827]">{u.name}</p>
                              <p className="text-[10px] text-[#6B7280]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#6B7280]">
                          {u.phone || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              isAdmin
                                ? "bg-[#FAF6EE] text-[#B88A2E] border border-[#B88A2E]/20"
                                : "bg-[#F7F8FA] text-[#6B7280] border border-[#ECECEC]"
                            }`}
                          >
                            {u.role || "User"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-[#DCFCE7] text-[#15803D] rounded-full text-[10px] font-bold">
                            {u.status || "Active"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#6B7280]">
                          {new Date(u.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={`mailto:${u.email}`}
                            className="px-3 py-1.5 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl text-xs font-semibold text-[#111827] hover:bg-[#21453A] hover:text-white transition-colors inline-flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5" /> Email Client
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Server-Side Pagination Bar (15 users per page) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#ECECEC] bg-[#FAFAF8] rounded-b-2xl">
                <span className="text-xs text-[#6B7280]">
                  Showing Page <strong className="text-[#111827]">{currentPage}</strong> of{" "}
                  <strong className="text-[#111827]">{totalPages}</strong> ({totalUsers} Registered Clients)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-[#ECECEC] bg-white rounded-xl text-xs font-bold text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8FA]"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pg
                          ? "bg-[#21453A] text-white shadow-sm font-black"
                          : "bg-white border border-[#ECECEC] text-[#111827] hover:border-[#21453A]"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 border border-[#ECECEC] bg-white rounded-xl text-xs font-bold text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8FA]"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
