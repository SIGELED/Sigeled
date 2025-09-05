import { Link } from "react-router-dom"
import { useState } from "react"
import Navbar from "../components/BotonesInicio"

export default function Inicio() {
    const [mostrarBotones, setMostrarBotones] = useState(false)

    return (
        <div className="flex justify-center align-middle items-center h-screen">
            <div className="flex flex-col justify-center items-center align-middle py-20">
                <h1 className="text-white text-6xl text-center max-w-[35rem] text"><b>Digitalizá</b> y <b>ordená</b> tu <b>documentación </b>profesional en un solo lugar.</h1>

                {!mostrarBotones && ( 
                <button onClick={() => setMostrarBotones(true)} className="bg-white rounded-full h-16 px-10 text-[2.5rem] font-black text-[#020c14] mt-10 cursor-pointer">¡Empezar a gestionar!</button>
                )}
                {mostrarBotones && (<Navbar/>)}
            </div>
        </div>
    )
}