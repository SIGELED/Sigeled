import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"

export default function Inicio() {
    return (
        <div>
            <Navbar/>
            <div className="flex flex-col justify-center items-center align-middle py-20">
                
                <h1 className="text-white text-6xl text-center max-w-[35rem] text"><b>Digitalizá</b> y <b>ordená</b> tu <b>documentación </b>profesional en un solo lugar.</h1>
            </div>
        </div>
    )
}