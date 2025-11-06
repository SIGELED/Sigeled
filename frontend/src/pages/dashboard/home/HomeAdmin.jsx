import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KpiCard, BentoPanel, QuickLinkButton } from "../../../components/HomeComponents";
import { FiUsers, FiClipboard, FiFileText, FiAlertOctagon } from 'react-icons/fi';
import { userService, contratoService, dashboardService } from "../../../services/api";

const toDate = (s) => (s ? new Date(s) : null);
const today = () => new Date();
const isActive = (c) => {
    const ini = toDate(c.fecha_inicio);
    const fin = toDate(c.fecha_fin);
    const t = today();
    return ini && ini <= t && (!fin || fin >= t);
}

export default function HomeAdmin() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ usuarios: 0, contratos:0, pendientes: 0 });
    const [documentosPendientes, setDocumentosPendientes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, pendientesRes] = await Promise.all([
                    dashboardService.getAdminStats(),
                    dashboardService.getDocumentosPendientes(5)
                ]);

                setStats({
                    usuarios: statsRes.data.totalusuarios || 0,
                    contratos: statsRes.data.contratosactivos || 0,
                    pendientes: statsRes.data.documentospendientes || 0
                });
                setDocumentosPendientes(pendientesRes.data || []);

            } catch (error) {
                console.error("Error al cargar datos del admin:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRevisarClick = (userId) => {
        navigate(`/dashboard/usuarios/${userId}`);
    };

    return(
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <KpiCard label="Usuarios Totales" value={loading ? '...' : stats.usuarios} icon={<FiUsers/>}/>
            <KpiCard label="Contratos Activos" value={loading ? '...' : stats.contratos} icon={<FiClipboard/>}/>
            <KpiCard label="Documentos Pendientes" value={loading ? '...' : stats.pendientes} icon={<FiAlertOctagon/>}/>

            <BentoPanel className="lg:col-span-2 p-4 space-y-3">
                <h2 className="text-lg font-semibold text-white">Pendientes de Revisión</h2>
                <div className="space-y-2">
                    {loading && <p className="text-gray-400">Cargando tareas...</p>}
                    {!loading && documentosPendientes.length === 0 && (
                        <p className="text-gray-400">No hay tareas pendientes.</p>
                    )}
                    {documentosPendientes.map(item => (
                        <div key={`${item.tipo_item}-${item.item_id}`} className="flex items-center justify-between p-2 bg-[#101922] rounded-md">
                            <div>
                                <span className="font-medium">{item.descripcion}</span>
                                <span className="text-sm text-gray-400 ml-2">de {item.nombre} {item.apellido}</span>
                            </div>
                            <button onClick={() => handleRevisarClick(item.id_persona)} className="text-sm text-[#19F124] hover:underline">
                                Revisar
                            </button>
                        </div>
                        
                    ))}
                </div>
            </BentoPanel>

            <BentoPanel className="lg:col-span-1 p-4 space-y-3">
                    <h2 className="text-lg font-semibold text-white">Administración</h2>
                    <QuickLinkButton label="Gestionar Usuarios" icon={<FiUsers/>} onClick={() => navigate('/dashboard/usuarios')} />
                    <QuickLinkButton label="Gestionar Contratos" icon={<FiFileText/>} onClick={() => navigate('/dashboard/contratos')} />
            </BentoPanel>
        </div>
    )
}