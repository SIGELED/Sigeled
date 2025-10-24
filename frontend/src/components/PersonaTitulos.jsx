import { useEffect, useState, useMemo } from "react";
import { tituloService, archivoService } from "../services/api";
import { IoClose } from "react-icons/io5";

export default function PersonaTitulos({idPersona, onClose}){
    const [titulos, setTitulos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);

    const [tipos, setTipos] = useState([]);

    const [id_tipo_titulo, setIdTipoTitulo] = useState("");
    const [nombre_titulo, setNombreTitulo] = useState("");
    const [institucion, setInstitucion] = useState("");
    const [fecha_emision, setFechaEmision] = useState("");
    const [matricula_prof, setMatriculaProf] = useState("");
    const [archivo, setArchivo] = useState(null);

    useEffect(() => {
        const loadTitulos = async () => {
            setLoading(true);
            try {
                const[tRes, tiposRes] = await Promise.all([
                    tituloService.findTituloByPersona(idPersona),
                    tituloService.getTiposTiulos(),
                ]);
                setTitulos(Array.isArray(tRes.data) ? tRes.data: []),
                setTipos(Array.isArray(tiposRes.data) ? tiposRes.data: []);
            } catch (error) {
                console.error("Error cargando títulos o tipos:", error);
                setTitulos([]);
                setTipos([]);
            } finally {
                setLoading(false);
            }
        };
        loadTitulos();
    }, [idPersona]);

    const titulosOrdenados = useMemo(
        () => [...titulos].sort((a,b) => String(b.id_titulo).localeCompare(String(a.id_titulo))),
        [titulos]
    );

    const resetForm = () => {
        setIdTipoTitulo("");
        setNombreTitulo("");
        setInstitucion("");
        setFechaEmision("");
        setMatriculaProf("");
        setArchivo(null);
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        if(!id_tipo_titulo ||!nombre_titulo) {
            return alert("Completá tipo de título y nombre de titulo")
        };
        try {
            setSaving(true);

            let id_archivo = null;
            if(archivo) {
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
                id_archivo: id_archivo,
                id_estado_verificacion: 1,
            };

            const { data: nuevoTitulo } = await tituloService.createTitulo(body);
            setTitulos((prev) => [nuevoTitulo, ...prev]);

            resetForm();
            setShowNew(false);
        } catch (error) {
            console.error("Error al crear título:", error);
            alert("No se pudo crear el título");
        } finally {
            setSaving(false);
        }
    };

    return(
        <div className="fixed inset-0 z-[70]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose}/>
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div role="dialog" aria-modal="true" className="w-full max-w-3xl rounded-2xl bg-[#101922] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-semibold text-[#19F124]">Títulos</h3>
                        <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#1A2430] cursor-pointer">
                            <IoClose size={22}/>
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <p className="text-lg opacity-80">
                            Persona: <span className="font-semibold">{idPersona}</span>
                        </p>
                        <button onClick={() => setShowNew(true)} className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-[#19F124] hover:bg-[#2af935] text-[#101922] transition">
                            Agregar título +
                        </button>
                    </div>

                    <div className="max-h-[50vh] overflow-auto pr-1">
                        {loading ? (
                            <p className="opacity-70">Cargando...</p>
                        ) : titulosOrdenados.length === 0 ? (
                            <p className="opacity-70">Sin títulos cargados</p>
                        ) : (
                            <ul className="space-y-2">
                                {titulosOrdenados.map((t) => (
                                    <li key={t.id_titulo} className="px-3 py-2 rounded-xl bg-[#0D1520]">
                                        <div className="font-semibold">{t.nombre_titulo}</div>
                                        <div className="text-sm opacity-80">
                                            {t.tipo_titulo ? `${t.tipo_titulo} • ` : ""}
                                            {t.institucion ? `${t.institucion} • ` : ""}
                                            {t.fecha_emision ? `Emitido: ${new Date(t.fecha_emision).toLocaleDateString()}` : ""}
                                        </div>
                                        <div className="text-xs opacity-60">
                                            Estado: {t.estado_verificacion_nombre || 'Sin asignar'}
                                            {t.archivo_nombre ? ` • Archivo: ${t.archivo_nombre}` : ""}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {showNew && (
                        <div className="fixed inset-0 z-[80]">
                            <div className="absolute inset-0 bg-black/60" onClick={() => setShowNew(false)}/>
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <div className="w-full max-w-xl bg-[#101922] rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-start justify-between mb-4">
                                        <h4 className="text-xl font-semibold text-[#19F124]">Nuevo título</h4>
                                        <button onClick={() => setShowNew(false)} className="p-1 rounded-lg hover:bg-[#1A2430]">
                                            <IoClose size={22}/>
                                        </button>
                                    </div>

                                    <form className="space-y-4" onSubmit={handleCreate}>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block mb-1 text-sm opacity-80">Tipo de título *</label>
                                                <select 
                                                    value={id_tipo_titulo} 
                                                    onChange={(e) => setIdTipoTitulo(e.target.value)} 
                                                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" 
                                                    required>
                                                        <option value="">Seleccionar...</option>
                                                        {tipos.map((t) => (
                                                            <option key={t.id_tipo_titulo} value={t.id_tipo_titulo}>
                                                                {t.nombre} {t.codigo ? `(${t.codigo})` : ""}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block mb-1 text-sm opacity-80">Fecha de emisión</label>
                                                <input 
                                                    type="date" 
                                                    value={fecha_emision} 
                                                    onChange={(e) => setFechaEmision(e.target.value)} 
                                                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block mb-1 text-sm opacity-80">Nombre del título *</label>
                                                <input 
                                                    value={nombre_titulo}
                                                    onChange={(e) => setNombreTitulo(e.target.value)}
                                                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                                    required
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block mb-1 text-sm opacity-80">Institución</label>
                                                <input 
                                                    value={institucion}
                                                    onChange={(e) => setInstitucion(e.target.value)}
                                                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                                />
                                            </div>

                                            <div>
                                                <label className="block mb-1 text-sm opacity-80">Matrícula profesional</label>
                                                <input 
                                                    value={matricula_prof}
                                                    onChange={(e) => setMatriculaProf(e.target.value)}
                                                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                                />
                                            </div>

                                            <div>
                                                <label className="block mb-1 text-sm opacity-80">Archivo</label>
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
                                                {saving ? "Guardando...":"Guardar"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}