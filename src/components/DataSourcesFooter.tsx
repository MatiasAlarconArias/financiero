import type { ReactNode } from "react";
import styles from "./DataSourcesFooter.module.css";

type Props = {
  dataYear: number;
};

type Source = {
  name: string;
  badge: string;
  description: string;
  href: string;
  label: string;
};

const SOURCES: Source[] = [
  {
    name: "World Bank API",
    badge: "Macro · Gratuita",
    description: "PIB, crecimiento, inflacion, desempleo y otros indicadores macroeconomicos nacionales.",
    href: "https://data.worldbank.org/",
    label: "data.worldbank.org",
  },
  {
    name: "Frankfurter API",
    badge: "Forex · Open source",
    description: "Tipos de cambio historicos y en tiempo real de divisas internacionales.",
    href: "https://www.frankfurter.app/",
    label: "api.frankfurter.app",
  },
  {
    name: "REST Countries",
    badge: "Geo · Gratuita",
    description: "Datos geograficos, demograficos e informacion general de paises del mundo.",
    href: "https://restcountries.com/",
    label: "restcountries.com",
  },
];

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

function DatabaseIcon() {
  return (
    <Icon>
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </Icon>
  );
}

function ExternalIcon() {
  return (
    <Icon>
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    </Icon>
  );
}

function BrandIcon() {
  return (
    <Icon>
      <path d="M5 17V9M12 17V5M19 17v-4" />
      <path d="M4 19h16" />
    </Icon>
  );
}

export default function DataSourcesFooter({ dataYear }: Props) {
  return (
    <footer id="fuentes" className={styles.footer} aria-labelledby="sources-title">
      <div className="site-container">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Fuentes de datos</p>
          <h2 id="sources-title">Transparencia y apertura</h2>
          <p>
            MacroPulse LATAM utiliza exclusivamente fuentes de datos abiertos y publicas.
            Los datos pueden variar segun disponibilidad de cada fuente.
          </p>
        </div>

        <div className={styles.sourceGrid}>
          {SOURCES.map((source) => (
            <article className={styles.sourceCard} key={source.name}>
              <div className={styles.cardTop}>
                <span className={styles.icon}><DatabaseIcon /></span>
                <span className={styles.badge}>{source.badge}</span>
              </div>
              <h3>{source.name}</h3>
              <p>{source.description}</p>
              <a href={source.href} target="_blank" rel="noreferrer">
                {source.label}
                <ExternalIcon />
              </a>
            </article>
          ))}
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.brand}>
            <span><BrandIcon /></span>
            <strong>MacroPulse <em>LATAM</em></strong>
          </div>
          <p>Plataforma de analisis economico para America Latina · Datos abiertos {dataYear} · Solo fines educativos</p>
          <small>© 2026 MacroPulse LATAM</small>
        </div>
      </div>
    </footer>
  );
}
