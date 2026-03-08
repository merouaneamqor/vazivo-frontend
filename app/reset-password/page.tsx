"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
      return;
    }

    const validateToken = async () => {
      try {
        const result = await api.validateResetToken(token, email);
        if (result.status === "ok") {
          setTokenValid(true);
        } else {
          setTokenError(result.error || "Invalid or expired token");
        }
      } catch (err) {
        setTokenError("Invalid or expired token");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, email, router]);

  const validate = () => {
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token || !email) return;

    setIsSubmitting(true);
    setError("");

    try {
      const result = await api.resetPassword(token, email, password);
      if (result.status === "success") {
        setSuccess(true);
        toast.success("Password reset successfully!");
        setTimeout(() => router.push("/login?reset=success"), 2000);
      } else {
        const message = result.error || "Failed to reset password";
        setError(message);
        toast.error(message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) return null;

  if (isValidating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vazivo-red mx-auto mb-4"></div>
          <p className="text-vazivo-warmMuted">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="flex items-center justify-center gap-2 bg-error-50 text-error-700 py-4 px-6 rounded-lg mb-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{tokenError}</span>
          </div>
          <p className="text-vazivo-warmMuted mb-6">
            The reset link may have expired or is invalid. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full h-12 bg-vazivo-red hover:bg-vazivo-redLight text-vazivo-white">Request new reset link</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
              Reset your password
            </h1>
            <p className="text-vazivo-warmMuted mt-2">
              {success
                ? "Your password has been reset successfully."
                : "Enter your new password below."}
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 bg-success-50 text-success-700 py-4">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">Password reset successful</span>
              </div>
              <p className="text-center text-sm text-vazivo-warmMuted">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-vazivo-warmMuted" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password (min. 6 characters)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className={cn(
                      "pl-10 pr-10 h-12",
                      error && "border-vazivo-red focus:ring-vazivo-red"
                    )}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vazivo-warmMuted hover:text-vazivo-charcoal"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {error && (
                  <p className="text-vazivo-red text-sm mt-1">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-vazivo-red hover:bg-vazivo-redLight text-vazivo-white"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Reset password
              </Button>
            </form>
          )}

          <p className="text-center text-vazivo-warmMuted mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-vazivo-red hover:text-vazivo-redLight font-medium">
              Sign in
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
            Create a strong password
          </h2>
          <p className="text-vazivo-warmMuted">
            Choose a password that's at least 6 characters long and unique to this account.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vazivo-red mx-auto mb-4"></div>
        <p className="text-vazivo-warmMuted">Loading...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
