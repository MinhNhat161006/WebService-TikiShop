import { useState } from "react";
import { Link } from "react-router-dom";
import { FadeIn, Reveal } from "@/shared/ui";
import { aboutI18n, type Locale } from "./i18n";
import styles from "./AboutPage.module.css";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
];

export default function AboutPage() {
  const [locale, setLocale] = useState<Locale>("vi");
  const t = aboutI18n[locale];

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Language switcher + breadcrumb */}
        <div className={styles.langBar}>
          <span className={styles.langLabel}>{t.langLabel}:</span>
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`${styles.langBtn} ${locale === l.code ? styles.langBtnActive : ""}`}
              onClick={() => setLocale(l.code)}
              aria-pressed={locale === l.code}
            >
              {l.label}
            </button>
          ))}
        </div>

        <FadeIn>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/">{t.nav.home}</Link>
            <span className={styles.sep}>›</span>
            <span>{t.nav.about}</span>
          </nav>
        </FadeIn>

        {/* Hero */}
        <FadeIn>
          <section className={styles.hero}>
            <h1 className={styles.heroHeadline}>{t.hero.headline}</h1>
            <p className={styles.heroSub}>{t.hero.subtitle}</p>
            <div className={styles.heroCtas}>
              <Link to="/" className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}>
                {t.hero.cta1}
              </Link>
              <Link to="/danh-muc" className={`${styles.heroBtn} ${styles.heroBtnGhost}`}>
                {t.hero.cta2}
              </Link>
            </div>
          </section>
        </FadeIn>

        {/* Who we are */}
        <Reveal>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{t.whoWeAre.title}</h2>
            <div className={styles.aboutText}>
              <p>{t.whoWeAre.p1}</p>
              <p>{t.whoWeAre.p2}</p>
            </div>
          </section>
        </Reveal>

        {/* Mission */}
        <Reveal>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{t.mission.title}</h2>
            <ul className={styles.missionList}>
              {t.mission.items.map((item, i) => (
                <li key={i} className={styles.missionItem}>
                  <span className={styles.missionCheck} aria-hidden>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* Core Values */}
        <Reveal>
          <section style={{ marginBottom: "clamp(20px, 3vw, 32px)" }}>
            <h2 className={styles.sectionTitle}>{t.values.title}</h2>
            <div className={styles.valuesGrid}>
              {t.values.items.map((v, i) => (
                <div key={i} className={styles.valueCard}>
                  <span className={styles.valueIcon} aria-hidden>{v.icon}</span>
                  <div>
                    <div className={styles.valueLabel}>{v.label}</div>
                    <div className={styles.valueDesc}>{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Metrics */}
        <Reveal>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{t.metrics.title}</h2>
            <div className={styles.metricsGrid}>
              {t.metrics.items.map((m, i) => (
                <div key={i} className={styles.metricCard}>
                  <div className={styles.metricValue}>{m.value}</div>
                  <div className={styles.metricLabel}>{m.label}</div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Why shop with us */}
        <Reveal>
          <section style={{ marginBottom: "clamp(20px, 3vw, 32px)" }}>
            <h2 className={styles.sectionTitle}>{t.whyShop.title}</h2>
            <p className={styles.sectionSub}>{t.whyShop.subtitle}</p>
            <div className={styles.whyGrid}>
              {t.whyShop.items.map((w, i) => (
                <div key={i} className={styles.whyCard}>
                  <span className={styles.whyIcon} aria-hidden>{w.icon}</span>
                  <div>
                    <div className={styles.whyTitle}>{w.title}</div>
                    <div className={styles.whyDesc}>{w.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Technology & Experience */}
        <Reveal>
          <section className={`${styles.panel} ${styles.techSection}`}>
            <h2 className={styles.panelTitle}>{t.tech.title}</h2>
            <p className={styles.sectionSub} style={{ marginBottom: 16 }}>{t.tech.subtitle}</p>
            <ul className={styles.techList}>
              {t.tech.items.map((item, i) => (
                <li key={i} className={styles.techItem}>
                  <span className={styles.techDot} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* CTA banner */}
        <Reveal>
          <section className={styles.ctaBanner}>
            <h2 className={styles.ctaTitle}>{t.cta.title}</h2>
            <p className={styles.ctaSub}>{t.cta.subtitle}</p>
            <div className={styles.ctaBtns}>
              <Link to="/" className={styles.ctaBtnPrimary}>
                {t.cta.btn1}
              </Link>
              <a href="#footer" className={styles.ctaBtnGhost}>
                {t.cta.btn2}
              </a>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
