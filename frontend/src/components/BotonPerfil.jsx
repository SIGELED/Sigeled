export default function BotonPerfil({children, onClick, activo}) {
    return(
        <button onClick = {onClick}
            className = {`rounded-full p-1 pr-16 pl-16 mt-8 hover:cursor-pointer transition duration-300 ease-in-out 
            ${activo
                ? 'bg-[#1aab23] text-white font-bold border-1 border-[#1aab23]'
                : 'text-white hover:bg-white hover:text-[#020c14] border-1 border-white'}
            `}
            >
            {children}
        </button>
    )
}