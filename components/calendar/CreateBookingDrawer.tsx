"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parseISO, addMinutes } from "date-fns";
import { Calendar, X, ChevronLeft, ChevronRight, Search, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatPrice } from "@/lib/utils";
import { toE164 } from "@/lib/phone";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import type { Business, StaffMember, Client } from "@/types";

const STEPS = 4;

interface SelectedServiceItem {
  id: number;
  name: string;
  price: number;
  duration: number;
  staffId?: number;
  priceOverride?: number;
  discountAmount?: number;
  extraTime?: number;
}

interface CreateBookingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createSlot: { date: Date; startTime: string; endTime?: string } | null;
  business: Business | undefined;
  staffMembers: StaffMember[];
  onSubmit: (data: {
    date: string;
    start_time: string;
    end_time?: string;
    notes?: string;
    customer_name?: string;
    customer_first_name?: string;
    customer_last_name?: string;
    customer_phone?: string;
    customer_email?: string;
    /** When set, backend fills customer_* from Client. */
    client_id?: number;
    /** Single-service (legacy): use service_id + staff_id. Multi-service: use services[] (one booking, many line items). */
    service_id?: number;
    staff_id?: number;
    services?: Array<{ service_id: number; staff_id?: number; price?: number; duration_minutes?: number }>;
  }) => void;
  isSubmitting: boolean;
}

