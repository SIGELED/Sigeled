import BotonAside from "./BotonAside"
import { FiHome, FiArchive, FiClipboard, FiUsers } from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/svg/logoAncho.svg";

export default function Aside({activeSection, setActiveSection}) {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const isAdmin = Array.isArray(user?.roles) && user.roles.some(r => 
        (typeof r === 'string' ? r : r?.nombre)?.toUpperCase() === 'ADMIN'
    )

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

    return (
        <div className="w-[18%] h-screen flex flex-col items-stretch border-r border-gray-500">
            <div className="flex justify-center mt-4">
            <img src={logo} alt="logo" className="h-30 w-30" />
            </div>

            <div className="flex flex-col items-center mt-6">
                <img
                    src={null}
                    alt="FOTO DE PERFIL"
                    className="w-40 h-40 rounded-full bg-[#0f1d29] mb-3"
                />
                <h1 className="text-2xl font-semibold text-white">
                    {user?.apellido} {user?.nombre}
                </h1>
                <p className="text-[1rem] text-[#19F124] font-medium mt-2 text-center">
                    {perfilesFormateados}
                </p>
            </div>

            <div className="flex-1 flex flex-col px-2 mt-8 space-y-2 font-medium">
                <BotonAside
                    onClick={() => {
                    setActiveSection("dashboard");
                    navigate("/dashboard");
                    }}
                    activo={activeSection === "dashboard"}
                >
                    <FiHome className="w-7 h-7 shrink-0 currentColor" />
                    <span>Dashboard</span>
                </BotonAside>

                <BotonAside
                    onClick={() => {
                    setActiveSection("legajo");
                    navigate("/dashboard/legajo");
                    }}
                    activo={activeSection === "legajo"}
                >
                    <FiArchive className="w-7 h-7 shrink-0 currentColor" />
                    <span>Mi Legajo</span>
                </BotonAside>

                {isAdmin && (
                    <BotonAside
                    onClick={() => {
                        setActiveSection("contratos");
                        navigate("/dashboard/contratos");
                    }}
                    activo={activeSection === "contratos"}
                    >
                    <FiClipboard className="w-7 h-7 shrink-0 currentColor" />
                    <span>Contratos</span>
                    </BotonAside>
                )}

                {isAdmin && (
                    <BotonAside
                    onClick={() => {
                        setActiveSection("usuarios");
                        navigate("/dashboard/usuarios");
                    }}
                    activo={activeSection === "usuarios"}
                    >
                    <FiUsers className="w-7 h-7 shrink-0 currentColor" />
                    <span>Usuarios</span>
                    </BotonAside>
                )}
                </div>

                <div className="mt-auto mb-4 px-2">
                <BotonAside onClick={handleLogout} variant="logout">
                    <MdLogout className="w-8 h-8 shrink-0 text-[#ff2c2c]" />
                    <span>Cerrar Sesión</span>
                </BotonAside>
            </div>
        </div>
        );
}