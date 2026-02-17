import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { type RootState } from "../store/store";

interface Props {
    children: React.ReactNode;
    allowedRoles?: ("WAREHOUSE_MANAGER" | "DISPATCHER" | "DRIVER" | "ADMIN")[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
    const { isAuthenticated, user } = useSelector(
        (state: RootState) => state.auth
    );

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
