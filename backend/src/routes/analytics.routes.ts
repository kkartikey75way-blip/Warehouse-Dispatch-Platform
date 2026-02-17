import { Router } from "express";
import { getDashboardController } from "../controllers/analytics.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { UserRole } from "../constants/roles";

const router = Router();

router.get(
    "/dashboard",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN, UserRole.DISPATCHER),
    getDashboardController
);

export default router;
