// Importar cliente de Supabase
let supabase;

// Función para mostrar mensajes de error
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Función para ocultar mensajes de error
function hideError() {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Función para mostrar mensajes
function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
    }
}

// Obtener información del usuario desde Supabase
async function getUserInfo(userId) {
    try {
        const { data, error } = await supabase
            .from('arrayanmed.usuarios')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        // Si no existe el documento, crear uno con rol pendiente
        if (!data) {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const { error: insertError } = await supabase
                    .from('arrayanmed.usuarios')
                    .insert({
                        id: userId,
                        email: user.email,
                        rol: 'pendiente',
                        estado: 'pendiente',
                        fecha_registro: new Date()
                    });
                
                if (insertError) throw insertError;
                return { rol: 'pendiente', estado: 'pendiente' };
            }
        }
        
        return data;
    } catch (error) {
        console.error("Error obteniendo información del usuario:", error);
        return { rol: 'pendiente', estado: 'pendiente' };
    }
}

// Verificar si el usuario está logueado
function checkAuth() {
    supabase.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user;
        
        // Si estamos en una página del panel y no hay usuario autenticado, redirigir al login
        if (!user && window.location.pathname.includes('/panel/')) {
            window.location.href = '../login.html';
            return;
        } 
        
        // Si hay usuario autenticado
        if (user) {
            // Obtener información adicional del usuario
            const userInfo = await getUserInfo(user.id);
            const rol = userInfo.rol || 'pendiente';
            const estado = userInfo.estado || 'pendiente';
            
            // Guardar rol en sessionStorage para acceder desde otras páginas
            sessionStorage.setItem('userRole', rol);
            
            // Si el usuario está pendiente de aprobación
            if (estado === 'pendiente' && !window.location.pathname.includes('/pendiente.html')) {
                alert('Su cuenta está pendiente de aprobación por un administrador.');
                await supabase.auth.signOut();
                window.location.href = window.location.pathname.includes('/panel/') ? '../index.html' : 'index.html';
                return;
            }
            
            // Si estamos en login y el usuario está autenticado y aprobado, redirigir al panel
            if (window.location.pathname.includes('/login.html') && estado === 'aprobado') {
                window.location.href = 'panel/recetas.html';
                return;
            }
            
            // Si estamos en una página del panel
            if (window.location.pathname.includes('/panel/')) {
                // Mostrar información del usuario
                const userEmailElement = document.getElementById('userEmail');
                const userRoleElement = document.getElementById('userRole');
                
                if (userEmailElement) {
                    userEmailElement.textContent = user.email;
                }
                
                if (userRoleElement) {
                    userRoleElement.textContent = rol.charAt(0).toUpperCase() + rol.slice(1);
                }
                
                // Verificar acceso a la página según rol
                if (typeof window.rolesApp !== 'undefined') {
                    window.rolesApp.verificarAccesoPagina();
                    window.rolesApp.actualizarInterfazSegunRol(rol);
                }
            }
        }
    });
}

// Llamar a la función de verificación al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar Supabase
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    await new Promise(resolve => {
        script.onload = resolve;
        document.head.appendChild(script);
    });
    
    // Cargar configuración de Supabase
    const configScript = document.createElement('script');
    configScript.src = window.location.pathname.includes('/panel/') ? '../js/supabase-config.js' : 'js/supabase-config.js';
    await new Promise(resolve => {
        configScript.onload = resolve;
        document.head.appendChild(configScript);
    });
    
    // Inicializar cliente de Supabase
    setTimeout(() => {
        supabase = window.supabaseClient.createClient(
            'https://aigcgrcfbzzfsszrbsid.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZ2NncmNmYnp6ZnNzenJic2lkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIyNDgwMSwiZXhwIjoyMDYxODAwODAxfQ.QyitPa8rd4obmWFEukRacz6DUIeCEvQBAY2Ijv7ahBI'
        );
        
        // Verificar autenticación
        checkAuth();
    }, 500);
    
    // Manejo del formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            hideError();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                // Login exitoso
                window.location.href = 'panel/recetas.html';
            } catch (error) {
                // Error en login
                let errorMessage = '';
                
                switch(error.message) {
                    case 'Invalid login credentials':
                        errorMessage = 'Credenciales inválidas. Verifique su correo y contraseña.';
                        break;
                    case 'Email not confirmed':
                        errorMessage = 'Correo no confirmado. Verifique su bandeja de entrada.';
                        break;
                    default:
                        errorMessage = 'Error al iniciar sesión. Por favor intente nuevamente.';
                }
                
                showError(errorMessage);
            }
        });
    }
    
    // Manejo del formulario de restablecimiento de contraseña
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value;
            
            try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/reset-password.html',
                });
                
                if (error) throw error;
                
                showMessage('resetMessage', 'Se ha enviado un correo para restablecer su contraseña.', 'success');
            } catch (error) {
                showMessage('resetMessage', 'Error al enviar el correo. Verifique la dirección.', 'error');
            }
        });
    }
    
    // Botón de cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                
                window.location.href = '../login.html';
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        });
    }
    
    // Enlace para olvidar contraseña
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const closeBtn = document.querySelector('.close-btn');
    
    if (forgotPasswordLink && resetPasswordModal) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            resetPasswordModal.style.display = 'flex';
        });
        
        closeBtn.addEventListener('click', function() {
            resetPasswordModal.style.display = 'none';
        });
        
        window.addEventListener('click', function(e) {
            if (e.target === resetPasswordModal) {
                resetPasswordModal.style.display = 'none';
            }
        });
    }
});