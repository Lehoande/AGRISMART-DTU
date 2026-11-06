"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { VIETNAM_PROVINCES, type AdministrativeUnit } from "@/lib/vietnam-provinces";

type UnitAutocompleteProps = {
  id?: string;
  value: string;
  options: AdministrativeUnit[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
  label: string;
};

const normalize = (value: string) => value.replace(/^(tỉnh|thành phố)\s+/i, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLocaleLowerCase("vi").trim();

function UnitAutocomplete({ id, value, options, onChange, placeholder, className, required, maxLength, disabled, label }: UnitAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const query = normalize(value);
  const suggestions = query
    ? options.filter((option) => normalize(option.name).includes(query)).slice(0, 10)
    : options.slice(0, 10);

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={(event) => { onChange(event.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        onKeyDown={(event) => { if (event.key === "Escape") setIsOpen(false); }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        required={required}
        maxLength={maxLength}
        disabled={disabled}
        aria-autocomplete="list"
        aria-expanded={isOpen && suggestions.length > 0}
      />
      {isOpen && !disabled && suggestions.length > 0 && (
        <div role="listbox" aria-label={`Gợi ý ${label}`} className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
          {suggestions.map((option) => (
            <button
              key={option.code}
              type="button"
              role="option"
              aria-selected={value === option.name}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onChange(option.name); setIsOpen(false); }}
              className="block w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-green-50 hover:text-green-800"
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProvinceAutocomplete(props: Omit<UnitAutocompleteProps, "options" | "label">) {
  return <UnitAutocomplete {...props} options={VIETNAM_PROVINCES} label="tỉnh, thành phố" />;
}

export function DistrictAutocomplete({ province, ...props }: Omit<UnitAutocompleteProps, "options" | "label" | "disabled"> & { province: string }) {
  const provinceData = VIETNAM_PROVINCES.find((item) => normalize(item.name) === normalize(province));
  return <UnitAutocomplete {...props} options={provinceData?.districts ?? []} label="quận, huyện" disabled={!provinceData} />;
}

export function CommuneAutocomplete({ province, district, ...props }: Omit<UnitAutocompleteProps, "options" | "label" | "disabled"> & { province: string; district?: string }) {
  const provinceData = VIETNAM_PROVINCES.find((item) => normalize(item.name) === normalize(province));
  const districtData = provinceData?.districts.find((item) => normalize(item.name) === normalize(district ?? ""));
  const options = districtData?.wards ?? provinceData?.wards ?? [];
  return <UnitAutocomplete {...props} options={options} label="phường, xã" disabled={!provinceData || (provinceData.districts.length > 0 && !districtData)} />;
}

export function hasDistrictOptions(province: string) {
  return VIETNAM_PROVINCES.find((item) => normalize(item.name) === normalize(province))?.districts.length ?? 0;
}
