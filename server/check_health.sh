#!/bin/bash
# Script para verificar el estado de salud de la aplicación en Synology NAS
# Uso: ./check_health.sh [url-base]
# Ejemplo: ./check_health.sh https://arrayanmed.cl
# Si no se proporciona URL, se utilizará https://arrayanmed.cl por defecto

# Comprobar los argumentos
if [ $# -eq 0 ]; then
    # Si no se proporciona URL, usar arrayanmed.cl por defecto
    BASE_URL="https://arrayanmed.cl"
    echo "No se ha proporcionado URL, utilizando $BASE_URL por defecto"
elif [ $# -eq 1 ]; then
    BASE_URL=$1
else
    echo "Uso: $0 [url-base]"
    echo "Ejemplo: $0 https://arrayanmed.cl"
    exit 1
fi
PAGES=("index.html" "login.html" "registro.html" "pendiente.html" "panel/recetas.html" "panel/certificados.html")
CSS_URL="$BASE_URL/css/styles.css"
JS_URLS=("$BASE_URL/js/auth.js" "$BASE_URL/js/firebase-config.js" "$BASE_URL/js/recetas.js" "$BASE_URL/js/certificados.js")
IMG_URLS=("$BASE_URL/img/logo.png" "$BASE_URL/img/logo.svg")

echo "=== Comprobación de salud de la aplicación ==="
echo "URL base: $BASE_URL"
echo

# Función para verificar una URL y mostrar el resultado
check_url() {
    local url=$1
    local description=$2
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ $status_code -eq 200 ]; then
        echo "✅ $description: OK (HTTP $status_code)"
    else
        echo "❌ $description: ERROR (HTTP $status_code) - $url"
    fi
}

# Verificar la conectividad básica
echo "Comprobando conectividad..."
check_url "$BASE_URL" "Conexión a URL base"
echo

# Verificar páginas HTML
echo "Comprobando páginas HTML..."
for page in "${PAGES[@]}"; do
    check_url "$BASE_URL/$page" "Página $page"
done
echo

# Verificar archivos CSS
echo "Comprobando recursos CSS..."
check_url "$CSS_URL" "Archivo CSS principal"
echo

# Verificar archivos JavaScript
echo "Comprobando recursos JavaScript..."
for js_url in "${JS_URLS[@]}"; do
    js_name=$(basename "$js_url")
    check_url "$js_url" "JavaScript $js_name"
done
echo

# Verificar imágenes
echo "Comprobando recursos de imagen..."
for img_url in "${IMG_URLS[@]}"; do
    img_name=$(basename "$img_url")
    check_url "$img_url" "Imagen $img_name"
done
echo

# Verificar Firebase
echo "Comprobando conexión a Firebase..."
echo "Nota: Esta es una comprobación pasiva, solo verifica que los archivos estén presentes."
echo "Para una verificación completa, debe iniciar sesión en la aplicación."
check_url "$BASE_URL/js/firebase-config.js" "Configuración de Firebase"
echo

echo "=== Verificación de firewall y DNS ==="
echo "Si está accediendo desde Internet, verifique que su firewall permite conexiones a:"
echo "- Puerto 80 (HTTP) - Requerido"
echo "- Puerto 443 (HTTPS) - Recomendado"
echo
echo "Si está utilizando un dominio personalizado, verifique que los registros DNS apuntan a la IP correcta de su NAS."
echo

echo "=== Verificación completada ==="
echo "Si ha encontrado errores, verifique:"
echo "1. Que todos los archivos se hayan subido correctamente"
echo "2. Que los permisos de los archivos sean correctos"
echo "3. Que la configuración del host virtual en Web Station sea correcta"
echo "4. Que los registros DNS (si corresponde) estén configurados correctamente"
echo "5. Consulte los logs en logs/error.log para más detalles sobre posibles errores"