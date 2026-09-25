"use client";

import { useI18n } from "@/i18n/useI18n";
import styles from "./HelpContent.module.css";

// Example for the region rule: 4×3 grid, bold border between columns 3 and 4,
// clue "2" at row 2 / column 3. Its 3×3 area reaches column 4, which is another region.
const DEMO = {
  cols: 4,
  filled: new Set([1, 10, 3, 7]),
  counted: new Set([1, 2, 5, 6, 9, 10]),
  excluded: new Set([3, 7, 11]),
  clueAt: 6,
  clue: 2,
};

export default function HelpContent({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const { t } = useI18n();
  const h = t.help;
  const H = `h${headingLevel}` as const;

  return (
    <div className={styles.help}>
      <section>
        <H>{h.goalTitle}</H>
        <p>{h.goal}</p>
      </section>

      <section>
        <H>{h.numbersTitle}</H>
        <p>{h.numbers}</p>
        <p>
          <strong>{h.regionRule}</strong>
        </p>
        <figure className={styles.figure}>
          <div className={styles.demo} aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                className={[
                  styles.cell,
                  DEMO.filled.has(i) ? styles.filled : "",
                  DEMO.counted.has(i) ? styles.counted : "",
                  DEMO.excluded.has(i) ? styles.excluded : "",
                  i % DEMO.cols === 2 ? styles.border : "",
                ].join(" ")}
              >
                {i === DEMO.clueAt ? DEMO.clue : ""}
              </span>
            ))}
          </div>
          <figcaption>{h.diagramCaption}</figcaption>
        </figure>
      </section>

      <section>
        <H>{h.controlsTitle}</H>
        <ul>
          {h.controls.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <H>{h.statesTitle}</H>
        <ul className={styles.states}>
          <li>
            <span className={`${styles.cell} ${styles.filled}`} aria-hidden="true" />
            {h.stateFilled}
          </li>
          <li>
            <span className={`${styles.cell} ${styles.marked}`} aria-hidden="true" />
            {h.stateMarked}
          </li>
          <li>
            <span className={`${styles.cell} ${styles.satisfied}`} aria-hidden="true">
              3
            </span>
            {h.stateSatisfied}
          </li>
          <li>
            <span className={`${styles.cell} ${styles.error}`} aria-hidden="true">
              2
            </span>
            {h.stateError}
          </li>
        </ul>
        <p className="muted">{h.statesNote}</p>
      </section>

      <section>
        <H>{h.regionsTitle}</H>
        <p>{h.regions}</p>
        <p className="muted">{h.progressNote}</p>
        <p className="muted">{h.savedNote}</p>
      </section>
    </div>
  );
}
