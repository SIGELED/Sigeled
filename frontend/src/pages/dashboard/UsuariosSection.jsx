import { useEffect, useState, Suspense, lazy } from "react";
import { roleService, userService } from "../../services/api";

const UsuariosTable = lazy(() => import('./Usuarios'));

const UsuariosSection = ({user}) =>{
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);

    useEffect(() =>{
        const fetchData = async() => {
            try {
                const usuariosRes = await userService.getUsuarios();
                const usuariosData = usuariosRes.data;

                const usuariosConRoles = await Promise.all(
                    usuariosData.map(async (u) =>{
                        const rolesRes = await roleService.getRolesByUser(u.id_usuario);
                        return{
                            ...u,
                            rolesAsignados: rolesRes.data
                        }
                    })
                )

                setUsuarios(usuariosConRoles);

                const rolesRes = await roleService.getRoles();
                setRoles(rolesRes.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    const handleAssignRole = async(id_usuario, id_rol) =>{
        try {
            const res = await roleService.assignRoleToUser(
                id_usuario,
                id_rol,
                user.id
            );

            const rolAsignado = roles.find(r => r.id_rol === parseInt(id_rol));

            setUsuarios((prev) =>
            prev.map((u)=>
                u.id_usuario === id_usuario
            ? {...u, rolesAsignados: [rolAsignado]}
            :u
            )
        )
            alert("Rol asignado correctamente")
            console.log("Usuario que asigna el rol:",user)
        } catch (err) {
            alert(err.response?.data?.message || 'Error al asignar rol');
        }
    };

    const handleEdit = (usuario) => {
        console.log('Editar usuario', usuario);
    };

    const handleToggle = (usuario) => {
        console.log('Activar/Desactivar usuario', usuario);
    };

    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <UsuariosTable
                users={usuarios}
                roles = {roles}
                onEdit = {handleEdit}
                onToggle = {handleToggle}
                onAssignRole = {handleAssignRole}
            />
        </Suspense>
    )
}

export default UsuariosSection