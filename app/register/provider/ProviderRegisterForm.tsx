"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  MapPin,
  Globe,
  Copy,
  ChevronDown,
} from "lucide-react";
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
import { useTranslations } from "next-intl";
import { ProviderRegisterParallaxPanel } from "@/components/provider/ProviderRegisterParallaxPanel";

export function ProviderRegisterForm() {
  const t = useTranslations("providerRegister.form");
  const tValidation = useTranslations("providerRegister.validation");
  const tPlaceholders = useTranslations("providerRegister.placeholders");
  const tUi = useTranslations("providerRegister.ui");
  const tToast = useTranslations("providerRegister.toast");
  const router = useRouter();
  const queryClient = useQueryClient();
  const authenticate = useAuthStore((s) => s.authenticate);

  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [businessForm, setBusinessForm] = useState({
    name: "",
    description: "",
    categories: [] as string[],
    address: "",
    city: "",
    country: DEFAULT_COUNTRY,
    neighborhood: "",
    phone: "",
    email: "",
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
  const formRef = useRef<HTMLFormElement>(null);
  const firstErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNeighborhoodInputValue(businessForm.neighborhood);
  }, [businessForm.neighborhood]);

  const handleNeighborhoodChange = (value: string) => {
    setNeighborhoodInputValue(value);
    setBusinessForm((prev) => ({ ...prev, neighborhood: value }));
    setShowNeighborhoodDropdown(true);
  };

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!userForm.firstName?.trim()) e.user_first_name = tValidation("fullNameRequired");
    if (!userForm.email?.trim()) e.user_email = tValidation("emailRequired");
    else if (!/\S+@\S+\.\S+/.test(userForm.email)) e.user_email = tValidation("invalidEmail");
    if (!userForm.password) e.user_password = tValidation("passwordRequired");
    else if (userForm.password.length < 6) e.user_password = tValidation("passwordMinLength");
    if (userForm.password !== userForm.password_confirmation) {
      e.user_password_confirmation = tValidation("passwordsDoNotMatch");
    }
    if (!businessForm.name?.trim()) e.business_name = tValidation("businessNameRequired");
    if (!businessForm.categories?.length) e.business_category = tValidation("selectCategory");
    if (!businessForm.city?.trim()) e.business_city = tValidation("cityRequired");
    if (!businessForm.address?.trim()) e.business_address = tValidation("addressRequired");
    setErrors(e);
    setApiErrors([]);
    if (Object.keys(e).length > 0) {
      firstErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  }, [userForm, businessForm, tValidation]);

  if (citiesLoading || categoriesLoading) {
    return <PageSpinner />;
  }

  const copyAccountToBusiness = () => {
    if (userForm.email) setBusinessForm((b) => ({ ...b, email: userForm.email }));
    if (userForm.phone) setBusinessForm((b) => ({ ...b, phone: userForm.phone }));
    toast.success(tToast("contactCopied"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiErrors([]);
    try {
      const data = await api.registerProvider({
        user: {
          first_name: userForm.firstName.trim(),
          last_name: userForm.lastName.trim() || undefined,
          email: userForm.email.trim().toLowerCase(),
          phone: (toE164(userForm.phone) ?? userForm.phone.trim()) || undefined,
          password: userForm.password,
          password_confirmation: userForm.password_confirmation,
        },
        business: {
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
        },
      });
      authenticate(data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success(tToast("submitSuccess"));
      router.push("/provider");
    } catch (err) {
      if (err instanceof ApiError) {
        setApiErrors(err.errors ?? [err.message]);
      } else {
        setApiErrors([tToast("genericError")]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] min-h-[480px] flex">
      <div className="flex-[1.6] min-h-0 min-w-0  overflow-hidden bg-white/95 shadow-sm">
        <div className="h-full min-h-0 flex items-start justify-center px-4 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full "
        >
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="Vazivo" className="h-10 w-10" />
            </Link>
            <h1 className="text-2xl font-display font-bold text-neutral-900">
              {t("title")}
            </h1>
            <p className="text-neutral-500 mt-1 text-sm">
              {t("subtitle")}
            </p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {apiErrors.length > 0 && (
              <div className=" bg-red-50 border border-red-200 p-4 text-sm text-red-700" role="alert">
                <p className="font-medium mb-1">{t("fixFollowing")}</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {apiErrors.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Account (owner) */}
            <section ref={firstErrorRef} className=" border border-neutral-200 bg-neutral-50/50 p-4 md:p-5">
              <h2 className="text-lg font-semibold text-neutral-800 mb-1 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-primary-600 text-sm font-bold">1</span>
                {t("account")}
              </h2>
              <p className="text-neutral-500 text-sm mb-4">{t("accountHint")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t("firstName")}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <Input
                        type="text"
                        placeholder={tPlaceholders("firstName")}
                        value={userForm.firstName}
                        onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                        className={cn("pl-10 h-11", errors.user_first_name && "border-red-500 focus:ring-red-500")}
                      />
                    </div>
                    {errors.user_first_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.user_first_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t("lastName")}</label>
                    <Input
                      type="text"
                      placeholder={tPlaceholders("lastName")}
                      value={userForm.lastName}
                      onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                      className={cn("h-11", errors.user_last_name && "border-red-500 focus:ring-red-500")}
                    />
                    {errors.user_last_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.user_last_name}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t("email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      type="email"
                      placeholder={tPlaceholders("email")}
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className={cn("pl-10 h-11", errors.user_email && "border-red-500 focus:ring-red-500")}
                    />
                  </div>
                  {errors.user_email && (
                    <p className="text-red-500 text-sm mt-1">{errors.user_email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t("phoneOptional")}</label>
                  <PhoneInput
                    value={userForm.phone}
                    onChange={(value) => setUserForm({ ...userForm, phone: value })}
                    placeholder={tPlaceholders("phone")}
                    defaultCountry="MA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t("password")}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={tPlaceholders("password")}
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className={cn(
                        "pl-10 pr-10 h-11",
                        errors.user_password && "border-red-500 focus:ring-red-500"
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
                  </div>
                  <p className="text-neutral-500 text-xs mt-1">{tPlaceholders("minChars")}</p>
                  {errors.user_password && (
                    <p className="text-red-500 text-sm mt-1">{errors.user_password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t("confirmPassword")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={tPlaceholders("confirmPassword")}
                      value={userForm.password_confirmation}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password_confirmation: e.target.value })
                      }
                      className={cn(
                        "pl-10 h-11",
                        errors.user_password_confirmation && "border-red-500 focus:ring-red-500"
                      )}
                    />
                  </div>
                  {errors.user_password_confirmation && (
                    <p className="text-red-500 text-sm mt-1">{errors.user_password_confirmation}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Business (venue) */}
            <section className=" border border-neutral-200 bg-neutral-50/50 p-4 md:p-5">
              <h2 className="text-lg font-semibold text-neutral-800 mb-1 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-primary-600 text-sm font-bold">2</span>
                {t("business")}
              </h2>
              <p className="text-neutral-500 text-sm mb-4">{t("businessHint")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t("businessName")}
                  </label>
                  <Input
                    type="text"
                    placeholder={tPlaceholders("venueName")}
                    value={businessForm.name}
                    onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                    className={cn(errors.business_name && "border-red-500 focus:ring-red-500")}
                  />
                  {errors.business_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {t("categories")}
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
                            className="rounded-lg border-neutral-300 text-primary-600 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t("country")}</label>
                  <select
                    value={businessForm.country}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, country: e.target.value })
                    }
                    className={cn(
                      "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    )}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code || "other"} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative" ref={cityDropdownRef}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t("city")}</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={t("cityPlaceholder")}
                      value={cityInputValue}
                      onChange={(e) => {
                        setCityInputValue(e.target.value);
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                      className={cn(
                        "pr-10 h-11",
                        errors.business_city && "border-red-500 focus:ring-red-500"
                      )}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                  </div>
                  {showCityDropdown && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg z-50 max-h-60 overflow-y-auto"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {citiesLoading ? (
                        <div className="px-4 py-3 text-sm text-neutral-500">{tUi("loading")}</div>
                      ) : (
                        <>
                          {cityInputValue.length < 3 ? (
                            cities
                              .filter((c) =>
                                c.name.toLowerCase().includes(cityInputValue.toLowerCase().trim())
                              )
                              .slice(0, 10)
                              .map((city) => (
                                <button
                                  key={city.slug}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setBusinessForm((prev) => ({ ...prev, city: city.name }));
                                    setCityInputValue(city.name);
                                    setShowCityDropdown(false);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 text-neutral-900"
                                >
                                  {city.name}
                                </button>
                              ))
                          ) : citySearchLoading ? (
                            <div className="px-4 py-3 text-sm text-neutral-500">{tUi("searching")}</div>
                          ) : (
                            <>
                              {cities
                                .filter((c) =>
                                  c.name.toLowerCase().includes(cityInputValue.toLowerCase().trim())
                                )
                                .slice(0, 5)
                                .map((city) => (
                                  <button
                                    key={city.slug}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      setBusinessForm((prev) => ({ ...prev, city: city.name }));
                                      setCityInputValue(city.name);
                                      setShowCityDropdown(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 text-neutral-900"
                                  >
                                    {city.name}
                                  </button>
                                ))}
                              {nominatimCityResults.length > 0 && (
                                <>
                                  <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs font-semibold text-neutral-500 uppercase">
                                    {tUi("citiesWorldwide")}
                                  </div>
                                  {nominatimCityResults.map((place) => {
                                    const label = getCityDisplayName(place);
                                    const cityName =
                                      place.address?.city ||
                                      place.address?.town ||
                                      place.address?.village ||
                                      place.address?.municipality ||
                                      place.address?.suburb ||
                                      place.address?.county ||
                                      place.address?.state ||
                                      label.split(",")[0]?.trim() ||
                                      label;
                                    const countryName = place.address?.country;
                                    return (
                                      <button
                                        key={place.place_id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                          setBusinessForm((prev) => ({
                                            ...prev,
                                            city: cityName,
                                            ...(countryName &&
                                              COUNTRIES.some((c) => c.name === countryName) && {
                                                country: countryName,
                                              }),
                                          }));
                                          setCityInputValue(cityName);
                                          setShowCityDropdown(false);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 text-neutral-900"
                                      >
                                        {label}
                                      </button>
                                    );
                                  })}
                                </>
                              )}
                            </>
                          )}
                          {cityInputValue.length >= 3 &&
                            !citySearchLoading &&
                            nominatimCityResults.length === 0 &&
                            cities.filter((c) =>
                              c.name.toLowerCase().includes(cityInputValue.toLowerCase().trim())
                            ).length === 0 && (
                              <div className="px-4 py-3 text-sm text-neutral-500">
                                {tUi("noCitiesFound")}
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  )}
                  {errors.business_city && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_city}</p>
                  )}
                </div>
                <div className="relative" ref={neighborhoodDropdownRef}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t("neighborhoodOptional")}
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={
                        businessForm.city ? t("neighborhoodPlaceholder") : t("neighborhoodPlaceholderDisabled")
                      }
                      value={neighborhoodInputValue}
                      onChange={(e) => handleNeighborhoodChange(e.target.value)}
                      onFocus={() => businessForm.city && setShowNeighborhoodDropdown(true)}
                      onBlur={() => setTimeout(() => setShowNeighborhoodDropdown(false), 200)}
                      disabled={!businessForm.city}
                      className="pr-10 h-11 disabled:bg-neutral-50 disabled:cursor-not-allowed"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                  </div>
                  {showNeighborhoodDropdown && businessForm.city && neighborhoodInputValue.length >= 2 && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg z-50 max-h-60 overflow-y-auto"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {neighborhoodSearchLoading ? (
                        <div className="px-4 py-3 text-sm text-neutral-500">{tUi("searching")}</div>
                      ) : nominatimNeighborhoodResults.length > 0 ? (
                        nominatimNeighborhoodResults.map((place) => {
                          const label =
                            getNeighborhoodDisplayName(place) || place.display_name;
                          return (
                            <button
                              key={place.place_id}
                              type="button"
                              onClick={() => {
                                setBusinessForm({
                                  ...businessForm,
                                  neighborhood: label,
                                });
                                setNeighborhoodInputValue(label);
                                setShowNeighborhoodDropdown(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 text-neutral-900"
                            >
                              {label}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-sm text-neutral-500">
                          {tUi("noNeighborhoodsFound")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{t("address")}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      type="text"
                      placeholder={tPlaceholders("streetAddress")}
                      value={businessForm.address}
                      onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                      className={cn(
                        "pl-10 h-11",
                        errors.business_address && "border-red-500 focus:ring-red-500"
                      )}
                    />
                  </div>
                  {errors.business_address && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_address}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t("descriptionOptional")}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={tPlaceholders("briefDescription")}
                    value={businessForm.description}
                    onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>
                <div className="md:col-span-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700">{t("contactOptional")}</span>
                  {(userForm.email || userForm.phone) && (
                    <button
                      type="button"
                      onClick={copyAccountToBusiness}
                      className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {t("useAccountContact")}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {t("businessPhoneOptional")}
                    </label>
                    <PhoneInput
                      value={businessForm.phone}
                      onChange={(value) => setBusinessForm({ ...businessForm, phone: value })}
                      placeholder={tPlaceholders("phone")}
                      defaultCountry="MA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {t("businessEmailOptional")}
                    </label>
                    <Input
                      type="email"
                      placeholder={tPlaceholders("contactEmail")}
                      value={businessForm.email}
                      onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t("websiteOptional")}
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      type="url"
                      placeholder={tPlaceholders("website")}
                      value={businessForm.website}
                      onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-2">
              <Button type="submit" className="w-full h-12" loading={submitting} disabled={submitting}>
                {t("registerButton")}
                {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>

          <p className="text-center text-neutral-600 mt-6 text-sm">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              {t("signIn")}
            </Link>
          </p>
        </motion.div>
        </div>
      </div>

      <ProviderRegisterParallaxPanel />
    </div>
  );
}
