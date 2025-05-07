# Recomendaciones de Seguridad para Firebase en Synology NAS

Este documento proporciona recomendaciones de seguridad para la configuración de Firebase cuando la aplicación está alojada en un Synology NAS.

## Reglas de Firestore

Asegúrese de que las reglas de seguridad de Firestore estén correctamente configuradas para restringir el acceso a los datos. A continuación se presenta un ejemplo de reglas de seguridad:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función para comprobar si el usuario está autenticado
    function isAuth() {
      return request.auth != null;
    }
    
    // Función para comprobar si el usuario tiene rol de administrador
    function isAdmin() {
      return isAuth() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Función para comprobar si el usuario tiene rol de médico
    function isMedico() {
      return isAuth() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'medico';
    }
    
    // Acceso a la colección de usuarios
    match /users/{userId} {
      // Los usuarios pueden leer su propio perfil
      allow read: if isAuth() && (request.auth.uid == userId || isAdmin());
      // Solo los administradores pueden crear o modificar perfiles
      allow write: if isAdmin();
    }
    
    // Acceso a la colección de recetas
    match /recetas/{recetaId} {
      // Los médicos pueden crear y leer recetas
      allow create: if isAuth() && (isMedico() || isAdmin());
      // Cualquier usuario autenticado puede leer recetas
      allow read: if isAuth();
      // Solo el creador o un administrador puede modificar o eliminar
      allow update, delete: if isAuth() && (
        resource.data.createdBy == request.auth.uid || isAdmin()
      );
    }
    
    // Acceso a la colección de certificados
    match /certificados/{certificadoId} {
      // Los médicos pueden crear y leer certificados
      allow create: if isAuth() && (isMedico() || isAdmin());
      // Cualquier usuario autenticado puede leer certificados
      allow read: if isAuth();
      // Solo el creador o un administrador puede modificar o eliminar
      allow update, delete: if isAuth() && (
        resource.data.createdBy == request.auth.uid || isAdmin()
      );
    }
  }
}
```

## Configuración de Storage (si se utiliza)

Si la aplicación utiliza Firebase Storage para almacenar archivos, también debe configurar reglas de seguridad adecuadas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Archivo solo accesible para usuarios autenticados
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        // Limitar el tamaño del archivo a 5MB
        request.resource.size < 5 * 1024 * 1024 &&
        // Permitir solo ciertos tipos de archivos
        (request.resource.contentType.matches('image/.*') || 
         request.resource.contentType.matches('application/pdf'));
    }
  }
}
```

## Gestión de claves de API

Al desplegar en un Synology NAS, es importante proteger las claves de API de Firebase:

1. **Restricción de dominios**: Configure restricciones de dominio en la consola de Firebase para que las claves de API solo puedan ser utilizadas desde dominios autorizados (su dominio o IP del NAS).

2. **Restricción de referencia**: Configure restricciones de HTTP referrer en la consola de Firebase.

3. **Variables de entorno**: Si está utilizando un backend en el NAS, considere almacenar las claves en variables de entorno en lugar de en archivos JavaScript.

## Verificación de la autenticación en el frontend

Asegúrese de que la aplicación verifique correctamente el estado de autenticación antes de permitir el acceso a páginas protegidas:

```javascript
// Ejemplo en auth.js
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    // Redirigir a la página de inicio de sesión si no está autenticado
    window.location.href = '/login.html';
    return;
  }
  
  // Verificar el rol del usuario si está en una página de administración
  const isAdminPage = window.location.pathname.includes('/panel/usuarios.html');
  if (isAdminPage) {
    // Verificar si el usuario tiene permisos de administrador
    firebase.firestore().collection('users').doc(user.uid).get()
      .then((doc) => {
        if (!doc.exists || doc.data().role !== 'admin') {
          // Redirigir a una página de acceso denegado
          window.location.href = '/pendiente.html';
        }
      });
  }
});
```

## HTTPS

Para Synology NAS, es altamente recomendable configurar HTTPS:

1. Obtenga un certificado SSL (Let's Encrypt es gratuito y está integrado en Synology)
2. Configure su host virtual para usar HTTPS (puerto 443)
3. Configure una redirección de HTTP a HTTPS

## Control de sesión

Implemente controles de sesión adecuados:

```javascript
// Configurar la persistencia de autenticación
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .then(() => {
    // La sesión terminará cuando se cierre la pestaña/navegador
  })
  .catch((error) => {
    console.error('Error al configurar la persistencia:', error);
  });

// Implementar cierre de sesión por inactividad (opcional)
let inactivityTimer;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    firebase.auth().signOut().then(() => {
      alert('Su sesión ha expirado por inactividad');
      window.location.href = '/login.html';
    });
  }, 30 * 60 * 1000); // 30 minutos de inactividad
}

// Eventos para reiniciar el temporizador
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
resetInactivityTimer();
```

## Registro y monitoreo

Configure el registro adecuado para la aplicación:

1. Habilite el registro detallado en Firebase (Analytics, Crashlytics)
2. Verifique regularmente los logs de su Synology NAS
3. Configure alertas para actividades sospechosas

## Actualización regular

Mantenga actualizados todos los componentes:

1. Actualice regularmente las bibliotecas de Firebase a las últimas versiones
2. Mantenga actualizados los paquetes de su Synology NAS
3. Revise periódicamente las reglas de seguridad de Firebase