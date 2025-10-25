import { useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import {
    domicilioService,
    domOtrosService,
    personaBarrioService,
} from "../services/api";

export default function PersonaDomicilios({
    idPersona,
    onClose,
    asModal = true,
    }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showWizard, setShowWizard] = useState(false);
    const [step, setStep] = useState(1);

    const [saving, setSaving] = useState(false);
    const [calle, setCalle] = useState("");
    const [altura, setAltura] = useState("");

    const [personaBarrios, setPersonaBarrios] = useState([]);
    const [selectedBarrioId, setSelectedBarrioId] = useState("");

    const [showCrearBarrio, setShowCrearBarrio] = useState(false);
    const [departamentos, setDepartamentos] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [id_depto, setIdDepto] = useState("");
    const [id_localidad, setIdLocalidad] = useState("");

    const [barrioNombre, setBarrioNombre] = useState("");
    const [barrioManzana, setBarrioManzana] = useState("");
    const [barrioCasa, setBarrioCasa] = useState("");
    const [barrioDepto, setBarrioDepto] = useState("");
    const [barrioPiso, setBarrioPiso] = useState("");

    useEffect(() => {
        const run = async () => {
        setLoading(true);
        try {
            const { data } = await domicilioService.getDomicilioByPersona(
            idPersona
            );
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("No se pudieron cargar domicilios,", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
        };
        run();
    }, [idPersona]);

    const loadPersonaBarrios = async () => {
        try {
        const { data } = await personaBarrioService.getBarrioByPersona(
            idPersona
        );
        setPersonaBarrios(Array.isArray(data) ? data : []);
        } catch (e) {
        console.error("Error al cargar barrios de la persona:", e);
        setPersonaBarrios([]);
        }
    };

    const openWizard = async () => {
        setShowWizard(true);
        setStep(1);
        setSelectedBarrioId("");
        await loadPersonaBarrios();
    };

    useEffect(() => {
        const loadDeptos = async () => {
        try {
            const { data } = await domOtrosService.getDepartamentos();
            setDepartamentos(data);
        } catch (error) {
            console.error("Error al cargar deptos:", error);
        }
        };
        loadDeptos();
    }, []);

    useEffect(() => {
        const loadLocalidades = async () => {
        setLocalidades([]);
        setIdLocalidad("");
        if (!id_depto) return;
        try {
            const { data } = await domOtrosService.getLocalidades(id_depto);
            setLocalidades(data);
        } catch (error) {
            console.error("Error al cargar localidades:", error);
        }
        };
        loadLocalidades();
    }, [id_depto]);

    const itemsOrdenados = useMemo(
        () =>
        [...items].sort((a, b) =>
            String(b.id_domicilio).localeCompare(String(a.id_domicilio))
        ),
        [items]
    );

    const resetWizard = () => {
        setStep(1);
        setSelectedBarrioId("");
        setShowCrearBarrio(false);
        setIdDepto("");
        setIdLocalidad("");
        setBarrioNombre("");
        setBarrioManzana("");
        setBarrioCasa("");
        setBarrioDepto("");
        setBarrioPiso("");
        setCalle("");
        setAltura("");
    };

    const handleCrearBarrio = async (e) => {
        e.preventDefault();
        if (!id_localidad) return alert("Seleccioná una localidad primero");
        if (!barrioNombre.trim()) return alert("Ingresá el nombre del barrio");

        try {
        const { data: nuevo } = await domOtrosService.createBarrio(
            id_localidad,
            {
            barrio: barrioNombre,
            manzana: barrioManzana || null,
            casa: barrioCasa || null,
            departamento: barrioDepto || null,
            piso: barrioPiso || null,
            }
        );

        await personaBarrioService.assignBarrio(idPersona, nuevo.id_dom_barrio);

        await loadPersonaBarrios();
        setSelectedBarrioId(String(nuevo.id_dom_barrio));

        setBarrioNombre("");
        setBarrioManzana("");
        setBarrioCasa("");
        setBarrioDepto("");
        setBarrioPiso("");
        setShowCrearBarrio(false);
        setIdDepto("");
        setIdLocalidad("");
        } catch (error) {
        console.error("Error al crear/vincular barrio:", error);
        alert("No se pudo crear el barrio");
        }
    };

    const handleCreateDomicilio = async (e) => {
        e.preventDefault();
        if (!selectedBarrioId) return alert("Primero seleccioná/creá un barrio");
        if (!calle || !altura) return alert("Completá calle y altura");

        try {
        setSaving(true);
        const payload = {
            calle,
            altura,
            id_dom_barrio: Number(selectedBarrioId),
        };

        const { data: nuevo } = await domicilioService.createDomicilio(
            idPersona,
            payload
        );
        setItems((prev) => [nuevo, ...prev]);

        resetWizard();
        setShowWizard(false);
        } catch (error) {
        console.error("Error al crear domicilio:", error);
        alert("No se pudo crear el domicilio");
        } finally {
        setSaving(false);
        }
    };

    const renderPanel = () => (
        <div className="w-full max-w-none rounded-2xl bg-[#101922] p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-semibold text-[#19F124]">Domicilios</h3>
            {onClose && asModal && (
            <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[#1A2430] cursor-pointer"
            >
                <IoClose size={22} />
            </button>
            )}
        </div>

        <div className="flex items-center justify-between mb-3">
            <p className="text-lg opacity-80">
            Persona: <span className="font-semibold">{idPersona}</span>
            </p>
            <button
            onClick={openWizard}
            className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-[#19F124] hover:bg-[#2af935] text-[#101922] transition"
            >
            Agregar domicilio +
            </button>
        </div>

        <div className="max-h-[50vh] overflow-auto pr-1">
            {loading ? (
            <p className="opacity-70">Cargando...</p>
            ) : itemsOrdenados.length === 0 ? (
            <p className="opacity-70">Sin domicilios</p>
            ) : (
            <ul className="space-y-2">
                {itemsOrdenados.map((d) => (
                <li
                    key={d.id_domicilio}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#0D1520]"
                >
                    <div className="flex-1">
                    <div className="font-semibold">
                        {d.calle} {d.altura}
                    </div>
                    <div className="text-sm opacity-80">
                        {d.barrio ? `${d.barrio}` : "Sin barrio"}
                        {d.barrio_manzana || d.barrio_casa || d.barrio_depto || d.barrio_piso ? " • " : ""}
                        {d.barrio_manzana ? `Mz ${d.barrio_manzana}` : ""}
                        {d.barrio_casa ? ` Casa ${d.barrio_casa}` : ""}
                        {d.barrio_depto ? ` Dpto ${d.barrio_depto}` : ""}
                        {d.barrio_piso ? ` Piso ${d.barrio_piso}` : ""}
                        {(d.localidad || d.departamento_admin) ? " • " : ""}
                        {d.localidad ? `${d.localidad}` : ""}
                        {d.departamento_admin ? ` • ${d.departamento_admin}` : ""}
                    </div>
                    </div>
                </li>
                ))}
            </ul>
            )}
        </div>
        
        {showWizard && (
            <div className="fixed inset-0 z-[80]">
            <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setShowWizard(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                className="w-full max-w-3xl bg-[#101922] rounded-2xl p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="flex items-start justify-between mb-4">
                    <h4 className="text-xl font-semibold text-[#19F124]">
                    {step === 1
                        ? "Paso 1: Seleccioná o creá un barrio"
                        : "Paso 2: Datos del domicilio"}
                    </h4>
                    <button
                    onClick={() => setShowWizard(false)}
                    className="p-1 rounded-lg hover:bg-[#1A2430]"
                    >
                    <IoClose size={22} />
                    </button>
                </div>

                <div className="flex gap-2 mb-6">
                    <span
                    className={`px-2 py-1 rounded-lg text-sm ${
                        step === 1
                        ? "bg-[#19F124] text-[#101922]"
                        : "bg-[#242E38]"
                    }`}
                    >
                    1. Barrio
                    </span>
                    <span
                    className={`px-2 py-1 rounded-lg text-sm ${
                        step === 2
                        ? "bg-[#19F124] text-[#101922]"
                        : "bg-[#242E38]"
                    }`}
                    >
                    2. Domicilio
                    </span>
                </div>

                {step === 1 && (
                    <div className="space-y-5">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold">
                            Barrios vinculados a esta persona
                        </h5>
                        <button
                            type="button"
                            onClick={() => setShowCrearBarrio((v) => !v)}
                            className="text-xs underline text-[#19F124]"
                        >
                            {showCrearBarrio
                            ? "Ocultar creación de barrio"
                            : "Crear nuevo barrio"}
                        </button>
                        </div>

                        {personaBarrios.length === 0 ? (
                        <p className="text-sm opacity-70">
                            Aún no hay barrios vinculados.
                        </p>
                        ) : (
                        <ul className="space-y-2">
                            {personaBarrios.map((b) => (
                            <li
                                key={b.id_dom_barrio}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#0D1520]"
                            >
                                <input
                                type="radio"
                                name="barrio_sel"
                                checked={
                                    String(b.id_dom_barrio) ===
                                    String(selectedBarrioId)
                                }
                                onChange={() =>
                                    setSelectedBarrioId(String(b.id_dom_barrio))
                                }
                                />
                                <div className="flex-1 text-sm">
                                <div className="font-semibold">
                                    Barrio: {b.barrio}
                                </div>
                                <div className="opacity-80">
                                    {b.manzana ? `Mz: ${b.manzana} ` : ""}
                                    {b.casa ? `Casa: ${b.casa} ` : ""}
                                    {b.departamento ? `Dpto: ${b.departamento} ` : ""}
                                    {b.piso ? `Piso: ${b.piso} ` : ""}
                                </div>
                                </div>
                            </li>
                            ))}
                        </ul>
                        )}
                    </div>

                    {showCrearBarrio && (
                        <form
                        className="grid grid-cols-2 gap-3 mt-3 text-sm"
                        onSubmit={handleCrearBarrio}
                        >
                        <div>
                            <label className="block mb-1 opacity-80">
                            Departamento
                            </label>
                            <select
                            value={id_depto}
                            onChange={(e) => setIdDepto(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            required
                            >
                            <option value="">Seleccionar...</option>
                            {departamentos.map((d) => (
                                <option
                                key={d.id_dom_departamento}
                                value={d.id_dom_departamento}
                                >
                                {d.departamento}
                                </option>
                            ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 opacity-80">
                            Localidad
                            </label>
                            <select
                            value={id_localidad}
                            onChange={(e) => setIdLocalidad(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            required
                            disabled={!id_depto}
                            >
                            <option value="">Seleccionar...</option>
                            {localidades.map((l) => (
                                <option
                                key={l.id_dom_localidad}
                                value={l.id_dom_localidad}
                                >
                                {l.localidad}
                                </option>
                            ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block mb-1 opacity-80">Barrio *</label>
                            <input
                            value={barrioNombre}
                            onChange={(e) => setBarrioNombre(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 opacity-80">Manzana</label>
                            <input
                            value={barrioManzana}
                            onChange={(e) => setBarrioManzana(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 opacity-80">Casa</label>
                            <input
                            value={barrioCasa}
                            onChange={(e) => setBarrioCasa(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 opacity-80">
                            Departamento (unidad)
                            </label>
                            <input
                            value={barrioDepto}
                            onChange={(e) => setBarrioDepto(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 opacity-80">Piso</label>
                            <input
                            value={barrioPiso}
                            onChange={(e) => setBarrioPiso(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            />
                        </div>

                        <div className="flex justify-end col-span-2 gap-2">
                            <button
                            type="button"
                            onClick={() => setShowCrearBarrio(false)}
                            className="px-3 py-2 rounded-xl border-2 border-[#2B3642] hover:bg-[#1A2430]"
                            >
                            Cancelar
                            </button>
                            <button
                            type="submit"
                            className="px-3 py-2 rounded-xl font-bold bg-[#19F124] text-[#101922]"
                            >
                            Crear y seleccionar
                            </button>
                        </div>
                        </form>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                        type="button"
                        onClick={() => setShowWizard(false)}
                        className="px-4 py-2 rounded-xl border-2 border-[#2B3642] hover:bg-[#1A2430]"
                        >
                        Cancelar
                        </button>
                        <button
                        type="button"
                        disabled={!selectedBarrioId}
                        onClick={() => setStep(2)}
                        className="px-4 py-2 rounded-xl font-bold bg-[#19F124] text-[#101922] disabled:opacity-50"
                        >
                        Continuar
                        </button>
                    </div>
                    </div>
                )}

                {step === 2 && (
                    <form className="space-y-4" onSubmit={handleCreateDomicilio}>
                    <div className="p-3 rounded-xl bg-[#0D1520] text-sm">
                        <div className="opacity-70">Barrio seleccionado:</div>
                        <div className="font-semibold">
                        {(() => {
                            const sel = personaBarrios.find(
                            (b) =>
                                String(b.id_dom_barrio) === String(selectedBarrioId)
                            );
                            return sel ? sel.barrio : selectedBarrioId;
                        })()}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                        <label className="block mb-1 text-sm opacity-80">
                            Calle
                        </label>
                        <input
                            value={calle}
                            onChange={(e) => setCalle(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            required
                        />
                        </div>
                        <div>
                        <label className="block mb-1 text-sm opacity-80">
                            Altura
                        </label>
                        <input
                            value={altura}
                            onChange={(e) => setAltura(e.target.value)}
                            className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                            required
                        />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-2 rounded-xl border-2 border-[#2B3642] hover:bg-[#1A2430]"
                        >
                        Volver
                        </button>
                        <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                            resetWizard();
                            setShowWizard(false);
                            }}
                            className="cursor-pointer px-4 py-2 rounded-xl border-2 border-[#2B3642] hover:bg-[#1A2430]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-[#19F124] text-[#101922] disabled:opacity-50"
                        >
                            {saving ? "Guardando..." : "Guardar domicilio"}
                        </button>
                        </div>
                    </div>
                    </form>
                )}
                </div>
            </div>
            </div>
        )}
        </div>
    );

    if (asModal) {
        return (
        <div className="fixed inset-0 z-[70]">
            <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
            />
            <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="w-full max-w-4xl">
                {renderPanel()}
            </div>
            </div>
        </div>
        );
    }

    return renderPanel();
}
