import { useEffect, useState } from "react";
import { domOtrosService } from "../../services/api";

export default function RegisterDomicilio({ onSetDomicilio, onNext, onBack }) {
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

    useEffect(() => { (async () => {
        const { data } = await domOtrosService.getDepartamentos();
        setDepartamentos(Array.isArray(data) ? data : []);
    })(); }, []);

    useEffect(() => { (async () => {
        setLocalidades([]); setIdLocalidad("");
        if (!id_depto) return;
        const { data } = await domOtrosService.getLocalidades(id_depto);
        setLocalidades(Array.isArray(data) ? data : []);
    })(); }, [id_depto]);

    const confirmar = () => {
        if (!calle || !altura) return alert("Completá calle y altura.");
        if (usarBarrioNuevo && !id_localidad) return alert("Elegí una localidad para crear el barrio.");

        const payload = {
        calle, altura,
        id_dom_barrio: usarBarrioNuevo ? null : Number(selectedBarrioId || 0) || null,
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
        onNext?.();
    };

    return (
        <div className="w-full bg-[#101922] rounded-2xl p-6 text-white">
            <h3 className="text-2xl font-semibold text-[#19F124] mb-4">Domicilio</h3>
            <div className="flex justify-between mt-6">
                <button type="button" onClick={() => onBack?.()}
                className="px-4 py-3 rounded-xl font-bold bg-[#0E1F30] text-white border border-white/10">
                Atrás
                </button>
                <button type="button" onClick={confirmar}
                className="px-5 py-3 rounded-xl font-bold bg-[#19F124] text-[#0D1520]">
                Siguiente
                </button>
            </div>
        </div>
    );
}
