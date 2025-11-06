import { Outlet, useLocation } from "react-router-dom";
import Aside from "../components/Aside";

export default function DashboardLayout() {
    return (
        <div className="flex h-[100dvh] overflow-hidden bg-[#0f1d29]">
        <Aside />

        <main className="flex-1 overflow-y-auto">
            <Outlet />
        </main>
        </div>
    );
}
