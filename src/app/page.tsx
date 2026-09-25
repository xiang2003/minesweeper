import Link from "next/link";
import PlayButton from "@/components/PlayButton";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={`page ${styles.home}`}>
      <div className={styles.logo} aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={[0, 2, 4, 5, 7].includes(i) ? styles.on : undefined} />
        ))}
      </div>
      <h1 className={styles.title}>Mosaic Puzzle</h1>
      <p className={styles.tagline}>Fill the grid by logic. Reveal the picture, one region at a time.</p>

      <nav className={styles.actions} aria-label="Main menu">
        <PlayButton />
        <Link href="/levels/" className="btn">
          Level Select
        </Link>
        <Link href="/settings/" className="btn">
          Settings &amp; Save Data
        </Link>
      </nav>

      <section className={`card ${styles.rules}`} aria-labelledby="how-to-play">
        <h2 id="how-to-play">How to play</h2>
        <ul>
          <li>
            A number tells how many cells are filled in the square around it (<strong>3×3</strong> in most levels),
            including the number&apos;s own cell.
          </li>
          <li>Click or tap a cell to fill it. Right-click (or use Mark mode) to mark a cell you know is empty.</li>
          <li>Drag to fill or mark several cells at once.</li>
          <li>When every cell of a region is correct, that part of the picture is revealed.</li>
          <li>Keyboard: arrow keys to move, Space/Enter to fill, X to mark.</li>
        </ul>
      </section>
    </main>
  );
}
