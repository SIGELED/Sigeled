import { useEffect, useMemo, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
    FiUploadCloud,
    FiCheck,
    FiAlertCircle,
    FiFileText,
    FiExternalLink,
    FiUser,
    FiHash,
    FiHome,
    FiAward,
    FiClipboard
} from "react-icons/fi";
import { tipoDocService, archivoService, personaDocService } from "../../services/api";

const FALLBACK_TIPOS = [
    { id_tipo_doc: 1, codigo: "DNI",     nombre: "DNI" },
    { id_tipo_doc: 2, codigo: "CUIL",    nombre: "CUIL" },
    { id_tipo_doc: 3, codigo: "DOM",     nombre: "Constancia de domicilio" },
    { id_tipo_doc: 4, codigo: "TIT",     nombre: "Título habilitante" },
    { id_tipo_doc: 5, codigo: "CV",      nombre: "Currículum Vitae" },
    { id_tipo_doc: 6, codigo: "CON_SER", nombre: "Constancia de servicio" },
];

const ICONS = {
    DNI: FiUser,
    CUIL: FiHash,
    DOM: FiHome,
    TIT: FiAward,
    CV: FiFileText,
    CON_SER: FiClipboard,
};
const IconFor = (code) => ICONS[code] ?? FiFileText;

function DocCard({ title, fileName, href, wide = false }) {
    return (
        <div className={`${wide ? "w-full" : "w-full sm:w-[420px]"} flex justify-center items-center align-middle m-auto rounded-2xl bg-[#0E1F30] border border-white/10 p-4`}>
        <div className="flex items-start gap-3">
            <div className="flex flex-col">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#101922] border border-white/10">
                <FiFileText className="w-5 h-5 opacity-90" />
            </div>
            </div>
            <div className="min-w-0">
            <p className="text-sm text-[#19F124] font-semibold">{title}</p>
            <p className="truncate">{fileName || "Archivo subido"}</p>
            {href ? (
                <a
                className="inline-flex items-center gap-1 mt-1 text-sm underline opacity-80 hover:opacity-100 underline-offset-4"
                href={href}
                target="_blank"
                rel="noreferrer"
                >
                Ver archivo <FiExternalLink />
                </a>
            ) : null}
            </div>
        </div>
        </div>
    );
}

