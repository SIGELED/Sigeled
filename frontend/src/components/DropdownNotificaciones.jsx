import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { notificacionService } from "../services/api";
import React from "react";
import { FiInbox, FiInfo, FiCheck, FiAlertTriangle, FiXCircle } from "react-icons/fi";

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

const LEVEL = {
    info:    { text: "text-blue-400",   bg: "bg-blue-400",   ring: "ring-blue-900/50",  chip: "bg-blue-500/15 border-blue-500/40 text-blue-300",   Icon: FiInfo },
    success: { text: "text-green-400",  bg: "bg-green-400",  ring: "ring-green-400/30", chip: "bg-green-500/15 border-green-500/40 text-green-300", Icon: FiCheck },
    warning: { text: "text-yellow-400", bg: "bg-yellow-400", ring: "ring-yellow-400/30",chip: "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",Icon: FiAlertTriangle },
    error:   { text: "text-red-400",    bg: "bg-red-400",    ring: "ring-red-400/30",   chip: "bg-red-500/15 border-red-500/40 text-red-300",      Icon: FiXCircle },
};

const levelUi = (lvl) => LEVEL[(lvl || "info").toLowerCase()] ?? LEVEL.info;

export default function DropdownNotificaciones({ onClose }) {
    const { notifications = [], setNotifications } = useAuth();
    const navigate = useNavigate();

    const markAsReadMutation = useMutation({
        mutationFn: async (id_notificacion) => {
        const res = await notificacionService.marcarComoLeido(id_notificacion);
        return res.data;
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
                    className={`relative p-3 pl-4 flex items-start gap-3 cursor-pointer transition
                                hover:bg-[#1A2430] ${notif.leido ? 'opacity-70' : 'opacity-100'} 
                                ring-1 ${levelUi(notif.nivel).ring}`}
                    >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${levelUi(notif.nivel).bg}`} />
                    <div className="shrink-0 mt-0.5">
                        {React.createElement(levelUi(notif.nivel).Icon, { size: 18, className: levelUi(notif.nivel).text })}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                        <p className={`text-sm ${notif.leido ? 'text-gray-300' : 'text-white font-semibold'}`}>{notif.mensaje}</p>
                            {!notif.leido && <span className={`ml-2 mt-0.5 w-2 h-2 rounded-full ${levelUi(notif.nivel).bg}`} />}
                        </div>
                        {notif.observacion && (
                        <p className="mt-1 text-xs italic text-gray-400">"{notif.observacion}"</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                        {notif.tipo && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${levelUi(notif.nivel).chip}`}>
                            {notif.tipo}
                            </span>
                        )}
                        <span className="text-xs text-[#9ccfaa] opacity-80">{timeAgo(notif.fecha_creacion)}</span>
                        </div>
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
