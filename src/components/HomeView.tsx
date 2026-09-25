"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/useI18n";
import { useHydrated } from "@/lib/useHydrated";
import styles from "@/app/home.module.css";
import HelpContent from "./HelpContent";
import LanguagePicker from "./LanguagePicker";
import PlayButton from "./PlayButton";

export default function HomeView() {
  const { t, chosen } = useI18n();
  const hydrated = useHydrated();
  // First visit: ask for a language before showing the menu.
  const choosing = hydrated && !chosen;

  return (
    <main className={`page ${styles.home}`}>
      <div className={styles.logo} aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={[0, 2, 4, 5, 7].includes(i) ? styles.on : undefined} />
        ))}
      </div>
      <h1 className={styles.title}>{t.appName}</h1>

      {choosing ? (
        <section className={styles.chooser} aria-labelledby="choose-lang">
          <h2 id="choose-lang">
            Choose your language
            <br />
            <span lang="zh-Hant">選擇語言</span>
          </h2>
          <LanguagePicker large />
        </section>
      ) : (
        <>
          <p className={styles.tagline}>{t.tagline}</p>
          <nav className={styles.actions} aria-label={t.mainMenu}>
            <PlayButton />
            <Link href="/levels/" className="btn">
              {t.levelSelect}
            </Link>
            <Link href="/settings/" className="btn">
              {t.settingsAndSave}
            </Link>
          </nav>
          <section className={`card ${styles.rules}`} aria-labelledby="how-to-play">
            <h2 id="how-to-play" className={styles.rulesTitle}>
              {t.howToPlay}
            </h2>
            <HelpContent headingLevel={3} />
          </section>
        </>
      )}
    </main>
  );
}
