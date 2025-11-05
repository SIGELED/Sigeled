import { useEffect, useState, useMemo, useCallback } from "react";
import { tituloService, archivoService, estadoVerificacionService } from "../services/api";
import { IoClose } from "react-icons/io5";
import {  FiTrash2, FiCalendar, FiBookOpen, FiCheckCircle, FiEye, FiRefreshCcw} from "react-icons/fi";
import { LuBuilding } from "react-icons/lu";
import { IoSchoolOutline } from "react-icons/io5";
import PdfPreviewModal from "./PdfPreviewModal";

const FALLBACK_ESTADOS = [
    { id_estado: 1, codigo: "PENDIENTE", nombre: "Pendiente de Revisión" },
    { id_estado: 2, codigo: "APROBADO", nombre: "Aprobado" },
    { id_estado: 3, codigo: "RECHAZADO", nombre: "Rechazado" },
    { id_estado: 4, codigo: "OBSERVADO", nombre: "Observado" },
]

export default function PersonaTitulos({ idPersona, onClose, asModal = true, showPersonaId = true, canDelete = true, canChangeState = true, onRequestDelete }) {
    const [estados, setEstados] = useState(FALLBACK_ESTADOS);
    const [verificacion, setVerificacion] = useState({ open:false, titulo: null , estado:"", obs:""})

    const [titulos, setTitulos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [deletingId, setDeletingId] = useState(null)

    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);

    const [tipos, setTipos] = useState([]);

    const [id_tipo_titulo, setIdTipoTitulo] = useState("");
    const [nombre_titulo, setNombreTitulo] = useState("");
    const [institucion, setInstitucion] = useState("");
    const [fecha_emision, setFechaEmision] = useState("");
    const [matricula_prof, setMatriculaProf] = useState("");
    const [archivo, setArchivo] = useState(null);

    const [preview, setPreview] = useState({ open: false, url: "", title: "" });
    const tipoById = (id) =>
        tipos.find((t) => Number(t.id_tipo_titulo) === Number(id));

    const estadoById = (id) => estados.find(e => Number(e.id_estado) === Number(id));
    const requiereObs = (id_estado) => {
        const code = String(estadoById(id_estado)?.codigo || "").toUpperCase();
        return code === "RECHAZADO" || code === "OBSERVADO";
    }

    const openCambiarEstado = (t) => {
        const current = t.id_estado_verificacion ?? "";
        setVerificacion({open:true, titulo:t, estado:String(current), obs:""});
    };
    const closeCambiarEstado = () => setVerificacion({ open: false, titulo: null, estado: "", obs: "" });

    const submitCambiarEstado = async (e) => {
            e.preventDefault();
            if(!verificacion.titulo) return;
            const id_estado_verificacion = Number(verificacion.estado);
    
            if(requiereObs(id_estado_verificacion) && !verificacion.obs.trim()) {
                alert("Debés indicar una observación para Rechazado/Observado");
                return;
            }
    
            try {
                const { data: actualizado } = await tituloService.cambiarEstado(
                    verificacion.titulo.id_titulo,
                    { id_estado_verificacion, observacion: verificacion.obs.trim() || null }
                );
                setTitulos((prev) => 
                prev.map((x) => (x.id_titulo === actualizado.id_titulo ? actualizado : x)));
                closeCambiarEstado();
            } catch (error) {
                console.error("Error al cambiar estado del título:", error);
                alert("No se pudo cambiar el estado");
            }
        }

    const openPreview = async (doc) => {
        if (!doc.id_archivo) return;
        try {
        const { data } = await archivoService.getSignedUrl(doc.id_archivo);
        setPreview({
            open: true,
            url: data.url ?? data.signedUrl,
            title: doc.archivo_nombre || data.nombre_original || "Documento",
        });
        } catch (error) {
        console.error(
            "No se pudo abrir el documento:",
            error?.response?.data || error.message
        );
        alert("No se pudo abrir el documento");
        }
    };

    const closePreview = () => setPreview({ open: false, url: "", title: "" });

    const fetchTitulos = useCallback(async () => {
        setLoading(true);
        try {
        const [tRes, tiposRes] = await Promise.all([
            tituloService.findTituloByPersona(idPersona),
            tituloService.getTiposTiulos(),
        ]);
        setTitulos(Array.isArray(tRes.data) ? tRes.data : []);
        setTipos(Array.isArray(tiposRes.data) ? tiposRes.data : []);
        } catch (error) {
        console.error("Error cargando títulos o tipos:", error);
        setTitulos([]);
        setTipos([]);
        } finally {
        setLoading(false);
        }
    }, [idPersona]);

    useEffect(() => {
        if (idPersona) fetchTitulos();
    }, [fetchTitulos, idPersona]);

    useEffect(() => {
        if(!canChangeState) return;
        (async () => {
            try {
                const { data } = await estadoVerificacionService.getAll();
                if (Array.isArray(data) && data.length) setEstados(data);
            } catch {}
        })();
    }, [canChangeState]);

    const titulosOrdenados = useMemo(
        () =>
        [...titulos].sort((a, b) =>
            String(b.id_titulo).localeCompare(String(a.id_titulo))
        ),
        [titulos]
    );

    const resetForm = () => {
        setIdTipoTitulo("");
        setNombreTitulo("");
        setInstitucion("");
        setFechaEmision("");
        setMatriculaProf("");
        setArchivo(null);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!id_tipo_titulo || !nombre_titulo) {
        return alert("Completá tipo de título y nombre de titulo");
        }
        try {
        setSaving(true);

        let id_archivo = null;
        if (archivo) {
            const up = await archivoService.uploadForPersona(idPersona, archivo);
            id_archivo =
            up?.data?.id_archivo ??
            up?.data?.archivo?.id_archivo ??
            up?.data?.result?.id_archivo ??
            null;
        }

        const body = {
            id_persona: idPersona,
            id_tipo_titulo: Number(id_tipo_titulo),
            nombre_titulo,
            institucion: institucion || null,
            fecha_emision: fecha_emision || null,
            matricula_prof: matricula_prof || null,
            id_archivo,
            id_estado_verificacion: 1,
        };

        const { data: nuevoTitulo } = await tituloService.createTitulo(body);

        setTitulos((prev) => [nuevoTitulo, ...prev]);

        await fetchTitulos();
        resetForm();
        setShowNew(false);
        } catch (error) {
        console.error("Error al crear título:", error);
        alert("No se pudo crear el título");
        } finally {
        setSaving(false);
        }
    };

    const handleDelete = async (t) => {
        const ok = confirm(`¿Eliminar el título "${t.nombre_titulo}"? Esta acción no se puede deshacer`);
        if(!ok) return;
        try {
            setDeletingId(t.id_titulo);
            await tituloService.deleteTitulo(idPersona, t.id_titulo);
            setTitulos(prev => prev.filter(x => x.id_titulo !== t.id_titulo));
        } catch (error) {
            console.error("No se pudo eliminar el título:", error?.response?.data || error.message);
            const message = error?.response?.data?.message || error?.response?.data?.detalle || "No se pudo eliminar el título";
            alert(message);
        } finally {
            setDeletingId(null);
        }
    }

    const renderPanel = () => (
        <div className="w-full max-w-none rounded-2xl bg-[#101922] p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-semibold text-[#19F124]">Títulos</h3>
            {onClose && asModal && (
            <button className="p-1 rounded-lg hover:bg-[#1A2430] cursor-pointer" onClick={onClose}>
                <IoClose size={22} />
            </button>
            )}
        </div>

        <div className="flex items-center justify-between mb-3">
            {showPersonaId && (
                <p className="text-lg opacity-80">
                    Persona: <span className="font-semibold">{idPersona}</span>
                </p>
            )}
            <button
            onClick={() => setShowNew(true)}
            className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-[#19F124] hover:bg-[#2af935] text-[#101922] transition"
            >
            Agregar título +
            </button>
        </div>

        <ul className="space-y-3">
            {titulosOrdenados.map((t) => (
                <li
                key={`t-${t.id_titulo ?? t.nombre_titulo}`}
                className="flex gap-4 px-5 py-4 rounded-2xl bg-[#0D1520] shadow-md hover:shadow-lg transition"
                >
                <div className=" w-20 h-20 rounded-xl bg-[#19F124]/10 flex items-center justify-center">
                    <IoSchoolOutline size={45} className="text-[#19F124]"/>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="mb-1 text-lg font-semibold text-white">
                    {t.nombre_titulo}
                    </div>

                    <div className="flex items-center mb-1 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                        <LuBuilding size={20}/>
                        <span className="opacity-90">{t.institucion || "—"}</span>
                    </div>
                    </div>

                    <div className="flex flex-wrap mb-2 text-sm text-gray-400 gap-x-6">
                    <div className="flex items-center font-normal gap-1 bg-[#39793c] text-white p-1 rounded-xl pl-2 pr-2  text-lg">
                        <span>{t.tipo_titulo || "Sin tipo"}</span>
                    </div>
                    {t.fecha_emision && (
                        <div className="flex items-center gap-1">
                        <span className="text-[#19F124]/80"><FiCalendar size={20}/></span>
                        <span>{new Date(t.fecha_emision).toLocaleDateString()}</span>
                        </div>
                    )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                    {t.id_archivo && (
                        <button
                        type="button"
                        onClick={() => openPreview(t)}
                        className="flex w-30 items-center cursor-pointer justify-center gap-2 bg-[#0f302d] border border-[#095f44] hover:bg-[#104e3a] text-[#19F124] rounded-lg py-1 text-sm font-semibold transition"
                        title="Ver Título"
                        >
                        <FiEye size={16} /> Ver
                        </button>
                    )}
                    {canChangeState && (
                        <button
                        type="button"
                        onClick={() => openCambiarEstado(t)}
                        className="flex w-40 items-center cursor-pointer justify-center gap-2 bg-[#0f302d] border border-[#095f44] hover:bg-[#104e3a] text-[#19F124] rounded-lg py-1 text-sm font-semibold transition"
                        title="Cambiar estado"
                        >
                            <FiRefreshCcw size={16} /> Cambiar estado
                        </button>
                    )}
                    {canDelete ? (
                        <button
                        type="button"
                        onClick={() => handleDelete(t)}
                        disabled={deletingId === t.id_titulo}
                        className="flex items-center cursor-pointer justify-center bg-red-500/5 hover:bg-red-500/20 border border-[#ff2c2c] text-[#ff2c2c] rounded-lg p-2 transition"
                        title="Eliminar título"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onRequestDelete ? onRequestDelete(t) : alert("Para eliminar, enviá una solicitud a RRHH.")}
                            className="flex items-center cursor-pointer justify-center border border-[#19F124]/40 text-[#19F124] rounded-lg px-3 py-1 hover:bg-[#0f302d] transition"
                            title="Solicitar eliminación"
                        >
                            Solicitar eliminación
                        </button>
                        )}
                    </div>
                </div>
                </li>
            ))}
            </ul>




        {preview.open && (
            <PdfPreviewModal
            url={preview.url}
            title={preview.title}
            onClose={closePreview}
            />
        )}

        {canChangeState && verificacion.open && (
                <div className="fixed inset-0 z-[80]">
                    <div className="absolute inset-0 bg-black/60" onClick={closeCambiarEstado} />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div
                        className="w-[92%] max-w-md bg-[#101922] rounded-2xl p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <h4 className="text-xl font-semibold text-[#19F124]">Cambiar estado</h4>
                            <button onClick={closeCambiarEstado} className="p-1 rounded-lg hover:bg-[#1A2430]" aria-label="Cerrar">
                                <IoClose size={22} />
                            </button>
                        </div>

                            <form className="space-y-4" onSubmit={submitCambiarEstado}>
                                <div>
                                    <label className="block mb-1 text-sm opacity-80">Estado</label>
                                    <select 
                                        value={verificacion.estado} 
                                        onChange={(e) => setVerificacion(v => ({...v, estado: e.target.value}))}
                                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        {estados.map((e) => (
                                            <option key={e.id_estado} value={e.id_estado}>{e.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm opacity-80">
                                        Observación {requiereObs(Number(verificacion.estado)) ? "(obligatoria)" : "(opcional)"}
                                    </label>
                                    <textarea 
                                        value={verificacion.obs}
                                        onChange={(e) => setVerificacion(v => ({ ...v, obs: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                        rows={3}
                                        placeholder="Motivo, comentarios, etc."
                                        required={requiereObs(Number(verificacion.estado))}
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                        <button type="button" onClick={closeCambiarEstado} className="cursor-pointer px-4 py-2 rounded-xl border-2 border-[#2B3642] hover:bg-[#1A2430]">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-[#19F124] text-[#101922]">
                                            Guardar
                                        </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        {showNew && (
            <div className="fixed inset-0 z-[80]">
            <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setShowNew(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                className="w-full max-w-xl bg-[#101922] rounded-2xl p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="flex items-start justify-between mb-4">
                    <h4 className="text-xl font-semibold text-[#19F124]">
                    Nuevo título
                    </h4>
                    <button
                    onClick={() => setShowNew(false)}
                    className="p-1 rounded-lg hover:bg-[#1A2430]"
                    >
                    <IoClose size={22} />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleCreate}>
                    <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block mb-1 text-sm opacity-80">
                        Tipo de título *
                        </label>
                        <select
                        value={id_tipo_titulo}
                        onChange={(e) => setIdTipoTitulo(e.target.value)}
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        required
                        >
                        <option value="">Seleccionar...</option>
                        {tipos.map((t) => (
                            <option
                            key={`tip-${t.id_tipo_titulo ?? t.codigo}`}
                            value={t.id_tipo_titulo}
                            >
                            {t.nombre}
                            </option>
                        ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm opacity-80">
                        Fecha de emisión
                        </label>
                        <input
                        type="date"
                        value={fecha_emision}
                        onChange={(e) => setFechaEmision(e.target.value)}
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block mb-1 text-sm opacity-80">
                        Nombre del título *
                        </label>
                        <input
                        value={nombre_titulo}
                        onChange={(e) => setNombreTitulo(e.target.value)}
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        required
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block mb-1 text-sm opacity-80">
                        Institución
                        </label>
                        <input
                        value={institucion}
                        onChange={(e) => setInstitucion(e.target.value)}
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm opacity-80">
                        Matrícula profesional
                        </label>
                        <input
                        value={matricula_prof}
                        onChange={(e) => setMatriculaProf(e.target.value)}
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm opacity-80">
                        Archivo
                        </label>
                        <input
                        type="file"
                        onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        />
                    </div>
                    </div>

                    <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setShowNew(false)}
                        className="cursor-pointer px-4 py-2 rounded-xl border-2 border-[#2B3642] hover:bg-[#1A2430] transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-[#19F124] text-[#101922] disabled:opacity-50"
                    >
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        )}
        </div>
    );

    if (asModal) {
        return (
        <div className="fixed inset-0 z-[70]">
            <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
            />
            <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="w-full max-w-3xl">
                {renderPanel()}
            </div>
            </div>
        </div>
        );
    }

    return renderPanel();
}
