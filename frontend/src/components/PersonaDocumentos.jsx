import { useCallback, useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FiTrash2 } from "react-icons/fi";
import { personaDocService, estadoVerificacionService, tipoDocService, archivoService } from "../services/api";
import PdfPreviewModal from "./PdfPreviewModal";

const FALLBACK_TIPOS = [
    {id_tipo_doc: 1, codigo:"DNI", nombre: "Documento Nacional de Identidad"},
    {id_tipo_doc: 2, codigo:"CUIL", nombre: "Código único de identificación"},
    {id_tipo_doc: 3, codigo:"DOM", nombre: "Constancia de domicilio"},
    {id_tipo_doc: 4, codigo:"TIT", nombre: "Título habilitante"},
    {id_tipo_doc: 5, codigo:"CV", nombre: "Curriculum Vitae"},
    {id_tipo_doc: 6, codigo:"CON_SER", nombre: "Constancia de servicio"},
]

const FALLBACK_ESTADOS = [
    { id_estado: 1, codigo: "PENDIENTE", nombre: "Pendiente de Revisión" },
    { id_estado: 2, codigo: "APROBADO", nombre: "Aprobado" },
    { id_estado: 3, codigo: "RECHAZADO", nombre: "Rechazado" },
    { id_estado: 4, codigo: "OBSERVADO", nombre: "Observado" },
]

