import styles from "./DiscogsRelease.module.css";

function DiscogsRelease({ release }) {
  const isHighPrice = release.lowest_price?.value > 50;

  return (
    <li
      onClick={() => window.open(`${baseDiscogsURL}${release.id}`, "_blank")}
      className={`${styles.releaseItem} ${isHighPrice ? styles.highPrice : ""}`}
    >
      <div className={styles.thumbContainer}>
        {release.thumb ? (
          <img
            src={release.thumb}
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
        {release.blocked_from_sale ? (
          <p className={styles.blockedText}>Blocked from sale</p>
        ) : (
          <>
            <div className={styles.releaseTitle}>
              <p>
                {release.title} ({release.year},{" "}
                <i style={{ fontWeight: 300 }}>{release.desc}</i>)
              </p>
            </div>
            <div className={styles.releaseSale}>
              <p>
                For sale: {release.num_for_sale} | From:{" "}
                {release.lowest_price?.value
                  ? `${release.lowest_price.value}`
                  : "N/A"}
              </p>
            </div>
            <div className={styles.releaseWants}>
              <p>Wants: {release.demand}</p>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export default DiscogsRelease;
