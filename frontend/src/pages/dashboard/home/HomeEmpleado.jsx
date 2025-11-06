import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { contratoService, legajoService, personaDocService } from "../../../services/api";
import { KpiCard, BentoPanel, QuickLinkButton } from "../../../components/HomeComponents";
import { FiArchive, FiFileText, FiCheckCircle, FiAlertCircle, FiClock, FiList } from 'react-icons/fi';

const fmt = (s) => {
    if (!s) return "-";
        const fecha = new Date(s);
        return fecha.toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' });
};
const toDate = (s) => (s ? new Date(s) : null);
const today = () => new Date();
const isActive = (c) => {
    const ini = toDate(c.fecha_inicio);
    const fin = toDate(c.fecha_fin);
    const t = today();
    return ini && ini <= t && (!fin || fin >= t);
}

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
    const [stats, setStats] = useState({ activos: 0, vencimiento: '-', estadoLegajo:'Cargando...' });
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id_persona) return;
            try {
                setLoading(true);
                const { data: contratosData } = await contratoService.getMisContratos();
                const contratosActivos = contratosData.filter(isActive);
                const proximoVencimiento = contratosActivos.length
                    ? fmt(Math.min(...contratosActivos.map(c => toDate(c.fecha_fin))))
                    : '-';

                const { data: legajoData } = await legajoService.getEstado(user.id_persona);
                const { data: docData } = await personaDocService.listarDocumentos(user.id_persona);

                setStats({
                    activos: contratosActivos.length,
                    vencimiento: proximoVencimiento,
                    estadoLegajo: legajoData?.estado?.descripcion || 'No definido'
                });
                setDocumentos(docData.slice(0, 5));
            } catch (error) {
                console.error("Error al cargar datos del dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        if(user?.id_persona){
            fetchData();
        }
    }, [user?.id_persona]);

    return(
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <KpiCard label="Contratos activos" value={loading ? '...' : stats.activos}/>
            <KpiCard label="Próximo vencimiento" value={loading ? '...' : stats.vencimiento}/>
            <KpiCard label="Estado del Legajo" value={loading ? '...' : stats.estadoLegajo}/>

            <BentoPanel className="lg:col-span-2 p-4 space-y-3">
                <h2 className="text-lg font-semibold text-white">Estado de Documentos</h2>
                <div className="space-y-2">
                    {loading && <p className="text-gray-400">Cargando documentos...</p>}
                    {!loading && documentos.length === 0 && (
                        <p className="text-gray-400">No hay documentos cargados.</p>
                    )}
                    {documentos.map(doc => (
                        <div key={doc.id_persona_doc} className="flex items-center justify-between p-2 bg-[#101922] rounded-md">
                            <span className="truncate">{doc.tipo_documento?.descripcion || 'Documento'}</span>
                            <div className="flex items-center gap-2 text-sm">
                                {getStatusIcon(doc.id_estado_verificacion)}
                                <span className="w-20 text-right">{doc.estado_verificacion?.descripcion}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </BentoPanel>

            <BentoPanel className="lg:col-span-1 p-4 space-y-3">
                <h2 className="text-lg font-semibold text-white">Accesos Rápidos</h2>
                <QuickLinkButton
                    label="Ver Mi Legajo"
                    icon={<FiArchive/>}
                    onClick={() => navigate('/dashboard/legajo')}
                />
                <QuickLinkButton
                    label="Ver Mis Contratos"
                    icon={<FiFileText/>}
                    onClick={() => navigate('/dashboard/mis-contratos')}
                />
            </BentoPanel>
        </div>
    )
}