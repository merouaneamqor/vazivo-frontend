"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { Lock, Mail, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/features/admin";
import { useAuthStore } from "@/store/auth";
import { isAllowedAdminRole } from "@/lib/roles";
import type { User } from "@/types";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const t = useTranslations("adminLogin");
  const authenticate = useAuthStore((s) => s.authenticate);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => adminService.login(email, password, twoFactorCode || undefined),
    onSuccess: (data) => {
      const adminRole = data.user.admin_role ?? (data.user.role === "admin" ? "superadmin" : null);
      if (!isAllowedAdminRole(adminRole ?? undefined)) {
        toast.error(t("errorNotAuthorized"));
        return;
      }
      const u = data.user;
      const parts = u.name?.trim().split(/\s+/) ?? [];
      const user: User = {
        ...u,
        first_name: parts[0] ?? "",
        last_name: parts.slice(1).join(" ") || undefined,
        role: u.role as "customer" | "provider" | "admin",
        admin_role: adminRole as User["admin_role"],
      };
      authenticate(user);
      toast.success(t("welcomeBack"));
      router.replace("/admin/dashboard");
    },
    onError: (err: Error & { status?: number }) => {
      toast.error(err.message || t("errorInvalidCredentials"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("errorEmailPasswordRequired"));
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-4">
      <div className="absolute inset-0 bg-hero-pattern opacity-10" />
      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10  bg-primary-500 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-display font-bold text-white">{t("title")}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-soft-lg border border-neutral-100 p-8">
          <h1 className="text-xl font-display font-bold text-neutral-900 mb-2">{t("heading")}</h1>
          <p className="text-sm text-neutral-500 mb-6">{t("description")}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">{t("email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">{t("password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className="pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {t("twoFactor")} <span className="text-neutral-400 font-normal">{t("twoFactorOptional")}</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder={t("twoFactorPlaceholder")}
                  className="pl-10"
                  maxLength={6}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? t("signingIn") : t("signIn")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-neutral-500">
            <Link href="/" className="text-primary-600 hover:underline">
              {t("backToSite")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
