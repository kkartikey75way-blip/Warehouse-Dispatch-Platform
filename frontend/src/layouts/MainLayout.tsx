import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-mesh">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 transition-all duration-300 flex flex-col min-h-screen ${isCollapsed ? "ml-24" : "ml-72"}`}>
                <TopBar />

                <div className="p-8 pb-12 flex-1 outline-none">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
