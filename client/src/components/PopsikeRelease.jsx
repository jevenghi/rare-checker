import styles from "./DiscogsRelease.module.css";

function PopsikeRelease({ release }) {
  return (
    <li
      onClick={() => window.open(`${release.link}`, "_blank")}
      className={styles.releaseItem}
    >
      <div className={styles.thumbContainer}>
        {release.fullImagePath ? (
          <img
            src={release.fullImagePath}
            alt="Album thumbnail"
            className={styles.thumbImage}
          />
        ) : (
          <div className={styles.noThumb}>
            <span>No image</span>
          </div>
        )}
      </div>
      <div className={styles.releaseInfo}>
        <>
          <div className={styles.releaseTitle}>
            <p>{release.title}</p>
          </div>
          <div className={styles.releaseSale}>
            <p>Sold for: {release.price}</p>
          </div>
          <div className={styles.releaseWants}>
            <p>Sold on: {release.date}</p>
          </div>
        </>
      </div>
    </li>
  );
}

export default PopsikeRelease;
