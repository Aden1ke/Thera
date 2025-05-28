import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import WoundSeedService from "../services/WoundSeedService.js";
import APIResponse from "../utils/APIResponse.js";

const router = express.Router();

router.use(authMiddleware.handle.bind(authMiddleware));

router.get("/wound-seeds", async (req, res) => {
  try {
    const userId = req.userId;
    const result = await WoundSeedService.getEmotionalPatterns(userId);
    return APIResponse.success(res, result, "Wound Seeds fetched");
  } catch (err) {
    return APIResponse.error(res, err.message, 500);
  }
});

export default router;
