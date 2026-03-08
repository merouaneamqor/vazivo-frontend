"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  UserCog,
  CheckCircle,
  XCircle,
  RotateCcw,
  Mail,
  Copy,
  ExternalLink,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/modal";
import { UpgradeProviderModal } from "@/components/admin/UpgradeProviderModal";
import type { AdminProviderListItem } from "@/types/admin";

export function ProviderActionsDropdown({
  provider,
  onVerify,
  onUnverify,
  onSuspend,
  onReactivate,
  onImpersonate,
  onSendOnboardingEmail,
  onCopyId,
  onApprove,
  onUnconfirm,
  onUpgradeSuccess,
}: {
  provider: AdminProviderListItem;
  onVerify: (id: number) => void;
  onUnverify: (id: number) => void;
  onSuspend: (id: number) => void;
  onReactivate: (id: number) => void;
  onImpersonate: (id: number) => void;
  onSendOnboardingEmail: (id: number) => void;
  onCopyId: (id: number) => void;
  onApprove?: (id: number) => void;
  onUnconfirm?: (id: number) => void;
  onUpgradeSuccess?: () => void;
}) {
  const t = useTranslations("adminProviders");
  const tCommon = useTranslations("common");
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmUnconfirm, setConfirmUnconfirm] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const isSuspended = provider.status === "suspended";
  const isVerified = provider.verification_status === "verified";
  const isOwnerConfirmed = provider.owner_provider_status === "confirmed";

  const handleCopyId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(String(provider.id));
      onCopyId(provider.id);
    }
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={t("actions")}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
            className="min-w-[200px]  border border-neutral-200 bg-white p-1 shadow-lg"
            align="end"
            sideOffset={4}
          >
            <DropdownMenu.Item asChild>
              <Link
                href={`/admin/providers/${provider.id}`}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
              >
                <Eye className="h-4 w-4" />
                {t("actionViewBusiness")}
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <a
                href={`/${provider.city?.toLowerCase()}/${provider.category?.toLowerCase()}/${provider.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
              >
                <ExternalLink className="h-4 w-4" />
                {t("actionViewPublicPage")}
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link
                href={`/admin/providers/${provider.id}/edit`}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
              >
                <Pencil className="h-4 w-4" />
                {t("actionEditBusiness")}
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-neutral-200" />
            {onApprove && !isOwnerConfirmed && (
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
                onSelect={() => onApprove(provider.id)}
              >
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                {t("actionConfirmProvider")}
              </DropdownMenu.Item>
            )}
            {onUnconfirm && isOwnerConfirmed && (
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
                onSelect={() => setConfirmUnconfirm(true)}
              >
                <XCircle className="h-4 w-4" />
                {t("actionUnconfirmProvider")}
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
              onSelect={() => setUpgradeModalOpen(true)}
            >
              <Crown className="h-4 w-4 text-amber-500" />
              {t("actionUpgradePremium")}
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-neutral-200" />
            {!isVerified && (
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
                onSelect={() => onVerify(provider.id)}
              >
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                {t("actionVerify")}
              </DropdownMenu.Item>
            )}
            {isVerified && (
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
                onSelect={() => onUnverify(provider.id)}
              >
                <XCircle className="h-4 w-4" />
                {t("actionUnverify")}
              </DropdownMenu.Item>
            )}
            {!isSuspended && (
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50"
                onSelect={() => setConfirmSuspend(true)}
              >
                <XCircle className="h-4 w-4" />
                {t("actionSuspend")}
              </DropdownMenu.Item>
            )}
            {isSuspended && (
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
                onSelect={() => onReactivate(provider.id)}
              >
                <RotateCcw className="h-4 w-4" />
                {t("actionReactivate")}
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
              onSelect={() => onImpersonate(provider.id)}
            >
              <UserCog className="h-4 w-4" />
              {t("actionImpersonate")}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
              onSelect={() => onSendOnboardingEmail(provider.id)}
            >
              <Mail className="h-4 w-4" />
              {t("actionSendOnboardingEmail")}
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-neutral-200" />
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
              onSelect={handleCopyId}
            >
              <Copy className="h-4 w-4" />
              {t("actionCopyId")}
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <a
                href="/provider"
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-neutral-100"
              >
                <ExternalLink className="h-4 w-4" />
                {t("actionOpenDashboard")}
              </a>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
      </DropdownMenu.Root>

      <Dialog open={confirmSuspend} onOpenChange={setConfirmSuspend}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>{t("suspendTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600">
            {t("suspendDescription")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSuspend(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onSuspend(provider.id);
                setConfirmSuspend(false);
              }}
            >
              {t("actionSuspend")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmUnconfirm} onOpenChange={setConfirmUnconfirm}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>{t("unconfirmTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600">
            {t("unconfirmDescription")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUnconfirm(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onUnconfirm?.(provider.id);
                setConfirmUnconfirm(false);
              }}
            >
              {t("actionUnconfirmProvider")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeProviderModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        providerId={provider.id}
        providerName={provider.name}
        onSuccess={onUpgradeSuccess}
      />
    </>
  );
}
