import { Link2, Sparkles, Code2 } from "lucide-react";
import styles from "./AdditionalFeatures.module.css";

const EXTRAS = [
  {
    icon: <Link2 size={22} />,
    title: "Custom short codes",
    description:
      "Pick your own ending, like shortly.com/summer-sale, instead of a random string.",
  },
  {
    icon: <Sparkles size={22} />,
    title: "AI analytics summaries",
    description:
      "Ask a question about a link and get a plain-language summary of its traffic trends.",
  },
  {
    icon: <Code2 size={22} />,
    title: "REST API",
    description:
      "Create links and read their stats from your own code with a simple REST API.",
  },
];

export default function AdditionalFeatures() {
  return (
    <section className={styles.section} aria-labelledby="extras-heading">
      <div className={styles.panel}>
        <h2 id="extras-heading" className={styles.heading}>
          Also included
        </h2>

        <ul className={styles.grid}>
          {EXTRAS.map((item) => (
            <li key={item.title} className={styles.item}>
              <span className={styles.iconTile} aria-hidden="true">
                {item.icon}
              </span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}