// src/components/Header.jsx
import React from "react";
import { supabase } from "../lib/supabaseClient";

export default function Header({ user, onLogout }) {
  const email = user?.email || "Guest";

  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem",
      backgroundColor: "#f0f4f8",
      borderBottom: "1px solid #ccc"
    }}>
      <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#333" }}>
        Logged in as: {email}
      </div>
      {user && (
        <button
          onClick={onLogout}
          style={{
            padding: "0.4rem 0.8rem",
            backgroundColor: "#e53e3e",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Log Out
        </button>
      )}
    </header>
  );
}
