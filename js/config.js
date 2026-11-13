/* =====================================================================
   CONFIGURACIÓN GENERAL DE LA WEB
   ---------------------------------------------------------------------
   Aquí solo hay ajustes técnicos. Los textos, pasos y preguntas de la
   formación están en  js/contenido.js
   ===================================================================== */

window.CONFIG = {
  // Enlace de la escena 3D (Spline → Export → Code Export → Vanilla JS).
  // Si actualizas la escena en Spline y pulsas "Update" en el panel de
  // exportación, el enlace NO cambia: la web cargará la versión nueva sola.
  escenaURL: 'https://prod.spline.design/3ShuXhwdu1Ul2ntK/scene.splinecode',

  // Versión del motor de Spline que se descarga para mostrar la escena.
  splineRuntime: 'https://cdn.jsdelivr.net/npm/@splinetool/runtime@2.0.183/build/runtime.js',

  // Nombre de la cámara dentro de la escena de Spline (no cambiar si no
  // se renombra en Spline).
  camara: {
    nombre: 'Camara Formacion',
    // Ángulo con el que la cámara llega a cada zona (en grados).
    // Una zona puede usar otro ángulo añadiendo azimut/elevacion en su
    // "camara" dentro de contenido.js.
    azimut: 32,       // giro horizontal
    elevacion: 36,    // inclinación (0 = a ras de suelo, 90 = desde arriba)
    fov: 45,          // campo de visión de la cámara de Spline (por defecto 45)
    duracionVueloMs: 1300
  },

  // Puntos numerados: tamaño del círculo (radio del "Borde" en Spline) y
  // cuánto crecen al pasar el ratón por encima.
  puntos: { radio: 19, aumentoHover: 1.25 },

  // Colores al responder una pregunta "señala en la escena".
  coloresRespuesta: {
    elegido: '#f6c400',     // amarillo: lo que ha pulsado el usuario
    correcto: '#1f9d55',    // verde
    incorrecto: '#d8342b',  // rojo
    esperaMs: 550           // tiempo en amarillo antes de mostrar el resultado
  },

  // Calidad del 3D. Bajar resolucionMaxima (p. ej. a 1) hace la web más
  // fluida en ordenadores lentos; subirla (2) la ve más nítida.
  calidad: { resolucionMaxima: 1.25 },

  // Libertad de movimiento del usuario en el 3D.
  controles: {
    giroMaximo: 40,          // grados que puede girar a cada lado
    elevacionMinima: 18,
    elevacionMaxima: 72,
    distanciaMinima: 280,    // zoom máximo (más pequeño = más cerca)
    distanciaMaxima: 3200,   // zoom mínimo
    // Hasta dónde se puede desplazar el centro de la vista (el taller)
    zona: { xMin: -600, xMax: 850, zMin: -480, zMax: 480 }
  },

  // Vista general del taller (al empezar y al pulsar "Vista general").
  vistaGeneral: { x: 125, y: 40, z: 0, distancia: 2400 },

  // Aciertos mínimos por zona para aprobarla (sobre el número de preguntas).
  aciertosParaAprobar: 2,

  // Si es true, las zonas se desbloquean en orden (1 → 2 → 3 ...).
  zonasEnOrden: true,

  // Clave con la que se guarda el progreso en el navegador.
  claveProgreso: 'rodi-formacion-primer-dia-v1'
};
