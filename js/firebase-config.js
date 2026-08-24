// ========================================================
// CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE Y ESTADOS
// ========================================================
const firebaseConfig = {
    apiKey: "AIzaSy" + "FakeKeyForSafety_FirebaseAutoFillsThis", 
    authDomain: "album-jjandv.firebaseapp.com",
    databaseURL: "https://album-jjandv-default-rtdb.firebaseio.com",
    projectId: "album-jjandv",
    storageBucket: "album-jjandv.appspot.com",
    appId: "1:232889354831:web:67743b9bd4b455d202783a"
};

// Inicialización de Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Variables globales compartidas por los módulos
let listaUsuariosGlobal = [];
let usuarioActual = null;

// Identificadores de hologramas (en el álbum y generador)
const IDS_HOLOGRAFICOS = [6, 10, 15, 19, 20];

// BANCO DE FIGURAS DISPONIBLES
const BANCO_FIGURAS = [
    { id: 1, nombre: 'Círculo', clase: 'circulo' },
    { id: 2, nombre: 'Cuadrado', clase: 'cuadrado' },
    { id: 3, nombre: 'Triángulo', clase: 'triangulo' },
    { id: 4, nombre: 'Rectángulo', clase: 'rectangulo' },
    { id: 5, nombre: 'Óvalo', clase: 'ovalo' },
    { id: 6, nombre: 'Rombo', clase: 'rombo' },
    { id: 7, nombre: 'Pentágono', clase: 'pentagono' },
    { id: 8, nombre: 'Hexágono', clase: 'hexagono' },
    { id: 9, nombre: 'Trapecio', clase: 'trapecio' },
    { id: 10, nombre: 'Estrella', clase: 'estrella' },
    { id: 11, nombre: 'Lápiz', clase: 'lapiz' },
    { id: 12, nombre: 'Regla', clase: 'regla' },
    { id: 13, nombre: 'Borrador', clase: 'borrador' },
    { id: 14, nombre: 'Libro', clase: 'libro' },
    { id: 15, nombre: 'Mochila', clase: 'mochila' },
    { id: 16, nombre: 'Pincel', clase: 'pincel' },
    { id: 17, nombre: 'Tijeras', clase: 'tijeras' },
    { id: 18, nombre: 'Brújula', clase: 'brujula' },
    { id: 19, nombre: 'Manzana', clase: 'manzana' },
    { id: 20, nombre: 'Medalla', clase: 'medalla' }
];

// Identificador único para separar sesiones por pestaña en el mismo navegador
if (!sessionStorage.getItem('tab_id')) {
    sessionStorage.setItem('tab_id', 'tab_' + Date.now() + Math.random().toString(36).substr(2, 5));
}
const TAB_ID = sessionStorage.getItem('tab_id');
const CLAVE_SESION_PESTANA = `sesion_activa_${TAB_ID}`;

// Función utilitaria para sincronizar la base de datos
function guardarUsuariosEnNube(lista) {
    db.ref('usuarios').set(lista);
}