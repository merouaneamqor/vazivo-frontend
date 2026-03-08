"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  useAdminPlans,
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
import type { AdminPlan } from "@/types/admin";

type EditTarget = AdminPlan | null;
type DeleteTarget = AdminPlan | null;

export default function AdminPlansPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const [createName, setCreateName] = useState("");
  const [createIdentifier, setCreateIdentifier] = useState("");
  const [createDurationMonths, setCreateDurationMonths] = useState("1");
  const [createSuggestedPrice, setCreateSuggestedPrice] = useState("");
  const [createCurrency, setCreateCurrency] = useState("mad");
  const [createActive, setCreateActive] = useState(true);
  const [createPosition, setCreatePosition] = useState("0");

  const [editName, setEditName] = useState("");
  const [editIdentifier, setEditIdentifier] = useState("");
  const [editDurationMonths, setEditDurationMonths] = useState("");
  const [editSuggestedPrice, setEditSuggestedPrice] = useState("");
  const [editCurrency, setEditCurrency] = useState("mad");
  const [editPosition, setEditPosition] = useState("0");

  useEffect(() => {
    if (editTarget) {
      setEditName(editTarget.name);
      setEditIdentifier(editTarget.identifier);
      setEditDurationMonths(String(editTarget.duration_months));
      setEditSuggestedPrice(editTarget.suggested_price != null ? String(editTarget.suggested_price) : "");
      setEditCurrency(editTarget.currency ?? "mad");
      setEditPosition(String(editTarget.position ?? 0));
    }
  }, [editTarget]);

  const { data, isLoading } = useAdminPlans();

  const plans: AdminPlan[] = data?.plans ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.plans });

  const createMutation = useMutation({
    mutationFn: (params: {
      name: string;
      identifier: string;
      duration_months: number;
      suggested_price?: number;
      currency: string;
      active: boolean;
      position: number;
    }) => adminService.createPlan(params),
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      resetCreateForm();
      toast.success("Plan created");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof adminService.updatePlan>[1];
    }) => adminService.updatePlan(id, data),
    onSuccess: () => {
      invalidate();
      setEditTarget(null);
      toast.success("Plan updated");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deletePlan(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success("Plan deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete"),
  });

  function resetCreateForm() {
    setCreateName("");
    setCreateIdentifier("");
    setCreateDurationMonths("1");
    setCreateSuggestedPrice("");
    setCreateCurrency("mad");
    setCreateActive(true);
    setCreatePosition("0");
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: createName.trim(),
      identifier: createIdentifier.trim().toLowerCase().replace(/\s+/g, "_"),
      duration_months: parseInt(createDurationMonths, 10) || 1,
      suggested_price: createSuggestedPrice ? parseFloat(createSuggestedPrice) : undefined,
      currency: createCurrency,
      active: createActive,
      position: parseInt(createPosition, 10) || 0,
    });
  };

  const handleEditSubmit = (e: React.FormEvent, plan: AdminPlan) => {
    e.preventDefault();
    const name = editName.trim();
    const identifier = editIdentifier.trim();
    if (!name || !identifier) return;
    updateMutation.mutate({
      id: plan.id,
      data: {
        name,
        identifier: identifier.toLowerCase().replace(/\s+/g, "_"),
        duration_months: editDurationMonths ? parseInt(editDurationMonths, 10) : undefined,
        suggested_price: editSuggestedPrice ? parseFloat(editSuggestedPrice) : undefined,
        currency: editCurrency || "mad",
        position: editPosition ? parseInt(editPosition, 10) : undefined,
      },
    });
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900">
          Subscription plans
        </h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-500" />
            Plans
          </CardTitle>
          <p className="text-sm text-neutral-500">
            Plans can be assigned when granting premium to a provider.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-neutral-500 text-sm py-8 text-center">
              No plans yet. Create your first plan.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Identifier</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Duration</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Active</th>
                    <th className="px-4 py-3 text-right font-semibold text-neutral-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                      <td className="px-4 py-3 font-medium text-neutral-900">{plan.name}</td>
                      <td className="px-4 py-3 text-neutral-600 font-mono text-xs">{plan.identifier}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {plan.duration_months} {plan.duration_months === 1 ? "month" : "months"}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {plan.suggested_price != null ? `${plan.suggested_price} ${plan.currency}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            plan.active
                              ? "text-emerald-600 font-medium"
                              : "text-neutral-400"
                          }
                        >
                          {plan.active ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditTarget(plan)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteTarget(plan)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="md" showClose>
          <DialogHeader>
            <DialogTitle>Create plan</DialogTitle>
            <DialogDescription>
              Add a new subscription plan. Identifier is used when assigning the plan to a provider.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Premium Monthly"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-identifier">Identifier</Label>
              <Input
                id="create-identifier"
                value={createIdentifier}
                onChange={(e) => setCreateIdentifier(e.target.value)}
                placeholder="e.g. premium_monthly"
                required
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-duration_months">Duration (months)</Label>
                <Input
                  id="create-duration_months"
                  type="number"
                  min={1}
                  value={createDurationMonths}
                  onChange={(e) => setCreateDurationMonths(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-suggested_price">Suggested price</Label>
                <Input
                  id="create-suggested_price"
                  type="number"
                  min={0}
                  step={0.01}
                  inputMode="decimal"
                  value={createSuggestedPrice}
                  onChange={(e) => setCreateSuggestedPrice(e.target.value)}
                  placeholder="Optional"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-currency">Currency</Label>
                <Input
                  id="create-currency"
                  value={createCurrency}
                  onChange={(e) => setCreateCurrency(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-position">Position</Label>
                <Input
                  id="create-position"
                  type="number"
                  min={0}
                  value={createPosition}
                  onChange={(e) => setCreatePosition(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create-active"
                checked={createActive}
                onChange={(e) => setCreateActive(e.target.checked)}
                className="rounded-lg border-neutral-300"
              />
              <Label htmlFor="create-active">Active (show in upgrade dropdown)</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !createName.trim() || !createIdentifier.trim()}>
                {createMutation.isPending ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editTarget && (
        <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
          <DialogContent size="md" showClose>
            <DialogHeader>
              <DialogTitle>Edit plan</DialogTitle>
              <DialogDescription>
                Update plan details. Changing identifier affects new assignments only.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => handleEditSubmit(e, editTarget)} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-identifier">Identifier</Label>
                <Input
                  id="edit-identifier"
                  value={editIdentifier}
                  onChange={(e) => setEditIdentifier(e.target.value)}
                  required
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-duration_months">Duration (months)</Label>
                  <Input
                    id="edit-duration_months"
                    type="number"
                    min={1}
                    value={editDurationMonths}
                    onChange={(e) => setEditDurationMonths(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-suggested_price">Suggested price</Label>
                  <Input
                    id="edit-suggested_price"
                    type="number"
                    min={0}
                    step={0.01}
                    inputMode="decimal"
                    value={editSuggestedPrice}
                    onChange={(e) => setEditSuggestedPrice(e.target.value)}
                    placeholder="Optional"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-currency">Currency</Label>
                <Input
                  id="edit-currency"
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  id="edit-position"
                  type="number"
                  min={0}
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="mt-1"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>Delete plan</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Delete "${deleteTarget.name}"? Existing subscriptions keep their plan_id for history.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
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
