import { useMemo, useState } from 'react';
import { useReactTable, createColumnHelper, getCoreRowModel, flexRender, getPaginationRowModel} from "@tanstack/react-table";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { FaToggleOn, FaToggleOff } from "react-icons/fa6";
import { CgInfo } from "react-icons/cg";

const columnHelper = createColumnHelper();

export default function Usuarios({ users = [], onEdit, onToggle, roles = [], profiles = [], onAssignRole, onAssignProfile }) {
    const [pagination, setPagination] = useState({
        pageIndex:0,
        pageSize: 9,
    })

    const columns = useMemo(
        () => [
        columnHelper.accessor("nombre", { header: "Nombre" }),
        columnHelper.accessor("apellido", {header:"Apellido"}),
        columnHelper.accessor("email", { header: "Email" }),
        columnHelper.display({
            id:"roles",
            header:"Rol",
            cell:({row}) =>{
                const usuario = row.original;

                if(usuario.rolesAsignados && usuario.rolesAsignados.length > 0){
                    return <span>{usuario.rolesAsignados.map(r => r.nombre).join(', ')}</span>
                }

                const handleChange = async(e) =>{
                    const nuevoRol = e.target.value;
                    if(onAssignRole && nuevoRol) {
                        onAssignRole(usuario.id_usuario, nuevoRol)
                    }
                };
                
                return(
                    <select defaultValue="" onChange={handleChange} className='px-2 py-1 rounded-full bg-[#242E38] text-white hover:bg-[#2d3946] transition cursor-pointer'>

                        <option value="" className=''>Seleccionar rol</option>
                        {roles.map((r) =>(
                            <option key={r.id_rol} value={r.id_rol}>
                                {r.nombre}
                            </option>
                        ))}
                    </select>
                );
            },
        }),
        columnHelper.display({
            id:"perfil",
            header:"Perfil",
            cell:({row}) => {
                const usuario = row.original;

                if(usuario.perfilesAsignados && usuario.perfilesAsignados.length > 0){
                    return <span>{usuario.perfilesAsignados.map(p => p.nombre).join(', ')}</span>
                }

                const handleChange = async(e) =>{
                    const nuevoPerfil = e.target.value;
                    if(onAssignProfile && nuevoPerfil) {
                        onAssignProfile(usuario.id_persona, nuevoPerfil)
                    }
                };
                
                return(
                    <select defaultValue="" onChange={handleChange} className='px-2 py-1 rounded-full bg-[#242E38] text-white hover:bg-[#2d3946] transition cursor-pointer'>

                        <option value="" className=''>Seleccionar perfil</option>
                        {profiles.map((p) =>(
                            <option key={p.id_perfil} value={p.id_perfil}>
                                {p.nombre}
                            </option>
                        ))}
                    </select>
                );
            },
        }),
        columnHelper.display({
            id:"info",
            header: "Info.",
            cell:({row}) => (
                <div className='flex items-center justify-center align-middle'>
                <button
                    onClick={() => onEdit && onEdit(row.original)}
                    aria-label={`Ver info ${row.original.nombre}`}
                    className="p-1 rounded-[0.80rem] bg-[#242E38] hover:bg-[#16222b] transition cursor-pointer"
                    >
                    <CgInfo className='w-8 h-8 text-[#19F124]'/>
                </button>
                </div>
            )
        }),
        columnHelper.display({
            id: "actions",
            header: "Activar/Desactivar",
            cell: ({ row }) => (
            <div className="flex items-center justify-center align-middle">
                {onToggle && (
                <button
                    onClick={() => onToggle(row.original)}
                    aria-label={`${row.original.activo ? 'Desactivar' : 'Activar'} ${row.original.nombre}`}
                    className={`px-3 py-1 rounded-2xl transition-all duration-200 cursor-pointer
                    ${row.original.activo
                        ? 'font-black text-[#ff2222] hover:text-[#ff3e3e] hover:bg-[#2d3946]'
                        : 'font-black text-[#19F124] hover:bg-[#2d3946]'
                    }`
                }
                >
                    {row.original.activo ? (<FaToggleOff className="w-7 h-7"/>) : (<FaToggleOn className="w-7 h-7"/>)}
                </button>
                )}
            </div>
            ),
        }),
        ],
        [onEdit, onToggle, roles, onAssignRole]
    );

    const table = useReactTable({
        data: users,
        columns,
        state: {pagination},
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

return (
    <div className='pt-5 pl-10 pr-10'>
        <div className="flex flex-col justify-between h-[85vh] bg-[#101922] rounded-3xl overflow-hidden">
            <div className="flex-grow overflow-y-auto">
                <table className="min-w-full">
                    <thead className='sticky top-0 border-b border-b-gray-700'>
                    {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                        {hg.headers.map((h) => (
                            <th
                            key={h.id}
                            scope="col"
                            className="px-6 py-4 text-xl text-white"
                            >
                            {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                            </th>
                        ))}
                        </tr>
                    ))}
                    </thead>

                    <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="text-xl">
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-6 py-[0.55rem]">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className='flex items-center justify-between py-2 mt-auto align-middle border-t border-t-gray-700'>
            <div></div>

                <div className='flex items-center justify-center gap-2 pr-3 text-center'>
                    Pág: {table.getState().pagination.pageIndex + 1} - {table.getPageCount()}
                    <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className={`
                        p-1 border-2 border-[#19F124] rounded-full
                        hover:bg-[#19F124] hover:text-[#101922]
                        cursor-pointer transition
                        disabled:cursor-default disabled:opacity-50
                        disabled:hover:bg-transparent disabled:hover:text-[#19F124]
                    `}
                    >
                    <MdNavigateBefore
                        className={`
                        w-9 h-9 m-[-4px]
                        text-[#19F124]
                        transition
                        ${!table.getCanPreviousPage() ? 'opacity-100' : 'hover:text-[#101922]'}
                        `}
                    />
                    </button>

                    <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className={`
                        p-1 border-2 border-[#19F124] rounded-full
                        hover:bg-[#19F124] hover:text-[#101922]
                        cursor-pointer transition
                        disabled:cursor-default disabled:opacity-50
                        disabled:hover:bg-transparent disabled:hover:text-[#19F124]
                    `}
                    >
                    <MdNavigateNext
                        className={`
                        w-9 h-9 m-[-4px]
                        text-[#19F124]
                        transition
                        ${!table.getCanNextPage() ? 'opacity-100' : 'hover:text-[#101922]'}
                        `}
                    />
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
}
