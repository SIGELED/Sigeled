import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { contratoService, legajoService, personaDocService } from "../../../services/api";
import { KpiCard, BentoPanel, QuickLinkButton } from "../../../components/HomeComponents";
import { FiArchive, FiFileText, FiCheckCircle, FiAlertCircle, FiClock, FiList } from 'react-icons/fi';
import DonutChart from "../../../components/DonutChart";

const fmt = (s) => {
    if (!s) return "-";
    const d = s instanceof Date ? s : new Date(s);
    return d.toLocaleDateString(undefined, { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit" });
};
const toDate = (s) => (s ? new Date(s) : null);
const today = () => new Date();
const isActive = (c) => {
    const ini = toDate(c.fecha_inicio);
    const fin = toDate(c.fecha_fin);
    const t = today();
    return ini && ini <= t && (!fin || fin >= t);
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


export default function HomeEmpleado() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const idPersona =
        user?.id_persona ??
        user?.persona?.id_persona ??
        user?.persona_id ??
        null;

    const {
        data: legajoInfo = { estadoDesc: "No definido", porcentaje: 0 },
        isLoading: loadingLegajo,
        } = useQuery({
            queryKey: ["legajo", "estado", idPersona],
            enabled: !!idPersona,
            queryFn: async () => {
                const { data } = await legajoService.getEstado(idPersona);
                const estadoDesc = data?.estado?.descripcion || "No definido";
                const checklist = Array.isArray(data?.checklist) ? data.checklist : [];

                const total = checklist.length;
                const cumplidos = checklist.filter((item) => {
                    if (typeof item.cumplido !== "undefined") return !!item.cumplido;
                    if (typeof item.completado !== "undefined") return !!item.completado;
                    if (typeof item.ok !== "undefined") return !!item.ok;
                    if (typeof item.cumple !== "undefined") return !!item.cumple;
                    return !!item.done;
                }).length;

                const porcentaje = total ? Math.round((cumplidos / total) * 100) : 0;

                return {
                    estadoDesc,
                    porcentaje,
                    total,
                    cumplidos,
                };
            },
            staleTime: 5 * 60 * 1000,
        });


    const {
        data: contratosInfo = { list: [], activos: 0, proximoVenc: "-" },
        isLoading: loadingContratos,
    } = useQuery({
        queryKey: ["misContratos"],
        enabled: !!idPersona,
        queryFn: async () => {
            const { data } = await contratoService.getMisContratos();
            const list = Array.isArray(data) ? data : [];
            const activos = list.filter(isActive);
            const finDates = activos.map((c) => toDate(c.fecha_fin)).filter(Boolean);
            const minTs = finDates.length ? Math.min(...finDates.map((d) => d.getTime())) : null;
            return {
                list,
                activos: activos.length,
                proximoVenc: minTs ? fmt(new Date(minTs)) : "-",
            };
        },
        staleTime: 5 * 60 * 1000,
        keepPreviousData: true,
    });
    
    const {
        data: documentos = [],
        isLoading: loadingDocs,
    } = useQuery({
        queryKey: ["personaDocs", idPersona, { limit: 5 }],
        enabled: !!idPersona,
        queryFn: async () => {
            const { data } = await personaDocService.listarDocumentos(idPersona);
            const arr = Array.isArray(data) ? data : [];
            return arr.slice(0, 5);
        },
        keepPreviousData: true,
        staleTime: 60 * 1000,
    });

    const loading = loadingContratos || loadingLegajo || loadingDocs;

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <KpiCard label="Contratos activos" value={loading ? "..." : contratosInfo.activos} />
        <KpiCard label="Próximo vencimiento" value={loading ? "..." : contratosInfo.proximoVenc} />
        <KpiCard
            label="Estado del Legajo"
            value={loading ? "..." : legajoInfo.estadoDesc}
        />

        <BentoPanel className="p-4 space-y-3 lg:col-span-2">
            <h2 className="text-lg font-semibold text-white">Estado de Documentos</h2>
            <div className="space-y-2">
                {loading && <p className="text-gray-400">Cargando documentos...</p>}
                {!loading && documentos.length === 0 && <p className="text-gray-400">No hay documentos cargados.</p>}
                {documentos.map((doc) => (
                    <div key={doc.id_persona_doc} className="flex items-center justify-between p-2 bg-[#101922] rounded-md">
                    <span className="truncate">{doc.tipo_documento?.descripcion || "Documento"}</span>
                        <div className="flex items-center gap-2 text-sm">
                            {getStatusIcon(doc.id_estado_verificacion)}
                            <span className="w-20 text-right">{doc.estado_verificacion?.descripcion}</span>
                        </div>
                    </div>
                ))}
            </div>
        </BentoPanel>

        <BentoPanel className="p-4 space-y-3 lg:col-span-1">
            <h2 className="text-lg font-semibold text-white">Accesos Rápidos</h2>
            <QuickLinkButton label="Ver Mi Legajo" icon={<FiArchive />} onClick={() => navigate("/dashboard/legajo")} />
            <QuickLinkButton
                label="Ver Mis Contratos"
                icon={<FiFileText />}
                onClick={() => navigate("/dashboard/mis-contratos")}
            />
        </BentoPanel>

        <BentoPanel className="p-4 space-y-3 lg:col-span-1">
            <h2 className="text-lg font-semibold text-white">Progreso de mi Legajo</h2>
            {loadingLegajo ? (
                <p className="text-sm text-gray-400">Cargando datos...</p>
            ) : (
                <DonutChart
                items={[
                    { label: "Completado", value: legajoInfo.cumplidos || 0 },
                    {
                    label: "Pendiente",
                    value:
                        (legajoInfo.total || 0) - (legajoInfo.cumplidos || 0),
                    },
                ]}
                />
            )}
            {!loadingLegajo && (
                <p className="text-xs text-center text-gray-400">
                {legajoInfo.porcentaje || 0}% completo
                </p>
            )}
        </BentoPanel>
        </div>
    );
}