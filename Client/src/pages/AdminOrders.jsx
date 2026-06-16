import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ClipboardCheck, ArrowUpDown, ChevronDown } from "lucide-react";

export default function AdminOrders() {
  const { user, API_BASE, showNotification } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Track local changes in order statuses
  const [localStatuses, setLocalStatuses] = useState({});

  const navigate = useNavigate();

  const fetchAllOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        // Map ID to their status
        const statuses = {};
        data.forEach((o) => {
          statuses[o._id] = o.orderStatus;
        });
        setLocalStatuses(statuses);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.usertype !== "Admin") {
      navigate("/login");
      return;
    }
    fetchAllOrders();
  }, [user]);

  const handleStatusChange = (orderId, newStatus) => {
    setLocalStatuses({
      ...localStatuses,
      [orderId]: newStatus
    });
  };

  const handleSaveStatus = async (orderId) => {
    const newStatus = localStatuses[orderId];
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        showNotification(`Order status updated to "${newStatus}"`);
        fetchAllOrders();
      } else {
        showNotification("Error updating status", "error");
      }
    } catch (err) {
      showNotification("Network error", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${API_BASE}/orders/cancel/${orderId}`, {
        method: "PUT"
      });
      if (res.ok) {
        showNotification("Order cancelled successfully");
        fetchAllOrders();
      } else {
        showNotification("Error cancelling order", "error");
      }
    } catch (err) {
      showNotification("Network error", "error");
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
        <h1 style={titleStyle}>Manage Orders</h1>
        <span style={countTextStyle}>{orders.length} total orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={noOrdersStyle}>
          <ClipboardCheck size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
          <h3>No orders placed yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Orders placed by customers will appear here.</p>
        </div>
      ) : (
        <div style={ordersListStyle}>
          {orders.map((order) => {
            const finalPrice = Math.round(order.price * (1 - order.discount / 100));
            const isPending = order.orderStatus !== "delivered" && order.orderStatus !== "cancelled";

            return (
              <div key={order._id} className="card animate-fade-in" style={orderCardStyle}>
                <div style={orderHeaderStyle}>
                  <div>
                    <span style={headerLabelStyle}>ORDER ID</span>
                    <span style={headerValueStyle}>{order._id}</span>
                  </div>
                  <div>
                    <span style={headerLabelStyle}>PLACED ON</span>
                    <span style={headerValueStyle}>{order.orderDate}</span>
                  </div>
                  <div>
                    <span style={headerLabelStyle}>CUSTOMER</span>
                    <span style={headerValueStyle}>{order.name} ({order.email})</span>
                  </div>
                </div>

                <div style={orderBodyStyle}>
                  {/* Image */}
                  <div style={imgWrapperStyle}>
                    <img src={order.mainImg} alt={order.title} style={imgStyle} />
                  </div>

                  {/* Details */}
                  <div style={infoStyle}>
                    <h3 style={itemTitleStyle}>{order.title}</h3>
                    <div style={metaRowStyle}>
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

                    <div style={shippingBoxStyle}>
                      <strong>Shipping Address:</strong> {order.address}, PIN: {order.pincode} <br />
                      <strong>Contact Phone:</strong> {order.mobile} <br />
                      <strong>User ID reference:</strong> {order.userId}
                    </div>
                  </div>

                  {/* Actions / Status management */}
                  <div style={actionsPanelStyle}>
                    <div style={statusSelectGroupStyle}>
                      <label style={formLabelStyle}>Order Status</label>
                      <div style={dropdownWrapperStyle}>
                        <select
                          value={localStatuses[order._id] || order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          style={statusSelectStyle}
                        >
                          <option value="order placed">Order Placed</option>
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div style={buttonGroupStyle}>
                      <button
                        onClick={() => handleSaveStatus(order._id)}
                        disabled={updatingId === order._id || localStatuses[order._id] === order.orderStatus}
                        className="btn btn-primary"
                        style={actionButtonStyle}
                      >
                        {updatingId === order._id ? "Saving..." : "Update Status"}
                      </button>

                      {isPending && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="btn btn-secondary"
                          style={cancelButtonStyle}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
  alignItems: "baseline",
  marginBottom: "36px"
};

const titleStyle = {
  fontSize: "2.2rem",
  fontWeight: "800",
  letterSpacing: "-0.5px"
};

const countTextStyle = {
  fontSize: "1rem",
  fontWeight: "500",
  color: "var(--text-muted)"
};

const noOrdersStyle = {
  padding: "80px 24px",
  textAlign: "center",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const ordersListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "28px"
};

const orderCardStyle = {
  background: "#fff",
  overflow: "hidden"
};

const orderHeaderStyle = {
  background: "#f9fafb",
  borderBottom: "1px solid var(--light-border)",
  padding: "16px 24px",
  display: "flex",
  gap: "40px",
  flexWrap: "wrap"
};

const headerLabelStyle = {
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--text-muted)",
  display: "block",
  marginBottom: "2px"
};

const headerValueStyle = {
  fontSize: "0.88rem",
  fontWeight: "600",
  color: "var(--dark)"
};

const orderBodyStyle = {
  padding: "24px",
  display: "flex",
  alignItems: "start",
  gap: "24px",
  flexWrap: "wrap"
};

const imgWrapperStyle = {
  width: "120px",
  height: "120px",
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
  flex: "1",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: "280px"
};

const itemTitleStyle = {
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--dark)"
};

const metaRowStyle = {
  display: "flex",
  gap: "20px",
  fontSize: "0.88rem",
  color: "var(--text-muted)"
};

const priceWrapperStyle = {
  display: "flex",
  alignItems: "baseline",
  gap: "8px",
  marginTop: "4px"
};

const finalPriceStyle = {
  fontSize: "1.3rem",
  fontWeight: "800",
  color: "var(--primary)"
};

const originalPriceStyle = {
  fontSize: "0.95rem",
  color: "var(--text-muted)",
  textDecoration: "line-through"
};

const shippingBoxStyle = {
  background: "var(--light)",
  padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  fontSize: "0.85rem",
  color: "var(--text-main)",
  lineHeight: "1.4",
  marginTop: "8px",
  border: "1px solid var(--light-border)"
};

const actionsPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  minWidth: "220px"
};

const statusSelectGroupStyle = {
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

const dropdownWrapperStyle = {
  position: "relative"
};

const statusSelectStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  outline: "none",
  background: "#fff",
  fontSize: "0.92rem",
  fontWeight: "600",
  cursor: "pointer"
};

const buttonGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const actionButtonStyle = {
  width: "100%",
  padding: "10px",
  fontSize: "0.9rem"
};

const cancelButtonStyle = {
  width: "100%",
  padding: "10px",
  fontSize: "0.9rem",
  background: "#fff",
  color: "var(--danger)",
  borderColor: "var(--danger)"
};
