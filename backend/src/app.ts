import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { globalRateLimiter } from "./middlewares/rateLimit.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

import authRoutes from "./routes/auth.routes";
import { protect } from "./middlewares/auth.middleware";
import { authorize } from "./middlewares/role.middleware";
import { UserRole } from "./constants/roles";
import shipmentRoutes from "./routes/shipment.routes";
import driverRoutes from "./routes/driver.routes";
import dispatchRoutes from "./routes/dispatch.routes";
import deliveryRoutes from "./routes/delivery.routes";
import analyticsRoutes from "./routes/analytics.routes";
import notificationRoutes from "./routes/notification.routes";
import exportRoutes from "./routes/export.routes";
import trackingRoutes from "./routes/tracking.routes";
import warehouseRoutes from "./routes/warehouse.routes";
import podRoutes from "./routes/proofOfDelivery.routes";
import schedulerRoutes from "./routes/scheduler.routes";
import { attachRequestId } from "./middlewares/requestId.middleware";
import { requestLogger } from "./middlewares/logging.middleware";



const app = express();

app.get(
    "/api/protected-test",
    protect,
    authorize(UserRole.WAREHOUSE_MANAGER),
    (_req, res) => {
        res.status(200).json({
            success: true,
            message: "Access granted"
        });
    }
);

app.use(attachRequestId);
app.use(requestLogger);


app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(globalRateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/warehouses", protect, warehouseRoutes);
app.use("/api/pod", podRoutes);
app.use("/api/reports", protect, schedulerRoutes);

app.use(errorMiddleware);

export default app;
