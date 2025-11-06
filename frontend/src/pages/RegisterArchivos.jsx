// pages/RegisterArchivos.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RegisterDomicilio from "./registerArchivos/RegisterDomicilio";
import RegisterDocumento from "./registerArchivos/RegisterDocumento";
import RegisterTitulo from "./registerArchivos/RegisterTitulo";
import { personaBarrioService, domicilioService, tituloService, legajoService, personaDocService, domOtrosService } from "../services/api";

const extractQuery = (s, k) => new URLSearchParams(s).get(k);

export default function RegisterArchivos() {
    const navigate = useNavigate();
    const q = useLocation().search;
    const id_persona = extractQuery(q, 'persona');

    const [domPayload, setDomPayload] = useState(null);     
    const [titulosTmp, setTitulosTmp] = useState([]);       
    const [docs, setDocs] = useState([]);                   
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const refetchDocs = async () => {
        if(!id_persona) return;
        const { data } = await personaDocService.listarDocumentos({ id_persona });
        setDocs(Array.isArray(data) ? data : []);
    }

    useEffect(() => {
        const run = async () => {
        if (!id_persona) return;
        setLoading(true);
        try {
            await refetchDocs();
        } finally {
            setLoading(false);
        }
        };
        run();
    }, [id_persona]);

    const uploadedCodes = useMemo(
        () => (Array.isArray(docs) ? docs.map(d => d.tipo_codigo).filter(Boolean) : []),
        [docs]
    )

    const onAddTitulo = (t) => setTitulosTmp(prev => [...prev, t]);
    const onSetDomicilio = (payload) => setDomPayload(payload);

    const finalizar = async () => {
        if (!id_persona) return alert("Falta id_persona");

        try {
        setSaving(true);

        if (domPayload) {
            const { id_dom_barrio, barrioNuevo, calle, altura } = domPayload;
            let barrioId = id_dom_barrio || null;
            if(!barrioId && barrioNuevo) {
                const { id_dom_localidad, barrio, manzana, casa, departamento, piso } = barrioNuevo;
                const { data: barrioCreado } = await domOtrosService.createBarrio(id_dom_localidad, {
                    barrio, manzana, casa, departamento, piso
                });
                barrioId = barrioCreado.id_dom_barrio;
            }
            if(barrioId) {
                await personaBarrioService.assignBarrio(id_persona, barrioId);
            }

            await domicilioService.createDomicilio(id_persona, { calle, altura, id_dom_barrio: barrioId });
        }

        for (const t of titulosTmp) {
            await tituloService.createTitulo({ id_persona, ...t });
        }

        await legajoService.recalcular(id_persona);
        navigate('/revision');
        } catch (e) {
        console.error(e);
        alert(e?.response?.data?.detalle || e?.response?.data?.error || 'No se pudo finalizar el registro');
        } finally {
        setSaving(false);
        }
    };

    const resumen = useMemo(() => ({
        docsCount: docs.length,
        titulosPend: titulosTmp.length,
        domicilioSet: !!domPayload,
    }), [docs, titulosTmp, domPayload]);

    return (
        <div className="min-h-screen w-full bg-[#030C14] text-white p-6 space-y-6">
        <h1 className="text-4xl font-semibold text-[#19F124]">Completar legajo</h1>
        <p className="opacity-80">Persona: <span className="font-mono">{id_persona}</span></p>

        <RegisterDocumento idPersona={id_persona} uploadedCodes={uploadedCodes} onUploaded={refetchDocs} />

        <RegisterDomicilio onSetDomicilio={onSetDomicilio} uploadedCodes={uploadedCodes} onUploaded={refetchDocs}/>

        <RegisterTitulo idPersona={id_persona} onAddTitulo={onAddTitulo} />

        <div className="w-full bg-[#101922] rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-[#19F124] mb-2">Resumen</h3>
            <ul className="ml-5 space-y-1 text-sm list-disc opacity-90">
            <li>Documentos subidos: {loading ? '...' : resumen.docsCount}</li>
            <li>Títulos (pendientes de guardar): {resumen.titulosPend}</li>
            <li>Domicilio preparado: {resumen.domicilioSet ? 'Sí' : 'No'}</li>
            </ul>
            <div className="flex justify-end mt-4">
            <button
                onClick={finalizar}
                disabled={saving}
                className="px-5 py-3 rounded-xl font-bold bg-[#19F124] text-[#0D1520] disabled:opacity-50"
            >
                {saving ? 'Guardando…' : 'Finalizar y enviar a revisión'}
            </button>
            </div>
        </div>
        </div>
    );
}
