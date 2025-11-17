import { useState } from "react";
import BotonAside from "./BotonAside";
import {
    FiHome,
    FiArchive,
    FiClipboard,
    FiUsers,
    FiFileText,
    FiChevronsLeft,
    FiChevronsRight,
} from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/svg/logoAncho.svg";
import logoPlegado from "../assets/svg/logo.svg";

export default function Aside() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);

    const isAdmin =
        Array.isArray(user?.roles) &&
        user.roles.some((r) => {
            const code = String(
                typeof r === "string" ? r : r?.codigo ?? r?.nombre ?? ""
            ).toUpperCase();
            return code === "ADMIN" || code === "RRHH";
        });


    const handleLogout = () =>{
        logout();
        navigate("/");
    };

    const perfilNames = {
        "Profesor": "Profesor",
        "Coordinador":"Coordinador",
        "Administrador": "Administrador",
        "Recursos Humanos": "RRHH",
        "Investigador": "Investigador"
    }

    if (!user) {
    return (
        <div className="w-[20%] h-screen flex items-center justify-center text-white">
            Cargando...
        </div>
        );
    }

    const perfilesFormateados =
        user?.perfiles && user.perfiles.length > 0
        ? user.perfiles
            .map((perfil) => perfilNames[perfil?.nombre] || perfil?.nombre)
            .join(" • ")
        : "Sin perfil asignado";

    const getActiveSection = () => {
        const path = location.pathname;

        if (path.startsWith("/dashboard/clampy")) return "clampy";
        if (path.startsWith("/dashboard/legajo")) return "legajo";
        if (path.startsWith("/dashboard/mis-contratos")) return "mis-contratos";
        if (path.startsWith("/dashboard/contratos")) return "contratos";
        if (path.startsWith("/dashboard/usuarios")) return "usuarios";
        if (path === "/dashboard" || path === "/dashboard/") return "dashboard";

        return "dashboard";
    };

    const activeSection = getActiveSection();

    return (
        <aside
            className={`relative shrink-0 flex flex-col bg-[#101922] transition-all duration-300 ease-in-out ${
                collapsed ? "w-20 items-center rounded-full transition-all ml-5 h-[95%] m-auto " : "w-[16%] transition-all"
            }`}
        >
        <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className={`cursor-pointer transition-all  absolute -right-3 top-90 z-10 flex items-center justify-center w-6 h-6 rounded-sm ${collapsed ? "hover:bg-[#19F124] border-2 border-[#19F124] bg-[#030C14] text-[#19F124] hover:text-[#030C14]" : "hover:bg-[#3af743] border-2 border-[#19F124] bg-[#19F124] text-[#030C14]"}`}
        >
            {collapsed ? <FiChevronsRight size={19} /> : <FiChevronsLeft size={19} />}
        </button>

        <div className="flex items-center justify-center mt-6 mb-6">
            <img
            src={collapsed ? logoPlegado : logo}
            alt="logo"
            className={collapsed ? "h-10 w-auto" : "h-15 w-auto"}
            />
        </div>

        <div className="w-[85%] m-auto rounded-full h-[0.1rem] bg-white/10" />

        {collapsed ? (
            <div className="flex items-center justify-center p-2 mt-4 mb-3 hover:bg-[#21303f] rounded-xl transition-all">
                <div
                    className=" w-12 h-12 rounded-full bg-[#030C14] cursor-default flex items-center justify-center text-white text-lg font-semibold"
                    title={`${user.apellido} ${user.nombre} · ${perfilesFormateados}`}
                >
                    {(user.apellido?.[0] || "") + (user.nombre?.[0] || "") || "U"}
                </div>
            </div>
        ) : (
            <div className="flex flex-row items-center justify-center gap-3 p-3 m-auto mt-3 mb-3">
            <div className="w-15 h-15 rounded-full bg-[#030C14] flex items-center justify-center text-white text-lg font-semibold" title={`${user.apellido} ${user.nombre} · ${perfilesFormateados}`}>
                {(user.apellido?.[0] || "") + (user.nombre?.[0] || "") || "U"}
            </div>
            <div className="flex flex-col text-start">
                <h1 className="text-2xl font-semibold text-white">
                    {user.apellido} {user?.nombre}
                </h1>
                <p className="text-[0.82rem] text-[#19F124] font-medium text-start">
                {perfilesFormateados}
                </p>
            </div>
            </div>
        )}


            <div className="w-[90%] m-auto rounded-full h-[0.1rem] bg-white/10" />

        <div
            className={`flex flex-col flex-1 mt-4 font-medium ${
            collapsed ? "items-center gap-4" : "px-2 space-y-2"
            }`}
        >
            <BotonAside
            onClick={() => navigate("/dashboard")}
            activo={activeSection === "dashboard"}
            collapsed={collapsed}
            >
                <FiHome size={24} className="shrink-0 currentColor" />
                {!collapsed && <span>Dashboard</span>}
            </BotonAside>

            <BotonAside
            onClick={() => navigate("/dashboard/legajo")}
            activo={activeSection === "legajo"}
            collapsed={collapsed}
            >
                <FiArchive size={24} className="shrink-0 currentColor" />
                {!collapsed && <span>Mi Legajo</span>}
            </BotonAside>

            <BotonAside
            onClick={() => navigate("/dashboard/mis-contratos")}
            activo={activeSection === "mis-contratos"}
            collapsed={collapsed}
            >
                <FiFileText size={24} className="shrink-0 currentColor" />
                {!collapsed && <span>Mis Contratos</span>}
            </BotonAside>

            {isAdmin && (
            <BotonAside
                onClick={() => navigate("/dashboard/contratos")}
                activo={activeSection === "contratos"}
                collapsed={collapsed}
            >
                <FiClipboard size={24} className="shrink-0 currentColor" />
                {!collapsed && <span>Contratos</span>}
            </BotonAside>
            )}

            {isAdmin && (
            <BotonAside
                onClick={() => navigate("/dashboard/usuarios")}
                activo={activeSection === "usuarios"}
                collapsed={collapsed}
            >
                <FiUsers size={24} className="shrink-0 currentColor" />
                {!collapsed && <span>Usuarios</span>}
            </BotonAside>
            )}

            {isAdmin && (
                <BotonAside
                    onClick={() => navigate("/dashboard/clampy")}
                    activo={activeSection === "clampy"}
                    collapsed={collapsed}
                >
                    <FiFileText size={24} className="shrink-0 currentColor"/>
                    {!collapsed && <span>Clampy</span>}
                </BotonAside>
            )}
        </div>

        <div className={collapsed ? "mb-4 flex justify-center" : "px-2 mt-auto mb-4"}>
            <BotonAside
            onClick={handleLogout}
            variant="logout"
            collapsed={collapsed}
            >
            <MdLogout size={24} className="shrink-0" />
                {!collapsed && <span>Cerrar Sesión</span>}
            </BotonAside>
        </div>
        </aside>
    );
}