function DropBox({ label, disabled, onDrop, state, wide = false }) {
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
        <div className="flex flex-col w-full space-y-2">
        <p className="text-lg font-black text-center opacity-90">{label}</p>
        <div
            {...getRootProps()}
            className={`rounded-2xl hover:bg-[#19F124] m-auto ${wide ? "w-full" : "w-40"} h-30 hover:text-[#030C14] hover:border-[#19F124] border-2 border-dashed p-6 bg-[#0E1F30] text-white transition-all ${border}
                            ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl">
                {state === "done" ? <FiCheck className="w-10 h-10" /> : <FiUploadCloud className="w-10 h-10" />}
            </div>
            <div>
                <p className="text-sm text-center">
                {state === "uploading" ? "Subiendo…" : state === "done" ? "¡Subido!" : "Arrastrá o hacé click para subir"}
                </p>
            </div>
            </div>
        </div>
        {state === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-300">
            <FiAlertCircle /> Error al subir
            </div>
        )}
        </div>
    );
}

export default function StepDocs({
    idPersona,
    alreadyUploadedCodes = [],
    uploadedDocs = [],
    onUploaded,
    onNext
    }) {
    const [tipos, setTipos] = useState(FALLBACK_TIPOS);
    const [subStep, setSubStep] = useState(1);
    const [selectedCodes, setSelectedCodes] = useState(new Set());

    const FB_BY_CODE = Object.fromEntries(FALLBACK_TIPOS.map(t => [t.codigo, t.nombre]));
    const nombreDe = (code, maybeNombre) => FB_BY_CODE[code] ?? maybeNombre ?? code;

    const [uploadMeta, setUploadMeta] = useState({});

    useEffect(() => {
        (async () => {
        try {
            const t = await tipoDocService.getAllDocTypes().catch(() => null);
            if (Array.isArray(t?.data) && t.data.length) setTipos(t.data);
        } catch { }
        })();
    }, []);

    const uploadedByCode = useMemo(() => {
        const map = {};
        (uploadedDocs || []).forEach(d => {
        const code = d?.tipo_codigo || d?.codigo || d?.tipo?.codigo;
        if (!code) return;
        const name =
            d?.archivo_nombre ||
            d?.archivo?.nombre ||
            d?.archivo?.nombre_original ||
            d?.nombre_archivo ||
            "Archivo";
        const url = d?.archivo_url || d?.archivo?.url || d?.url || null;
        (map[code] = map[code] || []).push({
            id_archivo: d?.id_archivo || d?.archivo?.id_archivo || null,
            name,
            url
        });
        });
        return map;
    }, [uploadedDocs]);

    const opciones = useMemo(
        () => tipos.map(t => ({ ...t, ya: alreadyUploadedCodes.includes(t.codigo) })),
        [tipos, alreadyUploadedCodes]
    );

    const toUpload = useMemo(
        () => [...selectedCodes].filter(c => !alreadyUploadedCodes.includes(c)),
        [selectedCodes, alreadyUploadedCodes]
    );

    const canProceedSub2 = useMemo(() => {
        if (toUpload.length === 0) return true;
        return toUpload.every(c => (uploadMeta[c]?.state || "idle") === "done");
    }, [toUpload, uploadMeta]);

    const toggle = (code) => {
        const next = new Set(selectedCodes);
        next.has(code) ? next.delete(code) : next.add(code);
        setSelectedCodes(next);
    };

    const doUpload = async (code, file) => {
        if (!idPersona) return;
        setUploadMeta(s => ({ ...s, [code]: { ...(s[code] || {}), state: "uploading", name: file?.name } }));
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

        setUploadMeta(s => ({ ...s, [code]: { ...(s[code] || {}), state: "done", id_archivo } }));
        onUploaded?.();
        } catch (e) {
        console.error("[upload]", e);
        setUploadMeta(s => ({ ...s, [code]: { ...(s[code] || {}), state: "error" } }));
        }
    };

    const colsForCount = (n) => {
        if (n <= 1) return "grid-cols-1";
        if (n === 2) return "grid-cols-1 sm:grid-cols-2";
        if (n === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
    };

    const toUploadCols = colsForCount(toUpload.length);
    const dropIsWide = toUpload.length <= 2;

    const uploadedCards = useMemo(() => {
        const arr = [];
        [...selectedCodes].filter(code => alreadyUploadedCodes.includes(code)).forEach(code => {
        const t = tipos.find(x => x.codigo === code);
        const list = uploadedByCode[code] || [];
        if (list.length) {
            list.forEach((itm, idx) => {
            arr.push({
                key: `${code}-${idx}`,
                title: nombreDe(code, t?.nombre),
                name: itm.name,
                url: itm.url || undefined
            });
            });
        } else {
            arr.push({
            key: `${code}-generic`,
            title: nombreDe(code, t?.nombre),
            name: "Archivo ya subido",
            url: undefined
            });
        }
        });
        return arr;
    }, [selectedCodes, alreadyUploadedCodes, tipos, uploadedByCode]);

    const uploadedCols = colsForCount(uploadedCards.length);
    const docWide = uploadedCards.length <= 2;

    return (
        <div className="w-full bg-[#101922] rounded-2xl p-6 text-white">
        <h3 className="pt-3 pl-5 pr-5 mb-1 text-3xl font-semibold text-white">
            {subStep === 1 ? "Seleccioná los tipos de documentos que vas a subir" : "Subí los archivos seleccionados"}
        </h3>
        <p className="pl-8 text-lg opacity-50">
            {subStep === 1 ? "Puede ser más de uno." : "Solamente PDF"}
        </p>

        {subStep === 1 ? (
            <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-2">
            {opciones.map(t => {
                const disabled = t.ya;
                const active = selectedCodes.has(t.codigo);
                const Icon = IconFor(t.codigo);
                return (
                <button
                    key={t.codigo}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggle(t.codigo)}
                    className={`w-full h-auto text-left px-4 py-3 rounded-xl border cursor-pointer
                                    ${disabled ? "opacity-50 cursor-not-allowed border-white/10 bg-[#0e1f30]" :
                        active ? "border-[#19F124] bg-[#0f2a1a] transition-all" :
                        "border-white/10 bg-[#0e1f30] hover:border-white/20 transition-all"}`}
                >
                    <div className="flex items-center align-middle justify-between text-[1.5rem]">
                    <div className="flex items-center">
                        <Icon className="w-8 h-8 opacity-90" />
                        <span className="w-[0.2rem] mx-3 rounded-full h-15 bg-white/20" />
                        <span>{nombreDe(t.codigo, t.nombre)}</span>
                    </div>
                    {disabled && <span className="text-xs text-white/60">• ya subido</span>}
                    </div>
                </button>
                );
            })}
            </div>
        ) : (
            <div className="flex flex-col pl-2 pr-2">
            <div className={`grid gap-6 p-2 ${uploadedCols}`}>
                {uploadedCards.map((c) => (
                <DocCard key={c.key} title={c.title} fileName={c.name} href={c.url} wide={docWide} />
                ))}
            </div>

            <div className={`grid gap-5 ${toUploadCols}`}>
                {toUpload.map(code => {
                const t = tipos.find(x => x.codigo === code);
                const state = uploadMeta[code]?.state || "idle";
                const name = uploadMeta[code]?.name;
                return (
                    <div key={code} className="flex flex-col items-center gap-5">
                    <DropBox
                        label={nombreDe(code, t?.nombre)}
                        state={state}
                        onDrop={(file) => doUpload(code, file)}
                        wide={dropIsWide}
                    />
                    {state === "done" && name ? (
                        <DocCard title={nombreDe(code, t?.nombre)} fileName={name} wide={dropIsWide} />
                    ) : null}
                    </div>
                );
                })}
            </div>
            </div>
        )}

        {subStep === 1 ? (
            <div className="flex justify-end mt-2">
            <button
                type="button"
                onClick={() => setSubStep(2)}
                disabled={selectedCodes.size === 0}
                className="px-6 py-1 text-xl rounded-full font-bold bg-[#0D1520] text-[#19F124] border-3 border-[#19F124] disabled:opacity-50 cursor-pointer disabled:cursor-default hover:bg-[#19F124] hover:text-[#0D1520] transition-all disabled:pointer-events-none"
            >
                Siguiente
            </button>
            </div>
        ) : (
            <div className="flex justify-between mt-5">
            <button
                type="button"
                onClick={() => setSubStep(1)}
                className="cursor-pointer text-xl rounded-full border hover:bg-[#162a3e] px-6 py-1 transition-all font-black bg-[#0E1F30] text-white border-white/10"
            >
                Atrás
            </button>
            <button
                type="button"
                onClick={() => onNext?.()}
                disabled={!canProceedSub2}
                className="px-6 py-1 text-xl rounded-full font-bold bg-[#0D1520] text-[#19F124] border-3 border-[#19F124] disabled:opacity-50 cursor-pointer disabled:cursor-default hover:bg-[#19F124] hover:text-[#0D1520] transition-all disabled:pointer-events-none"
                title={!canProceedSub2 ? "Esperá a que terminen las subidas" : undefined}
            >
                Siguiente
            </button>
            </div>
        )}
        </div>
    );
}
