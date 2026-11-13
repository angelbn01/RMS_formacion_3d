/* =====================================================================
   LÓGICA DE LA FORMACIÓN
   ---------------------------------------------------------------------
   Normalmente NO hace falta tocar este archivo.
   · Textos y preguntas  → js/contenido.js
   · Ajustes técnicos    → js/config.js
   · Colores y diseño    → css/estilos.css

   Índice:
     1. Estado y progreso guardado
     2. Escena 3D (carga, cámara y clics)
     3. Pantallas del panel (bienvenida, pasos, preguntas, resultados)
     4. Barra de zonas y progreso
     5. Arranque
   ===================================================================== */

(function () {
  'use strict';

  const CONFIG = window.CONFIG;
  const F = window.FORMACION;
  const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

  const $panel = document.getElementById('panel');
  const $zonas = document.getElementById('zonas');
  const $aviso = document.getElementById('aviso-escena');

  /* ===================================================================
     1. ESTADO Y PROGRESO GUARDADO
     =================================================================== */

  // Lo que se guarda en el navegador entre visitas.
  let progreso = cargarProgreso();

  // Estado de la sesión actual (no se guarda).
  const estado = {
    pantalla: 'bienvenida',  // bienvenida | pasos | pregunta | resultadoZona | final
    zona: null,               // objeto zona de contenido.js
    paso: 0,
    pregunta: 0,
    aciertos: 0,
    respondida: false,
    esperandoClicEscena: false
  };

  function progresoVacio() {
    return { nombre: '', resultados: {}, fechaFin: null };
  }

  function cargarProgreso() {
    try {
      const guardado = JSON.parse(localStorage.getItem(CONFIG.claveProgreso));
      if (guardado && typeof guardado === 'object' && guardado.resultados) return guardado;
    } catch (e) { /* sin acceso al almacenamiento: se empieza de cero */ }
    return progresoVacio();
  }

  function guardarProgreso() {
    try { localStorage.setItem(CONFIG.claveProgreso, JSON.stringify(progreso)); } catch (e) { /* ignorar */ }
  }

  const totalPreguntas = (z) => z.preguntas.length;
  const estaAprobada = (z) => {
    const r = progreso.resultados[z.numero];
    return !!(r && r.aprobada);
  };
  const zonasAprobadas = () => F.zonas.filter(estaAprobada).length;

  function estaDesbloqueada(z) {
    if (!CONFIG.zonasEnOrden) return true;
    const i = F.zonas.indexOf(z);
    return i === 0 || estaAprobada(F.zonas[i - 1]);
  }

  /* ===================================================================
     2. ESCENA 3D
     =================================================================== */

  let app = null;          // aplicación de Spline
  let camara = null;       // cámara de la escena
  let vuelo = null;        // animación de cámara en curso
  let puntos = [];         // [{ numero, grupo, activo: [objetos amarillos] }]

  // La cámara se describe con un "punto al que mira" (x, y, z), una distancia
  // y dos ángulos: azimut (giro horizontal) y elevación (inclinación).
  const vista = { x: 0, y: 0, z: 0, distancia: 2000, azimut: 32, elevacion: 36 };
  const rad = (g) => (g * Math.PI) / 180;
  const limitar = (v, min, max) => Math.max(min, Math.min(max, v));

  async function cargarEscena() {
    const lienzo = document.getElementById('lienzo-3d');
    try {
      const modulo = await import(CONFIG.splineRuntime);
      app = new modulo.Application(lienzo);
      // Limita la resolución del 3D (en pantallas de alta densidad dibujar
      // a resolución completa hace que toda la web vaya lenta).
      const resolucion = Math.min(window.devicePixelRatio || 1, CONFIG.calidad.resolucionMaxima);
      app._getPixelRatio = () => resolucion;
      // "?v=..." evita que el navegador use una copia antigua de la escena
      // después de pulsar "Update" en Spline.
      await app.load(CONFIG.escenaURL + '?v=' + Date.now());
      camara = app.findObjectByName(CONFIG.camara.nombre);
      if (!camara) console.warn('No se encuentra la cámara "' + CONFIG.camara.nombre + '" en la escena.');
      puntos = F.zonas.map((z) => ({
        numero: z.numero,
        grupo: app.findObjectByName(z.punto),
        escalaBase: (app.findObjectByName(z.punto) || { scale: { x: 1 } }).scale.x,
        activo: [app.findObjectByName(z.punto + ' Activo Disco'), app.findObjectByName(z.punto + ' Activo Numero')].filter(Boolean)
      }));
      puntos.forEach((p) => {
        if (p.activo.length < 2) console.warn('Faltan en Spline los objetos "Punto ' + p.numero + ' Activo Disco/Numero".');
      });
      todosLosObjetos = app.getAllObjects();
      window.formacion3D = { app: app, vista: vista }; // ayuda para depurar desde la consola (F12)
      app.addEventListener('mouseDown', (e) => {
        objetoPulsado = { nombre: e && e.target ? e.target.name : '', t: performance.now() };
      });
      activarControles(lienzo);
      volarA(CONFIG.vistaGeneral, true);
      resaltarPunto(estado.zona ? estado.zona.numero : null);
    } catch (err) {
      console.error(err);
      mostrarAviso('No se ha podido cargar el taller 3D. Revisa la conexión a internet.', false);
    } finally {
      document.getElementById('cargando').classList.add('oculto');
    }
  }

  // Coloca la cámara según "vista". También gira los puntos numerados para
  // que siempre miren de frente a la cámara.
  function aplicarVista() {
    if (!camara) return;
    const a = rad(vista.azimut), e = rad(vista.elevacion);
    camara.position.x = vista.x + Math.sin(a) * Math.cos(e) * vista.distancia;
    camara.position.y = vista.y + Math.sin(e) * vista.distancia;
    camara.position.z = vista.z + Math.cos(a) * Math.cos(e) * vista.distancia;
    // Rotación equivalente (orden XYZ) a "girar azimut y luego inclinar".
    const b = -e;
    const rot = {
      x: Math.atan2(Math.sin(b), Math.cos(a) * Math.cos(b)),
      y: Math.asin(Math.sin(a) * Math.cos(b)),
      z: Math.atan2(-Math.sin(a) * Math.sin(b), Math.cos(a))
    };
    camara.rotation.x = rot.x; camara.rotation.y = rot.y; camara.rotation.z = rot.z;
    puntos.forEach((p) => {
      if (!p.grupo) return;
      p.grupo.rotation.x = rot.x; p.grupo.rotation.y = rot.y; p.grupo.rotation.z = rot.z;
    });
    if (app && app.requestRender) app.requestRender();
  }

  // Vuela suavemente hasta un destino { x, y, z, distancia, azimut?, elevacion? }.
  function volarA(destino, inmediato) {
    const fin = {
      x: destino.x, y: destino.y, z: destino.z, distancia: destino.distancia,
      azimut: destino.azimut != null ? destino.azimut : CONFIG.camara.azimut,
      elevacion: destino.elevacion != null ? destino.elevacion : CONFIG.camara.elevacion
    };
    if (vuelo) cancelAnimationFrame(vuelo);
    vuelo = null;
    if (inmediato || !camara) { Object.assign(vista, fin); aplicarVista(); return; }

    const inicio = Object.assign({}, vista);
    const t0 = performance.now();
    const duracion = CONFIG.camara.duracionVueloMs;
    const suavizar = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const fotograma = (ahora) => {
      const t = Math.min(1, (ahora - t0) / duracion);
      const k = suavizar(t);
      Object.keys(fin).forEach((c) => { vista[c] = inicio[c] + (fin[c] - inicio[c]) * k; });
      aplicarVista();
      vuelo = t < 1 ? requestAnimationFrame(fotograma) : null;
    };
    vuelo = requestAnimationFrame(fotograma);
  }

  // Pone en amarillo el punto de la zona abierta (null = ninguno).
  function resaltarPunto(numero) {
    puntos.forEach((p) => p.activo.forEach((o) => { o.visible = p.numero === numero; }));
    if (app && app.requestRender) app.requestRender();
  }

  /* ---------- Proyección: dónde cae en pantalla un punto 3D ----------
     Sirve para saber si el ratón está encima de un punto numerado (hover). */
  function proyectar(P) {
    const lienzo = document.getElementById('lienzo-3d');
    const r = lienzo.getBoundingClientRect();
    const a = rad(vista.azimut), e = rad(vista.elevacion);
    const dir = [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
    const cam = [vista.x + dir[0] * vista.distancia, vista.y + dir[1] * vista.distancia, vista.z + dir[2] * vista.distancia];
    const frente = [-dir[0], -dir[1], -dir[2]];
    const derecha = [Math.cos(a), 0, -Math.sin(a)];
    const arriba = [
      derecha[1] * frente[2] - derecha[2] * frente[1],
      derecha[2] * frente[0] - derecha[0] * frente[2],
      derecha[0] * frente[1] - derecha[1] * frente[0]
    ];
    const d = [P.x - cam[0], P.y - cam[1], P.z - cam[2]];
    const punto = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    const prof = punto(d, frente);
    if (prof <= 1) return null; // detrás de la cámara
    const t = Math.tan(rad(CONFIG.camara.fov) / 2);
    const nx = punto(d, derecha) / (prof * t * (r.width / r.height));
    const ny = punto(d, arriba) / (prof * t);
    return {
      x: (nx + 1) / 2 * r.width,
      y: (1 - ny) / 2 * r.height,
      pxPorUnidad: (r.height / 2) / (prof * t),
      prof: prof
    };
  }

  let puntoHover = null; // punto numerado bajo el ratón

  function buscarPuntoBajo(x, y) {
    let mejor = null;
    puntos.forEach((p) => {
      if (!p.grupo) return;
      const s = proyectar(p.grupo.position);
      if (!s) return;
      const radio = CONFIG.puntos.radio * p.escalaBase * s.pxPorUnidad * 1.15;
      if (Math.hypot(s.x - x, s.y - y) <= radio && (!mejor || s.prof < mejor.prof)) mejor = { p: p, prof: s.prof };
    });
    return mejor ? mejor.p : null;
  }

  // Al pasar el ratón por un punto: crece y el cursor pasa a ser una mano.
  function ponerHover(p) {
    if (p === puntoHover) return;
    if (puntoHover && puntoHover.grupo) escalarPunto(puntoHover, 1);
    puntoHover = p;
    document.getElementById('lienzo-3d').classList.toggle('sobre-punto', !!p);
    if (p) escalarPunto(p, CONFIG.puntos.aumentoHover);
  }

  function escalarPunto(p, factor) {
    const s = p.escalaBase * factor;
    p.grupo.scale.x = s; p.grupo.scale.y = s; p.grupo.scale.z = s;
  }

  /* ---------- Colores de respuesta en las preguntas "señala" ----------
     Pinta objetos de la escena (amarillo al elegir, luego verde o rojo) y
     guarda el color original para devolverlo después.                       */
  const coloresOriginales = new Map();
  let todosLosObjetos = [];

  function capaColor(o) {
    const capas = o.material && o.material.layers;
    return capas ? capas.find((l) => l.type === 'color') : null;
  }
  function aHex(c) {
    if (typeof c === 'string') return c;
    const h = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
    return '#' + h(c.r) + h(c.g) + h(c.b);
  }
  function pintarObjetos(filtro, color) {
    todosLosObjetos.forEach((o) => {
      if (!o.name || !filtro(o.name)) return;
      const capa = capaColor(o);
      if (!capa) return;
      if (!coloresOriginales.has(o)) coloresOriginales.set(o, aHex(capa.color));
      capa.color = color;
    });
  }
  function restaurarColores() {
    coloresOriginales.forEach((hex, o) => { const capa = capaColor(o); if (capa) capa.color = hex; });
    coloresOriginales.clear();
  }

  // Qué objetos se iluminan juntos al pulsar uno (p. ej. todo "Coche 2").
  function familiaDe(nombre, prefijosCorrectos) {
    const correcto = prefijosCorrectos.find((pre) => nombre.indexOf(pre) === 0);
    if (correcto) return (n) => n.indexOf(correcto) === 0;
    const sinUltima = nombre.replace(/\s+\S+$/, '');
    if (sinUltima.split(' ').length >= 2) return (n) => n.indexOf(sinUltima + ' ') === 0 || n === sinUltima;
    return (n) => n === nombre;
  }

  // Vista a la que vuelve el botón "Centrar".
  function vistaActual() {
    return estado.zona ? estado.zona.camara : CONFIG.vistaGeneral;
  }

  /* ---------- Controles: girar, zoom y desplazar ----------
     Ratón:   arrastrar = girar · rueda = zoom · clic derecho (o Mayús) + arrastrar = desplazar
     Táctil:  1 dedo = girar · 2 dedos = zoom y desplazar
     Los límites están en config.js → controles                                  */
  let objetoPulsado = null;   // último objeto 3D bajo el ratón al pulsar (lo informa Spline)

  function activarControles(lienzo) {
    const C = CONFIG.controles;
    const dedos = new Map();
    let inicio = null;          // { x, y, t } de la pulsación
    let movido = 0;
    let distanciaPinza = 0;

    const parar = () => { if (vuelo) { cancelAnimationFrame(vuelo); vuelo = null; } };

    function girar(dx, dy) {
      const base = CONFIG.camara.azimut;
      vista.azimut = limitar(vista.azimut - dx * 0.25, base - C.giroMaximo, base + C.giroMaximo);
      vista.elevacion = limitar(vista.elevacion + dy * 0.2, C.elevacionMinima, C.elevacionMaxima);
    }
    function desplazar(dx, dy) {
      const a = rad(vista.azimut);
      const k = vista.distancia * 0.0016;
      // derecha de la pantalla y "hacia el fondo" sobre el suelo
      vista.x += (-Math.cos(a) * dx - Math.sin(a) * dy) * k;
      vista.z += (Math.sin(a) * dx - Math.cos(a) * dy) * k;
      vista.x = limitar(vista.x, C.zona.xMin, C.zona.xMax);
      vista.z = limitar(vista.z, C.zona.zMin, C.zona.zMax);
    }
    function zoom(factor) {
      vista.distancia = limitar(vista.distancia * factor, C.distanciaMinima, C.distanciaMaxima);
    }

    lienzo.addEventListener('contextmenu', (e) => e.preventDefault());

    lienzo.addEventListener('pointerdown', (e) => {
      parar();
      dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (dedos.size === 1) { inicio = { x: e.clientX, y: e.clientY, t: performance.now() }; movido = 0; }
      if (dedos.size === 2) {
        const [p1, p2] = [...dedos.values()];
        distanciaPinza = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        movido = 99; // con dos dedos nunca es un clic
      }
      lienzo.setPointerCapture(e.pointerId);
      lienzo.classList.add('arrastrando');
    });

    lienzo.addEventListener('pointermove', (e) => {
      const previo = dedos.get(e.pointerId);
      if (!previo) {
        // Ratón moviéndose sin pulsar: ¿está encima de un punto numerado?
        if (e.pointerType === 'mouse') {
          const r = lienzo.getBoundingClientRect();
          ponerHover(estado.esperandoClicEscena ? null : buscarPuntoBajo(e.clientX - r.left, e.clientY - r.top));
        }
        return;
      }
      const dx = e.clientX - previo.x, dy = e.clientY - previo.y;
      dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
      movido += Math.abs(dx) + Math.abs(dy);
      if (movido < 6) return; // pequeños temblores al hacer clic no mueven nada

      if (dedos.size === 2) {
        const [p1, p2] = [...dedos.values()];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (distanciaPinza) zoom(distanciaPinza / d);
        distanciaPinza = d;
        desplazar(dx / 2, dy / 2);
      } else if (e.buttons === 2 || e.shiftKey) {
        desplazar(dx, dy);
      } else {
        girar(dx, dy);
      }
      aplicarVista();
    });

    const soltar = (e) => {
      dedos.delete(e.pointerId);
      if (dedos.size === 0) {
        lienzo.classList.remove('arrastrando');
        // Si apenas se ha movido, es un clic
        if (inicio && movido < 6) {
          const r = lienzo.getBoundingClientRect();
          const punto = estado.esperandoClicEscena ? null : buscarPuntoBajo(e.clientX - r.left, e.clientY - r.top);
          if (punto) {
            const zona = F.zonas.find((z) => z.numero === punto.numero);
            if (zona) abrirZona(zona);
          } else if (objetoPulsado && objetoPulsado.t >= inicio.t - 100) {
            alHacerClicEnEscena(objetoPulsado.nombre);
          }
        }
        objetoPulsado = null;
        inicio = null;
      }
    };
    lienzo.addEventListener('pointerup', soltar);
    lienzo.addEventListener('pointercancel', soltar);
    lienzo.addEventListener('pointerleave', () => { if (dedos.size === 0) ponerHover(null); });

    lienzo.addEventListener('wheel', (e) => {
      e.preventDefault();
      parar();
      zoom(Math.exp(e.deltaY * 0.0012));
      aplicarVista();
    }, { passive: false });

    // Botones + / − / centrar
    document.getElementById('controles-3d').addEventListener('click', (e) => {
      const b = e.target.closest('[data-control]');
      if (!b) return;
      parar();
      if (b.dataset.control === 'acercar') { zoom(0.8); aplicarVista(); }
      if (b.dataset.control === 'alejar') { zoom(1.25); aplicarVista(); }
      if (b.dataset.control === 'centrar') volarA(vistaActual());
    });
  }

  // Todos los clics sobre objetos 3D llegan aquí.
  function alHacerClicEnEscena(nombre) {
    if (!nombre) return;

    // a) Respondiendo una pregunta "señala en la escena"
    if (estado.esperandoClicEscena) {
      if (/^Punto \d+/.test(nombre)) return; // los puntos numerados no cuentan
      responderEscena(nombre);
      return;
    }

    // b) Clic en un punto numerado → abrir esa zona
    const m = nombre.match(/^Punto (\d+)/);
    if (m) {
      const zona = F.zonas.find((z) => z.numero === Number(m[1]));
      if (zona) abrirZona(zona);
    }
  }

  let temporizadorAviso = null;
  function mostrarAviso(texto, pulso, segundos) {
    clearTimeout(temporizadorAviso);
    $aviso.textContent = texto;
    $aviso.hidden = false;
    $aviso.classList.toggle('pulso', !!pulso);
    if (segundos) temporizadorAviso = setTimeout(ocultarAviso, segundos * 1000);
  }
  function ocultarAviso() { $aviso.hidden = true; $aviso.classList.remove('pulso'); }

  /* ===================================================================
     3. PANTALLAS DEL PANEL
     =================================================================== */

  // Pequeña ayuda para crear HTML seguro a partir de texto.
  function esc(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function pintar(html) {
    // Al salir de una pregunta "señala", los objetos recuperan su color.
    if (estado.pantalla !== 'pregunta') {
      restaurarColores();
      document.getElementById('lienzo-3d').classList.remove('modo-senalar');
    }
    $panel.innerHTML = html;
    $panel.scrollTop = 0;
    pintarZonas();
  }

  function cabeceraZona(z) {
    return '<span class="etiqueta"><span class="numero-zona">' + z.numero + '</span>Zona ' +
      z.numero + ' de ' + F.zonas.length + '</span><h2>' + esc(z.titulo) + '</h2>';
  }

  /* ---------- Bienvenida ---------- */
  function pantallaBienvenida() {
    Object.assign(estado, { pantalla: 'bienvenida', zona: null, esperandoClicEscena: false });
    ocultarAviso();
    volarA(CONFIG.vistaGeneral);
    resaltarPunto(null);

    const siguiente = F.zonas.find((z) => !estaAprobada(z)) || F.zonas[0];
    const empezado = zonasAprobadas() > 0;
    const terminado = zonasAprobadas() === F.zonas.length;
    const totalPreg = F.zonas.reduce((s, z) => s + totalPreguntas(z), 0);

    pintar(
      '<span class="etiqueta">' + esc(F.subtitulo) + '</span>' +
      '<h1>' + esc(F.intro.titulo) + '</h1>' +
      '<p class="texto-grande">' + esc(F.intro.texto) + '</p>' +
      '<div class="datos">' +
        '<span class="dato"><strong>' + F.zonas.length + '</strong> zonas</span>' +
        '<span class="dato"><strong>' + totalPreg + '</strong> preguntas</span>' +
        '<span class="dato"><strong>' + esc(F.intro.duracion) + '</strong></span>' +
      '</div>' +
      '<p>Pulsa los <strong>puntos numerados</strong> del taller (o pasa el ratón por encima) o los botones de abajo para moverte por las zonas.</p>' +
      '<label class="campo">Tu nombre (aparecerá en el certificado)' +
        '<input id="campo-nombre" type="text" maxlength="60" autocomplete="name" placeholder="Nombre y apellidos" value="' + esc(progreso.nombre) + '">' +
      '</label>' +
      '<div class="acciones">' +
        (terminado
          ? '<button class="boton" data-accion="final">Ver mi resultado</button>'
          : '<button class="boton" data-accion="empezar" data-zona="' + siguiente.numero + '">' +
              (empezado ? 'Continuar por la zona ' + siguiente.numero : 'Empezar por la zona 1') + '</button>') +
      '</div>' +
      (empezado ? '<button class="enlace" data-accion="reiniciar">Borrar mi progreso y empezar de cero</button>' : '')
    );
  }

  /* ---------- Abrir zona: pasos de explicación ---------- */
  function abrirZona(z) {
    if (!estaDesbloqueada(z)) {
      const anterior = F.zonas[F.zonas.indexOf(z) - 1];
      mostrarAviso('🔒 Primero completa la zona ' + anterior.numero + ': ' + anterior.titulo, false, 3);
      return;
    }
    ocultarAviso();
    Object.assign(estado, { zona: z, paso: 0, pregunta: 0, aciertos: 0, esperandoClicEscena: false });
    volarA(z.camara);
    resaltarPunto(z.numero);
    pantallaPaso();
  }

  function pantallaPaso() {
    const z = estado.zona;
    const p = z.pasos[estado.paso];
    estado.pantalla = 'pasos';
    const ultimo = estado.paso === z.pasos.length - 1;

    pintar(
      cabeceraZona(z) +
      '<p>' + esc(z.resumen) + '</p>' +
      '<div class="puntos-pasos">' + z.pasos.map((_, i) => '<span class="' + (i <= estado.paso ? 'hecho' : '') + '"></span>').join('') + '</div>' +
      '<div class="tarjeta-paso">' +
        '<span class="etiqueta">Paso ' + (estado.paso + 1) + ' de ' + z.pasos.length + '</span>' +
        '<h3>' + esc(p.titulo) + '</h3>' +
        '<p>' + esc(p.texto) + '</p>' +
      '</div>' +
      '<div class="acciones">' +
        '<button class="boton secundario" data-accion="paso-anterior">' + (estado.paso === 0 ? '← Inicio' : '← Anterior') + '</button>' +
        '<button class="boton" data-accion="paso-siguiente">' + (ultimo ? 'Ir al cuestionario →' : 'Siguiente →') + '</button>' +
      '</div>'
    );
  }

  /* ---------- Preguntas ---------- */
  function pantallaPregunta() {
    const z = estado.zona;
    const q = z.preguntas[estado.pregunta];
    estado.pantalla = 'pregunta';
    estado.respondida = false;
    restaurarColores();
    document.getElementById('lienzo-3d').classList.toggle('modo-senalar', q.tipo === 'escena');

    let cuerpo = '';
    if (q.tipo === 'escena') {
      estado.esperandoClicEscena = true;
      ponerHover(null);
      mostrarAviso('👆 Haz clic en el objeto correcto del taller', true);
      cuerpo =
        '<div class="caja-escena"><span class="icono">🖱️</span>' +
        '<p><strong>Pregunta de escena:</strong> busca el objeto en el taller 3D y haz clic sobre él.</p></div>' +
        '<div id="feedback"></div>';
    } else {
      estado.esperandoClicEscena = false;
      ocultarAviso();
      cuerpo =
        '<div class="opciones">' +
          q.opciones.map((o, i) =>
            '<button class="opcion" data-accion="responder" data-opcion="' + i + '">' +
              '<span class="letra">' + LETRAS[i] + '</span><span>' + esc(o) + '</span></button>'
          ).join('') +
        '</div>' +
        '<div id="feedback"></div>';
    }

    pintar(
      cabeceraZona(z) +
      '<span class="etiqueta">Pregunta ' + (estado.pregunta + 1) + ' de ' + totalPreguntas(z) + '</span>' +
      '<h3 style="margin:0;font-size:18px">' + esc(q.enunciado) + '</h3>' +
      cuerpo +
      '<div class="acciones">' +
        '<button class="boton" data-accion="pregunta-siguiente" id="boton-siguiente" disabled>' +
          (estado.pregunta === totalPreguntas(z) - 1 ? 'Ver resultado →' : 'Siguiente pregunta →') +
        '</button>' +
      '</div>'
    );
  }

  function responderTest(indice) {
    if (estado.respondida) return;
    const q = estado.zona.preguntas[estado.pregunta];
    const bien = indice === q.correcta;
    estado.respondida = true;
    if (bien) estado.aciertos++;

    $panel.querySelectorAll('.opcion').forEach((b) => {
      const i = Number(b.dataset.opcion);
      b.disabled = true;
      if (i === q.correcta) b.classList.add('correcta');
      else if (i === indice) b.classList.add('incorrecta');
    });
    mostrarFeedback(bien, q.explicacion);
  }

  function responderEscena(nombreObjeto) {
    if (estado.respondida) return;
    const q = estado.zona.preguntas[estado.pregunta];
    const bien = q.objetos.some((prefijo) => nombreObjeto.indexOf(prefijo) === 0);
    estado.respondida = true;
    estado.esperandoClicEscena = false;
    if (bien) estado.aciertos++;
    document.getElementById('lienzo-3d').classList.remove('modo-senalar');

    // 1) lo elegido se marca en amarillo...
    const elegido = familiaDe(nombreObjeto, q.objetos);
    const correcto = (n) => q.objetos.some((pre) => n.indexOf(pre) === 0);
    const C = CONFIG.coloresRespuesta;
    pintarObjetos(elegido, C.elegido);
    ocultarAviso();
    const pregunta = estado.pregunta;
    // 2) ...y tras un instante pasa a verde o rojo (y el correcto, en verde).
    setTimeout(() => {
      if (estado.pantalla !== 'pregunta' || estado.pregunta !== pregunta) return;
      if (!bien) pintarObjetos(elegido, C.incorrecto);
      pintarObjetos(correcto, C.correcto);
      mostrarAviso(bien ? '✅ ¡Correcto!' : '❌ No era ese. El correcto está en verde', false, 3);
      mostrarFeedback(bien, q.explicacion);
    }, C.esperaMs);
  }

  function mostrarFeedback(bien, explicacion) {
    const caja = document.getElementById('feedback');
    caja.className = 'feedback ' + (bien ? 'bien' : 'mal');
    caja.innerHTML = '<strong>' + (bien ? '¡Correcto!' : 'No es correcto') + '</strong><span>' + esc(explicacion) + '</span>';
    const boton = document.getElementById('boton-siguiente');
    boton.disabled = false;
    boton.focus();
  }

  /* ---------- Resultado de la zona ---------- */
  function pantallaResultadoZona() {
    const z = estado.zona;
    const total = totalPreguntas(z);
    const aprobada = estado.aciertos >= Math.min(CONFIG.aciertosParaAprobar, total);
    estado.pantalla = 'resultadoZona';
    estado.esperandoClicEscena = false;
    ocultarAviso();

    // Se guarda el mejor resultado de la zona.
    const previo = progreso.resultados[z.numero];
    if (!previo || estado.aciertos >= previo.aciertos) {
      progreso.resultados[z.numero] = { aciertos: estado.aciertos, total: total, aprobada: aprobada || !!(previo && previo.aprobada) };
    }
    if (zonasAprobadas() === F.zonas.length && !progreso.fechaFin) progreso.fechaFin = new Date().toISOString();
    guardarProgreso();

    const siguiente = F.zonas[F.zonas.indexOf(z) + 1];
    let botonPrincipal;
    if (!aprobada) botonPrincipal = '<button class="boton" data-accion="repetir">Repetir la zona</button>';
    else if (zonasAprobadas() === F.zonas.length) botonPrincipal = '<button class="boton" data-accion="final">Ver resultado final →</button>';
    else if (siguiente) botonPrincipal = '<button class="boton" data-accion="empezar" data-zona="' + siguiente.numero + '">Zona ' + siguiente.numero + ': ' + esc(siguiente.titulo) + ' →</button>';
    else botonPrincipal = '<button class="boton" data-accion="inicio">Volver al inicio</button>';

    pintar(
      cabeceraZona(z) +
      '<div class="marcador"><span class="grande">' + estado.aciertos + '</span><span class="total">/ ' + total + ' aciertos</span></div>' +
      '<span class="sello ' + (aprobada ? 'aprobado' : 'suspenso') + '">' + (aprobada ? '✔ Zona superada' : '✘ Necesitas ' + CONFIG.aciertosParaAprobar + ' aciertos') + '</span>' +
      '<p>' + (aprobada
        ? '¡Bien hecho! Ya puedes pasar a la siguiente zona.'
        : 'Repasa la explicación y vuelve a intentarlo. Solo tardarás un minuto.') + '</p>' +
      '<div class="acciones">' +
        '<button class="boton secundario" data-accion="' + (aprobada ? 'repetir' : 'inicio') + '">' + (aprobada ? 'Repasar' : 'Inicio') + '</button>' +
        botonPrincipal +
      '</div>'
    );
  }

  /* ---------- Resultado final y certificado ---------- */
  function pantallaFinal() {
    Object.assign(estado, { pantalla: 'final', zona: null, esperandoClicEscena: false });
    ocultarAviso();
    volarA(CONFIG.vistaGeneral);
    resaltarPunto(null);

    let aciertos = 0, total = 0;
    const filas = F.zonas.map((z) => {
      const r = progreso.resultados[z.numero] || { aciertos: 0, total: totalPreguntas(z) };
      aciertos += r.aciertos; total += r.total;
      return '<tr><td>' + z.numero + '. ' + esc(z.titulo) + '</td><td>' + r.aciertos + '/' + r.total + '</td></tr>';
    }).join('');
    const fecha = new Date(progreso.fechaFin || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    pintar(
      '<span class="etiqueta">Resultado final</span>' +
      '<h1>' + esc(F.cierre.titulo) + '</h1>' +
      '<p>' + esc(F.cierre.texto) + '</p>' +
      '<div class="marcador"><span class="grande">' + aciertos + '</span><span class="total">/ ' + total + ' aciertos</span></div>' +
      '<table class="tabla-resultados">' + filas + '</table>' +
      '<div class="certificado">' +
        '<span class="etiqueta" style="align-self:center">Certificado de finalización</span>' +
        '<span class="nombre">' + esc(progreso.nombre || 'Nombre del empleado') + '</span>' +
        '<span>ha completado la formación <strong>' + esc(F.titulo) + '</strong></span>' +
        '<span>' + fecha + ' · ' + aciertos + '/' + total + ' aciertos</span>' +
      '</div>' +
      '<div class="acciones">' +
        '<button class="boton secundario" data-accion="inicio">Inicio</button>' +
        '<button class="boton" data-accion="imprimir">Imprimir / guardar PDF</button>' +
      '</div>'
    );
  }

  /* ---------- Botones del panel (un solo "escuchador") ---------- */
  $panel.addEventListener('click', (e) => {
    const b = e.target.closest('[data-accion]');
    if (!b || b.disabled) return;
    const zonaDe = (n) => F.zonas.find((z) => z.numero === Number(n));

    switch (b.dataset.accion) {
      case 'empezar': guardarNombre(); abrirZona(zonaDe(b.dataset.zona)); break;
      case 'paso-anterior':
        if (estado.paso === 0) pantallaBienvenida(); else { estado.paso--; pantallaPaso(); }
        break;
      case 'paso-siguiente':
        if (estado.paso < estado.zona.pasos.length - 1) { estado.paso++; pantallaPaso(); }
        else { estado.pregunta = 0; estado.aciertos = 0; pantallaPregunta(); }
        break;
      case 'responder': responderTest(Number(b.dataset.opcion)); break;
      case 'pregunta-siguiente':
        if (estado.pregunta < totalPreguntas(estado.zona) - 1) { estado.pregunta++; pantallaPregunta(); }
        else pantallaResultadoZona();
        break;
      case 'repetir': abrirZona(estado.zona); break;
      case 'inicio': pantallaBienvenida(); break;
      case 'final': guardarNombre(); pantallaFinal(); break;
      case 'imprimir': window.print(); break;
      case 'reiniciar':
        if (confirm('¿Seguro que quieres borrar tu progreso?')) { progreso = progresoVacio(); guardarProgreso(); pantallaBienvenida(); }
        break;
    }
  });

  $panel.addEventListener('input', (e) => {
    if (e.target.id === 'campo-nombre') guardarNombre();
  });

  function guardarNombre() {
    const campo = document.getElementById('campo-nombre');
    if (campo) { progreso.nombre = campo.value.trim(); guardarProgreso(); }
  }

  /* ===================================================================
     4. BARRA DE ZONAS Y PROGRESO
     =================================================================== */

  function pintarZonas() {
    $zonas.innerHTML = F.zonas.map((z) => {
      const clases = ['chip-zona'];
      if (estado.zona === z) clases.push('activa');
      if (estaAprobada(z)) clases.push('aprobada');
      const bloqueada = !estaDesbloqueada(z);
      return '<button class="' + clases.join(' ') + '" data-zona="' + z.numero + '"' + (bloqueada ? ' disabled title="Completa antes la zona anterior"' : '') + '>' +
        '<span class="numero-zona">' + (estaAprobada(z) ? '✓' : z.numero) + '</span>' +
        '<span class="texto-chip">' + esc(z.titulo) + '</span></button>';
    }).join('');

    const n = zonasAprobadas();
    document.getElementById('progreso-relleno').style.width = (100 * n / F.zonas.length) + '%';
    document.getElementById('progreso-texto').textContent = n + '/' + F.zonas.length + ' zonas';
  }

  $zonas.addEventListener('click', (e) => {
    const b = e.target.closest('[data-zona]');
    if (!b || b.disabled) return;
    guardarNombre();
    abrirZona(F.zonas.find((z) => z.numero === Number(b.dataset.zona)));
  });

  document.getElementById('boton-vista-general').addEventListener('click', () => {
    if (estado.pantalla === 'pregunta' && !confirm('Si sales ahora perderás las respuestas de esta zona. ¿Salir?')) return;
    pantallaBienvenida();
  });

  /* ===================================================================
     5. ARRANQUE
     =================================================================== */

  document.title = F.titulo + ' · Rodi';
  document.getElementById('titulo-curso').textContent = F.titulo;
  document.getElementById('subtitulo-curso').textContent = F.subtitulo;
  pantallaBienvenida();
  cargarEscena();
})();
