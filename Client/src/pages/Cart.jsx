import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Trash2, ShoppingBag, ShieldCheck } from "lucide-react";

export default function Cart() {
  const { user, cart, removeFromCart, API_BASE, showNotification, fetchCart } = useApp();
  const navigate = useNavigate();

  // Shipping details form
  const [name, setName] = useState(user ? user.username : "");
  const [email, setEmail] = useState(user ? user.email : "");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.username);
      setEmail(user.email);
    }
  }, [user]);

  if (cart.length === 0) {
    return (
      <div className="container animate-fade-in" style={emptyCartContainerStyle}>
        <ShoppingBag size={64} style={{ color: "var(--text-muted)", marginBottom: "20px" }} />
        <h2>Your Cart is Empty</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Add products from our catalog to get started.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: "20px" }}>
          Explore Products
        </Link>
      </div>
    );
  }

  // Calculations
  const totalMRP = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => {
    const finalPrice = Math.round(item.price * (1 - item.discount / 100));
    return sum + (item.price - finalPrice) * item.quantity;
  }, 0);
  const deliveryCharges = 0; // ₹0 per screenshots
  const finalPrice = totalMRP - totalDiscount + deliveryCharges;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification("Please log in to check out", "warning");
      return;
    }
    if (!mobile || !address || !pincode) {
      showNotification("Please fill in all shipping details", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const items = cart.map((item) => ({
        title: item.title,
        description: item.description,
        mainImg: item.mainImg,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount
      }));

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
          items
        })
      });

      if (res.ok) {
        showNotification("Order placed successfully!");
        fetchCart(); // clears state
        navigate("/profile");
      } else {
        const data = await res.json();
        showNotification(data.message || "Error checkout", "error");
      }
    } catch (err) {
      showNotification("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: "40px 0" }}>
      <h1 style={{ marginBottom: "32px", fontSize: "2rem", fontWeight: "800" }}>Shopping Cart</h1>

      <div style={layoutStyle}>
        {/* Left: Cart Items List */}
        <div style={listContainerStyle}>
          {cart.map((item) => {
            const itemFinalPrice = Math.round(item.price * (1 - item.discount / 100));
            return (
              <div key={item._id} className="card" style={itemCardStyle}>
                <div style={imgWrapperStyle}>
                  <img src={item.mainImg} alt={item.title} style={imgStyle} />
                </div>
                <div style={infoStyle}>
                  <h3 style={itemTitleStyle}>{item.title}</h3>
                  <div style={itemMetaStyle}>
                    <span>Size: <strong>{item.size}</strong></span>
                    <span>Quantity: <strong>{item.quantity}</strong></span>
                  </div>
                  <div style={priceWrapperStyle}>
                    <span style={finalPriceStyle}>₹{itemFinalPrice}</span>
                    {item.discount > 0 && (
                      <>
                        <span style={originalPriceStyle}>₹{item.price}</span>
                        <span style={discountBadgeStyle}>{item.discount}% OFF</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  style={removeButtonStyle}
                  title="Remove from Cart"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}

          {/* Checkout Shipping details inside cart */}
          <div className="card" style={checkoutCardStyle}>
            <h3 style={sectionTitleStyle}>Shipping Address</h3>
            <form id="cart-checkout-form" onSubmit={handlePlaceOrder} style={checkoutFormStyle}>
              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Email</label>
                  <input
                    type="email"
                    required
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
                <label style={formLabelStyle}>Address Details</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Street address, colony, land mark..."
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
            </form>
          </div>
        </div>

        {/* Right: Pricing Details Card */}
        <div style={pricingCardColumnStyle}>
          <div className="card animate-fade-in" style={summaryCardStyle}>
            <h3 style={summaryTitleStyle}>Price Details</h3>
            <hr style={dividerStyle} />
            
            <div style={summaryRowStyle}>
              <span>Total MRP ({cart.length} items)</span>
              <span>₹{totalMRP}</span>
            </div>

            <div style={summaryRowStyle}>
              <span>Discount on MRP</span>
              <span style={{ color: "var(--success)" }}>- ₹{totalDiscount}</span>
            </div>

            <div style={summaryRowStyle}>
              <span>Delivery Charges</span>
              <span style={{ color: "var(--success)" }}>FREE</span>
            </div>

            <hr style={dividerStyle} />

            <div style={{ ...summaryRowStyle, fontWeight: "800", fontSize: "1.2rem" }}>
              <span>Final Price</span>
              <span style={{ color: "var(--primary)" }}>₹{finalPrice}</span>
            </div>

            <button
              type="submit"
              form="cart-checkout-form"
              disabled={submitting}
              className="btn btn-primary"
              style={checkoutButtonStyle}
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>

            <div style={trustBadgeStyle}>
              <ShieldCheck size={16} style={{ color: "var(--success)" }} />
              <span>Safe and Secure Payments. Easy returns.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const emptyCartContainerStyle = {
  textAlign: "center",
  padding: "80px 24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 360px",
  gap: "32px",
  alignItems: "start"
};

const listContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const itemCardStyle = {
  display: "flex",
  alignItems: "center",
  padding: "16px",
  background: "#fff",
  position: "relative"
};

const imgWrapperStyle = {
  width: "90px",
  height: "90px",
  borderRadius: "var(--radius-md)",
  overflow: "hidden",
  background: "#fcfcfc",
  border: "1px solid var(--light-border)",
  flexShrink: 0
};

const imgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain"
};

const infoStyle = {
  marginLeft: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  flex: "1"
};

const itemTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "700"
};

const itemMetaStyle = {
  display: "flex",
  gap: "16px",
  fontSize: "0.85rem",
  color: "var(--text-muted)"
};

const priceWrapperStyle = {
  display: "flex",
  alignItems: "baseline",
  gap: "8px",
  marginTop: "4px"
};

const finalPriceStyle = {
  fontSize: "1.15rem",
  fontWeight: "800",
  color: "var(--primary)"
};

const originalPriceStyle = {
  fontSize: "0.9rem",
  color: "var(--text-muted)",
  textDecoration: "line-through"
};

const discountBadgeStyle = {
  fontSize: "0.78rem",
  fontWeight: "700",
  color: "var(--accent)",
  background: "var(--accent-light)",
  padding: "1px 6px",
  borderRadius: "var(--radius-sm)"
};

const removeButtonStyle = {
  background: "transparent",
  border: "none",
  color: "var(--text-muted)",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "var(--radius-sm)",
  transition: "var(--transition)",
  alignSelf: "start"
};

const pricingCardColumnStyle = {
  position: "sticky",
  top: "90px"
};

const summaryCardStyle = {
  padding: "24px",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const summaryTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "750",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const dividerStyle = {
  border: "none",
  borderTop: "1px solid var(--light-border)",
  margin: "4px 0"
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "0.95rem",
  fontWeight: "500",
  color: "var(--text-main)"
};

const checkoutButtonStyle = {
  width: "100%",
  padding: "12px",
  fontSize: "1.05rem",
  marginTop: "10px"
};

const trustBadgeStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "0.78rem",
  color: "var(--text-muted)",
  textAlign: "center",
  marginTop: "8px"
};

const checkoutCardStyle = {
  padding: "24px",
  background: "#fff"
};

const sectionTitleStyle = {
  fontSize: "1.15rem",
  fontWeight: "750",
  marginBottom: "20px"
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
