import { countries } from "countries-list";

export function getCountryInfo(countryCode: string) {
  return countries[countryCode as keyof typeof countries];
}