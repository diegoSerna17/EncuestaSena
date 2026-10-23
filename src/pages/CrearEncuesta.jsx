
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Trash2,
  Clipboard,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
} from 'lucide-react'
import { enlaceEncuesta, crearId } from '../encuestaStore'

function nuevaPregunta() {
  return {
    id: crearId(),
    pregunta: '',
    opciones: ['', ''],
  }
}

export default function CrearEncuesta({ onCrear }) {
  const [titulo, setTitulo] = useState('')
  const [preguntas, setPreguntas] = useState([nuevaPregunta()])
  const [encuestaCreada, setEncuestaCreada] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const navigate = useNavigate()

  function cambiarPregunta(id, valor) {
    setPreguntas((actuales) =>
      actuales.map((p) =>
        p.id === id ? { ...p, pregunta: valor } : p,
      ),
    )
  }

  function cambiarOpcion(idPregunta, indice, valor) {
    setPreguntas((actuales) =>
      actuales.map((p) =>
        p.id === idPregunta
          ? {
              ...p,
              opciones: p.opciones.map((opcion, i) =>
                i === indice ? valor : opcion,
              ),
            }
          : p,
      ),
    )
  }

  function agregarPregunta() {
    setPreguntas((actuales) => [...actuales, nuevaPregunta()])
    setMensaje('')
  }

  function quitarPregunta(id) {
    if (preguntas.length > 1) {
      setPreguntas((actuales) => actuales.filter((p) => p.id !== id))
      setMensaje('')
    }
  }

  function agregarOpcion(idPregunta) {
    setPreguntas((actuales) =>
      actuales.map((p) =>
        p.id === idPregunta && p.opciones.length < 10
          ? { ...p, opciones: [...p.opciones, ''] }
          : p,
      ),
    )
    setMensaje('')
  }

  function quitarOpcion(idPregunta, indice) {
    setPreguntas((actuales) =>
      actuales.map((p) =>
        p.id === idPregunta && p.opciones.length > 2
          ? {
              ...p,
              opciones: p.opciones.filter((_, i) => i !== indice),
            }
          : p,
      ),
    )
    setMensaje('')
  }

  function crear(evento) {
    evento.preventDefault()

    const tituloLimpio = titulo.trim()

    if (tituloLimpio.length < 3) {
      setMensaje('El título debe tener al menos 3 caracteres.')
      return
    }

    const preguntasLimpias = preguntas.map((p) => ({
      id: p.id,
      pregunta: p.pregunta.trim(),
      opciones: p.opciones.map((opcion) => opcion.trim()),
    }))

    for (let i = 0; i < preguntasLimpias.length; i++) {
      const p = preguntasLimpias[i]

      if (p.pregunta.length < 5) {
        setMensaje(`La pregunta ${i + 1} debe tener al menos 5 caracteres.`)
        return
      }

      if (p.pregunta.length > 250) {
        setMensaje(`La pregunta ${i + 1} no puede superar 250 caracteres.`)
        return
      }

      if (p.opciones.some((opcion) => !opcion)) {
        setMensaje(`Completa todas las opciones de la pregunta ${i + 1}.`)
        return
      }

      if (p.opciones.some((opcion) => opcion.length > 120)) {
        setMensaje(`Las opciones de la pregunta ${i + 1} no pueden superar 120 caracteres.`)
        return
      }

      const normalizadas = p.opciones.map((opcion) =>
        opcion.toLocaleLowerCase(),
      )

      if (new Set(normalizadas).size !== normalizadas.length) {
        setMensaje(`No puedes repetir opciones en la pregunta ${i + 1}.`)
        return
      }
    }

    const nueva = onCrear({
      titulo: tituloLimpio,
      preguntas: preguntasLimpias.map((p) => ({
        ...p,
        opciones: p.opciones.map((texto) => ({
          id: crearId(),
          texto,
          votos: 0,
        })),
      })),
    })

    if (!nueva) {
      setMensaje('No se pudo crear la encuesta. Inténtalo nuevamente.')
      return
    }

    setEncuestaCreada(nueva)
    setMensaje('')
  }

  async function copiarEnlace() {
    const enlace = enlaceEncuesta(encuestaCreada.id)

    try {
      await navigator.clipboard.writeText(enlace)
      setMensaje('¡Enlace copiado correctamente!')
    } catch {
      setMensaje(`No se pudo copiar automáticamente. Copia este enlace: ${enlace}`)
    }
  }

  if (encuestaCreada) {
    const enlace = enlaceEncuesta(encuestaCreada.id)

    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#111827] p-6 sm:p-9">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <Check size={32} />
        </div>

        <h2 className="text-center text-3xl font-bold text-white">
          ¡Encuesta creada!
        </h2>

        <p className="mt-3 text-center text-slate-400">
          Comparte el enlace para que las personas respondan todas las preguntas.
        </p>

        <div className="mt-7 rounded-xl border border-white/10 bg-[#090d18] p-4">
          <p className="mb-2 text-sm text-slate-400">Enlace de la encuesta</p>

          <input
            readOnly
            value={enlace}
            aria-label="Enlace de la encuesta"
            className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-3 text-sm text-indigo-300"
          />

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={copiarEnlace}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400"
            >
              <Copy size={17} /> Copiar enlace
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `¡Participa en mi encuesta! ${enlace}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-semibold text-white hover:bg-white/5"
            >
              <MessageCircle size={18} /> Compartir WhatsApp
            </a>
          </div>
        </div>

        {mensaje && (
          <p role="status" className="mt-4 break-words text-sm text-indigo-300">
            {mensaje}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.open(enlace, '_blank', 'noopener,noreferrer')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5"
          >
            <ExternalLink size={17} /> Abrir encuesta
          </button>

          <button
            type="button"
            onClick={() => navigate('/resultados')}
            className="flex-1 rounded-xl bg-white/5 px-4 py-3 hover:bg-white/10"
          >
            Ver resultados
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-indigo-400">CREACIÓN</p>

        <h2 className="text-3xl font-bold text-white">Crear encuesta</h2>

        <p className="mt-2 text-slate-400">
          Agrega varias preguntas y define las opciones de respuesta de cada una.
        </p>
      </div>

      <form
        onSubmit={crear}
        className="space-y-7 rounded-2xl border border-white/10 bg-[#111827] p-6 sm:p-8"
      >
        <div>
          <label htmlFor="titulo" className="mb-2 block font-medium text-white">
            Título de la encuesta
          </label>

          <input
            id="titulo"
            required
            minLength={3}
            maxLength={100}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ejemplo: Encuesta de calidad de software"
            className="w-full rounded-xl border border-white/10 bg-[#090d18] px-4 py-3 text-white placeholder:text-slate-600"
          />
        </div>

        <div className="space-y-7">
          {preguntas.map((p, indice) => (
            <article
              key={p.id}
              className="space-y-5 rounded-xl border border-white/10 bg-[#090d18] p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">
                  Pregunta {indice + 1}
                </h3>

                <button
                  type="button"
                  disabled={preguntas.length <= 1}
                  onClick={() => quitarPregunta(p.id)}
                  aria-label={`Eliminar pregunta ${indice + 1}`}
                  className="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={17} />
                  Eliminar pregunta
                </button>
              </div>

              <div>
                <label
                  htmlFor={`pregunta-${p.id}`}
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Texto de la pregunta
                </label>

                <textarea
                  id={`pregunta-${p.id}`}
                  required
                  minLength={5}
                  maxLength={250}
                  rows={3}
                  value={p.pregunta}
                  onChange={(e) => cambiarPregunta(p.id, e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-600"
                />

                <p className="mt-1 text-right text-xs text-slate-500">
                  {p.pregunta.length}/250
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="font-medium text-white">
                    Opciones de respuesta
                  </label>

                  <span className="text-xs text-slate-400">
                    {p.opciones.length}/10
                  </span>
                </div>

                <div className="space-y-3">
                  {p.opciones.map((opcion, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-sm font-semibold text-indigo-300">
                        {i + 1}
                      </span>

                      <input
                        required
                        maxLength={120}
                        value={opcion}
                        onChange={(e) =>
                          cambiarOpcion(p.id, i, e.target.value)
                        }
                        placeholder={`Opción ${i + 1}`}
                        aria-label={`Opción ${i + 1} de la pregunta ${indice + 1}`}
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white placeholder:text-slate-600"
                      />

                      <button
                        type="button"
                        disabled={p.opciones.length <= 2}
                        onClick={() => quitarOpcion(p.id, i)}
                        aria-label={`Eliminar opción ${i + 1}`}
                        className="rounded-lg p-2.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={p.opciones.length >= 10}
                  onClick={() => agregarOpcion(p.id)}
                  className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-40"
                >
                  <Plus size={17} /> Añadir opción
                </button>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={agregarPregunta}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-400/40 px-4 py-3 font-semibold text-indigo-300 hover:bg-indigo-500/10"
        >
          <Plus size={19} /> Agregar otra pregunta
        </button>

        {mensaje && (
          <p role="alert" className="break-words text-sm text-amber-300">
            {mensaje}
          </p>
        )}

        <div className="border-t border-white/10 pt-5">
          <div className="mb-5 flex items-start gap-3 text-sm text-slate-400">
            <Clipboard size={19} className="mt-0.5 shrink-0 text-indigo-400" />
            <p>
              Cada pregunta tendrá sus propias opciones y resultados. La
              encuesta se guardará en este navegador.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-500 px-5 py-3.5 font-semibold text-white hover:bg-indigo-400"
          >
            Crear encuesta
          </button>
        </div>
      </form>
    </section>
  )
}
