import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { userService, personaService, identificationService, roleService, profileService } from "../../services/api"

export default function UsuarioDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null);
    const [persona, setPersona] = useState(null);
    const [identificacion, setIdentificacion] = useState(null);
    const [roles, setRoles] = useState([]);
    const [perfiles, setPerfiles] = useState([]);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await userService.getUsuarioById(id);
                setUsuario(userRes.data);

                if (userRes.data.id_persona){
                    const personaRes = await personaService.getPersonaByID(userRes.data.id_persona);
                    setPersona(personaRes.data);

                    const identRes = await identificationService.getIdentificaciones(userRes.data.id_persona);
                    setIdentificacion(identRes.data);

                    const perfilesRes = await profileService.getPersonaProfile(userRes.data.id_persona);
                    setPerfiles(perfilesRes.data || []);
                }

                const rolesRes = await roleService.getRolesByUser(userRes.data.id_persona);
                setRoles(rolesRes.data || []);

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
        } catch (err) {
            console.error("Error al asignar perfil:", err);
            alert("Error al asignar el perfil");
        }
    }

    if(!usuario) return <div className="text-2xl text-white">Cargando información...</div>;

    return(
        <div className="p-10 space-y-6 text-white">
            <button onClick={() => navigate(-1)} className="bg-[#19F124] text-[#101922] px-4 py-2 rounded-lg font-semibold hover:bg-[#24ff40] transition">
                Volver
            </button>

            <h1 className="mb-4 text-3xl font-black text-white">Datos del usuario</h1>

            <section className="bg-[#101922] rounded-2xl p-6">
                <h2 className="pb-2 mb-3 text-2xl font-semibold border-b border-gray-700">Datos de usuario</h2>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Estado:</strong>{usuario.activo ? "Activo":"Inactivo"}</p>
                <p><strong>Roles:</strong> {usuario.rolesAsignados?.length > 0 ? usuario.rolesAsignados.map(r => r.nombre).join(", "): "Sin rol asignado"}</p>
            </section>

            {persona && (
                <section className="bg-[#101922] rounded-2xl p-6">
                    <h2 className="pb-2 mb-3 text-2xl font-semibold border-b border-gray-700">Datos de persona</h2>
                    <p><strong>Nombre:</strong> {persona.nombre}</p>
                    <p><strong>Apellido:</strong> {persona.apellido}</p>
                    <p><strong>Fecha de Nacimiento:</strong>{persona.fecha_nacimiento || "No especificado"}</p>
                </section>
            )}

            {identificacion && (
                <section className="bg-[#101922] rounded-2xl p-6">
                    <h2 className="pb-2 mb-3 text-2xl font-semibold border-b border-gray-700">Datos de persona</h2>
                    <p><strong>DNI:</strong> {identificacion.dni}</p>
                    <p><strong>CUIL:</strong> {identificacion.cuil}</p>
                </section>
            )}

            <section className="bg-[#101922] rounded-2xl p-6">
                <h2 className="pb-2 mb-3 text-2xl font-semibold border-b border-gray-700">Asignar perfil</h2>
                <div className="flex items-center gap-3">
                <select value={perfilSeleccionado} onChange={(e) => setPerfilSeleccionado(e.target.value)} className="px-3 py-2 bg-[#242E38] rounded-xl">
                    <option value="">Seleccionar perfil</option>
                    {perfiles.map(p => (
                        <option key={p.id_perfil} value={p.id_perfil}>{p.nombre}</option>
                    ))}
                </select>

                <button onClick={handleAsignarPerfil} className="bg-[#19F124] text-[#101922] px-4 py-2 rounded-lg font-semibold hover:bg-[#24ff40] transition">
                    Asignar
                </button>

                </div>
            </section>
        </div>
    )
}