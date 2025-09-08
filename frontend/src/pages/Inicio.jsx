import { Link } from "react-router-dom"
import { useState } from "react"
import BotonesInicio from "../components/BotonesInicio"

export default function Inicio() {
    const [mostrarBotones, setMostrarBotones] = useState(false)

    return (
        <div>
            <div className="flex flex-col items-center justify-center h-screen align-middle">
                <div className="flex flex-col items-center justify-center py-20 align-middle">
                    <h1 className="text-white text-6xl text-center max-w-[35rem] text"><b>Digitalizá</b> y <b>ordená</b> tu <b>documentación </b>profesional en un solo lugar.</h1>

                    {!mostrarBotones && ( 
                    <button onClick={() => setMostrarBotones(true)} className="bg-white rounded-full h-16 px-10 text-[2.5rem] font-black text-[#020c14] mt-10 cursor-pointer">¡Empezar a gestionar!</button>
                    )}
                    {mostrarBotones && (<BotonesInicio/>)}
                </div>
            </div>

            <div className="h-screen bg-white">
                
            </div>
        </div>
    )
}