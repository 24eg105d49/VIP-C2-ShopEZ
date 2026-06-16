import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";

import { Product } from "./models/Schema.js";

dotenv.config({ path: "./.env" });

const app = express();
app.use(express.json());
app.use(cors());

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "ShopEZ backend is running smoothly" });
});

// Register routers
app.use("/api/users", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "An unexpected error occurred on the server",
    error: process.env.NODE_ENV === "development" ? err.stack : {}
  });
});

const PORT = process.env.PORT || 8000;
const MongoUri = process.env.DRIVER_LINK || process.env.MONGO_URI;

if (!MongoUri) {
  console.error("Error: MONGO_URI or DRIVER_LINK environment variable is not defined.");
  process.exit(1);
}

// Seed Initial Products Helper
const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("No products found in DB. Seeding initial catalog...");
      const initialProducts = [
        {
          title: "Iphone 12",
          description: "Apple Iphone with 128GB ROM, Super Retina XDR display, A14 Bionic chip, dual-camera system.",
          mainImg: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600",
          carousel: [
            "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600",
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600",
            "https://images.unsplash.com/photo-1573148195900-7845dcb9b127?q=80&w=600"
          ],
          sizes: ["S", "M", "L", "XL"],
          category: "mobiles",
          gender: "Unisex",
          price: 79999,
          discount: 15
        },
        {
          title: "Realme buds",
          description: "TWS buds with 10.2mm dynamic drivers, active noise cancellation, and up to 28 hours battery life.",
          mainImg: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600",
          carousel: [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600",
            "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=600"
          ],
          sizes: ["One Size"],
          category: "electronics",
          gender: "Unisex",
          price: 3999,
          discount: 35
        },
        {
          title: "MRF cricket bat",
          description: "Popular willow wood cricket bat from MRF. Suitable for all format plays in all conditions.",
          mainImg: "https://images.unsplash.com/photo-1531415080290-bc9b161dd796?q=80&w=600",
          carousel: [
            "https://images.unsplash.com/photo-1531415080290-bc9b161dd796?q=80&w=600"
          ],
          sizes: ["Short Handle", "Long Handle"],
          category: "sports-equipment",
          gender: "Unisex",
          price: 1699,
          discount: 23
        },
        {
          title: "Carrom board",
          description: "Quality carrom board along with necessary equipment to make your free time more joyful.",
          mainImg: "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?q=80&w=600",
          carousel: [
            "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?q=80&w=600"
          ],
          sizes: ["M", "L"],
          category: "sports-equipment",
          gender: "Unisex",
          price: 1599,
          discount: 42
        },
        {
          title: "Kokobura cricket bat",
          description: "Imported cricket bat made with English willow wood. Premium bat to enhance your playing experience.",
          mainImg: "https://images.unsplash.com/photo-1608248597481-496100c8c836?q=80&w=600",
          carousel: [
            "https://images.unsplash.com/photo-1608248597481-496100c8c836?q=80&w=600"
          ],
          sizes: ["Short Handle", "Long Handle"],
          category: "sports-equipment",
          gender: "Unisex",
          price: 3199,
          discount: 26
        }
      ];
      await Product.insertMany(initialProducts);
      console.log("Seeding finished successfully.");
    }
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};

mongoose
  .connect(MongoUri)
  .then(async () => {
    console.log("Connected to MongoDB database successfully");
    await seedProducts();
    app.listen(PORT, () => {
      console.log(`App server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
  });
