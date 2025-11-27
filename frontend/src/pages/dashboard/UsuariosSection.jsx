import { useState, Suspense, lazy } from "react";
import { personaService, profileService, roleService, userService } from "../../services/api";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { useToast } from "../../components/ToastProvider";

const UsuariosTable = lazy(() => import('./Usuarios'));

const UsuariosSection = ({user}) =>{
    const queryClient = useQueryClient();
    const [filtros, setFiltros] = useState({ search: '', perfil: '' });
    const [debouncedSearch] = useDebounce(filtros.search, 300);
    const toast = useToast();

    const queryKey = ['usuarios', 'busqueda', debouncedSearch, filtros.perfil];

    const { data: usuarios = [], isLoading: isLoadingUsuarios } = useQuery({
        queryKey: queryKey,
        queryFn: () => personaService.buscadorAvanzadoUsuarios(debouncedSearch, filtros.perfil).then(res => res.data),
        placeholderData: keepPreviousData,
    });

    const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: () => roleService.getRoles().then(res => res.data),
    })

    const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery({
        queryKey: ['profiles'],
        queryFn:() => profileService.getProfiles().then(res => res.data)
    });

    const assignRoleMutation = useMutation({
        mutationFn: ({ id_usuario, id_rol }) => roleService.assignRoleToUser(id_usuario, id_rol, user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKey});
            toast.success("Rol asignado correctamente");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Error al asignar rol');
        }
    })

    const toggleUserMutation = useMutation({
        mutationFn: (usuario) => userService.toggleUsuario(usuario.id_usuario),
        onMutate: async (usuario) => {
            await queryClient.cancelQueries({ queryKey: queryKey });
            const prev = queryClient.getQueryData(queryKey);
            queryClient.setQueryData(queryKey, (list) =>
                Array.isArray(list)
                    ? list.map(u => u.id_usuario === usuario.id_usuario ? { ...u, activo: !u.activo } : u)
                    : list
            );
            return { prev };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
        },
    })

    const handleAssignRole = (id_usuario, id_rol) => {
        assignRoleMutation.mutate({id_usuario, id_rol});
    }

    const handleEdit = (usuario) => {
        console.log('Editar usuario', usuario);
    };

    const handleToggle = async (usuario) => {
        toggleUserMutation.mutate(usuario);
    }

    if (isLoadingRoles || isLoadingProfiles) {
        return <div>Cargando datos...</div>
    }

    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <UsuariosTable
                users={usuarios}
                isLoading={isLoadingUsuarios}
                roles = {roles}
                profiles = {profiles}
                onEdit = {handleEdit}
                onToggle = {handleToggle}
                onAssignRole = {handleAssignRole}
                filtros={filtros}
                onFiltroChange={setFiltros}
            />
        </Suspense>
    )
}

export default UsuariosSection