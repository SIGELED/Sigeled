import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { contratoService } from "../../services/api";
import LoadingState from "../../components/LoadingState";
import {
    FiBriefcase,
    FiDollarSign,
    FiLayers,
    FiTarget,
    FiBook,
} from "react-icons/fi";

const Panel = ({ className = "", ...props }) => (
    <div
        className={`bg-[#0b1420] border border-[#1b2a37] rounded-2xl ${className}`}
        {...props}
    />
);

const safeNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const esPerfilProfesor = (p) => {
    const nombre = String(p.perfil_nombre || p.nombre || "").toLowerCase();
    const codigo = String(p.perfil_codigo || p.codigo || "").toLowerCase();
    return nombre.includes("profesor") || codigo === "prof" || p.id_perfil === 1;
};

const esPerfilCoordinador = (p) => {
    const nombre = String(p.perfil_nombre || p.nombre || "").toLowerCase();
    const codigo = String(p.perfil_codigo || p.codigo || "").toLowerCase();
    return (
        nombre.includes("coordinador") || codigo === "coor" || p.id_perfil === 2
    );
};

const normalizeTarifas = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
        try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
        } catch {
        return [];
        }
    }
    return [];
};

export default function Cargos() {
    const { user } = useAuth();

    const idPersona =
        user?.id_persona ||
        user?.persona?.id_persona ||
        user?.persona_id ||
        user?.personaId ||
        null;

    const {
        data: perfilesTarifas = [],
        isLoading: loadingCargos,
        isError: errorCargos,
        error: cargosError,
    } = useQuery({
        queryKey: ["tarifas-persona", idPersona],
        enabled: !!idPersona,
        queryFn: async () => {
        const { data } = await contratoService.getTarifasByPersona(idPersona);
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.perfiles)) return data.perfiles;
        return [];
        },
    });

    const {
        data: misContratos = [],
        isLoading: loadingContratos,
        isError: errorContratos,
        error: contratosError,
    } = useQuery({
        queryKey: ["mis-contratos"],
        enabled: !!idPersona,
        queryFn: async () => {
        const { data } = await contratoService.getMisContratos();
        return Array.isArray(data) ? data : [];
        },
    });

    const perfilesNormalizados = perfilesTarifas.map((p) => ({
        ...p,
        tarifas: normalizeTarifas(p.tarifas),
    }));

    const perfilesConCargos = perfilesNormalizados.filter((p) => {
        if (esPerfilProfesor(p)) return false;
        const tarifas = Array.isArray(p.tarifas) ? p.tarifas : [];
        return tarifas.length > 0;
    });

    const totalCargos = perfilesConCargos.reduce((acc, p) => {
        const tarifas = Array.isArray(p.tarifas) ? p.tarifas : [];
        return acc + tarifas.length;
    }, 0);

    const montos = perfilesConCargos
        .flatMap((p) => p.tarifas || [])
        .map((t) => Number(t.monto_hora))
        .filter((n) => !Number.isNaN(n));

    const montoPromedio = montos.length
        ? montos.reduce((a, b) => a + b, 0) / montos.length
        : null;

    const carrerasCoordinadasSet = new Set();

    if (Array.isArray(misContratos)) {
        misContratos.forEach((c) => {
        const items = Array.isArray(c.items) ? c.items : [];
        items.forEach((it) => {
            const tipo = String(it.tipo_item || "").toUpperCase();
            const codCargo = String(it.codigo_cargo || "").toUpperCase();

            if (tipo === "COORDINACION" && codCargo === "COORDINADOR_CARRERA") {
            let carrera = it.descripcion_actividad || "";

            const match =
                carrera.match(/de la\s+(.+)/i) ||
                carrera.match(/de el\s+(.+)/i) ||
                carrera.match(/de\s+(.+)/i);

            if (match && match[1]) {
                carrera = match[1].trim();
            }

            if (carrera) {
                carrerasCoordinadasSet.add(carrera);
            }
            }
        });
        });
    }

    const carrerasCoordinadas = Array.from(carrerasCoordinadasSet);

    const loadingAll = loadingCargos || loadingContratos;

    return (
        <motion.div
        className="p-6 flex flex-col gap-5 h-[calc(100vh-2rem)] lg:h-[calc(100vh)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        >
        <div className="space-y-1 shrink-0">
            <h1 className="ml-5 text-4xl font-medium text-white">Mis Cargos</h1>
            <p className="ml-5 text-sm text-[#9fb2c1]">
            Resumen de tus cargos y tarifas por hora (excluyendo el perfil de
            profesor).
            </p>

            {!loadingAll && !errorCargos && !errorContratos && (
            <div className="flex flex-wrap gap-2 mt-2 ml-5 text-xs">
                <span className="px-3 py-1 rounded-full bg-[#101922] border border-[#1b2a37] text-[#9fb2c1]">
                Perfiles con cargos (sin profesor):{" "}
                <span className="font-semibold text-white">
                    {perfilesConCargos.length}
                </span>
                </span>
                <span className="px-3 py-1 rounded-full bg-[#101922] border border-[#1b2a37] text-[#9fb2c1]">
                Cargos totales:{" "}
                <span className="font-semibold text-white">{totalCargos}</span>
                </span>
                {montoPromedio != null && (
                <span className="px-3 py-1 rounded-full bg-[#101922] border border-[#1b2a37] text-[#9fb2c1]">
                    Promedio global $/hora:{" "}
                    <span className="font-semibold text-[#19F124]">
                    {montoPromedio.toFixed(2)}
                    </span>
                </span>
                )}
                {carrerasCoordinadas.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-[#101922] border border-[#1b2a37] text-[#9fb2c1] flex items-center gap-1">
                    <FiBook size={12} />
                    <span>
                    Carrera(s) coordinadas:{" "}
                    <span className="font-semibold text-white">
                        {carrerasCoordinadas.join(" · ")}
                    </span>
                    </span>
                </span>
                )}
            </div>
            )}
        </div>

        {loadingAll && (
            <Panel className="flex items-center justify-center flex-1">
            <LoadingState classNameContainer="min-h-0" classNameImg="w-28 h-28" />
            </Panel>
        )}

        {!loadingAll && (
            <Panel className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-[#1b2a37]">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <FiBriefcase className="text-[#FFD54F]" />
                Detalle de Cargos
                </h2>
            </div>

            {errorCargos && (
                <div className="flex items-center justify-center flex-1 px-4 text-sm text-center text-red-400">
                No se pudieron cargar tus cargos.
                <br />
                {cargosError?.response?.data?.error || cargosError?.message}
                </div>
            )}

            {errorContratos && (
                <div className="flex items-center justify-center flex-1 px-4 text-xs text-center text-yellow-400">
                No se pudieron cargar tus contratos para determinar carreras
                coordinadas.
                <br />
                {contratosError?.response?.data?.error || contratosError?.message}
                </div>
            )}

            {!errorCargos && !totalCargos ? (
                <div className="flex items-center justify-center flex-1 px-4 text-sm text-center opacity-70">
                No tenés cargos asignados (distintos de profesor).
                </div>
            ) : (
                !errorCargos && (
                <div className="flex-1 overflow-auto [scrollbar-gutter:stable] p-3 space-y-3">
                    {perfilesConCargos.map((perfil, idxPerfil) => {
                    const tarifas = Array.isArray(perfil.tarifas)
                        ? perfil.tarifas
                        : [];
                    if (!tarifas.length) return null;

                    const nombrePerfil =
                        perfil.perfil_nombre ||
                        perfil.perfil_codigo ||
                        "Perfil sin nombre";

                    const esCoordinadorPerfil = esPerfilCoordinador(perfil);

                    return (
                        <Panel
                        key={perfil.id_perfil ?? idxPerfil}
                        className="p-3 bg-[#101922] border-[#1b2a37]"
                        >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#0b1420] border border-[#243447]">
                                <FiLayers size={14} className="text-[#4FC3F7]" />
                            </div>
                            <h3 className="text-sm font-semibold text-white">
                                {nombrePerfil}
                            </h3>
                            </div>
                            <span className="text-[0.7rem] text-[#d0e1f2]">
                            {tarifas.length} cargo(s)
                            </span>
                        </div>

                        {esCoordinadorPerfil &&
                            carrerasCoordinadas.length > 0 && (
                            <div className="mt-1 mb-2 text-[0.7rem] text-[#d0e1f2] flex items-center gap-1.5">
                                <FiBook size={11} />
                                <span>
                                Carrera(s) que coordinás:{" "}
                                <span className="text-white">
                                    {carrerasCoordinadas.join(" · ")}
                                </span>
                                </span>
                            </div>
                            )}

                        <div className="mt-2 text-[0.72rem] text-[#e3edf7] space-y-1.5">
                            {tarifas.map((t, idxT) => {
                            const key = t.id_tarifa ?? idxT;
                            const montoHoraTarifa = safeNumber(t.monto_hora);

                            return (
                                <motion.div
                                key={key}
                                className="pt-2 border-t border-[#2a3a4a] first:pt-0 first:border-t-0 px-2 py-2 -mx-2 rounded-xl hover:bg-[#0b1420]/80"
                                initial={{ opacity: 0, y: 2 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.2,
                                    delay: idxT * 0.02,
                                }}
                                whileHover={{ y: -1, scale: 1.005 }}
                                >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                    <FiBriefcase
                                        size={13}
                                        className="text-[#FFE082]"
                                    />
                                    <span className="font-semibold text-white">
                                        {t.descripcion || "Cargo sin descripción"}
                                    </span>
                                    </div>
                                    {t.codigo_cargo && (
                                    <span className="text-[0.65rem] text-[#e3edf7]">
                                        Código:{" "}
                                        <span className="font-mono text-white">
                                        {t.codigo_cargo}
                                        </span>
                                    </span>
                                    )}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-3 text-[0.7rem]">
                                    <span className="flex items-center gap-1.5">
                                    <FiTarget size={11} />
                                    <span>
                                        Aplica a:{" "}
                                        <span className="text-white">
                                        {t.aplica_materias
                                            ? "Materias / Docencia"
                                            : "Otras actividades"}
                                        </span>
                                    </span>
                                    </span>

                                    {montoHoraTarifa != null && (
                                    <span className="flex items-center gap-1.5">
                                        <FiDollarSign size={11} />
                                        <span>
                                        Monto / hora:{" "}
                                        <span className="text-[#19F124] font-semibold">
                                            $ {montoHoraTarifa.toFixed(2)}
                                        </span>
                                        </span>
                                    </span>
                                    )}
                                </div>

                                {t.observaciones && (
                                    <p className="mt-1 text-[0.65rem] text-[#d0e1f2]/90">
                                    {t.observaciones}
                                    </p>
                                )}
                                </motion.div>
                            );
                            })}
                        </div>
                        </Panel>
                    );
                    })}
                </div>
                )
            )}
            </Panel>
        )}
        </motion.div>
    );
}
