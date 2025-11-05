import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Aside from "../components/Aside";

export default function DashboardLayout() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const location = useLocation();

    useEffect(() => {
        const p = location.pathname;
        if (p.startsWith("/dashboard/usuarios")) setActiveSection("usuarios");
        else if (p.startsWith("/dashboard/contratos")) setActiveSection("contratos");
        else if (p.startsWith("/dashboard/legajo")) setActiveSection("legajo");
        else setActiveSection("dashboard");
    }, [location.pathname]);

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-[#0f1d29]">
        <Aside activeSection={activeSection} setActiveSection={setActiveSection} />

        <main className="flex-1 overflow-y-auto">
            <Outlet />
        </main>
        </div>
    );
}
