import express from "express";
import {
  getCartByUserId,
  addToCart,
  removeFromCart,
  clearCart
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/:userId", getCartByUserId);
router.post("/add", addToCart);
router.delete("/remove/:cartId", removeFromCart);
router.delete("/clear/:userId", clearCart);

export default router;
