import { useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { domicilioService, domOtrosService } from "../services/api";

export default function PersonaDomicilios({idPersona, onClose}) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [calle, setCalle] = useState('');
    const [altura, setAltura] = useState('');
    const [departamentos, setDepartamentos] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [barrios, setBarrios] = useState([]);

    const [id_depto, setIdDepto] = useState('');
    const [id_localidad, setIdLocalidad] = useState('');
    const [id_barrio, setIdBarrio] = useState('');

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const { data } = await domicilioService.getDomicilioByPersona(idPersona);
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

    useEffect(() => {
        const loadDeptos = async () => {
            try {
                const { data } = await domOtrosService.getDepartamentos();
                setDepartamentos(data);
            } catch (error) {
                console.error('Error al cargar deptos:', error);
            }
        };
        loadDeptos();
    }, []);

    useEffect(() => {
        const loadLocalidades = async () => {
            setLocalidades([]);
            setBarrios([]);
            setIdLocalidad('');
            setIdBarrio('');
            if(!id_depto) return;
            try {
                const { data } = await domOtrosService.getLocalidades(id_depto);
                setLocalidades(data);
            } catch (error) {
                console.error('Error al cargar localidades:', error);
            }
        };
        loadLocalidades();
    }, [id_depto]);

    useEffect(() => {
        const loadBarrios = async () => {
            setBarrios([]);
            setIdBarrio('');
            if(!id_localidad) return;
            try {
                const { data } = await domOtrosService.getBarrios(id_localidad);
                setBarrios(data);
            } catch (error) {
                console.error('Error al cargar barrios:', error);
            }
        };
        loadBarrios();
    }, [id_localidad]);

    const itemsOrdenados = useMemo(
        () => [...items].sort((a, b) => String(b.id_domicilio).localeCompare(String(a.id_domicilio))),
        [items]
    );

    const resetForm = () => {
        setCalle('');
        setAltura('');
        setIdDepto('');
        setIdLocalidad('');
        setIdBarrio('');
        setLocalidades([]);
        setBarrios([]);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if(!calle || !altura || !id_localidad){
            return alert('Completá calle, altura y localidad');
        }
        try {
            setSaving(true);
            const payload = {
                calle,
                altura,
                id_dom_barrio: id_barrio ? Number(id_barrio) : null,
            };

            const { data: nuevo } = await domicilioService.createDomicilio(idPersona, payload);
            setItems((prev) => [nuevo, ...prev]);
            resetForm();
            setShowNew(false);
        } catch (error) {
            console.error('Error al crear domicilio:', error);
            alert('No se pudo crear el domicilio');
        } finally {
            setSaving(false);
        }
    };

    return(
        <div className="fixed inset-0 z-[70]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose}/>
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className="w-full max-w-3xl rounded-2xl bg-[#101922] p-6 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-semibold text-[#19F124]">Domicilios</h3>
                        <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#1A2430] cursor-pointer">
                            <IoClose size={22}/>
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <p className="text-lg opacity-80">
                            Persona: <span className="font-semibold">{idPersona}</span>
                        </p>
                        <button onClick={() => setShowNew(true)} className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-[#19F124] hover:bg-[#2af935] text-[#101922] transition">
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
                                    <li key={d.id_domicilio} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#0D1520]">
                                        <div className="flex-1">
                                            <div className="font-semibold">
                                                {d.calle} {d.altura}
                                            </div>
                                            <div className="text-sm opacity-80">
                                                {d.barrio ? `${d.barrio} • ` : ''}
                                                {d.localidad ? `${d.localidad} • ` : ''}
                                                {d.departamento ?? ''}
                                                {d.codigo_postal ? ` (${d.codigo_postal})` : ''}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {showNew && (
                        <div className="fixed inset-0 z-[80]">
                            <div className="absolute inset-0 bg-black/60" onClick={() => setShowNew(false)}/>
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <div className="w-full max-w-lg bg-[#101922] rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-start justify-between mb-4">
                                        <h4 className="text-xl font-semibold text-[#19F124]"> Nuevo domicilio +</h4>
                                        <button onClick={() => setShowNew(false)} className="p-1 rounded-lg hover:bg-[#1A2430]">
                                            <IoClose size={22}/>
                                        </button>
                                    </div>

                                    <form className="space-y-4" onSubmit={handleCreate}>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-2">
                                                <label className="block mb-1 text-sm opacity-80">Calle</label>
                                                <input
                                                value={calle}
                                                onChange={(e) => setCalle(e.target.value)}
                                                className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                                required
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm opacity-80">Altura</label>
                                                <input
                                                value={altura}
                                                onChange={(e) => setAltura(e.target.value)}
                                                className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                                required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block mb-1 text-sm opacity-80">Departamento</label>
                                                <select
                                                    value={id_depto}
                                                    onChange={(e) => setIdDepto(e.target.value)}
                                                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                                    required
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {departamentos.map((d) => (
                                                    <option key={d.id_dom_departamento} value={d.id_dom_departamento}>
                                                        {d.departamento} {d.codigo_postal ? `(${d.codigo_postal})` : ''}
                                                    </option>
                                                    ))}
                                                </select>
                                        </div>

                                        <div>
                                            <label className="block mb-1 text-sm opacity-80">Localidad</label>
                                                <select
                                                    value={id_localidad}
                                                    onChange={(e) => setIdLocalidad(e.target.value)}
                                                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                                    required
                                                    disabled={!id_depto}
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {localidades.map((l) => (
                                                    <option key={l.id_dom_localidad} value={l.id_dom_localidad}>
                                                        {l.localidad}
                                                    </option>
                                                    ))}
                                                </select>
                                        </div>

                                        <div>
                                            <label className="block mb-1 text-sm opacity-80">Barrio (opcional)</label>
                                                <select
                                                    value={id_barrio}
                                                    onChange={(e) => setIdBarrio(e.target.value)}
                                                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl"
                                                    disabled={!id_localidad || barrios.length === 0}
                                                >
                                                    <option value="">Sin barrio</option>
                                                    {barrios.map((b) => (
                                                    <option key={b.id_dom_barrio} value={b.id_dom_barrio}>
                                                        {b.barrio}
                                                    </option>
                                                    ))}
                                                </select>
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowNew(false)}
                                                className="cursor-pointer px-4 py-2 rounded-xl border-2 border-[#2B3642] hover:bg-[#1A2430] transition"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-[#19F124] text-[#101922] disabled:opacity-50"
                                            >
                                                {saving ? 'Guardando...' : 'Guardar'}
                                            </button>
                                        </div>
                                    </form>
                                    </div>
                                </div>
                                </div>
                            )}
                            </div>
                        </div>
                        </div>
                    );
}