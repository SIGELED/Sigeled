// controllers/permiso.Controller.js - CREAR NUEVO ARCHIVO
import { PermisoModel } from '../models/permisoModel.js';
import { obtenerPermisosUsuario } from '../middleware/permisosMiddleware.js';
import db from '../models/db.js';

export class PermisoController {
    // Obtener permisos del usuario actual (para el frontend)
    static async getMisPermisos(req, res) {
        try {
            const permisos = await obtenerPermisosUsuario(req.user.id_user);
            
            // Agrupar permisos por funcionalidad para el frontend
            const permisos_agrupados = {
                perfil: permisos.permisos.filter(p => p.startsWith('PERFIL_')),
                documentos: permisos.permisos.filter(p => p.startsWith('DOC_')),
                contratos: permisos.permisos.filter(p => p.startsWith('CONTRATO_')),
                reportes: permisos.permisos.filter(p => p.startsWith('REPORTE_')),
                usuarios: permisos.permisos.filter(p => p.startsWith('USER_')),
                sistema: permisos.permisos.filter(p => p.startsWith('SISTEMA_')),
                legajos: permisos.permisos.filter(p => p.startsWith('LEGAJO_')),
                auditoria: permisos.permisos.filter(p => p.startsWith('AUDITORIA_')),
                dashboard: permisos.permisos.filter(p => p.startsWith('DASHBOARD_'))
            };
            
            res.json({
                success: true,
                usuario: {
                    id: req.user.id_user,
                    email: req.user.email,
                    rol: permisos.rol,
                    id_role: req.user.id_role,
                    id_persona: req.user.id_persona
                },
                permisos: permisos.permisos,
                permisos_agrupados,
                total_permisos: permisos.permisos.length,
                // Capacidades rápidas para el frontend
                capacidades: {
                    puede_ver_todos_perfiles: permisos.permisos.includes('PERFIL_VER_TODOS'),
                    puede_editar_perfiles: permisos.permisos.includes('PERFIL_EDITAR_COMPLETO'),
                    puede_gestionar_contratos: permisos.permisos.includes('CONTRATO_CREAR'),
                    puede_gestionar_usuarios: permisos.permisos.includes('USER_CREAR'),
                    es_admin: req.user.id_role === 1,
                    es_rrhh: req.user.id_role <= 2,
                    es_administrativo: req.user.id_role <= 3
                }
            });
            
        } catch (error) {
            console.error('Error obteniendo permisos:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo permisos del usuario',
                error: error.message
            });
        }
    }

    // Verificar un permiso específico (útil para frontend)
    static async verificarPermisoEspecifico(req, res) {
        try {
            const { codigo_permiso } = req.params;
            
            const result = await PermisoModel.verificarPermiso(req.user.id_user, codigo_permiso);
            
            res.json({
                success: true,
                tiene_permiso: result.rows.length > 0,
                permiso: result.rows[0] || null,
                usuario_rol: req.user.role_name
            });
            
        } catch (error) {
            console.error('Error verificando permiso específico:', error);
            res.status(500).json({
                success: false,
                message: 'Error verificando permiso',
                error: error.message
            });
        }
    }

    // Listar todos los permisos del sistema (solo administradores)
    static async getAllPermisos(req, res) {
        try {
            const query = `
                SELECT 
                    p.id_permiso,
                    p.codigo,
                    p.nombre,
                    p.descripcion,
                    r.nombre as rol_nombre,
                    r.id_role,
                    p.activo,
                    p.creado_en
                FROM permisos p
                JOIN roles r ON p.id_rol = r.id_role
                ORDER BY r.id_role, p.codigo
            `;
            
            const result = await db.query(query);
            
            // Agrupar por rol para mejor visualización
            const permisos_por_rol = result.rows.reduce((acc, permiso) => {
                if (!acc[permiso.rol_nombre]) {
                    acc[permiso.rol_nombre] = {
                        id_role: permiso.id_role,
                        permisos: []
                    };
                }
                acc[permiso.rol_nombre].permisos.push(permiso);
                return acc;
            }, {});
            
            res.json({
                success: true,
                permisos_totales: result.rows.length,
                permisos_por_rol,
                todos_permisos: result.rows
            });
            
        } catch (error) {
            console.error('Error obteniendo todos los permisos:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo permisos del sistema',
                error: error.message
            });
        }
    }
}