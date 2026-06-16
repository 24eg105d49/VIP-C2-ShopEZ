import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { User, Mail, ClipboardList, Ban } from "lucide-react";

export default function Profile() {
  const { user, logout, API_BASE, showNotification } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/orders/user/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/cancel/${orderId}`, {
        method: "PUT"
      });
      if (res.ok) {
        showNotification("Order cancelled successfully");
        fetchOrders();
      } else {
        showNotification("Error cancelling order", "error");
      }
    } catch (err) {
      showNotification("Network error", "error");
    }
  };

  if (!user) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: "40px 0" }}>
      <div style={layoutStyle}>
        {/* Left column: User Info Card */}
        <div style={sidebarStyle}>
          <div className="card" style={profileCardStyle}>
            <div style={avatarStyle}>
              <User size={36} style={{ color: "var(--primary)" }} />
            </div>
            <h2 style={usernameStyle}>{user.username}</h2>
            <span style={roleBadgeStyle}>{user.usertype}</span>

            <hr style={dividerStyle} />

            <div style={infoRowStyle}>
              <Mail size={16} style={{ color: "var(--text-muted)" }} />
              <span style={infoTextStyle}>{user.email}</span>
            </div>

            <div style={infoRowStyle}>
              <ClipboardList size={16} style={{ color: "var(--text-muted)" }} />
              <span style={infoTextStyle}>{orders.length} orders placed</span>
            </div>

            <button onClick={logout} className="btn btn-danger" style={logoutButtonStyle}>
              Logout
            </button>
          </div>
        </div>

        {/* Right column: Order History */}
        <div style={ordersColumnStyle}>
          <h2 style={sectionTitleStyle}>Your Orders</h2>

          {loading ? (
            <div style={loadingStyle}>
              <div style={spinnerStyle}></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="card" style={noOrdersCardStyle}>
              <ClipboardList size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
              <h3>No orders yet</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                You haven't placed any orders. Go check out the catalog!
              </p>
              <button onClick={() => navigate("/products")} className="btn btn-primary" style={{ marginTop: "16px" }}>
                Browse Catalog
              </button>
            </div>
          ) : (
            <div style={ordersListStyle}>
              {orders.map((order) => {
                const finalPrice = Math.round(order.price * (1 - order.discount / 100));
                const canCancel = order.orderStatus !== "delivered" && order.orderStatus !== "cancelled";
                
                // Color mapping for order status
                let statusColor = "var(--primary)";
                if (order.orderStatus === "delivered") statusColor = "var(--success)";
                if (order.orderStatus === "cancelled") statusColor = "var(--danger)";
                if (order.orderStatus === "in-transit") statusColor = "var(--warning)";

                return (
                  <div key={order._id} className="card animate-fade-in" style={orderCardStyle}>
                    <div style={orderItemHeaderStyle}>
                      <div style={headerTextGroupStyle}>
                        <span style={headerLabelStyle}>ORDER DATE</span>
                        <span style={headerValueStyle}>{order.orderDate}</span>
                      </div>
                      <div style={headerTextGroupStyle}>
                        <span style={headerLabelStyle}>DELIVERY EXPECTED</span>
                        <span style={headerValueStyle}>{order.deliveryDate}</span>
                      </div>
                      <div style={{ ...headerTextGroupStyle, marginLeft: "auto", textAlign: "right" }}>
                        <span style={headerLabelStyle}>STATUS</span>
                        <span style={{ ...statusBadgeStyle, background: statusColor }}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    <div style={orderContentStyle}>
                      <div style={imgWrapperStyle}>
                        <img src={order.mainImg} alt={order.title} style={imgStyle} />
                      </div>
                      <div style={infoStyle}>
                        <h3 style={itemTitleStyle}>{order.title}</h3>
                        <p style={itemDescStyle}>{order.description}</p>
                        <div style={itemDetailsRowStyle}>
                          <span>Size: <strong>{order.size}</strong></span>
                          <span>Quantity: <strong>{order.quantity}</strong></span>
                          <span>Payment: <strong style={{ textTransform: "uppercase" }}>{order.paymentMethod}</strong></span>
                        </div>
                        <div style={priceWrapperStyle}>
                          <span style={finalPriceStyle}>₹{finalPrice * order.quantity}</span>
                          {order.discount > 0 && (
                            <span style={originalPriceStyle}>₹{order.price * order.quantity} ({order.discount}% off)</span>
                          )}
                        </div>

                        {/* Shipping details toggle / print */}
                        <div style={addressBoxStyle}>
                          <strong>Deliver to:</strong> {order.name} ({order.mobile}) <br />
                          {order.address}, PIN: {order.pincode}
                        </div>
                      </div>

                      {canCancel && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="btn btn-secondary"
                          style={cancelButtonStyle}
                        >
                          <Ban size={16} /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Styling
const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "300px 1fr",
  gap: "36px",
  alignItems: "start"
};

const sidebarStyle = {
  position: "sticky",
  top: "90px"
};

const profileCardStyle = {
  padding: "30px 24px",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center"
};

const avatarStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  background: "var(--primary-light)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px"
};

const usernameStyle = {
  fontSize: "1.4rem",
  fontWeight: "800",
  color: "var(--dark)"
};

const roleBadgeStyle = {
  display: "inline-block",
  fontSize: "0.75rem",
  fontWeight: "700",
  background: "var(--light)",
  color: "var(--text-muted)",
  padding: "2px 10px",
  borderRadius: "var(--radius-full)",
  marginTop: "4px",
  textTransform: "uppercase"
};

const dividerStyle = {
  border: "none",
  borderTop: "1px solid var(--light-border)",
  width: "100%",
  margin: "20px 0"
};

const infoRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%",
  marginBottom: "12px",
  color: "var(--text-main)"
};

const infoTextStyle = {
  fontSize: "0.9rem",
  wordBreak: "break-all"
};

const logoutButtonStyle = {
  width: "100%",
  marginTop: "16px",
  padding: "10px",
  fontSize: "0.95rem"
};

const ordersColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const sectionTitleStyle = {
  fontSize: "1.6rem",
  fontWeight: "800"
};

const loadingStyle = {
  display: "flex",
  justifyContent: "center",
  padding: "80px 0"
};

const spinnerStyle = {
  width: "36px",
  height: "36px",
  border: "3px solid var(--light-border)",
  borderTopColor: "var(--primary)",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

const noOrdersCardStyle = {
  padding: "60px 24px",
  textAlign: "center",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const ordersListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const orderCardStyle = {
  background: "#fff",
  overflow: "hidden"
};

const orderItemHeaderStyle = {
  background: "#fcfcfc",
  borderBottom: "1px solid var(--light-border)",
  padding: "16px 24px",
  display: "flex",
  gap: "40px",
  flexWrap: "wrap"
};

const headerTextGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const headerLabelStyle = {
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--text-muted)"
};

const headerValueStyle = {
  fontSize: "0.88rem",
  fontWeight: "600",
  color: "var(--dark)"
};

const statusBadgeStyle = {
  display: "inline-block",
  fontSize: "0.78rem",
  fontWeight: "700",
  color: "#fff",
  padding: "4px 12px",
  borderRadius: "var(--radius-full)",
  textTransform: "uppercase"
};

const orderContentStyle = {
  padding: "24px",
  display: "flex",
  alignItems: "start",
  gap: "20px",
  position: "relative",
  flexWrap: "wrap"
};

const imgWrapperStyle = {
  width: "110px",
  height: "110px",
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
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flex: "1",
  minWidth: "260px"
};

const itemTitleStyle = {
  fontSize: "1.2rem",
  fontWeight: "750"
};

const itemDescStyle = {
  fontSize: "0.85rem",
  color: "var(--text-muted)",
  lineHeight: "1.3",
  display: "-webkit-box",
  WebkitLineClamp: "1",
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
};

const itemDetailsRowStyle = {
  display: "flex",
  gap: "20px",
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
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--primary)"
};

const originalPriceStyle = {
  fontSize: "0.9rem",
  color: "var(--text-muted)",
  textDecoration: "line-through"
};

const addressBoxStyle = {
  background: "var(--light)",
  padding: "10px 14px",
  borderRadius: "var(--radius-md)",
  fontSize: "0.85rem",
  color: "var(--text-main)",
  lineHeight: "1.4",
  marginTop: "8px",
  border: "1px solid var(--light-border)"
};

const cancelButtonStyle = {
  alignSelf: "start",
  padding: "10px 16px",
  fontSize: "0.85rem"
};
