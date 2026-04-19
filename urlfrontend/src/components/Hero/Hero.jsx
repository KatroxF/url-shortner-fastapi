import styles from "./Hero.module.css";

function Hero() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>
        Build stronger digital connections
      </h1>

      <p className={styles.heroText}>
        Use our URL shortener to engage your
        audience and connect them to the right information.
      </p>
    </section>
  );
}

export default Hero;