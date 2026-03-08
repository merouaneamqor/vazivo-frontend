"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, UserCog, Crown } from "lucide-react";
import {
  useAdminProvider,
  useAdminPlans,
  adminService,
} from "@/features/admin";
import { upgradeProviderPremium } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { setImpersonation } from "@/lib/impersonation";
import { queryKeys } from "@/lib/query-client";
import { StatusBadge } from "@/components/admin/StatusBadge";
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

export default function AdminProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const providerId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmImpersonate, setConfirmImpersonate] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState(
    () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().slice(0, 10);
    }
  );
  const [premiumPlanId, setPremiumPlanId] = useState("");
  const [premiumPaidVia, setPremiumPaidVia] = useState("cash");
  const [premiumAmount, setPremiumAmount] = useState("0");
  const [premiumNote, setPremiumNote] = useState("");

  const { data: plansData } = useAdminPlans();
  const activePlans = (plansData?.plans ?? []).filter((p) => p.active);

  useEffect(() => {
    if (showPremiumDialog && activePlans.length > 0) {
      const first = activePlans[0];
      setPremiumPlanId(first.identifier);
      const d = new Date();
      d.setMonth(d.getMonth() + first.duration_months);
      setPremiumExpiresAt(d.toISOString().slice(0, 10));
      setPremiumAmount(first.suggested_price != null ? String(first.suggested_price) : "0");
    }
  }, [showPremiumDialog, activePlans]);

  const { data, isLoading, error } = useAdminProvider(providerId);

  const approve = useMutation({
    mutationFn: () => adminService.approveProvider(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.provider(providerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers() });
    },
  });

  const suspend = useMutation({
    mutationFn: () => adminService.suspendProvider(providerId),
    onSuccess: () => {
      setConfirmSuspend(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.provider(providerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers() });
    },
  });

  const impersonate = useMutation({
    mutationFn: async () => {
      const json = await adminService.impersonateProvider(providerId);
      if (json.access_token) {
        const maxAge = json.expires_in ?? 3600;
        document.cookie = `access_token=${json.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      return json;
    },
    onSuccess: (_, variables: { providerName?: string } | undefined) => {
      setConfirmImpersonate(false);
      setImpersonation(variables?.providerName ? `Provider: ${variables.providerName}` : "Provider");
      router.push("/provider");
    },
  });

  const upgradePremium = useMutation({
    mutationFn: () =>
      upgradeProviderPremium(providerId, {
        plan_id: premiumPlanId || undefined,
        expires_at: new Date(premiumExpiresAt).toISOString(),
        paid_via: premiumPaidVia,
        amount: Number(premiumAmount) || 0,
        note: premiumNote || undefined,
      }),
    onSuccess: () => {
      setShowPremiumDialog(false);
      toast.success("Business upgraded to premium");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.provider(providerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers() });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upgrade business");
    },
  });

  if (Number.isNaN(providerId) || error) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">Provider not found.</p>
        <Link href="/admin/providers">
          <Button variant="outline">Back to providers</Button>
        </Link>
      </div>
    );
  }

  const provider = data?.provider;
  if (isLoading || !provider) {
    return (
      <div className="space-y-6">
        <p>Loading…</p>
      </div>
    );
  }

  const isSuspended = provider.status === "suspended";
  const services = (provider as { services?: { id: number; name: string; price: number; duration: number }[] }).services ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/providers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold text-neutral-900">{provider.name}</h1>
        <StatusBadge status={provider.status} />
        <Link href={`/admin/providers/${providerId}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
        <div className="flex gap-2 ml-auto">
          {isSuspended && (
            <Button size="sm" onClick={() => approve.mutate()} disabled={approve.isPending}>
              {approve.isPending ? "Approving…" : "Approve"}
            </Button>
          )}
          {!isSuspended && (
            <Button variant="outline" size="sm" onClick={() => setConfirmSuspend(true)} disabled={suspend.isPending}>
              Suspend
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setConfirmImpersonate(true)} disabled={impersonate.isPending}>
            <UserCog className="h-4 w-4 mr-2" />
            {impersonate.isPending ? "Redirecting…" : "Impersonate"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="text-neutral-500">Category:</span> {provider.category}</p>
          <p><span className="text-neutral-500">City:</span> {provider.city}</p>
          <p><span className="text-neutral-500">Rating:</span> {Number.isFinite(Number(provider.average_rating)) ? Number(provider.average_rating).toFixed(1) : "—"}</p>
          <p><span className="text-neutral-500">Total bookings:</span> {(provider as { total_bookings?: number }).total_bookings ?? 0}</p>
        </CardContent>
      </Card>

      {/* Premium Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Premium Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {provider.owner_premium_expires_at ? (
            <>
              <p>
                <span className="text-neutral-500">Premium until:</span>{" "}
                <span className="font-medium">
                  {new Date(provider.owner_premium_expires_at).toLocaleDateString()}
                </span>
                {new Date(provider.owner_premium_expires_at) > new Date() ? (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Active</span>
                ) : (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>
                )}
              </p>
              <Button size="sm" variant="outline" onClick={() => setShowPremiumDialog(true)}>
                <Crown className="h-4 w-4 mr-2 text-amber-500" />
                Extend Premium
              </Button>
            </>
          ) : (
            <>
              <p className="text-neutral-500 text-sm">This business does not have premium access.</p>
              <Button size="sm" onClick={() => setShowPremiumDialog(true)}>
                <Crown className="h-4 w-4 mr-2 text-amber-300" />
                Grant Premium
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {services.map((s) => (
                <li key={s.id}>{s.name} — {formatPrice(Number(s.price))} / {s.duration} min</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmSuspend} onOpenChange={setConfirmSuspend}>
        <DialogContent size="sm" showClose>
          <DialogHeader><DialogTitle>Suspend this provider?</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600">The business will be hidden from search and new bookings until approved again.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSuspend(false)}>No</Button>
            <Button variant="destructive" onClick={() => suspend.mutate()} disabled={suspend.isPending}>
              {suspend.isPending ? "Suspending…" : "Yes, suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmImpersonate} onOpenChange={setConfirmImpersonate}>
        <DialogContent size="sm" showClose>
          <DialogHeader><DialogTitle>Impersonate this provider?</DialogTitle></DialogHeader>
          <p className="text-sm text-neutral-600">You will be logged in as the business owner and redirected to the provider dashboard.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmImpersonate(false)}>Cancel</Button>
            <Button
              onClick={() => impersonate.mutate({ providerName: provider.name })}
              disabled={impersonate.isPending}
            >
              {impersonate.isPending ? "Redirecting…" : "Yes, impersonate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant / Extend Premium Dialog */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Grant Premium Access
            </DialogTitle>
            <DialogDescription>
              Manually grant or extend premium for this business.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {activePlans.length > 0 && (
              <div>
                <Label htmlFor="premium-plan">Plan</Label>
                <Select
                  value={premiumPlanId || activePlans[0]?.identifier}
                  onValueChange={(val) => {
                    setPremiumPlanId(val);
                    const plan = activePlans.find((p) => p.identifier === val);
                    if (plan) {
                      const d = new Date();
                      d.setMonth(d.getMonth() + plan.duration_months);
                      setPremiumExpiresAt(d.toISOString().slice(0, 10));
                      if (plan.suggested_price != null) setPremiumAmount(String(plan.suggested_price));
                    }
                  }}
                >
                  <SelectTrigger className="mt-1" id="premium-plan">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.identifier}>
                        {plan.name} ({plan.duration_months} {plan.duration_months === 1 ? "month" : "months"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="premium-expires">Expires on</Label>
              <Input
                id="premium-expires"
                type="date"
                value={premiumExpiresAt}
                onChange={(e) => setPremiumExpiresAt(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="premium-paid-via">Payment method</Label>
              <Select value={premiumPaidVia} onValueChange={setPremiumPaidVia}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="wire">Wire transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="mtc">MTC</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="premium-amount">Amount (MAD)</Label>
              <Input
                id="premium-amount"
                type="number"
                min={0}
                step={0.01}
                inputMode="decimal"
                value={premiumAmount}
                onChange={(e) => setPremiumAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="premium-note">Note (optional)</Label>
              <Input
                id="premium-note"
                value={premiumNote}
                onChange={(e) => setPremiumNote(e.target.value)}
                placeholder="e.g. Promotion offer"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPremiumDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => upgradePremium.mutate()}
              disabled={upgradePremium.isPending}
            >
              <Crown className="h-4 w-4 mr-2 text-amber-300" />
              {upgradePremium.isPending ? "Upgrading…" : "Grant Premium"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
