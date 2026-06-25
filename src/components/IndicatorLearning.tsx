"use client";

import { useState } from "react";
import styles from "./IndicatorLearning.module.css";

const QUESTIONS = [
  {
    title: "Que es el PIB?",
    answer:
      "El Producto Interno Bruto (PIB) es el valor total de todos los bienes y servicios finales producidos dentro de un pais durante un ano. Es la medida mas amplia del tamano y salud de una economia. Un PIB mas alto indica una economia mas grande, aunque no necesariamente mas equitativa.",
  },
  {
    title: "Que mide la inflacion?",
    answer:
      "La inflacion mide el aumento generalizado y sostenido en el nivel de precios de bienes y servicios en un periodo determinado. Se calcula principalmente a traves del Indice de Precios al Consumidor (IPC). Una inflacion baja y estable suele considerarse saludable para la economia.",
  },
  {
    title: "Que significa la tasa de desempleo?",
    answer:
      "La tasa de desempleo es el porcentaje de personas que forman parte de la poblacion economicamente activa y que buscan trabajo activamente sin encontrarlo. No incluye a quienes dejaron de buscar empleo. Una tasa baja indica un mercado laboral mas dinamico.",
  },
  {
    title: "Por que comparar paises de la region?",
    answer:
      "Comparar indicadores economicos entre paises latinoamericanos permite identificar tendencias regionales, evaluar el impacto de distintas politicas economicas y detectar oportunidades de inversion o cooperacion. La region comparte desafios similares pero tiene trayectorias muy diversas.",
  },
];

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={isOpen ? styles.chevronOpen : styles.chevron}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function IndicatorLearning() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="aprende" className={styles.section} aria-labelledby="learning-title">
      <div className={`${styles.layout} site-container`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Aprende</p>
          <h2 id="learning-title">Entendiendo los indicadores</h2>
          <p>
            No necesitas ser economista para entender los datos. Aqui explicamos que
            significa cada indicador y por que importa.
          </p>

          <aside className={styles.fact}>
            <strong>Sabias que...?</strong>
            <p>America Latina representa aproximadamente el 8% del PIB mundial y alberga mas de 650 millones de personas.</p>
          </aside>
        </div>

        <div className={styles.accordion}>
          {QUESTIONS.map((question, index) => {
            const isOpen = openIndex === index;
            const panelId = `learning-panel-${index}`;
            const buttonId = `learning-button-${index}`;

            return (
              <article className={isOpen ? styles.itemOpen : styles.item} key={question.title}>
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(index)}
                  >
                    {question.title}
                    <Chevron isOpen={isOpen} />
                  </button>
                </h3>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={styles.panel}
                  >
                    <p>{question.answer}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
