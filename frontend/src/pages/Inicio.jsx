import { Link } from "react-router-dom";

export default function Inicio() {
    return (
        <div className="flex flex-col justify-center items-center py-20">
            <h1 className="text-white text-6xl text-center max-w-[35rem]">
                <b>Digitalizá</b> y <b>ordená</b> tu <b>documentación </b>profesional en un solo lugar.
            </h1>
            <div className="mt-8 flex gap-4">
                <Link to="/registro" className="bg-blue-600 text-white px-4 py-2 rounded">Registrarse</Link>
                <Link to="/asignar-rol" className="bg-green-600 text-white px-4 py-2 rounded">Asignar Rol</Link>
            </div>
        </div>
    );
}
    // Aplica color blanco a los textos de inputs e instrucciones
    const inputStyle = { color: '#fff' };