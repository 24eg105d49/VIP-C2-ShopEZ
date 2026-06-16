import express from "express";
import { getAdminStats, getBannerAndCategories, updateBanner } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", getAdminStats);
router.get("/banner", getBannerAndCategories);
router.post("/banner", updateBanner);

export default router;
