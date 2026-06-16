import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Notification } from "./components/Notification";

import LandingPage from "./pages/LandingPage";
import ProductsList from "./pages/ProductsList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminNewProduct from "./pages/AdminNewProduct";

// Layout wrapper component
function LayoutWrapper({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Notification />
      <div className="container" style={{ flex: 1, paddingBottom: "40px" }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}

// Protected route validation
function ProtectedRoute({ children, usertype }) {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (usertype && user.usertype !== usertype) {
    return <Navigate to={user.usertype === "Admin" ? "/admin" : "/"} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Authentication */}
          <Route path="/login" element={<LayoutWrapper><Login /></LayoutWrapper>} />
          <Route path="/register" element={<LayoutWrapper><Register /></LayoutWrapper>} />

          {/* Customer views */}
          <Route path="/" element={<LayoutWrapper><LandingPage /></LayoutWrapper>} />
          <Route path="/products" element={<LayoutWrapper><ProductsList /></LayoutWrapper>} />
          <Route path="/product/:id" element={<LayoutWrapper><ProductDetail /></LayoutWrapper>} />
          <Route path="/cart" element={<LayoutWrapper><ProtectedRoute usertype="Customer"><Cart /></ProtectedRoute></LayoutWrapper>} />
          <Route path="/profile" element={<LayoutWrapper><ProtectedRoute usertype="Customer"><Profile /></ProtectedRoute></LayoutWrapper>} />

          {/* Admin views */}
          <Route path="/admin" element={<LayoutWrapper><ProtectedRoute usertype="Admin"><AdminDashboard /></ProtectedRoute></LayoutWrapper>} />
          <Route path="/admin/orders" element={<LayoutWrapper><ProtectedRoute usertype="Admin"><AdminOrders /></ProtectedRoute></LayoutWrapper>} />
          <Route path="/admin/products" element={<LayoutWrapper><ProtectedRoute usertype="Admin"><AdminProducts /></ProtectedRoute></LayoutWrapper>} />
          <Route path="/admin/new-product" element={<LayoutWrapper><ProtectedRoute usertype="Admin"><AdminNewProduct /></ProtectedRoute></LayoutWrapper>} />

          {/* Catch all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
