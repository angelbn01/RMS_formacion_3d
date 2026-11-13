/* =====================================================================
   CONTENIDO DE LA FORMACIÓN  ·  "Tu primer día en Rodi"
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para cambiar textos,
   pasos o preguntas. Reglas rápidas:

   · Cada zona tiene:
       - numero, titulo, resumen
       - punto:   nombre del punto numerado en Spline ("Punto 1"...)
       - camara:  a qué punto del taller mira la cámara (x, y, z) y a qué
                  distancia (más pequeño = más cerca)
       - pasos:   lista de { titulo, texto }   (se ven con Anterior/Siguiente)
       - preguntas: lista de preguntas (ver abajo)

   · Pregunta tipo test:
       { tipo: 'test', enunciado: '...', opciones: ['A', 'B', 'C'],
         correcta: 1,            ← posición de la buena, EMPIEZA EN 0
         explicacion: '...' }

   · Pregunta "señala en la escena":
       { tipo: 'escena', enunciado: '...',
         objetos: ['Mesa Alta', 'Taburete'],   ← nombres (o comienzo del
                                                  nombre) de los objetos de
                                                  Spline que cuentan como
                                                  respuesta correcta
         explicacion: '...' }
       Ojo: el objeto tiene que tener un evento "Mouse Down" en Spline
       para poder recibir clics (ver README).

   · Texto entre comillas simples '...'. Si el texto lleva un apóstrofo
     usa comillas dobles "..." o escribe \'.
   ===================================================================== */

