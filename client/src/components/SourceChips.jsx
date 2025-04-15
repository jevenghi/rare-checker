import styles from "./SourceChips.module.css";

function SourceChips({ SOURCES, state, handleSourceChange }) {
  return (
    <div className={styles.sourceChips}>
      {Object.values(SOURCES).map((source) => (
        <button
          key={source}
          className={`${styles.chip} ${
            state.source === source ? styles.chipSelected : ""
          }`}
          onClick={() => handleSourceChange(source)}
        >
          {source.charAt(0).toUpperCase() + source.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default SourceChips;
