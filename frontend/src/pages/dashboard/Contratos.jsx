import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { contratoService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
    FiPlus,
    FiSearch,
    FiFileText,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiTrash2,
    FiFilter,
} from "react-icons/fi";
import { useToast } from "../../components/ToastProvider";
import { useConfirm } from "../../components/ConfirmProvider";
import { useNavigate } from "react-router-dom";
import {
    isActiveContract,
    isUpcomingContract,
    isFinishedContract,
    getContratoEstado,
} from "../../utils/contratos";
import { motion, AnimatePresence } from "motion/react";
import LoadingState from "../../components/LoadingState";

const Panel = ({ className = "", ...props }) => (
    <div className={`bg-[#0b1420] border border-[#1b2a37] rounded-2xl ${className}`} {...props} />
);

const SolidBtn = ({ className = "", ...props }) => (
    <button
        className={`px-4 py-2 rounded-xl font-bold bg-[#19F124] text-[#0D1520] hover:bg-[#2af935] cursor-pointer transition ${className}`}
        {...props}
    />
);

const OutlineBtn = ({ className = "", ...props }) => (
    <button
        className={`px-3 py-2 rounded-xl border border-[#19F124] text-[#19F124] hover:bg-[#19F124] hover:text-[#0D1520] cursor-pointer transition ${className}`}
        {...props}
    />
);

const MutedBtn = ({ className = "", ...props }) => (
    <button
        className={`p-2 rounded-xl bg-red-500/5 hover:bg-red-500/20 border border-[#ff2c2c] text-[#ff2c2c] cursor-pointer transition ${className}`}
        {...props}
    />
);

const fmt = (s) => {
    if (!s) return "-";
    const fecha = new Date(s);
    return fecha.toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
    });
};