window.FORMACION = {
  titulo: 'Tu primer día en Rodi',
  subtitulo: 'Formación interactiva · Rodi Motor Services',

  intro: {
    titulo: '¡Bienvenido/a a Rodi Motor Services!',
    texto: 'En los próximos minutos vas a recorrer el taller zona por zona. En cada una verás qué se hace allí y qué se espera de ti, y responderás 3 preguntas rápidas. Al acertar 2 de 3 se desbloquea la siguiente zona.',
    duracion: '15–20 minutos'
  },

  cierre: {
    titulo: '¡Enhorabuena, has completado tu primer recorrido!',
    texto: 'Recuerda: el cliente primero, la seguridad siempre y cada cosa en su sitio.'
  },

  zonas: [
    /* ------------------------------------------------------------- 1 */
    {
      numero: 1,
      titulo: 'Recepción',
      resumen: 'El primer contacto del cliente con Rodi.',
      punto: 'Punto 1',
      camara: { x: -270, y: 50, z: -170, distancia: 850 },
      pasos: [
        { titulo: 'La primera impresión',
          texto: 'La recepción es el primer contacto del cliente con Rodi. Saluda en cuanto alguien entre, aunque estés ocupado: un "¡Hola, enseguida te atiendo!" ya cambia la experiencia.' },
        { titulo: 'Recepción del vehículo',
          texto: 'Al recibir un coche se registran matrícula, kilómetros, el motivo de la visita y cualquier daño visible. El cliente firma la orden de trabajo antes de que el coche pase al taller.' },
        { titulo: 'Punto de atención',
          texto: 'La mesa alta con taburetes junto al cristal se usa para explicar presupuestos con calma y enseñar al cliente lo que pasa en el taller. Nunca se empieza un trabajo adicional sin la aprobación del cliente.' }
      ],
      preguntas: [
        { tipo: 'test',
          enunciado: '¿Qué debe hacerse ANTES de que el coche pase al taller?',
          opciones: ['Lavarlo', 'Registrar sus datos y daños y que el cliente firme la orden de trabajo', 'Subirlo al elevador para revisarlo'],
          correcta: 1,
          explicacion: 'La orden de trabajo firmada protege al cliente y al taller: deja claro qué se va a hacer y en qué estado llegó el coche.' },
        { tipo: 'test',
          enunciado: 'Durante una revisión se detecta que hacen falta pastillas de freno. ¿Qué haces?',
          opciones: ['Cambiarlas, porque es por seguridad', 'Informar al cliente con el presupuesto y esperar su aprobación', 'Anotarlo para la próxima visita sin decir nada'],
          correcta: 1,
          explicacion: 'Ningún trabajo adicional se hace sin la aprobación del cliente, aunque sea recomendable.' },
        { tipo: 'escena',
          enunciado: 'Señala en la escena dónde se explican los presupuestos al cliente.',
          objetos: ['Mesa Alta', 'Taburete'],
          explicacion: 'Es la mesa alta con taburetes junto al cristal del taller: el "punto de atención".' }
      ]
    },

    /* ------------------------------------------------------------- 2 */
    {
      numero: 2,
      titulo: 'Sala de espera',
      resumen: 'Un espacio cuidado para quien espera su coche.',
      punto: 'Punto 2',
      camara: { x: -420, y: 40, z: 120, distancia: 880 },
      pasos: [
        { titulo: 'Un espacio cuidado',
          texto: 'Muchos clientes esperan mientras se hace el trabajo. La sala debe estar siempre limpia y ordenada, y el café disponible.' },
        { titulo: 'Información del tiempo',
          texto: 'Da al cliente una estimación realista del tiempo de espera. Si hay retraso, avísale antes de que tenga que preguntar.' },
        { titulo: 'Rincón del café',
          texto: 'Revisa a lo largo del día que haya vasos, café y que la zona esté limpia. Es un detalle pequeño que el cliente recuerda.' }
      ],
      preguntas: [
        { tipo: 'test',
          enunciado: 'El trabajo va a tardar 20 minutos más de lo previsto. ¿Qué haces?',
          opciones: ['Nada, el cliente ya sabe que puede tardar', 'Avisar al cliente cuanto antes con la nueva estimación', 'Esperar a que pregunte'],
          correcta: 1,
          explicacion: 'Avisar antes de que el cliente pregunte transmite control y respeto por su tiempo.' },
        { tipo: 'test',
          enunciado: '¿Quién es responsable de que la sala de espera esté en orden?',
          opciones: ['Solo el personal de limpieza', 'Todo el equipo', 'El cliente'],
          correcta: 1,
          explicacion: 'La imagen del taller es cosa de todos: si ves algo fuera de sitio, se arregla.' },
        { tipo: 'escena',
          enunciado: 'Señala en la escena el rincón del café.',
          objetos: ['Cafe'],
          explicacion: 'Está en la esquina del fondo, junto a la pared blanca.' }
      ]
    },

    /* ------------------------------------------------------------- 3 */
    {
      numero: 3,
      titulo: 'Tienda y producto',
      resumen: 'Baterías y escobillas a la vista del cliente.',
      punto: 'Punto 3',
      camara: { x: -150, y: 60, z: -380, distancia: 780 },
      pasos: [
        { titulo: 'Producto en exposición',
          texto: 'En recepción se exponen productos de recambio rápido, como baterías y escobillas, que el cliente puede ver y comprar en el momento.' },
        { titulo: 'Recomendar sin presionar',
          texto: 'Si al revisar el coche ves escobillas gastadas o una batería débil, recomiéndalo explicando el motivo. Si el cliente dice que no, se respeta sin insistir.' },
        { titulo: 'Exposición ordenada',
          texto: 'El expositor debe estar completo, ordenado y con los precios visibles. Avisa si falta stock.' }
      ],
      preguntas: [
        { tipo: 'test',
          enunciado: 'Un cliente rechaza cambiar las escobillas que le recomiendas. ¿Qué haces?',
          opciones: ['Insistir hasta que acepte', 'Respetar su decisión y anotarlo en la orden', 'Cambiarlas igualmente'],
          correcta: 1,
          explicacion: 'Se recomienda con argumentos y se respeta la decisión. Dejarlo anotado ayuda en la próxima visita.' },
        { tipo: 'test',
          enunciado: '¿Cuál es una buena razón para recomendar un producto?',
          opciones: ['Que haya mucho stock', 'Que el estado del vehículo lo justifique', 'Que sea el más caro'],
          correcta: 1,
          explicacion: 'Una recomendación tiene que estar justificada por lo que necesita el coche del cliente.' },
        { tipo: 'escena',
          enunciado: 'Señala en la escena dónde están las baterías.',
          objetos: ['Bateria'],
          explicacion: 'Son las cajas amarillas de la estantería negra, junto al expositor de escobillas.' }
      ]
    },

    /* ------------------------------------------------------------- 4 */
    {
      numero: 4,
      titulo: 'Elevador de tijera',
      resumen: 'Elevar un coche de forma segura.',
      punto: 'Punto 4',
      camara: { x: 140, y: 70, z: -200, distancia: 900 },
      pasos: [
        { titulo: 'Para qué sirve',
          texto: 'El elevador de tijera levanta el coche apoyándolo en sus plataformas. Se usa para revisiones de bajos, frenos y neumáticos.' },
        { titulo: 'Antes de elevar',
          texto: 'Coche centrado en las plataformas, freno de mano puesto, nadie dentro del vehículo y zona despejada de herramientas y personas.' },
        { titulo: 'Durante la elevación',
          texto: 'Sube en dos fases: primero unos centímetros para comprobar que está estable, y luego a la altura de trabajo con los seguros activados. Nunca te pongas debajo durante la subida o la bajada.' }
      ],
      preguntas: [
        { tipo: 'test',
          enunciado: '¿Qué compruebas primero al empezar a elevar el coche?',
          opciones: ['Que la radio está apagada', 'Que está estable tras subirlo unos centímetros', 'Que el depósito está lleno'],
          correcta: 1,
          explicacion: 'Subir unos centímetros y comprobar la estabilidad evita sustos antes de llegar a la altura de trabajo.' },
        { tipo: 'test',
          enunciado: '¿Puede haber alguien dentro del coche mientras se eleva?',
          opciones: ['Sí, si es el propietario', 'No, nunca', 'Solo si el elevador es de tijera'],
          correcta: 1,
          explicacion: 'Nunca. Ni el cliente ni nadie del equipo puede estar dentro del vehículo al elevarlo.' },
        { tipo: 'escena',
          enunciado: 'Señala en la escena el elevador de tijera.',
          objetos: ['Tijera'],
          explicacion: 'Es el elevador rojo con plataformas y brazos cruzados, en la primera bahía.' }
      ]
    },

    /* ------------------------------------------------------------- 5 */
    {
      numero: 5,
      titulo: 'Elevador de columnas',
      resumen: 'Puntos de apoyo, herramientas y zonas de trabajo.',
      punto: 'Punto 5',
      camara: { x: 380, y: 80, z: -170, distancia: 950 },
      pasos: [
        { titulo: 'Puntos de apoyo',
          texto: 'El elevador de 2 columnas levanta el coche por sus puntos de apoyo del chasis, que vienen indicados por el fabricante. Si se colocan mal los brazos, el coche puede desequilibrarse.' },
        { titulo: 'Herramientas en su sitio',
          texto: 'Cada herramienta vuelve al carro después de usarla. Una llave olvidada en el suelo o dentro del motor es un riesgo.' },
        { titulo: 'Bahías y líneas amarillas',
          texto: 'Las líneas amarillas del suelo delimitan cada zona de trabajo. Fuera de ellas no se dejan objetos, para mantener libre el paso.' }
      ],
      preguntas: [
        { tipo: 'test',
          enunciado: '¿Dónde se colocan los brazos del elevador de columnas?',
          opciones: ['En cualquier parte de los bajos', 'En los puntos de apoyo indicados por el fabricante', 'En los neumáticos'],
          correcta: 1,
          explicacion: 'Los puntos de apoyo del fabricante están reforzados para soportar el peso del coche.' },
        { tipo: 'test',
          enunciado: '¿Qué indican las líneas amarillas del suelo?',
          opciones: ['Zona de aparcamiento de clientes', 'Los límites de cada zona de trabajo', 'Decoración'],
          correcta: 1,
          explicacion: 'Marcan cada bahía de trabajo y dejan libres los pasos.' },
        { tipo: 'escena',
          enunciado: 'Señala en la escena dónde se guardan las herramientas.',
          objetos: ['Carro'],
          explicacion: 'En el carro de herramientas rojo, junto al elevador de columnas.' }
      ]
    },

    /* ------------------------------------------------------------- 6 */
    {
      numero: 6,
      titulo: 'Neumáticos',
      resumen: 'Desmontadora, equilibradora y apriete final.',
      punto: 'Punto 6',
      camara: { x: 630, y: 50, z: 0, distancia: 900 },
      pasos: [
        { titulo: 'Desmontadora',
          texto: 'Separa el neumático de la llanta para cambiarlo sin dañarla. Mantén las manos lejos del plato giratorio mientras gira.' },
        { titulo: 'Equilibradora',
          texto: 'Hace girar la rueda y detecta desequilibrios, que se corrigen con contrapesos. Una rueda mal equilibrada provoca vibraciones y desgaste.' },
        { titulo: 'Apriete final',
          texto: 'Al montar la rueda en el coche, los tornillos se aprietan en cruz y con el par indicado usando llave dinamométrica. Se recomienda revisar el apriete tras los primeros kilómetros.' }
      ],
      preguntas: [
        { tipo: 'test',
          enunciado: '¿Para qué sirve la equilibradora?',
          opciones: ['Para inflar el neumático', 'Para detectar y corregir desequilibrios de la rueda', 'Para quitar la llanta'],
          correcta: 1,
          explicacion: 'La equilibradora detecta el desequilibrio y te indica dónde poner los contrapesos.' },
        { tipo: 'test',
          enunciado: '¿Cómo se aprietan los tornillos de la rueda?',
          opciones: ['Al máximo con la pistola neumática', 'En cruz y con el par indicado, con llave dinamométrica', 'En círculo, uno detrás de otro'],
          correcta: 1,
          explicacion: 'Apretar en cruz asienta la rueda de forma uniforme; la dinamométrica asegura el par correcto.' },
        { tipo: 'escena',
          enunciado: 'Señala en la escena la equilibradora.',
          objetos: ['Equilibradora'],
          explicacion: 'Es la máquina gris con la rueda montada de lado y la tapa roja.' }
      ]
    },

    /* ------------------------------------------------------------- 7 */
    {
      numero: 7,
      titulo: 'Almacén de neumáticos',
      resumen: 'Orden, manipulación segura y rotación.',
      punto: 'Punto 7',
      camara: { x: 420, y: 40, z: 330, distancia: 880 },
      pasos: [
        { titulo: 'Orden del almacén',
          texto: 'Los neumáticos se guardan identificados por medida y marca, y si son de un cliente, con su matrícula.' },
        { titulo: 'Manipulación segura',
          texto: 'Un neumático con llanta puede pesar más de 20 kg. Levántalo con las piernas, no con la espalda, y no lo apiles por encima de la altura del pecho.' },
        { titulo: 'Rotación',
          texto: 'Se usan primero los neumáticos más antiguos (FIFO), porque un neumático también envejece en el almacén.' }
      ],
      preguntas: [
        { tipo: 'test',
          enunciado: '¿Cómo se identifican los neumáticos de un cliente que se guardan en el taller?',
          opciones: ['No hace falta identificarlos', 'Con su matrícula', 'Con el color de la llanta'],
          correcta: 1,
          explicacion: 'La matrícula permite encontrarlos y devolverlos al cliente correcto sin errores.' },
        { tipo: 'test',
          enunciado: '¿Qué neumáticos del almacén se usan primero?',
          opciones: ['Los más antiguos (FIFO)', 'Los más nuevos', 'Los que estén más a mano'],
          correcta: 0,
          explicacion: 'FIFO: lo primero que entra es lo primero que sale, para que ningún neumático envejezca en la estantería.' },
        { tipo: 'escena',
          enunciado: 'Señala en la escena el almacén de neumáticos.',
          objetos: ['Rack'],
          explicacion: 'Es la estantería con montantes amarillos en la parte delantera del taller.' }
      ]
    }
  ]
};
