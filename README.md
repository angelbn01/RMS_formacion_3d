# Formación 3D · "Tu primer día en Rodi"

Web interactiva: un taller Rodi en 3D (hecho en Spline) con 7 zonas. En cada zona hay una explicación en 3 pasos y un cuestionario de 3 preguntas: 2 tipo test y 1 de "señala el objeto en el 3D". Al final se muestra la nota y un certificado que se puede imprimir o guardar en PDF.

---

## 1. Qué hay en cada archivo

```
web/
├── index.html          Estructura de la página (casi nunca se toca)
├── css/estilos.css     Colores y diseño (colores de marca arriba del todo)
├── fonts/CargoD.ttf    Tipografía de marca del logo de la cabecera
├── js/contenido.js     ← TEXTOS, PASOS Y PREGUNTAS (el que más vas a editar)
├── js/config.js        Ajustes: enlace de la escena 3D, aciertos para aprobar…
└── js/app.js           Lógica de la web (no hace falta tocarlo)
```

## 2. Cambios habituales

| Quiero… | Dónde |
|---|---|
| Cambiar un texto, paso o pregunta | `js/contenido.js` |
| Añadir o quitar una pregunta | `js/contenido.js`: copia o borra un bloque `{ tipo: ... }` |
| Cambiar la respuesta correcta | `correcta:` en `js/contenido.js`. **Se cuenta desde 0**: 0 = A, 1 = B, 2 = C |
| Exigir más o menos aciertos | `aciertosParaAprobar` en `js/config.js` |
| Dejar abrir las zonas en cualquier orden | `zonasEnOrden: false` en `js/config.js` |
| Cambiar colores | Variables `--amarillo`, `--negro`… al principio de `css/estilos.css` |
| Acercar o alejar la cámara en una zona | `camara: { ..., distancia: 850 }` de esa zona (número más pequeño = más cerca) |
| Llegar a una zona con otro ángulo | Añade `azimut: 10, elevacion: 45` en el `camara` de esa zona |
| Dar más o menos libertad de movimiento | `controles` en `js/config.js`: giro máximo, zoom mínimo y máximo, límites de desplazamiento |

> **Ojo con las comas y comillas** en `contenido.js`: cada bloque termina en `},` y los textos van entre comillas `'...'`. Si algo deja de funcionar después de editar, suele ser una coma o una comilla de menos. En el navegador, **F12 → Consola** te dice la línea exacta del error.

Si cambias el contenido, cambia también `claveProgreso` en `js/config.js` (por ejemplo, de `-v1` a `-v2`). Así nadie arrastra progreso guardado de la versión anterior.

## 3. La escena 3D (Spline)

La escena está en tu cuenta de Spline. La web la carga desde el enlace `escenaURL` de `js/config.js`.

**Para modificar el taller:** edítalo en Spline y luego ve a **Export → Code Export → Update**. El enlace no cambia, así que la web mostrará la versión nueva sin tocar nada más.

**Nombres que la web necesita (no los cambies en Spline):**

| Objeto en Spline | Para qué lo usa la web |
|---|---|
| `Camara Formacion` | La cámara que vuela de zona en zona. Tiene que ser la *Play Camera*. |
| `Punto 1` … `Punto 7` (y sus piezas `Punto N Disco/Borde/Numero`) | Los círculos numerados. Al hacer clic se abre la zona. La web los gira para que miren siempre a la cámara. |
| `Punto N Activo Disco` y `Punto N Activo Numero` | La versión amarilla del punto de la zona seleccionada. **Déjalos visibles en Spline**: Spline no exporta los objetos ocultos, y es la web la que los oculta y los muestra. Puedes cambiarles el color en Spline. |
| Objetos de las preguntas "señala": `Mesa Alta…`, `Cafe…`, `Bateria…`, `Tijera…`, `Carro…`, `Equilibradora…`, `Rack…` | La respuesta correcta se reconoce por el **principio del nombre** del objeto |

**Hacer clicable un objeto nuevo** (por ejemplo, para una pregunta nueva de "señala"):
1. En Spline, selecciona el objeto.
2. En el panel **Events**, añade un evento **Mouse Down**, sin acciones.
3. En `contenido.js`, pon el principio de su nombre en `objetos: ['...']`.
4. Exporta con **Update**.

Hay objetos "distractores" (coches, sofá, mostrador…) que también tienen Mouse Down. Así, si alguien hace clic en el sitio equivocado, la web lo marca como respuesta incorrecta.

**Añadir una zona nueva:** crea en Spline un `Punto 8` copiando un punto existente, cámbiale el número y colócalo donde quieras. Luego añade un bloque de zona en `contenido.js` con `numero: 8` y `punto: 'Punto 8'`. Para la cámara, usa como `x, y, z` las coordenadas del objeto principal de la zona, que se ven en el panel derecho de Spline.

**Moverse por el 3D** (los límites se ajustan en `controles` de `js/config.js`):
- Ratón: arrastrar para girar, rueda para hacer zoom, clic derecho (o Mayús) y arrastrar para desplazarse.
- Táctil: un dedo para girar, dos dedos para zoom y desplazamiento.
- Botones `+`, `−` y `⌖` (centrar) en la esquina de la escena.

**Al pasar el ratón** por un punto numerado, el punto crece y el cursor cambia a una mano. **En las preguntas de "señala"**, lo que pulsa el usuario se pone primero en amarillo y después en verde (si acierta) o en rojo; el objeto correcto se marca siempre en verde. Los colores y el tiempo están en `coloresRespuesta` de `js/config.js`.

**Si la web va lenta** en algún ordenador, baja `calidad.resolucionMaxima` a `1` en `js/config.js`. En la escena de Spline he quitado la oclusión ambiental (AO), que era lo más pesado; si la vuelves a activar, la web irá más lenta.

Si la consola (F12) muestra *"Your .splinecode file is more recent than the library"*, sube la versión de `splineRuntime` en `js/config.js`. La última versión aparece en <https://www.npmjs.com/package/@splinetool/runtime>.

## 4. Probarla en tu ordenador

Por seguridad, el navegador no deja cargar la escena abriendo `index.html` con doble clic. Hay que servir la carpeta. La forma más fácil, si tienes Python instalado:

```bash
python -m http.server 8765 --directory web
```

Después abre <http://localhost:8765> en el navegador. También vale la extensión **Live Server** de VS Code.

