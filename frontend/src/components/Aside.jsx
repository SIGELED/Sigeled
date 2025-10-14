import BotonAside from "./BotonAside"
import { FiHome, FiArchive, FiClipboard, FiUser } from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/svg/logoAncho.svg";

export default function Aside({activeSection, setActiveSection}) {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () =>{
        logout();
        navigate("/");
    };

    const roleNames = {
        ADMIN: "Administrador",
        DOCENTE: "Docente",
        RRHH: "Recursos Humanos",
        ADMTVO: "Administrativo",
        EMP: "Empleado"
    }

    return(
        <div className="w-[20%] h-screen flex flex-col items-stretch border-r-gray-500 border-r">
            {/* LOGO */} 
            <div className="flex justify-center ">
                <img src={logo} alt="logo" className="h-30 w-30"/>
            </div>

            <div className="">
                {/*FOTO DE PERFIL Y NOMBRE*/}
                <div className="flex flex-col items-center">
                    <img src="" alt="FOTO DE PERFIL" className="w-40 h-40 rounded-full bg-[#0f1d29] mb-3"/>
                    <h1 className="text-2xl font-semibold text-white"><span>{user.apellido} {user.nombre}</span></h1>
                    <h2 className="text-xl text-[#19F124] font-medium">{user.roles && user.roles.length > 0 ? roleNames[user.roles[0]] || user.roles[0]: "Sin Rol"}</h2>
                </div>
            </div>

            {/*BOTONES*/}
                <div className="flex flex-col px-2 mt-8 space-y-2 font-medium ">
                <BotonAside onClick={() => setActiveSection ("dashboard")} activo={activeSection === "dashboard"}>
                    <FiHome className="w-7 h-7 shrink-0 currentColor"/>
                    <span>Dashboard</span>
                </BotonAside>
                
                <BotonAside onClick={() => setActiveSection ("legajo")} activo={activeSection === "legajo"}>
                    <FiArchive className="w-7 h-7 shrink-0 currentColor"/>
                    <span>Mi Legajo</span>
                </BotonAside>

                <BotonAside onClick={() => setActiveSection ("contratos")} activo={activeSection === "contratos"}>
                    <FiClipboard className="w-7 h-7 shrink-0 currentColor"/>
                    <span>Contratos</span>
                </BotonAside>

                {user.roles.includes('ADMIN') && (
                    <BotonAside onClick={() => setActiveSection ("usuarios")} activo={activeSection === "usuarios"}>
                        <FiUser className="w-7 h-7 shrink-0 currentColor"/>
                        <span>Usuarios</span>
                    </BotonAside>
                )}

                    <BotonAside onClick={handleLogout} variant="logout">
                        <MdLogout className="w-8 h-8 shrink-0 text-[#ff1010]"/>
                        <span>Cerrar Sesión</span>
                    </BotonAside>
            </div>
        </div>
    )
}