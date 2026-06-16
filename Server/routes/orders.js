import express from "express";
import {
  getAllOrders,
  getUserOrders,
  createOrder,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getAllOrders);
router.get("/user/:userId", getUserOrders);
router.post("/", createOrder);
router.put("/:orderId", updateOrderStatus);
router.put("/cancel/:orderId", cancelOrder); // Use PUT to update status to cancelled

export default router;
