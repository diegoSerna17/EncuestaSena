
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
} from 'lucide-react'
import { yaVoto, registrarVoto } from '../encuestaStore'

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

export default function EncuestaPublica({ encuestas, onVotar }) {
  const { id } = useParams()
  const encuesta = encuestas.find((item) => item.id === id)
  const preguntas = encuesta ? obtenerPreguntas(encuesta) : []

  const [selecciones, setSelecciones] = useState({})
  const [enviado, setEnviado] = useState(() => yaVoto(id))
  const [error, setError] = useState('')

  if (!encuesta) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <ClipboardList
          size={48}
          className="mx-auto mb-5 text-slate-500"
        />
        <h2 className="text-2xl font-bold text-white">
          Encuesta no encontrada
        </h2>
        <p className="mt-3 text-slate-400">
          Comprueba que el enlace sea correcto.
        </p>
      </div>
    )
  }

  if (!encuesta.activa) {
    return (
      <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/10 bg-[#111827] p-8 text-center sm:p-12">
        <LockKeyhole
          size={48}
          className="mx-auto mb-5 text-amber-400"
        />
        <h2 className="text-2xl font-bold text-white">
          Esta encuesta está cerrada
        </h2>
        <p className="mt-3 text-slate-400">
          El administrador ya no está recibiendo respuestas.
        </p>
      </div>
    )
  }

  if (enviado) {
    return (
      <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/10 bg-[#111827] p-8 text-center sm:p-12">
        <CheckCircle2
          size={60}
          className="mx-auto mb-6 text-emerald-400"
        />
        <h2 className="text-3xl font-bold text-white">
          ¡Gracias por participar!
        </h2>
        <p className="mt-4 leading-7 text-slate-400">
          Tu respuesta ya fue registrada en este navegador.
          No necesitas responder nuevamente.
        </p>
      </div>
    )
  }

  function cambiarSeleccion(idPregunta, idOpcion) {
    setSelecciones((actuales) => ({
      ...actuales,
      [idPregunta]: idOpcion,
    }))
    setError('')
  }

  function enviarVoto(evento) {
    evento.preventDefault()
    setError('')

    if (preguntas.length === 0) {
      setError('Esta encuesta no tiene preguntas para responder.')
      return
    }

    const preguntaIncompleta = preguntas.find(
      (pregunta) => !selecciones[pregunta.id],
    )

    if (preguntaIncompleta) {
      setError('Responde todas las preguntas antes de enviar la encuesta.')
      return
    }

    // Confirmar que cada opción elegida pertenezca a su pregunta.
    const seleccionValida = preguntas.every((pregunta) =>
      pregunta.opciones?.some(
        (opcion) => opcion.id === selecciones[pregunta.id],
      ),
    )

    if (!seleccionValida) {
      setError('Una de las respuestas no es válida. Revísalas e inténtalo de nuevo.')
      return
    }

    if (yaVoto(id)) {
      setEnviado(true)
      return
    }

    try {
      registrarVoto(id)

      // Se envían todas las respuestas en una sola operación.
      const correcto = onVotar(id, selecciones)

      if (!correcto) {
        localStorage.removeItem(`encuestaPro_voto_${id}`)
        setError('No se pudieron registrar las respuestas. Inténtalo nuevamente.')
        return
      }

      setEnviado(true)
    } catch {
      try {
        localStorage.removeItem(`encuestaPro_voto_${id}`)
      } catch {
        // El navegador puede bloquear el acceso al almacenamiento.
      }

      setError('No fue posible guardar tus respuestas en este navegador.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-center gap-3">
        <div className="rounded-xl bg-indigo-500 p-2.5 text-white">
          <ClipboardList size={24} />
        </div>
        <h1 className="text-2xl font-bold text-white">
          Encuesta<span className="text-indigo-400">Pro</span>
        </h1>
      </div>

      <form
        onSubmit={enviarVoto}
        className="space-y-6 rounded-2xl border border-white/10 bg-[#111827] p-6 sm:p-9"
      >
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Encuesta pública
          </p>

          <h2 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
            {encuesta.titulo || 'Encuesta'}
          </h2>

          <p className="mt-3 text-sm text-slate-400">
            Selecciona una respuesta para cada pregunta.
          </p>
        </div>

        {preguntas.map((pregunta, indice) => (
          <fieldset
            key={pregunta.id}
            className="space-y-3 border-t border-white/10 pt-5"
          >
            <legend className="mb-4 w-full">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Pregunta {indice + 1} de {preguntas.length}
              </span>

              <span className="block font-semibold leading-6 text-white">
                {pregunta.pregunta}
              </span>
            </legend>

            {(pregunta.opciones || []).map((opcion) => (
              <label
                key={opcion.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                  selecciones[pregunta.id] === opcion.id
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
                }`}
              >
                <input
                  type="radio"
                  name={`respuesta-${pregunta.id}`}
                  value={opcion.id}
                  checked={selecciones[pregunta.id] === opcion.id}
                  onChange={() =>
                    cambiarSeleccion(pregunta.id, opcion.id)
                  }
                  className="h-4 w-4 accent-indigo-500"
                />
                <span className="text-slate-200">{opcion.texto}</span>
              </label>
            ))}
          </fieldset>
        ))}

        {error && (
          <p role="alert" className="text-sm text-rose-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-500 px-5 py-3.5 font-semibold text-white hover:bg-indigo-400"
        >
          Enviar encuesta completa
        </button>

        <p className="text-center text-xs leading-5 text-slate-500">
          Esta demostración almacena los votos en el navegador y no ofrece
          verificación de identidad.
        </p>
      </form>
    </div>
  )
}
