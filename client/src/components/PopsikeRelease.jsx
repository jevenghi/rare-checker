function PopsikeRelease() {
  return (
    <li>
      <div className="thumb-container">
        {release.thumb ? (
          <img
            src={release.thumb}
            alt="Album thumbnail"
            className="thumb-image"
          />
        ) : (
          <div className="no-thumb">
            <span>No image</span>
          </div>
        )}
      </div>
      <div className="release-info">
        <>
          <div className="release-title">
            <p>{release.title}</p>
          </div>
          <div className="release-sale">
            <p>Sold for: {release.price}</p>
          </div>
          <div className="release-date">
            <p>Sold on: {release.date}</p>
          </div>
        </>
        )}
      </div>
    </li>
  );
}

export default PopsikeRelease;
