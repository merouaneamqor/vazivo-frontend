"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { getGoogleAuthUrl } from "@/lib/google-auth";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup" | "forgot";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: () => void;
  /** When true, do not render backdrop or fixed positioning (for embedding inside another modal). */
  embedded?: boolean;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = "login",
  onSuccess,
  embedded = false,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, register, isLoggingIn, isRegistering } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (mode !== "forgot") {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (mode === "signup") {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (mode === "login") {
        await login({ email: formData.email, password: formData.password });
      } else if (mode === "signup") {
        await register({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim() || undefined,
          email: formData.email,
          password: formData.password,
        });
      }
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by useAuth hook
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setFormData({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  };

  const isLoading = isLoggingIn || isRegistering;

  const content = (
    <div className="bg-white rounded-2xl shadow-soft-lg border border-neutral-100 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-warm p-6 text-center">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-white/50 transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-600" />
                </button>
                
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl font-display font-semibold text-neutral-900">
                    {mode === "login" && "Welcome Back"}
                    {mode === "signup" && "Create Account"}
                    {mode === "forgot" && "Reset Password"}
                  </h2>
                  <p className="text-neutral-600 mt-1">
                    {mode === "login" && "Sign in to book your next appointment"}
                    {mode === "signup" && "Join our beauty & wellness community"}
                    {mode === "forgot" && "We'll send you a reset link"}
                  </p>
                </motion.div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <AnimatePresence mode="wait">
                  {mode === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-2 gap-3 mb-4"
                    >
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <Input
                          name="firstName"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={cn(
                            "pl-10 h-12",
                            errors.firstName && "border-error-500 focus:ring-error-500"
                          )}
                        />
                        {errors.firstName && (
                          <p className="text-error-500 text-xs mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          name="lastName"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={cn(
                            "h-12",
                            errors.lastName && "border-error-500 focus:ring-error-500"
                          )}
                        />
                        {errors.lastName && (
                          <p className="text-error-500 text-xs mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(
                      "pl-10 h-12 ",
                      errors.email && "border-error-500 focus:ring-error-500"
                    )}
                  />
                  {errors.email && (
                    <p className="text-error-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {mode !== "forgot" && (
                  <>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className={cn(
                          "pl-10 pr-10 h-12 ",
                          errors.password && "border-error-500 focus:ring-error-500"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      {errors.password && (
                        <p className="text-error-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    {mode === "signup" && (
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <Input
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={cn(
                            "pl-10 h-12 ",
                            errors.confirmPassword && "border-error-500 focus:ring-error-500"
                          )}
                        />
                        {errors.confirmPassword && (
                          <p className="text-error-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12"
                  loading={isLoading}
                >
                  {mode === "login" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "forgot" && "Send Reset Link"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                {(mode === "login" || mode === "signup") && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-neutral-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-neutral-500">or</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 "
                      onClick={() => { window.location.href = getGoogleAuthUrl(); }}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden>
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
                    </Button>
                  </>
                )}

                <div className="text-center text-sm text-neutral-600">
                  {mode === "login" ? (
                    <>
                      Do not have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("signup")}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Sign up
                      </button>
                    </>
                  ) : mode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Back to sign in
                    </button>
                  )}
                </div>
              </form>
    </div>
  );

  if (embedded) {
    return isOpen ? content : null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
          >
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
