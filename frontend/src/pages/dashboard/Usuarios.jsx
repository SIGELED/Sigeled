import { useMemo } from 'react';
import { useReactTable, createColumnHelper, getCoreRowModel, flexRender} from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export default function Usuarios({ users = [], onEdit, onToggle, roles = [], onAssignRole }) {
    const columns = useMemo(
        () => [
        columnHelper.accessor("nombre", { header: "Nombre" }),
        columnHelper.accessor("email", { header: "Email" }),
        columnHelper.accessor("telefono", { header: "Teléfono" }),
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
                    <select defaultValue="" onChange={handleChange} className='px-2 py-1 rounded-xl bg-[#101922] text-white'>

                        <option value="">Seleccionar rol</option>
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
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => (
            <div className="flex gap-2">
                <button
                onClick={() => onEdit && onEdit(row.original)}
                aria-label={`Ver info ${row.original.nombre}`}
                className="px-3 py-1 rounded-2xl bg-[#101922] hover:bg-[#16222b]"
                >
                Info
                </button>


                {onToggle && (
                <button
                    onClick={() => onToggle(row.original)}
                    aria-label={`${row.original.activo ? 'Desactivar' : 'Activar'} ${row.original.nombre}`}
                    className="px-3 py-1 rounded-2xl bg-[#101922] hover:bg-[#16222b]"
                >
                    {row.original.activo ? "Desactivar" : "Activar"}
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
        getCoreRowModel: getCoreRowModel(),
    });

return (
        <div className="overflow-x-auto">
        <table className="min-w-full">
            <thead>
            {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                {hg.headers.map((h) => (
                    <th
                    key={h.id}
                    scope="col"
                    className="px-4 py-2 text-sm text-left text-gray-300"
                    >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                ))}
                </tr>
            ))}
            </thead>

            <tbody>
            {users.length === 0 ? (
                <tr>
                    <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400"> No hay usuarios para mostrar </td>
                </tr>
            ) : (
                table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="odd:bg-transparent even:bg-[#0b1720] hover:bg-[#0f1a22]">
                    {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 align-top">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>
                ))
            )}
            </tbody>
        </table>
        </div>
    );
}
