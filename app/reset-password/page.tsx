"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Validating reset link...</p>
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
          <p className="text-neutral-600 mb-6">
            The reset link may have expired or is invalid. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full h-12">Request new reset link</Button>
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
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={40}
                height={40}
              />
            </Link>
            <h1 className="text-3xl font-display font-bold text-neutral-900">
              Reset your password
            </h1>
            <p className="text-neutral-500 mt-2">
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
              <p className="text-center text-sm text-neutral-600">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
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
                      error && "border-error-500 focus:ring-error-500"
                    )}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {error && (
                  <p className="text-error-500 text-sm mt-1">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Reset password
              </Button>
            </form>
          )}

          <p className="text-center text-neutral-600 mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Image/Graphic */}
      <div className="hidden lg:flex flex-1 bg-gradient-warm items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-lg text-center"
        >
          <div className="w-64 h-64 bg-white/20 rounded-full mx-auto mb-8 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt=""
              width={128}
              height={128}
              className="opacity-90"
            />
          </div>
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-4">
            Create a strong password
          </h2>
          <p className="text-neutral-600">
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading...</p>
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
