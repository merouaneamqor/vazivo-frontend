"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { adminService, useAdminUsers } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toE164 } from "@/lib/phone";
import { useCities, useCategories } from "@/hooks/useSearchMetadata";
import { getDefaultOpeningHoursMulti, openingHoursMultiToPayload } from "@/lib/opening-hours";
import { OpeningHoursEditor } from "@/components/opening-hours";
import type { OpeningHoursMulti } from "@/types";
import toast from "react-hot-toast";

export default function NewProviderPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryOther, setCategoryOther] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cityOther, setCityOther] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [openingHours, setOpeningHours] = useState<OpeningHoursMulti>(getDefaultOpeningHoursMulti());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: usersData } = useAdminUsers({ role: "provider", per_page: 100 });
  const { data: categoriesData } = useCategories();
  const { data: citiesData } = useCities();

  const categories = categoriesData ?? [];
  const cities = citiesData ?? [];
  const users = usersData?.users ?? [];

  const createMutation = useMutation({
    mutationFn: () => {
      const otherCat = categoryOther.trim();
      const list = selectedCategories.slice();
      if (otherCat && !list.includes(otherCat)) list.push(otherCat);
      return adminService.createProvider({
        user_id: Number(userId),
        name,
        categories: list,
        address,
        city: city === "other" ? cityOther : city,
        description: description || undefined,
        phone: (toE164(phone) ?? phone) || undefined,
        email: email || undefined,
        website: website || undefined,
        opening_hours: openingHoursMultiToPayload(openingHours),
      });
    },
    onSuccess: (data) => {
      toast.success("Provider created");
      router.push(`/admin/providers/${data.provider.id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create provider");
    },
  });

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!userId) next.owner = "Select an owner.";
    if (!name?.trim()) next.name = "Name is required.";
    const hasCategories = selectedCategories.length > 0 || categoryOther.trim() !== "";
    if (!hasCategories) next.category = "At least one category is required.";
    if (!address?.trim()) next.address = "Address is required.";
    const finalCity = city === "other" ? cityOther : city;
    if (!finalCity?.trim()) next.city = "City is required.";
    if (website && !/^https?:\/\//i.test(website)) next.website = "Website must start with http:// or https://";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors below.");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/providers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold text-neutral-900">
          Create provider
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New provider</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-700 border-b border-neutral-200 pb-1">
                Owner
              </h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Owner (user) *
                </label>
                <select
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    if (errors.owner) setErrors((prev) => ({ ...prev, owner: "" }));
                  }}
                  required
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  aria-invalid={!!errors.owner}
                >
                  <option value="">Select owner</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                {errors.owner && <p className="text-xs text-red-600 mt-1">{errors.owner}</p>}
                {users.length === 0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    No users with role provider. Create a user with role provider first.
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-700 border-b border-neutral-200 pb-1">
                Business info
              </h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  required
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Categories *</label>
                <p className="text-xs text-neutral-500 mb-2">Select all that apply. At least one required.</p>
                <div className="flex flex-wrap gap-4">
                  {categories.map((c) => (
                    <label key={c.slug} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(c.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories((prev) => [...prev, c.name].sort());
                          } else {
                            setSelectedCategories((prev) => prev.filter((x) => x !== c.name));
                          }
                          if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                        }}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700">{c.name}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-neutral-600 mb-1">Add another category (optional)</label>
                  <Input
                    value={categoryOther}
                    onChange={(e) => {
                      setCategoryOther(e.target.value);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                    }}
                    placeholder="e.g. Barber"
                    className="max-w-xs"
                    aria-invalid={!!errors.category}
                  />
                </div>
                {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Address *</label>
                <Input
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: "" }));
                  }}
                  required
                  aria-invalid={!!errors.address}
                />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">City *</label>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                  }}
                  required
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  aria-invalid={!!errors.city}
                >
                  <option value="">Select city</option>
                  {cities.map((c) => (
                    <option key={c.slug} value={c.name}>{c.name}</option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {city === "other" && (
                  <Input
                    className="mt-2"
                    value={cityOther}
                    onChange={(e) => setCityOther(e.target.value)}
                    placeholder="Enter city"
                    required={city === "other"}
                    aria-invalid={!!errors.city}
                  />
                )}
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-700 border-b border-neutral-200 pb-1">
                Opening hours
              </h3>
              <OpeningHoursEditor
                value={openingHours}
                onChange={setOpeningHours}
              />
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-700 border-b border-neutral-200 pb-1">
                Contact
              </h3>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                <PhoneInput value={phone} onChange={(value) => setPhone(value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Website</label>
                <Input
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    if (errors.website) setErrors((prev) => ({ ...prev, website: "" }));
                  }}
                  type="url"
                  placeholder="https://"
                  aria-invalid={!!errors.website}
                />
                {errors.website && <p className="text-xs text-red-600 mt-1">{errors.website}</p>}
              </div>
            </section>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create provider"}
              </Button>
              <Link href="/admin/providers">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
