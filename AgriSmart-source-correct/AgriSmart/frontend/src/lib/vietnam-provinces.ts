import administrativeData from "@/lib/vietnam-administrative-units.json";

export type AdministrativeUnit = { code: string; name: string };
export type AdministrativeDistrict = AdministrativeUnit & { wards: AdministrativeUnit[] };
export type AdministrativeProvince = AdministrativeUnit & {
  wards: AdministrativeUnit[];
  districts: AdministrativeDistrict[];
};

export const VIETNAM_PROVINCES = administrativeData.provinces as AdministrativeProvince[];
