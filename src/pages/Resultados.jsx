
import { BarChart3, Users } from 'lucide-react'

export default function Resultados({ encuestas }) {
  // Compatible con encuestas nuevas y antiguas.
  const obtenerPreguntas = (encuesta) => {
    if (Array.isArray(encuesta.preguntas) && encuesta.preguntas.length > 0) {
      return encuesta.preguntas
    }

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

  const totalVotos = encuestas.reduce(
    (total, encuesta) =>
      total +
      obtenerPreguntas(encuesta).reduce(
        (sumaPreguntas, pregunta) =>
          sumaPreguntas +
          (pregunta.opciones || []).reduce(
            (sumaOpciones, opcion) =>
              sumaOpciones + (Number(opcion.votos) || 0),
            0,
          ),
        0,
      ),
    0,
  )

  return (
    <section className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium text-indigo-400">
          ANÁLISIS
        </p>

        <h2 className="text-3xl font-bold text-white">
          Resultados de las encuestas
        </h2>

        <p className="mt-2 text-slate-400">
          Consulta las respuestas y los porcentajes de cada pregunta.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111827] p-6">
        <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-400">
          <Users size={27} />
        </div>

        <div>
          <p className="text-sm text-slate-400">
            Votos registrados en total
          </p>
          <p className="text-3xl font-bold text-white">{totalVotos}</p>
          <p className="mt-1 text-xs text-slate-500">
            Suma de las respuestas registradas en todas las preguntas.
          </p>
        </div>
      </div>

      {encuestas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
          <BarChart3
            size={40}
            className="mx-auto mb-4 text-slate-500"
          />

          <p className="text-lg font-semibold text-white">
            Todavía no hay resultados
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Crea una encuesta para empezar a visualizar los datos.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {encuestas.map((encuesta) => {
            const preguntas = obtenerPreguntas(encuesta)

            const votosEncuesta = preguntas.reduce(
              (total, pregunta) =>
                total +
                (pregunta.opciones || []).reduce(
                  (suma, opcion) =>
                    suma + (Number(opcion.votos) || 0),
                  0,
                ),
              0,
            )

            return (
              <article
                key={encuesta.id}
                className="rounded-2xl border border-white/10 bg-[#111827] p-6"
              >
                <div className="mb-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                      {preguntas.length}{' '}
                      {preguntas.length === 1 ? 'pregunta' : 'preguntas'}
                    </span>

                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                      {votosEncuesta}{' '}
                      {votosEncuesta === 1 ? 'voto' : 'votos'}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-white">
                    {encuesta.titulo || 'Encuesta sin título'}
                  </h3>
                </div>

                {preguntas.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Esta encuesta todavía no tiene preguntas.
                  </p>
                ) : (
                  <div className="space-y-8">
                    {preguntas.map((pregunta, indice) => {
                      const opciones = pregunta.opciones || []

                      const votosPregunta = opciones.reduce(
                        (suma, opcion) =>
                          suma + (Number(opcion.votos) || 0),
                        0,
                      )

                      return (
                        <section
                          key={pregunta.id || indice}
                          className="border-t border-white/10 pt-5"
                        >
                          <div className="mb-4">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-400">
                              Pregunta {indice + 1}
                            </p>

                            <h4 className="font-semibold leading-6 text-white">
                              {pregunta.pregunta}
                            </h4>

                            <p className="mt-1 text-xs text-slate-500">
                              {votosPregunta}{' '}
                              {votosPregunta === 1
                                ? 'respuesta registrada'
                                : 'respuestas registradas'}
                            </p>
                          </div>

                          {opciones.length === 0 ? (
                            <p className="text-sm text-slate-400">
                              Esta pregunta no tiene opciones.
                            </p>
                          ) : (
                            <div className="space-y-5">
                              {opciones.map((opcion) => {
                                const votos = Number(opcion.votos) || 0

                                const porcentaje =
                                  votosPregunta === 0
                                    ? 0
                                    : (votos / votosPregunta) * 100

                                return (
                                  <div key={opcion.id}>
                                    <div className="mb-2 flex justify-between gap-3 text-sm">
                                      <span className="break-words text-slate-300">
                                        {opcion.texto}
                                      </span>

                                      <span className="shrink-0 font-semibold text-white">
                                        {porcentaje.toFixed(1)}%
                                      </span>
                                    </div>

                                    <div
                                      className="h-2.5 overflow-hidden rounded-full bg-white/10"
                                      role="progressbar"
                                      aria-label={`Porcentaje de ${opcion.texto}`}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                      aria-valuenow={Number(
                                        porcentaje.toFixed(1),
                                      )}
                                    >
                                      <div
                                        className="h-full rounded-full bg-indigo-500 transition-all"
                                        style={{
                                          width: `${porcentaje}%`,
                                        }}
                                      />
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {votos}{' '}
                                      {votos === 1 ? 'voto' : 'votos'}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </section>
                      )
                    })}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
