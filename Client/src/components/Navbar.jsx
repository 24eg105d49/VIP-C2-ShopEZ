import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ShoppingCart, User, Search, LogOut, Shield } from "lucide-react";

export const Navbar = () => {
  const { user, cart, logout, setSearch } = useApp();
  const [localSearch, setLocalSearch] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(localSearch);
    navigate(`/products?search=${encodeURIComponent(localSearch)}`);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const isAdmin = user && user.usertype === "Admin";

  return (
    <header style={headerStyle}>
      <div className="container" style={navContainerStyle}>
        {/* Logo */}
        <Link to={isAdmin ? "/admin" : "/"} style={logoStyle}>
          ShopEZ {isAdmin && <span style={adminBadgeStyle}>(admin)</span>}
        </Link>

        {/* Search Bar (Only for Customers / Guests) */}
        {!isAdmin && (
          <form onSubmit={handleSearchSubmit} style={searchFormStyle}>
            <input
              type="text"
              placeholder="Search Electronics, Fashion, mobiles, etc..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              style={searchInputStyle}
            />
            <button type="submit" style={searchButtonStyle}>
              <Search size={18} />
            </button>
          </form>
        )}

        {/* Navigation Actions */}
        <nav style={navLinksStyle}>
          {!isAdmin ? (
            <>
              <Link to="/products" style={navLinkStyle}>Catalog</Link>
              
              {user ? (
                <>
                  <Link to="/profile" style={userProfileLinkStyle}>
                    <User size={18} />
                    <span>{user.username}</span>
                  </Link>
                  <Link to="/cart" style={cartLinkStyle}>
                    <ShoppingCart size={20} />
                    {cartCount > 0 && <span style={cartBadgeStyle}>{cartCount}</span>}
                  </Link>
                  <button onClick={logout} style={logoutButtonStyle} title="Logout">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "0.9rem" }}>
                  Login
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/admin" style={navLinkStyle}>Home</Link>
              <Link to="/admin/orders" style={navLinkStyle}>Orders</Link>
              <Link to="/admin/products" style={navLinkStyle}>Products</Link>
              <Link to="/admin/new-product" style={navLinkStyle}>New Product</Link>
              <button onClick={logout} style={logoutButtonStyle} title="Logout">
                <LogOut size={18} /> Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

// Styling Object
const headerStyle = {
  background: "linear-gradient(135deg, hsl(256, 82%, 58%), hsl(280, 75%, 60%))",
  color: "#fff",
  padding: "16px 0",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  boxShadow: "var(--shadow-md)"
};

const navContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  flexWrap: "wrap"
};

const logoStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.7rem",
  fontWeight: "800",
  letterSpacing: "-0.5px",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const adminBadgeStyle = {
  fontSize: "0.9rem",
  fontWeight: "500",
  opacity: 0.9,
  fontStyle: "italic",
  marginLeft: "5px"
};

const searchFormStyle = {
  display: "flex",
  alignItems: "center",
  background: "#fff",
  borderRadius: "var(--radius-md)",
  padding: "2px",
  flex: "1",
  maxWidth: "500px",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
};

const searchInputStyle = {
  flex: "1",
  border: "none",
  padding: "10px 16px",
  borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
  outline: "none",
  fontSize: "0.9rem",
  color: "var(--dark)"
};

const searchButtonStyle = {
  background: "transparent",
  border: "none",
  padding: "10px 14px",
  color: "var(--primary)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "var(--transition)"
};

const navLinksStyle = {
  display: "flex",
  alignItems: "center",
  gap: "24px"
};

const navLinkStyle = {
  fontWeight: "600",
  fontSize: "0.95rem",
  opacity: 0.9,
  transition: "var(--transition)"
};

const userProfileLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "600",
  fontSize: "0.95rem",
  opacity: 0.9,
  background: "rgba(255, 255, 255, 0.15)",
  padding: "6px 12px",
  borderRadius: "var(--radius-sm)"
};

const cartLinkStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const cartBadgeStyle = {
  position: "absolute",
  top: "-8px",
  right: "-8px",
  background: "var(--accent)",
  color: "var(--text-light)",
  fontSize: "0.75rem",
  fontWeight: "700",
  borderRadius: "var(--radius-full)",
  width: "18px",
  height: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const logoutButtonStyle = {
  background: "transparent",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "600",
  opacity: 0.9,
  transition: "var(--transition)"
};
