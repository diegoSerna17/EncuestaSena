
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  CheckCircle2,
  Vote,
  Plus,
  ArrowRight,
} from 'lucide-react'

export default function Dashboard({ encuestas }) {
  const totalVotos = encuestas.reduce(
    (total, encuesta) =>
      total +
      encuesta.opciones.reduce((suma, opcion) => suma + opcion.votos, 0),
    0,
  )

  const activas = encuestas.filter((encuesta) => encuesta.activa).length

  const estadisticas = [
    {
      titulo: 'Total de encuestas',
      valor: encuestas.length,
      icono: ClipboardList,
    },
    { titulo: 'Encuestas activas', valor: activas, icono: CheckCircle2 },
    { titulo: 'Votos registrados', valor: totalVotos, icono: Vote },
  ]

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-indigo-400">
            PANEL DE CONTROL
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            ¡Bienvenido a Encuestas SENA!
          </h2>
          <p className="mt-3 text-slate-400">
            Crea encuestas, comparte tus enlaces y revisa las respuestas.
          </p>
        </div>

        <Link
          to="/crear"
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400"
        >
          <Plus size={19} />
          Crear encuesta
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {estadisticas.map(({ titulo, valor, icono: Icono }) => (
          <article
            key={titulo}
            className="rounded-2xl border border-white/10 bg-[#111827] p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-slate-400">{titulo}</p>
              <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-400">
                <Icono size={22} />
              </div>
            </div>
            <p className="text-4xl font-bold text-white">{valor}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white">
              Encuestas recientes
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Consulta las encuestas que has creado.
            </p>
          </div>

          <Link
            to="/administrar"
            className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        {encuestas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 px-5 py-12 text-center">
            <ClipboardList
              size={38}
              className="mx-auto mb-4 text-slate-500"
            />
            <h4 className="font-semibold text-white">
              Todavía no tienes encuestas
            </h4>
            <p className="mt-2 text-sm text-slate-400">
              Crea tu primera encuesta para comenzar.
            </p>
            <Link
              to="/crear"
              className="mt-5 inline-flex rounded-xl bg-indigo-500 px-4 py-2.5 font-medium text-white hover:bg-indigo-400"
            >
              Crear mi primera encuesta
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {encuestas.slice(0, 5).map((encuesta) => {
              const votos = encuesta.opciones.reduce(
                (suma, opcion) => suma + opcion.votos,
                0,
              )

              return (
                <div
                  key={encuesta.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {encuesta.pregunta}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {votos} votos · {encuesta.opciones.length} opciones
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                      encuesta.activa
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-500/15 text-slate-400'
                    }`}
                  >
                    {encuesta.activa ? 'Activa' : 'Cerrada'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
