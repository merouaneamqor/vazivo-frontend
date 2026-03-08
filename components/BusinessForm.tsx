"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useCities, useCategories } from "@/hooks/useSearchMetadata";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { toE164 } from "@/lib/phone";
import { PageSpinner } from "@/components/ui/spinner";
import type { Business } from "@/types";
import type { OpeningHoursMulti } from "@/types";
import { toOpeningHoursMulti, openingHoursMultiToPayload, getDefaultOpeningHoursMulti } from "@/lib/opening-hours";
import { OpeningHoursEditor } from "@/components/opening-hours";

interface BusinessFormData {
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  lat: string;
  lng: string;
  phone: string;
  email: string;
  website: string;
  opening_hours: OpeningHoursMulti;
}

export interface BusinessFormFiles {
  logoFile?: File | null;
}

interface BusinessFormProps {
  initialData?: Business;
  onSubmit: (data: Record<string, unknown>, files?: BusinessFormFiles) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

/** Normalize image URL for display */
function normalizeImageUrl(url: string): string {
  if (url.startsWith("http")) return url;
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1$/, "");
  return `${apiBase}${url}`;
}

export function BusinessForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
}: BusinessFormProps) {
  const { data: citiesData, isLoading: citiesLoading } = useCities();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState<BusinessFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    lat: initialData?.lat?.toString() || "",
    lng: initialData?.lng?.toString() || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    opening_hours: toOpeningHoursMulti(initialData?.opening_hours ?? getDefaultOpeningHoursMulti()),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Logo: existing URL from API or preview URL for newly selected file; logoFile is sent on submit.
  const [logoUrl, setLogoUrl] = useState<string | null>(initialData?.logo_url ?? null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "",
        address: initialData.address || "",
        city: initialData.city || "",
        lat: initialData.lat?.toString() || "",
        lng: initialData.lng?.toString() || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        website: initialData.website || "",
        opening_hours: toOpeningHoursMulti(initialData.opening_hours ?? getDefaultOpeningHoursMulti()),
      });
      setLogoUrl(initialData.logo_url ?? null);
      setLogoFile(null);
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
    e.target.value = "";
  }, []);

  const removeLogo = useCallback(() => {
    setLogoUrl(null);
    setLogoFile(null);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Business name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Website must start with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const businessData: Record<string, unknown> = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      address: formData.address,
      city: formData.city,
      phone: (toE164(formData.phone) ?? formData.phone) || undefined,
      email: formData.email || undefined,
      website: formData.website || undefined,
      opening_hours: openingHoursMultiToPayload(formData.opening_hours),
    };

    if (formData.lat && formData.lng) {
      businessData.lat = parseFloat(formData.lat);
      businessData.lng = parseFloat(formData.lng);
    }

    // Logo: send as file when user selected a new one (backend attaches to Active Storage). Gallery managed on Photos page.
    const files: BusinessFormFiles | undefined = logoFile ? { logoFile } : undefined;
    await onSubmit(businessData, files);
  };

  if (citiesLoading || categoriesLoading) {
    return <PageSpinner />;
  }

  const cities = citiesData || [];
  const categories = categoriesData || [];

  return (
    <form id="business-form" onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Salon Beauty"
                error={errors.name}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your business..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address"
                error={errors.address}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.slug} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Latitude (optional)
                </label>
                <Input
                  name="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={handleInputChange}
                  placeholder="e.g., 33.5731"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Longitude (optional)
                </label>
                <Input
                  name="lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={handleInputChange}
                  placeholder="e.g., -7.5898"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Phone
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, phone: value }));
                  if (errors.phone) setErrors((e) => ({ ...e, phone: "" }));
                }}
                placeholder="+212 6XX XXX XXX"
                icon={<Phone className="h-5 w-5" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@business.com"
                error={errors.email}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Website
              </label>
              <Input
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://www.example.com"
                error={errors.website}
              />
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Opening Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <OpeningHoursEditor
              value={formData.opening_hours}
              onChange={(v) => setFormData((prev) => ({ ...prev, opening_hours: v }))}
            />
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo
            </CardTitle>
            <p className="text-sm text-neutral-500 mt-1">
              Upload a logo or cover image. It will be saved when you click Save below.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              {logoUrl && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 flex-shrink-0 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl.startsWith("blob:") ? logoUrl : normalizeImageUrl(logoUrl)}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="Remove logo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">{logoUrl ? "Replace logo" : "Upload logo"}</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-neutral-500">
              Manage gallery photos on the{" "}
              <Link href="/provider/photos" className="text-primary-600 hover:underline">
                Photos
              </Link>{" "}
              page.
            </p>
          </CardContent>
        </Card>

        {/* Submit Button - hidden, controlled by parent */}
        <div className="hidden">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
