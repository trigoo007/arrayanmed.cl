#!/bin/bash
# Script para reemplazar completamente las etiquetas de Google Fonts en archivos HTML

FILES=$(find /Users/rodrigomunoz/Desktop/arrayanmed.cl/public -name "*.html")

# Etiqueta correcta de Google Fonts
CORRECT_LINK='<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">'

for file in $FILES; do
  echo "Procesando $file..."
  
  # Guardar una copia de seguridad
  cp "$file" "${file}.bak"
  
  # Extraer el contenido hasta head
  head_content=$(sed -n '/<head>/,/<link href="https:/p' "$file" | grep -v '<link href="https:')
  
  # Extraer el contenido después de la última etiqueta link de Google Fonts
  end_content=$(sed -n '/<link href="https.*display=swap" rel="stylesheet">/,$p' "$file" | tail -n +2)
  
  # Crear el archivo con el contenido correcto
  echo "$head_content" > "$file"
  echo "$CORRECT_LINK" >> "$file"
  echo "$end_content" >> "$file"
  
  # También actualizar cualquier referencia antigua a fuentes en los estilos
  sed -i '' 's/font-family: .Bubblegum Sans., cursive;/font-family: var(--font-heading);/g' "$file"
  sed -i '' 's/font-family: .Patrick Hand., cursive;/font-family: var(--font-heading);/g' "$file"
  sed -i '' 's/font-family: .Short Stack., cursive;/font-family: var(--font-body);/g' "$file"
  sed -i '' 's/font-family: .Comic Neue., cursive;/font-family: var(--font-body);/g' "$file"
  
  echo "Archivo actualizado: $file"
done

echo "Reemplazo de fuentes completado!"