import React, { useState, useEffect } from "react";
import { UserCog, Plus, Shield, Check, Mail, Clock, X, Lock, Search, UserPlus, ChevronDown, UserCheck } from "lucide-react";
import { api } from "../../lib/api";
import { authClient } from "../../lib/auth-client";
import { useModal } from "../../context/ModalContext";

export default function AdminStaff() {
  const { showAlert } = useModal();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = authClient.useSession();

  // Slide-down / Drawer State for Add Staff
  const [showAddStaffPanel, setShowAddStaffPanel] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [selectedUserToPromote, setSelectedUserToPromote] = useState(null);
  const [newStaffRole, setNewStaffRole] = useState("staff");

  // Edit Role Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("staff");
  const [updating, setUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const currentAdminEmail = session?.user?.email;

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/admin/users");
      if (res?.success) {
        setAllUsers(res.data || []);
      } else {
        setAllUsers([]);
      }
    } catch (err) {
      console.error("Error loading staff/users:", err);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  // Filter ONLY Staff Members (role === "admin" or "staff") for the main Staff Table
  const staffMembers = allUsers.filter(
    (u) => u.role?.toLowerCase() === "admin" || u.role?.toLowerCase() === "staff"
  );

  // Filter registered customer profiles available to be added as Staff
  const availableUsersToPromote = allUsers.filter(
    (u) =>
      u.role?.toLowerCase() !== "admin" &&
      u.role?.toLowerCase() !== "staff" &&
      (u.name?.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchUserQuery.toLowerCase()))
  );

  const handleOpenRoleModal = (user) => {
    if (user.email !== currentAdminEmail && user.role?.toLowerCase() === "admin") {
      showAlert({
        title: "Security Policy Enforcement",
        message: "You cannot modify or alter another Administrator profile.",
        type: "warning",
      });
      return;
    }
    setEditingUser(user);
    setSelectedRole(user.role?.toLowerCase() || "staff");
    setFeedbackMsg("");
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdating(true);
    setFeedbackMsg("");

    try {
      await api.put(`/user/admin/users/${editingUser.id}/role`, { role: selectedRole });
      setEditingUser(null);
      loadAllUsers();
    } catch (err) {
      setFeedbackMsg(err.message || "Failed to update staff role");
    } finally {
      setUpdating(false);
    }
  };

  const handlePromoteUserToStaff = async (e) => {
    e.preventDefault();
    if (!selectedUserToPromote) return;
    setUpdating(true);
    setFeedbackMsg("");

    try {
      await api.put(`/user/admin/users/${selectedUserToPromote.id}/role`, { role: newStaffRole });
      setSelectedUserToPromote(null);
      setShowAddStaffPanel(false);
      loadAllUsers();
    } catch (err) {
      setFeedbackMsg(err.message || "Failed to add user to staff team");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
            Staff & Administrative Team
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage active store staff members, role permissions, and administrative access
          </p>
        </div>

        {/* Top Right "Add Staff" Button */}
        <button
          onClick={() => setShowAddStaffPanel(!showAddStaffPanel)}
          className="px-4 py-2 bg-[#21453A] text-white text-xs font-semibold rounded-xl hover:bg-[#163028] transition-colors btn-press shadow-2xs flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* SLIDE-DOWN: Add Staff Member Panel */}
      {showAddStaffPanel && (
        <div className="card-premium bg-[#FAF6EE]/70 border-[#B88A2E]/30 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center pb-3 border-b border-[#ECECEC]">
            <div>
              <h3 className="font-heading text-sm font-bold text-[#111827] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#B88A2E]" /> Select Registered User to Add as Staff
              </h3>
              <p className="text-xs text-[#6B7280]">
                Choose any registered account and assign them a Staff or Admin role
              </p>
            </div>
            <button
              onClick={() => setShowAddStaffPanel(false)}
              className="p-1 text-[#6B7280] hover:text-[#111827] rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: User Search & Selection List */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search registered users by name or email..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#21453A]"
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 p-1 bg-white rounded-xl border border-[#ECECEC]">
                {availableUsersToPromote.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#6B7280]">
                    No eligible registered users available to add as staff.
                  </div>
                ) : (
                  availableUsersToPromote.map((user) => {
                    const isSelected = selectedUserToPromote?.id === user.id;
                    return (
                      <button
                        type="button"
                        key={user.id}
                        onClick={() => setSelectedUserToPromote(user)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors text-left ${
                          isSelected
                            ? "bg-[#21453A] text-white font-bold"
                            : "hover:bg-[#F7F8FA] text-[#111827]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isSelected ? "bg-white text-[#21453A]" : "bg-[#21453A] text-white"
                          }`}>
                            {(user.name || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate">{user.name}</p>
                            <p className={`text-[10px] truncate ${isSelected ? "text-white/80" : "text-[#6B7280]"}`}>{user.email}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Role Assignment & Confirm Action */}
            <form onSubmit={handlePromoteUserToStaff} className="bg-white p-4 rounded-xl border border-[#ECECEC] flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#111827] mb-2">Staff Role Assignment</h4>
                {selectedUserToPromote ? (
                  <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#ECECEC] text-xs mb-3">
                    <p className="font-bold text-[#111827]">{selectedUserToPromote.name}</p>
                    <p className="text-[10px] text-[#6B7280]">{selectedUserToPromote.email}</p>
                  </div>
                ) : (
                  <p className="text-xs text-[#6B7280] italic mb-3">
                    ← Please select a user from the list on the left first.
                  </p>
                )}

                <label className="block font-bold text-[#111827] text-xs mb-1">Select Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#21453A]"
                >
                  <option value="staff">Staff Member (Fulfillment & Inventory)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ECECEC]">
                <button
                  type="button"
                  onClick={() => setShowAddStaffPanel(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold border border-[#ECECEC] rounded-xl text-[#6B7280] hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedUserToPromote || updating}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#21453A] text-white rounded-xl hover:bg-[#163028] disabled:opacity-50 btn-press"
                >
                  {updating ? "Adding..." : "Add Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Staff Members Table (ONLY STAFF & ADMINS) */}
      <div className="card-premium space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#21453A]"></div>
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="py-12 text-center text-[#6B7280]">
            <UserCog className="w-10 h-10 mx-auto text-[#ECECEC] mb-2" />
            <p className="text-xs font-semibold">No active staff members found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#ECECEC] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC] text-[#111827]">
                {staffMembers.map((s) => {
                  const isCurrentAdmin = s.email === currentAdminEmail;
                  const isAdminRole = s.role?.toLowerCase() === "admin";
                  const isStaffRole = s.role?.toLowerCase() === "staff";

                  let roleBadge = "bg-[#F7F8FA] text-[#6B7280] border border-[#ECECEC]";
                  if (isAdminRole) roleBadge = "bg-[#FAF6EE] text-[#B88A2E] border border-[#B88A2E]/20";
                  if (isStaffRole) roleBadge = "bg-[#F0F4F2] text-[#21453A] border border-[#21453A]/20";

                  return (
                    <tr key={s.id} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#111827]">
                        <div className="flex items-center gap-3">
                          {s.image ? (
                            <img
                              src={s.image}
                              alt={s.name}
                              className="w-9 h-9 rounded-full object-cover border border-[#ECECEC]"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#21453A] text-white flex items-center justify-center font-bold text-xs">
                              {(s.name || "S").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="flex items-center gap-1.5">
                              <span>{s.name}</span>
                              {isCurrentAdmin && (
                                <span className="px-2 py-0.2 bg-[#21453A] text-white text-[9px] font-extrabold rounded-md">
                                  YOU (Active Admin)
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-[#6B7280] font-normal">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${roleBadge}`}>
                          {s.role || "Staff"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-[#DCFCE7] text-[#15803D] rounded-full text-[10px] font-bold">
                          {s.status || "Active"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7280]">
                        {new Date(s.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isCurrentAdmin && isAdminRole ? (
                          <span className="text-[10px] text-[#6B7280] font-medium flex items-center justify-end gap-1">
                            <Lock className="w-3 h-3 text-[#B88A2E]" /> Protected Admin
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenRoleModal(s)}
                            className="px-3 py-1 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl text-xs font-semibold text-[#21453A] hover:bg-[#21453A] hover:text-white transition-colors"
                          >
                            Edit Role
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#ECECEC] flex justify-between items-center bg-[#F7F8FA]">
              <h3 className="font-heading text-sm font-bold text-[#111827]">
                Manage Role: {editingUser.name}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-[#6B7280] hover:text-[#111827]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-4 text-xs">
              {feedbackMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl font-medium">{feedbackMsg}</div>
              )}

              <div>
                <p className="text-xs text-[#6B7280] mb-3">
                  Update role assignment for <span className="font-bold text-[#111827]">{editingUser.email}</span>:
                </p>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl cursor-pointer hover:border-[#21453A]">
                    <input
                      type="radio"
                      name="role"
                      value="staff"
                      checked={selectedRole === "staff"}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="accent-[#21453A]"
                    />
                    <div>
                      <p className="font-bold text-[#111827]">Staff Member</p>
                      <p className="text-[10px] text-[#6B7280]">Fulfillment & store management permissions</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl cursor-pointer hover:border-[#21453A]">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={selectedRole === "admin"}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="accent-[#21453A]"
                    />
                    <div>
                      <p className="font-bold text-[#111827]">Administrator (Admin)</p>
                      <p className="text-[10px] text-[#6B7280]">Full system & database management</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl cursor-pointer hover:border-[#21453A]">
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={selectedRole === "user"}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="accent-[#21453A]"
                    />
                    <div>
                      <p className="font-bold text-[#111827]">Demote to Standard Customer (User)</p>
                      <p className="text-[10px] text-[#6B7280]">Remove staff privileges and return to customer status</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#ECECEC] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-[#ECECEC] text-[#6B7280] font-semibold hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-[#21453A] text-white rounded-xl font-semibold hover:bg-[#163028] btn-press"
                >
                  {updating ? "Updating..." : "Save Role Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
