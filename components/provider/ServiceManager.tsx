"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Briefcase, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { useProviderBusiness } from "@/context/ProviderBusinessContext";
import type { Service, CategoryAct } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/modal";
import { AnimatedModal } from "@/components/ui/modal";
import { FormattedText } from "@/components/FormattedText";
import toast from "react-hot-toast";

const emptyServiceForm = {
  category_id: 0,
  service_category_id: undefined as number | undefined,
  name: "",
  name_en: "",
  name_fr: "",
  name_ar: "",
  description: "",
  description_en: "",
  description_fr: "",
  description_ar: "",
  duration: 30,
  price: 0,
};

export function ServiceManager() {
  const t = useTranslations("providerServices");
  const queryClient = useQueryClient();
  const { businesses, selectedBusinessId, isLoading: businessLoading } = useProviderBusiness();
  const firstBusiness = businesses[0];
  const businessId = selectedBusinessId ?? firstBusiness?.id;

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: queryKeys.services.list(businessId!),
    queryFn: () => api.getBusinessServices(businessId!),
    enabled: !!businessId,
  });
  const services = servicesData?.services ?? [];

  const { data: categoriesData } = useQuery({
    queryKey: ["categoriesHierarchy"],
    queryFn: () => api.getCategoriesHierarchy(),
  });

  const { data: serviceCategoriesData } = useQuery({
    queryKey: ["service-categories", businessId],
    queryFn: () => api.getServiceCategories(businessId!, false),
    enabled: !!businessId,
  });

  const categoryActs: CategoryAct[] = categoriesData?.acts ?? [];
  const serviceCategories = serviceCategoriesData?.categories ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<typeof emptyServiceForm>(emptyServiceForm);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingNames, setGeneratingNames] = useState(false);

  const filteredServices = filterCategoryId
    ? services.filter(s => s.service_category_id === filterCategoryId)
    : services;

  const openCreate = () => {
    setEditingService(null);
    setForm(emptyServiceForm);
    setFormOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      category_id: service.category_id ?? 0,
      service_category_id: service.service_category_id,
      name: service.name,
      name_en: service.name,
      name_fr: service.name,
      name_ar: service.name,
      description: service.description ?? "",
      description_en: service.description ?? "",
      description_fr: service.description ?? "",
      description_ar: service.description ?? "",
      duration: service.duration ?? 30,
      price: service.price ?? 0,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingService(null);
    setForm(emptyServiceForm);
  };

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.createService(businessId!, data),
    onSuccess: (data: unknown) => {
      const service =
        data && typeof data === "object" && "service" in data
          ? (data as { service: Service }).service
          : (data as Service);
      queryClient.invalidateQueries({ queryKey: queryKeys.services.list(businessId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.provider.dashboard });
      toast.success("Service created");
      closeForm();
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Failed to create service");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof form }) =>
      api.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.list(businessId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.provider.dashboard });
      toast.success("Service updated");
      closeForm();
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Failed to update service");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.list(businessId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.provider.dashboard });
      toast.success("Service deleted");
      setDeleteTarget(null);
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Failed to delete service");
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => 
      api.createServiceCategory(businessId!, { name, color: "#3B82F6" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories", businessId] });
      toast.success("Category created");
      setShowCategoryForm(false);
      setNewCategoryName("");
    },
    onError: () => toast.error("Failed to create category"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    if (!form.category_id) {
      toast.error("Please select a sub-category");
      return;
    }

    if (!form.service_category_id) {
      toast.error("Please select or create a category");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Please enter a service name");
      return;
    }

    const selectedSub = categoryActs
      .flatMap((act) => act.subacts)
      .find((sub) => sub.id === form.category_id);

    const payload: Record<string, unknown> = {
      category_id: form.category_id,
      service_category_id: form.service_category_id,
      // Canonical fields (still sent for backwards compatibility)
      name: form.name_en.trim(),
      description: form.description_en.trim(),
      duration: Number(form.duration) || 30,
      price: Number(form.price) || 0,
      // Localized fields used by the Rails service controller
      name_en: form.name_en.trim(),
      name_fr: form.name_fr.trim() || undefined,
      name_ar: form.name_ar.trim() || undefined,
      description_en: form.description_en.trim(),
      description_fr: form.description_fr.trim() || undefined,
      description_ar: form.description_ar.trim() || undefined,
    };
    if ((payload.duration as number) < 1 || (payload.duration as number) > 480) {
      toast.error("Duration must be between 1 and 480 minutes");
      return;
    }
    if ((payload.price as number) < 0) {
      toast.error("Price cannot be negative");
      return;
    }
    setIsSubmitting(true);
    if (editingService) {
      updateMutation.mutate(
        { id: editingService.id, data: payload as typeof form },
        { onSettled: () => setIsSubmitting(false) }
      );
    } else {
      createMutation.mutate(payload as typeof form, { onSettled: () => setIsSubmitting(false) });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };

  const handleGenerateNames = async () => {
    const selectedSub = categoryActs
      .flatMap((act) => act.subacts)
      .find((sub) => sub.id === form.category_id);
    const selectedServiceCategory = serviceCategories.find(
      (cat) => cat.id === form.service_category_id
    );

    const categoryName = selectedServiceCategory?.name ?? "";
    const subCategoryName = selectedSub?.name ?? "";

    // Prefer explicit English name; otherwise generate from category + sub-category.
    let baseName = form.name_en.trim();
    const shouldGenerateName =
      !baseName && categoryName && subCategoryName;

    if (!baseName && !shouldGenerateName) {
      baseName = selectedSub?.name || selectedServiceCategory?.name || "";
    }

    if (!baseName && !shouldGenerateName) {
      toast.error("Please select a category and sub-category, or enter a service name first");
      return;
    }

    setGeneratingNames(true);
    try {
      if (shouldGenerateName) {
        const genRes = await fetch("/api/provider/generate-service-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            categoryName,
            subCategoryName,
          }),
        });
        if (!genRes.ok) {
          const err = await genRes.json().catch(() => null);
          throw new Error(err?.error || "Failed to generate name with AI");
        }
        const genData = await genRes.json();
        baseName = (genData.name as string)?.trim() || subCategoryName || categoryName;
        setForm((f) => ({
          ...f,
          name_en: baseName,
          name: baseName,
        }));
      }

      const translate = async (target: "fr" | "ar") => {
        const response = await fetch("/api/provider/translate-service-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: baseName, target }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || "Failed to translate name with AI");
        }
        const data = await response.json();
        return (data.name as string) || "";
      };

      const [frName, arName] = await Promise.all([
        translate("fr"),
        translate("ar"),
      ]);

      setForm((f) => ({
        ...f,
        name_fr: frName || f.name_fr,
        name_ar: arName || f.name_ar,
      }));

      toast.success(shouldGenerateName ? "Name generated with AI" : "Names translated with AI");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate or translate names"
      );
    } finally {
      setGeneratingNames(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!form.name_en.trim()) {
      toast.error("Please enter a service name first");
      return;
    }

    const selectedSub = categoryActs
      .flatMap((act) => act.subacts)
      .find((sub) => sub.id === form.category_id);

    setGeneratingDescription(true);
    try {
      const makeRequest = async (locale: string) => {
        const baseName = form.name_en.trim();
        const frName = form.name_fr.trim();
        const arName = form.name_ar.trim();

        const localizedName =
          locale === "fr" ? (frName || baseName) :
          locale === "ar" ? (arName || baseName) :
          baseName;

        const response = await fetch("/api/provider/generate-service-description", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            serviceName: localizedName,
            categoryName: selectedSub?.name,
            locale,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const message =
            errorData?.error || "Failed to generate description with AI";
          throw new Error(message);
        }

        const data = await response.json();
        return (data.description as string) || "";
      };

      const [enText, frText, arText] = await Promise.all([
        makeRequest("en"),
        makeRequest("fr"),
        makeRequest("ar"),
      ]);

      setForm((f) => ({
        ...f,
        description_en: enText || f.description_en,
        description_fr: frText || f.description_fr,
        description_ar: arText || f.description_ar,
        description: enText || f.description,
      }));

      toast.success("Descriptions generated with AI");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate description"
      );
    } finally {
      setGeneratingDescription(false);
    }
  };

  const isLoading = businessLoading || servicesLoading;
  const hasBusiness = !!firstBusiness;

  return (
    <div className="w-full py-4">
    <Card className="w-full card-premium rounded-3xl relative">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
            {t("title")}
          </CardTitle>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <Button
          id="provider-add-service"
          onClick={openCreate}
          disabled={!hasBusiness}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addService")}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        {serviceCategories.length > 0 && (
          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategoryId(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterCategoryId === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("all")} ({services.length})
            </button>
            {serviceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filterCategoryId === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name} ({services.filter(s => s.service_category_id === cat.id).length})
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-neutral-100  animate-pulse"
              />
            ))}
          </div>
        ) : !hasBusiness ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 mb-3">No business found</p>
            <p className="text-sm text-neutral-400 mb-4">
              Create a business first to add services
            </p>
            <Link href="/provider/businesses/new">
              <Button>Create Business</Button>
            </Link>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 mb-3">
              {filterCategoryId ? "No services in this category" : "No services yet"}
            </p>
            <p className="text-sm text-neutral-400 mb-4">
              Add services that your business offers
            </p>
            <Button onClick={openCreate}>Add Your First Service</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredServices.map((service) => {
              const serviceCategory = serviceCategories.find(c => c.id === service.service_category_id);
              return (
              <div
                key={service.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl border border-neutral-200 bg-white hover:border-primary-200 hover:shadow-sm transition-all gap-3 sm:gap-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                    <h3 className="font-semibold text-sm sm:text-base text-neutral-900 truncate">
                      {service.name}
                    </h3>
                    {serviceCategory && (
                      <span 
                        className="inline-flex items-center rounded-full px-2 sm:px-2.5 py-0.5 text-xs font-medium gap-1.5"
                        style={{ 
                          backgroundColor: `${serviceCategory.color}15`,
                          color: serviceCategory.color 
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: serviceCategory.color }}
                        />
                        {serviceCategory.name}
                      </span>
                    )}
                    {service.parent_category_name && (
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 sm:px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                        {service.parent_category_name}
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-xs sm:text-sm text-neutral-600 mb-2 line-clamp-2">
                      <FormattedText text={service.description} as="span" />
                    </p>
                  )}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-500">
                    <span>{service.duration} min</span>
                    <span>•</span>
                    <span className="font-semibold text-neutral-900">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-4 w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(service)}
                    className="flex-1 sm:flex-none"
                  >
                    <Edit2 className="h-4 w-4 sm:mr-1.5" />
                    <span className="sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                    onClick={() => setDeleteTarget(service)}
                  >
                    <Trash2 className="h-4 w-4 sm:mr-1.5" />
                    <span className="sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {services.length > 1 && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-neutral-50">
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {services.length}
                </p>
                <p className="text-xs sm:text-sm text-neutral-500">Total Services</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-neutral-50">
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {services.filter((s) => s.is_available !== false).length}
                </p>
                <p className="text-xs sm:text-sm text-neutral-500">Available</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-neutral-50">
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {formatPrice(
                    services.length
                      ? Math.min(...services.map((s) => s.price ?? 0))
                      : 0
                  )}
                </p>
                <p className="text-xs sm:text-sm text-neutral-500">Min Price</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-neutral-50">
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {formatPrice(Math.max(...services.map((s) => s.price ?? 0)))}
                </p>
                <p className="text-xs sm:text-sm text-neutral-500">Max Price</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Create / Edit modal */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeForm();
          } else {
            setFormOpen(true);
          }
        }}
      >
        <DialogContent size="md" className="sm:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? t("editService") : t("addService")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Left column: core details */}
              <div className="space-y-4">
                {/* Categories section */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
                  <div>
                    <Label htmlFor="service_category_id">
                      {t("yourCategory")} <span className="text-red-500">{t("required")}</span>
                    </Label>
                    <select
                      id="service_category_id"
                      value={form.service_category_id || ""}
                      onChange={(e) =>
                        setForm((f) => ({ 
                          ...f, 
                          service_category_id: e.target.value ? Number(e.target.value) : undefined 
                        }))
                      }
                      required
                      className="mt-1 flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">{t("selectCategory")}</option>
                      {serviceCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {!showCategoryForm ? (
                      <button
                        type="button"
                        onClick={() => setShowCategoryForm(true)}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                      >
                        {t("createNewCategory")}
                      </button>
                    ) : (
                      <div className="mt-2 flex gap-2">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder={t("categoryName")}
                          className="text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newCategoryName.trim()) {
                                createCategoryMutation.mutate(newCategoryName.trim());
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (newCategoryName.trim()) {
                              createCategoryMutation.mutate(newCategoryName.trim());
                            }
                          }}
                          disabled={createCategoryMutation.isPending}
                        >
                          {t("add")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowCategoryForm(false);
                            setNewCategoryName("");
                          }}
                        >
                          {t("cancel")}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="category_id">{t("prestation")} {t("required")}</Label>
                    <select
                      id="category_id"
                      value={form.category_id}
                      onChange={(e) => {
                        const newCategoryId = Number(e.target.value);
                        const sub = categoryActs
                          .flatMap((act) => act.subacts)
                          .find((s) => s.id === newCategoryId);

                        setForm((f) => {
                          const shouldFillName = !f.name_en.trim();
                          const derivedName = sub?.name;

                          return {
                            ...f,
                            category_id: newCategoryId,
                            ...(shouldFillName && derivedName
                              ? { name_en: derivedName, name: derivedName }
                              : {}),
                          };
                        });
                      }}
                      required
                      className="mt-1 flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={0} disabled>
                        {t("selectSubCategory")}
                      </option>
                      {categoryActs.map((act) => (
                        <optgroup key={act.id} label={act.name}>
                          {act.subacts.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Names section */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t("serviceName")} {t("required")}</Label>
                    <button
                      type="button"
                      onClick={handleGenerateNames}
                      disabled={generatingNames}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      {generatingNames ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          Generate with AI
                        </>
                      )}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="name_en"
                      value={form.name_en}
                      onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value, name: e.target.value }))}
                      placeholder="English"
                      required
                    />
                    <Input
                      id="name_fr"
                      value={form.name_fr}
                      onChange={(e) => setForm((f) => ({ ...f, name_fr: e.target.value }))}
                      placeholder="Français"
                    />
                    <Input
                      id="name_ar"
                      value={form.name_ar}
                      onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                      placeholder="العربية"
                    />
                  </div>
                </div>

                {/* Descriptions section */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t("description")}</Label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generatingDescription}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      {generatingDescription ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          Generate with AI
                        </>
                      )}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      id="description_en"
                      value={form.description_en}
                      onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value, description: e.target.value }))}
                      placeholder="English"
                      rows={2}
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      id="description_fr"
                      value={form.description_fr}
                      onChange={(e) => setForm((f) => ({ ...f, description_fr: e.target.value }))}
                      placeholder="Français"
                      rows={2}
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      id="description_ar"
                      value={form.description_ar}
                      onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))}
                      placeholder="العربية"
                      rows={2}
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Right column: timing & pricing */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="duration">{t("duration")} {t("required")}</Label>
                      <Input
                        id="duration"
                        type="number"
                        min={1}
                        max={480}
                        value={form.duration}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            duration: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Choose how long this service usually takes.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="price">{t("price")} {t("required")}</Label>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        step={0.01}
                        value={form.price || ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            price: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="0.00"
                        className="mt-1"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Set the price clients will see when booking.
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                    <span className="font-medium">Preview:</span>{" "}
                    {form.duration || 0} min ·{" "}
                    {form.price ? formatPrice(form.price) : t("price")}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingService ? t("saveChanges") : t("createService")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AnimatedModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size="sm"
      >
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-xl font-semibold leading-none tracking-tight text-neutral-900">
            Delete service
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This
            cannot be undone.
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </AnimatedModal>
    </Card>
    </div>
  );
}
