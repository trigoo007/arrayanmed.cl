// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxtbThHruQqQZJ6Ks8-dtSJT_fa6_Ylko",
  authDomain: "arrayanmed-3d9be.firebaseapp.com",
  projectId: "arrayanmed-3d9be",
  storageBucket: "arrayanmed-3d9be.firebasestorage.app",
  messagingSenderId: "692686639947",
  appId: "1:692686639947:web:c6f2820d6eb127ba230ece",
  measurementId: "G-7SJTWNNJ9G"
};

// Inicializar Firebase y exportar servicios
function initFirebase() {
  // Inicializar solo si no está ya inicializado
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  return {
    auth: firebase.auth(),
    db: firebase.firestore()
  };
}

// Exportar funciones
window.firebaseApp = {
  config: firebaseConfig,
  init: initFirebase
};