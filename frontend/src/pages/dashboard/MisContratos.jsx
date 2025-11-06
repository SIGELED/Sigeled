import { useCallback, useEffect, useMemo, useState } from "react";
import { contratoService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const Panel = ({ className = "", ...props }) => (
    <div className={`bg-[#0b1420] border border-[#1b2a37] rounded-2xl ${className}`} {...props} />
)

const OutlineBtn = ({ className = "", ...props }) => (
    <button
        className={`px-3 py-2 rounded-xl border border-[#19F124] text-[#19F124] hover:bg-[#19F124] hover:text-[#0D1520] cursor-pointer transition ${className}`}
        {...props}
    />
);

const fmt = (s) => {
    if(!s) return "-";
    const fecha = new Date(s);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
    };
    return fecha.toLocaleDateString(undefined, options);
};

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


export default function MisContratos(){
    const { user } = useAuth();
    const [contratos, setContratos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchContratos = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await contratoService.getMisContratos();
            setContratos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setContratos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContratos();
    }, [fetchContratos]);

    const exportar = async (row, format = "pdf") => {
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

    const kpis = useMemo(() => {
        const total = contratos.length;
        const activos = contratos.filter(isActive).length;
        const proximos = contratos.filter(isUpcoming).length;
        const finalizados = contratos.filter(isFinished).length;
        return { total, activos, proximos, finalizados };
    }, [contratos]);

    return(
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-[#19F124]">Mis Contratos</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={<FiFileText />} label="Total Contratos" value={kpis.total} />
                <StatCard icon={<FiCheckCircle />} label="Activos" value={kpis.activos} />
                <StatCard icon={<FiClock />} label="Próximos a vencer" value={kpis.proximos} />
                <StatCard icon={<FiAlertCircle />} label="Finalizados" value={kpis.finalizados} />
            </div>

            <Panel className="overflow-auto">
                {loading ? (
                    <div className="p-6 text-center opacity-70">Cargando contratos...</div>
                ) : contratos.length ? (
                    <table className="min-w-full text-sm">
                        <thead className="text-[#9fb2c1]">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Materia</th>
                                <th className="p-3 text-left">Periodo</th>
                                <th className="p-3 text-left">Horas (sem)</th>
                                <th className="p-3 text-left">Inicio</th>
                                <th className="p-3 text-left">Fin</th>
                                <th className="p-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contratos.map((r) => (
                                <tr key={r.id_contrato_profesor} className="border-t border-[#15202b]">
                                    <td className="p-3">{r.id_contrato_profesor}</td>
                                    <td className="p-3">{r.descripcion_materia ?? r.materia?.descripcion_materia}</td>
                                    <td className="p-3">{r.id_periodo}</td>
                                    <td className="p-3">{r.horas_semanales}</td>
                                    <td className="p-3">{fmt(r.fecha_inicio)}</td>
                                    <td className="p-3">{fmt(r.fecha_fin)}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <OutlineBtn onClick={() => exportar(r, "pdf")}>PDF</OutlineBtn>
                                            <OutlineBtn onClick={() => exportar(r, "word")}>WORD</OutlineBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-6 text-center opacity-70">No tenés contratos asignados</div>
                )}
            </Panel>
        </div>
    )
}