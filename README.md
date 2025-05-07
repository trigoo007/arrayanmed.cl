# Centro Médico Infantil Arrayán

Sistema de gestión de documentos médicos para el Centro Médico Infantil Arrayán.

## Descripción

Aplicación web para la generación y gestión de documentos médicos, incluyendo recetas y certificados, con sistema de autenticación de usuarios y diferentes niveles de acceso según roles.

## Tecnologías utilizadas

- Frontend: HTML, CSS, JavaScript
- Base de datos: Firebase Firestore
- Autenticación: Firebase Auth
- Generación de PDFs: html2pdf.js

## Estructura del proyecto

```
/arrayanmed.cl/
├── public/             # Directorio raíz web
│   ├── css/            # Estilos CSS
│   │   └── styles.css  # Estilos globales
│   ├── img/            # Imágenes y recursos
│   │   ├── logo.png    # Logo anterior
│   │   └── logo.svg    # Logo actualizado
│   ├── js/             # Scripts JavaScript
│   │   ├── auth.js             # Autenticación
│   │   ├── certificados.js     # Generación de certificados
│   │   ├── firebase-config.js  # Configuración de Firebase
│   │   ├── recetas.js          # Generación de recetas
│   │   └── roles.js            # Gestión de permisos
│   ├── panel/          # Páginas del panel de administración
│   │   ├── certificados.html   # Generación de certificados
│   │   ├── perfil.html         # Perfil de usuario
│   │   ├── recetas.html        # Generación de recetas
│   │   └── usuarios.html       # Administración de usuarios
│   ├── index.html      # Página principal
│   ├── login.html      # Página de inicio de sesión
│   ├── pendiente.html  # Página para cuentas pendientes
│   └── registro.html   # Página de registro
└── logs/               # Logs del servidor
    ├── access.log      # Registro de accesos
    └── error.log       # Registro de errores
```

## Instalación en Synology NAS

### Requisitos previos

- Synology NAS con DSM 7.0 o superior
- Paquete "Web Station" instalado
- Paquete "PHP" instalado (opcional, solo si se planea agregar backend)

### Pasos de instalación

1. **Activar Web Station en el NAS**:
   - Abra el Centro de paquetes de Synology
   - Busque e instale "Web Station"
   - Inicie Web Station

2. **Configurar un host virtual**:
   - En Web Station, vaya a "Portal Settings" > "Virtual Host"
   - Haga clic en "Create" para crear un nuevo host virtual
   - Configure los siguientes parámetros:
     - **Name**: `arrayanmed.cl`
     - **Port**: 80/443 (HTTP/HTTPS)
     - **Document root**: Seleccione la carpeta donde colocará los archivos (ej: `web/arrayanmed.cl`)
     - **Backend server**: Ninguno (Static website)
     - **Habilite HTTPS**: Es obligatorio para este sitio
   - Configure el certificado SSL para el dominio:
     - En el panel de control del DSM, vaya a "Security" > "Certificate"
     - Solicite un certificado gratuito de Let's Encrypt para arrayanmed.cl
     - Asigne este certificado al host virtual creado

3. **Subir los archivos al NAS**:
   - Conecte a su NAS mediante File Station o FTP
   - Cree la carpeta `web/arrayanmed.cl` si no existe
   - Suba todo el contenido del directorio `public/` a esta carpeta

4. **Configurar permisos**:
   - Asegúrese de que el usuario `http` (o el usuario del servidor web) tenga permisos de lectura sobre todos los archivos
   - Utilice el siguiente comando en la terminal SSH del NAS, o configure los permisos desde File Station:
     ```
     sudo chown -R http:http /volume1/web/arrayanmed.cl
     sudo chmod -R 755 /volume1/web/arrayanmed.cl
     ```

