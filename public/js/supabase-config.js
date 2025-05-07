// Configuración de Supabase
const SUPABASE_URL = 'https://aigcgrcfbzzfsszrbsid.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZ2NncmNmYnp6ZnNzenJic2lkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIyNDgwMSwiZXhwIjoyMDYxODAwODAxfQ.QyitPa8rd4obmWFEukRacz6DUIeCEvQBAY2Ijv7ahBI';

// Inicialización del cliente de Supabase
let supabase;

document.addEventListener('DOMContentLoaded', async () => {
  // Carga dinámica de la librería Supabase
  await loadSupabaseClient();
  
  // Inicializa Supabase
  initSupabase();
  
  // Verificar si el usuario está autenticado
  const user = supabase.auth.getUser();
  console.log('Estado de autenticación:', user ? 'Autenticado' : 'No autenticado');
});

// Función para cargar la librería de Supabase dinámicamente
async function loadSupabaseClient() {
  return new Promise((resolve, reject) => {
    // Cargar el script de Supabase
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Inicializar cliente de Supabase
function initSupabase() {
  if (typeof supabaseClient !== 'undefined') {
    supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.error('Supabase client no está cargado correctamente');
  }
}

// Función de utilidad para obtener el cliente de Supabase
function getSupabase() {
  if (!supabase) {
    initSupabase();
  }
  return supabase;
}