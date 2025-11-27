import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
    personaService,
    identificationService,
    legajoService,
} from "../../services/api";
import {
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiMapPin,
    FiShield,
} from "react-icons/fi";
import { AiOutlineIdcard } from "react-icons/ai";

const Panel = ({ className = "", ...props }) => (
    <div
        className={`bg-[#0b1420] border border-[#1b2a37] rounded-2xl ${className}`}
        {...props}
    />
);

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-1 text-sm">
        <span className="text-[#9fb2c1]">{label}</span>
        <span className="font-medium text-white text-right wrap-break-word max-w-[65%]">
        {value || "—"}
        </span>
    </div>
);

const Chip = ({ children, className = "" }) => (
    <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-white/15 bg-white/5 ${className}`}
    >
        {children}
    </span>
);

function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

function getInitials(user, persona) {
    const apellido = persona?.apellido || user?.apellido || "";
    const nombre = persona?.nombre || user?.nombre || "";
    const a = apellido?.[0] || "";
    const n = nombre?.[0] || "";
    const ini = (a + n).trim();
    return ini || "U";
}

function getIdentValue(items, type) {
    if (!Array.isArray(items)) return null;
    const upper = String(type).toUpperCase();

    for (const it of items) {
        if (upper === "DNI") {
        if (it.dni) return it.dni;
        if (it.tipo === "DNI" || it.codigo === "DNI" || it.nombre === "DNI") {
            return it.valor || it.numero || it.dni;
        }
        }
        if (upper === "CUIL") {
        if (it.cuil) return it.cuil;
        if (it.tipo === "CUIL" || it.codigo === "CUIL" || it.nombre === "CUIL") {
            return it.valor || it.numero || it.cuil;
        }
        }
    }
    return null;
}

export default function MiPerfil() {
    const { user } = useAuth();
    const id_persona = user?.id_persona;

    const {
        data: persona,
        isLoading: loadingPersona,
        error: errorPersona,
    } = useQuery({
        queryKey: ["persona", id_persona],
        enabled: !!id_persona,
        queryFn: async () => {
        const { data } = await personaService.getPersonaByID(id_persona);
        return data ?? null;
        },
    });

    const { data: identificaciones = [] } = useQuery({
        queryKey: ["identificaciones", id_persona],
        enabled: !!id_persona,
        queryFn: async () => {
        const { data } = await identificationService.getIdentificaciones(
            id_persona
        );
        return Array.isArray(data) ? data : [];
        },
    });

    const { data: legajoEstado } = useQuery({
        queryKey: ["legajo", "estado", id_persona],
        enabled: !!id_persona,
        queryFn: async () => {
        const { data } = await legajoService.getEstado(id_persona);
        return data ?? null;
        },
    });

    const dni =
        persona?.dni ||
        user?.dni ||
        getIdentValue(identificaciones, "DNI") ||
        null;

    const cuil =
        persona?.cuil ||
        user?.cuil ||
        getIdentValue(identificaciones, "CUIL") ||
        null;

    const email = user?.email || persona?.email || null;
    const telefono =
        persona?.telefono || persona?.tel || persona?.celular || null;
    const fechaNacimiento =
        formatDate(persona?.fecha_nacimiento || persona?.nacimiento) || null;
    const genero = persona?.genero || persona?.sexo || null;

    const roles = Array.isArray(user?.roles)
        ? user.roles.map((r) =>
            typeof r === "string" ? r : r?.nombre || r?.codigo || ""
        )
        : [];

    const perfiles = Array.isArray(user?.perfiles)
        ? user.perfiles.map((p) => p?.nombre || p)
        : [];

    const legajoLabel =
        legajoEstado?.nombre ||
        legajoEstado?.codigo ||
        legajoEstado?.estado ||
        null;
    const legajoCode = String(
        legajoEstado?.codigo || legajoEstado?.estado || ""
    ).toUpperCase();

    const legajoClasses =
        legajoCode === "COMPLETO"
        ? "bg-green-500/15 border-green-500/40 text-green-300"
        : legajoCode === "INCOMPLETO"
        ? "bg-red-500/15 border-red-500/40 text-red-300"
        : legajoCode === "OBSERVADO"
        ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-300"
        : "bg-gray-500/15 border-gray-500/40 text-gray-200";

    const nombreCompleto = `${persona?.apellido || user?.apellido || ""} ${
        persona?.nombre || user?.nombre || ""
    }`.trim();

    return (
        <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#19F124]/10 flex items-center justify-center text-2xl font-bold text-[#19F124] border border-[#19F124]/60">
                {getInitials(user, persona)}
            </div>
            <div>
                <h1 className="text-2xl font-semibold text-white">Mi Perfil</h1>
                <p className="text-sm text-[#9fb2c1]">
                Información personal y de cuenta vinculada a tu usuario.
                </p>
            </div>
            </div>

            {legajoLabel && (
            <div className="flex items-center gap-2">
                <FiShield className="text-[#19F124]" />
                <Chip className={legajoClasses}>
                Estado de legajo: {legajoLabel}
                </Chip>
            </div>
            )}
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {/* Datos personales */}
            <Panel className="p-5 xl:col-span-2">
            <div className="flex items-center gap-2 mb-4">
                <FiUser className="text-[#19F124]" />
                <h2 className="text-lg font-semibold text-white">
                Datos personales
                </h2>
            </div>

            {loadingPersona ? (
                <p className="text-sm text-[#9fb2c1]">Cargando datos...</p>
            ) : errorPersona ? (
                <p className="text-sm text-red-400">
                No se pudieron cargar los datos personales.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                    <InfoRow label="Nombre completo" value={nombreCompleto} />
                    <InfoRow
                    label="Nombre"
                    value={persona?.nombre || user?.nombre || null}
                    />
                    <InfoRow
                    label="Apellido"
                    value={persona?.apellido || user?.apellido || null}
                    />
                    <InfoRow label="DNI" value={dni} />
                    <InfoRow label="CUIL" value={cuil} />
                </div>

                <div className="space-y-1">
                    <InfoRow label="Fecha de nacimiento" value={fechaNacimiento} />
                    <InfoRow label="Género" value={genero} />
                    <InfoRow label="Teléfono" value={telefono} />
                    <InfoRow label="Correo electrónico" value={email} />
                    <InfoRow
                    label="Dirección"
                    value={
                        persona?.direccion ||
                        persona?.domicilio ||
                        persona?.direccion_completa ||
                        null
                    }
                    />
                </div>
                </div>
            )}
            </Panel>

            <Panel className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <AiOutlineIdcard className="text-[#19F124]" />
                <h2 className="text-lg font-semibold text-white">Cuenta</h2>
            </div>

            <div className="space-y-1">
                <InfoRow label="Email de acceso" value={email} />
            </div>

            <div className="mt-3 space-y-2">
                <div className="text-sm text-[#9fb2c1]">Roles del sistema</div>
                {roles.length === 0 ? (
                <p className="text-xs text-[#9fb2c1]">Sin roles asignados.</p>
                ) : (
                <div className="flex flex-wrap gap-2">
                    {roles.map(
                    (r, idx) =>
                        r && (
                        <Chip key={`rol-${idx}`} className="border-[#19F124]/50">
                            {r}
                        </Chip>
                        )
                    )}
                </div>
                )}
            </div>

            <div className="mt-3 space-y-2">
                <div className="text-sm text-[#9fb2c1]">Perfiles funcionales</div>
                {perfiles.length === 0 ? (
                <p className="text-xs text-[#9fb2c1]">Sin perfil asignado.</p>
                ) : (
                <div className="flex flex-wrap gap-2">
                    {perfiles.map((p, idx) => (
                    <Chip key={`perf-${idx}`}>{p}</Chip>
                    ))}
                </div>
                )}
            </div>

            <div className="mt-4 text-xs text-[#9fb2c1] flex items-center gap-2">
                <FiCalendar size={14} />
                <span>
                Estos datos se obtienen automáticamente del sistema de personas y
                tu usuario actual.
                </span>
            </div>
            </Panel>
        </div>
        </div>
    );    
}