export function CreateBookingDrawer({
  open,
  onOpenChange,
  createSlot,
  business,
  staffMembers,
  onSubmit,
  isSubmitting,
}: CreateBookingDrawerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<SelectedServiceItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTimeInput, setStartTimeInput] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [clientMode, setClientMode] = useState<"existing" | "new">("new");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [selectedExistingClient, setSelectedExistingClient] = useState<Client | null>(null);

  const t = useTranslations("createBooking");

  // Fetch business clients (separate from Users / past bookings)
  const { data: clientsData } = useQuery({
    queryKey: queryKeys.businesses.clients(business!.id, { q: clientSearchQuery.trim() || undefined, per_page: 100 }),
    queryFn: () => api.getBusinessClients(business!.id, { q: clientSearchQuery.trim() || undefined, per_page: 100 }),
    enabled: !!business?.id && open,
  });

  const clients = clientsData?.clients ?? [];
  const services = business?.services ?? [];
  const resolvedDate = selectedDate ?? createSlot?.date ?? null;
  const dateStr = resolvedDate ? format(resolvedDate, "yyyy-MM-dd") : "";

  const effectiveDuration = (s: SelectedServiceItem) => (s.duration ?? 0) + (s.extraTime ?? 0);
  const effectivePrice = (s: SelectedServiceItem) => {
    const base = s.priceOverride ?? s.price;
    const discount = s.discountAmount ?? 0;
    return Math.max(0, base - discount);
  };

  const totalDuration = selectedServices.reduce((sum, s) => sum + effectiveDuration(s), 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + effectivePrice(s), 0);

  const autoEndTime = useMemo(() => {
    if (!dateStr || !startTimeInput || totalDuration === 0) return "";
    const timePart = startTimeInput.length >= 5 ? startTimeInput.slice(0, 5) : startTimeInput;
    const d = parseISO(`${dateStr}T${timePart}:00`);
    return format(addMinutes(d, totalDuration), "HH:mm");
  }, [dateStr, startTimeInput, totalDuration]);

  const slotKey = createSlot
    ? `${format(createSlot.date, "yyyy-MM-dd")}-${createSlot.startTime}-${createSlot.endTime ?? ""}`
    : "";

  useEffect(() => {
    if (open && createSlot) {
      setCurrentStep(0);
      setSelectedServices([]);
      setSelectedDate(createSlot.date);
      setStartTimeInput(createSlot.startTime ?? "");
      setCustomerFirstName("");
      setCustomerLastName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setNotes("");
      setClientMode("new");
      setClientSearchQuery("");
      setSelectedExistingClient(null);
    }
  }, [open, slotKey, createSlot]);

  const addService = (serviceId: string) => {
    const service = services.find((s) => s.id === parseInt(serviceId, 10));
    if (service && !selectedServices.find((s) => s.id === service.id)) {
      setSelectedServices([
        ...selectedServices,
        {
          id: service.id,
          name: service.name,
          price: service.price,
          duration: service.duration,
          staffId: undefined,
        },
      ]);
    }
  };

  const removeService = (serviceId: number) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== serviceId));
  };

  const updateService = (serviceId: number, updates: Partial<SelectedServiceItem>) => {
    setSelectedServices(selectedServices.map((s) => (s.id === serviceId ? { ...s, ...updates } : s)));
  };

  const updateServiceStaff = (serviceId: number, staffId: string) => {
    updateService(serviceId, { staffId: staffId === "any" ? undefined : parseInt(staffId, 10) });
  };

  const canProceedFromStep0 = selectedServices.length > 0 && resolvedDate && startTimeInput;
  const canProceedFromStep1 = true;
  const canProceedFromStep2 = true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0 || !dateStr || !startTimeInput || !business?.id) return;

    let clientId: number | undefined;
    if (selectedExistingClient?.id) {
      clientId = selectedExistingClient.id;
    } else if (
      clientMode === "new" &&
      (customerFirstName.trim() || customerLastName.trim()) &&
      (customerPhone.trim() || customerEmail.trim())
    ) {
      try {
        const res = await api.createBusinessClient(business.id, {
          first_name: customerFirstName.trim() || "Client",
          last_name: customerLastName.trim() || undefined,
          phone: customerPhone.trim() || undefined,
          email: customerEmail.trim() || undefined,
        });
        clientId = res.client.id;
      } catch (err) {
        toast.error((err as Error)?.message ?? "Failed to save client");
        return;
      }
    }

    const fullName = [customerFirstName.trim(), customerLastName.trim()].filter(Boolean).join(" ");
    const basePayload = {
      date: dateStr,
      start_time: startTimeInput,
      end_time: autoEndTime || undefined,
      notes: notes.trim() || undefined,
      ...(clientId ? { client_id: clientId } : {}),
      customer_first_name: customerFirstName.trim() || undefined,
      customer_last_name: customerLastName.trim() || undefined,
      customer_name: fullName || undefined,
      customer_phone: (toE164(customerPhone) ?? customerPhone.trim()) || undefined,
      customer_email: customerEmail.trim() || undefined,
    };

    onSubmit({
      ...basePayload,
      services: selectedServices.map((s) => ({
        service_id: s.id,
        staff_id: s.staffId,
        price: effectivePrice(s),
        duration_minutes: effectiveDuration(s),
      })),
    });
  };

  if (!createSlot) return null;

  const stepTitles = [t("stepDateServices"), t("stepCustomize"), t("stepClient"), t("stepConfirm")];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-4">
        <SheetHeader className="space-y-1 pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">{t("title")}</SheetTitle>
            <span className="text-xs text-neutral-500">
              {t("stepOf", { current: currentStep + 1, total: STEPS })}
            </span>
          </div>
          <div className="flex gap-1 pt-1">
            {Array.from({ length: STEPS }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === currentStep ? "bg-primary-600" : i < currentStep ? "bg-primary-300" : "bg-neutral-200"
                }`}
                aria-label={stepTitles[i]}
              />
            ))}
          </div>
        </SheetHeader>

        {services.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-neutral-600">{t("noServices")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-3">
            {/* Step 0: Date, time & services */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-base bg-primary-50 rounded-xl px-3 py-2 border border-primary-200">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  <span className="font-semibold text-primary-900">
                    {resolvedDate ? format(resolvedDate, "MMM d, yyyy") : ""}
                  </span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="start-time" className="text-sm font-semibold">
                      {t("startTime")} *
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTimeInput}
                      onChange={(e) => setStartTimeInput(e.target.value)}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">{t("endTime")}</Label>
                    <Input type="time" value={autoEndTime} className="h-11 rounded-xl bg-neutral-50" disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t("services")} *</Label>
                  {selectedServices.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {selectedServices.map((service) => (
                        <div
                          key={service.id}
                          className="p-3 bg-primary-50 rounded-xl border border-primary-200 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-primary-900">{service.name}</p>
                            <p className="text-xs text-primary-700">
                              {formatPrice(service.price)} · {service.duration} min
                            </p>
                          </div>
                          <button type="button" onClick={() => removeService(service.id)} className="text-red-600 hover:text-red-700 p-1">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-2 bg-neutral-100 rounded-lg">
                        <span className="text-sm font-semibold text-neutral-900">{t("total")}</span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-neutral-900">{formatPrice(totalPrice)}</p>
                          <p className="text-xs text-neutral-600">{totalDuration} min</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <Select value="" onValueChange={addService}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={t("addService")} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={String(s.id)}
                          disabled={selectedServices.some((sel) => sel.id === s.id)}
                        >
                          {s.name} — {formatPrice(s.price)} · {s.duration} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 1: Customize services */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {selectedServices.map((service) => (
                  <div key={service.id} className="p-3 bg-primary-50 rounded-xl border border-primary-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-900">{service.name}</p>
                        <p className="text-xs text-primary-700">
                          {formatPrice(effectivePrice(service))} · {effectiveDuration(service)} min
                        </p>
                      </div>
                      <button type="button" onClick={() => removeService(service.id)} className="text-red-600 hover:text-red-700 p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Select
                      value={service.staffId?.toString() ?? "any"}
                      onValueChange={(val) => updateServiceStaff(service.id, val)}
                    >
                      <SelectTrigger className="h-9 rounded-lg text-xs">
                        <SelectValue placeholder={t("anyStaff")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t("anyAvailable")}</SelectItem>
                        {staffMembers.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("priceOverride")}</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder={String(service.price)}
                          value={service.priceOverride ?? ""}
                          onChange={(e) =>
                            updateService(service.id, {
                              priceOverride: e.target.value === "" ? undefined : parseFloat(e.target.value) || 0,
                            })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("discount")}</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={service.discountAmount ?? ""}
                          onChange={(e) =>
                            updateService(service.id, {
                              discountAmount: e.target.value === "" ? undefined : parseFloat(e.target.value) || 0,
                            })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("extraTime")}</Label>
                        <Input
                          type="number"
                          min={0}
                          value={service.extraTime ?? ""}
                          onChange={(e) =>
                            updateService(service.id, {
                              extraTime: e.target.value === "" ? undefined : parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-2 bg-neutral-100 rounded-lg">
                  <span className="text-sm font-semibold text-neutral-900">{t("total")}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">{formatPrice(totalPrice)}</p>
                    <p className="text-xs text-neutral-600">{totalDuration} min</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Client – choose existing or create new */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-neutral-700">{t("customerOptional")}</p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={clientMode === "existing" ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl flex-1"
                    onClick={() => {
                      setClientMode("existing");
                      setSelectedExistingClient(null);
                    }}
                  >
                    <Search className="h-4 w-4 mr-1.5" />
                    {t("existingClient")}
                  </Button>
                  <Button
                    type="button"
                    variant={clientMode === "new" ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl flex-1"
                    onClick={() => {
                      setClientMode("new");
                      setSelectedExistingClient(null);
                      setCustomerFirstName("");
                      setCustomerLastName("");
                      setCustomerPhone("");
                      setCustomerEmail("");
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    {t("newClient")}
                  </Button>
                </div>

                {clientMode === "existing" && (
                  <>
                    {selectedExistingClient ? (
                      <div className="p-3 rounded-xl border border-primary-200 bg-primary-50 space-y-2">
                        <p className="text-sm font-medium text-neutral-900">
                          {[selectedExistingClient.first_name, selectedExistingClient.last_name].filter(Boolean).join(" ") || selectedExistingClient.name}
                        </p>
                        {selectedExistingClient.phone && (
                          <p className="text-xs text-neutral-600">{selectedExistingClient.phone}</p>
                        )}
                        {selectedExistingClient.email && (
                          <p className="text-xs text-neutral-600">{selectedExistingClient.email}</p>
                        )}
                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-xs"
                            onClick={() => {
                              setSelectedExistingClient(null);
                              setClientSearchQuery("");
                              setCustomerFirstName("");
                              setCustomerLastName("");
                            }}
                          >
                            {t("changeClient")}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-xs"
                            onClick={() => {
                              setClientMode("new");
                              setSelectedExistingClient(null);
                              setCustomerFirstName("");
                              setCustomerLastName("");
                              setCustomerPhone("");
                              setCustomerEmail("");
                            }}
                          >
                            {t("newClient")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Input
                          placeholder={t("searchClientPlaceholder")}
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          className="h-10 rounded-xl"
                        />
                        <div className="max-h-48 overflow-y-auto rounded-xl border border-neutral-200 divide-y">
                          {clients.length === 0 ? (
                            <p className="p-3 text-xs text-neutral-500">{t("noClientsFound")}</p>
                          ) : (
                            clients.map((client) => (
                              <button
                                key={client.id}
                                type="button"
                                className="w-full text-left p-3 hover:bg-neutral-50 text-sm"
                                onClick={() => {
                                  setSelectedExistingClient(client);
                                  setCustomerFirstName(client.first_name ?? client.name?.split(" ")[0] ?? "");
                                  setCustomerLastName(client.last_name ?? client.name?.split(" ").slice(1).join(" ") ?? "");
                                  setCustomerPhone(client.phone ?? "");
                                  setCustomerEmail(client.email ?? "");
                                }}
                              >
                                <span className="font-medium text-neutral-900">
                                  {[client.first_name, client.last_name].filter(Boolean).join(" ") || client.name}
                                </span>
                                {(client.phone || client.email) && (
                                  <span className="block text-xs text-neutral-500 truncate">
                                    {[client.phone, client.email].filter(Boolean).join(" · ")}
                                  </span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}

                {clientMode === "new" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        id="customer-first-name"
                        value={customerFirstName}
                        onChange={(e) => setCustomerFirstName(e.target.value)}
                        placeholder={t("firstNamePlaceholder")}
                        className="h-10 rounded-xl"
                      />
                      <Input
                        id="customer-last-name"
                        value={customerLastName}
                        onChange={(e) => setCustomerLastName(e.target.value)}
                        placeholder={t("lastNamePlaceholder")}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <PhoneInput
                      id="customer-phone"
                      value={customerPhone}
                      onChange={setCustomerPhone}
                      placeholder="+212 6XX XXX XXX"
                      className="h-10 rounded-xl"
                    />
                    <Input
                      id="customer-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      className="h-10 rounded-xl"
                    />
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-xs font-semibold text-neutral-600 mb-1">{t("keyDetailsForStaff")}</p>
                  <p className="text-xs text-neutral-500">{t("noAdditionalDetails")}</p>
                </div>
              </div>
            )}

            {/* Step 3: Notes & confirm */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-sm font-semibold">
                    {t("notesTeamOnly")}
                  </Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("notesPlaceholder")}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <p className="text-sm font-semibold text-neutral-800 mb-2">{t("summary")}</p>
                  <p className="text-xs text-neutral-600">
                    {resolvedDate && format(resolvedDate, "MMM d, yyyy")} · {startTimeInput} – {autoEndTime}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-neutral-600">
                    {selectedServices.map((s) => (
                      <li key={s.id}>
                        {s.name} · {formatPrice(effectivePrice(s))} · {effectiveDuration(s)} min
                        {s.staffId && staffMembers.find((m) => m.id === s.staffId) && (
                          <> · {staffMembers.find((m) => m.id === s.staffId)?.name}</>
                        )}
                      </li>
                    ))}
                  </ul>
                  {(customerFirstName || customerLastName) && (
                    <p className="mt-2 text-xs text-neutral-600">
                      {t("customerOptional")}: {[customerFirstName, customerLastName].filter(Boolean).join(" ")}
                    </p>
                  )}
                  <p className="mt-2 text-sm font-bold text-neutral-900">
                    {t("total")}: {formatPrice(totalPrice)} · {totalDuration} min
                  </p>
                </div>
              </div>
            )}

            <SheetFooter className="gap-2 pt-3 flex-wrap">
              {currentStep === 0 ? (
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                  {t("cancel")}
                </Button>
              ) : (
                <Button type="button" variant="ghost" onClick={() => setCurrentStep(currentStep - 1)} className="rounded-xl">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("back")}
                </Button>
              )}
              {currentStep < STEPS - 1 ? (
                <Button
                  type="button"
                  className="rounded-xl"
                  disabled={
                    (currentStep === 0 && !canProceedFromStep0) ||
                    (currentStep === 1 && !canProceedFromStep1) ||
                    (currentStep === 2 && !canProceedFromStep2)
                  }
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="rounded-xl"
                  disabled={selectedServices.length === 0 || !startTimeInput || isSubmitting}
                >
                  {isSubmitting ? t("creating") : t("create")}
                </Button>
              )}
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
