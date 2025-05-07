#!/bin/bash
# Script para reparar los enlaces de fuentes en todos los archivos HTML

FILES=$(find /Users/rodrigomunoz/Desktop/arrayanmed.cl/public -name "*.html")

for file in $FILES; do
  echo "Procesando: $file"
  
  # Crear respaldo del archivo
  cp "$file" "${file}.bak"
  
  # Reemplazar cualquier combinación incorrecta de enlaces con la versión correcta
  cat "${file}.bak" | 
    sed 's|<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700.*display=swap" rel="stylesheet">|<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">|g' > "$file"
  
  # También actualizar las referencias a las fuentes antiguas en los estilos en línea
  sed -i '' 's|font-family: .Bubblegum Sans., cursive;|font-family: var(--font-heading);|g' "$file"
  sed -i '' 's|font-family: .Patrick Hand., cursive;|font-family: var(--font-heading);|g' "$file"
  sed -i '' 's|font-family: .Short Stack., cursive;|font-family: var(--font-body);|g' "$file"
  sed -i '' 's|font-family: .Comic Neue., cursive;|font-family: var(--font-body);|g' "$file"
  
  echo "Archivo actualizado: $file"
done

echo "Corrección de archivos HTML completada!"