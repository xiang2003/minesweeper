"use client";

import type { Progress } from "@/game/puzzleEngine";
import { useI18n } from "@/i18n/useI18n";
import styles from "./ProgressBar.module.css";

/** Overall fill progress as a bar + percentage, with the solved-region count underneath. */
export default function ProgressBar({ progress }: { progress: Progress }) {
  const { t } = useI18n();
  const percent = Math.round(progress.ratio * 100);

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={styles.label} id="progress-label">
          {t.progress}
        </span>
        <div
          className={styles.bar}
          role="progressbar"
          aria-labelledby="progress-label"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={t.progressValue(percent, progress.filled, progress.target)}
        >
          <span className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
        <span className={styles.count}>{percent}%</span>
      </div>
      <p className={styles.regions}>
        {t.regionsSolved}{" "}
        <strong>
          {progress.completedRegions} / {progress.totalRegions}
        </strong>
      </p>
    </div>
  );
}
