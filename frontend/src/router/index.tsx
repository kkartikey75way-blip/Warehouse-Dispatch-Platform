import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "../router/ProtectedRoute";
import { SuspenseWrapper } from "../components/SuspenseWrapper";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const LoginPage = lazy(() => import("../pages/auth/Login"));
const RegisterPage = lazy(() => import("../pages/auth/Register"));
const VerifyEmailPage = lazy(() => import("../pages/auth/VerifyEmail"));
const DashboardPage = lazy(() => import("../pages/dashboard/Dashboard"));
const HomePage = lazy(() => import("../pages/home/Home"));
const ShipmentsPage = lazy(() => import("../pages/shipments/Shipments"));
const AnalyticsPage = lazy(() => import("../pages/analytics/Analytics"));
const DispatchPage = lazy(() => import("../pages/dispatch/Dispatch"));
const DriversPage = lazy(() => import("../pages/drivers/Drivers"));
const DeliveriesPage = lazy(() => import("../pages/deliveries/Deliveries"));
const NotificationsPage = lazy(() => import("../pages/notifications/Notifications"));
const InboundPage = lazy(() => import("../pages/inbound/Inbound"));
const ReportsPage = lazy(() => import("../pages/reports/Reports"));
const WarehousesPage = lazy(() => import("../pages/warehouses/Warehouses"));

export const router = createBrowserRouter([
    {
        path: "/",
        element: <SuspenseWrapper><LandingPage /></SuspenseWrapper>
    },
    {
        element: <AuthLayout />,
        children: [
            { path: "/login", element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
            { path: "/register", element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
            { path: "/verify-email", element: <SuspenseWrapper><VerifyEmailPage /></SuspenseWrapper> }
        ]
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "/dashboard",
                element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper>
            },
            {
                path: "/home",
                element: <SuspenseWrapper><HomePage /></SuspenseWrapper>
            },
            {
                path: "/shipments",
                element: <SuspenseWrapper><ShipmentsPage /></SuspenseWrapper>
            },
            {
                path: "/analytics",
                element: <SuspenseWrapper><AnalyticsPage /></SuspenseWrapper>
            },
            {
                path: "/dispatch",
                element: <SuspenseWrapper><DispatchPage /></SuspenseWrapper>
            },
            {
                path: "/drivers",
                element: <SuspenseWrapper><DriversPage /></SuspenseWrapper>
            },
            {
                path: "/deliveries",
                element: <SuspenseWrapper><DeliveriesPage /></SuspenseWrapper>
            },
            {
                path: "/notifications",
                element: <SuspenseWrapper><NotificationsPage /></SuspenseWrapper>
            },
            {
                path: "/inbound",
                element: <SuspenseWrapper><InboundPage /></SuspenseWrapper>
            },
            {
                path: "/reports",
                element: <SuspenseWrapper><ReportsPage /></SuspenseWrapper>
            },
            {
                path: "/warehouses",
                element: <SuspenseWrapper><WarehousesPage /></SuspenseWrapper>
            }
        ]
    }
]);
