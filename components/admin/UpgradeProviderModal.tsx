"use client";

import { useState, useEffect, useRef } from "react";
import { Crown } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminService } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "wire", label: "Wire transfer" },
  { value: "check", label: "Check" },
  { value: "mtc", label: "MTC" },
  { value: "stripe", label: "Stripe" },
] as const;

function defaultExpiresAt(monthsFromNow = 1): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow);
  return d.toISOString().slice(0, 10);
}

export function UpgradeProviderModal({
  open,
  onOpenChange,
  providerId,
  providerName,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: number;
  providerName?: string;
  onSuccess?: () => void;
}) {
  const [planId, setPlanId] = useState("");
  const [expiresAt, setExpiresAt] = useState(defaultExpiresAt());
  const [paidVia, setPaidVia] = useState("cash");
  const [amount, setAmount] = useState("0");
  const [note, setNote] = useState("");
  const hasUserChosenPlanRef = useRef(false);

  const { data: plansData } = useQuery({
    queryKey: queryKeys.admin.plans,
    queryFn: adminService.getPlans,
    enabled: open,
  });
  const activePlans = (plansData?.plans ?? []).filter((p) => p.active);
  const firstPlanId = activePlans[0]?.identifier ?? null;

  // Initialize form when modal opens or when plans first load. Don't overwrite if user already changed the plan.
  useEffect(() => {
    if (!open) {
      hasUserChosenPlanRef.current = false;
      return;
    }
    if (hasUserChosenPlanRef.current) return;
    setPaidVia("cash");
    setNote("");
    const first = activePlans[0];
    if (first) {
      setPlanId(first.identifier);
      setExpiresAt(defaultExpiresAt(first.duration_months));
      setAmount(first.suggested_price != null ? String(first.suggested_price) : "0");
    } else {
      setPlanId("");
      setExpiresAt(defaultExpiresAt());
      setAmount("0");
    }
  }, [open, activePlans.length, firstPlanId]);

  const handlePlanChange = (value: string) => {
    hasUserChosenPlanRef.current = true;
    setPlanId(value);
  };

  // Sync amount and expires when the user changes the selected plan. Only depend on planId so typing in Amount is not overwritten.
  useEffect(() => {
    if (!open || !planId) return;
    const plan = activePlans.find((p) => p.identifier === planId);
    if (plan) {
      setExpiresAt(defaultExpiresAt(plan.duration_months));
      setAmount(plan.suggested_price != null ? String(plan.suggested_price) : "0");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit activePlans so effect doesn't run every render and overwrite Amount input
  }, [open, planId]);

  const upgradeMutation = useMutation({
    mutationFn: () =>
      adminService.upgradeProviderPremium(providerId, {
        plan_id: planId || undefined,
        expires_at: new Date(expiresAt).toISOString(),
        paid_via: paidVia,
        amount: Number(amount) || 0,
        note: note || undefined,
      }),
    onSuccess: () => {
      toast.success("Business upgraded to premium");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upgrade provider");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upgradeMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" showClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Grant Premium Access
          </DialogTitle>
          <DialogDescription>
            {providerName
              ? `Manually grant or extend premium for this business (${providerName}).`
              : "Manually grant or extend premium for this business."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {activePlans.length > 0 && (
            <div>
              <Label htmlFor="upgrade-plan">Plan</Label>
              <Select value={planId} onValueChange={handlePlanChange}>
                <SelectTrigger className="mt-1" id="upgrade-plan">
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
            <Label htmlFor="upgrade-expires">Expires on</Label>
            <Input
              id="upgrade-expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="upgrade-paid-via">Payment method</Label>
            <Select value={paidVia} onValueChange={setPaidVia}>
              <SelectTrigger className="mt-1" id="upgrade-paid-via">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="upgrade-amount">Amount (MAD)</Label>
            <Input
              id="upgrade-amount"
              type="number"
              min={0}
              step={0.01}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="upgrade-note">Note (optional)</Label>
            <Input
              id="upgrade-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Promotion offer"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upgradeMutation.isPending}>
              {upgradeMutation.isPending ? "Upgrading…" : "Grant premium"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
