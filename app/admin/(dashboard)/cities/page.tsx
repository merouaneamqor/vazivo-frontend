"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useAdminCities,
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
import type { AdminCity, AdminNeighborhood } from "@/types/admin";

type EditTarget = { id: number; name: string; isCity: boolean; cityId?: number } | null;
type DeleteTarget = { id: number; name: string; isCity: boolean } | null;

export default function AdminCitiesPage() {
  const queryClient = useQueryClient();

  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [createCityId, setCreateCityId] = useState<number | undefined>(undefined);
  const [createName, setCreateName] = useState("");
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const { data, isLoading } = useAdminCities();

  const cities: AdminCity[] = data?.cities ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.cities });

  const createCityMutation = useMutation({
    mutationFn: (params: { name: string; position?: number }) =>
      adminService.createCity(params),
    onSuccess: (_, variables) => {
      invalidate();
      setCreateOpen(false);
      setCreateName("");
      setCreateCityId(undefined);
      toast.success("City created");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create city"),
  });

  const createNeighborhoodMutation = useMutation({
    mutationFn: (params: { city_id: number; name: string }) =>
      adminService.createNeighborhood(params),
    onSuccess: (_, variables) => {
      invalidate();
      setCreateOpen(false);
      setCreateName("");
      setCreateCityId(undefined);
      toast.success("Neighborhood created");
      setExpanded((prev) => new Set([...prev, variables.city_id]));
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create neighborhood"),
  });

  const updateCityMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      adminService.updateCity(id, { name }),
    onSuccess: () => {
      invalidate();
      setEditTarget(null);
      setEditName("");
      toast.success("City updated");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update"),
  });

  const updateNeighborhoodMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      adminService.updateNeighborhood(id, { name }),
    onSuccess: () => {
      invalidate();
      setEditTarget(null);
      setEditName("");
      toast.success("Neighborhood updated");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update"),
  });

  const deleteCityMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCity(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success("City deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete"),
  });

  const deleteNeighborhoodMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteNeighborhood(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success("Neighborhood deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete"),
  });

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateCity = () => {
    setCreateCityId(undefined);
    setCreateName("");
    setCreateOpen(true);
  };

  const openCreateNeighborhood = (cityId: number) => {
    setCreateCityId(cityId);
    setCreateName("");
    setCreateOpen(true);
  };

  const openEditCity = (city: AdminCity) => {
    setEditTarget({ id: city.id, name: city.name, isCity: true });
    setEditName(city.name);
  };

  const openEditNeighborhood = (n: AdminNeighborhood) => {
    setEditTarget({
      id: n.id,
      name: n.name,
      isCity: false,
      cityId: n.city_id,
    });
    setEditName(n.name);
  };

  const openDeleteCity = (city: AdminCity) => {
    setDeleteTarget({ id: city.id, name: city.name, isCity: true });
  };

  const openDeleteNeighborhood = (n: AdminNeighborhood) => {
    setDeleteTarget({ id: n.id, name: n.name, isCity: false });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    if (createCityId) {
      createNeighborhoodMutation.mutate({
        city_id: createCityId,
        name: createName.trim(),
      });
    } else {
      createCityMutation.mutate({ name: createName.trim() });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editName.trim()) return;
    if (editTarget.isCity) {
      updateCityMutation.mutate({ id: editTarget.id, name: editName.trim() });
    } else {
      updateNeighborhoodMutation.mutate({
        id: editTarget.id,
        name: editName.trim(),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.isCity) {
      deleteCityMutation.mutate(deleteTarget.id);
    } else {
      deleteNeighborhoodMutation.mutate(deleteTarget.id);
    }
  };

  const deleteMutationPending =
    deleteCityMutation.isPending || deleteNeighborhoodMutation.isPending;

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900">
          Cities &amp; Neighborhoods
        </h1>
        <Button size="sm" onClick={openCreateCity}>
          <Plus className="h-4 w-4 mr-2" />
          Add city
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-500" />
            Cities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : cities.length === 0 ? (
            <p className="text-neutral-500 text-sm py-8 text-center">
              No cities yet. Add your first city.
            </p>
          ) : (
            <div className="space-y-1">
              {cities.map((city) => {
                const isExpanded = expanded.has(city.id);
                return (
                  <div key={city.id}>
                    {/* City row */}
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-neutral-50 group transition-colors">
                      <button
                        type="button"
                        className="flex items-center justify-center w-6 h-6 rounded-lg hover:bg-neutral-200 transition-colors"
                        onClick={() => toggleExpand(city.id)}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-neutral-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-neutral-500" />
                        )}
                      </button>

                      <Building2 className="h-4 w-4 text-primary-500 flex-shrink-0" />

                      <span className="font-medium text-neutral-900 flex-1 truncate">
                        {city.name}
                      </span>
                      <span className="text-xs text-neutral-400 mr-2">
                        {city.slug}
                      </span>
                      <span className="text-xs text-neutral-400 mr-3 tabular-nums">
                        {city.neighborhoods.length} neighborhood
                        {city.neighborhoods.length !== 1 ? "s" : ""}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => openCreateNeighborhood(city.id)}
                          title="Add neighborhood"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => openEditCity(city)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => openDeleteCity(city)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Neighborhoods */}
                    {isExpanded && city.neighborhoods.length > 0 && (
                      <div className="ml-8 border-l border-neutral-200 pl-2 space-y-0.5">
                        {city.neighborhoods.map((n) => (
                          <NeighborhoodRow
                            key={n.id}
                            n={n}
                            onEdit={() => openEditNeighborhood(n)}
                            onDelete={() => openDeleteNeighborhood(n)}
                          />
                        ))}
                      </div>
                    )}

                    {isExpanded && city.neighborhoods.length === 0 && (
                      <div className="ml-8 border-l border-neutral-200 pl-4 py-2">
                        <p className="text-xs text-neutral-400">
                          No neighborhoods.{" "}
                          <button
                            type="button"
                            className="text-primary-600 hover:underline"
                            onClick={() => openCreateNeighborhood(city.id)}
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>
              {createCityId ? "Add neighborhood" : "Add city"}
            </DialogTitle>
            <DialogDescription>
              {createCityId
                ? "Create a new neighborhood in this city."
                : "Create a new city."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="py-3">
              <Label htmlFor="loc-name">Name</Label>
              <Input
                id="loc-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder={createCityId ? "e.g. Medina" : "e.g. Casablanca"}
                className="mt-1"
                autoFocus
              />
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
                disabled={
                  !createName.trim() ||
                  createCityMutation.isPending ||
                  createNeighborhoodMutation.isPending
                }
              >
                {(createCityMutation.isPending ||
                  createNeighborhoodMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>
              Edit {editTarget?.isCity ? "city" : "neighborhood"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="py-3">
              <Label htmlFor="edit-loc-name">Name</Label>
              <Input
                id="edit-loc-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1"
                autoFocus
              />
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
                disabled={
                  !editName.trim() ||
                  updateCityMutation.isPending ||
                  updateNeighborhoodMutation.isPending
                }
              >
                {(updateCityMutation.isPending ||
                  updateNeighborhoodMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>
              Delete {deleteTarget?.isCity ? "city" : "neighborhood"}
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.isCity
                ? `Delete "${deleteTarget.name}" and all its neighborhoods? This cannot be undone.`
                : `Delete "${deleteTarget?.name}"? This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutationPending}
            >
              {deleteMutationPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NeighborhoodRow({
  n,
  onEdit,
  onDelete,
}: {
  n: AdminNeighborhood;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 group transition-colors">
      <div className="w-6" />
      <MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0" />
      <span className="text-sm text-neutral-700 flex-1 truncate">{n.name}</span>
      <span className="text-xs text-neutral-400 mr-2">{n.slug}</span>

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
