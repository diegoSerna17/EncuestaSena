
import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
} from 'react-router-dom'

import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import CrearEncuesta from './pages/CrearEncuesta'
import Resultados from './pages/Resultados'
import Administrar from './pages/Administrar'
import EncuestaPublica from './pages/EncuestaPublica'

import {
  cargarEncuestas,
  guardarEncuestas,
  crearId,
} from './encuestaStore'

function obtenerPreguntas(encuesta) {
  if (Array.isArray(encuesta.preguntas) && encuesta.preguntas.length > 0) {
    return encuesta.preguntas
  }

  // Compatibilidad con encuestas antiguas de una sola pregunta.
  if (encuesta.pregunta && Array.isArray(encuesta.opciones)) {
    return [
      {
        id: `${encuesta.id}-pregunta`,
        pregunta: encuesta.pregunta,
        opciones: encuesta.opciones,
      },
    ]
  }

  return []
}

function Aplicacion() {
  const [encuestas, setEncuestas] = useState(cargarEncuestas)
  const location = useLocation()
  const esPublica = location.pathname.startsWith('/encuesta/')

  useEffect(() => {
    try {
      guardarEncuestas(encuestas)
    } catch (error) {
      console.error('No se pudieron guardar las encuestas:', error)
    }
  }, [encuestas])

  function crearEncuesta({ titulo, preguntas, pregunta, opciones }) {
    let preguntasNuevas = preguntas

    // Compatibilidad si algún formulario antiguo envía una sola pregunta.
    if (!Array.isArray(preguntasNuevas) || preguntasNuevas.length === 0) {
      if (!pregunta || !Array.isArray(opciones)) {
        return null
      }

      preguntasNuevas = [
        {
          id: crearId(),
          pregunta,
          opciones: opciones.map((texto) => ({
            id: crearId(),
            texto,
            votos: 0,
          })),
        },
      ]
    }

    const nueva = {
      id: crearId(),
      titulo: titulo?.trim() || 'Encuesta sin título',
      preguntas: preguntasNuevas.map((p) => ({
        id: p.id || crearId(),
        pregunta: p.pregunta,
        opciones: p.opciones.map((opcion) =>
          typeof opcion === 'string'
            ? {
                id: crearId(),
                texto: opcion,
                votos: 0,
              }
            : {
                ...opcion,
                id: opcion.id || crearId(),
                votos: Number(opcion.votos) || 0,
              },
        ),
      })),
      activa: true,
      creada: new Date().toISOString(),
    }

    setEncuestas((actuales) => [nueva, ...actuales])

    return nueva
  }

  function votar(encuestaId, selecciones) {
    const encuesta = encuestas.find((item) => item.id === encuestaId)

    if (!encuesta || !encuesta.activa) {
      return false
    }

    const preguntas = obtenerPreguntas(encuesta)

    if (preguntas.length === 0) {
      return false
    }

    // Comprobar que se haya respondido cada pregunta correctamente.
    const respuestasValidas =
      selecciones &&
      typeof selecciones === 'object' &&
      !Array.isArray(selecciones) &&
      preguntas.every((pregunta) => {
        const opcionSeleccionada = selecciones[pregunta.id]

        return (
          opcionSeleccionada &&
          pregunta.opciones?.some(
            (opcion) => opcion.id === opcionSeleccionada,
          )
        )
      })

    if (!respuestasValidas) {
      return false
    }

    // No aceptar respuestas para preguntas que no pertenecen a la encuesta.
    if (Object.keys(selecciones).length !== preguntas.length) {
      return false
    }

    setEncuestas((actuales) =>
      actuales.map((item) => {
        if (item.id !== encuestaId) {
          return item
        }

        // Actualizar encuestas que usan el formato nuevo.
        if (Array.isArray(item.preguntas) && item.preguntas.length > 0) {
          return {
            ...item,
            preguntas: item.preguntas.map((pregunta) => ({
              ...pregunta,
              opciones: pregunta.opciones.map((opcion) =>
                opcion.id === selecciones[pregunta.id]
                  ? {
                      ...opcion,
                      votos: (Number(opcion.votos) || 0) + 1,
                    }
                  : opcion,
              ),
            })),
          }
        }

        // Actualizar encuestas antiguas de una sola pregunta.
        const preguntaAntigua = obtenerPreguntas(item)[0]

        return {
          ...item,
          opciones: item.opciones.map((opcion) =>
            opcion.id === selecciones[preguntaAntigua.id]
              ? {
                  ...opcion,
                  votos: (Number(opcion.votos) || 0) + 1,
                }
              : opcion,
          ),
        }
      }),
    )

    return true
  }

  function cambiarEstado(id) {
    setEncuestas((actuales) =>
      actuales.map((encuesta) =>
        encuesta.id === id
          ? { ...encuesta, activa: !encuesta.activa }
          : encuesta,
      ),
    )
  }

  function eliminarEncuesta(id) {
    setEncuestas((actuales) =>
      actuales.filter((encuesta) => encuesta.id !== id),
    )
  }

  return (
    <div className="min-h-screen bg-[#090d18] text-slate-200">
      {!esPublica && <Navbar />}

      <main className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
        <Routes>
          <Route
            path="/"
            element={<Dashboard encuestas={encuestas} />}
          />

          <Route
            path="/crear"
            element={<CrearEncuesta onCrear={crearEncuesta} />}
          />

          <Route
            path="/resultados"
            element={<Resultados encuestas={encuestas} />}
          />

          <Route
            path="/administrar"
            element={
              <Administrar
                encuestas={encuestas}
                onCambiarEstado={cambiarEstado}
                onEliminar={eliminarEncuesta}
              />
            }
          />

          <Route
            path="/encuesta/:id"
            element={
              <EncuestaPublica
                encuestas={encuestas}
                onVotar={votar}
              />
            }
          />

          <Route
            path="*"
            element={
              <div className="py-20 text-center">
                <h2 className="text-3xl font-bold text-white">
                  Página no encontrada
                </h2>

                <Link
                  className="mt-4 inline-block text-indigo-400"
                  to="/"
                >
                  Volver al inicio
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Aplicacion />
    </BrowserRouter>
  )
}
