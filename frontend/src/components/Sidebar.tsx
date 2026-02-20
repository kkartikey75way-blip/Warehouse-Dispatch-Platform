import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/reducers/authReducer";
import type { RootState } from "../store/store";
import { Icons } from "./Icons";
import { useGetUnreadCountQuery } from "../services/notificationApi";

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

const allNavItems = [
    { label: "Home", path: "/home", icon: <Icons.Dashboard className="w-5 h-5" />, roles: ["admin", "warehouse_manager", "dispatcher", "driver"] },
    { label: "Analytics", path: "/analytics", icon: <Icons.Dashboard className="w-5 h-5" />, roles: ["admin", "warehouse_manager", "dispatcher"] },
    { label: "Shipments", path: "/shipments", icon: <Icons.Package className="w-5 h-5" />, roles: ["admin", "warehouse_manager", "dispatcher"] },
    { label: "Dispatch", path: "/dispatch", icon: <Icons.Package className="w-5 h-5" />, roles: ["admin", "warehouse_manager", "dispatcher"] },
    { label: "Deliveries", path: "/deliveries", icon: <Icons.Truck className="w-5 h-5" />, roles: ["driver", "admin", "warehouse_manager", "dispatcher"] },
    { label: "Drivers", path: "/drivers", icon: <Icons.Truck className="w-5 h-5" />, roles: ["admin", "warehouse_manager", "dispatcher"] },
    { label: "Alerts", path: "/notifications", icon: <Icons.Dashboard className="w-5 h-5" />, roles: ["admin", "warehouse_manager", "dispatcher", "driver"] },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    const navItems = allNavItems.filter(item =>
        !item.roles || (user?.role && item.roles.includes(user.role.toLowerCase()))
    );

    const { data: unreadCount = 0 } = useGetUnreadCountQuery(undefined, {
        pollingInterval: 30000,
        skip: !user
    });

    return (
        <aside className={`${isCollapsed ? "w-24" : "w-72"} h-screen flex flex-col bg-surface border-r border-border-subtle fixed left-0 top-0 z-30 transition-all duration-300`}>
            {}
            <div className={`p-6 ${isCollapsed ? "px-0 flex flex-col items-center" : "px-8 flex items-center justify-between"} pb-10`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 flex-shrink-0">
                        <Icons.Package className="w-6 h-6" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-black tracking-tighter text-txt-main whitespace-nowrap">
                            WAREFLOW
                        </span>
                    )}
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-2 rounded-xl bg-txt-main/5 text-txt-muted hover:text-primary hover:bg-primary/5 transition-all duration-300 ${isCollapsed ? "mt-4" : ""}`}
                >
                    <Icons.ChevronLeft
                        className={`transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`}
                        strokeWidth={3}
                    />
                </button>
            </div>

            {}
            <nav className={`flex-1 ${isCollapsed ? "px-0 flex flex-col items-center" : "px-4"} flex flex-col gap-1 overflow-y-auto custom-scrollbar`}>
                {!isCollapsed && (
                    <p className="px-4 text-[10px] font-black tracking-[0.2em] text-txt-muted uppercase mb-3 opacity-50">Operation Console</p>
                )}
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        title={isCollapsed ? item.label : ""}
                        className={({ isActive }) => `
                            flex items-center ${isCollapsed ? "justify-center w-12 h-12" : "gap-3 px-4 py-3.5 w-full"} rounded-xl font-bold transition-all duration-200 relative group
                            ${isActive
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-txt-muted hover:bg-primary/5 hover:text-primary"
                            }
                        `}
                    >
                        <div className="flex-shrink-0">
                            {item.icon}
                        </div>
                        {!isCollapsed && <span className="flex-1 whitespace-nowrap">{item.label}</span>}

                        {item.label === "Alerts" && unreadCount > 0 && (
                            <span className={`${isCollapsed ? "absolute -top-1 -right-1" : "ml-auto"} w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/20`}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {}
            <div className={`p-4 mt-auto ${isCollapsed ? "px-0 flex flex-col items-center" : ""}`}>
                <div className={`premium-card ${isCollapsed ? "p-2 rounded-xl" : "p-5"} relative overflow-hidden group border-none bg-txt-main/5 transition-all duration-300`}>
                    <div className="relative z-10">
                        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 mb-4"}`}>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black uppercase flex-shrink-0">
                                {user?.email?.[0]}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.1em] opacity-60">
                                        {user?.role?.replace("_", " ")}
                                    </p>
                                    <p className="text-txt-main font-bold truncate text-xs">{user?.email}</p>
                                </div>
                            )}
                        </div>

                        {!isCollapsed && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-txt-muted hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors w-full bg-surface/50 py-2 rounded-lg justify-center"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                End Session
                            </button>
                        )}

                        {isCollapsed && (
                            <button
                                onClick={handleLogout}
                                title="End Session"
                                className="mt-4 w-10 h-10 flex items-center justify-center text-txt-muted hover:text-red-500 rounded-xl bg-surface/50 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
