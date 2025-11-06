import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PersonaDocumentos from "../../components/PersonaDocumentos";
import PersonaDomicilios from "../../components/PersonaDomicilios";
import PersonaTitulos from "../../components/PersonaTitulos";
import SegmentedTabs from "../../components/SegmentedTabs";
import { userService, profileService } from "../../services/api";
import { MdNavigateBefore } from "react-icons/md";
import { FiTrash2, FiMail, FiPower, FiLayers, FiHash, FiCalendar, FiCreditCard } from "react-icons/fi";
import { BsPersonVcard } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function UsuarioDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user:me, updateUserPerfiles } = useAuth();
    const queryClient = useQueryClient();

    const [showModal, setShowModal] = useState(false);
    const [selectedProfiles, setSelectedProfiles] = useState([]);
    const TABS = { INFO: "info", DOCS: "docs", DOM: "dom", TIT: "tit" };
    const [tab, setTab] = useState(TABS.INFO);

    const { data: usuario, isLoading: isLoadingUsuario } = useQuery({
        queryKey: ['usuario', id], 
        queryFn: () => userService.getUsuarioById(id).then(res => res.data),
    });

    const { data: todosLosPerfiles = [] } = useQuery({
        queryKey: ['perfiles'],
        queryFn: () => profileService.getProfiles().then(res => res.data),
        staleTime: 1000 * 60 * 60,
    });

    const { data: perfilesVigentes = [] } = useQuery({
        queryKey: ['perfiles', 'asignados', usuario?.id_persona],
        queryFn: () => profileService.getPersonaProfile(usuario.id_persona).then(res => res.data),
        enabled: !!usuario?.id_persona, 
    });

    useEffect(() => {
        if (me?.id_persona === usuario?.id_persona && perfilesVigentes) {
            if (me.perfiles !== perfilesVigentes) {
                updateUserPerfiles(perfilesVigentes);
            }
        }
    }, [
        perfilesVigentes,        
        me?.id_persona,          
        usuario?.id_persona,     
        updateUserPerfiles     
    ]);

    const assignProfilesMutation = useMutation({
        mutationFn: (perfilIds) => 
            Promise.all(
                perfilIds.map((pid) => profileService.assignProfile(usuario.id_persona, pid))
            ),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['perfiles', 'asignados', usuario.id_persona] });
            alert("Perfiles asignados correctamente");
            setShowModal(false);
            setSelectedProfiles([]);
        },
        onError: (error) => {
            console.error("Error al asignar perfiles:", error);
            alert(error?.response?.data?.detalle || error?.response?.data?.message || "Error al asignar perfiles");
        }
    });

    const deleteProfileMutation = useMutation({
        mutationFn: (id_perfil) => 
            profileService.deleteProfile(usuario.id_persona, id_perfil),
        onSuccess: (data, id_perfil_eliminado) => {
            alert("Perfil desasignado correctamente");
            queryClient.invalidateQueries({ queryKey: ['perfiles', 'asignados', usuario.id_persona] });
        },
        onError: (error) => {
            console.error("Error al desasignar perfil", error);
            alert("No se pudo desasignar el perfil");
        }
    });

    const handleEliminarPerfil = async (id_perfil, nombre) => {
        const ok = confirm(`¿Esta seguro que quiere quitar el perfil "${nombre}" de este usuario?`);
        if (ok) {
            deleteProfileMutation.mutate(id_perfil);
        }
    };

    const handleAssignarMultiples = () => {
        if (!usuario || selectedProfiles.length === 0) return;
            assignProfilesMutation.mutate(selectedProfiles);
    };

    const assignedIds = new Set(perfilesVigentes.map((p) => p.id_perfil));

    const toggleSelect = (perfilId) => {
        setSelectedProfiles((prev) =>
        prev.includes(perfilId)
            ? prev.filter((id) => id !== perfilId)
            : [...prev, perfilId]
        );
    };

    if (isLoadingUsuario) {
        return <div className="p-6 text-2xl text-white">Cargando información...</div>
    }

    if (!usuario)
        return <div className="text-2xl text-white">Error: Usuario no encontrado</div>;

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
                <SegmentedTabs value={tab} onChange={setTab} tabs={TABS}/>
            </div>
        </div>

        <div className="px-10 mt-4">
            <div className="flex flex-wrap gap-3">
            <h1 className="text-4xl font-medium">
                    Informacion de{" "}
                    <span className="text-[#19F124] font-black">
                        {usuario.persona?.nombre} {usuario.persona?.apellido}
                    </span>
                </h1>
            </div>
        </div>

        {tab === TABS.INFO && (
            <div className="grid grid-cols-1 gap-6 pl-10 pr-10 mt-5 lg:grid-cols-2">
            <div className="space-y-5">
                <section className="bg-[#101922] rounded-2xl p-5 mb-5 text-2xl">
                <h2 className="pb-2 pl-2 mb-4 text-3xl font-semibold border-b-2 border-[#19f12477] text-[#19F124]">
                    Datos de usuario
                </h2>

                <section className="grid grid-cols-2 pl-2 lg:grid-cols-2 gap-y-5 gap-x-25">
                    <div className="flex flex-row items-center gap-3">
                        <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                            <FiMail className="text-[#4FC3F7]" size={30} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm opacity-70">Email</span>
                            <span className="text-bg">{usuario.email}</span>
                        </div>
                        </div>

                        <div className="flex flex-row items-center gap-3">
                        <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                            <FiPower
                            size={30}
                            className={usuario.activo ? "text-[#19F124]" : "text-[#FF5252]"}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm opacity-70">Estado</span>
                            <span
                            className={
                                usuario.activo
                                ? "text-[#19F124] bg-[#173519] rounded-2xl px-4"
                                : "text-[#FF5252]"
                            }
                            >
                            {usuario.activo ? "Activo" : "Inactivo"}
                            </span>
                        </div>
                        </div>

                        <div className="flex flex-row items-center gap-3">
                            <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                                <FiLayers className="text-[#FFD54F]" size={30} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm opacity-70">Rol/es:</span>
                                {usuario.roles?.length > 0
                                ? usuario.roles.map((r) => r.nombre).join(", ")
                                : "Sin rol asignado"}
                            </div>
                        </div>
                </section>
                </section>

                <section className="bg-[#101922] rounded-2xl p-5 text-2xl">
                <h2 className="pb-4 pl-4 mb-4 text-3xl font-semibold border-b-2 border-[#19f12477] text-[#19F124]">
                    Datos personales
                </h2>

                {usuario.persona && (
                    <section className="grid grid-cols-2 pl-2 lg:grid-cols-2 gap-y-5 gap-x-25">

                    <div className="flex flex-row items-center gap-3">
                        <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                            <FiHash className="text-[#64B5F6]" size={30} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm opacity-70">Nombre</span>
                            <span>{usuario.persona.nombre || "No especificado"}</span>
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-3">
                        <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                            <FiHash className="text-[#BA68C8]" size={30} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm opacity-70">Apellido</span>
                            <span>{usuario.persona.apellido || "No especificado"}</span>
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-3">
                        <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                            <FiCalendar className="text-[#FFB74D]" size={30} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm opacity-70">Fecha de Nacimiento</span>
                            <span>
                                {usuario.persona.fecha_nacimiento
                                ? new Date(usuario.persona.fecha_nacimiento).toLocaleDateString()
                                : "No especificado"}
                            </span>
                        </div>
                    </div>

                    {usuario.identificaciones?.[0]?.dni && (
                        <div className="flex flex-row items-center gap-3">
                            <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                                <FiCreditCard className="text-[#90CAF9]" size={30} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm opacity-70">DNI</span>
                                <span>{usuario.identificaciones[0].dni}</span>
                            </div>
                        </div>
                    )}

                    {usuario.identificaciones?.[0]?.cuil && (
                        <div className="flex flex-row items-center gap-3">
                            <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                                <BsPersonVcard className="text-[#81C784]" size={30} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm opacity-70">CUIL</span>
                                <span>{usuario.identificaciones[0].cuil}</span>
                            </div>
                        </div>
                    )}
                    </section>
                )}
                </section>
            </div>

            <div className="space-y-5">
                <section className="relative bg-[#101922] rounded-2xl p-5 text-2xl">
                <h2 className="pb-4 pl-4 mb-4 text-3xl font-semibold border-b-2 border-[#19f12477] text-[#19F124]">
                    Perfiles del usuario
                </h2>

                <div className="space-y-2 text-2xl">
                    {perfilesVigentes.length > 0 ? (
                    perfilesVigentes.map((p) => (
                        <div
                        key={p.id_perfil}
                        className="flex items-center gap-3 mb-4 font-semibold bg-[#10242a] p-4 border border-[#19f12423] rounded-xl"
                        >
                        <span><span className="text-[#19F124] mr-2">•</span> {p.nombre}</span>
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
        </div>
    );
}
