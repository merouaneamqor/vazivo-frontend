"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminSeoPages, adminService } from "@/features/admin";
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
import type { AdminSeoPage } from "@/types/admin";

type EditTarget = AdminSeoPage | null;
type DeleteTarget = AdminSeoPage | null;

export default function AdminSeoPagesPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const [path, setPath] = useState("");
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [seoText, setSeoText] = useState("");
  const [city, setCity] = useState("");
  const [service, setService] = useState("");

  const { data, isLoading } = useAdminSeoPages();
  const seoPages: AdminSeoPage[] = data?.seo_pages ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.seoPages });

  useEffect(() => {
    if (editTarget) {
      setPath(editTarget.path ?? "");
      setTitle(editTarget.title ?? "");
      setMetaDescription(editTarget.meta_description ?? "");
      setSeoText(editTarget.seo_text ?? "");
      setCity(editTarget.city ?? "");
      setService(editTarget.service ?? "");
    }
  }, [editTarget]);

  const resetForm = () => {
    setPath("");
    setTitle("");
    setMetaDescription("");
    setSeoText("");
    setCity("");
    setService("");
  };

  const createMutation = useMutation({
    mutationFn: (params: {
      path: string;
      title?: string | null;
      meta_description?: string | null;
      seo_text?: string | null;
      city?: string | null;
      service?: string | null;
    }) => adminService.createSeoPage(params),
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      resetForm();
      toast.success("SEO page created");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof adminService.updateSeoPage>[1];
    }) => adminService.updateSeoPage(id, data),
    onSuccess: () => {
      invalidate();
      setEditTarget(null);
      resetForm();
      toast.success("SEO page updated");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteSeoPage(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success("SEO page deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete"),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPath = path.trim().replace(/^\/+|\/+$/g, "");
    if (!normalizedPath) {
      toast.error("Path is required");
      return;
    }
    createMutation.mutate({
      path: normalizedPath,
      title: title.trim() || null,
      meta_description: metaDescription.trim() || null,
      seo_text: seoText.trim() || null,
      city: city.trim() || null,
      service: service.trim() || null,
    });
  };

  const handleEditSubmit = (e: React.FormEvent, page: AdminSeoPage) => {
    e.preventDefault();
    const normalizedPath = path.trim().replace(/^\/+|\/+$/g, "");
    if (!normalizedPath) {
      toast.error("Path is required");
      return;
    }
    updateMutation.mutate({
      id: page.id,
      data: {
        path: normalizedPath,
        title: title.trim() || null,
        meta_description: metaDescription.trim() || null,
        seo_text: seoText.trim() || null,
        city: city.trim() || null,
        service: service.trim() || null,
      },
    });
  };

  const formFields = (
    <>
      <div>
        <Label htmlFor="path">Path *</Label>
        <Input
          id="path"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="e.g. spa/rabat"
          className="mt-1 font-mono text-sm"
        />
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title for title and og:title"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="meta">Meta description</Label>
        <textarea
          id="meta"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="Short description for search results"
          rows={2}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="seo">SEO text (optional)</Label>
        <textarea
          id="seo"
          value={seoText}
          onChange={(e) => setSeoText(e.target.value)}
          placeholder="Optional body copy for the page"
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="service">Service</Label>
          <Input id="service" value={service} onChange={(e) => setService(e.target.value)} className="mt-1" />
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900">SEO page overrides</h1>
        <Button size="sm" onClick={() => { resetForm(); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add SEO page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-500" />
            Path-based overrides
          </CardTitle>
          <p className="text-sm text-neutral-500">
            Custom title, meta description and SEO text for specific URL paths (e.g. search/city/category).
            Path is matched without leading/trailing slashes (e.g. spa/rabat).
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : seoPages.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">No SEO overrides yet. Add one to customize metadata for a path.</p>
          ) : (
            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Path</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">City</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Service</th>
                    <th className="px-4 py-3 text-right font-semibold text-neutral-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seoPages.map((page) => (
                    <tr key={page.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">{page.path}</code>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 max-w-[200px] truncate" title={page.title ?? undefined}>
                        {page.title || "—"}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{page.city || "—"}</td>
                      <td className="px-4 py-3 text-neutral-600">{page.service || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditTarget(page)} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteTarget(page)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="lg" showClose>
          <DialogHeader>
            <DialogTitle>Add SEO page override</DialogTitle>
            <DialogDescription>
              Set a path (e.g. spa/rabat) and optional title, meta description and SEO text.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {formFields}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || !path.trim()}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent size="lg" showClose>
          <DialogHeader>
            <DialogTitle>Edit SEO page override</DialogTitle>
            <DialogDescription>Update path and metadata for this override.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <form onSubmit={(e) => handleEditSubmit(e, editTarget)} className="space-y-4">
              {formFields}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent showClose>
          <DialogHeader>
            <DialogTitle>Delete SEO override?</DialogTitle>
            <DialogDescription>
              This will remove the override for path &quot;{deleteTarget?.path}&quot;. The site will fall back to default metadata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
