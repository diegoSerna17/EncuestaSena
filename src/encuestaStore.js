
const STORAGE_KEY = 'encuestaPro_encuestas_v1'

const encuestaPredeterminada = {
  id: 'encuesta-calidad-sena',
  pregunta:
    '¿Cómo demostrarías que tu solución es confiable cuando el usuario comete errores o cambian los requisitos?',
  opciones: [
    {
      id: 'calidad-opcion-1',
      texto: 'Validando los datos y mostrando errores claros',
      votos: 0,
    },
    {
      id: 'calidad-opcion-2',
      texto: 'Realizando pruebas funcionales y de calidad',
      votos: 0,
    },
    {
      id: 'calidad-opcion-3',
      texto: 'Controlando las respuestas repetidas y los datos guardados',
      votos: 0,
    },
    {
      id: 'calidad-opcion-4',
      texto: 'Aplicando todas las anteriores',
      votos: 0,
    },
  ],
  preguntas: [],
  activa: true,
  creada: new Date().toISOString(),
}

// Convierte encuestas antiguas al nuevo formato.
// Las encuestas que ya tienen varias preguntas se conservan.
function normalizarEncuesta(encuesta) {
  if (Array.isArray(encuesta.preguntas) && encuesta.preguntas.length > 0) {
    return encuesta
  }

  if (encuesta.pregunta && Array.isArray(encuesta.opciones)) {
    return {
      ...encuesta,
      preguntas: [
        {
          id: crearId(),
          pregunta: encuesta.pregunta,
          opciones: encuesta.opciones,
        },
      ],
    }
  }

  return {
    ...encuesta,
    preguntas: [],
  }
}

export function cargarEncuestas() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY)
    const encuestas = datos ? JSON.parse(datos) : []

    if (!Array.isArray(encuestas)) {
      return [encuestaPredeterminada]
    }

    const encuestasNormalizadas = encuestas.map(normalizarEncuesta)

    const yaExiste = encuestasNormalizadas.some(
      (encuesta) => encuesta.id === encuestaPredeterminada.id,
    )

    const resultado = yaExiste
      ? encuestasNormalizadas
      : [encuestaPredeterminada, ...encuestasNormalizadas]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(resultado))

    return resultado
  } catch {
    return [encuestaPredeterminada]
  }
}

export function guardarEncuestas(encuestas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(encuestas))
}

export function crearId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  )
}

export function enlaceEncuesta(id) {
  return `${window.location.origin}/encuesta/${id}`
}

export function yaVoto(id) {
  try {
    return localStorage.getItem(`encuestaPro_voto_${id}`) === 'si'
  } catch {
    return false
  }
}

export function registrarVoto(id) {
  localStorage.setItem(`encuestaPro_voto_${id}`, 'si')
}
