import { useEffect, useMemo, useState, useCallback } from "react";
import { contratoService } from '../../services/api';
import { useAuth } from "../../context/AuthContext";
import {IoClose} from "react-icons/io5";
import { FiPlus, FiSearch, FiFileText, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi"

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
        className={`px-3 py-2 rounded-xl bg-[#1a2735] text-red-400 hover:bg-[#233448] cursor-pointer transition ${className}`}
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

const today = () => new Date();
const toDate = (s) => (s ? new Date(s) : null);
const isActive = (c) => {
    const ini = toDate(c.fecha_inicio);
    const fin = toDate(c.fecha_fin);
    const t = today();
    return ini && ini <= t && (!fin || fin >= t);
}
const isFinished = (c) => {
    const fin = toDate(c.fecha_fin);
    return !!fin && fin < today();
};
const isUpcoming = (c) => {
    const fin = toDate(c.fecha_fin);
    if (!fin) return false;
    const diff = (fin - today()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30; // vence en 30 días
};
const fmt = (s) => (s ? String(s).slice(0, 10) : "-");

// --- small card ---
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
    const { user } = useAuth();
    const isAdmin = !!user?.roles?.includes("ADMIN");

    const [ allContracts, setAllContracts ] = useState([]);
    const [ loadingAll, setLoadingAll ] = useState(true);

    const [q, setQ] = useState("");
    const [empleados, setEmpleados] = useState([]);
    const [loadingEmps, setLoadingEmps] = useState(true);

    const [carreras, setCarreras] = useState([]);
    const [anios, setAnios] = useState([]);

    const [selected, setSelected] = useState(null);
    const [loadingItems, setLoadingItems] = useState(false);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        dni: "",
        id_persona: "",
        id_profesor: "",
        id_materia: "",
        id_periodo: 1,
        horas_semanales: "",
        horas_mensuales: "",
        monto_hora: "",
        fecha_inicio: "",
        fecha_fin: "",
        id_carrera: "",
        id_anio: "",
    });
    const [lookups, setLookups] = useState({
        persona: null,
        profesor: null,
        materias: [],
    });
    const [busyId, setBusyId] = useState(null);

    const fetchKPIs = useCallback(async () => {
        setLoadingAll(true);
        try {
            const { data } = await contratoService.getContratos();
            setAllContracts(Array.isArray(data) ? data : []);
        } catch {
            setAllContracts([]);
        } finally {
            setLoadingAll(false);
        }
    }, []);

    const fetchEmpleados = useCallback(async () => {
        setLoadingEmps(true);
        try {
            const { data } = await contratoService.getEmpleados(q, 1, 50);
            setEmpleados(Array.isArray(data) ? data : []);
        } catch {
            setEmpleados([]);
        } finally {
            setLoadingEmps(false);
        }
    }, [q]);

    const fetchContratosByPersona = useCallback(
        async (id_persona) => {
            if(!id_persona) return;
            setLoadingItems(true);
            try {
                const { data } = await contratoService.getContratos(id_persona);
                setItems(Array.isArray(data) ? data : []);
            } catch {
                setItems([]);
            } finally {
                setLoadingItems(false);
            }
        },
        []
    );

    useEffect(() => { 
        fetchKPIs();
        fetchEmpleados();
    }, [fetchKPIs, fetchEmpleados]);

    useEffect(() => {
        if(selected?.id_persona) {
            fetchContratosByPersona(selected.id_persona);
        } else {
            setItems([]);
        }
    }, [selected, fetchContratosByPersona]);

    const kpis = useMemo(() => {
        const total = allContracts.length;
        const activos = allContracts.filter(isActive).length;
        const proximos = allContracts.filter(isUpcoming).length;
        const finalizados = allContracts.filter(isFinished).length;
        return { total, activos, proximos, finalizados };
    }, [allContracts]);

    const onChange = (k, v) => setForm((s) => ({...s, [k]:v}));

    const buscarPorDni = async() => {
        if(!form.dni?.trim()) return alert("Ingresá un DNI");
        try {
            const { data: persona } = await contratoService.buscarPersonaPorDni(form.dni.trim());
            onChange("id_persona", persona.id_persona);
            const { data: prof } = await contratoService.getProfesorDetalles(persona.id_persona);
            setLookups((s) => ({ ...s, persona, profesor: prof }));
            if(prof?.id_profesor) onChange("id_profesor", prof.id_profesor);
        } catch (error) {
            console.error(error);
            alert("No se encontró la persona/profesor para ese DNI");
        }
    };

    const cargarMaterias = async () => {
        if(!form.id_carrera || !form.id_anio) {
            return alert("Seleccioná carrera y año");
        }
        try {
            const { data } = await contratoService.getMateriasByCarreraAnio(
                form.id_carrera,
                form.id_anio
            );
            setLookups((s) => ({ ...s, materias: Array.isArray(data) ? data : [] }));
        } catch (error) {
            console.error(error);
            alert("No se pudieron cargar las materias")
        }
    };

    const crearContrato = async (e) => {
        e.preventDefault();
        if(!isAdmin) return alert("Sólo un administrador puede crear contratos");
        const required = [
            "id_persona", "id_profesor", "id_materia", "id_periodo", "horas_semanales", "monto_hora", "fecha_inicio", "fecha_fin"
        ];
        const missing = required.filter((k) => !form [k]);
        if (missing.length) {
            return alert("Faltan campos requeridos:" + missing.join(", "));
        }
        try {
            setCreating(true);
            const payload = {
                id_persona: form.id_persona,
                id_profesor: form.id_profesor,
                id_materia: form.id_materia,
                id_periodo: Number(form.id_periodo),
                horas_semanales: Number(form.horas_semanales),
                horas_mensuales: form.horas_mensuales ? Number(form.horas_mensuales) : null,
                monto_hora: Number(form.monto_hora),
                fecha_inicio: form.fecha_inicio,
                fecha_fin: form.fecha_fin,
            };
            const { data: nuevo } = await contratoService.create(payload);
            if(selected?.id_persona === payload.id_persona){
                setItems((prev) => [nuevo, ...prev]);
            }
            setAllContracts((prev) => [nuevo, ...prev]);
            setCreating(false);
            setShowCreate(false);
            setForm((s) => ({ ...s, id_materia:"", horas_semanales:"", monto_hora:"", fecha_inicio:"", fecha_fin: "" }));
            alert("Contrato creado");
        } catch (error) {
            console.error(error);
            setCreating(false);
            const message = error?.response?.data?.details || error?.response?.data?.error || "Error al crear contrato";
            alert(message);
        }
    };

    const eliminar = async (row) => {
        if(!isAdmin) return;
        const ok = confirm(`¿Eliminar el contrato #${row.id_contrato_profesor}?`);
        if(!ok) return;
        try {
            setBusyId(row.id_contrato_profesor);
            await contratoService.remove(row.id_contrato_profesor);
            setItems((prev) => prev.filter((x) => x.id_contrato_profesor !== row.id_contrato_profesor));
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.error || "No se pudo eliminar");
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
        } catch (error) {
            console.error(error);
            alert("No se pudo exportar el contrato");
        }
    };

    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        if(showCreate) {
            contratoService.getCarreras().then(({data}) => setCarreras(data ?? []));
            contratoService.getAnios().then(({data}) => setAnios(data ?? []));
        }
    }, [showCreate]);

    useEffect(() => {
        const { id_carrera, id_anio } = form;
        if(id_carrera && id_anio) {
            contratoService.getMateriasByCarreraAnio(id_carrera, id_anio)
                .then(({data}) => setLookups(s => ({...s, materias: Array.isArray(data)? data: []})))
                .catch(e => console.error(e));
        } else {
            setLookups(s => ({...s, materias: []}));
        }
    }, [form.id_carrera, form.id_anio])

    useEffect(() => {
        if(form.horas_semanales){
            const hm = Number(form.horas_semanales) * 4;
            onChange("horas_mensuales", String(hm));
        }
    }, [form.horas_semanales]);

    const Table = useMemo(() => {
        if (!selected) {
        return (
            <Panel className="h-[420px] flex items-center justify-center">
            <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-[#101922] flex items-center justify-center text-[#9fb2c1]">
                <FiFileText size={24} />
                </div>
                <h3 className="mt-3 text-lg font-semibold">Selecciona un empleado</h3>
                <p className="text-sm opacity-70">Elige un profesor de la lista para ver sus contratos</p>
            </div>
            </Panel>
        );
        }
        return (
        <Panel className="overflow-auto">
            <table className="min-w-full text-sm">
            <thead className="text-[#9fb2c1]">
                <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Materia</th>
                <th className="p-3 text-left">Período</th>
                <th className="p-3 text-left">Horas (sem)</th>
                <th className="p-3 text-left">Inicio</th>
                <th className="p-3 text-left">Fin</th>
                <th className="p-3 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {items.map((r) => (
                <tr key={r.id_contrato_profesor} className="border-t border-[#15202b]">
                    <td className="p-3">{r.id_contrato_profesor}</td>
                    <td className="p-3">{r.descripcion_materia ?? r.materia?.descripcion_materia}</td>
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
                        >
                            {busyId === r.id_contrato_profesor ? "Eliminando..." : "Eliminar"}
                        </MutedBtn>
                        )}
                    </div>
                    </td>
                </tr>
                ))}
                {!items.length && !loadingItems && (
                <tr>
                    <td className="p-4 opacity-70" colSpan={7}>
                    Sin contratos
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </Panel>
        );
    }, [items, selected, busyId, isAdmin, loadingItems]);

    return (
        <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#19F124]">Gestión de Contratos</h1>
            {isAdmin && (
            <SolidBtn onClick={() => setShowCreate(true)} className="mr-40">
                <span className="inline-flex items-center gap-2">
                <FiPlus /> Nuevo Contrato
                </span>
            </SolidBtn>
            )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={<FiFileText />} label="Total Contratos" value={kpis.total} />
            <StatCard icon={<FiCheckCircle />} label="Contratos Activos" value={kpis.activos} />
            <StatCard icon={<FiClock />} label="Próximos" value={kpis.proximos} />
            <StatCard icon={<FiAlertCircle />} label="Finalizados" value={kpis.finalizados} />
        </div>

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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Panel className="p-0 xl:col-span-1">
            <div className="p-4 border-b border-[#1b2a37] flex items-center justify-between">
                <div>
                <h3 className="font-semibold">Empleados</h3>
                <div className="text-xs text-[#9fb2c1]">{empleados.length} total</div>
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
                        className={`p-3 cursor-pointer hover:bg-[#101922] transition ${
                        active ? "bg-[#101922]" : ""
                        }`}
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

            <div className="xl:col-span-2">{loadingItems ? <Panel className="p-4">Cargando…</Panel> : Table}</div>
        </div>

        {showCreate && (
            <div className="fixed inset-0 z-[80]">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowCreate(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                className="w-full max-w-2xl bg-[#101922] rounded-2xl p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[#19F124]">Nuevo contrato</h2>
                    <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-[#1A2430]">
                    <IoClose size={22} />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={crearContrato}>
                    <div className="grid grid-cols-3 gap-3">
                    <Field label="DNI">
                        <input
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.dni}
                        onChange={(e) => onChange("dni", e.target.value)}
                        />
                    </Field>
                    <div className="flex items-end">
                        <OutlineBtn type="button" onClick={buscarPorDni} className="w-full">
                        Buscar persona
                        </OutlineBtn>
                    </div>
                    <Field label="Persona (id)">
                        <input
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        disabled
                        value={form.id_persona || ""}
                        />
                    </Field>
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
                        <select className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            value={form.id_anio}
                            onChange={(e) => onChange("id_anio", e.target.value)}
                        >
                            <option value="">Seleccionar...</option>
                            {anios.map(a => <option key={a.id_anio} value={a.id_anio}>{a.descripcion}</option>)}
                        </select>
                    </Field>

                    <Field label="Materia">
                        <select
                        className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                        value={form.id_materia}
                        onChange={(e) => onChange("id_materia", e.target.value)}
                        required
                        >
                        <option value="">Seleccionar...</option>
                        {lookups.materias.map((m) => (
                            <option key={m.id_materia} value={m.id_materia}>
                            {m.descripcion_materia}
                            </option>
                        ))}
                        </select>
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
                    <SolidBtn type="submit" disabled={creating} className="disabled:opacity-50">
                        {creating ? "Creando..." : "Crear contrato"}
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