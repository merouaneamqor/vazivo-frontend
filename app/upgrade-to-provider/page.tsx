"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, User as UserIcon, ChevronDown, MapPin, Globe, Copy } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth";
import { useCities, useCategories } from "@/hooks/useSearchMetadata";
import { useNominatimCitySearch, useNominatimNeighborhoodSearch } from "@/hooks/useNominatimSearch";
import { getCityDisplayName, getNeighborhoodDisplayName } from "@/lib/nominatim";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { PageSpinner } from "@/components/ui/spinner";
import { queryKeys } from "@/lib/query-client";
import api, { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toE164 } from "@/lib/phone";
import { COUNTRIES, DEFAULT_COUNTRY, getCountryCode } from "@/lib/countries";
import { useAuth } from "@/hooks/useAuth";

export default function UpgradeToProviderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authenticate = useAuthStore((s) => s.authenticate);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  const [businessForm, setBusinessForm] = useState({
    name: "",
    description: "",
    categories: [] as string[],
    address: "",
    city: "",
    country: DEFAULT_COUNTRY,
    neighborhood: "",
    phone: user?.phone || "",
    email: user?.email || "",
    website: "",
  });

  const [cityInputValue, setCityInputValue] = useState("");
  const [neighborhoodInputValue, setNeighborhoodInputValue] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const neighborhoodDropdownRef = useRef<HTMLDivElement>(null);

  const citySearchCountryCode =
    businessForm.country && businessForm.country !== "Other"
      ? getCountryCode(businessForm.country)
      : undefined;
  const { results: nominatimCityResults, loading: citySearchLoading } = useNominatimCitySearch(
    cityInputValue,
    showCityDropdown && cityInputValue.length >= 3,
    citySearchCountryCode
  );
  const { results: nominatimNeighborhoodResults, loading: neighborhoodSearchLoading } =
    useNominatimNeighborhoodSearch(
      neighborhoodInputValue,
      businessForm.city,
      showNeighborhoodDropdown && !!businessForm.city
    );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstErrorRef = useRef<HTMLDivElement>(null);

  // Redirect non-customers
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role !== "customer") {
        router.push(user.role === "provider" ? "/provider" : "/dashboard");
      }
    } else if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, user, router]);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!businessForm.name?.trim()) e.business_name = "Business name is required";
    if (!businessForm.categories?.length) e.business_category = "Select at least one category";
    if (!businessForm.city?.trim()) e.business_city = "City is required";
    if (!businessForm.address?.trim()) e.business_address = "Address is required";
    setErrors(e);
    setApiErrors([]);
    if (Object.keys(e).length > 0) {
      firstErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  }, [businessForm]);

  if (authLoading || citiesLoading || categoriesLoading) {
    return <PageSpinner />;
  }

  if (!isAuthenticated || !user || user.role !== "customer") {
    return <PageSpinner />;
  }

  const copyUserContact = () => {
    if (user.email) setBusinessForm((b) => ({ ...b, email: user.email }));
    if (user.phone) setBusinessForm((b) => ({ ...b, phone: user.phone! }));
    toast.success("Contact info copied");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiErrors([]);
    try {
      const data = await api.upgradeToProvider({
        name: businessForm.name.trim(),
        description: businessForm.description.trim() || undefined,
        categories: businessForm.categories,
        address: businessForm.address.trim(),
        city: businessForm.city,
        country: businessForm.country || undefined,
        neighborhood: businessForm.neighborhood.trim() || undefined,
        phone: (toE164(businessForm.phone) ?? businessForm.phone.trim()) || undefined,
        email: businessForm.email.trim() || undefined,
        website: businessForm.website.trim() || undefined,
      });
      authenticate(data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Welcome to Ollazen for Business!");
      router.push("/provider");
    } catch (err) {
      if (err instanceof ApiError) {
        setApiErrors(err.errors ?? [err.message]);
      } else {
        setApiErrors(["Something went wrong. Please try again."]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="OllaZen" className="h-10 w-10" />
            </Link>
            <h1 className="text-3xl font-display font-bold text-neutral-900">
              Create Your Business Profile
            </h1>
            <p className="text-neutral-600 mt-2">
              You're upgrading to a provider account
            </p>
          </div>

          {/* User Info (Read-only) */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <UserIcon className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-800">Your Account</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <Input value={user.name} disabled className="bg-neutral-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <Input value={user.email} disabled className="bg-neutral-50" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {apiErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-sm text-red-700">
                <p className="font-medium mb-1">Please fix the following:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {apiErrors.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Business Info */}
            <div ref={firstErrorRef} className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-800">Business Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Business Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Bella Beauty Salon"
                    value={businessForm.name}
                    onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                    className={cn(errors.business_name && "border-red-500")}
                  />
                  {errors.business_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Categories *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((cat) => {
                      const isChecked = businessForm.categories.includes(cat.name);
                      return (
                        <label
                          key={cat.slug}
                          className={cn(
                            "inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                            isChecked
                              ? "border-primary-500 bg-primary-50 text-primary-700"
                              : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const next = isChecked
                                ? businessForm.categories.filter((c) => c !== cat.name)
                                : [...businessForm.categories, cat.name];
                              setBusinessForm({ ...businessForm, categories: next });
                            }}
                            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium">{cat.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.business_category && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Country</label>
                  <select
                    value={businessForm.country}
                    onChange={(e) => setBusinessForm({ ...businessForm, country: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code || "other"} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative" ref={cityDropdownRef}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">City *</label>
                  <Input
                    type="text"
                    placeholder="Search city..."
                    value={cityInputValue}
                    onChange={(e) => {
                      setCityInputValue(e.target.value);
                      setShowCityDropdown(true);
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                    className={cn(errors.business_city && "border-red-500")}
                  />
                  {showCityDropdown && cityInputValue.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg z-50 max-h-60 overflow-y-auto">
                      {cities
                        .filter((c) => c.name.toLowerCase().includes(cityInputValue.toLowerCase()))
                        .slice(0, 10)
                        .map((city) => (
                          <button
                            key={city.slug}
                            type="button"
                            onClick={() => {
                              setBusinessForm({ ...businessForm, city: city.name });
                              setCityInputValue(city.name);
                              setShowCityDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
                          >
                            {city.name}
                          </button>
                        ))}
                    </div>
                  )}
                  {errors.business_city && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_city}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      type="text"
                      placeholder="Street address"
                      value={businessForm.address}
                      onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                      className={cn("pl-10", errors.business_address && "border-red-500")}
                    />
                  </div>
                  {errors.business_address && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_address}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of your business..."
                    value={businessForm.description}
                    onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700">Contact (optional)</span>
                  <button
                    type="button"
                    onClick={copyUserContact}
                    className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Use my contact info
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                  <PhoneInput
                    value={businessForm.phone}
                    onChange={(value) => setBusinessForm({ ...businessForm, phone: value })}
                    placeholder="+212 6XX XXX XXX"
                    defaultCountry="MA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="contact@business.com"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      type="url"
                      placeholder="https://yourbusiness.com"
                      value={businessForm.website}
                      onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={submitting} disabled={submitting}>
                Create Business & Upgrade
                {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
