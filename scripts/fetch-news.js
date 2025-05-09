/**
 * Script para obtener noticias sobre salud mental de fuentes confiables
 * Este script está diseñado para ejecutarse a través de GitHub Actions
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Función para realizar peticiones HTTP
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (e) {
            reject(new Error(`Error parsing JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Función para convertir RSS a JSON usando API
async function fetchRssAsJson(rssUrl) {
  try {
    const response = await httpGet(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    return response;
  } catch (error) {
    console.error(`Error fetching RSS from ${rssUrl}:`, error);
    return { items: [] };
  }
}

// Función para buscar artículos relacionados con la salud mental
async function fetchMentalHealthArticles() {
  try {
    // Lista de fuentes RSS de salud mental confiables
    const sources = [
      { url: 'https://www.nimh.nih.gov/news/science-news/index.xml', name: 'NIMH' },
      { url: 'https://psychcentral.com/feed', name: 'PsychCentral' },
      { url: 'https://www.who.int/news/item/feed/atom', name: 'World Health Organization' },
      { url: 'https://www.sciencedaily.com/rss/mind_brain/mental_health.xml', name: 'ScienceDaily' },
      { url: 'https://www.medicalnewstoday.com/newsfeeds/mental-health.xml', name: 'Medical News Today' }
    ];

    // Palabras clave para filtrar contenido relevante
    const mentalHealthKeywords = [
      'salud mental', 'mental health', 'psiquiatría', 'psychiatry', 'trastorno', 'disorder',
      'ansiedad', 'anxiety', 'depresión', 'depression', 'TDAH', 'ADHD', 'autismo', 'autism',
      'terapia', 'therapy', 'psicólogo', 'psychologist', 'psiquiatra', 'psychiatrist',
      'infantil', 'children', 'niños', 'adolescentes', 'adolescents', 'tratamiento', 'treatment'
    ];

    // Obtener artículos de todas las fuentes
    const articlePromises = sources.map(async (source) => {
      const feed = await fetchRssAsJson(source.url);
      
      if (!feed.items || !Array.isArray(feed.items)) {
        console.warn(`No items found in feed from ${source.name}`);
        return [];
      }
      
      // Procesamos cada artículo
      return feed.items.map(item => {
        // Comprobar si el artículo contiene palabras clave relevantes
        const contentText = (item.title + ' ' + (item.description || '') + ' ' + (item.content || '')).toLowerCase();
        const isRelevant = mentalHealthKeywords.some(keyword => contentText.includes(keyword.toLowerCase()));
        
        if (!isRelevant) return null;
        
        // Determinar categorías basadas en palabras clave
        const categories = [];
        
        if (/niño|child|infant|pediatr|adolescen/i.test(contentText)) {
          categories.push('infantil');
        }
        
        if (/tratamiento|treatment|terapia|therapy|intervention/i.test(contentText)) {
          categories.push('tratamientos');
        }
        
        if (/investigación|research|study|estudio|hallazgo|finding/i.test(contentText)) {
          categories.push('investigacion');
        }
        
        if (/prevención|prevention|preventive|prevent|screening/i.test(contentText)) {
          categories.push('prevencion');
        }
        
        // Si no se detectaron categorías específicas, añadir una genérica
        if (categories.length === 0) {
          categories.push('general');
        }
        
        // Extraer la primera imagen si está disponible
        let imageUrl = '';
        if (item.enclosure && item.enclosure.link) {
          imageUrl = item.enclosure.link;
        } else if (item.thumbnail) {
          imageUrl = item.thumbnail;
        } else {
          // Buscar imagen en el contenido utilizando una expresión regular simple
          const imgMatch = (item.content || '').match(/<img[^>]+src="([^">]+)"/i);
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
          } else {
            // Imagen de placeholder por defecto
            imageUrl = 'https://via.placeholder.com/300x200?text=Salud+Mental';
          }
        }
        
        return {
          title: item.title,
          description: item.description 
            ? item.description.replace(/<\/?[^>]+(>|$)/g, '').substring(0, 200) + '...' 
            : 'No hay descripción disponible.',
          image: imageUrl,
          date: item.pubDate || new Date().toISOString(),
          source: source.name,
          link: item.link,
          categories: categories
        };
      }).filter(item => item !== null); // Eliminar artículos que no son relevantes
    });

    // Esperar a que todas las promesas se resuelvan
    const articlesArrays = await Promise.all(articlePromises);
    
    // Aplanar el array de arrays y ordenar por fecha (más reciente primero)
    const allArticles = articlesArrays
      .flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limitar a 20 artículos para mantener el archivo JSON pequeño
    return allArticles.slice(0, 20);
  } catch (error) {
    console.error('Error fetching mental health articles:', error);
    return [];
  }
}

// Función principal que se ejecuta cuando se llama al script
async function main() {
  try {
    console.log('Iniciando la obtención de noticias sobre salud mental...');
    
    // Obtener artículos
    const articles = await fetchMentalHealthArticles();
    console.log(`Se obtuvieron ${articles.length} artículos relevantes.`);
    
    // Crear objecto con la información
    const newsData = {
      lastUpdated: new Date().toISOString(),
      articles: articles
    };
    
    // Guardar en un archivo JSON
    const outputDir = path.join(__dirname, '..', 'public', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'news.json'), 
      JSON.stringify(newsData, null, 2)
    );
    
    console.log('Archivo de noticias generado correctamente.');
  } catch (error) {
    console.error('Error en el proceso de obtención de noticias:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();