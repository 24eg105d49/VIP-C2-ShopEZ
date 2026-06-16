import React from "react";

export const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div className="container" style={footerContainerStyle}>
        <p>&copy; {new Date().getFullYear()} ShopEZ. All rights reserved.</p>
        <div style={footerLinksStyle}>
          <span style={linkStyle}>Privacy Policy</span>
          <span style={linkStyle}>Terms of Service</span>
          <span style={linkStyle}>Support</span>
        </div>
      </div>
    </footer>
  );
};

const footerStyle = {
  background: "var(--dark)",
  color: "var(--text-muted)",
  padding: "24px 0",
  marginTop: "auto",
  borderTop: "1px solid var(--dark-border)",
  fontSize: "0.9rem"
};

const footerContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "16px"
};

const footerLinksStyle = {
  display: "flex",
  gap: "20px"
};

const linkStyle = {
  cursor: "pointer",
  transition: "var(--transition)"
};
