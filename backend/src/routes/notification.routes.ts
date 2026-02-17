import { Router } from "express";
import {
    getNotificationsController,
    markReadController,
    getUnreadCountController,
    markAllReadController
} from "../controllers/notification.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", protect, getNotificationsController);
router.get("/unread-count", protect, getUnreadCountController);
router.patch("/:id/read", protect, markReadController);
router.patch("/mark-all-read", protect, markAllReadController);

export default router;
