#!/bin/bash
# Script para desplegar la aplicación en un Synology NAS para el dominio arrayanmed.cl
# Uso: ./deploy_to_nas.sh <usuario> <ip-nas> <ruta-destino>
# Ejemplo: ./deploy_to_nas.sh admin 192.168.1.100 /volume1/web/arrayanmed.cl

# Comprobar los argumentos
if [ $# -ne 3 ]; then
    echo "Uso: $0 <usuario> <ip-nas> <ruta-destino>"
    echo "Ejemplo: $0 admin 192.168.1.100 /volume1/web/arrayanmed.cl"
    exit 1
fi

# Asignar argumentos a variables
NAS_USER=$1
NAS_IP=$2
NAS_PATH=$3

echo "=== Iniciando despliegue en Synology NAS ==="
echo "Usuario: $NAS_USER"
echo "IP del NAS: $NAS_IP"
echo "Ruta destino: $NAS_PATH"

# Crear directorio para logs si no existe
echo "Verificando directorio de logs en sistema local..."
if [ ! -d "../logs" ]; then
    mkdir -p ../logs
    echo "Directorio de logs creado."
fi
touch ../logs/access.log
touch ../logs/error.log
echo "Archivos de log verificados."

# Preparar los archivos para subir
echo "Preparando archivos..."
TEMP_DIR=$(mktemp -d)
cp -r ../public/* $TEMP_DIR/
cp -r ../logs $TEMP_DIR/
cp server/.htaccess $TEMP_DIR/ 2>/dev/null
echo "Archivos preparados en directorio temporal."

# Crear directorios necesarios en el NAS
echo "Creando estructura de directorios en el NAS..."
ssh $NAS_USER@$NAS_IP "mkdir -p $NAS_PATH/logs"

# Subir los archivos al NAS
echo "Subiendo archivos al NAS..."
rsync -avz --progress $TEMP_DIR/ $NAS_USER@$NAS_IP:$NAS_PATH/
echo "Archivos subidos correctamente."

# Configurar permisos
echo "Configurando permisos..."
ssh $NAS_USER@$NAS_IP "sudo chown -R http:http $NAS_PATH && sudo chmod -R 755 $NAS_PATH && sudo chmod -R 644 $NAS_PATH/logs/*.log"
echo "Permisos configurados."

# Limpiar directorio temporal
rm -rf $TEMP_DIR
echo "Directorio temporal eliminado."

echo "=== Despliegue completado ==="
echo "La aplicación estará disponible en: https://arrayanmed.cl"
echo "Asegúrese de haber configurado correctamente:"
echo "1. El host virtual en Web Station para el dominio arrayanmed.cl"
echo "2. Los registros DNS para que arrayanmed.cl apunte a la IP pública del NAS"
echo "3. El reenvío de puertos en su router (80 y 443)"
echo "4. El certificado SSL para el dominio arrayanmed.cl"