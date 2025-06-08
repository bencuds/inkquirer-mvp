export default function Header({ user, onLogout }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: "1.5rem", padding: "0.5rem 1rem",
      backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px solid #ddd"
    }}>
      <div style={{ fontSize: "0.95rem", color: "#111" }}>
        Logged in as: <strong>{user.email}</strong>
      </div>
      <button
        onClick={onLogout}
        style={{
          padding: "0.5rem 1rem", backgroundColor: "#0070f3",
          color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer",
          fontWeight: "500"
        }}
      >
        Log Out
      </button>
    </div>
  );
}
