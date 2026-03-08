"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Clock,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Image,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useSearchMetadata";

interface OnboardingWizardProps {
  onComplete: (data: BusinessFormData) => void;
  onSkip?: () => void;
}

interface BusinessFormData {
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  openingHours: Record<string, { open: string; close: string } | null>;
}

// Optional display config for category icons/descriptions (fallback when not from API)
const categoryDisplayConfig: Record<string, { icon: string; description: string }> = {
  "Beauty & Wellness": { icon: "💅", description: "Hair, nails, makeup" },
  "Spa & Massage": { icon: "🧖", description: "Relaxation & therapy" },
  "Barber Shop": { icon: "💈", description: "Men's grooming" },
  Barber: { icon: "💈", description: "Men's grooming" },
  "Fitness & Gym": { icon: "💪", description: "Training & wellness" },
  "Hair Salon": { icon: "✂️", description: "Haircuts & styling" },
  "Nails & Beauty": { icon: "💅", description: "Nails & beauty" },
  Other: { icon: "✨", description: "Other services" },
};

const defaultCategoryDisplay = { icon: "✨", description: "Beauty & wellness services" };

const cities = [
  "Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", 
  "Agadir", "Meknes", "Oujda", "Kenitra", "Tetouan"
];

const defaultHours = {
  monday: { open: "09:00", close: "19:00" },
  tuesday: { open: "09:00", close: "19:00" },
  wednesday: { open: "09:00", close: "19:00" },
  thursday: { open: "09:00", close: "19:00" },
  friday: { open: "09:00", close: "19:00" },
  saturday: { open: "10:00", close: "18:00" },
  sunday: null,
};

const steps = [
  { id: 1, title: "Business Type", icon: Briefcase },
  { id: 2, title: "Basic Info", icon: Building2 },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Hours", icon: Clock },
];

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const { data: categoriesFromApi = [], isLoading: categoriesLoading } = useCategories();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<BusinessFormData>({
    name: "",
    category: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    openingHours: defaultHours,
  });

  const progress = (currentStep / steps.length) * 100;

  const updateFormData = (updates: Partial<BusinessFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.category;
      case 2:
        return !!formData.name && !!formData.description;
      case 3:
        return !!formData.address && !!formData.city;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600  flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-neutral-900">Vazivo</span>
        </div>
        {onSkip && (
          <Button variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
        )}
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      currentStep > step.id
                        ? "bg-success-500 text-white"
                        : currentStep === step.id
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-200 text-neutral-500"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs mt-1 text-neutral-600 hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-all",
                      currentStep > step.id ? "bg-success-500" : "bg-neutral-200"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step 1: Category */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                      What type of business do you have?
                    </h2>
                    <p className="text-neutral-500 mb-6">
                      Choose the category that best describes your services
                    </p>
                    {categoriesLoading ? (
                      <p className="text-neutral-500 text-sm">Loading categories…</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categoriesFromApi.map((category) => {
                          const display = categoryDisplayConfig[category.name] ?? defaultCategoryDisplay;
                          return (
                            <button
                              key={category.slug}
                              type="button"
                              onClick={() => updateFormData({ category: category.name })}
                              className={cn(
                                "p-4  border-2 text-left transition-all",
                                formData.category === category.name
                                  ? "border-primary-500 bg-primary-50"
                                  : "border-neutral-200 hover:border-neutral-300"
                              )}
                            >
                              <span className="text-2xl mb-2 block">{display.icon}</span>
                              <p className="font-medium text-neutral-900">{category.name}</p>
                              <p className="text-xs text-neutral-500">{display.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Basic Info */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                      Tell us about your business
                    </h2>
                    <p className="text-neutral-500 mb-6">
                      This information will be displayed on your public profile
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Business Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => updateFormData({ name: e.target.value })}
                          placeholder="e.g., Salon Zahra"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => updateFormData({ description: e.target.value })}
                          placeholder="Describe your services and what makes your business special..."
                          className="w-full px-4 py-3  border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Phone
                          </label>
                          <PhoneInput
                            value={formData.phone}
                            onChange={(value) => updateFormData({ phone: value })}
                            placeholder="+212 612 345 678"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Email
                          </label>
                          <Input
                            value={formData.email}
                            onChange={(e) => updateFormData({ email: e.target.value })}
                            placeholder="contact@yourbusiness.ma"
                            type="email"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Location */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                      Where are you located?
                    </h2>
                    <p className="text-neutral-500 mb-6">
                      Help customers find you easily
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          City *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {cities.map((city) => (
                            <button
                              key={city}
                              onClick={() => updateFormData({ city })}
                              className={cn(
                                "px-4 py-2  border text-sm font-medium transition-all",
                                formData.city === city
                                  ? "border-primary-500 bg-primary-50 text-primary-700"
                                  : "border-neutral-200 hover:border-neutral-300"
                              )}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Full Address *
                        </label>
                        <Input
                          value={formData.address}
                          onChange={(e) => updateFormData({ address: e.target.value })}
                          placeholder="e.g., 123 Boulevard Mohammed V"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Hours */}
                {currentStep === 4 && (
                  <div>
                    <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                      Set your opening hours
                    </h2>
                    <p className="text-neutral-500 mb-6">
                      You can always change these later
                    </p>
                    <div className="space-y-3">
                      {Object.entries(formData.openingHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-3">
                          <span className="w-24 text-sm font-medium capitalize text-neutral-700">
                            {day}
                          </span>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hours !== null}
                              onChange={(e) => {
                                updateFormData({
                                  openingHours: {
                                    ...formData.openingHours,
                                    [day]: e.target.checked
                                      ? { open: "09:00", close: "19:00" }
                                      : null,
                                  },
                                });
                              }}
                              className="rounded-lg border-neutral-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-500">Open</span>
                          </label>
                          {hours && (
                            <>
                              <Input
                                type="time"
                                value={hours.open}
                                onChange={(e) => {
                                  updateFormData({
                                    openingHours: {
                                      ...formData.openingHours,
                                      [day]: { ...hours, open: e.target.value },
                                    },
                                  });
                                }}
                                className="w-28"
                              />
                              <span className="text-neutral-400">to</span>
                              <Input
                                type="time"
                                value={hours.close}
                                onChange={(e) => {
                                  updateFormData({
                                    openingHours: {
                                      ...formData.openingHours,
                                      [day]: { ...hours, close: e.target.value },
                                    },
                                  });
                                }}
                                className="w-28"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={nextStep} disabled={!canProceed()}>
                {currentStep === steps.length ? "Complete Setup" : "Continue"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