5. **Configurar dominio arrayanmed.cl**:
   - Configure los registros DNS del dominio arrayanmed.cl para que apunten a la IP pública de su NAS:
     - Registro A: `arrayanmed.cl` → [IP-PUBLICA-DE-SU-NAS]
     - Registro A: `www.arrayanmed.cl` → [IP-PUBLICA-DE-SU-NAS]
   - Asegúrese de configurar el reenvío de puertos en su router:
     - Puerto 80 (HTTP) → IP interna de su NAS, puerto 80
     - Puerto 443 (HTTPS) → IP interna de su NAS, puerto 443

### Acceso a la aplicación

Una vez completada la instalación, puede acceder a la aplicación a través de:

- **Acceso local**: `http://IP-DE-SU-NAS`
- **Acceso por dominio**: `https://arrayanmed.cl`

La aplicación está configurada para ser accesible directamente en el dominio principal arrayanmed.cl, no en una subcarpeta.

## Mantenimiento

### Carpeta de logs

Los logs del servidor se almacenan en la carpeta `logs/`:
- `access.log`: Registra los accesos a la aplicación
- `error.log`: Registra los errores que puedan ocurrir

### Actualización del sistema

Para actualizar la aplicación:
1. Haga una copia de seguridad de la carpeta actual
2. Reemplace los archivos con las nuevas versiones
3. Verifique que los permisos de archivos sean correctos

## Seguridad

- La aplicación utiliza Firebase Authentication para gestionar los usuarios y roles
- Todas las conexiones con Firebase están protegidas con reglas de seguridad
- Se recomienda utilizar HTTPS para proteger las comunicaciones

## Configuración del servidor

La carpeta `server/` contiene archivos de configuración que pueden ser útiles para el despliegue:

- `nginx.conf`: Configuración de ejemplo para Nginx en Synology NAS
- `.htaccess`: Configuración de ejemplo para Apache en Synology NAS
- `deploy_to_nas.sh`: Script para facilitar el despliegue en un Synology NAS
- `check_health.sh`: Script para verificar el estado de la aplicación en el NAS
- `firebase_security.md`: Recomendaciones de seguridad para Firebase

### Uso del script de despliegue

```bash
# Dar permisos de ejecución al script (solo la primera vez)
chmod +x server/deploy_to_nas.sh

# Ejecutar el script
./server/deploy_to_nas.sh <usuario> <ip-nas> <ruta-destino>

# Ejemplo
./server/deploy_to_nas.sh admin 192.168.1.100 /volume1/web/arrayanmed.cl
```

### Configuración de Nginx

Si su Synology NAS utiliza Nginx como servidor web (predeterminado en Web Station), puede utilizar el archivo `server/nginx.conf` como base para su configuración.

Para aplicar esta configuración:
1. Acceda a su NAS mediante SSH
2. Copie el contenido del archivo a la ubicación correspondiente (generalmente `/etc/nginx/conf.d/`)
3. Reinicie el servicio de Nginx

### Configuración de Apache

Si su Synology NAS utiliza Apache, copie el archivo `.htaccess` a la raíz de su aplicación.

### Verificación de estado de la aplicación

El script `check_health.sh` permite verificar que la aplicación está funcionando correctamente:

```bash
# Dar permisos de ejecución al script (solo la primera vez)
chmod +x server/check_health.sh

# Ejecutar el script (utilizará https://arrayanmed.cl por defecto)
./server/check_health.sh

# O especificar una URL diferente
./server/check_health.sh https://arrayanmed.cl
```

Este script verificará que todos los archivos esenciales de la aplicación estén accesibles y responderán con el código HTTP 200.

### Recomendaciones de seguridad para Firebase

El archivo `firebase_security.md` contiene recomendaciones detalladas para configurar Firebase de manera segura cuando la aplicación se ejecuta en un Synology NAS. Se recomienda leer y aplicar estas recomendaciones antes de poner la aplicación en producción.

## Solución de problemas

Si encuentra problemas con la aplicación, verifique:
1. Los logs de error en la carpeta `logs/error.log`
2. La consola del navegador para errores de JavaScript
3. La configuración de Firebase en el archivo `js/firebase-config.js`

## Contacto

Para soporte o consultas:
- Email: info@arrayanmed.cl