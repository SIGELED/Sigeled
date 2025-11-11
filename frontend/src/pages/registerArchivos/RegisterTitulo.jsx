import { useEffect, useState } from "react";
import { archivoService, tituloService } from "../../services/api";

export default function RegisterTitulo({ idPersona, onAddTitulo, onBack, onFinish, saving }) {
    const [tipos, setTipos] = useState([]);
    const [id_tipo_titulo, setIdTipoTitulo] = useState("");
    const [nombre_titulo, setNombreTitulo] = useState("");
    const [institucion, setInstitucion] = useState("");
    const [fecha_emision, setFechaEmision] = useState("");
    const [matricula_prof, setMatriculaProf] = useState("");
    const [archivo, setArchivo] = useState(null);
    const [adding, setAdding] = useState(false);

    useEffect(() => { (async () => {
        const tTipos = await tituloService.getTiposTitulos();
        setTipos(Array.isArray(tTipos.data) ? tTipos.data : []);
    })(); }, []);

    const reset = () => {
        setIdTipoTitulo(""); setNombreTitulo(""); setInstitucion("");
        setFechaEmision(""); setMatriculaProf(""); setArchivo(null);
    };

    const crear = async (e) => {
        e?.preventDefault?.();
        if (!id_tipo_titulo || !nombre_titulo) return alert("Completá tipo y nombre del título.");
        setAdding(true);
        try {
        let id_archivo = null;
        if (archivo) {
            const up = await archivoService.uploadForPersona(idPersona, archivo);
            id_archivo = up?.data?.archivo?.id_archivo ?? up?.data?.id_archivo ?? null;
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
        } finally { setAdding(false); }
    };

    return (
        <div className="w-full bg-[#101922] rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-semibold text-[#19F124] mb-4">Títulos</h3>

        <form className="space-y-4" onSubmit={crear}>
            <div className="flex justify-end">
            <button type="submit" disabled={adding}
                className="px-4 py-2 rounded-xl font-bold bg-[#19F124] text-[#101922] disabled:opacity-50">
                {adding ? "Agregando…" : "Agregar título"}
            </button>
            </div>
        </form>

        <div className="flex justify-between mt-6">
            <button type="button" onClick={() => onBack?.()}
            className="px-4 py-3 rounded-xl font-bold bg-[#0E1F30] text-white border border-white/10">
            Atrás
            </button>
            <button type="button" onClick={() => onFinish?.()} disabled={saving}
            className="px-5 py-3 rounded-xl font-bold bg-[#19F124] text-[#0D1520] disabled:opacity-50">
            {saving ? "Guardando…" : "Finalizar y enviar a revisión"}
            </button>
        </div>
        </div>
    );
}
