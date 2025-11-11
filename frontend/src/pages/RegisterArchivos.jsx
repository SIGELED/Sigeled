import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StepDocs from "./registerArchivos/StepDocs";
import RegisterDomicilio from "./registerArchivos/RegisterDomicilio";
import RegisterTitulo from "./registerArchivos/RegisterTitulo";
import { personaBarrioService, domicilioService, tituloService, legajoService, personaDocService, domOtrosService } from "../services/api";

const extractQuery = (s, k) => new URLSearchParams(s).get(k);

const Stepper = ({ step }) => {
    const steps = [
        { n: 1, label: "Documentos" },
        { n: 2, label: "Domicilio" },
        { n: 3, label: "Títulos" },
    ];
    return (
        <div className="flex items-center gap-6">
        {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold
                ${step >= s.n ? 'bg-[#19F124] text-[#05200a]' : 'bg-[#13202c] text-white/60'}`}>
                {s.n}
            </div>
            <span className={`hidden sm:block ${step >= s.n ? 'text-white' : 'text-white/60'}`}>{s.label}</span>
            {i < steps.length - 1 && (
                <div className={`w-20 h-1 rounded ${step > s.n ? 'bg-[#19F124]' : 'bg-white/10'}`} />
            )}
            </div>
        ))}
        </div>
    );
};

export default function RegisterArchivos() {
    const navigate = useNavigate();
    const q = useLocation().search;
    const id_persona = extractQuery(q, "persona");

    const [step, setStep] = useState(1);
    const [domPayload, setDomPayload] = useState(null);
    const [titulosTmp, setTitulosTmp] = useState([]);
    const [docs, setDocs] = useState([]);
    const [saving, setSaving] = useState(false);

    const refetchDocs = async () => {
        if (!id_persona) return;
        const { data } = await personaDocService.listarDocumentos(id_persona);
        setDocs(Array.isArray(data) ? data : []);
    };

    useEffect(() => { if (id_persona) refetchDocs(); }, [id_persona]);

    const uploadedCodes = useMemo(
        () => (Array.isArray(docs) ? docs.map(d => d.tipo_codigo).filter(Boolean) : []),
        [docs]
    );

    const finalizar = async () => {
        if (!id_persona) return alert("Falta id_persona");
        try {
        setSaving(true);

        if (domPayload) {
            const { id_dom_barrio, barrioNuevo, calle, altura } = domPayload;
            let barrioId = id_dom_barrio || null;

            if (!barrioId && barrioNuevo) {
            const { id_dom_localidad, barrio, manzana, casa, departamento, piso } = barrioNuevo;
            const { data: barrioCreado } = await domOtrosService.createBarrio(id_dom_localidad, {
                barrio, manzana, casa, departamento, piso
            });
            barrioId = barrioCreado.id_dom_barrio;
            }

            if (barrioId) await personaBarrioService.assignBarrio(id_persona, barrioId);
            await domicilioService.createDomicilio(id_persona, { calle, altura, id_dom_barrio: barrioId });
        }

        for (const t of titulosTmp) {
            await tituloService.createTitulo({ id_persona, ...t });
        }

        try { await legajoService.recalcular(id_persona); } catch {}
        try { await legajoService.setEstado(id_persona, "REVISION"); } catch {}

        navigate("/revision", { replace: true });
        } catch (e) {
        console.error(e);
        alert(e?.response?.data?.detalle || e?.response?.data?.error || "No se pudo finalizar el registro");
        } finally {
        setSaving(false);
        }
    };

    return (
        <div className="min-h-screen w-[50%] m-auto bg-[#030C14] text-white p-6 space-y-6">
        <div className="flex flex-col items-center gap-2 justfy-center">
            <div>
            <p className="text-[#19F124] font-semibold text-center tracking-wide uppercase text-sm">Legajo</p>
            <h1 className="text-4xl font-semibold">Completar registro</h1>
            </div>
            <Stepper step={step} />
        </div>

        {step === 1 && (
            <StepDocs
            idPersona={id_persona}
            alreadyUploadedCodes={uploadedCodes}
            onUploaded={refetchDocs}
            onNext={() => setStep(2)}
            onBack={() => navigate(-1)}
            />
        )}

        {step === 2 && (
            <RegisterDomicilio
            onSetDomicilio={setDomPayload}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            />
        )}

        {step === 3 && (
            <RegisterTitulo
            idPersona={id_persona}
            onAddTitulo={(t) => setTitulosTmp(prev => [...prev, t])}
            onBack={() => setStep(2)}
            onFinish={finalizar}
            saving={saving}
            />
        )}
        </div>
    );
}
