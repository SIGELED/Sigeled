import { MdOutlineNotifications } from "react-icons/md";
import { FiUser } from "react-icons/fi";

export default function Nav() {
    return(
        <div className='absolute flex mt-5 space-x-4 transform right-7'>
            <button className='bg-[#101922] p-3 flex items-center rounded-[1.1rem] font-bold hover:bg-[#1a2735] hover:cursor-pointer transition'>
            <MdOutlineNotifications className="w-7 h-7 text-[#19F124]"/>
            </button>
            <button className='bg-[#101922] p-3 flex items-center rounded-[1.1rem] font-bold hover:bg-[#1a2735] hover:cursor-pointer transition'>
            <FiUser className="w-7 h-7 text-[#19F124]"/>
            </button>
        </div>
    )
}