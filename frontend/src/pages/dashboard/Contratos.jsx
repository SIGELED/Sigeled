import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { contratoService } from '../../services/api';
import { useAuth } from "../../context/AuthContext";
import { IoClose } from "react-icons/io5";
import { FiPlus, FiSearch, FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ToastProvider";
import { useConfirm } from "../../components/ConfirmProvider";

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
const Field = ({ label, children, hint }) => (
    <div className="space-y-1">
        <label className="block text-sm opacity-80">{label}</label>
        {children}
        {hint && <p className="text-xs opacity-60">{hint}</p>}
    </div>
);

const fmt = (s) => {
    if (!s) return "-";
    const fecha = new Date(s);
    return fecha.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
};
const today = () => new Date();
const toDate = (s) => (s ? new Date(s) : null);
const isActive = (c) => {
    const ini = toDate(c.fecha_inicio);
    const fin = toDate(c.fecha_fin);
    const t = today();
    return ini && ini <= t && (!fin || fin >= t);
};
const isFinished = (c) => {
    const fin = toDate(c.fecha_fin);
    return !!fin && fin < today();
};
const isUpcoming = (c) => {
    const fin = toDate(c.fecha_fin);
    if (!fin) return false;
    const diff = (fin - today()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
};

const StatCard = ({ icon, label, value }) => (
    <Panel className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-[#101922] flex items-center justify-center text-[#9fb2c1]">
        {icon}
        </div>
        <div>
        <div className="text-sm text-[#9fb2c1]">{label}</div>
        <div className="text-2xl font-semibold text-[#19F124]">{value}</div>
        </div>
    </Panel>
);

export default function Contratos() {
    const qc = useQueryClient();
    const toast = useToast();
    const confirm = useConfirm();
    const { user } = useAuth();
    const isAdmin = !!user?.roles?.includes("ADMIN");

    const [q, setQ] = useState("");
    const [selected, setSelected] = useState(null);
    const selectedId = selected?.id_persona ?? null;

    const [showCreate, setShowCreate] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const [form, setForm] = useState({
        dni: "",
        id_persona: "",
        id_profesor: "",
        id_materias: [],
        id_periodo: 1,
        horas_semanales: "",
        horas_mensuales: "",
        monto_hora: "",
        fecha_inicio: "",
        fecha_fin: "",
        id_carrera: "",
        id_anio: "",
    });
    const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    useEffect(() => {
        if (form.horas_semanales) {
        const hm = Number(form.horas_semanales) * 4;
        onChange("horas_mensuales", String(hm));
        }
    }, [form.horas_semanales]);

    const { data: allContracts = [] } = useQuery({
        queryKey: ["contratos", "all"],
        queryFn: async () => {
        const { data } = await contratoService.getContratos(); 
        return Array.isArray(data) ? data : [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        enabled: isAdmin, 
    });

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

    const { data: carreras = [] } = useQuery({
        queryKey: ["carreras"],
        enabled: showCreate,
        queryFn: async () => {
        const { data } = await contratoService.getCarreras();
        return data ?? [];
        },
        staleTime: 30 * 60 * 1000,
    });

    const { data: anios = [] } = useQuery({
        queryKey: ["anios"],
        enabled: showCreate,
        queryFn: async () => {
        const { data } = await contratoService.getAnios();
        return data ?? [];
        },
        staleTime: 30 * 60 * 1000,
    });

    const { data: materias = [] } = useQuery({
        queryKey: ["materias", form.id_carrera, form.id_anio],
        enabled: showCreate && !!form.id_carrera && !!form.id_anio,
        queryFn: async () => {
        const { data } = await contratoService.getMateriasByCarreraAnio(form.id_carrera, form.id_anio);
        return Array.isArray(data) ? data : [];
        },
    });

    const createContratoMutation = useMutation({
        mutationFn: (payload) => contratoService.create(payload).then((r) => r.data),
        onSuccess: (nuevo) => {
        qc.invalidateQueries({ queryKey: ["contratos", "all"] });
        if (selectedId && nuevo?.id_persona === selectedId) {
            qc.invalidateQueries({ queryKey: ["contratos", "byPersona", selectedId] });
        }
        qc.invalidateQueries({ queryKey: ["empleados", q] });
        toast.success("Contrato creado con éxito");
        },
        onError: (error) => {
        console.error(error);
        const data = error?.response?.data;
        if (Array.isArray(data?.missingFields)) {
            toast.warning('Faltan campos requeridos:\n- ' + data.missingFields.join('\n- '));
        } else if (Array.isArray(data?.details)) {
            const lines = data.details.map(e => `${e.param || e.path || 'campo'}: ${e.msg || e.message || 'inválido'}`);
            toast.warning('Validación fallida:\n- ' + lines.join('\n- '));
        } else {
            toast.error(data?.error || data?.details || 'Error al crear contrato');
        }
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
            toast.error(error?.response?.data?.error || "No se pudo eliminar");
        },
    });

    const crearContrato = async (e) => {
        e.preventDefault();
        if (!isAdmin) return toast.warning("Sólo un administrador puede crear contratos");

        const required = ["id_persona", "id_profesor", "id_periodo", "horas_semanales", "monto_hora", "fecha_inicio", "fecha_fin"];
        const missing = required.filter((k) => !form[k]);
        if (!form.id_materias || form.id_materias.length === 0) missing.push("id_materias");
        if (missing.length) return toast.warning("Faltan campos requeridos: " + missing.join(", "));

        const payload = {
            id_persona: form.id_persona,
            id_profesor: form.id_profesor,
            id_materias: form.id_materias,
            id_periodo: Number(form.id_periodo),
            horas_semanales: Number(form.horas_semanales),
            horas_mensuales: form.horas_mensuales ? Number(form.horas_mensuales) : null,
            monto_hora: Number(form.monto_hora),
            fecha_inicio: form.fecha_inicio,
            fecha_fin: form.fecha_fin,
        };

        await createContratoMutation.mutateAsync(payload);

        setShowCreate(false);
        setForm((s) => ({
        ...s,
        id_materias: [],
        horas_semanales: "",
        horas_mensuales: "",
        monto_hora: "",
        fecha_inicio: "",
        fecha_fin: "",
        id_carrera: "",
        id_anio: "",
        id_periodo: 1,
        }));
    };

    const kpis = useMemo(() => {
        const total = allContracts.length;
        const activos = allContracts.filter(isActive).length;
        const proximos = allContracts.filter(isUpcoming).length;
        const finalizados = allContracts.filter(isFinished).length;
        return { total, activos, proximos, finalizados };
    }, [allContracts]);

    const eliminar = async (row) => {
        if (!isAdmin) return;
        const ok = await confirm({
            title: "Eliminar contrato",
            description: `¿Estás seguro que deseas eliminar el contrato #${row.id_contrato_profesor}? Esta acción no se puede deshacer.`,
            confirmtext: "Eliminar",
            tone: "danger"
        });
        if (!ok) return;
        try {
            setBusyId(row.id_contrato_profesor);
            await deleteContratoMutation.mutateAsync(row.id_contrato_profesor);
            toast.success("Titulo eliminado con éxito");
        } catch (error) {
            console.error("Error al eliminar el título", error);
            toast.error("Error al eliminar el título");
        } finally {
            setBusyId(null);
        }
    };

    const exportar = async (row, format = 'pdf') => {
        try {
            const { url, filename } = await contratoService.exportarContrato(row.id_contrato_profesor, format);
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
        <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#19F124]">Gestión de Contratos</h1>
        </div>

        {isAdmin && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={<FiFileText />} label="Total Contratos" value={kpis.total} />
            <StatCard icon={<FiCheckCircle />} label="Contratos Activos" value={kpis.activos} />
            <StatCard icon={<FiClock />} label="Próximos" value={kpis.proximos} />
            <StatCard icon={<FiAlertCircle />} label="Finalizados" value={kpis.finalizados} />
            </div>
        )}

        <Panel className="flex items-center gap-3 p-3">
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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <Panel className="p-0 xl:col-span-3 2xl:col-span-3">
            <div className="p-4 border-b border-[#1b2a37] flex items-center justify-between">
                <div>
                <h3 className="font-semibold">Empleados</h3>
                <div className="text-xs text-[#9fb2c1]">{(empleados || []).length} total</div>
                </div>
            </div>
            <div className="max-h-[480px] overflow-auto">
                {loadingEmps && <div className="p-4 opacity-70">Cargando…</div>}
                {!loadingEmps && empleados.length === 0 && (
                <div className="p-4 opacity-70">No se encontraron empleados</div>
                )}
                <ul className="divide-y divide-[#1b2a37]">
                {empleados.map((e) => {
                    const active = selected?.id_persona === e.id_persona;
                    return (
                    <li
                        key={e.id_persona}
                        onClick={() => setSelected(e)}
                        className={`p-3 cursor-pointer hover:bg-[#101922] transition ${active ? "bg-[#101922]" : ""}`}
                    >
                        <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">
                            {e.apellido} {e.nombre}
                            </div>
                            <div className="text-xs text-[#9fb2c1]">DNI: {e.dni}</div>
                        </div>
                        <div className="text-xs text-[#19F124]">Activos: {e.activos ?? 0}</div>
                        </div>
                    </li>
                    );
                })}
                </ul>
            </div>
            </Panel>

            <div className="xl:col-span-9 2xl:col-span-9">
            {!selected ? (
                <Panel className="h-[420px] flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-[#101922] flex items-center justify-center text-[#9fb2c1]">
                    <FiFileText size={24} />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold">Selecciona un empleado</h3>
                    <p className="text-sm opacity-70">Elige un profesor de la lista para ver sus contratos</p>
                </div>
                </Panel>
            ) : (
                <Panel className="overflow-auto">
                <div className="flex items-center justify-between p-4 border-b border-[#1b2a37]">
                    <h3 className="font-semibold">
                    Contratos de: {selected.apellido} {selected.nombre}
                    </h3>
                    {isAdmin && (
                    <SolidBtn
                        disabled={!!busyId}
                        onClick={async () => {
                        try {
                            setBusyId(true);
                            const { data: profDetalles } = await contratoService.getProfesorDetalles(selected.id_persona);
                            if (!profDetalles?.id_profesor) {
                            toast.error("Error: Esta persona no tiene un registro de 'profesor' asociado. No se puede crear contrato.");
                            setBusyId(null);
                            return;
                            }
                            setForm(prev => ({
                            ...prev,
                            dni: selected.dni,
                            id_persona: selected.id_persona,
                            id_profesor: profDetalles.id_profesor,
                            id_materias: [],
                            id_carrera: "",
                            id_anio: "",
                            id_periodo: 1,
                            horas_semanales: "",
                            horas_mensuales: "",
                            monto_hora: "",
                            fecha_inicio: "",
                            fecha_fin: "",
                            }));
                            setShowCreate(true);
                        } catch (err) {
                            console.error("Error al obtener detalles del profesor", err);
                            toast.error("No se pudo obtener el ID de profesor para esta persona.");
                        } finally {
                            setBusyId(null);
                        }
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                        {busyId ? "Cargando..." : (<><FiPlus /> Nuevo Contrato</>)}
                        </span>
                    </SolidBtn>
                    )}
                </div>

                {loadingItems ? (
                    <div className="p-4 opacity-70">Cargando contratos...</div>
                ) : (
                    <table className="min-w-full text-sm">
                    <thead className="text-[#9fb2c1]">
                        <tr>
                        <th className="p-3 text-left">#</th>
                        <th className="p-3 text-left">Materias</th>
                        <th className="p-3 text-left">Período</th>
                        <th className="p-3 text-left">Horas (sem)</th>
                        <th className="p-3 text-left">Inicio</th>
                        <th className="p-3 text-left">Fin</th>
                        <th className="p-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contratosPersona.map((r) => {
                        const etiquetas = Array.isArray(r.materias) && r.materias.length
                            ? r.materias.map(m => m.descripcion_materia)
                            : (r.descripcion_materia ? [r.descripcion_materia] : []);
                        const label = etiquetas.length > 1 ? `${etiquetas[0]} +${etiquetas.length - 1}` : (etiquetas[0] || "—");
                        return (
                            <tr key={r.id_contrato_profesor} className="border-t border-[#15202b]">
                            <td className="p-3">{r.id_contrato_profesor}</td>
                            <td className="p-3" title={etiquetas.join(", ")}>{label}</td>
                            <td className="p-3">{r.id_periodo}</td>
                            <td className="p-3">{r.horas_semanales}</td>
                            <td className="p-3">{fmt(r.fecha_inicio)}</td>
                            <td className="p-3">{fmt(r.fecha_fin)}</td>
                            <td className="p-3">
                                <div className="flex items-center justify-end gap-2">
                                <OutlineBtn onClick={() => exportar(r, "pdf")}>PDF</OutlineBtn>
                                <OutlineBtn onClick={() => exportar(r, "word")}>Word</OutlineBtn>
                                {isAdmin && (
                                    <MutedBtn
                                    disabled={busyId === r.id_contrato_profesor}
                                    onClick={() => eliminar(r)}
                                    title="Eliminar contrato"
                                    aria-label={`Eliminar contrato ${r.id_contrato_profesor}`}
                                    className={`p-2 ${busyId === r.id_contrato_profesor ? "opacity-50" : ""}`}
                                    >
                                    <FiTrash2 size={18} />
                                    </MutedBtn>
                                )}
                                </div>
                            </td>
                            </tr>
                        );
                        })}
                        {!contratosPersona.length && !loadingItems && (
                        <tr>
                            <td className="p-4 opacity-70" colSpan={7}>
                            Sin contratos
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                )}
                </Panel>
            )}
            </div>
        </div>

        {showCreate && (
            <div className="fixed inset-0 z-[80]">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowCreate(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-[#101922] rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[#19F124]">Nuevo contrato</h2>
                    <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-[#1A2430]">
                    <IoClose size={22} />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={crearContrato}>
                    <div className="p-3 rounded-lg bg-[#242E38]">
                    Creando contrato para: <strong className="text-[#19F124]">{selected.apellido} {selected.nombre}</strong> (DNI: {form.dni})
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                    <Field label="Profesor (id)">
                        <input
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.id_profesor}
                        onChange={(e) => onChange("id_profesor", e.target.value)}
                        placeholder="Pegar id_profesor"
                        />
                    </Field>

                    <Field label="Carrera">
                        <select
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.id_carrera}
                        onChange={(e) => onChange("id_carrera", e.target.value)}
                        >
                        <option value="">Seleccionar...</option>
                        {carreras.map(c => <option key={c.id_carrera} value={c.id_carrera}>{c.carrera_descripcion}</option>)}
                        </select>
                    </Field>

                    <Field label="Año">
                        <select
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.id_anio}
                        onChange={(e) => onChange("id_anio", e.target.value)}
                        >
                        <option value="">Seleccionar...</option>
                        {anios.map(a => <option key={a.id_anio} value={a.id_anio}>{a.descripcion}</option>)}
                        </select>
                    </Field>

                    <Field label="Materias">
                        <div className="max-h-40 overflow-auto rounded-lg border border-[#2B3642] p-2 space-y-1">
                        {materias.map(m => {
                            const id = String(m.id_materia);
                            const checked = form.id_materias.includes(id);
                            return (
                            <label key={m.id_materia} className="flex items-center gap-2 text-sm">
                                <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                    setForm(s => {
                                    const next = new Set(s.id_materias);
                                    e.target.checked ? next.add(id) : next.delete(id);
                                    return { ...s, id_materias: Array.from(next) };
                                    });
                                }}
                                />
                                <span>{m.descripcion_materia}</span>
                            </label>
                            );
                        })}
                        {!materias.length && <div className="text-xs opacity-70">Selecciona carrera y año</div>}
                        </div>
                    </Field>

                    <Field label="Período (1 o 2)">
                        <input
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.id_periodo}
                        onChange={(e) => onChange("id_periodo", e.target.value)}
                        required
                        />
                    </Field>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                    <Field label="Horas semanales">
                        <input
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.horas_semanales}
                        onChange={(e) => onChange("horas_semanales", e.target.value)}
                        required
                        />
                    </Field>
                    <Field label="Horas mensuales">
                        <input
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.horas_mensuales}
                        onChange={(e) => onChange("horas_mensuales", e.target.value)}
                        />
                    </Field>
                    <Field label="Monto por hora">
                        <input
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.monto_hora}
                        onChange={(e) => onChange("monto_hora", e.target.value)}
                        required
                        />
                    </Field>

                    <Field label="Fecha inicio *">
                        <input
                        type="date"
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.fecha_inicio}
                        onChange={(e) => onChange("fecha_inicio", e.target.value)}
                        required
                        />
                    </Field>
                    <Field label="Fecha fin *">
                        <input
                        type="date"
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.fecha_fin}
                        onChange={(e) => onChange("fecha_fin", e.target.value)}
                        required
                        />
                    </Field>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setShowCreate(false)}
                        className="px-4 py-2 rounded-xl border-2 border-[#2B3642] hover:bg-[#1A2430]"
                    >
                        Cancelar
                    </button>
                    <SolidBtn type="submit" disabled={createContratoMutation.isPending} className="disabled:opacity-50">
                        {createContratoMutation.isPending ? "Creando..." : "Crear contrato"}
                    </SolidBtn>
                    </div>
                </form>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}
