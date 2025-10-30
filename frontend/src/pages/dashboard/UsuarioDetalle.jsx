import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PersonaDocumentos from "../../components/PersonaDocumentos";
import PersonaDomicilios from "../../components/PersonaDomicilios";
import PersonaTitulos from "../../components/PersonaTitulos";
import { userService, profileService } from "../../services/api";
import { MdNavigateBefore } from "react-icons/md";
import { FiTrash2, FiUser, FiClipboard, FiHome, FiArchive } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

export default function UsuarioDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user:me, updateUserPerfiles } = useAuth();

    const [usuario, setUsuario] = useState(null);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState("");
    const [todosLosPerfiles, setTodosLosPerfiles] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [selectedProfiles, setSelectedProfiles] = useState([]);
    const [perfilesVigentes, setPerfilesVigentes] = useState([]);

    const [showDocs, setShowDocs] = useState(false);
    const [showDomicilios, setShowDomicilios] = useState(false);
    const [showTitulos, setShowTitulos] = useState(false);

    const TABS = { INFO: "info", DOCS: "docs", DOM: "dom", TIT: "tit" };
    const [tab, setTab] = useState(TABS.INFO);

    function SegmentedTabs({ value, onChange, TABS }) {
        const Item = ({ v, label, Icon }) => {
            const active = value === v;
            return (
            <button
                role="tab"
                aria-selected={active}
                onClick={() => onChange(v)}
                title={label}
                className={[
                    "group flex items-center justify-center rounded-full transition-all outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[#19F124]/60 text-2xl",
                    active
                        ? "bg-white/10 text-white shadow-inner px-3 h-10"
                        : "hover:bg-white/5 text-white/90 h-10 w-10 cursor-pointer"
                ].join(" ")}
            >
                <Icon size={30} className={active ? "text-[#19F124]" : "text-white"} />
                {active && (
                <span className="ml-2 font-semibold whitespace-nowrap">{label}</span>
                )}
                {!active && <span className="sr-only">{label}</span>}
            </button>
            );
        };

        return (
            <div
            className="inline-flex items-center gap-1 rounded-full bg-[#0D1520] p-2 border border-white/5 shadow-lg/30"
            role="tablist"
            aria-label="Secciones del usuario"
            >
                <Item v={TABS.INFO} label="Información Personal" Icon={FiUser} />
                <Item v={TABS.DOCS} label="Documentos"           Icon={FiClipboard} />
                <Item v={TABS.DOM}  label="Domicilios"           Icon={FiHome} />
                <Item v={TABS.TIT}  label="Títulos"              Icon={FiArchive} />
            </div>
        );
    }

    useEffect(() => {
        const fetchData = async () => {
        try {
            const [userRes, perfilesRes] = await Promise.all([
            userService.getUsuarioById(id),
            profileService.getProfiles(),
            ]);
            setTodosLosPerfiles(perfilesRes.data);
            setUsuario(userRes.data);

            if (userRes.data?.id_persona) {
            const vigRes = await profileService.getPersonaProfile(
                userRes.data.id_persona
            );
            setPerfilesVigentes(vigRes.data);
            }
        } catch (err) {
            console.error("Error al obtener datos del usuario", err);
        }
        };

        fetchData();
    }, [id]);

    const handleAsignarPerfil = async () => {
        if (!perfilSeleccionado) return;
        try {
            await profileService.assignProfile(usuario.id_persona, perfilSeleccionado);
            const vigRes = await profileService.getPersonaProfile(usuario.id_persona);
            setPerfilesVigentes(vigRes.data);
            setPerfilSeleccionado("");
            if(me?.id_persona === usuario.id_persona) {
                updateUserPerfiles(vigRes.data);
            }
            alert("Perfil asignado correctamente");
        } catch (error) {
            console.error("Error al asignar perfiles:", error);
            alert(error?.response?.data?.detalle || error?.response?.data?.message || "Error al asignar perfiles");
        }
    };

    const assignedIds = new Set(perfilesVigentes.map((p) => p.id_perfil));

    const toggleSelect = (perfilId) => {
        setSelectedProfiles((prev) =>
        prev.includes(perfilId)
            ? prev.filter((id) => id !== perfilId)
            : [...prev, perfilId]
        );
    };

    const handleEliminarPerfil = async (id_perfil, nombre) => {
        const ok = confirm(
        `¿Esta seguro que quiere quitar el perfil "${nombre}" de este usuario?`
        );
        if (!ok) return;
        try {
        await profileService.deleteProfile(usuario.id_persona, id_perfil);
        setPerfilesVigentes((prev) =>{
            const next = prev.filter((p) => p.id_perfil !== id_perfil)
                if (me?.id_persona === usuario.id_persona){
                    updateUserPerfiles(next);
                }
                return next;
            });
        alert("Perfil desasignado correctamente");
        } catch (error) {
        console.error("Error al desasignar perfil", error);
        alert("No se pudo desasignar el perfil");
        }
    };

    const handleAssignarMultiples = async () => {
        if (!usuario || selectedProfiles.length === 0) return;
        try {
        await Promise.all(
            selectedProfiles.map((pid) =>
            profileService.assignProfile(usuario.id_persona, pid)
            )
        );
        const vigRes = await profileService.getPersonaProfile(usuario.id_persona);
        setPerfilesVigentes(vigRes.data);
        setSelectedProfiles([]);
        setShowModal(false);
        if(me?.id_persona === usuario.id_persona){
            updateUserPerfiles(vigRes.data);
        }
        alert("Perfiles asignados correctamente");
        } catch (error) {
            console.error("Error al asignar perfiles:", error);
            alert(error?.response?.data?.detalle || error?.response?.data?.message || "Error al asignar perfiles");
        }
    };

    if (!usuario)
        return <div className="text-2xl text-white">Cargando información...</div>;

    return (
        <div className="text-white mt-7">
        <div className="flex items-center gap-4 ml-18">
            <button
            onClick={() => navigate(-1)}
            className="flex-none shrink-0 p-1 border-2 border-[#19F124] rounded-full hover:bg-[#19F124]  cursor-pointer transition"
            >
                <MdNavigateBefore size={35} className=" m-[-4px] hover:text-[#101922] text-[#19F124] transition" />
            </button>
            <div className="flex flex-row">
                <SegmentedTabs value={tab} onChange={setTab} TABS={TABS}/>
            </div>
        </div>

        <div className="px-10 mt-4">
            <div className="flex flex-wrap gap-3">
            <h1 className="text-4xl font-medium">
                    Informacion de{" "}
                    <span className="text-[#19F124] font-black">
                        {usuario.persona.nombre} {usuario.persona.apellido}
                    </span>
                </h1>
            </div>
        </div>

        {tab === TABS.INFO && (
            <div className="grid grid-cols-1 gap-6 pl-10 pr-10 mt-5 lg:grid-cols-2">
            <div className="space-y-5">
                <section className="bg-[#101922] rounded-2xl p-5 mb-5 text-2xl">
                <h2 className="pb-2 pl-4 mb-3 text-3xl font-semibold border-b-3 border-[#19F124] text-[#19F124]">
                    Datos de usuario
                </h2>
                <p>
                    <strong>Email: </strong> {usuario.email}
                </p>
                <p>
                    <strong>Estado: </strong>
                    {usuario.activo ? "Activo" : "Inactivo"}
                </p>
                <p>
                    <strong>Rol/es: </strong>{" "}
                    {usuario.roles?.length > 0
                    ? usuario.roles.map((r) => r.nombre).join(", ")
                    : "Sin rol asignado"}
                </p>
                </section>

                <section className="bg-[#101922] rounded-3xl p-5 mb-5">
                <h2 className="pb-2 pl-4 mb-3 text-3xl font-semibold border-b-3 border-[#19F124] text-[#19F124]">
                    Datos personales
                </h2>
                {usuario.persona && (
                    <section className="text-2xl">
                    <p>
                        <strong>Nombre: </strong> {usuario.persona.nombre}
                    </p>
                    <p>
                        <strong>Apellido: </strong> {usuario.persona.apellido}
                    </p>
                    <p>
                        <strong>Fecha de Nacimiento: </strong>
                        {usuario.persona.fecha_nacimiento?.split("T")[0] ||
                        "No especificado"}
                    </p>
                    </section>
                )}

                {usuario.identificaciones?.length > 0 && (
                    <section className="text-2xl">
                    <p>
                        <strong>DNI:</strong> {usuario.identificaciones[0].dni}
                    </p>
                    <p>
                        <strong>CUIL:</strong> {usuario.identificaciones[0].cuil}
                    </p>
                    </section>
                )}
                </section>
            </div>

            <div className="space-y-5">
                <section className="relative bg-[#101922] rounded-2xl p-5 text-2xl">
                <h2 className="pb-2 pl-4 mb-3 text-3xl font-semibold border-b-3 border-[#19F124] text-[#19F124]">
                    Perfiles del usuario
                </h2>

                <div className="space-y-2 text-2xl">
                    {perfilesVigentes.length > 0 ? (
                    perfilesVigentes.map((p) => (
                        <div
                        key={p.id_perfil}
                        className="flex items-center gap-3 font-semibold"
                        >
                        <span>• {p.nombre}</span>
                        <button
                            onClick={() =>
                            handleEliminarPerfil(p.id_perfil, p.nombre)
                            }
                            className="ml-auto p-2 rounded-lg hover:bg-[#1A2430] text-red-600 hover:text-red-500 transition cursor-pointer"
                            title="Quitar perfil"
                        >
                            <FiTrash2 size={18} />
                        </button>
                        </div>
                    ))
                    ) : (
                    <p className="opacity-70">Sin perfil asignado</p>
                    )}
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 w-full bg-[#101922] border-3 border-dashed text-[#19F124] py-2 rounded-2xl font-black hover:border-[#19F124] hover:bg-[#19F124] hover:text-[#101922] transition cursor-pointer"
                >
                    Asignar perfil +
                </button>
                </section>
            </div>
            </div>
        )}

        {tab === TABS.DOCS && (
            <div className="px-10 mt-6">
            <PersonaDocumentos idPersona={usuario.id_persona} asModal={false} />
            </div>
        )}

        {tab === TABS.DOM && (
            <div className="px-10 mt-6">
            <PersonaDomicilios idPersona={usuario.id_persona} asModal={false} />
            </div>
        )}

        {tab === TABS.TIT && (
            <div className="px-10 mt-6">
            <PersonaTitulos idPersona={usuario.id_persona} asModal={false} />
            </div>
        )}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                onClick={() => setShowModal(false)}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                className="relative z-10 w-[92%] max-w-xl bg-[#101922] rounded-2xl p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-semibold text-[#19F124]">
                    Asignar perfiles
                </h3>
                <button
                    onClick={() => setShowModal(false)}
                    className="p-1 rounded-lg hover:bg-[#1A2430] cursor-pointer transition hover:text-red-700"
                    aria-label="Cerrar"
                >
                    <IoClose size={24} />
                </button>
                </div>

                <div className="max-h-[50vh] overflow-auto pr-1">
                {todosLosPerfiles.length === 0 && (
                    <p className="opacity-70">No hay perfiles disponibles.</p>
                )}

                <ul className="space-y-2">
                    {todosLosPerfiles.map((p) => {
                    const disabled = assignedIds.has(p.id_perfil);
                    const checked = selectedProfiles.includes(p.id_perfil);
                    return (
                        <li
                        key={p.id_perfil}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
                            disabled ? "opacity-50" : "hover:bg-[#1A2430]"
                        }`}
                        >
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-[#19F124] cursor-pointer"
                            disabled={disabled}
                            checked={checked}
                            onChange={() => toggleSelect(p.id_perfil)}
                        />
                        <span className="text-lg">{p.nombre}</span>
                        {disabled && (
                            <span className="ml-auto text-xs bg-[#24303C] px-2 py-0.5 rounded-md">
                            Ya asignado
                            </span>
                        )}
                        </li>
                    );
                    })}
                </ul>
                </div>

                <div className="flex justify-end gap-3 mt-5">
                <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border-2 border-[#2B3642] hover:bg-[#1A2430] transition cursor-pointer"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleAssignarMultiples}
                    disabled={selectedProfiles.length === 0}
                    className="px-4 py-2 rounded-xl font-bold bg-[#19F124] hover:bg-[#2af935] transition text-[#101922] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    Asignar seleccionados
                </button>
                </div>
            </div>
            </div>
        )}

        {showDocs && (
            <PersonaDocumentos
            idPersona={usuario.id_persona}
            onClose={() => setShowDocs(false)}
            />
        )}
        {showDomicilios && (
            <PersonaDomicilios
            idPersona={usuario.id_persona}
            onClose={() => setShowDomicilios(false)}
            />
        )}
        {showTitulos && (
            <PersonaTitulos
            idPersona={usuario.id_persona}
            onClose={() => setShowTitulos(false)}
            />
        )}
        </div>
    );
}
