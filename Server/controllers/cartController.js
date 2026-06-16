import { Cart } from "../models/Schema.js";

export const getCartByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const items = await Cart.find({ userId });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching cart items", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  const { userId, title, description, mainImg, size, quantity, price, discount } = req.body;
  try {
    if (!userId || !title || !price) {
      return res.status(400).json({ message: "User ID, title, and price are required" });
    }
    // Check if the item already exists with the same size
    let existingItem = await Cart.findOne({ userId, title, size });
    if (existingItem) {
      existingItem.quantity += Number(quantity || 1);
      await existingItem.save();
      return res.status(200).json({ message: "Cart item quantity updated", cartItem: existingItem });
    } else {
      const newItem = new Cart({
        userId,
        title,
        description,
        mainImg,
        size,
        quantity: Number(quantity || 1),
        price: Number(price),
        discount: Number(discount) || 0
      });
      await newItem.save();
      return res.status(201).json({ message: "Item added to cart", cartItem: newItem });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error adding item to cart", error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  const { cartId } = req.params;
  try {
    const deletedItem = await Cart.findByIdAndDelete(cartId);
    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    return res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    return res.status(500).json({ message: "Error removing item from cart", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  const { userId } = req.params;
  try {
    await Cart.deleteMany({ userId });
    return res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};
