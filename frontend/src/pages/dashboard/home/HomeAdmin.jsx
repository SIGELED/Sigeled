import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { KpiCard, BentoPanel, QuickLinkButton } from "../../../components/HomeComponents";
import { FiUsers, FiClipboard, FiFileText, FiAlertOctagon } from 'react-icons/fi';
import { dashboardService } from "../../../services/api";
import DonutChart from "../../../components/DonutChart";
import BarChartSimple from "../../../components/BarChartSimple";

export default function HomeAdmin() {
    const navigate = useNavigate();

    const { data: stats = { usuarios: 0, contratos: 0, pendientes: 0 }, isLoading: loadingStats } = useQuery({
        queryKey: ["admin", "stats"],
        queryFn: async () => {
            const { data } = await dashboardService.getAdminStats();
            return {
                usuarios: data?.totalusuarios || 0,
                contratos: data?.contratosactivos || 0,
                pendientes: data?.documentospendientes || 0,
            };
        },
        staleTime: 60 * 1000,
    });

    const {
        data: documentosPendientes = [],
        isLoading: loadingPend,
        isError,
    } = useQuery({
        queryKey: ["admin", "pendientes", { limit: 5 }],
        queryFn: async () => {
            const { data } = await dashboardService.getDocumentosPendientes(5);
            return Array.isArray(data) ? data : [];
        },
        keepPreviousData: true,
        staleTime: 30 * 1000,
    });

    const {
        data: legajoEstadosRaw = [],
        isLoading: loadingLegajosEstados,
    } = useQuery({
        queryKey: ["admin", "legajos-estados"],
        queryFn: async () => {
            const { data } = await dashboardService.getLegajoEstados();
            if (Array.isArray(data)) return data;
            if (data && typeof data === "object") {
                return Object.entries(data).map(([codigo, cantidad]) => ({
                    codigo,
                    cantidad: Number(cantidad) || 0,
                }));
            }
            return [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const legajoEstadosItems = useMemo(
        () =>
            legajoEstadosRaw.map((item) => ({
                label:
                    item.descripcion ||
                    item.codigo ||
                    item.nombre ||
                    "Sin estado",
                value: Number(item.cantidad || item.total || 0),
            })),
        [legajoEstadosRaw]
    );

    const {
        data: documentosEstadosRaw = [],
        isLoading: loadingDocsEstados,
    } = useQuery({
        queryKey: ["admin", "documentos-estados"],
        queryFn: async () => {
            const { data } = await dashboardService.getDocumentosEstados();
            if (Array.isArray(data)) return data;
            if (data && typeof data === "object") {
                return Object.entries(data).map(([codigo, cantidad]) => ({
                    codigo,
                    cantidad: Number(cantidad) || 0,
                }));
            }
            return [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const documentosEstadosItems = useMemo(
        () =>
            documentosEstadosRaw.map((item) => ({
                label:
                    item.descripcion ||
                    item.codigo ||
                    item.nombre ||
                    "Sin estado",
                value: Number(item.cantidad || item.total || 0),
            })),
        [documentosEstadosRaw]
    );

    const loading = loadingStats || loadingPend;

    const handleRevisarClick = (userId) => {
        navigate(`/dashboard/usuarios/${userId}`);
    };

    return(
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <KpiCard label="Usuarios Totales" value={loading ? '...' : stats.usuarios} icon={<FiUsers/>}/>
            <KpiCard label="Contratos Activos" value={loading ? '...' : stats.contratos} icon={<FiClipboard/>}/>
            <KpiCard label="Documentos Pendientes" value={loading ? '...' : stats.pendientes} icon={<FiAlertOctagon/>}/>

            <BentoPanel className="p-4 space-y-3 lg:col-span-2">
                <h2 className="text-lg font-semibold text-white">Documentos pendientes de revisión</h2>

                <div className="pr-1 space-y-2 overflow-y-auto max-h-40">
                    {loading && <p className="text-gray-400">Cargando tareas...</p>}
                    {!loading && documentosPendientes.length === 0 && (
                    <p className="text-gray-400">No hay tareas pendientes.</p>
                    )}
                    {documentosPendientes.map((item) => (
                    <div
                        key={`${item.tipo_item}-${item.item_id}`}
                        className="flex items-center justify-between p-2 bg-[#101922] rounded-md"
                    >
                        <div>
                        <span className="font-medium">{item.descripcion}</span>
                        <span className="ml-2 text-sm text-gray-400">
                            de {item.nombre} {item.apellido}
                        </span>
                        </div>
                        <button
                        onClick={() => handleRevisarClick(item.id_persona)}
                        className="text-sm text-[#19F124] hover:underline"
                        >
                        Revisar
                        </button>
                    </div>
                    ))}
                </div>
            </BentoPanel>

            <BentoPanel className="p-4 space-y-3 lg:col-span-1">
                    <h2 className="text-lg font-semibold text-white">Administración</h2>
                    <QuickLinkButton label="Gestionar Usuarios" icon={<FiUsers/>} onClick={() => navigate('/dashboard/usuarios')} />
                    <QuickLinkButton label="Gestionar Contratos" icon={<FiFileText/>} onClick={() => navigate('/dashboard/contratos')} />
            </BentoPanel>

            <BentoPanel className="p-4 space-y-3 lg:col-span-1">
                <h2 className="text-lg font-semibold text-white">
                    Estados de Legajo
                </h2>
                {loadingLegajosEstados ? (
                    <p className="text-sm text-gray-400">Cargando datos...</p>
                ) : (
                    <DonutChart items={legajoEstadosItems} />
                )}
            </BentoPanel>

            <BentoPanel className="p-2 space-y-3 lg:col-span-2">
                <h2 className="text-lg font-semibold text-white">
                    Documentos por Estado
                </h2>
                {loadingDocsEstados ? (
                    <p className="text-sm text-gray-400">Cargando datos...</p>
                ) : (
                    <BarChartSimple items={documentosEstadosItems} />
                )}
            </BentoPanel>
        </div>
    )
}