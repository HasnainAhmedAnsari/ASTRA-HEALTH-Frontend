
import { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { LogOut, Menu, WifiOff } from 'lucide-react'

import { CrewProvider, useCrew } from './context/Crew'
import Brand from './components/Brand'
import MobileMenu from './components/MobileMenu'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Monitoring from './pages/Monitoring'
import Assessment from './pages/Assessment'
import HumanBody from './pages/HumanBody'
import Guidance from './pages/Guidance'
import Reports from './pages/Reports'
import HealthCheck from './pages/HealthCheck'
import Login from './pages/Login'

const navigation = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Health Check', path: '/health-check' },
  { name: 'Monitoring', path: '/monitoring' },
  { name: 'Assessment', path: '/assessment' },
  { name: 'Human Body', path: '/human-body' },
  { name: 'Guidance & AI', path: '/guidance' },
  { name: 'Reports', path: '/reports' },
]

function CrewSelect({ id }) {
  const { crew, selectedId, select } = useCrew()

  return (
    <div>
      <label htmlFor={id} className="t-caption block text-slate-500">
        Crew member
      </label>
      <select
        id={id}
        value={selectedId || ''}
        onChange={(e) => select(e.target.value)}
        className="mt-1 min-h-[44px] w-full rounded-md border border-slate-700 bg-petrol-deep px-3 text-base text-ivory outline-none focus:border-celadon"
      >
        {crew.map((person) => (
          <option key={person.id} value={person.id}>
            {person.id} · {person.name || 'Unnamed astronaut'}
          </option>
        ))}
      </select>
    </div>
  )
}

function AppShell() {
  const { crew, selectedId, astronaut, online, signOut } = useCrew()
  const [menu, setMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  if (online === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading...
      </div>
    )
  }

  if (online === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-petrol p-6 text-ivory">
        <div className="max-w-xl rounded-lg border border-red-400/30 p-8">
          <WifiOff className="text-red-400" size={30} />
          <h1 className="t-sub mt-4">Cannot reach the ASTRA-HEALTH backend</h1>
          <p className="t-body mt-2 text-slate-300">
            Please check the backend deployment and reload the application.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-6"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!selectedId || !astronaut) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const changeAstronaut = () => {
    signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-petrol text-ivory">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-ivory focus:px-4 focus:py-2 focus:text-petrol"
      >
        Skip to content
      </a>

      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-[17rem] flex-col border-r border-slate-800 bg-petrol-deep px-8 py-7 lg:flex">
        <Brand to="/" />

        <nav className="mt-14 flex flex-col items-start gap-2.5" aria-label="Primary">
          {navigation.map(({ name, path }) => (
            <NavLink key={path} to={path} className="link-line text-slate-300">
              {name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rule-t pt-5">
          <p className="t-eyebrow text-slate-500">System</p>
          <p className="t-ui mt-2 text-celadon">Online</p>
          <p className="t-caption mt-1 text-slate-500">
            On-board health monitoring system.
          </p>
        </div>
      </aside>

      <div className="min-h-screen lg:ml-[17rem]">
        <header className="rule-b sticky top-0 z-10 flex h-[72px] items-center justify-between gap-4 bg-petrol/95 px-[var(--gutter)] backdrop-blur lg:px-[clamp(2rem,3.5vw,4rem)]">
          <div className="min-w-0 lg:hidden">
            <Brand to="/" />
          </div>

          <p className="t-caption hidden text-slate-500 lg:block">
            On-board record
          </p>

          <div className="flex items-center gap-4">
            {crew.length > 1 && (
              <div className="hidden w-56 md:block">
                <CrewSelect id="crew" />
              </div>
            )}

            <div className="hidden text-right sm:block">
              <p className="t-ui">
                {astronaut.name || 'Selected astronaut'}
              </p>
              <p className="t-caption text-slate-500">
                ID: {astronaut.id}
              </p>
            </div>

            <button
              onClick={changeAstronaut}
              title="Change astronaut"
              aria-label="Change astronaut"
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-700 text-ivory transition hover:border-celadon lg:flex"
            >
              <LogOut size={18} />
            </button>

            <button
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              aria-expanded={menu}
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        <MobileMenu
          open={menu}
          onClose={() => setMenu(false)}
          label="Mission control"
          footer={
            <div className="space-y-4">
              {crew.length > 1 && <CrewSelect id="crew-mobile" />}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="t-ui truncate">
                    {astronaut.name || 'Selected astronaut'}
                  </p>
                  <p className="t-caption text-slate-500">
                    ID: {astronaut.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMenu(false)
                    changeAstronaut()
                  }}
                  className="btn-quiet"
                >
                  <LogOut size={18} />
                  Change
                </button>
              </div>
            </div>
          }
        >
          {navigation.map(({ name, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMenu(false)}
              className="link-line t-sub self-start !py-1.5"
            >
              {name}
            </NavLink>
          ))}
        </MobileMenu>

        <main
          id="main"
          className="px-[var(--gutter)] py-10 lg:px-[clamp(2rem,3.5vw,4rem)] lg:py-14"
        >
          <Outlet />
          <p className="t-caption rule-t mt-16 pt-6 text-slate-500">
            Decision support only, not a medical diagnosis. Vital-sign data
            in this prototype is simulated.
          </p>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CrewProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/health-check" element={<HealthCheck />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/human-body" element={<HumanBody />} />
            <Route path="/guidance" element={<Guidance />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CrewProvider>
    </BrowserRouter>
  )
}
