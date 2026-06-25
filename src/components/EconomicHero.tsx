"use client";

import { useMemo, useState } from "react";
import styles from "./EconomicHero.module.css";

export type CountryEconomicData = {
  code: string;
  name: string;
  currency: string;
  gdp: number | null;
  inflation: number | null;
  unemployment: number | null;
  population: number | null;
  exchangeRate: number | null;
  trend: { year: number; value: number | null }[];
  histories: {
    gdpGrowth: { year: number; value: number | null }[];
    inflation: { year: number; value: number | null }[];
    unemployment: { year: number; value: number | null }[];
  };
};

type EconomicHeroProps = {
  countries: CountryEconomicData[];
  dataYear: number;
};

const CHART_WIDTH = 620;
const CHART_HEIGHT = 168;
const PAD_X = 20;
const PAD_Y = 12;
const Y_MIN = -12;
const Y_MAX = 12;

function formatGDP(value: number | null) {
  if (value === null) return "Sin datos";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  return `$${(value / 1e9).toFixed(1)}B`;
}

function formatPercent(value: number | null) {
  return value === null ? "Sin datos" : `${value.toFixed(1)}%`;
}

function makeSmoothPath(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const midX = (previous.x + point.x) / 2;
    return `${path} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m8 3 4 6 4-6M8 3h8v7a4 4 0 0 1-8 0V3Z" />
      <path d="m12 14 2 1 2.2-.2-.5 2.2 1 2-2.2.3L12 21l-1.5-1.7-2.2-.3 1-2-.5-2.2L11 15l1-1Z" />
    </svg>
  );
}

export default function EconomicHero({ countries, dataYear }: EconomicHeroProps) {
  const [selectedCode, setSelectedCode] = useState(countries[0]?.code ?? "CL");
  const selected = countries.find((country) => country.code === selectedCode) ?? countries[0];

  const chart = useMemo(() => {
    const valid = selected.trend.filter(
      (item): item is { year: number; value: number } => item.value !== null,
    );
    const points = valid.map((item, index) => ({
      x: PAD_X + (index / Math.max(valid.length - 1, 1)) * (CHART_WIDTH - PAD_X * 2),
      y:
        PAD_Y +
        ((Y_MAX - Math.max(Y_MIN, Math.min(Y_MAX, item.value))) / (Y_MAX - Y_MIN)) *
          (CHART_HEIGHT - PAD_Y * 2),
    }));
    return { path: makeSmoothPath(points), years: selected.trend.map((item) => item.year) };
  }, [selected]);

  const growth = selected.trend.at(-1)?.value ?? null;
  const trendStartYear = selected.trend.at(0)?.year ?? dataYear;
  const trendEndYear = selected.trend.at(-1)?.year ?? dataYear;

  return (
    <main id="inicio" className={styles.hero}>
      <div className={styles.gridTexture} aria-hidden="true" />
      <div className={`${styles.container} site-container`}>
        <section className={styles.copy} aria-labelledby="hero-title">
          <div className={styles.eyebrow}>
            <span /> Datos {dataYear} · {countries.length} países de América Latina
          </div>

          <h1 id="hero-title">
            Indicadores económicos de <em>América Latina</em> en un solo lugar
          </h1>
          <p className={styles.lead}>
            Explora PIB, inflación, crecimiento, población, desempleo y tipo de cambio
            con datos abiertos y visualizaciones claras.
          </p>

          <div className={styles.actions}>
            <a href="#comparador" className={styles.primaryAction}>
              <GlobeIcon /> Comparar países
            </a>
            <a href="#rankings" className={styles.secondaryAction}>
              <MedalIcon /> Ver rankings
            </a>
          </div>

          <dl className={styles.stats}>
            <div><dt>{countries.length}</dt><dd>Países</dd></div>
            <div><dt>6</dt><dd>Indicadores</dd></div>
            <div><dt>{dataYear}</dt><dd>Año base</dd></div>
          </dl>
        </section>

        <section className={styles.dashboard} aria-label={`Indicadores de ${selected.name}`}>
          <div className={styles.dashboardTop}>
            <div>
              <span className={styles.kicker}>Crecimiento del PIB</span>
              <h2>Tendencia {trendStartYear}–{trendEndYear}</h2>
            </div>
            <label className={styles.countrySelect}>
              <span className={styles.flagCode}>{selected.code}</span>
              <span className={styles.srOnly}>Seleccionar país</span>
              <select value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)}>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.chartWrap}>
            <div className={styles.yLabels} aria-hidden="true">
              {[12, 6, 0, -6, -12].map((label) => <span key={label}>{label}</span>)}
            </div>
            <svg className={styles.chart} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label={`Crecimiento anual del PIB de ${selected.name}, de ${trendStartYear} a ${trendEndYear}`}>
              <defs>
                <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity=".15" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3, 4].map((line) => (
                <line key={line} x1="0" x2={CHART_WIDTH} y1={PAD_Y + line * ((CHART_HEIGHT - PAD_Y * 2) / 4)} y2={PAD_Y + line * ((CHART_HEIGHT - PAD_Y * 2) / 4)} className={styles.gridLine} />
              ))}
              {chart.path && <>
                <path d={`${chart.path} L ${CHART_WIDTH - PAD_X} ${CHART_HEIGHT - PAD_Y} L ${PAD_X} ${CHART_HEIGHT - PAD_Y} Z`} fill="url(#chartArea)" />
                <path d={chart.path} className={styles.chartLine} />
              </>}
            </svg>
            <div className={styles.xLabels} aria-hidden="true">
              {chart.years.map((year) => <span key={year}>{year}</span>)}
            </div>
          </div>

          <div className={styles.metricGrid}>
            <article><span>PIB</span><strong>{formatGDP(selected.gdp)}</strong><small className={growth !== null && growth >= 0 ? styles.positive : styles.negative}>{growth === null ? "Sin datos" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}</small></article>
            <article><span>Inflación</span><strong>{formatPercent(selected.inflation)}</strong><small className={styles.warning}>IPC anual</small></article>
            <article><span>Desempleo</span><strong>{formatPercent(selected.unemployment)}</strong><small className={styles.teal}>tasa</small></article>
          </div>

          <footer className={styles.cardFooter}>
            <span>{selected.code} {selected.name} · {selected.currency}</span>
            <span className={styles.source}><i aria-hidden="true" /> World Bank {dataYear}</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
