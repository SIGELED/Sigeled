import { MdOutlineNotifications } from "react-icons/md";
import { FiUser } from "react-icons/fi";

export default function BotonesDasboard() {
    return(
        <div className=' absolute right-7 transform flex space-x-4 mt-5'>
            <button className='bg-[#101922] p-3 flex items-center rounded-[1.1rem] font-bold hover:bg-[#1a2735] hover:cursor-pointer transition' onClick={() => setMenuOpen(false)}>
            <MdOutlineNotifications className="w-7 h-7 text-[#19F124]"/>
            </button>
            <button className='bg-[#101922] p-3 flex items-center rounded-[1.1rem] font-bold hover:bg-[#1a2735] hover:cursor-pointer transition' onClick={() => setMenuOpen(false)}>
            <FiUser className="w-7 h-7 text-[#19F124]"/>
            </button>
        </div>
    )
}