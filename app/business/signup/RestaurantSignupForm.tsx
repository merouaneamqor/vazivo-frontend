"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Mail,
  Phone,
  MapPin,
  Hash,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCities, useCategories } from "@/hooks/useSearchMetadata";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { PageSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const formLabels = {
  restaurantName: "Restaurant name",
  email: "Restaurant email",
  phone: "Restaurant phone",
  city: "City",
  numberOfTables: "Number of tables",
  cuisineType: "Cuisine type",
};

const placeholders = {
  restaurantName: "e.g. La Table du Chef",
  email: "contact@yourrestaurant.com",
  phone: "Restaurant phone number",
  city: "Select or type your city",
  numberOfTables: "e.g. 12",
  cuisineType: "Select cuisine type",
};

export function RestaurantSignupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    restaurantName: "",
    email: "",
    phone: "",
    city: "",
    numberOfTables: "",
    cuisineType: "",
  });
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityInputValue, setCityInputValue] = useState("");
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstErrorRef = useRef<HTMLDivElement>(null);

  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!form.restaurantName?.trim()) e.restaurantName = "Enter your restaurant name.";
    if (!form.email?.trim()) e.email = "Enter your restaurant email.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.phone?.trim()) e.phone = "Enter your restaurant phone number.";
    if (!form.city?.trim()) e.city = "Select or enter your city.";
    if (!form.numberOfTables?.trim()) e.numberOfTables = "Enter the number of tables.";
    else {
      const n = parseInt(form.numberOfTables, 10);
      if (isNaN(n) || n < 1 || n > 500) e.numberOfTables = "Enter a number between 1 and 500.";
    }
    if (!form.cuisineType?.trim()) e.cuisineType = "Select your cuisine type.";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      firstErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // TODO: wire to API when backend supports restaurant lead/business signup
      // await api.submitRestaurantSignup({ ... });
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
      toast.success("Thanks! We’ll be in touch soon to complete your restaurant profile.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (citiesLoading || categoriesLoading) {
    return <PageSpinner />;
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-vazivo-white rounded-2xl border border-vazivo-lightGray p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-vazivo-charcoal mb-2">We’ve received your details</h2>
        <p className="text-vazivo-warmMuted text-sm mb-6">
          Our team will contact you at <strong className="text-vazivo-charcoal">{form.email}</strong> to finish setting up your restaurant on Vazivo.
        </p>
        <Link href="/business">
          <Button variant="outline" className="border-vazivo-lightGray hover:border-vazivo-red/40 hover:text-vazivo-red">
            Back to Vazivo for Restaurants
          </Button>
        </Link>
      </motion.div>
    );
  }

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(cityInputValue.toLowerCase().trim())
  ).slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-vazivo-white rounded-2xl border border-vazivo-lightGray shadow-vazivo p-6 sm:p-8"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div ref={firstErrorRef} className="grid gap-5">
          <div>
            <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
              {formLabels.restaurantName}
            </label>
            <div className="relative">
              <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-vazivo-warmMuted" />
              <Input
                type="text"
                placeholder={placeholders.restaurantName}
                value={form.restaurantName}
                onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                className={cn(
                  "pl-10 h-11 border-vazivo-lightGray focus:ring-vazivo-red focus:border-vazivo-red",
                  errors.restaurantName && "border-vazivo-red"
                )}
              />
            </div>
            {errors.restaurantName && (
              <p className="text-vazivo-red text-sm mt-1">{errors.restaurantName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
              {formLabels.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-vazivo-warmMuted" />
              <Input
                type="email"
                placeholder={placeholders.email}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={cn(
                  "pl-10 h-11 border-vazivo-lightGray focus:ring-vazivo-red focus:border-vazivo-red",
                  errors.email && "border-vazivo-red"
                )}
              />
            </div>
            {errors.email && <p className="text-vazivo-red text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
              {formLabels.phone}
            </label>
            <PhoneInput
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
              placeholder={placeholders.phone}
              defaultCountry="MA"
            />
            {errors.phone && <p className="text-vazivo-red text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="relative" ref={cityDropdownRef}>
            <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
              {formLabels.city}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder={placeholders.city}
                value={cityInputValue || form.city}
                onChange={(e) => {
                  setCityInputValue(e.target.value);
                  setForm({ ...form, city: e.target.value });
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                className={cn(
                  "pr-10 h-11 border-vazivo-lightGray focus:ring-vazivo-red focus:border-vazivo-red",
                  errors.city && "border-vazivo-red"
                )}
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-vazivo-warmMuted pointer-events-none" />
            </div>
            {showCityDropdown && filteredCities.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-vazivo-white rounded-lg border border-vazivo-lightGray shadow-lg z-50 max-h-60 overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()}
              >
                {filteredCities.map((city) => (
                  <button
                    key={city.slug}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setForm({ ...form, city: city.name });
                      setCityInputValue(city.name);
                      setShowCityDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-vazivo-lightGray/50 text-vazivo-charcoal"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
            {errors.city && <p className="text-vazivo-red text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
              {formLabels.numberOfTables}
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-vazivo-warmMuted" />
              <Input
                type="number"
                min={1}
                max={500}
                placeholder={placeholders.numberOfTables}
                value={form.numberOfTables}
                onChange={(e) => setForm({ ...form, numberOfTables: e.target.value })}
                className={cn(
                  "pl-10 h-11 border-vazivo-lightGray focus:ring-vazivo-red focus:border-vazivo-red",
                  errors.numberOfTables && "border-vazivo-red"
                )}
              />
            </div>
            {errors.numberOfTables && (
              <p className="text-vazivo-red text-sm mt-1">{errors.numberOfTables}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-vazivo-charcoal mb-1.5">
              {formLabels.cuisineType}
            </label>
            <select
              value={form.cuisineType}
              onChange={(e) => setForm({ ...form, cuisineType: e.target.value })}
              className={cn(
                "w-full h-11 rounded-lg border bg-vazivo-white px-3 py-2.5 text-sm",
                "border-vazivo-lightGray focus:outline-none focus:ring-2 focus:ring-vazivo-red focus:border-vazivo-red",
                errors.cuisineType && "border-vazivo-red"
              )}
            >
              <option value="">{placeholders.cuisineType}</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.cuisineType && (
              <p className="text-vazivo-red text-sm mt-1">{errors.cuisineType}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-vazivo-red hover:bg-vazivo-redLight text-vazivo-white font-semibold"
          loading={submitting}
          disabled={submitting}
        >
          Submit
          {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>
    </motion.div>
  );
}
