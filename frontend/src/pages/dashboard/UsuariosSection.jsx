import { useEffect, useState, Suspense, lazy } from "react";
import { personaService, profileService, roleService, userService } from "../../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const UsuariosTable = lazy(() => import('./Usuarios'));

const UsuariosSection = ({user}) =>{
    const queryClient = useQueryClient();

    const fetchUsuariosDetallados = async () => {
                const usuariosRes = await userService.getUsuarios();
                const usuariosData = usuariosRes.data;

                const usuariosConRolesYPersona = await Promise.all(
                    usuariosData.map(async (u) =>{
                        const rolesRes = await roleService.getRolesByUser(u.id_usuario);
                        let personaData = {};
                        if(u.id_persona){
                            try {
                                const personaRes = await personaService.getPersonaByID(u.id_persona);
                                personaData = personaRes.data;
                            } catch (err) {
                                console.warn(`No se encontró persona para usuario ${u.id_usuario}`);
                            }
                        }
                        return{
                            ...u,
                            rolesAsignados: rolesRes.data,
                            ...personaData
                        };
                    })
                );
                return usuariosConRolesYPersona;
    };

    const { data: usuarios = [], isLoading: isLoadingUsuarios } = useQuery({
        queryKey: ['usuarios', 'detalles'],
        queryFn: fetchUsuariosDetallados,
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
            alert("Rol asignado correctamente");
            queryClient.invalidateQueries({queryKey: ['usuarios', 'detalles']});
        },
        onError: (err) => {
            alert(err.response?.data?.message || 'Error al asignar rol');
        }
    })

    const toggleUserMutation = useMutation({
        mutationFn: (usuario) => userService.toggleUsuario(usuario.id_usuario),
        onMutate: async (usuario) => {
            await queryClient.cancelQueries({ queryKey: ['usuarios', 'detalles'] });
            const prev = queryClient.getQueryData(['usuarios', 'detalles']);
            queryClient.setQueryData(['usuarios', 'detalles'], (list) =>
                Array.isArray(list)
                    ? list.map(u => u.id_usuario === usuario.id_usuario ? { ...u, activo: !u.activo } : u)
                    : list
            );
            return { prev };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) queryClient.setQueryData(['usuarios', 'detalles'], ctx.prev);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['usuarios', 'detalles'] });
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

    if (isLoadingUsuarios || isLoadingRoles || isLoadingProfiles) {
        return <div>Cargando datos de usuarios...</div>
    }

    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <UsuariosTable
                users={usuarios}
                roles = {roles}
                profiles = {profiles}
                onEdit = {handleEdit}
                onToggle = {handleToggle}
                onAssignRole = {handleAssignRole}
            />
        </Suspense>
    )
}

export default UsuariosSection