"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isRegistering, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill from query params (e.g. from booking confirmation "Create an account?" link)
  useEffect(() => {
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    if (name || email) {
      const decodedName = name ? decodeURIComponent(name) : "";
      const parts = decodedName.trim().split(/\s+/, 2);
      setFormData((prev) => ({
        ...prev,
        ...(decodedName && { firstName: parts[0] ?? "", lastName: parts[1] ?? "" }),
        ...(email && { email: decodeURIComponent(email) }),
      }));
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth or redirecting
  if (isLoading || isAuthenticated) {
    return <PageSpinner />;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    register({
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim() || undefined,
      email: formData.email,
      password: formData.password,
      role: "customer",
    });
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
              Create your account
            </h1>
            <p className="text-vazivo-warmMuted mt-2">
              Join thousands of diners discovering great restaurants
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-vazivo-warmMuted" />
                  <Input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={cn(
                      "pl-10 h-12",
                      errors.firstName && "border-vazivo-red focus:ring-vazivo-red"
                    )}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-vazivo-red text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
                  Last name
                </label>
                <Input
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={cn(
                    "h-12",
                    errors.lastName && "border-vazivo-red focus:ring-vazivo-red"
                  )}
                />
                {errors.lastName && (
                  <p className="text-vazivo-red text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                  placeholder="Create a password"
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

            <div>
              <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-vazivo-warmMuted" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={cn(
                    "pl-10 h-12",
                    errors.confirmPassword && "border-vazivo-red focus:ring-vazivo-red"
                  )}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-vazivo-red text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full h-12 bg-vazivo-red hover:bg-vazivo-redLight text-vazivo-white" loading={isRegistering}>
                Create account
                {!isRegistering && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>

          <p className="text-center text-vazivo-warmMuted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-vazivo-red hover:text-vazivo-redLight font-medium">
              Sign in
            </Link>
          </p>

          <p className="text-center text-vazivo-warmMuted mt-3">
            List your business?{" "}
            <Link href="/register/provider" className="text-vazivo-red hover:text-vazivo-redLight font-medium">
              Register as a provider
            </Link>
          </p>

          <p className="text-center text-xs text-vazivo-warmMuted mt-4">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-vazivo-red hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-vazivo-red hover:underline">
              Privacy Policy
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
            Discover amazing restaurants
          </h2>
          <p className="text-vazivo-warmMuted">
            Find and book the best restaurants in your area. From local favorites to top-rated spots, we've got you covered.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <RegisterForm />
    </Suspense>
  );
}
