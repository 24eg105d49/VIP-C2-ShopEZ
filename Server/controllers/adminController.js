import { User, Product, Orders, Admin } from "../models/Schema.js";

// Fetch admin statistics
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ usertype: "Customer" });
    const allProducts = await Product.countDocuments();
    const allOrders = await Orders.countDocuments();
    return res.status(200).json({ totalUsers, allProducts, allOrders });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching admin stats", error: error.message });
  }
};

// Fetch banner image and categories (Initialize default if not exists)
export const getBannerAndCategories = async (req, res) => {
  try {
    let adminConfig = await Admin.findOne();
    if (!adminConfig) {
      // Create default admin configuration
      adminConfig = new Admin({
        banner: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070",
        categories: ["fashion", "electronics", "mobiles", "groceries", "sports-equipment"]
      });
      await adminConfig.save();
    }
    return res.status(200).json(adminConfig);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching admin configurations", error: error.message });
  }
};

// Update banner URL
export const updateBanner = async (req, res) => {
  const { banner } = req.body;
  try {
    if (!banner) {
      return res.status(400).json({ message: "Banner URL is required" });
    }
    let adminConfig = await Admin.findOne();
    if (!adminConfig) {
      adminConfig = new Admin({
        banner,
        categories: ["fashion", "electronics", "mobiles", "groceries", "sports-equipment"]
      });
    } else {
      adminConfig.banner = banner;
    }
    await adminConfig.save();
    return res.status(200).json({ message: "Banner updated successfully", adminConfig });
  } catch (error) {
    return res.status(500).json({ message: "Error updating banner", error: error.message });
  }
};
