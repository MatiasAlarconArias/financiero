"use client";

import { useState, type ReactNode } from "react";
import { countries as countryCatalog, languages } from "countries-list";
import type { CountryEconomicData } from "./EconomicHero";
import styles from "./CountryProfile.module.css";

type Props = {
  countries: CountryEconomicData[];
  dataYear: number;
};

type InfoItem = {
  label: string;
  value: string;
  icon: ReactNode;
};

const ISO3_CODES: Record<string, string> = {
  AR: "ARG",
  BR: "BRA",
  CL: "CHL",
  CO: "COL",
  PE: "PER",
  UY: "URY",
};

const REGION_LABELS: Record<string, string> = {
  AR: "Cono Sur",
  BR: "America del Sur",
  CL: "Cono Sur",
  CO: "America Andina",
  PE: "America Andina",
  UY: "Cono Sur",
};

const CURRENCY_LABELS: Record<string, string> = {
  ARS: "Peso Argentino",
  BRL: "Real Brasileno",
  CLP: "Peso Chileno",
  COP: "Peso Colombiano",
  PEN: "Sol Peruano",
  UYU: "Peso Uruguayo",
};

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

function formatGDP(value: number | null) {
  if (value === null) return "Sin datos";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  return `$${(value / 1e9).toFixed(1)}B`;
}

function formatPopulation(value: number | null) {
  if (value === null) return "Sin datos";
  return value >= 1e6 ? `${(value / 1e6).toFixed(1)}M habitantes` : `${value.toLocaleString("es-CL")} habitantes`;
}

function formatPercent(value: number | null) {
  return value === null ? "Sin datos" : `${value.toFixed(1)}%`;
}

function getCatalogInfo(code: string) {
  return countryCatalog[code as keyof typeof countryCatalog];
}

function getLanguageLabel(code: string) {
  const languageCode = getCatalogInfo(code)?.languages?.[0] as keyof typeof languages | undefined;
  return languageCode ? languages[languageCode]?.native ?? languages[languageCode]?.name ?? languageCode : "Sin datos";
}

function getCurrencyLabel(currency: string) {
  const label = CURRENCY_LABELS[currency] ?? currency;
  return `${label} (${currency})`;
}

export default function CountryProfile({ countries, dataYear }: Props) {
  const [selectedCode, setSelectedCode] = useState(countries[0]?.code ?? "CL");
  const selected = countries.find((country) => country.code === selectedCode) ?? countries[0];

  if (!selected) return null;

  const catalogInfo = getCatalogInfo(selected.code);
  const iso3 = ISO3_CODES[selected.code] ?? selected.code;
  const capital = catalogInfo?.capital ?? "Sin datos";
  const region = REGION_LABELS[selected.code] ?? "America Latina";
  const language = getLanguageLabel(selected.code);
  const currency = getCurrencyLabel(selected.currency);

  const infoItems: InfoItem[] = [
    {
      label: "Capital",
      value: capital,
      icon: <Icon><path d="M4 21V8l8-4 8 4v13" /><path d="M9 21v-8h6v8M8 10h.01M12 10h.01M16 10h.01" /></Icon>,
    },
    {
      label: "Region",
      value: region,
      icon: <Icon><path d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></Icon>,
    },
    {
      label: "Moneda",
      value: currency,
      icon: <Icon><path d="M4 7h16v10H4z" /><path d="M8 11h4M16 13h.01" /></Icon>,
    },
    {
      label: "Idioma",
      value: language,
      icon: <Icon><path d="M4 5h7a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z" /><path d="M20 5h-7a3 3 0 0 0-3 3" /></Icon>,
    },
    {
      label: "Poblacion",
      value: formatPopulation(selected.population),
      icon: <Icon><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19M16 7a3 3 0 0 1 0 6M17 14a4 4 0 0 1 3.5 4v1" /></Icon>,
    },
    {
      label: "Codigo ISO",
      value: iso3,
      icon: <Icon><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Icon>,
    },
  ];

  return (
    <section id="perfil" className={styles.section} aria-labelledby="profile-title">
      <div className="site-container">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Perfil del pais</p>
          <h2 id="profile-title">Informacion general</h2>
          <p>Datos geograficos, economicos y demograficos clave.</p>
        </div>

        <div className={styles.layout}>
          <aside className={styles.profileCard} aria-label={`Perfil de ${selected.name}`}>
            <label className={styles.selector}>
              <span className={styles.srOnly}>Seleccionar pais</span>
              <select value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)}>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.code} {country.name}</option>
                ))}
              </select>
            </label>

            <div className={styles.countryHero}>
              <strong>{selected.code}</strong>
              <h3>{selected.name}</h3>
              <p>{region}</p>
              <span>{iso3}</span>
            </div>
          </aside>

          <article className={styles.dataCard}>
            <h3>Datos del pais</h3>

            <div className={styles.infoGrid}>
              {infoItems.map((item) => (
                <div className={styles.infoItem} key={item.label}>
                  <span className={styles.infoIcon}>{item.icon}</span>
                  <div>
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                  </div>
                </div>
              ))}
            </div>

            <dl className={styles.metrics}>
              <div>
                <dt>{formatGDP(selected.gdp)}</dt>
                <dd>PIB {dataYear}</dd>
              </div>
              <div>
                <dt className={styles.warning}>{formatPercent(selected.inflation)}</dt>
                <dd>Inflacion {dataYear}</dd>
              </div>
              <div>
                <dt className={styles.danger}>{formatPercent(selected.unemployment)}</dt>
                <dd>Desempleo {dataYear}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
