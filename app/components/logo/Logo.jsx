export default function Logo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 700,
        fontSize: "1.8rem",
        background: "linear-gradient(90deg, #4f46e5, #3b82f6)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "1.2rem"
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ width: "28px", height: "28px", marginRight: "10px" }}
      >
        <path d="M9 19V6l10-2v13a3 3 0 1 1-2-2.83V8.5L11 9.5v9.5a3 3 0 1 1-2-2.83z" />
      </svg>
      Music Collection
    </div>
  );
}
