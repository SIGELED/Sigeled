import { useEffect, useState, Suspense, lazy } from "react";
import { personaService, profileService, roleService, userService } from "../../services/api";

const UsuariosTable = lazy(() => import('./Usuarios'));

const UsuariosSection = ({user}) =>{
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [profiles, setProfiles] = useState([]);

    useEffect(() =>{
        const fetchData = async() => {
            try {
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
                        }
                    })
                )

                setUsuarios(usuariosConRolesYPersona);

                const rolesRes = await roleService.getRoles();
                setRoles(rolesRes.data);

                const profileRes = await profileService.getProfiles();
                setProfiles(profileRes.data);
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

    const handleAssignProfile = async(id_persona, id_perfil) => {
        try {
            const res = await profileService.assignProfile(
                id_persona,
                id_perfil,
                user.id
            )

            const profileAsignado = profiles.find(p => p.id_perfil === parseInt(id_perfil));

            setUsuarios((prev) => 
                prev.map((u) =>
                    u.id_persona === id_persona
                    ? {...u, perfilesAsignados: [profileAsignado]}
                    :u
                )   
            )
                alert("Perfil asignado correctamente")
                console.log("Usuario que asigna el perfil:", user)
        } catch (err) {
            alert(err.response?.data?.message || 'Error al asignar perfil');
        }
    }

    const handleEdit = (usuario) => {
        console.log('Editar usuario', usuario);
    };

    const handleToggle = async (usuario) => {
        try {
            const res = await userService.toggleUsuario(usuario.id_usuario)
            const actualizado = res.data.user;

            setUsuarios(prev =>
                prev.map(user => 
                    user.id_usuario === usuario.id_usuario ? { ...user, activo: actualizado.activo } : user
                )
            );
            alert(`Estado actualizado`)
        } catch (err) {
            console.error("Error al cambiar estado:", err);
            alert(err.response?.data?.message || "Error al cambiar estado del usuario");
        }
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
                onAssignProfile = {handleAssignProfile}
            />
        </Suspense>
    )
}

export default UsuariosSection