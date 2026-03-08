"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { useAdminUser, adminService } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { toE164 } from "@/lib/phone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/modal";
import type { AdminCustomerListItem } from "@/types/admin";

export default function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmUnsuspend, setConfirmUnsuspend] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "customer" });

  const { data, isLoading, error } = useAdminUser(userId);

  const updateUser = useMutation({
    mutationFn: (payload: Partial<AdminCustomerListItem>) => adminService.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.user(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      setEditing(false);
    },
  });

  const suspendUser = useMutation({
    mutationFn: () => adminService.suspendUser(userId),
    onSuccess: () => {
      setConfirmSuspend(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.user(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });

  const unsuspendUser = useMutation({
    mutationFn: () => adminService.unsuspendUser(userId),
    onSuccess: () => {
      setConfirmUnsuspend(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.user(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });

  const deleteUser = useMutation({
    mutationFn: () => adminService.deleteUser(userId),
    onSuccess: () => {
      setConfirmDelete(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      router.push("/admin/customers");
    },
  });

  const sendPasswordReset = useMutation({
    mutationFn: () => adminService.forcePasswordReset(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.user(userId) });
    },
  });

  if (Number.isNaN(userId) || error) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">Customer not found.</p>
        <Link href="/admin/customers">
          <Button variant="outline">Back to customers</Button>
        </Link>
      </div>
    );
  }

  const user = data?.user;
  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <p>Loading…</p>
      </div>
    );
  }

  const status = (user as { status?: string }).status ?? "active";
  const isSuspended = status === "suspended";
  const userWithBookings = user as {
    bookings?: { id: number; date: string; status: string; service_name: string; business_name: string }[];
    total_bookings?: number;
    total_reviews?: number;
  };

  const startEdit = () => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      role: (user as { role?: string }).role ?? "customer",
    });
    setEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold text-neutral-900">{user.name}</h1>
        <StatusBadge status={status} />
        <Button variant="outline" size="sm" onClick={startEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <div className="flex gap-2 ml-auto">
          {!isSuspended ? (
            <Button variant="outline" size="sm" onClick={() => setConfirmSuspend(true)} disabled={suspendUser.isPending}>
              Suspend
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirmUnsuspend(true)} disabled={unsuspendUser.isPending}>
              Unsuspend
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => sendPasswordReset.mutate()} disabled={sendPasswordReset.isPending}>
            {sendPasswordReset.isPending ? "Sending…" : "Force password reset"}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)} disabled={deleteUser.isPending}>
            Delete
          </Button>
        </div>
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <PhoneInput value={form.phone} onChange={(value) => setForm((f) => ({ ...f, phone: value }))} />
            </div>
            <div>
              <Label>Role</Label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              >
                <option value="customer">Customer</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => updateUser.mutate({ ...form, phone: toE164(form.phone) ?? form.phone })} disabled={updateUser.isPending}>
                {updateUser.isPending ? "Saving…" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="text-neutral-500">Email:</span> {user.email}</p>
            <p><span className="text-neutral-500">Phone:</span> {user.phone ?? "—"}</p>
            <p><span className="text-neutral-500">Role:</span> {(user as { role?: string }).role ?? "customer"}</p>
            <p><span className="text-neutral-500">Total bookings:</span> {userWithBookings.total_bookings ?? 0}</p>
            <p><span className="text-neutral-500">Total reviews:</span> {userWithBookings.total_reviews ?? 0}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {(userWithBookings.bookings ?? []).slice(0, 10).map((b) => (
              <li key={b.id} className="flex justify-between">
                <span>{b.date} — {b.service_name} @ {b.business_name}</span>
                <StatusBadge status={b.status} />
              </li>
            ))}
            {(userWithBookings.bookings?.length ?? 0) === 0 && <li className="text-neutral-500">No bookings</li>}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={confirmSuspend} onOpenChange={setConfirmSuspend}>
        <DialogContent size="sm" showClose>
          <DialogHeader><DialogTitle>Suspend this customer?</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600">They will not be able to log in until unsuspended.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSuspend(false)}>No</Button>
            <Button variant="destructive" onClick={() => suspendUser.mutate()} disabled={suspendUser.isPending}>
              {suspendUser.isPending ? "Suspending…" : "Yes, suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmUnsuspend} onOpenChange={setConfirmUnsuspend}>
        <DialogContent size="sm" showClose>
          <DialogHeader><DialogTitle>Unsuspend this customer?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUnsuspend(false)}>No</Button>
            <Button onClick={() => unsuspendUser.mutate()} disabled={unsuspendUser.isPending}>
              {unsuspendUser.isPending ? "Updating…" : "Yes, unsuspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent size="sm" showClose>
          <DialogHeader><DialogTitle>Delete this customer?</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600">This will soft-delete the account. This action cannot be easily undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>No</Button>
            <Button variant="destructive" onClick={() => deleteUser.mutate()} disabled={deleteUser.isPending}>
              {deleteUser.isPending ? "Deleting…" : "Yes, delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
