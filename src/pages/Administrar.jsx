
import { enlaceEncuesta } from '../encuestaStore'
import {
  Copy,
  ExternalLink,
  Lock,
  LockOpen,
  Trash2,
  ClipboardList,
} from 'lucide-react'

export default function Administrar({
  encuestas,
  onCambiarEstado,
  onEliminar,
}) {
  async function copiar(id) {
    try {
      await navigator.clipboard.writeText(enlaceEncuesta(id))
      alert('Enlace copiado correctamente.')
    } catch {
      window.prompt('Copia este enlace:', enlaceEncuesta(id))
    }
  }

  function eliminar(id) {
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar esta encuesta? Esta acción no se puede deshacer.',
    )

    if (confirmar) {
      onEliminar(id)
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium text-indigo-400">
          GESTIÓN
        </p>
        <h2 className="text-3xl font-bold text-white">
          Administrar encuestas
        </h2>
        <p className="mt-2 text-slate-400">
          Controla el estado y los enlaces de tus encuestas.
        </p>
      </div>

      {encuestas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
          <ClipboardList size={42} className="mx-auto mb-4 text-slate-500" />
          <h3 className="font-semibold text-white">
            No hay encuestas para administrar
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Cuando crees una encuesta, aparecerá en esta sección.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {encuestas.map((encuesta) => {
            const votos = encuesta.opciones.reduce(
              (suma, opcion) => suma + opcion.votos,
              0,
            )

            return (
              <article
                key={encuesta.id}
                className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          encuesta.activa
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-500/15 text-slate-400'
                        }`}
                      >
                        {encuesta.activa ? 'Activa' : 'Cerrada'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {votos} votos
                      </span>
                    </div>

                    <h3 className="break-words text-lg font-semibold text-white">
                      {encuesta.pregunta}
                    </h3>

                    <p className="mt-2 break-all text-xs text-slate-500">
                      ID: {encuesta.id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => copiar(encuesta.id)}
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm hover:bg-white/5"
                    >
                      <Copy size={16} /> Copiar enlace
                    </button>

                    <a
                      href={enlaceEncuesta(encuesta.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm hover:bg-white/5"
                    >
                      <ExternalLink size={16} /> Abrir
                    </a>

                    <button
                      onClick={() => onCambiarEstado(encuesta.id)}
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm hover:bg-white/5"
                    >
                      {encuesta.activa ? (
                        <><Lock size={16} /> Cerrar</>
                      ) : (
                        <><LockOpen size={16} /> Reabrir</>
                      )}
                    </button>

                    <button
                      onClick={() => eliminar(encuesta.id)}
                      className="flex items-center gap-2 rounded-lg border border-rose-500/20 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
