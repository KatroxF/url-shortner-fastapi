import styles from "./FeatureCard.module.css";

/**
 * Reusable card: icon tile + title + description + optional badge line.
 * Used by PlatformFeatures. Pass icons as elements, e.g. icon={<Zap size={22} />}
 */
export default function FeatureCard({ icon, title, description, badge, badgeIcon }) {
  return (
    <article className={styles.card}>
      <span className={styles.iconTile} aria-hidden="true">
        {icon}
      </span>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        {badge && (
          <p className={styles.badge}>
            {badgeIcon && (
              <span className={styles.badgeIcon} aria-hidden="true">
                {badgeIcon}
              </span>
            )}
            {badge}
          </p>
        )}
      </div>
    </article>
  );
}