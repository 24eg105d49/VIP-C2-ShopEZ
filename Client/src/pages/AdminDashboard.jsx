import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Users, ShoppingBag, ClipboardList, PlusCircle, Image } from "lucide-react";

export default function AdminDashboard() {
  const { user, API_BASE, showNotification, banner, fetchBanner } = useApp();
  const [stats, setStats] = useState({ totalUsers: 0, allProducts: 0, allOrders: 0 });
  const [bannerInput, setBannerInput] = useState(banner || "");
  const [loading, setLoading] = useState(true);
  const [updatingBanner, setUpdatingBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.usertype !== "Admin") {
      navigate("/login");
      return;
    }

    // Fetch stats
    fetch(`${API_BASE}/admin/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin stats:", err);
        setLoading(false);
      });
  }, [user, API_BASE]);

  // Sync banner input with context
  useEffect(() => {
    setBannerInput(banner);
  }, [banner]);

  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    setUpdatingBanner(true);
    try {
      const res = await fetch(`${API_BASE}/admin/banner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banner: bannerInput })
      });
      if (res.ok) {
        showNotification("Banner image updated successfully");
        fetchBanner(); // Sync context
      } else {
        showNotification("Error updating banner", "error");
      }
    } catch (err) {
      showNotification("Network error", "error");
    } finally {
      setUpdatingBanner(false);
    }
  };

  if (loading) {
    return (
      <div style={spinnerContainerStyle}>
        <div style={spinnerStyle}></div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: "40px 0" }}>
      <h1 style={titleStyle}>Admin Dashboard</h1>

      {/* Stats Cards Grid */}
      <div style={statsGridStyle}>
        {/* Card 1: Users */}
        <div className="card" style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <Users size={24} style={{ color: "var(--primary)" }} />
            <span style={statLabelStyle}>Total Users</span>
          </div>
          <h2 style={statValueStyle}>{stats.totalUsers}</h2>
          <span style={cardLinkStyle}>Registered Customers</span>
        </div>

        {/* Card 2: Products */}
        <div className="card" style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <ShoppingBag size={24} style={{ color: "var(--accent)" }} />
            <span style={statLabelStyle}>All Products</span>
          </div>
          <h2 style={statValueStyle}>{stats.allProducts}</h2>
          <Link to="/admin/products" style={cardLinkActiveStyle}>
            View all products &rarr;
          </Link>
        </div>

        {/* Card 3: Orders */}
        <div className="card" style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <ClipboardList size={24} style={{ color: "var(--success)" }} />
            <span style={statLabelStyle}>All Orders</span>
          </div>
          <h2 style={statValueStyle}>{stats.allOrders}</h2>
          <Link to="/admin/orders" style={cardLinkActiveStyle}>
            View all orders &rarr;
          </Link>
        </div>

        {/* Card 4: Add Product */}
        <div className="card" style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <PlusCircle size={24} style={{ color: "var(--secondary)" }} />
            <span style={statLabelStyle}>Add Product</span>
          </div>
          <h2 style={statValueStyle}>(new)</h2>
          <Link to="/admin/new-product" style={cardLinkActiveStyle}>
            Add product now &rarr;
          </Link>
        </div>
      </div>

      {/* Banner Configuration Panel */}
      <div className="card" style={bannerPanelStyle}>
        <div style={bannerHeaderStyle}>
          <Image size={20} style={{ color: "var(--primary)" }} />
          <h3 style={bannerPanelTitleStyle}>Update Homepage Banner</h3>
        </div>
        <form onSubmit={handleUpdateBanner} style={bannerFormStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Banner Image URL</label>
            <input
              type="text"
              required
              placeholder="Paste banner image URL here"
              value={bannerInput}
              onChange={(e) => setBannerInput(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={updatingBanner}
            className="btn btn-primary"
            style={bannerSubmitButtonStyle}
          >
            {updatingBanner ? "Updating Banner..." : "Update"}
          </button>
        </form>

        {bannerInput && (
          <div style={previewContainerStyle}>
            <span style={previewLabelStyle}>Live Preview:</span>
            <div style={previewWrapperStyle}>
              <img src={bannerInput} alt="Banner Preview" style={previewImgStyle} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Styling
const spinnerContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "80vh"
};

const spinnerStyle = {
  width: "48px",
  height: "48px",
  border: "4px solid var(--light-border)",
  borderTopColor: "var(--primary)",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

const titleStyle = {
  fontSize: "2.2rem",
  fontWeight: "800",
  marginBottom: "36px",
  letterSpacing: "-0.5px"
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "24px",
  marginBottom: "40px"
};

const statCardStyle = {
  padding: "24px",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  minHeight: "180px"
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const statLabelStyle = {
  fontSize: "0.95rem",
  fontWeight: "750",
  color: "var(--text-muted)",
  textTransform: "uppercase"
};

const statValueStyle = {
  fontSize: "2.4rem",
  fontWeight: "800",
  color: "var(--dark)",
  marginTop: "4px"
};

const cardLinkStyle = {
  fontSize: "0.88rem",
  color: "var(--text-muted)",
  marginTop: "auto"
};

const cardLinkActiveStyle = {
  fontSize: "0.88rem",
  color: "var(--primary)",
  fontWeight: "600",
  marginTop: "auto"
};

const bannerPanelStyle = {
  padding: "30px",
  background: "#fff"
};

const bannerHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "20px"
};

const bannerPanelTitleStyle = {
  fontSize: "1.25rem",
  fontWeight: "800"
};

const bannerFormStyle = {
  display: "flex",
  alignItems: "flex-end",
  gap: "16px",
  flexWrap: "wrap"
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flex: "1",
  minWidth: "300px"
};

const labelStyle = {
  fontSize: "0.8rem",
  fontWeight: "600",
  color: "var(--text-muted)",
  textTransform: "uppercase"
};

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  outline: "none",
  fontSize: "0.95rem"
};

const bannerSubmitButtonStyle = {
  padding: "12px 24px",
  fontSize: "0.95rem",
  height: "45px"
};

const previewContainerStyle = {
  marginTop: "24px"
};

const previewLabelStyle = {
  fontSize: "0.85rem",
  fontWeight: "600",
  color: "var(--text-muted)",
  display: "block",
  marginBottom: "8px"
};

const previewWrapperStyle = {
  width: "100%",
  height: "180px",
  borderRadius: "var(--radius-md)",
  overflow: "hidden",
  border: "1px solid var(--light-border)"
};

const previewImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};
