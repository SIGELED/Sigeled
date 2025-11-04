import { useEffect, useState } from "react";
import { archivoService, tituloService } from "../../services/api";

export default function RegisterTitulo({ idPersona, onAddTitulo }) {
    const [tipos, setTipos] = useState([]);
    const [id_tipo_titulo, setIdTipoTitulo] = useState("");
    const [nombre_titulo, setNombreTitulo] = useState("");
    const [institucion, setInstitucion] = useState("");
    const [fecha_emision, setFechaEmision] = useState("");
    const [matricula_prof, setMatriculaProf] = useState("");
    const [archivo, setArchivo] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
        setLoading(true);
        try {
            const tTipos = await tituloService.getTiposTiulos();
            setTipos(Array.isArray(tTipos.data) ? tTipos.data : []);
        } finally {
            setLoading(false);
        }
        };
        run();
    }, []);

    const reset = () => {
        setIdTipoTitulo(""); setNombreTitulo(""); setInstitucion("");
        setFechaEmision(""); setMatriculaProf(""); setArchivo(null);
    };

    const crear = async (e) => {
        e?.preventDefault?.();
        if (!id_tipo_titulo || !nombre_titulo) return alert("Completá tipo y nombre del título.");
        try {
        setSaving(true);
        let id_archivo = null;
        if (archivo) {
            if (!idPersona) return alert("Falta idPersona");
            const up = await archivoService.uploadForPersona(idPersona, archivo);
            id_archivo = up?.data?.archivo?.id_archivo ?? null;
        }
        onAddTitulo?.({
            id_tipo_titulo: Number(id_tipo_titulo),
            nombre_titulo,
            institucion: institucion || null,
            fecha_emision: fecha_emision || null,
            matricula_prof: matricula_prof || null,
            id_archivo
        });
        reset();
        } finally {
        setSaving(false);
        }
    };

    return (
        <div className="w-full bg-[#101922] rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-semibold text-[#19F124] mb-4">Títulos</h3>

        <form className="space-y-4" onSubmit={crear}>
            <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block mb-1 text-sm opacity-80">Tipo de título *</label>
                <select value={id_tipo_titulo} onChange={(e) => setIdTipoTitulo(e.target.value)}
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl" required>
                <option value="">Seleccionar…</option>
                {tipos.map((t) => (
                    <option key={t.id_tipo_titulo} value={t.id_tipo_titulo}>{t.nombre}</option>
                ))}
                </select>
            </div>
            <div>
                <label className="block mb-1 text-sm opacity-80">Fecha de emisión</label>
                <input type="date" value={fecha_emision} onChange={(e) => setFechaEmision(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" />
            </div>
            <div className="col-span-2">
                <label className="block mb-1 text-sm opacity-80">Nombre del título *</label>
                <input value={nombre_titulo} onChange={(e) => setNombreTitulo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" required />
            </div>
            <div className="col-span-2">
                <label className="block mb-1 text-sm opacity-80">Institución</label>
                <input value={institucion} onChange={(e) => setInstitucion(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" />
            </div>
            <div>
                <label className="block mb-1 text-sm opacity-80">Matrícula profesional</label>
                <input value={matricula_prof} onChange={(e) => setMatriculaProf(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" />
            </div>
            <div>
                <label className="block mb-1 text-sm opacity-80">Archivo (opcional)</label>
                <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" />
            </div>
            </div>

            <div className="flex justify-end">
            <button type="submit" disabled={saving}
                    className="px-4 py-2 rounded-xl font-bold bg-[#19F124] text-[#101922] disabled:opacity-50">
                {saving ? "Agregando…" : "Agregar título"}
            </button>
            </div>
        </form>

        <p className="mt-3 text-sm opacity-70">Durante el registro no se persiste nada hasta “Finalizar”.</p>
        </div>
    );
}
