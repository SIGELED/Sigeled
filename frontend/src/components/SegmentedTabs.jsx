import {FiUser, FiClipboard, FiHome, FiArchive } from "react-icons/fi";
import { useState } from "react";

export default function SegmentedTabs({ value, onChange, tabs, className = "" }) {
    const items = [
        { key: tabs.INFO, label: "Información Personal", Icon: FiUser },
        { key: tabs.DOCS, label: "Documentos", Icon:FiClipboard  },
        { key: tabs.DOM, label: "Domicilios", Icon:FiHome },
        { key: tabs.TIT, label: "Títulos", Icon:FiArchive  },
    ];

    const Item = ({ item }) => {
        const active = value === item.key;
        return (
        <button
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            title={item.label}
            className={[
            "group flex items-center justify-center rounded-full transition-all outline-none",
            "focus-visible:ring-2 focus-visible:ring-[#19F124]/60 text-2xl",
            active
                ? "bg-white/10 text-white shadow-inner px-3 h-10"
                : "hover:bg-white/5 text-white/90 h-10 w-10 cursor-pointer"
            ].join(" ")}
        >
            <item.Icon size={30} className={active ? "text-[#19F124]" : "text-white"} />
            {active && <span className="ml-2 font-semibold whitespace-nowrap">{item.label}</span>}
            {!active && <span className="sr-only">{item.label}</span>}
        </button>
        );
    };

    return (
        <div
            className={`inline-flex items-center gap-1 rounded-full bg-[#0D1520] p-2 border border-white/5 shadow-lg/30 ${className}`}
            role="tablist"
            aria-label="Secciones del usuario"
            >
                {items.map((it) => (
                    <Item key={it.key} item={it} />
                ))}
        </div>
    );
}