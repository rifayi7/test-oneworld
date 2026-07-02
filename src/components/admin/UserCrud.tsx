"use client";

import { useState, useTransition } from "react";
import { User, Role, ROLES, getRoleLabel } from "@/lib/roles";
import { createUserAction, deleteUserAction, updateUserRoleAction } from "@/app/admin/actions";
import { UserPlus, Trash2, Loader2 } from "lucide-react";

interface UserCrudProps {
  users: User[];
  currentUser: User;
}

export function UserCrud({ users, currentUser }: UserCrudProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer" as Role,
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);

    startTransition(async () => {
      try {
        const res = await createUserAction(data);
        if (res?.error) {
          setErrorMsg(res.error);
        } else {
          setFormOpen(false);
          setFormData({ name: "", email: "", password: "", role: "viewer" });
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to create user account.");
      }
    });
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this staff user account permanently?")) {
      return;
    }

    try {
      const res = await deleteUserAction(id);
      if (res?.error) {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete user account.");
    }
  };

  const handleRoleChange = async (id: number, newRole: Role) => {
    try {
      const res = await updateUserRoleAction(id, newRole);
      if (res?.error) {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update user role.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-display">
            Staff Users & Permissions
          </h2>
          <p className="text-[0.65rem] text-slate-400 mt-1">
            Manage admin panel access levels. viewer is read-only, editor manages content, admin has full settings rights.
          </p>
        </div>

        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black shadow-md shadow-primary-600/10 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[2.2]" />
          Create User Account
        </button>
      </div>

      {/* Add User Expandable Form */}
      {formOpen && (
        <div className="bg-white border border-slate-200 rounded-card p-6 shadow-sm max-w-xl text-left space-y-4">
          <h3 className="text-xs font-extrabold text-[#1F2744] uppercase tracking-wider">
            New Staff Member Details
          </h3>

          {errorMsg && (
            <div className="p-3.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  disabled={isPending}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={isPending}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@cleanworld.solutions"
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                  Access Password
                </label>
                <input
                  type="password"
                  required
                  disabled={isPending}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  minLength={6}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>

              {/* Role */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                  Access Level Role
                </label>
                <select
                  required
                  disabled={isPending}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {getRoleLabel(r)}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex gap-2.5 justify-end pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={isPending}
                className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add Account
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Users Responsive List Table */}
      <div className="overflow-hidden border border-slate-200 bg-white rounded-card shadow-sm">
        
        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 md:hidden p-4 bg-slate-50/50">
          {users.map((u) => (
            <div key={u.id} className="border border-slate-200 bg-white rounded-card p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="text-sm font-bold text-slate-900 leading-tight">
                  {u.name || "N/A"}
                </div>
                {u.id === currentUser.id && (
                  <span className="bg-primary-50 text-primary-600 text-[0.65rem] font-bold px-2 py-0.5 rounded-md">
                    You
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[0.65rem]">Email:</span>
                  <span className="text-slate-700 font-bold">{u.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[0.65rem]">Role:</span>
                  <select
                    disabled={u.id === currentUser.id}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[0.65rem] font-bold text-slate-700"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[0.65rem]">Joined:</span>
                  <span className="text-slate-700 font-bold">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {u.id !== currentUser.id && (
                <div className="border-t border-slate-100 pt-3 flex justify-end">
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <table className="hidden md:table w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Name</th>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Email Address</th>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Role Level</th>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Date Added</th>
              <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4.5 font-extrabold text-slate-900">
                  <div className="flex items-center gap-2">
                    {u.name || "N/A"}
                    {u.id === currentUser.id && (
                      <span className="bg-primary-50 text-primary-600 text-[0.55rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4.5 text-slate-600 font-bold">{u.email}</td>
                <td className="px-6 py-4.5">
                  <select
                    disabled={u.id === currentUser.id}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {getRoleLabel(r)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4.5 text-slate-400 font-bold">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4.5 text-right">
                  {u.id !== currentUser.id ? (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[0.65rem] font-bold text-slate-300 italic pr-3 select-none">Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
}
