"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  FolderOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useAdminCategories,
  adminService,
} from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/modal";
import type { AdminAct, AdminSubact, AdminCategory } from "@/types/admin";

type EditTarget = AdminAct | AdminSubact | AdminCategory | null;
type DeleteTarget = { id: number; name: string; translated_name?: string; isAct: boolean } | null;

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  // ── State ──────────────────────────────────────────
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<number | undefined>(undefined);
  const [createNameEn, setCreateNameEn] = useState("");
  const [createNameFr, setCreateNameFr] = useState("");
  const [createNameAr, setCreateNameAr] = useState("");
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [editNameEn, setEditNameEn] = useState("");
  const [editNameFr, setEditNameFr] = useState("");
  const [editNameAr, setEditNameAr] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  // ── Queries ────────────────────────────────────────
  const { data, isLoading } = useAdminCategories();

  const acts: AdminAct[] = data?.acts ?? [];

  // ── Mutations ──────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });

  const createMutation = useMutation({
    mutationFn: (params: { name?: string; name_en?: string; name_fr?: string; name_ar?: string; parent_id?: number }) =>
      adminService.createCategory(params),
    onSuccess: (_, variables) => {
      invalidate();
      setCreateOpen(false);
      setCreateNameEn("");
      setCreateNameFr("");
      setCreateNameAr("");
      setCreateParentId(undefined);
      toast.success(
        variables.parent_id ? "Subact created" : "Act created"
      );
      if (variables.parent_id) {
        setExpanded((prev) => new Set([...prev, variables.parent_id!]));
      }
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name_en, name_fr, name_ar, position }: { id: number; name_en?: string; name_fr?: string; name_ar?: string; position?: number }) =>
      adminService.updateCategory(id, { name_en, name_fr, name_ar, position }),
    onSuccess: () => {
      invalidate();
      setEditTarget(null);
      setEditNameEn("");
      setEditNameFr("");
      setEditNameAr("");
      toast.success("Category updated");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCategory(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success("Category deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete"),
  });

  // ── Helpers ────────────────────────────────────────
  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateAct = () => {
    setCreateParentId(undefined);
    setCreateNameEn("");
    setCreateNameFr("");
    setCreateNameAr("");
    setCreateOpen(true);
  };

  const openCreateSubact = (parentId: number) => {
    setCreateParentId(parentId);
    setCreateNameEn("");
    setCreateNameFr("");
    setCreateNameAr("");
    setCreateOpen(true);
  };

  const hasAnyCreateName = createNameEn.trim() || createNameFr.trim() || createNameAr.trim();

  const openEdit = (cat: AdminAct | AdminSubact | AdminCategory) => {
    setEditTarget(cat);
    setEditNameEn(cat.name_en ?? cat.name ?? "");
    setEditNameFr(cat.name_fr ?? "");
    setEditNameAr(cat.name_ar ?? "");
  };

  const openDelete = (cat: { id: number; name: string; translated_name?: string }, isAct: boolean) => {
    setDeleteTarget({ ...cat, isAct });
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900">
          Categories
        </h1>
        <Button size="sm" onClick={openCreateAct}>
          <Plus className="h-4 w-4 mr-2" />
          Add act
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary-500" />
            Acts &amp; Subacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : acts.length === 0 ? (
            <p className="text-neutral-500 text-sm py-8 text-center">
              No categories yet. Add your first act.
            </p>
          ) : (
            <div className="space-y-1">
              {acts.map((act) => {
                const isExpanded = expanded.has(act.id);
                return (
                  <div key={act.id}>
                    {/* Act row */}
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-neutral-50 group transition-colors">
                      <button
                        type="button"
                        className="flex items-center justify-center w-6 h-6 rounded-lg hover:bg-neutral-200 transition-colors"
                        onClick={() => toggleExpand(act.id)}
                        aria-label={
                          isExpanded ? "Collapse" : "Expand"
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-neutral-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-neutral-500" />
                        )}
                      </button>

                      <FolderOpen className="h-4 w-4 text-amber-500 flex-shrink-0" />

                      <span className="font-medium text-neutral-900 flex-1 truncate">
                        {act.translated_name ?? act.name}
                      </span>
                      <span className="text-xs text-neutral-400 mr-2">
                        {act.slug}
                      </span>
                      <span className="text-xs text-neutral-400 mr-3 tabular-nums">
                        {act.subacts.length} subact
                        {act.subacts.length !== 1 ? "s" : ""}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => openCreateSubact(act.id)}
                          title="Add subact"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => openEdit(act)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => openDelete(act, true)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Subacts */}
                    {isExpanded && act.subacts.length > 0 && (
                      <div className="ml-8 border-l border-neutral-200 pl-2 space-y-0.5">
                        {act.subacts.map((sub) => (
                          <SubactRow
                            key={sub.id}
                            sub={sub}
                            onEdit={() => openEdit(sub)}
                            onDelete={() => openDelete(sub, false)}
                          />
                        ))}
                      </div>
                    )}

                    {isExpanded && act.subacts.length === 0 && (
                      <div className="ml-8 border-l border-neutral-200 pl-4 py-2">
                        <p className="text-xs text-neutral-400">
                          No subacts.{" "}
                          <button
                            type="button"
                            className="text-primary-600 hover:underline"
                            onClick={() => openCreateSubact(act.id)}
                          >
                            Add one
                          </button>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Create Dialog ─────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>
              {createParentId ? "Add subact" : "Add act"}
            </DialogTitle>
            <DialogDescription>
              {createParentId
                ? "Create a new subcategory under this act."
                : "Create a new top-level category (act)."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!hasAnyCreateName) return;
              createMutation.mutate({
                name_en: createNameEn.trim() || undefined,
                name_fr: createNameFr.trim() || undefined,
                name_ar: createNameAr.trim() || undefined,
                parent_id: createParentId,
              });
            }}
          >
            <div className="space-y-3 py-3">
              <p className="text-xs text-neutral-500">
                Enter at least one name. Slugs are derived from names on save. Missing locales will be filled from the first provided.
              </p>
              <div>
                <Label htmlFor="cat-name-en">Name (EN)</Label>
                <Input
                  id="cat-name-en"
                  value={createNameEn}
                  onChange={(e) => setCreateNameEn(e.target.value)}
                  placeholder="English"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="cat-name-fr">Name (FR)</Label>
                <Input
                  id="cat-name-fr"
                  value={createNameFr}
                  onChange={(e) => setCreateNameFr(e.target.value)}
                  placeholder="Français"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cat-name-ar">Name (AR)</Label>
                <Input
                  id="cat-name-ar"
                  value={createNameAr}
                  onChange={(e) => setCreateNameAr(e.target.value)}
                  placeholder="العربية"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!hasAnyCreateName || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ───────────────────────────────── */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
            <DialogDescription>
              Names and slugs (EN, FR, AR). Slugs are derived from names on save.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editTarget) return;
              const hasAny = editNameEn.trim() || editNameFr.trim() || editNameAr.trim();
              if (!hasAny) return;
              updateMutation.mutate({
                id: editTarget.id,
                name_en: editNameEn.trim() || undefined,
                name_fr: editNameFr.trim() || undefined,
                name_ar: editNameAr.trim() || undefined,
                position: editTarget.position,
              });
            }}
          >
            <div className="space-y-3 py-3">
              <div>
                <Label htmlFor="edit-name-en">Name (EN)</Label>
                <Input
                  id="edit-name-en"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  placeholder="English"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="edit-name-fr">Name (FR)</Label>
                <Input
                  id="edit-name-fr"
                  value={editNameFr}
                  onChange={(e) => setEditNameFr(e.target.value)}
                  placeholder="Français"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-name-ar">Name (AR)</Label>
                <Input
                  id="edit-name-ar"
                  value={editNameAr}
                  onChange={(e) => setEditNameAr(e.target.value)}
                  placeholder="العربية"
                  className="mt-1"
                />
              </div>
              {editTarget && (
                <p className="text-xs text-neutral-500">
                  Slug: {editTarget.slug}
                  {editTarget.slug_en && ` · EN: ${editTarget.slug_en}`}
                  {editTarget.slug_fr && ` · FR: ${editTarget.slug_fr}`}
                  {editTarget.slug_ar && ` · AR: ${editTarget.slug_ar}`}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={(!editNameEn.trim() && !editNameFr.trim() && !editNameAr.trim()) || updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>Delete category</DialogTitle>
            <DialogDescription>
              {deleteTarget?.isAct
                ? `Delete "${deleteTarget?.translated_name ?? deleteTarget?.name}" and all its subacts? This cannot be undone.`
                : `Delete "${deleteTarget?.translated_name ?? deleteTarget?.name}"? This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Subact row component ──────────────────────────────
function SubactRow({
  sub,
  onEdit,
  onDelete,
}: {
  sub: AdminSubact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 group transition-colors">
      <div className="w-6" />
      <span className="text-sm text-neutral-700 flex-1 truncate">
        {sub.translated_name ?? sub.name}
      </span>
      <span className="text-xs text-neutral-400 mr-2">{sub.slug}</span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={onEdit}
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
