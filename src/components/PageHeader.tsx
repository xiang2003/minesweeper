"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  title: "levelSelect" | "settingsTitle";
  /** Show a "Settings" link on the right. */
  settingsLink?: boolean;
};

/** Top bar with "← Home" on the left, used by the Levels and Settings pages. */
export default function PageHeader({ title, settingsLink = false }: Props) {
  const { t } = useI18n();
  return (
    <header className="topbar">
      <Link href="/" className="btn btn-ghost btn-small" aria-label={t.backToHome}>
        {t.home}
      </Link>
      <h1>{t[title]}</h1>
      {settingsLink ? (
        <Link href="/settings/" className="btn btn-ghost btn-small">
          {t.settings}
        </Link>
      ) : (
        <span style={{ width: 76 }} aria-hidden="true" />
      )}
    </header>
  );
}
