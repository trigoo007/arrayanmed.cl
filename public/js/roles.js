// Sistema de roles para Centro Médico Arrayán

// Definición de permisos por rol
const ROLES_PERMISOS = {
    'admin': ['recetas', 'certificados', 'usuarios', 'informes', 'evaluaciones'],
    'medico': ['recetas', 'certificados', 'informes'],
    'psicologo': ['informes', 'evaluaciones'],
    'pendiente': []
};

// Verificar si un rol tiene permiso para una función específica
function tienePermiso(rol, funcion) {
    if (!rol || !funcion) return false;
    
    // El admin siempre tiene acceso a todo
    if (rol === 'admin') return true;
    
    // Verificar si el rol tiene el permiso específico
    return ROLES_PERMISOS[rol] && ROLES_PERMISOS[rol].includes(funcion);
}

// Actualizar la interfaz según el rol del usuario
function actualizarInterfazSegunRol(rol) {
    if (!rol) return;
    
    console.log('Actualizando interfaz para rol:', rol);
    
    // Ocultar elementos según permisos
    document.querySelectorAll('[data-requiere-permiso]').forEach(elemento => {
        const permisoRequerido = elemento.getAttribute('data-requiere-permiso');
        
        if (tienePermiso(rol, permisoRequerido)) {
            elemento.classList.remove('hidden');
        } else {
            elemento.classList.add('hidden');
        }
    });
    
    // Mostrar el rol en la interfaz si existe el elemento
    const rolElement = document.getElementById('userRole');
    if (rolElement) {
        rolElement.textContent = rol.charAt(0).toUpperCase() + rol.slice(1);
    }
}

// Verificar permisos al cargar la página
function verificarAccesoPagina() {
    const userRole = sessionStorage.getItem('userRole');
    
    // Obtener el nombre de la página actual
    const rutaActual = window.location.pathname;
    const nombrePagina = rutaActual.split('/').pop().split('.')[0];
    
    console.log('Verificando acceso a:', nombrePagina, 'para rol:', userRole);
    
    // Mapeo de páginas a permisos requeridos
    const paginasPermisos = {
        'recetas': 'recetas',
        'certificados': 'certificados',
        'usuarios': 'usuarios',
        'informes': 'informes',
        'evaluaciones': 'evaluaciones'
    };
    
    // Si la página requiere un permiso específico, verificar
    if (paginasPermisos[nombrePagina]) {
        if (!tienePermiso(userRole, paginasPermisos[nombrePagina])) {
            alert('No tienes permiso para acceder a esta página');
            window.location.href = 'perfil.html'; // Perfil ya existente
            return false;
        }
    }
    
    return true;
}

// Exportar funciones
window.rolesApp = {
    tienePermiso,
    actualizarInterfazSegunRol,
    verificarAccesoPagina
};