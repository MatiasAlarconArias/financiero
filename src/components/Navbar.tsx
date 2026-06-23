"use client";

import { useState, type MouseEvent } from "react";
import styles from "./Navbar.module.css";

const navigation = [
  { label: "Inicio", href: "#inicio" },
  { label: "Resumen", href: "#resumen" },
  { label: "Comparador", href: "#comparador" },
  { label: "Gráficos", href: "#graficos" },
  { label: "Rankings", href: "#rankings" },
  { label: "Conversor", href: "#conversor" },
  { label: "Fuentes", href: "#fuentes" },
] as const;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();
    setIsMenuOpen(false);

    const section = document.querySelector(href);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
    }
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navbar} aria-label="Navegación principal">
        <div className={styles.navbarContent}>
          <a
            className={styles.logo}
            href="#inicio"
            onClick={(event) => handleNavigation(event, "#inicio")}
          >
            MacroPulse <span>LATAM</span>
          </a>

          <div className={styles.desktopLinks}>
            {navigation.map((item) => (
              <a
                key={item.href}
                className={styles.navLink}
                href={item.href}
                onClick={(event) => handleNavigation(event, item.href)}
              >
                {item.label}
              </a>
            ))}
          </div>

          <a
            className={styles.compareButton}
            href="#comparador"
            onClick={(event) => handleNavigation(event, "#comparador")}
          >
            Comparar países
          </a>

          <button
            type="button"
            className={`${styles.menuButton} ${isMenuOpen ? styles.menuOpen : ""}`}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          >
            <span className={styles.screenReaderOnly}>
              {isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            </span>
            <span className={styles.hamburger} aria-hidden="true">
              <span className={`${styles.line} ${styles.lineTop}`} />
              <span className={`${styles.line} ${styles.lineMiddle}`} />
              <span className={`${styles.line} ${styles.lineBottom}`} />
            </span>
          </button>
        </div>

        {isMenuOpen && (
          <div id="mobile-navigation" className={styles.mobileMenu}>
            {navigation.map((item) => (
              <a
                key={item.href}
                className={styles.mobileLink}
                href={item.href}
                onClick={(event) => handleNavigation(event, item.href)}
              >
                {item.label}
              </a>
            ))}

            <a
              className={styles.mobileCompareButton}
              href="#comparador"
              onClick={(event) => handleNavigation(event, "#comparador")}
            >
              Comparar países
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
