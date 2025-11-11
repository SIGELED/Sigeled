import { useEffect, useMemo, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiCheck, FiAlertCircle } from "react-icons/fi";
import { tipoDocService, archivoService, personaDocService } from "../../services/api";

const FALLBACK_TIPOS = [
    { id_tipo_doc: 1, codigo: "DNI",     nombre: "DNI" },
    { id_tipo_doc: 2, codigo: "CUIL",    nombre: "CUIL" },
    { id_tipo_doc: 3, codigo: "DOM",     nombre: "Constancia de domicilio" },
    { id_tipo_doc: 4, codigo: "TIT",     nombre: "Título habilitante" },
    { id_tipo_doc: 5, codigo: "CV",      nombre: "Currículum Vitae" },
    { id_tipo_doc: 6, codigo: "CON_SER", nombre: "Constancia de servicio" },
];

function DropBox({ label, disabled, onDrop, state }) {
    const onDropCb = useCallback((files) => {
        if (!files?.length || disabled) return;
        onDrop(files[0]);
    }, [onDrop, disabled]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        multiple: false,
        accept: { "application/pdf": [] },
        onDrop: onDropCb,
        disabled,
    });

    const border =
        state === "done" ? "border-emerald-400"
        : state === "error" ? "border-red-400"
        : isDragReject ? "border-red-400"
        : isDragActive ? "border-[#19F124]"
        : "border-[#2d3b48]";

    return (
        <div className="flex flex-col space-y-2 w-full sm:w-[420px]">
        <p className="text-sm opacity-80">{label}</p>
        <div
            {...getRootProps()}
            className={`rounded-2xl hover:bg-[#19F124] hover:text-[#030C14] hover:border-[#19F124] border-2 border-dashed p-6 bg-[#0E1F30] text-white transition-all ${border}
            ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
            <input {...getInputProps()} />
            <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl">
                {state === "done" ? <FiCheck className="w-6 h-6" /> : <FiUploadCloud className="w-6 h-6" />}
            </div>
            <div>
                <p className="text-lg">
                {state === "uploading" ? "Subiendo…" : state === "done" ? "¡Subido!" : "Arrastrá o hacé click para subir"}
                </p>
                <p className="text-sm opacity-70">PDF</p>
            </div>
            </div>
        </div>
        {state === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-300"><FiAlertCircle/> Error al subir</div>
        )}
        </div>
    );
}

export default function StepDocs({ idPersona, alreadyUploadedCodes = [], onUploaded, onNext, onBack }) {
    const [tipos, setTipos] = useState(FALLBACK_TIPOS);
    const [subStep, setSubStep] = useState(1); 
    const [selectedCodes, setSelectedCodes] = useState(new Set());
    const [uploadState, setUploadState] = useState({});

    useEffect(() => {
        (async () => {
        try {
            const t = await tipoDocService.getAllDocTypes().catch(() => null);
            if (Array.isArray(t?.data) && t.data.length) setTipos(t.data);
        } catch {}
        })();
    }, []);

    const opciones = useMemo(
        () => tipos.map(t => ({ ...t, ya: alreadyUploadedCodes.includes(t.codigo) })),
        [tipos, alreadyUploadedCodes]
    );

    const toUpload = useMemo(
        () => [...selectedCodes].filter(c => !alreadyUploadedCodes.includes(c)),
        [selectedCodes, alreadyUploadedCodes]
    );

    const toggle = (code) => {
        const next = new Set(selectedCodes);
        next.has(code) ? next.delete(code) : next.add(code);
        setSelectedCodes(next);
    };

    const doUpload = async (code, file) => {
        if (!idPersona) return;
        setUploadState(s => ({ ...s, [code]: "uploading" }));
        try {
        const up = await archivoService.uploadForPersona(idPersona, file);
        const id_archivo = up?.data?.id_archivo ?? up?.data?.archivo?.id_archivo;
        if (!id_archivo) throw new Error("No se obtuvo id_archivo");

        const tipo = tipos.find(t => t.codigo === code);
        if (!tipo) throw new Error("Tipo de documento inválido");

        await personaDocService.createDoc({
            id_persona: idPersona,
            id_tipo_doc: Number(tipo.id_tipo_doc),
            id_archivo,
            id_estado_verificacion: 1,
            vigente: true,
        });

        setUploadState(s => ({ ...s, [code]: "done" }));
        onUploaded?.();
        } catch (e) {
        console.error("[upload]", e);
        setUploadState(s => ({ ...s, [code]: "error" }));
        }
    };

    return (
        <div className="w-full bg-[#101922] rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-semibold text-[#19F124] mb-1">Documentos</h3>
        <p className="mb-4 opacity-70">
            {subStep === 1 ? "Seleccioná los tipos de documentos que vas a subir." : "Subí los archivos seleccionados."}
        </p>

        {subStep === 1 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {opciones.map(t => {
                const disabled = t.ya;
                const active = selectedCodes.has(t.codigo);
                return (
                    <button
                    key={t.codigo}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggle(t.codigo)}
                    className={`w-full text-left px-4 py-3 rounded-xl border
                    ${disabled ? "opacity-50 cursor-not-allowed border-white/10 bg-[#0e1f30]" :
                        active ? "border-[#19F124] bg-[#0f2a1a]" : "border-white/10 bg-[#0e1f30] hover:border-white/20"}`}
                    >
                    <div className="flex items-center justify-between">
                        <span>{t.nombre}</span>
                        {disabled && <span className="text-xs text-white/60">• ya subido</span>}
                    </div>
                    </button>
                );
                })}
            </div>
            ) : (
            <div className="flex flex-wrap justify-center gap-5">
                {toUpload.length === 0 ? (
                <div className="w-full text-sm text-center opacity-70">Nada para subir: lo seleccionado ya está cargado.</div>
                ) : toUpload.map(code => {
                const t = tipos.find(x => x.codigo === code);
                return (
                    <DropBox
                    key={code}
                    label={t?.nombre || code}
                    state={uploadState[code] || "idle"}
                    onDrop={(file) => doUpload(code, file)}
                    />
                );
                })}
            </div>
            )}

            <div className="flex justify-between mt-6">
            <button
            type="button"
            onClick={() => (subStep === 1 ? onBack?.() : setSubStep(1))}
            className="px-4 py-3 cursor-pointer hover:bg-[#162a3e] transition-all rounded-xl font-bold bg-[#0E1F30] text-white border border-white/10"
            >
                Atrás
            </button>

            {subStep === 1 ? (
                <div className="flex justify-end mt-6">
                    <button
                    type="button"
                    onClick={() => setSubStep(2)}
                    disabled={selectedCodes.size === 0}
                    className="px-5 py-3 rounded-xl font-bold bg-[#19F124] text-[#0D1520] disabled:opacity-50"
                    >
                    Siguiente
                    </button>
                </div>
                ) : (
                <div className="flex justify-between mt-6">
                    <button
                    type="button"
                    onClick={() => setSubStep(1)}
                    className="px-4 py-3 cursor-pointer hover:bg-[#162a3e] transition-all rounded-xl font-bold bg-[#0E1F30] text-white border border-white/10"
                    >
                    Atrás
                    </button>
                    <button
                    type="button"
                    onClick={() => onNext?.()}
                    className="px-5 py-3 rounded-xl font-bold bg-[#19F124] text-[#0D1520]"
                    >
                    Siguiente
                    </button>
            </div>
            )}
        </div>
        </div>
    );
}
