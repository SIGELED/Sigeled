import BotonAside from "./BotonAside"
import { FiHome, FiArchive, FiClipboard, FiUsers, FiFileText } from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/svg/logoAncho.svg";

export default function Aside() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = Array.isArray(user?.roles) && user.roles.some((r) => {
    const code = String(
        typeof r === 'string' ? r : (r?.codigo ?? r?.nombre ?? '')
    ).toUpperCase();
    return code === 'ADMIN' || code === 'RRHH';
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

        if (path.startsWith("/dashboard/legajo")) return "legajo";
        if (path.startsWith("/dashboard/mis-contratos")) return "mis-contratos";
        if (path.startsWith("/dashboard/contratos")) return "contratos";
        if (path.startsWith("/dashboard/usuarios")) return "usuarios";

        if (path.startsWith("/dashboard")) return "dashboard";

        return "dashboard";
    };

    const activeSection = getActiveSection();

    return (
        <div className="w-[18%] h-[100dvh] shrink-0 flex flex-col items-stretch bg-[#101922]">
            <div className="flex justify-center ">
            <img src={logo} alt="logo" className="h-30 w-30" />
            </div>

            <div className="flex flex-col items-center">
                <img
                    src={null}
                    alt="FOTO DE PERFIL"
                    className="w-40 h-40 rounded-full bg-[#030C14] mb-3"
                />
                <h1 className="text-2xl font-semibold text-white">
                    {user.apellido} {user?.nombre}
                </h1>
                <p className="text-[1rem] text-[#19F124] font-medium mt-2 text-center">
                    {perfilesFormateados}
                </p>
            </div>

            <div className="flex flex-col flex-1 px-2 mt-8 space-y-2 font-medium">
                <BotonAside
                    onClick={() => {
                    navigate("/dashboard");
                    }}
                    activo={activeSection === "dashboard"}
                >
                    <FiHome size={25} className=" shrink-0 currentColor" />
                    <span>Dashboard</span>
                </BotonAside>

                <BotonAside
                    onClick={() => {
                    navigate("/dashboard/legajo");
                    }}
                    activo={activeSection === "legajo"}
                >
                    <FiArchive size={25} className="shrink-0 currentColor" />
                    <span>Mi Legajo</span>
                </BotonAside>

                <BotonAside
                    onClick={() => {
                    navigate("/dashboard/mis-contratos");
                    }}
                    activo={activeSection === "mis-contratos"}
                    >
                    <FiFileText size={25} className="shrink-0 currentColor" />
                    <span>Mis Contratos</span>
                </BotonAside>

                {isAdmin && (
                    <BotonAside
                    onClick={() => {
                        navigate("/dashboard/contratos");
                    }}
                    activo={activeSection === "contratos"}
                    >
                    <FiClipboard size={25} className=" shrink-0 currentColor" />
                    <span>Contratos</span>
                    </BotonAside>
                )}

                {isAdmin && (
                    <BotonAside
                    onClick={() => {
                        navigate("/dashboard/usuarios");
                    }}
                    activo={activeSection === "usuarios"}
                    >
                        <FiUsers size={25} className=" shrink-0 currentColor" />
                        <span>Usuarios</span>
                    </BotonAside>
                )}
                </div>

                <div className="px-2 mt-auto mb-4">
                <BotonAside onClick={handleLogout} variant="logout">
                    <MdLogout size={25} className=" shrink-0 text-[#ff2c2c]" />
                    <span>Cerrar Sesión</span>
                </BotonAside>
            </div>
        </div>
        );
}