"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatForDisplay, toE164, DEFAULT_REGION } from "@/lib/phone";
import { getCountryOptions, type CountryOption } from "@/lib/phone-countries";
import { SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function filterCountries(options: CountryOption[], query: string): CountryOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(q) ||
      opt.code.toLowerCase().includes(q) ||
      opt.dial.includes(q)
  );
}

export interface PhoneInputProps {
  value: string;
  onChange: (value: string, e164: string | null) => void;
  defaultCountry?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  /** Optional left icon (e.g. Phone from lucide-react); ignored when country selector is shown */
  icon?: React.ReactNode;
  error?: string;
  name?: string;
}

const countryOptions = getCountryOptions();

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      defaultCountry = DEFAULT_REGION,
      placeholder,
      id,
      className,
      disabled,
      icon,
      error,
      name,
    },
    ref
  ) => {
    const [region, setRegion] = React.useState<string>(defaultCountry);
    const [countrySearch, setCountrySearch] = React.useState("");
    const currentOption = countryOptions.find((c) => c.code === region) ?? countryOptions[0];
    const filteredOptions = React.useMemo(
      () => filterCountries(countryOptions, countrySearch),
      [countrySearch]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      onChange(next, toE164(next, region));
    };

    const handleBlur = () => {
      const e164 = toE164(value, region);
      if (e164) {
        const formatted = formatForDisplay(value, region);
        if (formatted !== value) onChange(formatted, e164);
      }
    };

    const handleCountryChange = (code: string) => {
      setRegion(code);
      if (value.trim()) {
        const e164 = toE164(value, code);
        const formatted = formatForDisplay(value, code);
        onChange(formatted, e164);
      }
    };

    return (
      <div className="w-full">
        <div
          className={cn(
            "flex rounded-lg border border-gray-300 bg-white overflow-hidden",
            "focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500",
            error && "border-red-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <SelectPrimitive.Root
            value={region}
            onValueChange={handleCountryChange}
            onOpenChange={(open) => {
              if (!open) setCountrySearch("");
            }}
            disabled={disabled}
          >
            <SelectPrimitive.Trigger
              className={cn(
                "flex h-10 w-auto min-w-0 shrink-0 items-center justify-between gap-1 rounded-none border-0 border-r border-gray-300 rounded-l-lg px-2 sm:px-3",
                "focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              )}
              aria-label="Country"
            >
              <span className="flex items-center gap-1.5 text-sm">
                <span className="text-lg leading-none">{currentOption.flag}</span>
                <span className="font-medium text-neutral-700">{currentOption.dial}</span>
              </span>
              <SelectPrimitive.Icon asChild>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Portal>
              <SelectPrimitive.Content
                className={cn(
                  "relative z-50 min-w-[16rem] overflow-hidden rounded-lg border bg-white shadow-md",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out",
                  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                  "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                )}
                position="popper"
                sideOffset={4}
              >
                <div
                  className="sticky top-0 z-10 border-b border-gray-200 bg-white p-2"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Search country..."
                      className={cn(
                        "flex h-9 w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-1.5 text-sm",
                        "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      )}
                      aria-label="Search countries"
                    />
                  </div>
                </div>
                <SelectPrimitive.Viewport className="max-h-64 p-1">
                  {filteredOptions.length === 0 ? (
                    <p className="py-4 text-center text-sm text-neutral-500">No country found</p>
                  ) : (
                    filteredOptions.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{opt.flag}</span>
                          <span>{opt.name}</span>
                          <span className="text-neutral-500 text-xs">{opt.dial}</span>
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectPrimitive.Viewport>
              </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
          </SelectPrimitive.Root>
          <div className="relative flex-1 flex items-center">
            {icon && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                {icon}
              </span>
            )}
            <Input
              ref={ref}
              type="tel"
              id={id}
              name={name}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder ?? "6XX XXX XXX"}
              className={cn(
                "h-10 rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                icon && "pl-9",
                "rounded-r-lg",
                className
              )}
              disabled={disabled}
              error={undefined}
            />
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
