"use client";

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Users,
  Plus,
  UserCog,
  Trash2,
  Loader2,
  Mail,
} from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { useAuth } from "@/hooks/useAuth";
import { useProviderBusiness } from "@/context/ProviderBusinessContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/modal";
import toast from "react-hot-toast";
import type { StaffMember } from "@/types";
import { ProviderPremiumGate } from "@/components/provider/ProviderPremiumGate";
import { UpgradeModal } from "@/components/provider/UpgradeModal";

export default function ProviderStaffPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { businesses, activeBusinessId, isLoading: businessesLoading } = useProviderBusiness();
  const firstBusiness = businesses[0];

  const [addEmail, setAddEmail] = useState("");
  const [addFirstName, setAddFirstName] = useState("");
  const [addLastName, setAddLastName] = useState("");
  const [addRole, setAddRole] = useState<string>("staff");
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<string>("staff");
  const [removeConfirmStaff, setRemoveConfirmStaff] = useState<StaffMember | null>(null);

  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: queryKeys.businesses.staff(activeBusinessId!),
    queryFn: () => api.getBusinessStaff(activeBusinessId!),
    enabled: !!activeBusinessId,
  });

  const staffMembers: StaffMember[] = staffData?.staff ?? [];

  const inviteMutation = useMutation({
    mutationFn: (params: { email: string; first_name?: string; last_name?: string; name?: string; role?: string }) =>
      api.inviteBusinessStaff(activeBusinessId!, params),
    onSuccess: (data: { staff_member: StaffMember; created_user?: boolean }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.staff(activeBusinessId!) });
      queryClient.invalidateQueries({ queryKey: ["provider", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings"] });
      if (data.created_user) {
        toast.success("Account created and added to staff. They can set a password via Forgot password.");
      } else {
        toast.success("Staff member added");
      }
      setAddEmail("");
      setAddFirstName("");
      setAddLastName("");
      setAddRole("staff");
    },
    onError: (err: Error & { message?: string }) => {
      toast.error(err.message ?? "Failed to add staff");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      api.updateBusinessStaff(activeBusinessId!, userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.staff(activeBusinessId!) });
      queryClient.invalidateQueries({ queryKey: ["provider", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings"] });
      toast.success("Role updated");
      setEditingStaffId(null);
    },
    onError: (err: Error & { message?: string; errors?: string[] }) => {
      const msg = err.message ?? "";
      const isOwnerError = msg.includes("Cannot change owner role") || err.errors?.some((e) => e.includes("Cannot change owner role"));
      if (isOwnerError) {
        toast.error("Owner role cannot be changed");
        setEditingStaffId(null);
      } else {
        toast.error(msg || "Failed to update role");
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: number) => api.removeBusinessStaff(activeBusinessId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.staff(activeBusinessId!) });
      queryClient.invalidateQueries({ queryKey: ["provider", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings"] });
      toast.success("Staff member removed");
      setRemoveConfirmStaff(null);
    },
    onError: (err: Error & { message?: string }) => {
      toast.error(err.message ?? "Failed to remove staff");
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const email = addEmail.trim();
    if (!email || !activeBusinessId) return;
    inviteMutation.mutate({
      email,
      first_name: addFirstName.trim() || undefined,
      last_name: addLastName.trim() || undefined,
      role: addRole,
    });
  };

  const handleUpdateRole = (staff: StaffMember) => {
    if (staff.role === "owner") {
      toast.error("Owner role cannot be changed");
      return;
    }
    updateMutation.mutate({ userId: staff.id, role: editRole });
  };

  const handleRemoveConfirm = (staff: StaffMember) => {
    if (staff.role === "owner") return;
    removeMutation.mutate(staff.id);
  };

  if (businessesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!firstBusiness) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-neutral-900">Staff</h1>
          <p className="text-neutral-600 mt-1">Manage staff for your business</p>
        </div>
        <Card className="card-premium">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">Add a business first to manage staff</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ProviderPremiumGate onUpgradeClick={() => setUpgradeOpen(true)}>
        <div className="min-h-screen bg-neutral-50">
          {/* Header */}
          <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-neutral-900">Staff</h1>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    Manage staff for your business. Switch business in the sidebar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Add staff */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Add staff member</h2>
              </div>
              <p className="text-sm text-neutral-500 mb-4">
                Enter their email and assign a role. If no account exists, one will be created.
              </p>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="staff-email" className="text-sm font-medium">Email *</Label>
                    <Input
                      id="staff-email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      className="w-full mt-1.5 h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="staff-first-name" className="text-sm font-medium">First name (optional)</Label>
                      <Input
                        id="staff-first-name"
                        type="text"
                        placeholder="Jane"
                        value={addFirstName}
                        onChange={(e) => setAddFirstName(e.target.value)}
                        className="w-full mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="staff-last-name" className="text-sm font-medium">Last name (optional)</Label>
                      <Input
                        id="staff-last-name"
                        type="text"
                        placeholder="Doe"
                        value={addLastName}
                        onChange={(e) => setAddLastName(e.target.value)}
                        className="w-full mt-1.5 h-11"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={addRole} onValueChange={setAddRole}>
                    <SelectTrigger className="w-full sm:w-40 h-11">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" disabled={!addEmail.trim() || inviteMutation.isPending} className="h-11">
                    {inviteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Add staff
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Staff list */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
              <div className="px-6 py-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-neutral-900">Team members</h2>
                </div>
              </div>
              <div className="p-6">
                {staffLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-neutral-100  animate-pulse" />
                    ))}
                  </div>
                ) : staffMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500">No staff members yet. Add someone above.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {staffMembers.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">
                            {staff.name}
                            {staff.id === user?.id && (
                              <span className="ml-2 text-xs font-normal text-neutral-500">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-neutral-500 truncate">{staff.email}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {editingStaffId === staff.id ? (
                            <div className="flex items-center gap-2">
                              <Select value={editRole} onValueChange={setEditRole}>
                                <SelectTrigger className="w-32 h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {staff.role !== "owner" && (
                                    <>
                                      <SelectItem value="staff">Staff</SelectItem>
                                      <SelectItem value="manager">Manager</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateRole(staff)}
                                disabled={updateMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingStaffId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-neutral-700 capitalize px-3 py-1.5 rounded-lg bg-neutral-100">
                                {staff.role}
                              </span>
                              {staff.role !== "owner" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingStaffId(staff.id);
                                      setEditRole(staff.role === "manager" ? "manager" : "staff");
                                    }}
                                  >
                                    Edit role
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => setRemoveConfirmStaff(staff)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Remove confirmation dialog */}
        <Dialog
          open={!!removeConfirmStaff}
          onOpenChange={(open) => !open && setRemoveConfirmStaff(null)}
        >
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Remove staff member</DialogTitle>
              <DialogDescription>
                {removeConfirmStaff && (
                  <>
                    Remove <strong>{removeConfirmStaff.name}</strong> ({removeConfirmStaff.email}) from this business?
                    They will no longer see this business in their calendar or bookings.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRemoveConfirmStaff(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => removeConfirmStaff && handleRemoveConfirm(removeConfirmStaff)}
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? "Removing…" : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ProviderPremiumGate>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
