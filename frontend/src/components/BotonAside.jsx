export default function BotonAside({children, onClick, activo}) {
    return(
        <button onClick = {onClick}
            className = {`w-fit max-w-fit text-4xl grid grid-cols-[1.75rem_auto] items-center gap-3 rounded-xl px-4 py-3 leading-none transition duration-200 text-left 
            ${activo
                ? ' text-[#19F124] font-black'
                : 'text-white font-medium hover:bg-[#0b1823] hover:text-[#19F124] hover:cursor-pointer'}
            `}
            >
            {children}
        </button>
    )
}