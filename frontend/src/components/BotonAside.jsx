export default function BotonAside({ children, onClick, activo, variant }) {
    let baseStyles = `
        text-2xl grid grid-cols-[1.75rem_auto] items-center gap-3 
        rounded-xl px-4 py-3 leading-none transition duration-200 text-left
    `;

    if (activo) {
        baseStyles += " text-[#19F124] font-black";
    } else {
        baseStyles += " text-white font-medium hover:bg-[#0b1823] hover:text-[#19F124] hover:cursor-pointer";
    }

    if (variant === "logout") {
        baseStyles = `
        text-2xl grid grid-cols-[1.75rem_auto] w-full items-center gap-3
        rounded-xl px-4 py-3 leading-none transition duration-200 text-left
        text-[#ff2c2c] font-medium hover:text-[#ff1010] hover:bg-[#0b1823] hover:cursor-pointer
        `;
    }

    return (
        <button onClick={onClick} className={baseStyles}>
        {children}
        </button>
    );
}
