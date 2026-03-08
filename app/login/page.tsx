"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getGoogleAuthUrl } from "@/lib/google-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { getPostLoginRedirect } from "@/lib/routes";
import { Logo } from "@/components/Logo";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn, isLoading, isAuthenticated, isAuthReady, role } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Client-side redirect for authenticated users (fallback if middleware misses)
  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) return;
    try {
      const returnTo = searchParams.get("returnTo");
      const destination =
        returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : getPostLoginRedirect(role ?? null);
      const path = typeof destination === "string" && destination ? destination : "/search";
      router.replace(path);
    } catch (_) {
      router.replace("/search");
    }
  }, [isAuthReady, isAuthenticated, role, router, searchParams]);

  // Show loading during auth check or if authenticated (about to redirect)
  if (isLoading || (isAuthReady && isAuthenticated)) {
    return <PageSpinner />;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    login({ email: formData.email, password: formData.password });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Logo href="/" variant="full" size="sm" className="mb-6" />
            <h1 className="text-3xl font-display font-bold text-vazivo-charcoal">
              Welcome back
            </h1>
            <p className="text-vazivo-warmMuted mt-2">
              Sign in to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-vazivo-warmMuted" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={cn(
                    "pl-10 h-12",
                    errors.email && "border-vazivo-red focus:ring-vazivo-red"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-vazivo-red text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-vazivo-warmMuted" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={cn(
                    "pl-10 pr-10 h-12",
                    errors.password && "border-vazivo-red focus:ring-vazivo-red"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vazivo-warmMuted hover:text-vazivo-charcoal"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-vazivo-red text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-lg border-vazivo-lightGray text-vazivo-red focus:ring-vazivo-red"
                />
                <span className="text-sm text-vazivo-warmMuted">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-vazivo-red hover:text-vazivo-redLight"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-12 bg-vazivo-red hover:bg-vazivo-redLight text-vazivo-white" loading={isLoggingIn}>
              Sign in
              {!isLoggingIn && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-vazivo-lightGray" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-vazivo-white px-3 text-vazivo-warmMuted">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-vazivo-lightGray hover:border-vazivo-red/40 hover:text-vazivo-red hover:bg-vazivo-red/5"
              onClick={() => { window.location.href = getGoogleAuthUrl(); }}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </Button>
          </form>

          <p className="text-center text-vazivo-warmMuted mt-6">
            Do not have an account?{" "}
            <Link href="/register" className="text-vazivo-red hover:text-vazivo-redLight font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Image/Graphic */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-vazivo-red/5 via-vazivo-lightGray/20 to-vazivo-red/10 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-lg text-center"
        >
          <div className="w-64 h-64 bg-vazivo-white/20 rounded-full mx-auto mb-8 flex items-center justify-center">
            <span className="inline-block scale-[2.8] opacity-90">
              <Logo variant="icon" size="lg" />
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-vazivo-charcoal mb-4">
            Your next great meal awaits
          </h2>
          <p className="text-vazivo-warmMuted">
            Discover and book the best restaurants near you. Find new favorites and manage your reservations in one place.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <LoginPageContent />
    </Suspense>
  );
}
