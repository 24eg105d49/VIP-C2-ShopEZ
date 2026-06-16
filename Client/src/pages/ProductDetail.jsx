import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ShoppingBag, ChevronRight, ShieldCheck, Truck } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { API_BASE, user, addToCart, showNotification } = useApp();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Shipping details form
  const [name, setName] = useState(user ? user.username : "");
  const [email, setEmail] = useState(user ? user.email : "");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Sync user defaults
  useEffect(() => {
    if (user) {
      setName(user.username);
      setEmail(user.email);
    }
  }, [user]);

  // Fetch product
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setMainImg(data.mainImg);
        // Set default size if available
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id, API_BASE]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!selectedSize) {
      showNotification("Please select a size", "warning");
      return;
    }
    const success = await addToCart(product, selectedSize, quantity);
    if (success) {
      navigate("/cart");
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification("Please log in to purchase products", "warning");
      return;
    }
    if (!selectedSize) {
      showNotification("Please select a size", "warning");
      return;
    }
    if (!mobile || !address || !pincode) {
      showNotification("Please fill in all shipping details", "warning");
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderItem = {
        title: product.title,
        description: product.description,
        mainImg: product.mainImg,
        size: selectedSize,
        quantity: Number(quantity),
        price: product.price,
        discount: product.discount
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          name,
          email,
          mobile,
          address,
          pincode,
          paymentMethod,
          items: orderItem
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification("Order placed successfully!");
        navigate("/profile");
      } else {
        showNotification(data.message || "Error placing order", "error");
      }
    } catch (err) {
      showNotification("Network error occurred", "error");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div style={spinnerContainerStyle}>
        <div style={spinnerStyle}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: "16px" }}>
          Back to Catalog
        </Link>
      </div>
    );
  }

  const finalPrice = Math.round(product.price * (1 - product.discount / 100));

  return (
    <div className="container animate-fade-in" style={{ padding: "30px 0" }}>
      {/* Breadcrumb */}
      <div style={breadcrumbStyle}>
        <Link to="/">Home</Link> <ChevronRight size={14} />
        <Link to="/products">Catalog</Link> <ChevronRight size={14} />
        <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>{product.title}</span>
      </div>

      <div style={layoutStyle}>
        {/* Left Column: Image Gallery */}
        <div style={imageGalleryStyle}>
          <div style={mainImgWrapperStyle}>
            <img src={mainImg} alt={product.title} style={mainImgStyle} />
          </div>
          {product.carousel && product.carousel.length > 0 && (
            <div style={carouselStyle}>
              {product.carousel.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setMainImg(img)}
                  style={{
                    ...carouselThumbStyle,
                    borderColor: mainImg === img ? "var(--primary)" : "var(--light-border)",
                    opacity: mainImg === img ? 1 : 0.7
                  }}
                >
                  <img src={img} alt="thumbnail" style={thumbImgStyle} />
                </div>
              ))}
            </div>
          )}
          <div style={trustBannerStyle}>
            <div style={trustItemStyle}>
              <Truck size={20} style={{ color: "var(--primary)" }} />
              <div>
                <h4 style={trustTitleStyle}>Free & Fast Shipping</h4>
                <p style={trustDescStyle}>Delivered in 3-5 business days</p>
              </div>
            </div>
            <div style={trustItemStyle}>
              <ShieldCheck size={20} style={{ color: "var(--success)" }} />
              <div>
                <h4 style={trustTitleStyle}>100% Secure Checkout</h4>
                <p style={trustDescStyle}>Encoded SSL checkout environment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Purchase */}
        <div style={detailsColumnStyle}>
          <span style={badgeStyle}>{product.category}</span>
          <h1 style={titleStyle}>{product.title}</h1>
          
          <div style={priceWrapperStyle}>
            <span style={finalPriceStyle}>₹{finalPrice}</span>
            {product.discount > 0 && (
              <>
                <span style={originalPriceStyle}>₹{product.price}</span>
                <span style={discountPercentStyle}>{product.discount}% OFF</span>
              </>
            )}
          </div>

          <p style={descriptionStyle}>{product.description}</p>

          <hr style={dividerStyle} />

          {/* Configuration Selection */}
          <div style={configRowStyle}>
            <div style={configColStyle}>
              <h3 style={sectionLabelStyle}>Select Size</h3>
              <div style={sizesWrapperStyle}>
                {product.sizes && product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      ...sizeButtonStyle,
                      background: selectedSize === size ? "var(--primary)" : "#fff",
                      color: selectedSize === size ? "#fff" : "var(--dark)",
                      borderColor: selectedSize === size ? "var(--primary)" : "var(--light-border)"
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div style={configColStyle}>
              <h3 style={sectionLabelStyle}>Quantity</h3>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={qtySelectStyle}
              >
                {[1, 2, 3, 4, 5].map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={handleAddToCart} className="btn btn-secondary" style={cartButtonStyle}>
            <ShoppingBag size={20} /> Add to Cart
          </button>

          <hr style={dividerStyle} />

          {/* Shipping Form / Direct Buy */}
          <div className="card" style={checkoutCardStyle}>
            <h3 style={{ ...sectionLabelStyle, marginBottom: "16px" }}>Direct Checkout</h3>
            <form onSubmit={handleBuyNow} style={checkoutFormStyle}>
              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="6-digit pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle}>Shipping Address</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter full address details"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={formTextareaStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle}>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={formSelectStyle}
                >
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="upi">UPI Payments</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submittingOrder}
                className="btn btn-primary"
                style={buyButtonStyle}
              >
                {submittingOrder ? "Placing Order..." : `Place Order (₹${finalPrice * quantity})`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styling Objects
const spinnerContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "80vh"
};

const spinnerStyle = {
  width: "50px",
  height: "50px",
  border: "5px solid var(--light-border)",
  borderTopColor: "var(--primary)",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

const breadcrumbStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "0.9rem",
  color: "var(--text-muted)",
  marginBottom: "30px",
  fontWeight: "500"
};

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "48px",
  alignItems: "start"
};

const imageGalleryStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const mainImgWrapperStyle = {
  width: "100%",
  height: "450px",
  borderRadius: "var(--radius-lg)",
  overflow: "hidden",
  background: "#fcfcfc",
  border: "1px solid var(--light-border)"
};

const mainImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain"
};

const carouselStyle = {
  display: "flex",
  gap: "12px",
  overflowX: "auto",
  paddingBottom: "8px"
};

const carouselThumbStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "var(--radius-md)",
  overflow: "hidden",
  border: "2px solid var(--light-border)",
  cursor: "pointer",
  background: "#fff",
  transition: "var(--transition)"
};

const thumbImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain"
};

const trustBannerStyle = {
  display: "flex",
  gap: "24px",
  marginTop: "20px",
  padding: "20px",
  background: "#fff",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--light-border)"
};

const trustItemStyle = {
  display: "flex",
  gap: "12px",
  flex: "1"
};

const trustTitleStyle = {
  fontSize: "0.9rem",
  fontWeight: "700"
};

const trustDescStyle = {
  fontSize: "0.78rem",
  color: "var(--text-muted)",
  lineHeight: "1.3"
};

const detailsColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "18px"
};

const badgeStyle = {
  alignSelf: "flex-start",
  background: "var(--primary-light)",
  color: "var(--primary)",
  fontWeight: "700",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  padding: "4px 12px",
  borderRadius: "var(--radius-sm)"
};

const titleStyle = {
  fontSize: "2.4rem",
  fontWeight: "800",
  letterSpacing: "-0.5px",
  lineHeight: "1.1"
};

const priceWrapperStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const finalPriceStyle = {
  fontSize: "2rem",
  fontWeight: "800",
  color: "var(--primary)"
};

const originalPriceStyle = {
  fontSize: "1.2rem",
  color: "var(--text-muted)",
  textDecoration: "line-through"
};

const discountPercentStyle = {
  fontSize: "0.95rem",
  fontWeight: "700",
  color: "var(--accent)",
  background: "var(--accent-light)",
  padding: "2px 8px",
  borderRadius: "var(--radius-sm)"
};

const descriptionStyle = {
  color: "var(--text-muted)",
  fontSize: "1.05rem",
  lineHeight: "1.5"
};

const dividerStyle = {
  border: "none",
  borderTop: "1px solid var(--light-border)"
};

const configRowStyle = {
  display: "flex",
  gap: "40px"
};

const configColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const sectionLabelStyle = {
  fontSize: "0.95rem",
  fontWeight: "750",
  color: "var(--dark)"
};

const sizesWrapperStyle = {
  display: "flex",
  gap: "10px"
};

const sizeButtonStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "var(--radius-md)",
  border: "2px solid var(--light-border)",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.9rem",
  transition: "var(--transition)"
};

const qtySelectStyle = {
  padding: "10px 16px",
  borderRadius: "var(--radius-md)",
  border: "2px solid var(--light-border)",
  outline: "none",
  background: "#fff",
  fontWeight: "600",
  minWidth: "80px",
  cursor: "pointer"
};

const cartButtonStyle = {
  padding: "14px 28px",
  fontSize: "1.05rem",
  width: "100%"
};

const checkoutCardStyle = {
  padding: "24px",
  background: "#fff",
  boxShadow: "var(--shadow-sm)"
};

const checkoutFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
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

const buyButtonStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  fontSize: "1rem"
};
