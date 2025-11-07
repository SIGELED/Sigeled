import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { notificacionService } from "../services/api";
import { FiInbox } from "react-icons/fi";

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " años";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " días";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min";
    return "Recién";
}

export default function DropdownNotificaciones({ onClose }) {
    const { notifications = [], setNotifications } = useAuth();
    const navigate = useNavigate();

    const markAsReadMutation = useMutation({
        mutationFn: async (id_notificacion) => {
        const res = await notificacionService.marcarComoLeido(id_notificacion);
        return res.data; // <- importante: devolvemos el objeto notificación actualizado
        },
        onSuccess: (updatedNotif) => {
        setNotifications(prev =>
            prev.map(n => n.id_notificacion === updatedNotif.id_notificacion ? updatedNotif : n)
        );
        }
    });

    const handleClick = (notif) => {
        if (!notif.leido) markAsReadMutation.mutate(notif.id_notificacion);
        if (notif.link) navigate(notif.link);
        onClose();
    };

    return (
        <div className="absolute top-16 right-9 w-80 max-w-sm bg-[#101922] border border-[#1b2a37] rounded-lg shadow-lg overflow-hidden">
        <div className="p-3 border-b border-[#1b2a37]">
            <h3 className="font-semibold text-white">Notificaciones</h3>
        </div>

        <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
                <FiInbox className="w-8 h-8 mx-auto mb-2" />
                No tienes notificaciones
            </div>
            ) : (
            <div className="divide-y divide-[#1b2a37]">
                {notifications.map((notif) => (
                <div
                    key={notif.id_notificacion}
                    onClick={() => handleClick(notif)}
                    className={`p-3 flex items-start gap-3 hover:bg-[#1A2430] cursor-pointer ${notif.leido ? 'opacity-60' : 'font-bold'}`}
                >
                    {!notif.leido && (
                    <div className="w-2 h-2 mt-1.5 bg-[#19F124] rounded-full shrink-0" />
                    )}
                    <div className={`flex-1 ${notif.leido ? 'pl-5' : ''}`}>
                    <p className="text-sm text-white">{notif.mensaje}</p>
                    {notif.observacion && (
                        <p className="mt-1 text-xs italic text-gray-400">"{notif.observacion}"</p>
                    )}
                    <p className="text-xs text-[#19F124] opacity-80 mt-1">
                        {timeAgo(notif.fecha_creacion)}
                    </p>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>

        <div className="p-2 text-center bg-[#0b1420] border-t border-[#1b2a37]">
            <button
            onClick={() => { navigate('/dashboard/notificaciones'); onClose(); }}
            className="text-sm font-medium text-[#19F124] hover:underline"
            >
            Ver todas
            </button>
        </div>
        </div>
    );
}
