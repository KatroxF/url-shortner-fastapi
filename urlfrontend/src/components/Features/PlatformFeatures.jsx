import { Zap, Layers, ShieldCheck, BarChart3, Timer, Clock, Lock, CalendarRange } from "lucide-react";
import FeatureCard from "./FeatureCard";
import styles from "./PlatformFeatures.module.css";

// Every claim below comes from what SmartLink actually does.
// If you re-run the Locust benchmark and numbers change, update the first badge.
const FEATURES = [
  {
    icon: <Zap size={22} />,
    title: "Instant redirects",
    description:
      "Popular short links are cached in Redis, so repeat visits skip the database. In our local load test, median redirect time dropped from 200 ms to 99 ms.",
    badge: "99 ms median (local test)",
    badgeIcon: <Timer size={14} />,
  },
  {
    icon: <Layers size={22} />,
    title: "Tracking that never slows visitors",
    description:
      "Click data is processed in the background by a worker queue. Visitors are redirected right away while analytics are saved a moment later.",
    badge: "Background click tracking",
    badgeIcon: <Clock size={14} />,
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Secure accounts",
    description:
      "Passwords are hashed, sessions use expiring tokens, and every link is tied to its owner so only you can see its stats.",
    badge: "Rate-limited login",
    badgeIcon: <Lock size={14} />,
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Analytics for every link",
    description:
      "See total clicks, unique visitors, top countries and cities, devices and operating systems, and your busiest day.",
    badge: "Filter by date range",
    badgeIcon: <CalendarRange size={14} />,
  },
];

export default function PlatformFeatures() {
  return (
    <section className={styles.section} aria-labelledby="platform-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id="platform-heading" className={styles.heading}>
            Built for fast, trackable links
          </h2>
          <p className={styles.subheading}>
            Every redirect is cached, every click is recorded in the background,
            and every link gets its own analytics.
          </p>
        </header>

        <ul className={styles.grid}>
          {FEATURES.map((feature) => (
            <li key={feature.title} className={styles.item}>
              <FeatureCard {...feature} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}