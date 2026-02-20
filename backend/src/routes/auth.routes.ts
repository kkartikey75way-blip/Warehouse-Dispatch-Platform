import { Router } from "express";
import {
    registerController,
    loginController,
    refreshController,
    verifyEmailController,
    renewShiftTokenController
} from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import {
    registerSchema,
    loginSchema
} from "../validators/auth.validator";
import { authRateLimiter } from "../middlewares/rateLimit.middleware";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { UserRole } from "../constants/roles";

const router = Router();

router.post(
    "/register",
    authRateLimiter,
    validate(registerSchema),
    registerController
);

router.post(
    "/login",
    authRateLimiter,
    validate(loginSchema),
    loginController
);

router.post(
    "/refresh",
    refreshController
);

router.get(
    "/verify-email",
    verifyEmailController
);


router.post(
    "/renew-shift-token",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN),
    renewShiftTokenController
);

export default router;