const StatCard = ({ icon, label, value }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
    >
        <Panel className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-[#101922] flex items-center justify-center text-[#9fb2c1]">
                {icon}
            </div>
            <div>
                <div className="text-sm text-[#9fb2c1]">{label}</div>
                <div className="text-2xl font-semibold text-[#19F124]">{value}</div>
            </div>
        </Panel>
    </motion.div>
);

export default function Contratos() {
    const qc = useQueryClient();
    const toast = useToast();
    const confirm = useConfirm();
    const { user } = useAuth();
    const isAdmin = !!user?.roles?.includes("ADMIN");
    const navigate = useNavigate();

    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState(null);
    const selectedId = selected?.id_persona ?? null;
    const [busyId, setBusyId] = useState(null);

    const [showFiltroMenu, setShowFiltroMenu] = useState(false);
    const filtroRef = useRef(null);

    const filtroLabels = {
        TODOS: "Todos",
        ACTIVO: "Activos",
        PROXIMO: "Próximos a vencer",
        FINALIZADO: "Finalizados",
    };
    const filtroLabelActual = filtroLabels[filtroEstado] || "Todos";

    useEffect(() => {
        if (!showFiltroMenu) return;
        const handleClickOutside = (e) => {
            if (filtroRef.current && !filtroRef.current.contains(e.target)) {
                setShowFiltroMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showFiltroMenu]);

    const {
        data: contratosAllData = {
            items: [],
            kpis: { total: 0, activos: 0, proximos: 0, finalizados: 0 },
        },
    } = useQuery({
        queryKey: ["contratos", "all"],
        enabled: isAdmin,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        queryFn: async () => {
            const { data } = await contratoService.getContratos();
            const items = Array.isArray(data) ? data : [];
            const total = items.length;
            const activos = items.filter((c) => isActiveContract(c)).length;
            const proximos = items.filter((c) => isUpcomingContract(c)).length;
            const finalizados = items.filter((c) => isFinishedContract(c)).length;
            const kpis = { total, activos, proximos, finalizados };
            return { items, kpis };
        },
    });

    const allContracts = contratosAllData.items;
    const kpis = contratosAllData.kpis;

    const { data: empleados = [], isLoading: loadingEmps } = useQuery({
        queryKey: ["empleados", q],
        queryFn: async () => {
            const { data } = await contratoService.getEmpleados(q, 1, 50);
            return Array.isArray(data) ? data : [];
        },
        placeholderData: keepPreviousData,
    });

    const { data: contratosPersona = [], isLoading: loadingItems } = useQuery({
        queryKey: ["contratos", "byPersona", selectedId],
        enabled: !!selectedId,
        queryFn: async () => {
            const { data } = await contratoService.getContratos(selectedId);
            return Array.isArray(data) ? data : [];
        },
    });

    const deleteContratoMutation = useMutation({
        mutationFn: (id_contrato_profesor) => contratoService.remove(id_contrato_profesor),
        onSuccess: (_, id) => {
            qc.invalidateQueries({ queryKey: ["contratos", "all"] });
            if (selectedId) {
                qc.setQueryData(["contratos", "byPersona", selectedId], (prev = []) =>
                    (prev || []).filter((x) => x.id_contrato_profesor !== id)
                );
            }
            toast.success("Contrato eliminado con éxito");
        },
        onError: (error) => {
            console.error(error);
            toast.error(error?.response?.data?.error || "No se pudo eliminar el contrato");
        },
    });

    const contratosFiltrados = useMemo(() => {
        if (!contratosPersona) return [];
        if (filtroEstado === "TODOS") return contratosPersona;
        return contratosPersona.filter((c) => getContratoEstado(c) === filtroEstado);
    }, [contratosPersona, filtroEstado]);

    const eliminar = async (row) => {
        if (!isAdmin) return;
        const ok = await confirm({
            title: "Eliminar contrato",
            description: `¿Estás seguro que deseas eliminar el contrato #${row.id_contrato_profesor}? Esta acción no se puede deshacer.`,
            confirmtext: "Eliminar",
            tone: "danger",
        });
        if (!ok) return;
        try {
            setBusyId(row.id_contrato_profesor);
            await deleteContratoMutation.mutateAsync(row.id_contrato_profesor);
        } catch (error) {
            console.error("Error al eliminar el contrato", error);
            toast.error("Error al eliminar el contrato");
        } finally {
            setBusyId(null);
        }
    };

    const exportar = async (row, format = "pdf") => {
        try {
            const { url, filename } = await contratoService.exportarContrato(
                row.id_contrato_profesor,
                format
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success("Contrato exportado con éxito");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo exportar el contrato");
        }
    };

    return (
        <motion.div
            className="p-6 space-y-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            <h1 className="ml-5 text-4xl font-medium text-white">
                Gestión de Contratos
            </h1>

            {isAdmin && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={<FiFileText />} label="Total Contratos" value={kpis.total} />
                    <StatCard
                        icon={<FiCheckCircle />}
                        label="Contratos Activos"
                        value={kpis.activos}
                    />
                    <StatCard icon={<FiClock />} label="Próximos" value={kpis.proximos} />
                    <StatCard
                        icon={<FiAlertCircle />}
                        label="Finalizados"
                        value={kpis.finalizados}
                    />
                </div>
            )}

            {/* Buscador + botón de filtro */}
            <div className="flex flex-row w-full gap-3">
                <Panel className="flex items-center w-full gap-3 p-3">
                    <div className="px-3 py-2 rounded-xl bg-[#101922] flex items-center gap-2 w-full">
                        <FiSearch className="text-[#9fb2c1]" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por nombre o DNI del empleado…"
                            className="w-full bg-transparent outline-none"
                        />
                    </div>
                </Panel>

                <div className="relative" ref={filtroRef}>
                    <button
                        type="button"
                        onClick={() => setShowFiltroMenu((v) => !v)}
                        className="flex items-center gap-2 h-full px-3 py-2 text-sm rounded-xl bg-[#101922] border border-[#1b2a37] hover:bg-[#1b2733] cursor-pointer transition-all"
                    >
                        <FiFilter className="text-[#9fb2c1]" size={18} />
                        <span className="text-[#e5f2ff]">{filtroLabelActual}</span>
                    </button>

                    <AnimatePresence>
                        {showFiltroMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 z-20 mt-2 w-56 rounded-xl bg-[#101922] transition-all border border-[#1b2a37] shadow-xl overflow-hidden"
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFiltroEstado("TODOS");
                                        setShowFiltroMenu(false);
                                    }}
                                    className={`flex transition-all w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#e5f2ff] hover:bg-[#1b2733] ${
                                        filtroEstado === "TODOS" ? "bg-[#1b2733]" : ""
                                    }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-[#9fb2c1]" />
                                    <span>Todos</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFiltroEstado("ACTIVO");
                                        setShowFiltroMenu(false);
                                    }}
                                    className={`flex transition-all cursor-pointer w-full items-center gap-2 px-3 py-2 text-sm text-[#e5f2ff] hover:bg-[#1b2733] ${
                                        filtroEstado === "ACTIVO" ? "bg-[#1b2733]" : ""
                                    }`}
                                >
                                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                                    <span>Activos</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFiltroEstado("PROXIMO");
                                        setShowFiltroMenu(false);
                                    }}
                                    className={`flex transition-all w-full items-center cursor-pointer gap-2 px-3 py-2 text-sm text-[#e5f2ff] hover:bg-[#1b2733] ${
                                        filtroEstado === "PROXIMO" ? "bg-[#1b2733]" : ""
                                    }`}
                                >
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                                    <span>Próximos a vencer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFiltroEstado("FINALIZADO");
                                        setShowFiltroMenu(false);
                                    }}
                                    className={`flex transition-all w-full items-center cursor-pointer gap-2 px-3 py-2 text-sm text-[#e5f2ff] hover:bg-[#1b2733] ${
                                        filtroEstado === "FINALIZADO" ? "bg-[#1b2733]" : ""
                                    }`}
                                >
                                    <span className="w-2 h-2 bg-red-400 rounded-full" />
                                    <span>Finalizados</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Panel className="p-0 xl:col-span-3 2xl:col-span-3">
                    <div className="p-4 border-b border-[#1b2a37] flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Empleados</h3>
                            <div className="text-xs text-[#9fb2c1]">
                                {(empleados || []).length} total
                            </div>
                        </div>
                    </div>
                    <div className="max-h-[480px] overflow-auto">
                        {loadingEmps && 
                            <div className="flex items-center justify-center min-h-[45vh]">
                                <LoadingState
                                    classNameContainer="min-h-0"
                                    classNameImg="w-25 h-25"
                                />
                            </div>
                        }
                        {!loadingEmps && empleados.length === 0 && (
                            <div className="p-4 opacity-70">No se encontraron empleados</div>
                        )}
                        <ul className="divide-y divide-[#1b2a37]">
                            {empleados.map((e, idx) => {
                                const active = selected?.id_persona === e.id_persona;
                                const isFirst = idx === 0;
                                const isLast = idx === empleados.length - 1;
                                return (
                                    <motion.li
                                        key={e.id_persona}
                                        onClick={() => setSelected(e)}
                                        className={`
                                            p-3 cursor-pointer hover:bg-[#101922] transition
                                            ${active ? "bg-[#101922]" : ""}
                                            ${isFirst ? "rounded-t-2xl" : ""}
                                            ${isLast ? "rounded-b-2xl" : ""}
                                        `}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        layout
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">
                                                    {e.apellido} {e.nombre}
                                                </div>
                                                <div className="text-xs text-[#9fb2c1]">
                                                    DNI: {e.dni}
                                                </div>
                                            </div>
                                            <div className="text-xs text-[#19F124]">
                                                Activos: {e.activos ?? 0}
                                            </div>
                                        </div>
                                    </motion.li>
                                );
                            })}
                        </ul>
                    </div>
                </Panel>

                {/* PANEL DERECHO CON ALTURA FIJA Y SCROLL INTERNO */}
                <div className="xl:col-span-9 2xl:col-span-9">
                    <div className="h-[445px] max-h-[445px]">
                        <AnimatePresence mode="wait">
                            {!selected ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    <Panel className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="mx-auto w-14 h-14 rounded-full bg-[#101922] flex items-center justify-center text-[#9fb2c1]">
                                                <FiFileText size={24} />
                                            </div>
                                            <h3 className="mt-3 text-lg font-semibold">
                                                Selecciona un empleado
                                            </h3>
                                            <p className="text-sm opacity-70">
                                                Elige una persona de la lista para ver sus contratos
                                            </p>
                                        </div>
                                    </Panel>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="detail"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    <Panel className="flex flex-col h-full">
                                        <div className="flex items-center justify-between p-4 border-b border-[#1b2a37]">
                                            <h3 className="font-semibold">
                                                Contratos de: {selected.apellido} {selected.nombre}
                                            </h3>
                                            {isAdmin && (
                                                <SolidBtn
                                                    onClick={() =>
                                                        navigate(
                                                            `/dashboard/contratos/nuevo/${selected.id_persona}`
                                                        )
                                                    }
                                                >
                                                    <span className="inline-flex items-center gap-2">
                                                        <FiPlus /> Nuevo Contrato
                                                    </span>
                                                </SolidBtn>
                                            )}
                                        </div>

                                        {loadingItems ? (
                                            <div className="flex items-center justify-center min-h-[45vh]">
                                                <LoadingState
                                                    classNameContainer="min-h-0"
                                                    classNameImg="w-30 h-30"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-1 overflow-auto [scrollbar-gutter:stable]">
                                                <table className="min-w-full text-sm">
                                                    <thead className="text-[#9fb2c1]">
                                                        <tr>
                                                            <th className="p-3 text-left">#</th>
                                                            <th className="p-3 text-left">Materias</th>
                                                            <th className="p-3 text-left">Período</th>
                                                            <th className="p-3 text-left">Horas (sem)</th>
                                                            <th className="p-3 text-left">Inicio</th>
                                                            <th className="p-3 text-left">Fin</th>
                                                            <th className="p-3 text-left">Estado</th>
                                                            <th className="p-3 text-right">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <AnimatePresence initial={false}>
                                                            {contratosFiltrados.map((r) => {
                                                                const etiquetas =
                                                                    Array.isArray(r.items) && r.items.length
                                                                        ? r.items.map((it) => {
                                                                            const base =
                                                                            it.tipo_item === "DOCENCIA"
                                                                                ? it.descripcion_materia
                                                                                : it.descripcion_actividad;
                                                                            const cargo = it.codigo_cargo || it.cargo;
                                                                            const perfil = it.perfil_codigo;
                                                                            const rolPart = cargo ? ` (${cargo})` : "";
                                                                            const perfilPart = perfil ? ` - ${perfil}` : "";
                                                                            return `${base || "Actividad"}${rolPart}${perfilPart}`;
                                                                        })
                                                                        : Array.isArray(r.materias) && r.materias.length
                                                                        ? r.materias.map((m) => {
                                                                            const rol = m.cargo ? ` (${m.cargo})` : "";
                                                                            return `${m.descripcion_materia}${rol}`;
                                                                        })
                                                                        : [];
                                                                const label =
                                                                    etiquetas.length > 1
                                                                        ? `${etiquetas[0]} +${
                                                                            etiquetas.length - 1
                                                                        }`
                                                                        : etiquetas[0] || "—";

                                                                const estado = getContratoEstado(r);
                                                                const estadoClasses =
                                                                    estado === "ACTIVO"
                                                                        ? "bg-green-500/10 text-green-400 border border-green-500/40"
                                                                        : estado === "PROXIMO"
                                                                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/40"
                                                                        : estado === "FINALIZADO"
                                                                        ? "bg-red-500/10 text-red-400 border border-red-500/40"
                                                                        : "bg-gray-500/10 text-gray-300 border border-gray-500/40";

                                                                return (
                                                                    <motion.tr
                                                                        key={r.id_contrato_profesor}
                                                                        className="border-t border-[#15202b]"
                                                                        initial={{ opacity: 0, y: 4 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -4 }}
                                                                        transition={{ duration: 0.18 }}
                                                                    >
                                                                        <td className="p-3">
                                                                            {r.id_contrato_profesor}
                                                                        </td>
                                                                        <td
                                                                            className="p-3"
                                                                            title={etiquetas.join(", ")}
                                                                        >
                                                                            {label}
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {r.periodo_descripcion ||
                                                                                r.nombre_periodo ||
                                                                                `Período ${
                                                                                    r.id_periodo ?? "-"
                                                                                }`}
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {r.horas_semanales}
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {fmt(r.fecha_inicio)}
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {fmt(r.fecha_fin)}
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <span
                                                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${estadoClasses}`}
                                                                            >
                                                                                {estado === "PROXIMO"
                                                                                    ? "Próximo a vencer"
                                                                                    : estado}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <OutlineBtn
                                                                                    onClick={() =>
                                                                                        exportar(r, "pdf")
                                                                                    }
                                                                                >
                                                                                    PDF
                                                                                </OutlineBtn>
                                                                                <OutlineBtn
                                                                                    onClick={() =>
                                                                                        exportar(r, "word")
                                                                                    }
                                                                                >
                                                                                    Word
                                                                                </OutlineBtn>
                                                                                {isAdmin && (
                                                                                    <MutedBtn
                                                                                        disabled={
                                                                                            busyId ===
                                                                                            r.id_contrato_profesor
                                                                                        }
                                                                                        onClick={() =>
                                                                                            eliminar(r)
                                                                                        }
                                                                                        title="Eliminar contrato"
                                                                                        aria-label={`Eliminar contrato ${r.id_contrato_profesor}`}
                                                                                        className={`p-2 ${
                                                                                            busyId ===
                                                                                            r.id_contrato_profesor
                                                                                                ? "opacity-50"
                                                                                                : ""
                                                                                        }`}
                                                                                    >
                                                                                        <FiTrash2 size={18} />
                                                                                    </MutedBtn>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </motion.tr>
                                                                );
                                                            })}
                                                        </AnimatePresence>

                                                        {!contratosFiltrados.length && !loadingItems && (
                                                            <tr>
                                                                <td className="p-4 opacity-70" colSpan={8}>
                                                                    Sin contratos
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </Panel>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            </motion.div>
    );
}
