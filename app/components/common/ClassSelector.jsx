import { useState, useRef, useEffect } from "react";
import styles from "./ClassSelector.module.css";
import Portal from "./Portal";

export default function ClassSelector({ selected = [], onChange, fixedClasses = null, isDisabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  const buttonRef = useRef();
  const [rect, setRect] = useState(null);
  const [dropUp, setDropUp] = useState(false);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 200; // maxHeight của dropdown
      const spaceBelow = window.innerHeight - (r.bottom + 6);
      const spaceAbove = r.top - 6;

      setDropUp(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
      setRect(r);
    }
  }, [isOpen]);
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
        ref={buttonRef}
        className={`${styles.field} ${fixedClasses || isDisabled ? styles.disabled : ""}`}
        onClick={() => !fixedClasses && !isDisabled && setIsOpen(!isOpen)}
      >
        {displayClasses.length > 0 ? (
          displayClasses.map((cls) => (
            <span key={cls} className={styles.tag} onClick={(e) => e.stopPropagation()}>
              Lớp {cls}
              {/* Hiển thị nút xóa nếu không có fixedClasses */}
              {!fixedClasses && !isDisabled && (
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

      {isOpen && !fixedClasses && rect && !isDisabled && (
        <Portal>
          <div
            className={styles.dropdown}
            style={{
              top: dropUp ? rect.top - 200 - 6 + window.scrollY : rect.bottom + 6 + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
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
        </Portal>
      )}
    </div>
  );
}
