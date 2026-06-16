import { Orders, Cart } from "../models/Schema.js";

// Get all orders (Admin view)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Orders.find().sort({ orderDate: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching all orders", error: error.message });
  }
};

// Get user specific orders (Profile view)
export const getUserOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Orders.find({ userId }).sort({ orderDate: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user orders", error: error.message });
  }
};

// Create a new order (Supports single item or array of items from cart)
export const createOrder = async (req, res) => {
  const {
    userId,
    name,
    email,
    mobile,
    address,
    pincode,
    paymentMethod,
    items // Can be a single item object or an array of item objects
  } = req.body;

  try {
    if (!userId || !name || !email || !address || !pincode || !items) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const orderDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const deliveryDateObj = new Date();
    deliveryDateObj.setDate(deliveryDateObj.getDate() + 5); // Deliver in 5 days
    const deliveryDate = deliveryDateObj.toISOString().split("T")[0];

    const orderItems = Array.isArray(items) ? items : [items];
    const savedOrders = [];

    for (const item of orderItems) {
      const newOrder = new Orders({
        userId,
        name,
        email,
        mobile,
        address,
        pincode,
        title: item.title,
        description: item.description,
        mainImg: item.mainImg,
        size: item.size,
        quantity: Number(item.quantity || 1),
        price: Number(item.price),
        discount: Number(item.discount || 0),
        paymentMethod,
        orderDate,
        deliveryDate,
        orderStatus: "order placed"
      });
      const saved = await newOrder.save();
      savedOrders.push(saved);
    }

    // If checkout was from cart, clear the user's cart
    if (Array.isArray(items)) {
      await Cart.deleteMany({ userId });
    }

    return res.status(201).json({ message: "Order placed successfully", orders: savedOrders });
  } catch (error) {
    return res.status(500).json({ message: "Error placing order", error: error.message });
  }
};

// Update order status (Admin update)
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;
  try {
    const updatedOrder = await Orders.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ message: "Error updating order status", error: error.message });
  }
};

// Cancel order (User/Admin action - updates status to 'cancelled')
export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const updatedOrder = await Orders.findByIdAndUpdate(
      orderId,
      { orderStatus: "cancelled" },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ message: "Order cancelled successfully", order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
};
