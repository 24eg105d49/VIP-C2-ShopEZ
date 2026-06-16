import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { PlusCircle } from "lucide-react";

export default function AdminNewProduct() {
  const { user, API_BASE, showNotification } = useApp();
  const navigate = useNavigate();

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mainImg, setMainImg] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState(0);
  const [category, setCategory] = useState("fashion");
  const [gender, setGender] = useState("Unisex");
  
  // Sizes list selection
  const [sizes, setSizes] = useState(["S", "M", "L", "XL"]);
  
  // Add-on images (corresponds to carousel array)
  const [addonImg1, setAddonImg1] = useState("");
  const [addonImg2, setAddonImg2] = useState("");
  const [addonImg3, setAddonImg3] = useState("");
  
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user || user.usertype !== "Admin") {
      navigate("/login");
    }
  }, [user]);

  const handleSizeToggle = (sz) => {
    if (sizes.includes(sz)) {
      setSizes(sizes.filter((s) => s !== sz));
    } else {
      setSizes([...sizes, sz]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !mainImg || !price) {
      showNotification("Please fill in all required fields", "warning");
      return;
    }

    setAdding(true);
    
    // Construct carousel array from main image + addon images
    const carousel = [mainImg];
    if (addonImg1) carousel.push(addonImg1);
    if (addonImg2) carousel.push(addonImg2);
    if (addonImg3) carousel.push(addonImg3);

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          mainImg,
          price: Number(price),
          discount: Number(discount) || 0,
          category,
          gender,
          sizes,
          carousel
        })
      });

      if (res.ok) {
        showNotification("New product added successfully!");
        navigate("/admin/products");
      } else {
        const data = await res.json();
        showNotification(data.message || "Failed to add product", "error");
      }
    } catch (err) {
      showNotification("Network error", "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: "40px 0" }}>
      <div className="card" style={formCardStyle}>
        <div style={headerStyle}>
          <PlusCircle size={24} style={{ color: "var(--primary)" }} />
          <h2 style={titleStyle}>New Product</h2>
        </div>
        <hr style={dividerStyle} />

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Product Name *</label>
              <input
                type="text"
                required
                placeholder="Enter product title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={formInputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Thumbnail Image URL *</label>
              <input
                type="text"
                required
                placeholder="Paste primary image URL"
                value={mainImg}
                onChange={(e) => setMainImg(e.target.value)}
                style={formInputStyle}
              />
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={formLabelStyle}>Product Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Enter comprehensive details of the product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={formTextareaStyle}
            />
          </div>

          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Add-on Image 1 URL</label>
              <input
                type="text"
                placeholder="Optional secondary slide URL"
                value={addonImg1}
                onChange={(e) => setAddonImg1(e.target.value)}
                style={formInputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Add-on Image 2 URL</label>
              <input
                type="text"
                placeholder="Optional tertiary slide URL"
                value={addonImg2}
                onChange={(e) => setAddonImg2(e.target.value)}
                style={formInputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Add-on Image 3 URL</label>
              <input
                type="text"
                placeholder="Optional quaternary slide URL"
                value={addonImg3}
                onChange={(e) => setAddonImg3(e.target.value)}
                style={formInputStyle}
              />
            </div>
          </div>

          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={formSelectStyle}
              >
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="mobiles">Mobiles</option>
                <option value="groceries">Groceries</option>
                <option value="sports-equipment">Sports Equipment</option>
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Gender Category *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={formSelectStyle}
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>

          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Original Price (₹) *</label>
              <input
                type="number"
                required
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={formInputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Discount (%)</label>
              <input
                type="number"
                min="0"
                max="99"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                style={formInputStyle}
              />
            </div>
          </div>

          {/* Sizes Checkboxes */}
          <div style={formGroupStyle}>
            <label style={formLabelStyle}>Available Sizes</label>
            <div style={sizesRowStyle}>
              {["S", "M", "L", "XL", "One Size"].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleSizeToggle(sz)}
                  style={{
                    ...sizeBtnStyle,
                    background: sizes.includes(sz) ? "var(--primary)" : "#fff",
                    color: sizes.includes(sz) ? "#fff" : "var(--dark)",
                    borderColor: sizes.includes(sz) ? "var(--primary)" : "var(--light-border)"
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={adding} className="btn btn-primary" style={submitButtonStyle}>
            {adding ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Styling
const formCardStyle = {
  maxWidth: "700px",
  margin: "0 auto",
  padding: "36px",
  background: "#fff",
  boxShadow: "var(--shadow-md)"
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "16px"
};

const titleStyle = {
  fontSize: "1.6rem",
  fontWeight: "800"
};

const dividerStyle = {
  border: "none",
  borderTop: "1px solid var(--light-border)",
  marginBottom: "24px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const formRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px"
};

const formGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const formLabelStyle = {
  fontSize: "0.8rem",
  fontWeight: "600",
  color: "var(--text-muted)",
  textTransform: "uppercase"
};

const formInputStyle = {
  padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  outline: "none",
  fontSize: "0.95rem",
  background: "#fcfcfc"
};

const formTextareaStyle = {
  padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  outline: "none",
  fontSize: "0.95rem",
  background: "#fcfcfc",
  fontFamily: "inherit"
};

const formSelectStyle = {
  padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  outline: "none",
  fontSize: "0.95rem",
  background: "#fff"
};

const sizesRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap"
};

const sizeBtnStyle = {
  padding: "10px 18px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.9rem",
  transition: "var(--transition)"
};

const submitButtonStyle = {
  width: "100%",
  padding: "14px",
  fontSize: "1rem",
  marginTop: "10px"
};
