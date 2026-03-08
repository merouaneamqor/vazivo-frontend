"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { UserCog, Shield, Plus, Search, Pencil } from "lucide-react";
import {
  useAdminStaff,
  useAdminUsers,
  adminService,
} from "@/features/admin";
import { suspendAdminStaff, promoteToAdmin } from "@/lib/admin-api";
import { queryKeys } from "@/lib/query-client";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { KpiCard } from "@/components/admin/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/modal";
import type { PaginatedMeta } from "@/types/admin";
import type { AdminCustomerListItem } from "@/types/admin";

type StaffRow = {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone?: string;
  locale?: string;
  admin_role: string;
  created_at: string;
};

const ADMIN_ROLES = ["superadmin", "support", "moderator", "finance", "technical_admin"];
const LOCALES = [
  { value: "en", labelKey: "localeEn" as const },
  { value: "fr", labelKey: "localeFr" as const },
  { value: "ar", labelKey: "localeAr" as const },
];

export default function AdminStaffPage() {
  const t = useTranslations("adminStaff");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [suspendId, setSuspendId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    locale: "en",
    admin_role: "support",
  });
  const [editStaff, setEditStaff] = useState<StaffRow | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    locale: "en",
    admin_role: "support",
  });
  const [promoteSearch, setPromoteSearch] = useState("");
  const [promoteUserId, setPromoteUserId] = useState<number | null>(null);
  const [promoteRole, setPromoteRole] = useState("support");

  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminStaff();

  const { data: nonAdminUsers, isLoading: nonAdminLoading } = useAdminUsers({ exclude_role: "admin", q: promoteSearch || undefined, per_page: 50 }, { enabled: promoteOpen });

  const updateRole = useMutation({
    mutationFn: ({ id, admin_role }: { id: number; admin_role: string }) => adminService.updateStaff(id, { admin_role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.staff() });
    },
  });

  const updateStaff = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { first_name?: string; last_name?: string; email?: string; phone?: string; locale?: string; admin_role?: string };
    }) => adminService.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.staff() });
      setEditStaff(null);
    },
  });

  const suspend = useMutation({
    mutationFn: (id: number) => suspendAdminStaff(id),
    onSuccess: () => {
      setSuspendId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.staff() });
    },
  });

  const createStaff = useMutation({
    mutationFn: (payload: {
      first_name: string;
      last_name?: string;
      email: string;
      password: string;
      phone?: string;
      locale?: string;
      admin_role: string;
    }) => adminService.createStaff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.staff() });
      setCreateOpen(false);
      setCreateForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        locale: "en",
        admin_role: "support",
      });
    },
  });

  const promote = useMutation({
    mutationFn: ({ user_id, admin_role }: { user_id: number; admin_role: string }) =>
      promoteToAdmin(user_id, admin_role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.staff() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      setPromoteOpen(false);
      setPromoteUserId(null);
      setPromoteSearch("");
      setPromoteRole("support");
    },
  });

  const roleStats = data?.staff?.reduce((acc: Record<string, number>, staff: StaffRow) => {
    const role = staff.admin_role || "superadmin";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {}) || {};

  const columns: Column<StaffRow>[] = [
    { key: "name", header: t("name") },
    { key: "email", header: t("email") },
    {
      key: "admin_role",
      header: t("role"),
      render: (r) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
          {r.admin_role || "superadmin"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: t("joined"),
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: t("actions"),
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditStaff(r);
              setEditForm({
                first_name: r.first_name ?? "",
                last_name: r.last_name ?? "",
                email: r.email ?? "",
                phone: r.phone ?? "",
                locale: r.locale ?? "en",
                admin_role: r.admin_role || "support",
              });
            }}
            className="text-neutral-600 hover:bg-neutral-100"
            aria-label={t("editAdmin")}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <select
            value={r.admin_role || "superadmin"}
            onChange={(e) => updateRole.mutate({ id: r.id, admin_role: e.target.value })}
            className="rounded-lg border border-neutral-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {ADMIN_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <Button variant="ghost" size="sm" onClick={() => setSuspendId(r.id)} className="text-red-600 hover:bg-red-50">
            {t("suspend")}
          </Button>
        </div>
      ),
    },
  ];

  const meta = data?.meta as PaginatedMeta | undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-sm text-neutral-600 mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("createAdmin")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPromoteOpen(true)} className="gap-2">
            <Shield className="h-4 w-4" />
            {t("promoteToAdmin")}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t("totalStaff")}
          value={data?.staff?.length || 0}
          icon={UserCog}
        />
        <KpiCard
          title={t("superadmins")}
          value={roleStats.superadmin || 0}
          icon={Shield}
        />
        <KpiCard
          title={t("support")}
          value={roleStats.support || 0}
          icon={UserCog}
        />
        <KpiCard
          title={t("moderators")}
          value={roleStats.moderator || 0}
          icon={UserCog}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-neutral-700 mb-1.5 block">{t("filterByRole")}</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t("allRoles")}</option>
              {ADMIN_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.staff ?? []}
          keyExtractor={(r) => r.id}
          emptyMessage={isLoading ? t("loading") : t("noStaffFound")}
        />
      </div>

      {meta && meta.total_pages > 1 && (
        <Pagination
          currentPage={meta.current_page}
          totalPages={meta.total_pages}
          onPageChange={setPage}
        />
      )}

      <Dialog open={suspendId !== null} onOpenChange={(open) => !open && setSuspendId(null)}>
        <DialogContent size="sm" showClose>
          <DialogHeader><DialogTitle>{t("suspendTitle")}</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600">{t("suspendDescription")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendId(null)}>{t("cancel")}</Button>
            <Button
              variant="destructive"
              onClick={() => suspendId != null && suspend.mutate(suspendId)}
              disabled={suspend.isPending}
            >
              {suspend.isPending ? t("suspending") : t("yesSuspend")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="sm" showClose>
          <DialogHeader><DialogTitle>{t("createAdminTitle")}</DialogTitle></DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              createStaff.mutate({
                first_name: createForm.first_name,
                last_name: createForm.last_name || undefined,
                email: createForm.email,
                password: createForm.password,
                phone: createForm.phone || undefined,
                locale: createForm.locale || undefined,
                admin_role: createForm.admin_role,
              });
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="create-first_name">{t("firstName")}</Label>
                <Input
                  id="create-first_name"
                  value={createForm.first_name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, first_name: e.target.value }))}
                  placeholder={t("firstName")}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-last_name">{t("lastName")}</Label>
                <Input
                  id="create-last_name"
                  value={createForm.last_name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, last_name: e.target.value }))}
                  placeholder={t("lastName")}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="create-email">{t("email")}</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                placeholder={t("emailPlaceholder")}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-password">{t("password")}</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={t("passwordPlaceholder")}
                required
                minLength={6}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-phone">{t("phone")}</Label>
              <Input
                id="create-phone"
                type="tel"
                value={createForm.phone}
                onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder={t("phonePlaceholder")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-locale">{t("locale")}</Label>
              <select
                id="create-locale"
                value={createForm.locale}
                onChange={(e) => setCreateForm((f) => ({ ...f, locale: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {LOCALES.map((loc) => (
                  <option key={loc.value} value={loc.value}>{t(loc.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="create-role">{t("adminRole")}</Label>
              <select
                id="create-role"
                value={createForm.admin_role}
                onChange={(e) => setCreateForm((f) => ({ ...f, admin_role: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {ADMIN_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            {createStaff.isError && (
              <p className="text-sm text-red-600">
                {createStaff.error instanceof Error ? createStaff.error.message : t("createFailed")}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>{t("cancel")}</Button>
              <Button type="submit" disabled={createStaff.isPending}>
                {createStaff.isPending ? t("creating") : t("createAdmin")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editStaff !== null} onOpenChange={(open) => !open && setEditStaff(null)}>
        <DialogContent size="sm" showClose>
          <DialogHeader><DialogTitle>{t("editAdminTitle")}</DialogTitle></DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (editStaff != null) {
                updateStaff.mutate({
                  id: editStaff.id,
                  data: {
                    first_name: editForm.first_name || undefined,
                    last_name: editForm.last_name || undefined,
                    email: editForm.email || undefined,
                    phone: editForm.phone || undefined,
                    locale: editForm.locale || undefined,
                    admin_role: editForm.admin_role,
                  },
                });
              }
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-first_name">{t("firstName")}</Label>
                <Input
                  id="edit-first_name"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                  placeholder={t("firstName")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-last_name">{t("lastName")}</Label>
                <Input
                  id="edit-last_name"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                  placeholder={t("lastName")}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">{t("email")}</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                placeholder={t("emailPlaceholder")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">{t("phone")}</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder={t("phonePlaceholder")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-locale">{t("locale")}</Label>
              <select
                id="edit-locale"
                value={editForm.locale}
                onChange={(e) => setEditForm((f) => ({ ...f, locale: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {LOCALES.map((loc) => (
                  <option key={loc.value} value={loc.value}>{t(loc.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-role">{t("adminRole")}</Label>
              <select
                id="edit-role"
                value={editForm.admin_role}
                onChange={(e) => setEditForm((f) => ({ ...f, admin_role: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {ADMIN_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            {updateStaff.isError && (
              <p className="text-sm text-red-600">
                {updateStaff.error instanceof Error ? updateStaff.error.message : t("updateFailed")}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditStaff(null)}>{t("cancel")}</Button>
              <Button type="submit" disabled={updateStaff.isPending}>
                {updateStaff.isPending ? t("updating") : t("updateAdmin")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        <DialogContent size="sm" showClose>
          <DialogHeader><DialogTitle>{t("promoteTitle")}</DialogTitle></DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (promoteUserId != null) promote.mutate({ user_id: promoteUserId, admin_role: promoteRole });
            }}
          >
            <div>
              <Label htmlFor="promote-search">{t("searchUser")}</Label>
              <Input
                id="promote-search"
                value={promoteSearch}
                onChange={(e) => setPromoteSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("selectUser")}</Label>
              <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-neutral-200 p-2">
                {nonAdminLoading ? (
                  <p className="text-sm text-neutral-500">{t("loadingUsers")}</p>
                ) : (nonAdminUsers?.users?.length ?? 0) === 0 ? (
                  <p className="text-sm text-neutral-500">{t("noUsersFound")}</p>
                ) : (
                  <ul className="space-y-1">
                    {(nonAdminUsers?.users ?? []).map((u: AdminCustomerListItem) => (
                      <li key={u.id}>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-100">
                          <input
                            type="radio"
                            name="promote-user"
                            checked={promoteUserId === u.id}
                            onChange={() => setPromoteUserId(u.id)}
                          />
                          <span className="text-sm">{u.name}</span>
                          <span className="text-xs text-neutral-500">{u.email}</span>
                          <span className="text-xs text-neutral-400">({u.role})</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="promote-role">{t("adminRole")}</Label>
              <select
                id="promote-role"
                value={promoteRole}
                onChange={(e) => setPromoteRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            {promote.isError && (
              <p className="text-sm text-red-600">
                {promote.error instanceof Error ? promote.error.message : t("promoteFailed")}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPromoteOpen(false)}>{t("cancel")}</Button>
              <Button
                type="submit"
                disabled={promote.isPending || promoteUserId == null}
              >
                {promote.isPending ? t("promoting") : t("promoteToAdmin")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
