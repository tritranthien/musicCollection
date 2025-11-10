import { useState, useRef, useEffect } from "react";
import styles from "./ClassSelector.module.css";

export default function ClassSelector({ selected = [], onChange, fixedClasses = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleClass = (cls) => {
    if (fixedClasses) return; // không cho chọn khi cố định
    const newSelection = selected.includes(cls)
      ? selected.filter((c) => c !== cls)
      : [...selected, cls];
    onChange?.(newSelection);
  };

  const removeClass = (cls) => {
    if (fixedClasses) return; // không thể xóa khi cố định
    const newSelection = selected.filter((c) => c !== cls);
    onChange?.(newSelection);
  };

  const displayClasses = fixedClasses || selected;

  return (
    <div className={styles.wrapper} ref={ref}>
      <div
        className={`${styles.field} ${fixedClasses ? styles.disabled : ""}`}
        onClick={() => !fixedClasses && setIsOpen(!isOpen)}
      >
        {displayClasses.length > 0 ? (
          displayClasses.map((cls) => (
            <span key={cls} className={styles.tag} onClick={(e) => e.stopPropagation()}>
              Lớp {cls}
              {/* Hiển thị nút xóa nếu không có fixedClasses */}
              {!fixedClasses && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeClass(cls)}
                >
                  ×
                </button>
              )}
            </span>
          ))
        ) : (
          <span className={styles.placeholder}>Chọn lớp...</span>
        )}
      </div>

      {isOpen && !fixedClasses && (
        <div className={styles.dropdown}>
          {Array.from({ length: 12 }).map((_, i) => {
            const cls = i + 1;
            const active = selected.includes(cls);
            return (
              <div
                key={cls}
                className={`${styles.option} ${active ? styles.active : ""}`}
                onClick={() => toggleClass(cls)}
              >
                Lớp {cls}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
