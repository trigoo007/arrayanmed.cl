#!/bin/bash
# Script para corregir los enlaces de Google Fonts en todos los archivos HTML

FILES=$(find /Users/rodrigomunoz/Desktop/arrayanmed.cl/public -name "*.html")

for file in $FILES; do
  # Reemplazar el patrón incorrecto con el correcto
  sed -i '' 's|<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700<link href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Comic+Neue:wght@400;700&family=Patrick+Hand&family=Short+Stack&display=swap" rel="stylesheet">family=Quicksand:wght@400;500;600;700<link href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Comic+Neue:wght@400;700&family=Patrick+Hand&family=Short+Stack&display=swap" rel="stylesheet">display=swap" rel="stylesheet">|<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">|g' "$file"
done

echo "Corrección de fuentes completada!"