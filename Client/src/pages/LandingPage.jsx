import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function LandingPage() {
  const { banner, API_BASE } = useApp();
  const [recommended, setRecommended] = useState([]);
  const navigate = useNavigate();

  const categories = [
    {
      name: "Fashion",
      slug: "fashion",
      img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400"
    },
    {
      name: "Electronics",
      slug: "electronics",
      img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400"
    },
    {
      name: "Mobiles",
      slug: "mobiles",
      img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400"
    },
    {
      name: "Groceries",
      slug: "groceries",
      img: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400"
    },
    {
      name: "Sports Equipments",
      slug: "sports-equipment",
      img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=400"
    }
  ];

  // Fetch products for recommendations (e.g. first 3 products)
  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then((res) => res.json())
      .then((data) => {
        setRecommended(data.slice(0, 3));
      })
      .catch((err) => console.error("Error fetching recommended products:", err));
  }, [API_BASE]);

  return (
    <div style={pageStyle} className="animate-fade-in">
      {/* Super Sale Banner */}
      <div
        style={{
          ...bannerStyle,
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.1)), url(${
            banner || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070"
          })`
        }}
      >
        <div style={bannerContentStyle}>
          <span style={bannerTaglineStyle}>SUMMER SALE EVENT</span>
          <h1 style={bannerTitleStyle}>SUPER SALE</h1>
          <p style={bannerSubtitleStyle}>Up to 50% Off Top Brands</p>
          <Link to="/products" className="btn btn-primary" style={bannerButtonStyle}>
            SHOP NOW
          </Link>
        </div>
      </div>

      {/* Categories Row */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Shop by Category</h2>
        <div style={categoriesContainerStyle}>
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/products?category=${cat.slug}`)}
              style={categoryCardStyle}
            >
              <div style={categoryImageContainerStyle}>
                <img src={cat.img} alt={cat.name} style={categoryImageStyle} />
              </div>
              <h3 style={categoryLabelStyle}>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended for You Section */}
      <section style={{ ...sectionStyle, background: "#fdfdfd", padding: "60px 24px" }}>
        <h2 style={sectionTitleStyle}>Recommended for You</h2>
        <div className="grid-cols-auto" style={productsGridStyle}>
          {recommended.map((prod) => {
            const finalPrice = Math.round(prod.price * (1 - prod.discount / 100));
            return (
              <div key={prod._id} className="card animate-fade-in" style={productCardStyle}>
                <div style={prodImageContainerStyle}>
                  <img src={prod.mainImg} alt={prod.title} style={prodImageStyle} />
                  {prod.discount > 0 && (
                    <span className="badge badge-discount" style={discountBadgeStyle}>
                      {prod.discount}% OFF
                    </span>
                  )}
                </div>
                <div style={prodInfoStyle}>
                  <div style={prodMetaStyle}>
                    <span style={prodCategoryStyle}>{prod.category}</span>
                    <span style={prodGenderStyle}>{prod.gender}</span>
                  </div>
                  <h3 style={prodTitleStyle}>{prod.title}</h3>
                  <div style={priceContainerStyle}>
                    <span style={finalPriceStyle}>₹{finalPrice}</span>
                    {prod.discount > 0 && <span style={originalPriceStyle}>₹{prod.price}</span>}
                  </div>
                  <Link to={`/product/${prod._id}`} className="btn btn-secondary" style={prodButtonStyle}>
                    Shop Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Styling Objects
const pageStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "40px"
};

const bannerStyle = {
  backgroundSize: "cover",
  backgroundPosition: "center",
  height: "380px",
  borderRadius: "var(--radius-lg)",
  marginTop: "20px",
  display: "flex",
  alignItems: "center",
  padding: "0 60px",
  color: "#fff",
  boxShadow: "var(--shadow-lg)"
};

const bannerContentStyle = {
  maxWidth: "500px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "12px"
};

const bannerTaglineStyle = {
  fontSize: "0.85rem",
  fontWeight: "700",
  letterSpacing: "2px",
  color: "var(--accent)"
};

const bannerTitleStyle = {
  color: "#fff",
  fontSize: "3.5rem",
  fontWeight: "900",
  lineHeight: "1.1",
  letterSpacing: "-1px"
};

const bannerSubtitleStyle = {
  fontSize: "1.2rem",
  opacity: 0.95,
  fontWeight: "500",
  marginBottom: "10px"
};

const bannerButtonStyle = {
  padding: "14px 28px",
  fontSize: "1rem"
};

const sectionStyle = {
  padding: "40px 24px"
};

const sectionTitleStyle = {
  textAlign: "center",
  marginBottom: "36px",
  fontSize: "2.2rem",
  fontWeight: "800",
  letterSpacing: "-0.5px"
};

const categoriesContainerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "24px",
  flexWrap: "wrap"
};

const categoryCardStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  cursor: "pointer",
  transition: "var(--transition)"
};

const categoryImageContainerStyle = {
  width: "120px",
  height: "120px",
  borderRadius: "var(--radius-lg)",
  overflow: "hidden",
  boxShadow: "var(--shadow-sm)",
  transition: "var(--transition)",
  border: "2px solid #fff"
};

const categoryImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "var(--transition)"
};

const categoryLabelStyle = {
  fontSize: "1rem",
  fontWeight: "600",
  marginTop: "12px",
  color: "var(--text-main)",
  transition: "var(--transition)"
};

// Hover animations inline check (will trigger in JS)
const categoryCardHover = (e) => {
  e.currentTarget.querySelector("img").style.transform = "scale(1.1)";
  e.currentTarget.querySelector("div").style.boxShadow = "var(--shadow-md)";
  e.currentTarget.querySelector("h3").style.color = "var(--primary)";
};

const categoryCardLeave = (e) => {
  e.currentTarget.querySelector("img").style.transform = "scale(1)";
  e.currentTarget.querySelector("div").style.boxShadow = "var(--shadow-sm)";
  e.currentTarget.querySelector("h3").style.color = "var(--text-main)";
};

const productsGridStyle = {
  maxWidth: "1000px",
  margin: "0 auto"
};

const productCardStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100%"
};

const prodImageContainerStyle = {
  position: "relative",
  height: "240px",
  background: "#f7f7f7",
  overflow: "hidden"
};

const prodImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const discountBadgeStyle = {
  position: "absolute",
  top: "12px",
  left: "12px"
};

const prodInfoStyle = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  flex: "1",
  gap: "10px"
};

const prodMetaStyle = {
  display: "flex",
  gap: "8px",
  fontSize: "0.8rem",
  fontWeight: "600",
  textTransform: "uppercase",
  color: "var(--text-muted)"
};

const prodCategoryStyle = {
  background: "var(--light)",
  padding: "2px 8px",
  borderRadius: "var(--radius-sm)"
};

const prodGenderStyle = {
  background: "var(--light)",
  padding: "2px 8px",
  borderRadius: "var(--radius-sm)"
};

const prodTitleStyle = {
  fontSize: "1.2rem",
  fontWeight: "700",
  color: "var(--dark)"
};

const priceContainerStyle = {
  display: "flex",
  alignItems: "baseline",
  gap: "8px",
  marginTop: "auto"
};

const finalPriceStyle = {
  fontSize: "1.35rem",
  fontWeight: "800",
  color: "var(--primary)"
};

const originalPriceStyle = {
  fontSize: "0.95rem",
  color: "var(--text-muted)",
  textDecoration: "line-through"
};

const prodButtonStyle = {
  width: "100%",
  marginTop: "12px"
};
