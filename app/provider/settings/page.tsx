"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building2, Clock, Bell, Loader2, Save } from "lucide-react";
import { useProviderBusiness } from "@/context/ProviderBusinessContext";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { openingHoursMultiToPayload, toOpeningHoursMulti, DAYS } from "@/lib/opening-hours";
import type { OpeningHoursMulti } from "@/types";
import toast from "react-hot-toast";

const DAY_LABEL_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export default function ProviderSettingsPage() {
  const t = useTranslations("providerSettings");
  const queryClient = useQueryClient();
  const { selectedBusiness, activeBusinessId } = useProviderBusiness();

  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [openingHours, setOpeningHours] = useState<OpeningHoursMulti>(() => ({}));
  const [notifyNewBookings, setNotifyNewBookings] = useState(true);
  const [notifyReminders, setNotifyReminders] = useState(true);
  const [notifyReviews, setNotifyReviews] = useState(true);

  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  const { data: businessData, isLoading } = useQuery({
    queryKey: queryKeys.businesses.detail(activeBusinessId!),
    queryFn: () => api.getBusinessById(activeBusinessId!),
    enabled: !!activeBusinessId,
  });

  const business = businessData?.business;

  useEffect(() => {
    if (!business) return;
    setBusinessName(business.name ?? "");
    setBusinessPhone(business.phone ?? "");
    setBusinessDescription(business.description ?? "");
    setOpeningHours(toOpeningHoursMulti(business.opening_hours ?? {}));
  }, [business]);

  const handleSaveBusiness = useCallback(async () => {
    if (!activeBusinessId) return;
    setSavingBusiness(true);
    try {
      await api.updateBusiness(activeBusinessId, {
        name: businessName.trim() || undefined,
        phone: businessPhone.trim() || undefined,
        description: businessDescription.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(activeBusinessId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.provider.businesses });
      toast.success(t("saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingBusiness(false);
    }
  }, [activeBusinessId, businessName, businessPhone, businessDescription, queryClient, t]);

  const handleSaveHours = useCallback(async () => {
    if (!activeBusinessId) return;
    setSavingHours(true);
    try {
      const payload = openingHoursMultiToPayload(openingHours);
      await api.updateBusiness(activeBusinessId, { opening_hours: payload });
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(activeBusinessId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.provider.businesses });
      toast.success(t("savedHours"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update hours");
    } finally {
      setSavingHours(false);
    }
  }, [activeBusinessId, openingHours, queryClient, t]);

  const handleSavePreferences = useCallback(() => {
    toast.success(t("savedPreferences"));
  }, [t]);

  const setDayHours = useCallback((day: string, open: string, close: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: open && close ? [{ open, close }] : [],
    }));
  }, []);

  const toggleDayClosed = useCallback((day: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: prev[day]?.length ? [] : [{ open: "09:00", close: "17:00" }],
    }));
  }, []);

  if (!activeBusinessId || (!selectedBusiness && !isLoading)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
          <Building2 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">{t("noBusiness")}</h2>
          <p className="text-neutral-500">{t("noBusinessHint")}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !business) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-neutral-600 mt-2">{t("description")}</p>
      </div>

      {/* Business Information */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Building2 className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">{t("businessInfo")}</h2>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="business-name" className="text-sm font-medium text-neutral-700">
                {t("businessName")}
              </Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={t("businessNamePlaceholder")}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-phone" className="text-sm font-medium text-neutral-700">
                {t("phoneNumber")}
              </Label>
              <PhoneInput
                id="business-phone"
                value={businessPhone}
                onChange={setBusinessPhone}
                placeholder={t("phonePlaceholder")}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-description" className="text-sm font-medium text-neutral-700">
              {t("descriptionLabel")}
            </Label>
            <textarea
              id="business-description"
              rows={4}
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              className="w-full px-4 py-3  border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none text-sm"
              placeholder={t("descriptionPlaceholder")}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveBusiness} disabled={savingBusiness} className="min-w-[140px]">
              {savingBusiness ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("saveChanges")}
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Operating Hours */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Clock className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-900">{t("operatingHours")}</h2>
            <p className="text-sm text-neutral-500 mt-0.5">{t("operatingHoursHint")}</p>
          </div>
        </div>

        <div className="space-y-3">
          {DAYS.map((day, i) => {
            const intervals = openingHours[day];
            const isClosed = !intervals || intervals.length === 0;
            const first = isClosed ? { open: "09:00", close: "17:00" } : intervals[0];
            
            return (
              <div
                key={day}
                className="flex items-center gap-4 p-4  bg-neutral-50 hover:bg-neutral-100/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-24 text-sm font-medium text-neutral-900">
                    {t(DAY_LABEL_KEYS[i])}
                  </span>
                  
                  {isClosed ? (
                    <span className="text-sm text-neutral-400 italic">Closed</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        className="w-32 h-9 text-sm"
                        value={first.open}
                        onChange={(e) => setDayHours(day, e.target.value, first.close)}
                      />
                      <span className="text-neutral-400 text-sm">—</span>
                      <Input
                        type="time"
                        className="w-32 h-9 text-sm"
                        value={first.close}
                        onChange={(e) => setDayHours(day, first.open, e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDayClosed(day)}
                  className="text-xs"
                >
                  {isClosed ? "Open" : "Close"}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSaveHours} disabled={savingHours} className="min-w-[140px]">
            {savingHours ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("updateHours")}
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Bell className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">{t("notifications")}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-4  hover:bg-neutral-50 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-neutral-900 mb-1">{t("newBookings")}</p>
              <p className="text-sm text-neutral-500">{t("newBookingsDesc")}</p>
            </div>
            <Switch checked={notifyNewBookings} onCheckedChange={setNotifyNewBookings} />
          </div>

          <div className="flex items-start justify-between gap-4 p-4  hover:bg-neutral-50 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-neutral-900 mb-1">{t("bookingReminders")}</p>
              <p className="text-sm text-neutral-500">{t("bookingRemindersDesc")}</p>
            </div>
            <Switch checked={notifyReminders} onCheckedChange={setNotifyReminders} />
          </div>

          <div className="flex items-start justify-between gap-4 p-4  hover:bg-neutral-50 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-neutral-900 mb-1">{t("customerReviews")}</p>
              <p className="text-sm text-neutral-500">{t("customerReviewsDesc")}</p>
            </div>
            <Switch checked={notifyReviews} onCheckedChange={setNotifyReviews} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSavePreferences} className="min-w-[140px]">
            <Save className="mr-2 h-4 w-4" />
            {t("savePreferences")}
          </Button>
        </div>
      </section>
    </div>
  );
}
