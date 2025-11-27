import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
    contratoService,
    legajoService,
    personaDocService,
} from "../../../services/api";
import {
    KpiCard,
    BentoPanel,
    QuickLinkButton,
} from "../../../components/HomeComponents";
import {
    FiArchive,
    FiFileText,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
    FiList,
} from "react-icons/fi";
import DonutChart from "../../../components/DonutChart";
import {
    isActiveContract,
    isUpcomingContract,
    isFinishedContract,
} from "../../../utils/contratos";
import { motion } from "motion/react";

const toDate = (s) => {
    if (!s) return null;
    return s instanceof Date ? s : new Date(s);
};

const fmt = (s) => {
    if (!s) return "-";
    const d = s instanceof Date ? s : new Date(s);
    return d.toLocaleDateString(undefined, {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

const getStatusIcon = (id_estado) => {
    switch (id_estado) {
        case 1:
            return <FiClock className="text-yellow-400" />;
        case 2:
            return <FiCheckCircle className="text-green-500" />;
        case 3:
            return <FiAlertCircle className="text-red-500" />;
        default:
            return <FiList className="text-gray-500" />;
    }
};

const ESTADOS_LEGAJO_LABELS = {
    INCOMPLETO: "Legajo incompleto",
    PENDIENTE: "Pendiente de verificación",
    REVISION: "En revisión",
    VALIDADO: "Legajo validado",
    BLOQUEADO: "Legajo bloqueado",
};

const getLegajoClasses = (codigo) => {
    switch (codigo) {
        case "VALIDADO":
            return "bg-green-500/10 border border-green-500/40 text-green-400";
        case "PENDIENTE":
            return "bg-yellow-500/15 border border-yellow-500/40 text-yellow-300";
        case "BLOQUEADO":
            return "bg-gray-500/15 border border-gray-500/40 text-gray-300";
        case "REVISION":
            return "bg-amber-500/15 border border-amber-500/40 text-amber-300";
        case "INCOMPLETO":
        default:
            return "bg-red-500/15 border border-red-500/40 text-red-400";
    }
};

export default function HomeEmpleado() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const idPersona = useMemo(
        () =>
            user?.id_persona ??
            user?.persona?.id_persona ??
            user?.persona_id ??
            null,
        [user]
    );

    const nombrePersona =
        user?.persona?.nombre ?? user?.nombre ?? "";
    const apellidoPersona =
        user?.persona?.apellido ?? user?.apellido ?? "";
    const displayName =
        (nombrePersona || apellidoPersona
            ? `${nombrePersona ?? ""} ${apellidoPersona ?? ""}`.trim()
            : user?.email ?? "Empleado");

    if (!idPersona) {
        return (
            <motion.div
                className="mt-6 text-white"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <h1 className="mb-2 text-3xl font-semibold">
                    Hola, <span className="text-[#19F124]">{displayName}</span>
                </h1>
                <p className="max-w-xl text-sm text-white/70">
                    No encontramos una persona asociada a tu usuario. Si creés que esto es un error,
                    comunicate con el área de Recursos Humanos.
                </p>
            </motion.div>
        );
    }

    // === Estado de legajo (misma lógica que MiLegajo) ===
    const {
        data: legajoInfo,
        isLoading: loadingLegajo,
    } = useQuery({
        queryKey: ["legajo", "estado", idPersona],
        enabled: !!idPersona,
        queryFn: async () => {
            const { data } = await legajoService.getEstado(idPersona);

            const codigo =
                data?.estado?.codigo ||
                data?.codigo ||
                data?.estado_codigo ||
                "INCOMPLETO";

            const nombreBase =
                data?.estado?.nombre ||
                data?.nombre ||
                data?.estado_nombre ||
                codigo;

            const nombre =
                ESTADOS_LEGAJO_LABELS[codigo] || nombreBase;

            const checklist =
                data?.checklist || data?.estado?.checklist || {};

            const flags = [
                checklist.okPersona,
                checklist.okIdent,
                checklist.okDocs,
                checklist.okDomicilio,
                checklist.okTitulos,
            ].filter((v) => typeof v === "boolean");

            const total = flags.length;
            const cumplidos = flags.filter(Boolean).length;
            const porcentaje = total
                ? Math.round((cumplidos / total) * 100)
                : 0;

            return { codigo, nombre, checklist, total, cumplidos, porcentaje };
        },
        staleTime: 5 * 60 * 1000,
    });

    const legajoCodigo = String(
        legajoInfo?.codigo || "INCOMPLETO"
    ).toUpperCase();
    const legajoLabel =
        legajoInfo?.nombre ||
        ESTADOS_LEGAJO_LABELS[legajoCodigo] ||
        legajoCodigo;

    // === Contratos ===
    const {
        data: contratosInfo = {
            list: [],
            activos: 0,
            proximos: 0,
            finalizados: 0,
            proximoVenc: "-",
        },
        isLoading: loadingContratos,
    } = useQuery({
        queryKey: ["misContratos", idPersona],
        enabled: !!idPersona,
        queryFn: async () => {
            const { data } = await contratoService.getMisContratos();
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data?.contratos)
                ? data.contratos
                : [];

            const activos = list.filter(isActiveContract);
            const proximos = list.filter(isUpcomingContract);
            const finalizados = list.filter(isFinishedContract);

            const finDates = activos
                .map((c) => toDate(c.fecha_fin))
                .filter(Boolean);
            const minTs = finDates.length
                ? Math.min(...finDates.map((d) => d.getTime()))
                : null;

            return {
                list,
                activos: activos.length,
                proximos: proximos.length,
                finalizados: finalizados.length,
                proximoVenc: minTs ? fmt(new Date(minTs)) : "-",
            };
        },
        staleTime: 5 * 60 * 1000,
        keepPreviousData: true,
    });

    // === Documentos de la persona ===
    const {
        data: documentos = [],
        isLoading: loadingDocs,
    } = useQuery({
        queryKey: ["personaDocs", idPersona, { limit: 5 }],
        enabled: !!idPersona,
        queryFn: async () => {
            const { data } = await personaDocService.listarDocumentos(
                idPersona
            );

            let arr = [];
            if (Array.isArray(data)) arr = data;
            else if (Array.isArray(data?.items)) arr = data.items;
            else if (Array.isArray(data?.documentos))
                arr = data.documentos;
            else if (Array.isArray(data?.rows)) arr = data.rows;

            return arr.slice(0, 5);
        },
        keepPreviousData: true,
        staleTime: 60 * 1000,
    });

    const loading = loadingContratos || loadingLegajo || loadingDocs;

    // Checklist legajo amigable
    const checklistItems = [
        { key: "okPersona", label: "Datos personales completos" },
        { key: "okIdent", label: "Identificación (DNI/CUIL)" },
        { key: "okDocs", label: "Documentos obligatorios cargados" },
        { key: "okDomicilio", label: "Domicilio cargado" },
        { key: "okTitulos", label: "Títulos declarados" },
    ].map((item) => ({
        ...item,
        value: legajoInfo?.checklist?.[item.key],
    }));

    const pendientes = checklistItems.filter(
        (i) => i.value === false || typeof i.value === "undefined"
    );

    const completado =
        legajoInfo?.cumplidos ?? (checklistItems.length - pendientes.length);
    const totalChecklist =
        legajoInfo?.total ??
        (checklistItems.filter((i) => typeof i.value === "boolean").length ||
            checklistItems.length);

    return (
        <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            <motion.div
                className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
            </motion.div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.02 }}
                >
                    <KpiCard
                        label="Contratos activos"
                        value={
                            loading
                                ? "..."
                                : contratosInfo.activos ?? 0
                        }
                        helperText={
                            !loading && contratosInfo.proximos
                                ? `${contratosInfo.proximos} próximos a iniciar`
                                : undefined
                        }
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.06 }}
                >
                    <KpiCard
                        label="Próximo vencimiento"
                        value={
                            loading
                                ? "..."
                                : contratosInfo.proximoVenc
                        }
                        helperText={
                            !loading && contratosInfo.finalizados
                                ? `${contratosInfo.finalizados} contratos finalizados`
                                : undefined
                        }
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                >
                    <KpiCard
                        label="Estado del Legajo"
                        value={
                            loadingLegajo
                                ? "..."
                                : `${legajoLabel}`
                        }
                        helperText={
                            !loadingLegajo
                                ? `${legajoInfo?.porcentaje ?? 0}% completo`
                                : undefined
                        }
                    />
                </motion.div>

                {/* Estado de Documentos */}
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.15 }}
                >
                    <BentoPanel className="p-4 space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            Estado de Documentos
                        </h2>
                        <div className="space-y-2">
                            {loadingDocs && (
                                <p className="text-gray-400">
                                    Cargando documentos...
                                </p>
                            )}

                            {!loadingDocs && documentos.length === 0 && (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-gray-400">
                                        Todavía no tenés documentos cargados en tu legajo.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/dashboard/mi-legajo?tab=docs"
                                            )
                                        }
                                        className="text-sm font-semibold text-[#19F124] underline underline-offset-4 cursor-pointer"
                                    >
                                        Cargar documentos
                                    </button>
                                </div>
                            )}

                            {documentos.map((doc) => {
                                const tipo =
                                    doc?.tipo_documento?.descripcion ||
                                    doc?.tipo_documento?.nombre ||
                                    doc?.tipo?.descripcion ||
                                    doc?.tipo?.nombre ||
                                    doc?.tipo_codigo ||
                                    doc?.codigo ||
                                    "Documento";

                                const estadoObj =
                                    doc?.estado_verificacion ||
                                    doc?.estado ||
                                    {};
                                const idEstado =
                                    doc?.id_estado_verificacion ??
                                    estadoObj?.id_estado_verificacion ??
                                    estadoObj?.id ??
                                    null;
                                const estadoDesc =
                                    estadoObj?.descripcion ||
                                    estadoObj?.nombre ||
                                    "";

                                return (
                                    <motion.div
                                        key={
                                            doc.id_persona_doc ??
                                            `${tipo}-${idEstado}-${Math.random()}`
                                        }
                                        layout
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex items-center justify-between p-2 bg-[#101922] rounded-md"
                                    >
                                        <span className="text-sm truncate">
                                            {tipo}
                                        </span>
                                        <div className="flex items-center gap-2 text-xs">
                                            {getStatusIcon(idEstado)}
                                            <span className="w-24 text-right truncate">
                                                {estadoDesc || "Sin estado"}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </BentoPanel>
                </motion.div>

                {/* Accesos rápidos */}
                <motion.div
                    className="lg:col-span-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.18 }}
                >
                    <BentoPanel className="p-4 space-y-3">
                        <h2 className="text-lg font-semibold text.white">
                            Accesos Rápidos
                        </h2>
                        <QuickLinkButton
                            label="Ver Mi Legajo"
                            icon={<FiArchive />}
                            onClick={() => navigate("/dashboard/mi-legajo")}
                        />
                        <QuickLinkButton
                            label="Ver Mis Contratos"
                            icon={<FiFileText />}
                            onClick={() =>
                                navigate("/dashboard/mis-contratos")
                            }
                        />
                    </BentoPanel>
                </motion.div>

                <motion.div
                    className="lg:col-span-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.21 }}
                >
                    <BentoPanel className="p-4 space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            Progreso de mi Legajo
                        </h2>
                        {loadingLegajo ? (
                            <p className="text-sm text-gray-400">
                                Cargando datos...
                            </p>
                        ) : (
                            <DonutChart
                                items={[
                                    {
                                        label: "Completado",
                                        value: completado || 0,
                                    },
                                    {
                                        label: "Pendiente",
                                        value:
                                            (totalChecklist || 0) -
                                            (completado || 0),
                                    },
                                ]}
                            />
                        )}
                        {!loadingLegajo && (
                            <p className="text-xs text-center text-gray-400">
                                {legajoInfo?.porcentaje ?? 0}% completo
                            </p>
                        )}
                    </BentoPanel>
                </motion.div>

                {/* Checklist de legajo */}
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.24 }}
                >
                    <BentoPanel className="p-4 space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            ¿Qué me falta para completar mi legajo?
                        </h2>
                        {loadingLegajo && (
                            <p className="text-sm text-gray-400">
                                Cargando checklist...
                            </p>
                        )}

                        {!loadingLegajo && (
                            <div className="space-y-2">
                                {pendientes.length === 0 ? (
                                    <p className="text-sm text-[#19F124]">
                                        ¡Tu legajo está completo! 🎉
                                    </p>
                                ) : (
                                    pendientes.map((item) => (
                                        <div
                                            key={item.key}
                                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#101922]"
                                        >
                                            <span className="text-sm text-white/80">
                                                {item.label}
                                            </span>
                                            <span className="text-xs text-red-400">
                                                Pendiente
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </BentoPanel>
                </motion.div>
            </div>
        </motion.div>
    );
}
