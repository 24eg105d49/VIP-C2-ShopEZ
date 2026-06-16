import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Edit2, Plus, X } from "lucide-react";

export default function AdminProducts() {
  const { user, API_BASE, showNotification } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null); // stores the product currently being edited in modal
  const navigate = useNavigate();

  // Form states for Editing Product
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMainImg, setEditMainImg] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const [editCategory, setEditCategory] = useState("fashion");
  const [editGender, setEditGender] = useState("Unisex");
  const [editSizes, setEditSizes] = useState([]);
  const [editCarousel, setEditCarousel] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.usertype !== "Admin") {
      navigate("/login");
      return;
    }
    fetchProducts();
  }, [user]);

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditDescription(product.description);
    setEditMainImg(product.mainImg);
    setEditPrice(product.price);
    setEditDiscount(product.discount);
    setEditCategory(product.category || "fashion");
    setEditGender(product.gender || "Unisex");
    setEditSizes(product.sizes || []);
    setEditCarousel(product.carousel || []);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
  };

  const handleSizeToggle = (size) => {
    if (editSizes.includes(size)) {
      setEditSizes(editSizes.filter((s) => s !== size));
    } else {
      setEditSizes([...editSizes, size]);
    }
  };

  const handleCarouselChange = (idx, value) => {
    const updated = [...editCarousel];
    updated[idx] = value;
    setEditCarousel(updated);
  };

  const addCarouselUrl = () => {
    setEditCarousel([...editCarousel, ""]);
  };

  const removeCarouselUrl = (idx) => {
    setEditCarousel(editCarousel.filter((_, i) => i !== idx));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          mainImg: editMainImg,
          price: Number(editPrice),
          discount: Number(editDiscount),
          category: editCategory,
          gender: editGender,
          sizes: editSizes,
          carousel: editCarousel.filter(url => url.trim() !== "")
        })
      });

      if (res.ok) {
        showNotification("Product updated successfully");
        closeEditModal();
        fetchProducts();
      } else {
        showNotification("Failed to update product", "error");
      }
    } catch (err) {
      showNotification("Network error", "error");
    } finally {
      setSaving(false);
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
      <div style={headerStyle}>
        <h1 style={titleStyle}>Manage Products</h1>
        <Link to="/admin/new-product" className="btn btn-primary" style={addButtonStyle}>
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      <div className="grid-cols-auto">
        {products.map((prod) => {
          const finalPrice = Math.round(prod.price * (1 - prod.discount / 100));
          return (
            <div key={prod._id} className="card" style={productCardStyle}>
              <div style={imgContainerStyle}>
                <img src={prod.mainImg} alt={prod.title} style={productImgStyle} />
                {prod.discount > 0 && (
                  <span className="badge badge-discount" style={discountBadgeStyle}>
                    {prod.discount}% OFF
                  </span>
                )}
              </div>
              <div style={infoContainerStyle}>
                <div style={metaContainerStyle}>
                  <span style={categoryBadgeStyle}>{prod.category}</span>
                  <span style={genderBadgeStyle}>{prod.gender}</span>
                </div>
                <h3 style={prodTitleStyle}>{prod.title}</h3>
                <p style={prodDescStyle}>{prod.description}</p>
                <div style={priceContainerStyle}>
                  <span style={finalPriceStyle}>₹{finalPrice}</span>
                  {prod.discount > 0 && <span style={originalPriceStyle}>₹{prod.price}</span>}
                </div>
                <button
                  onClick={() => openEditModal(prod)}
                  className="btn btn-secondary"
                  style={editButtonStyle}
                >
                  <Edit2 size={16} /> Update Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editing Modal Popup */}
      {editingProduct && (
        <div style={modalBackdropStyle} onClick={closeEditModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()} className="animate-fade-in">
            <div style={modalHeaderStyle}>
              <h3>Update Product details</h3>
              <button onClick={closeEditModal} style={modalCloseButtonStyle}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} style={formStyle}>
              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Product Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Main Image URL</label>
                  <input
                    type="text"
                    required
                    value={editMainImg}
                    onChange={(e) => setEditMainImg(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle}>Description</label>
                <textarea
                  rows={2}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={formTextareaStyle}
                />
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Original Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Discount (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="99"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
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
                  <label style={formLabelStyle}>Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    style={formSelectStyle}
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              {/* Sizes Selection */}
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
                        background: editSizes.includes(sz) ? "var(--primary)" : "#fff",
                        color: editSizes.includes(sz) ? "#fff" : "var(--dark)",
                        borderColor: editSizes.includes(sz) ? "var(--primary)" : "var(--light-border)"
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Carousel URLs */}
              <div style={formGroupStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={formLabelStyle}>Gallery Slide Images</label>
                  <button type="button" onClick={addCarouselUrl} style={addCarouselButtonStyle}>
                    + Add URL
                  </button>
                </div>
                <div style={carouselUrlsListStyle}>
                  {editCarousel.map((url, index) => (
                    <div key={index} style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder={`Image ${index + 1} URL`}
                        value={url}
                        onChange={(e) => handleCarouselChange(index, e.target.value)}
                        style={{ ...formInputStyle, flex: 1 }}
                      />
                      <button type="button" onClick={() => removeCarouselUrl(index)} style={removeUrlButtonStyle}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={modalFooterStyle}>
                <button type="button" onClick={closeEditModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? "Saving Changes..." : "Save Product Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "36px"
};

const titleStyle = {
  fontSize: "2.2rem",
  fontWeight: "800",
  letterSpacing: "-0.5px"
};

const addButtonStyle = {
  padding: "10px 20px"
};

const productCardStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  background: "#fff"
};

const imgContainerStyle = {
  position: "relative",
  height: "220px",
  background: "#fdfdfd",
  overflow: "hidden"
};

const productImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  padding: "10px"
};

const discountBadgeStyle = {
  position: "absolute",
  top: "12px",
  left: "12px"
};

const infoContainerStyle = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  flex: "1",
  gap: "10px"
};

const metaContainerStyle = {
  display: "flex",
  gap: "8px",
  fontSize: "0.75rem",
  fontWeight: "600",
  textTransform: "uppercase",
  color: "var(--text-muted)"
};

const categoryBadgeStyle = {
  background: "var(--light)",
  padding: "3px 8px",
  borderRadius: "var(--radius-sm)"
};

const genderBadgeStyle = {
  background: "var(--light)",
  padding: "3px 8px",
  borderRadius: "var(--radius-sm)"
};

const prodTitleStyle = {
  fontSize: "1.15rem",
  fontWeight: "750"
};

const prodDescStyle = {
  fontSize: "0.85rem",
  color: "var(--text-muted)",
  display: "-webkit-box",
  WebkitLineClamp: "2",
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  lineHeight: "1.4"
};

const priceContainerStyle = {
  display: "flex",
  alignItems: "baseline",
  gap: "8px",
  marginTop: "auto",
  paddingTop: "6px"
};

const finalPriceStyle = {
  fontSize: "1.3rem",
  fontWeight: "800",
  color: "var(--primary)"
};

const originalPriceStyle = {
  fontSize: "0.9rem",
  color: "var(--text-muted)",
  textDecoration: "line-through"
};

const editButtonStyle = {
  width: "100%",
  marginTop: "10px",
  padding: "10px",
  fontSize: "0.88rem"
};

/* Modal Overlay styling */
const modalBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(15, 23, 42, 0.4)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
  padding: "20px"
};

const modalContentStyle = {
  background: "#fff",
  borderRadius: "var(--radius-lg)",
  width: "100%",
  maxWidth: "600px",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: "32px",
  boxShadow: "var(--shadow-lg)"
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
  borderBottom: "1px solid var(--light-border)",
  paddingBottom: "12px"
};

const modalCloseButtonStyle = {
  background: "none",
  border: "none",
  color: "var(--text-muted)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "18px"
};

const formRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px"
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
  padding: "10px 14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  outline: "none",
  fontSize: "0.92rem",
  background: "#fcfcfc"
};

const formTextareaStyle = {
  padding: "10px 14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  outline: "none",
  fontSize: "0.92rem",
  background: "#fcfcfc",
  fontFamily: "inherit"
};

const formSelectStyle = {
  padding: "10px 14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  outline: "none",
  fontSize: "0.92rem",
  background: "#fff"
};

const sizesRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap"
};

const sizeBtnStyle = {
  padding: "8px 14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.85rem",
  transition: "var(--transition)"
};

const addCarouselButtonStyle = {
  background: "none",
  border: "none",
  color: "var(--primary)",
  fontWeight: "600",
  fontSize: "0.85rem",
  cursor: "pointer"
};

const carouselUrlsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxHeight: "120px",
  overflowY: "auto",
  paddingRight: "4px"
};

const removeUrlButtonStyle = {
  background: "none",
  border: "1px solid var(--light-border)",
  borderRadius: "var(--radius-md)",
  padding: "8px",
  color: "var(--danger)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modalFooterStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  borderTop: "1px solid var(--light-border)",
  paddingTop: "20px",
  marginTop: "12px"
};
