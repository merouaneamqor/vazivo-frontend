"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setError("");
    try {
      await api.forgotPassword(email);
      setSubmitted(true);
      toast.success("If an account exists, we've sent reset instructions to your email.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
              Forgot password?
            </h1>
            <p className="text-vazivo-warmMuted mt-2">
              {submitted
                ? "Check your email for a link to reset your password."
                : "Enter your email and we'll send you reset instructions."}
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2  bg-success-50 text-success-700 py-4">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">Check your inbox</span>
              </div>
              <p className="text-center text-sm text-vazivo-warmMuted">
                Didn't receive the email? Check spam or{" "}
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-vazivo-red hover:text-vazivo-redLight font-medium"
                >
                  try again
                </button>
                .
              </p>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full h-12 border-vazivo-lightGray hover:border-vazivo-red/40 hover:text-vazivo-red hover:bg-vazivo-red/5">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className={cn(
                      "pl-10 h-12",
                      error && "border-vazivo-red focus:ring-vazivo-red"
                    )}
                    autoComplete="email"
                  />
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
                Send reset link
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
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
            We’ve got you covered
          </h2>
          <p className="text-vazivo-warmMuted">
            Enter the email linked to your account and we’ll send you a secure link to reset your password.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
