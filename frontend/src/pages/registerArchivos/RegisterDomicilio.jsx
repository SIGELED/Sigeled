import { useEffect, useState } from "react";
import { domOtrosService } from "../../services/api";

export default function RegisterDomicilio({ onSetDomicilio }) {
    const [departamentos, setDepartamentos] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [id_depto, setIdDepto] = useState("");
    const [id_localidad, setIdLocalidad] = useState("");

    const [usarBarrioNuevo, setUsarBarrioNuevo] = useState(false);
    const [selectedBarrioId, setSelectedBarrioId] = useState("");

    const [barrioNombre, setBarrioNombre] = useState("");
    const [barrioManzana, setBarrioManzana] = useState("");
    const [barrioCasa, setBarrioCasa] = useState("");
    const [barrioDepto, setBarrioDepto] = useState("");
    const [barrioPiso, setBarrioPiso] = useState("");

    const [calle, setCalle] = useState("");
    const [altura, setAltura] = useState("");

    useEffect(() => {
        const load = async () => {
        try {
            const { data } = await domOtrosService.getDepartamentos();
            setDepartamentos(Array.isArray(data) ? data : []);
        } catch {}
        };
        load();
    }, []);

    useEffect(() => {
        const loadLocs = async () => {
        setLocalidades([]);
        setIdLocalidad("");
        if (!id_depto) return;
        try {
            const { data } = await domOtrosService.getLocalidades(id_depto);
            setLocalidades(Array.isArray(data) ? data : []);
        } catch {}
        };
        loadLocs();
    }, [id_depto]);

    const confirmar = () => {
        if (!calle || !altura) return alert("Completá calle y altura.");
        if (usarBarrioNuevo && !id_localidad) return alert("Elegí una localidad para crear el barrio.");

        const payload = {
        calle,
        altura,
        id_dom_barrio: usarBarrioNuevo ? null : Number(selectedBarrioId),
        barrioNuevo: usarBarrioNuevo ? {
            id_dom_localidad: Number(id_localidad),
            barrio: barrioNombre,
            manzana: barrioManzana || null,
            casa: barrioCasa || null,
            departamento: barrioDepto || null,
            piso: barrioPiso || null
        } : null
        };
        onSetDomicilio?.(payload);
        alert("Domicilio preparado para enviar en la transacción.");
    };

    return (
        <div className="w-full bg-[#101922] rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-semibold text-[#19F124] mb-4">Domicilio</h3>

        <div className="grid grid-cols-2 gap-3">
            <div>
            <label className="block mb-1 text-sm opacity-80">Departamento</label>
            <select value={id_depto} onChange={(e) => setIdDepto(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl">
                <option value="">Seleccionar…</option>
                {departamentos.map((d) => (
                <option key={d.id_dom_departamento} value={d.id_dom_departamento}>{d.departamento}</option>
                ))}
            </select>
            </div>

            <div>
            <label className="block mb-1 text-sm opacity-80">Localidad</label>
            <select value={id_localidad} onChange={(e) => setIdLocalidad(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" disabled={!id_depto}>
                <option value="">Seleccionar…</option>
                {localidades.map((l) => (
                <option key={l.id_dom_localidad} value={l.id_dom_localidad}>{l.localidad}</option>
                ))}
            </select>
            </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
            <input type="checkbox" id="crear_barrio" checked={usarBarrioNuevo}
                onChange={(e) => setUsarBarrioNuevo(e.target.checked)} />
            <label htmlFor="crear_barrio">Crear un barrio nuevo (en la transacción)</label>
        </div>

        {!usarBarrioNuevo ? (
            <div className="mt-3">
            <label className="block mb-1 text-sm opacity-80">ID Barrio existente</label>
            <input value={selectedBarrioId} onChange={(e)=>setSelectedBarrioId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" placeholder="Ej: 56" />
            <p className="mt-1 text-sm opacity-70">Si no sabés el ID, marcá “crear barrio nuevo”.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="col-span-2">
                <label className="block mb-1 text-sm opacity-80">Barrio *</label>
                <input value={barrioNombre} onChange={(e) => setBarrioNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" />
            </div>
            <div><label className="block mb-1 text-sm opacity-80">Manzana</label>
                <input value={barrioManzana} onChange={(e) => setBarrioManzana(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" /></div>
            <div><label className="block mb-1 text-sm opacity-80">Casa</label>
                <input value={barrioCasa} onChange={(e) => setBarrioCasa(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" /></div>
            <div><label className="block mb-1 text-sm opacity-80">Departamento (unidad)</label>
                <input value={barrioDepto} onChange={(e) => setBarrioDepto(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" /></div>
            <div><label className="block mb-1 text-sm opacity-80">Piso</label>
                <input value={barrioPiso} onChange={(e) => setBarrioPiso(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" /></div>
            </div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="col-span-2">
            <label className="block mb-1 text-sm opacity-80">Calle</label>
            <input value={calle} onChange={(e) => setCalle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" />
            </div>
            <div>
            <label className="block mb-1 text-sm opacity-80">Altura</label>
            <input value={altura} onChange={(e) => setAltura(e.target.value)}
                    className="w-full px-3 py-2 bg-[#242E38] rounded-xl" />
            </div>
        </div>

        <div className="flex justify-end mt-4">
            <button type="button" onClick={confirmar}
                    className="px-4 py-2 rounded-xl font-bold bg-[#19F124] text-[#101922]">
            Usar este domicilio
            </button>
        </div>

        <p className="mt-3 text-sm opacity-70">Todo se guarda recién al presionar “Finalizar”.</p>
        </div>
    );
}
