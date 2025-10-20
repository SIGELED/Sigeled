import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { userService, profileService} from "../../services/api"
import { MdNavigateBefore } from "react-icons/md";

export default function UsuarioDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState("");
    const [todosLosPerfiles, setTodosLosPerfiles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, perfilesRes] = await Promise.all([
                    userService.getUsuarioById(id),
                    profileService.getProfiles()
                ])
                setTodosLosPerfiles(perfilesRes.data)
                setUsuario(userRes.data);
            } catch (err) {
                console.error("Error al obtener datos del usuario", err);
            }
        };

        fetchData();
    }, [id]);

    const handleAsignarPerfil = async () =>{
        if(!perfilSeleccionado) return;
        try {
            await profileService.assignProfile(usuario.id_persona, perfilSeleccionado);
            alert("Perfil asignado correctamente");
            const nuevoPerfil = todosLosPerfiles.find(perfil => perfil.id_perfil === parseInt(perfilSeleccionado));
            setUsuario(prev => ({
                ...prev,
                perfiles: [...(prev.perfiles || []), nuevoPerfil]
            }))
        } catch (err) {
            console.error("Error al asignar perfil:", err);
            alert("Error al asignar el perfil");
        }
    }

    if(!usuario) return <div className="text-2xl text-white">Cargando información...</div>;

    return(
        <div className=" text-white mt-7">
            <div className="flex flex-row ml-18 gap-4">
                <button onClick={() => navigate(-1)} className="p-1 border-2 border-[#19F124] rounded-full hover:bg-[#19F124]  cursor-pointer transition">
                    <MdNavigateBefore className="w-9 h-9 m-[-4px] hover:text-[#101922] text-[#19F124] transition"/>
                </button>
                <h1 className="text-4xl font-medium">
                    Informacion de <span className="text-[#19F124] font-black">{usuario.persona.nombre} {usuario.persona.apellido}</span>
                </h1>
            </div>

            <div className="mt-5 pl-10 pr-10">
                <section className="bg-[#101922] rounded-2xl p-6 mb-5 text-xl">
                    <h2 className="pb-2 mb-3 text-2xl font-semibold border-b border-gray-700 text-[#19F124]">Datos de usuario</h2>
                    <p><strong>Email: </strong> {usuario.email}</p>
                    <p><strong>Estado: </strong>{usuario.activo ? "Activo":"Inactivo"}</p>
                    <p><strong>Rol/es: </strong> {usuario.roles?.length > 0 ? usuario.roles.map(r => r.nombre).join(", "): "Sin rol asignado"}</p>
                </section>

                <section className="bg-[#101922] rounded-3xl p-6 mb-5">
                    <h2 className="pb-2 mb-3 text-2xl font-semibold border-b border-gray-700 text-[#19F124]">Datos personales</h2>
                    {usuario.persona && (
                        <section className="text-xl">
                            <p><strong>Nombre: </strong> {usuario.persona.nombre}</p>
                            <p><strong>Apellido: </strong> {usuario.persona.apellido}</p>
                            <p><strong>Fecha de Nacimiento: </strong>{usuario.persona.fecha_nacimiento?.split('T')[0] || "No especificado"}</p>
                        </section>
                    )}

                    {usuario.identificaciones?.length > 0 && (
                        <section className="text-xl">
                            <p><strong>DNI:</strong> {usuario.identificaciones[0].dni}</p>
                            <p><strong>CUIL:</strong> {usuario.identificaciones[0].cuil}</p>
                        </section>
                    )}
                </section>

                <section className="bg-[#101922] rounded-2xl p-6 text-xl">
                    <h2 className="pb-2 mb-3 text-2xl font-semibold border-b border-gray-700 text-[#19F124]">Asignar perfil</h2>
                    <div className="flex flex-col gap-3">
                    <p><strong>Perfiles del Usuario:</strong> {usuario.perfiles?.length > 0 ? usuario.perfiles.map(p => p.nombre).join(", "): "Sin perfil asignado"}</p>
                    <select value={perfilSeleccionado} onChange={(e) => setPerfilSeleccionado(e.target.value)} className="px-3 py-2 bg-[#242E38] rounded-xl">
                        <option value="">Seleccionar perfil</option>
                        {todosLosPerfiles.map(p => (
                            <option key={p.id_perfil} value={p.id_perfil}>{p.nombre}</option>
                        ))}
                    </select>

                    <button onClick={handleAsignarPerfil} className="bg-[#19F124] text-[#101922] px-4 py-2 rounded-lg font-semibold hover:bg-[#24ff40] transition">
                        Asignar
                    </button>

                    </div>
                </section>
            </div>
        </div>
    )
}