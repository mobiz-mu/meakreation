"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Shield,
  Users,
  UserCog,
} from "lucide-react";

type Role = "ADMIN" | "EMPLOYEE" | "STAFF";
type Status = "ACTIVE" | "INACTIVE";

type StaffUser = {
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  status: Status;
  created_at: string;
  updated_at: string;
};

type FormState = {
  email: string;
  full_name: string;
  phone: string;
  role: Role;
  password: string;
};

const EMPTY_FORM: FormState = {
  email: "",
  full_name: "",
  phone: "",
  role: "STAFF",
  password: "",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleBadgeClass(role: Role) {
  switch (role) {
    case "ADMIN":
      return "bg-rose-50 text-rose-700 border-rose-100";
    case "EMPLOYEE":
      return "bg-sky-50 text-sky-700 border-sky-100";
    default:
      return "bg-amber-50 text-amber-700 border-amber-100";
  }
}

function statusBadgeClass(status: Status) {
  return status === "ACTIVE"
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : "bg-slate-50 text-slate-700 border-slate-200";
}

export default function AdminSettingsPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error || "Failed to load users.");
        setUsers([]);
        setLoading(false);
        return;
      }

      setUsers(data?.items ?? []);
      setLoading(false);
    } catch {
      setMessage("Network error while loading users.");
      setUsers([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser() {
    if (!form.email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (!form.password.trim() || form.password.trim().length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          role: form.role,
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error || "Failed to create user.");
        setSaving(false);
        return;
      }

      setMessage("User created successfully.");
      setForm(EMPTY_FORM);
      setSaving(false);
      await load();
    } catch {
      setMessage("Network error while creating user.");
      setSaving(false);
    }
  }

  async function updateUser(user: StaffUser, patch: Partial<StaffUser>) {
    setMessage("");

    try {
      const res = await fetch(`/api/admin/users/${user.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: patch.full_name ?? user.full_name ?? "",
          phone: patch.phone ?? user.phone ?? "",
          role: patch.role ?? user.role,
          status: patch.status ?? user.status,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error || "Failed to update user.");
        return;
      }

      setMessage("User updated successfully.");
      await load();
    } catch {
      setMessage("Network error while updating user.");
    }
  }

  async function deleteUser(userId: string) {
    const ok = window.confirm("Delete this user permanently?");
    if (!ok) return;

    setMessage("");

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error || "Failed to delete user.");
        return;
      }

      setMessage("User deleted successfully.");
      await load();
    } catch {
      setMessage("Network error while deleting user.");
    }
  }

  const stats = useMemo(
    () => ({
      admins: users.filter((u) => u.role === "ADMIN").length,
      employees: users.filter((u) => u.role === "EMPLOYEE").length,
      staff: users.filter((u) => u.role === "STAFF").length,
    }),
    [users]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Settings & Team Access
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create staff users, assign roles, and manage access for your Mea Kréation admin panel.
          </p>
        </div>

        <Button variant="outline" className="rounded-xl" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {message ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-neutral-500">Admins</div>
              <div className="text-2xl font-semibold text-neutral-950">{stats.admins}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-neutral-500">Employees</div>
              <div className="text-2xl font-semibold text-neutral-950">{stats.employees}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-neutral-500">Staff</div>
              <div className="text-2xl font-semibold text-neutral-950">{stats.staff}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>Create Team Member</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="Employee full name"
                value={form.full_name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, full_name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="employee@company.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="+230..."
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                value={form.role}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    role: e.target.value as Role,
                  }))
                }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="STAFF">STAFF</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl" onClick={createUser} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create User
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-muted-foreground">
              No users created yet.
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-neutral-950">
                          {user.full_name || "Unnamed User"}
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                            roleBadgeClass(user.role)
                          )}
                        >
                          {user.role}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                            statusBadgeClass(user.status)
                          )}
                        >
                          {user.status}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-neutral-600">{user.email}</div>
                      <div className="mt-1 text-xs text-neutral-500">
                        Created: {formatDate(user.created_at)}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
                      <Input
                        defaultValue={user.full_name || ""}
                        placeholder="Full name"
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value !== (user.full_name || "")) {
                            updateUser(user, { full_name: value });
                          }
                        }}
                      />

                      <Input
                        defaultValue={user.phone || ""}
                        placeholder="Phone"
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value !== (user.phone || "")) {
                            updateUser(user, { phone: value });
                          }
                        }}
                      />

                      <select
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                        defaultValue={user.role}
                        onChange={(e) =>
                          updateUser(user, { role: e.target.value as Role })
                        }
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="EMPLOYEE">EMPLOYEE</option>
                        <option value="STAFF">STAFF</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                        value={user.status}
                        onChange={(e) =>
                          updateUser(user, { status: e.target.value as Status })
                        }
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>

                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl"
                        onClick={() => deleteUser(user.user_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}