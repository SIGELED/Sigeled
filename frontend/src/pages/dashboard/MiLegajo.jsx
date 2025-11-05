import { useEffect, useMemo, useState } from "react";
import { FiMail, FiPower, FiLayers, FiHash, FiCalendar, FiCreditCard } from "react-icons/fi";
import { BsPersonVcard } from "react-icons/bs";
import SegmentedTabs from "../../components/SegmentedTabs";
import PersonaDocumentos from "../../components/PersonaDocumentos";
import PersonaDomicilios from "../../components/PersonaDomicilios";
import PersonaTitulos from "../../components/PersonaTitulos";
import { personaService, identificationService, profileService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const TABS = { INFO: "info", DOCS: "docs", DOM: "dom", TIT: "tit" };

const ROLE_NAME = {
    "ADMIN": "Administrador",
    "RRHH": "Recursos Humanos",
    "ADMTVO": "Administrativo",
    "EMP": "Empleado"
}

export default function MiLegajo() {
    const { user: me } = useAuth();
    const [tab, setTab] = useState(TABS.INFO);
    const [usuario, setUsuario] = useState(null);

    const displayRoleName = (r) => {
        const code = String(r?.codigo ?? r ?? "").toUpperCase();
        const name = String(r?.nombre ?? r ?? "").trim();
        return ROLE_NAME[code];
    }

    const hasRole = (u, names = []) => {
        if (!u?.roles) return false;
        const targets = new Set(names.map(n => String(n).toUpperCase()));
        return u.roles.some((r) => {
            const code = String(typeof r === "string" ? r : (r?.codigo ?? "")).toUpperCase();
            const name = String(typeof r === "string" ? r : (r?.nombre ?? "")).toUpperCase();
            return targets.has(code) || targets.has(name);
        });
    };

    const isAdminOrRRHH = hasRole(usuario ?? me, ["ADMIN", "RRHH", "RECURSOS HUMANOS"]);

    const myPersonId = useMemo(() => me?.id_persona ?? me?.persona?.id_persona ?? null, [me]);
    const codeToName = (code) => {
        const C = String(code || "").toUpperCase();
        const map = { ADMIN: "Administrador", RRHH: "Recursos Humanos", "RECURSOS HUMANOS": "Recursos Humanos", USER: "Usuario" };
        return map[C] || (C.charAt(0) + C.slice(1).toLowerCase());
            };
            const normalizeRoles = (arr) => {
                if (!Array.isArray(arr)) return [];
                return arr.map((r) =>
                typeof r === "string"
                    ? { codigo: r, nombre: codeToName(r) }
                    : { codigo: r?.codigo ?? r?.nombre ?? "", nombre: r?.nombre ?? r?.codigo ?? "" }
                );
        };

    useEffect(() => {
        let ignore = false;
        (async () => {
        const base = me ?? {};
        let persona = base.persona || null;
        let identificaciones = [];
        let perfiles = base.perfiles || [];
        let roles = normalizeRoles(base.roles || []);

        const normalizeIdentificaciones = (arr) => {
            if (!Array.isArray(arr)) return [];
            const findNum = (rx) =>
            arr.find((x) => rx.test(String(x?.tipo || "")))?.numero ??
            arr.find((x) => x?.[rx.source.toLowerCase()])?.[rx.source.toLowerCase()] ??
            null;
            const dni = findNum(/DNI/i);
            const cuil = findNum(/CUIL/i);
            return [{ dni, cuil }];
        };

        try {
            if (myPersonId) {
            const results = await Promise.allSettled([
                personaService.getPersonaByID(myPersonId),
                identificationService.getIdentificaciones(myPersonId),
                profileService.getPersonaProfile(myPersonId),
            ]);

            if (results[0].status === "fulfilled") {
                persona = results[0].value.data ?? persona;
            }
            if (results[1].status === "fulfilled") {
                identificaciones = normalizeIdentificaciones(results[1].value.data);
            }
            if (results[2].status === "fulfilled") {
                perfiles = Array.isArray(results[2].value.data) ? results[2].value.data : perfiles;
            }
            }
        } catch (_) {
        }

        const view = {
            ...base,
            id_persona: base.id_persona ?? persona?.id_persona ?? myPersonId ?? null,
            persona,
            identificaciones,
            perfiles,
            roles,
        };
        if (!ignore) setUsuario(view);
        })();
        return () => { ignore = true; };
    }, [myPersonId, me]);

    if (!usuario) {
        return <div className="px-10 text-2xl text-white mt-7">Cargando mi legajo...</div>;
    }

    const persona = usuario.persona ?? {
        nombre: me?.nombre, apellido: me?.apellido, fecha_nacimiento: me?.fecha_nacimiento,
    };
    const isActive = (typeof usuario?.activo === "boolean") ? usuario.activo : true;


    return (
        <div className="text-white mt-7">
        <div className="flex items-center gap-4 px-10">
            <SegmentedTabs value={tab} onChange={setTab} tabs={TABS} />
        </div>

        <div className="px-10 mt-4">
            <h1 className="text-4xl font-medium">
            Mi Legajo —{" "}
            <span className="text-[#19F124] font-black">
                {persona?.nombre ?? ""} {persona?.apellido ?? ""}
            </span>
            </h1>
        </div>

        {tab === TABS.INFO && (
            <div className="grid grid-cols-1 gap-6 px-10 mt-5 lg:grid-cols-2">
            <div className="space-y-5">
                <section className="bg-[#101922] rounded-2xl p-5 mb-5 text-2xl">
                <h2 className="pb-2 pl-2 mb-4 text-3xl font-semibold border-b-2 border-[#19f12477] text-[#19F124]">
                    Datos de usuario
                </h2>
                <section className="grid grid-cols-2 pl-2 gap-y-5 gap-x-25">
                    <div className="flex items-center gap-3">
                    <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                        <FiMail className="text-[#4FC3F7]" size={30} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm opacity-70">Email</span>
                        <span className="text-bg">{usuario.email ?? me?.email}</span>
                    </div>
                    </div>

                    <div className="flex items-center gap-3">
                    <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                        <FiPower size={30} className={isActive ? "text-[#19F124]" : "text-[#FF5252]"} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm opacity-70">Estado</span>
                        <span className={ isActive ? "text-[#19F124] bg-[#173519] rounded-2xl px-4" : "text-[#FF5252]" }>
                            {isActive ? "Activo" : "Inactivo"}
                        </span>
                    </div>
                    </div>

                    <div className="flex items-center gap-3">
                    <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                        <FiLayers className="text-[#FFD54F]" size={30} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm opacity-70">Rol/es</span>
                        <span>
                            {usuario.roles?.length
                                ? usuario.roles.map(displayRoleName).join(", ")
                            : "—"}
                            </span>
                    </div>
                    </div>
                </section>
                </section>

                <section className="bg-[#101922] rounded-2xl p-5 text-2xl">
                <h2 className="pb-4 pl-4 mb-4 text-3xl font-semibold border-b-2 border-[#19f12477] text-[#19F124]">
                    Datos personales
                </h2>

                <section className="grid grid-cols-2 pl-2 gap-y-5 gap-x-25">
                    <div className="flex items-center gap-3">
                    <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                        <FiHash className="text-[#64B5F6]" size={30} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm opacity-70">Nombre</span>
                        <span>{persona?.nombre || "No especificado"}</span>
                    </div>
                    </div>

                    <div className="flex items-center gap-3">
                    <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                        <FiHash className="text-[#BA68C8]" size={30} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm opacity-70">Apellido</span>
                        <span>{persona?.apellido || "No especificado"}</span>
                    </div>
                    </div>

                    <div className="flex items-center gap-3">
                    <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                        <FiCalendar className="text-[#FFB74D]" size={30} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm opacity-70">Fecha de Nacimiento</span>
                        <span>
                        {persona?.fecha_nacimiento
                            ? new Date(persona.fecha_nacimiento).toLocaleDateString()
                            : "No especificado"}
                        </span>
                    </div>
                    </div>

                    {usuario.identificaciones?.[0]?.dni && (
                    <div className="flex items-center gap-3">
                        <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                        <FiCreditCard className="text-[#90CAF9]" size={30} />
                        </div>
                        <div className="flex flex-col">
                        <span className="text-sm opacity-70">DNI</span>
                        <span>{usuario.identificaciones[0].dni}</span>
                        </div>
                    </div>
                    )}
                    {usuario.identificaciones?.[0]?.cuil && (
                    <div className="flex items-center gap-3">
                        <div className="bg-[#212e3a] border border-[#283746] p-2 rounded-xl">
                        <BsPersonVcard className="text-[#81C784]" size={30} />
                        </div>
                        <div className="flex flex-col">
                        <span className="text-sm opacity-70">CUIL</span>
                        <span>{usuario.identificaciones[0].cuil}</span>
                        </div>
                    </div>
                    )}
                </section>
                </section>
            </div>

            <div className="space-y-5">
                <section className="relative bg-[#101922] rounded-2xl p-5 text-2xl">
                <h2 className="pb-4 pl-4 mb-4 text-3xl font-semibold border-b-2 border-[#19f12477] text-[#19F124]">
                    Mis perfiles
                </h2>

                <div className="space-y-2 text-2xl">
                    {usuario.perfiles?.length ? (
                    usuario.perfiles.map((p) => (
                        <div
                        key={p.id_perfil ?? p.nombre}
                        className="flex items-center gap-3 mb-4 font-semibold bg-[#10242a] p-4 border border-[#19f12423] rounded-xl"
                        >
                        <span>
                            <span className="text-[#19F124] mr-2">•</span> {p.nombre}
                        </span>
                        </div>
                    ))
                    ) : (
                    <p className="opacity-70">Sin perfiles asignados</p>
                    )}
                </div>
                </section>
            </div>
            </div>
        )}

        {tab === TABS.DOCS && (
            <div className="px-10 mt-6">
            <PersonaDocumentos
                idPersona={usuario.id_persona ?? me?.id_persona}
                asModal={false}
                showPersonaId={false}
                canDelete={isAdminOrRRHH}
                canChangeState={isAdminOrRRHH}
                onRequestDelete={async () => {
                    alert("Solicitud enviada para eliminar el documento. RRHH revisará tu pedido.");
                }}
            />
            </div>
        )}

        {tab === TABS.DOM && (
            <PersonaDomicilios
                idPersona={usuario.id_persona ?? me?.id_persona}
                asModal={false}
                showPersonaId={false}
                canDelete={isAdminOrRRHH}
                canCreate={true} 
                onRequestDelete={(dom) => alert(`Solicitud enviada para eliminar: ${dom.calle} ${dom.altura}`)}
            />
        )}

        {tab === TABS.TIT && (
            <div className="px-10 mt-6">
            <PersonaTitulos
                idPersona={usuario.id_persona ?? me?.id_persona}
                asModal={false}
                showPersonaId={false}
                canDelete={isAdminOrRRHH}
                canChangeState={isAdminOrRRHH}
                onRequestDelete={async () => {
                    alert("Solicitud enviada para eliminar el título. RRHH revisará tu pedido.");
                }}
            />
            </div>
        )}
        </div>
    );
}
