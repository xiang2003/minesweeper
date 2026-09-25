import styles from "./ProgressBar.module.css";

/** Segmented progress: one segment per region, so progress is readable without color. */
export default function ProgressBar({ completed, total }: { completed: number; total: number }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.label} id="progress-label">
        Progress
      </span>
      <div
        className={styles.bar}
        role="progressbar"
        aria-labelledby="progress-label"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
        aria-valuetext={`${completed} of ${total} regions solved`}
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={styles.segment} data-done={i < completed} />
        ))}
      </div>
      <span className={styles.count}>
        {completed} / {total}
      </span>
    </div>
  );
}
