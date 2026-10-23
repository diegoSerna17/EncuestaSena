
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Settings,
  ClipboardList,
} from 'lucide-react'

const enlaces = [
  { to: '/', texto: 'Inicio', icono: LayoutDashboard },
  { to: '/crear', texto: 'Crear', icono: PlusCircle },
  { to: '/resultados', texto: 'Visualizar', icono: BarChart3 },
  { to: '/administrar', texto: 'Administrar', icono: Settings },
]

export default function Navbar() {
  return (
    <header className="border-b border-white/10 bg-[#0d1221]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500 p-2.5 text-white">
            <ClipboardList size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              Encuesta<span className="text-indigo-400">Sena</span>
            </h1>
            <p className="text-xs text-slate-400">
              Plataforma de encuestas
            </p>
          </div>
        </NavLink>

        <nav className="flex flex-wrap gap-2">
          {enlaces.map(({ to, texto, icono: Icono }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icono size={17} />
              {texto}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
