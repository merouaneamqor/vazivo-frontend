"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserCog, Copy, Check } from "lucide-react";
import {
  useAdminProvider,
  adminService,
} from "@/features/admin";
import { setImpersonation } from "@/lib/impersonation";
import { queryKeys } from "@/lib/query-client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/modal";
import { toE164 } from "@/lib/phone";
import { useCities, useCategories } from "@/hooks/useSearchMetadata";
import { toOpeningHoursMulti, openingHoursMultiToPayload, getDefaultOpeningHoursMulti } from "@/lib/opening-hours";
import { OpeningHoursEditor } from "@/components/opening-hours";
import type { AdminProviderDetail } from "@/types/admin";
import type { OpeningHoursMulti } from "@/types";
import toast from "react-hot-toast";

const labelClass = "block text-sm font-medium text-neutral-700 mb-1";
const selectClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

export default function EditProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const providerId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmImpersonate, setConfirmImpersonate] = useState(false);
  const [slugCopied, setSlugCopied] = useState(false);

  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryOther, setCategoryOther] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cityOther, setCityOther] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [openingHours, setOpeningHours] = useState<OpeningHoursMulti>(() => getDefaultOpeningHoursMulti());
  const [verificationStatus, setVerificationStatus] = useState<"verified" | "pending">("pending");

  const { data: categoriesData } = useCategories();
  const { data: citiesData } = useCities();
  const categories = categoriesData ?? [];
  const cities = citiesData ?? [];

  const { data, isLoading, error } = useAdminProvider(providerId);
  const provider = data?.provider as AdminProviderDetail | undefined;

  useEffect(() => {
    if (provider) {
      setName(provider.name ?? "");
      setAddress(provider.address ?? "");
      setDescription(provider.description ?? "");
      setPhone(provider.phone ?? "");
      setEmail(provider.email ?? "");
      setWebsite(provider.website ?? "");
      setNeighborhood(provider.neighborhood ?? "");
      setCountry(provider.country ?? "Morocco");
      setVerificationStatus(provider.verification_status ?? "pending");
      setOpeningHours(
        toOpeningHoursMulti(provider.opening_hours ?? null) ?? getDefaultOpeningHoursMulti()
      );
      const catNames = Array.isArray(provider.categories) && provider.categories.length > 0
        ? provider.categories
        : provider.category
          ? [provider.category]
          : [];
      setSelectedCategories(catNames.filter(Boolean));
      const cityVal = provider.city ?? "";
      if (cities.length > 0) {
        if (cities.some((c) => c.name === cityVal)) {
          setCity(cityVal);
          setCityOther("");
        } else {
          setCity(cityVal ? "other" : "");
          setCityOther(cityVal);
        }
      }
    }
  }, [provider, cities]);

  const copySlug = useCallback(() => {
    if (!provider?.slug) return;
    navigator.clipboard.writeText(provider.slug);
    setSlugCopied(true);
    toast.success("Slug copied");
    setTimeout(() => setSlugCopied(false), 2000);
  }, [provider?.slug]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const otherCat = categoryOther.trim();
      const list = selectedCategories.slice();
      if (otherCat && !list.includes(otherCat)) list.push(otherCat);
      return adminService.updateProvider(providerId, {
        name,
        categories: list,
        address,
        city: city === "other" ? cityOther : city,
        neighborhood: neighborhood || undefined,
        country: country || undefined,
        description: description || undefined,
        phone: (toE164(phone) ?? phone) || undefined,
        email: email || undefined,
        website: website || undefined,
        opening_hours: openingHoursMultiToPayload(openingHours),
        verification_status: verificationStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.provider(providerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers() });
      toast.success("Provider updated");
      router.push(`/admin/providers/${providerId}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update provider");
    },
  });

  const approve = useMutation({
    mutationFn: () => adminService.approveProvider(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.provider(providerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers() });
    },
  });

  const suspend = useMutation({
    mutationFn: () => adminService.suspendProvider(providerId),
    onSuccess: () => {
      setConfirmSuspend(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.provider(providerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers() });
    },
  });

  const impersonate = useMutation({
    mutationFn: async () => {
      const json = await adminService.impersonateProvider(providerId);
      if (json.access_token) {
        const maxAge = json.expires_in ?? 3600;
        document.cookie = `access_token=${json.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      return json;
    },
    onSuccess: (_, variables: { providerName?: string } | undefined) => {
      setConfirmImpersonate(false);
      setImpersonation(variables?.providerName ? `Provider: ${variables.providerName}` : "Provider");
      router.push("/provider");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCity = city === "other" ? cityOther : city;
    const hasCategories = selectedCategories.length > 0 || categoryOther.trim() !== "";
    if (!name || !hasCategories || !address || !finalCity) {
      toast.error("Name, at least one category, address, and city are required");
      return;
    }
    updateMutation.mutate();
  };

  if (Number.isNaN(providerId) || error) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">Provider not found.</p>
        <Link href="/admin/providers">
          <Button variant="outline">Back to providers</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !provider) {
    return (
      <div className="space-y-6">
        <p>Loading…</p>
      </div>
    );
  }

  const isSuspended = provider.status === "suspended";
  const services = provider.services ?? [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/providers"
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            Providers
          </Link>
          <span className="text-neutral-400">/</span>
          <Link
            href={`/admin/providers/${providerId}`}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            {provider.name}
          </Link>
          <span className="text-neutral-400">/</span>
          <span className="text-sm font-medium text-neutral-900">Edit</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/providers/${providerId}`}>
            <Button variant="ghost" size="icon" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <StatusBadge status={provider.status ?? "approved"} />
          {isSuspended && (
            <Button size="sm" onClick={() => approve.mutate()} disabled={approve.isPending}>
              {approve.isPending ? "Approving…" : "Approve"}
            </Button>
          )}
          {!isSuspended && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmSuspend(true)}
              disabled={suspend.isPending}
            >
              Suspend
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmImpersonate(true)}
            disabled={impersonate.isPending}
          >
            <UserCog className="h-4 w-4 mr-2" />
            {impersonate.isPending ? "Redirecting…" : "Impersonate"}
          </Button>
          <Link href={`/admin/providers/${providerId}`}>
            <Button variant="outline" size="sm">
              View provider
            </Button>
          </Link>
        </div>
      </div>

      <h1 className="text-2xl font-display font-bold text-neutral-900">
        Edit {provider.name}
      </h1>

      {/* Summary card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <p>
            <span className="text-neutral-500">Status:</span>{" "}
            <StatusBadge status={provider.status ?? "approved"} />
          </p>
          {provider.owner && (
            <p>
              <span className="text-neutral-500">Owner:</span> {provider.owner.name ?? "—"}
              {provider.owner.email && (
                <span className="text-neutral-600"> ({provider.owner.email})</span>
              )}
            </p>
          )}
          <p>
            <span className="text-neutral-500">Rating:</span>{" "}
            {Number.isFinite(Number(provider.average_rating))
              ? Number(provider.average_rating).toFixed(1)
              : "—"}
          </p>
          <p>
            <span className="text-neutral-500">Total bookings:</span> {provider.total_bookings ?? 0}
          </p>
          {provider.created_at && (
            <p>
              <span className="text-neutral-500">Created:</span>{" "}
              {new Date(provider.created_at).toLocaleDateString()}
            </p>
          )}
          {provider.slug && (
            <p>
              <span className="text-neutral-500">Slug:</span>{" "}
              <code className="text-xs bg-neutral-100 px-1 rounded">{provider.slug}</code>
            </p>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-2xl">
            <div>
              <Label htmlFor="name" className={labelClass}>
                Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="max-w-xl"
              />
            </div>
            <div>
              <Label className={labelClass}>Categories *</Label>
              <p className="text-xs text-neutral-500 mb-2">Select all that apply. At least one required.</p>
              <div className="flex flex-wrap gap-4 max-w-xl">
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
                      }}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">{c.name}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <Label htmlFor="category-other" className="text-sm text-neutral-600">
                  Add another category (optional)
                </Label>
                <Input
                  id="category-other"
                  className="mt-1 max-w-xs"
                  value={categoryOther}
                  onChange={(e) => setCategoryOther(e.target.value)}
                  placeholder="e.g. Barber"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className={labelClass}>
                Description
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full max-w-xl rounded-lg border border-neutral-200 px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-2xl">
            <div>
              <Label htmlFor="address" className={labelClass}>
                Address *
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="max-w-xl"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className={labelClass}>
                  City *
                </Label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="">Select city</option>
                  {cities.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {city === "other" && (
                  <Input
                    className="mt-2"
                    value={cityOther}
                    onChange={(e) => setCityOther(e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                )}
              </div>
              <div>
                <Label htmlFor="neighborhood" className={labelClass}>
                  Neighborhood
                </Label>
                <Input
                  id="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="country" className={labelClass}>
                Country
              </Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Morocco"
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-2xl">
            <div>
              <Label htmlFor="phone" className={labelClass}>
                Phone
              </Label>
              <PhoneInput
                value={phone}
                onChange={(value) => setPhone(value)}
                id="phone"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className={labelClass}>
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
              </div>
              <div>
                <Label htmlFor="website" className={labelClass}>
                  Website
                </Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  type="url"
                  placeholder="https://"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opening hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opening hours</CardTitle>
          </CardHeader>
          <CardContent>
            <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
          </CardContent>
        </Card>

        {/* Admin only */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin</CardTitle>
            <p className="text-sm text-neutral-500 mt-1">
              Read-only and verification fields.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 max-w-2xl">
            {provider.slug && (
              <div>
                <Label className={labelClass}>Slug</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
                    {provider.slug}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copySlug}
                    aria-label="Copy slug"
                  >
                    {slugCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="verification_status" className={labelClass}>
                Verification status
              </Label>
              <select
                id="verification_status"
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as "verified" | "pending")}
                className={selectClass + " max-w-xs"}
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Form actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Link href={`/admin/providers/${providerId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-2">
              {services.length} service{services.length !== 1 ? "s" : ""} —{" "}
              <Link href={`/admin/providers/${providerId}`} className="text-primary-600 hover:underline">
                View on detail page
              </Link>
            </p>
            <ul className="space-y-1 text-sm">
              {services.slice(0, 5).map((s) => (
                <li key={s.id}>
                  {s.name} — ${s.price} / {s.duration} min
                </li>
              ))}
              {services.length > 5 && (
                <li className="text-neutral-500">+{services.length - 5} more</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmSuspend} onOpenChange={setConfirmSuspend}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>Suspend this provider?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600">
            The business will be hidden from search and new bookings until approved again.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSuspend(false)}>
              No
            </Button>
            <Button
              variant="destructive"
              onClick={() => suspend.mutate()}
              disabled={suspend.isPending}
            >
              {suspend.isPending ? "Suspending…" : "Yes, suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmImpersonate} onOpenChange={setConfirmImpersonate}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>Impersonate this provider?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600">
            You will be logged in as the business owner and redirected to the provider dashboard.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmImpersonate(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => impersonate.mutate({ providerName: provider.name })}
              disabled={impersonate.isPending}
            >
              {impersonate.isPending ? "Redirecting…" : "Yes, impersonate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
