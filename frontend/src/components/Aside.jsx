import { useState } from "react"
import BotonAside from "./BotonAside"
import { FiHome } from "react-icons/fi";
import { FiArchive } from "react-icons/fi";
import { FiClipboard } from "react-icons/fi";

export default function Aside() {
    const [activeSection, setActiveSection] = useState("dashboard")

    return(
        <div className="w-[25%] h-screen flex flex-col items-stretch border-r-gray-500 border-r">
            {/* LOGO */} 
            <div className="px-6 pt-6 pb-4 flex justify-center mb-10">
                <img src="" alt="logo" className="h-8"/>
            </div>

            <div className="">
                {/*FOTO DE PERFIL Y NOMBRE*/}
                <div className="flex flex-col items-center ">
                    <img src="" alt="FOTO DE PERFIL" className="w-46 h-46 rounded-full bg-[#0f1d29] mb-3"/>
                    <h1 className="text-2xl font-semibold text-white">Peter Parker</h1>
                    <h2 className="text-xl text-[#19F124] font-medium">Docente</h2>
                </div>
            </div>

                {/*BOTONES*/}
                    <div className="mt-8 px-4 space-y-2 text-xl font-medium flex flex-col justify-center align-middle m-auto">
                    <BotonAside onClick={() => setActiveSection ("dashboard")} activo={activeSection === "dashboard"}>
                        <FiHome className="w-8 h-8 shrink-0 currentColor"/>
                        <span>Dashboard</span>
                    </BotonAside>
                    
                    <BotonAside onClick={() => setActiveSection ("legajo")} activo={activeSection === "legajo"}>
                        <FiArchive className="w-8 h-8 shrink-0 currentColor"/>
                        <span>Mi Legajo</span>
                        </BotonAside>

                    <BotonAside onClick={() => setActiveSection ("contratos")} activo={activeSection === "contratos"}>
                        <FiClipboard className="w-8 h-8 shrink-0 currentColor"/>
                        <span>Contratos</span>
                        </BotonAside>
                        </div>
                </div>
    )
}