export default function PersonaDocumentos({idPersona, onClose, asModal = true}) {
    const [docs, setDocs] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verificacion, setVerificacion] = useState({ open: false, doc:null, estado: "", obs:"" });
    
    const [tipos, setTipos] = useState(FALLBACK_TIPOS);
    const [estados, setEstados] = useState(FALLBACK_ESTADOS);

    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);

    const [id_tipo_doc, setIdTipoDoc] = useState("");
    const [id_estado, setIdEstado] = useState("");
    const [vigente, setVigente] = useState(true);
    const [file, setFile] = useState(null);
    const [archivoSubiendo, setArchivoSubiendo] = useState(false);
    const [archivoInfo, setArchivoInfo] = useState(null);

    const [preview, setPreview] = useState({open: false, url: '', title: ''});

    const openPreview = async (doc) => {
        if(!doc.id_archivo) return;
        try {
            const { data } = await archivoService.getSignedUrl(doc.id_archivo);
            const tipo = tipoById(doc.id_tipo_doc);
            setPreview({
                open: true,
                url: data.url,
                title: tipo.nombre || 'Documento'
            });
        } catch (error) {
            console.error('No se pudo abrir el documento:', error);
            alert('No se pudo abrir el documento');
        }
    }

    const closePreview = () => setPreview({open:false, url:'', title:''});

    const fetchDocs = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await personaDocService.listarDocumentos({ id_persona: idPersona });
            setDocs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("No se pudieron cargar documentos:", error);
            setDocs([]);
        } finally {
            setLoading(false);
        }
    }, [idPersona]);

    useEffect(() => {
        const loadCatalogos = async () => {
            try {
                const [estRes, tiposRes] = await Promise.allSettled([
                    estadoVerificacionService.getAll(),
                    tipoDocService.getAllDocTypes(),
                ]);

                if (estRes.status === "fulfilled" && Array.isArray(estRes.value.data)) {
                    setEstados(estRes.value.data);
                }
                if(tiposRes.status === "fulfilled" && Array.isArray(tiposRes.value.data)) {
                    setTipos(tiposRes.value.data);
                }
            } catch (e) {
                
            }
        };
        loadCatalogos();
    }, []);

    useEffect(() => {
        fetchDocs();
    }, [fetchDocs]);

    const docsOrdenados = useMemo(
        () => [...docs].sort((a,b) => new Date(b.creado_en || 0) - new Date(a.creado_en || 0)),
        [docs]
    );

    const handleUploadArchivo = async () => {
        if(!file) return null;
        try {
            setArchivoSubiendo(true);
            const { data } = await archivoService.uploadForPersona(idPersona, file);
            setArchivoInfo(data.archivo);
            return data.archivo?.id_archivo ?? null;
        } catch (e) {
            console.error("Error subiendo archivo:", e);
            alert("No se pudo subir el archivo");
            return null;
        } finally{
            setArchivoSubiendo(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!id_tipo_doc) return alert("Elegí un tipo de documento");
        if (!id_estado) return alert("Elegí un estado");

        let id_archivo = null;
        if(file){
            id_archivo = await handleUploadArchivo();
            if(file && !id_archivo) return;
        }

        const payload = {
            id_persona: idPersona,
            id_tipo_doc: Number(id_tipo_doc),
            id_archivo: id_archivo,
            id_estado_verificacion: Number(id_estado),
            vigente: Boolean(vigente),
        };

        try {
            setSaving(true);
            const { data: nuevo } = await personaDocService.createDoc(payload);
            await fetchDocs();
            setIdTipoDoc("");
            setIdEstado("");
            setVigente(true);
            setFile(null);
            setArchivoInfo(null);
            setShowNew(false);
        } catch (err) {
            console.error("Error al crear documento:", err);
            alert("No se pudo crear el documento");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (doc) => {
        const tipo = tipoById(doc.id_tipo_doc);
        const nombreTipo = tipo?.nombre || "Documento";
        const ok = confirm(`¿Eliminar "${nombreTipo}"? Esta acción no se puede deshacer`);
        if (!ok) return;

        try {
            setDeletingId(doc.id_persona_doc);
            await personaDocService.deleteDoc(idPersona, doc.id_persona_doc);
            setDocs(prev => prev.filter(d => d.id_persona_doc !== doc.id_persona_doc));
        } catch (error) {
            console.error("No se pudo eliminar el documento:", error?.response?.data || error.message);
            const message = error?.response?.data?.message || error?.response?.data?.detalle || "No se pudo eliminar el documento";
            alert(message);
        } finally {
            setDeletingId(null);
        }
    }

    const tipoById = (id) => tipos.find(t => Number(t.id_tipo_doc) === Number(id));
    const estadoById = (id) => estados.find(e => Number(e.id_estado) === Number(id));
    const requiereObs = (id_estado) => {
        const code = String(estadoById(id_estado)?.codigo || "").toUpperCase();
        return code === "RECHAZADO" || code === "OBSERVADO";
    }

    const openCambiarEstado = (doc) => {
        const current = doc.id_estado ?? doc.id_estado_verificacion ?? "";
        setVerificacion({ open: true, doc, estado: String(current), obs: "" });
    };
    const closeCambiarEstado = () => setVerificacion({ open: false, doc: null, estado: "", obs: "" });

    const submitCambiarEstado = async (e) => {
        e.preventDefault();
        if(!verificacion.doc) return;
        const id_estado_verificacion = Number(verificacion.estado);

        if(requiereObs(id_estado_verificacion) && !verificacion.obs.trim()) {
            alert("Debés indicar una observación para Rechazado/Observado");
            return;
        }

        try {
            const { data: actualizado } = await personaDocService.cambiarEstado(
                verificacion.doc.id_persona_doc,
                { id_estado_verificacion, observacion: verificacion.obs.trim() || null }
            );
            await fetchDocs();
            closeCambiarEstado();
        } catch (error) {
            console.error("Error al cambiar estado del documento:", err);
            alert("No se pudo cambiar el estado");
        }
    }

    const renderPanel = () => (
        <div className="w-full max-w-none bg-[#101922] rounded-2xl p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-semibold text-[#19F124]">
                Documentos Personales
                </h3>
                {onClose && asModal && (
                <button
                    onClick={onClose}
                    className="cursor-pointer p-1 rounded-lg hover:bg-[#1A2430]"
                    aria-label="Cerrar"
                >
                    <IoClose size={24} />
                </button>
                )}
            </div>

            <div className="flex items-center justify-between mb-3">
                <p className="text-lg opacity-80">
                Persona: <span className="font-semibold">{idPersona}</span>
                </p>
                <button
                onClick={() => setShowNew(true)}
                className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-[#19F124] hover:bg-[#2af935] text-[#101922] transition"
                >
                Agregar documento +
                </button>
            </div>

            <div className="max-h-[50vh] overflow-auto pr-1">
                {loading ? (
                <p className="opacity-70">Cargando...</p>
                ) : docsOrdenados.length === 0 ? (
                <p className="opacity-70">Sin documentos</p>
                ) : (
                <ul className="space-y-2">
                    {docsOrdenados.map((d) => {
                    const t = d.tipo_nombre
                        ? { nombre: d.tipo_nombre, obligatorio: undefined }
                        : tipoById(d.id_tipo_doc);
                    const e =
                        d.estado_nombre
                        ? { nombre: d.estado_nombre, codigo: d.estado_codigo }
                        : estadoById(d.id_estado) ||
                            estadoById(d.id_estado_verificacion);
                    return (
                        <li
                        key={
                            d.id_persona_doc ??
                            `${d.id_persona}-${d.id_tipo_doc}-${d.creado_en}`
                        }
                        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#0D1520]"
                        >
                        <div className="flex-1">
                            <div className="font-semibold">
                            {t?.nombre ?? `Tipo ${d.id_tipo_doc}`}
                            {t?.obligatorio && (
                                <span className="ml-2 text-[10px] uppercase tracking-wide bg-[#24303C] px-2 py-0.5 rounded-md">
                                Obligatorio
                                </span>
                            )}
                            </div>
                            <div className="text-sm opacity-80">
                            Estado:{" "}
                            <span className="opacity-100">
                                {e?.nombre ?? e?.codigo ?? d.id_estado}
                            </span>
                            {d.vigente === false && (
                                <span className="ml-2 text-xs bg-[#24303C] px-2 py-0.5 rounded-md">
                                No vigente
                                </span>
                            )}
                            </div>
                            {d.id_archivo && (
                            <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                                <span className="opacity-60">
                                Archivo ID:{" "}
                                {d.archivo_nombre ?? `ID ${d.id_archivo}`}
                                </span>
                                <button
                                type="button"
                                onClick={() => openPreview(d)}
                                className="bg-[#0D1520] border-[#19F124] border-2 font-bold cursor-pointer p-2 rounded-xl text-sm  text-[#19F124] hover:bg-[#19F124] hover:text-[#0D1520]"
                                title="Ver Documento"
                                >
                                Ver Documento
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openCambiarEstado(d)}
                                    className="cursor-pointer px-3 py-1 rounded-lg border border-[#19F124] text-[#19F124] hover:bg-[#19F124] hover:text-[#0D1520]"
                                    title="Cambiar estado"
                                >
                                    Cambiar estado
                                </button>
                            </div>
                            )}
                        </div>
                        <div className="text-xs opacity-60 whitespace-nowrap">
                            {d.creado_en?.split("T")[0] ?? ""}
                        </div>

                        <button
                            type="button"
                            onClick={() => handleDelete(d)}
                            disabled= {deletingId === d.id_persona_doc}
                            className="bg-[#101922] p-3 text-red-500 flex items-center rounded-[1.1rem] font-bold hover:bg-[#1a2735] hover:cursor-pointer transition"
                            title="Eliminar documento"
                            aria-label="Eliminar documento"
                        >
                            <FiTrash2 size={22}/>
                        </button>
                        </li>
                    );
                    })}
                </ul>
                )}
            </div>

            {preview.open && (
                <PdfPreviewModal
                url={preview.url}
                title={preview.title}
                onClose={closePreview}
                />
            )}

            {verificacion.open && (
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
                <div className="fixed inset-0 z-[70] flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black/60"
                    onClick={() => setShowNew(false)}
                />
                <div
                    className="relative z-10 w-[92%] max-w-lg bg-[#101922] rounded-2xl p-6 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-start justify-between mb-4">
                    <h4 className="text-xl font-semibold text-[#19F124]">
                        Nuevo documento
                    </h4>
                    <button
                        onClick={() => setShowNew(false)}
                        className="p-1 rounded-lg hover:bg-[#1A2430]"
                        aria-label="Cerrar"
                    >
                        <IoClose size={22} />
                    </button>
                    </div>

                    <form className="space-y-4" onSubmit={handleCreate}>
                        <div>
                            <label className="block mb-1 text-sm opacity-80">
                            Tipo de documento
                            </label>
                            <select
                            value={id_tipo_doc}
                            onChange={(e) => setIdTipoDoc(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            required
                            >
                            <option value="">Seleccionar...</option>
                            {tipos.map((t) => (
                                <option key={t.id_tipo_doc} value={t.id_tipo_doc}>
                                {t.nombre} {t.obligatorio ? "• (Obligatorio)" : ""}
                                </option>
                            ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm opacity-80">
                            Estado de verificación
                            </label>
                            <select
                            value={id_estado}
                            onChange={(e) => setIdEstado(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            required
                            >
                            <option value="">Seleccionar...</option>
                            {estados.map((e) => (
                                <option key={e.id_estado} value={e.id_estado}>
                                {e.nombre}
                                </option>
                            ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm opacity-80">
                            Archivo (opcional)
                            </label>
                            <input
                            type="file"
                            onChange={(ev) => setFile(ev.target.files?.[0] ?? null)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl hover:bg-[#354453] transition cursor-pointer"
                            accept="application/pdf,image/*"
                            />
                            {archivoInfo && (
                            <p className="mt-1 text-xs opacity-70">
                                Subido_ {archivoInfo.nombre_original} • ID{" "}
                                {archivoInfo.id_archivo}
                            </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                            id="vigente"
                            type="checkbox"
                            checked={vigente}
                            onChange={(e) => setVigente(e.target.checked)}
                            className="w-5 h-5 accent-[#19F124] cursor-pointer"
                            />
                            <label htmlFor="vigente" className="select-none">
                            Vigente
                            </label>
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
                            disabled={saving || archivoSubiendo}
                            className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-[#19F124] text-[#101922] disabled:opacity-50"
                            >
                            {archivoSubiendo
                                ? "Subiendo archivo..."
                                : saving
                                ? "Guardando..."
                                : "Guardar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </div>
    );

    if (asModal) {
        return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
            />
            <div
            className="relative z-10 w-[95%] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
            >
            {renderPanel()}
            </div>
        </div>
        );
    }

    return renderPanel();
}