import React, { createContext, useState, useEffect, useContext } from "react";

const AppContext = createContext();

const API_BASE = "http://localhost:8000/api";

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("shopez_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [banner, setBanner] = useState("");
  const [notification, setNotification] = useState(null);

  // Show temporary notification toast
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Sync user state with localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("shopez_user", JSON.stringify(userData));
    showNotification(`Welcome back, ${userData.username}!`);
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem("shopez_user");
    showNotification("Logged out successfully");
  };

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!user || user.usertype === "Admin") return;
    try {
      const res = await fetch(`${API_BASE}/cart/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  // Add item to cart
  const addToCartBackend = async (product, size, quantity) => {
    if (!user) {
      showNotification("Please log in to add items to your cart", "warning");
      return false;
    }
    try {
      const res = await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          title: product.title,
          description: product.description,
          mainImg: product.mainImg,
          size,
          quantity,
          price: product.price,
          discount: product.discount
        })
      });
      if (res.ok) {
        showNotification("Added to cart!");
        fetchCart();
        return true;
      } else {
        const data = await res.json();
        showNotification(data.message || "Error adding to cart", "error");
        return false;
      }
    } catch (err) {
      showNotification("Network error", "error");
      return false;
    }
  };

  // Remove item from cart
  const removeFromCartBackend = async (cartId) => {
    try {
      const res = await fetch(`${API_BASE}/cart/remove/${cartId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showNotification("Item removed");
        fetchCart();
      }
    } catch (err) {
      showNotification("Error removing item", "error");
    }
  };

  // Fetch Banner config
  const fetchBanner = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/banner`);
      if (res.ok) {
        const data = await res.json();
        setBanner(data.banner);
      }
    } catch (err) {
      console.error("Error fetching banner:", err);
    }
  };

  // Fetch cart initially when user changes
  useEffect(() => {
    fetchCart();
    fetchBanner();
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        search,
        setSearch,
        banner,
        setBanner,
        notification,
        showNotification,
        login,
        logout,
        fetchCart,
        addToCart: addToCartBackend,
        removeFromCart: removeFromCartBackend,
        fetchBanner,
        API_BASE
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
