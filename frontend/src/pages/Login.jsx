
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { useCrew } from '../context/Crew'
import Brand from '../components/Brand'

export default function Login() {
  const { crew, astronaut, selectedId, select, online } = useCrew()
  const navigate = useNavigate()

  if (online === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-petrol text-ivory">
        Loading astronauts...
      </div>
    )
  }

  if (online === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-petrol p-6 text-ivory">
        <div className="max-w-md text-center">
          <h1 className="t-section">Backend unavailable</h1>
          <p className="mt-4 text-slate-300">
            ASTRA-HEALTH could not load the astronaut records.
            Please try again.
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

  if (crew.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-petrol p-6 text-ivory">
        <div className="max-w-md text-center">
          <h1 className="t-section">No astronauts found</h1>
          <p className="mt-4 text-slate-300">
            The backend is online, but there are currently no astronaut
            records available.
          </p>
        </div>
      </div>
    )
  }

  if (selectedId && astronaut) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-petrol text-ivory">
      <header className="flex h-20 items-center px-8">
        <Brand to="/" />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg rounded-xl bg-ivory p-8 text-petrol shadow-xl">
          <p className="t-eyebrow opacity-70">Mission control</p>
          <h1 className="t-section mt-3">Select astronaut</h1>
          <p className="t-body mt-3 opacity-70">
            Choose an astronaut to access their health monitoring dashboard.
          </p>

          <div className="mt-8 space-y-3">
            {crew.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => select(person.id)}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  String(selectedId) === String(person.id)
                    ? 'border-petrol bg-petrol/10'
                    : 'border-petrol/20 hover:border-petrol/60'
                }`}
              >
                <span className="block font-semibold">
                  {person.name || 'Unnamed astronaut'}
                </span>
                <span className="t-caption mt-1 block opacity-60">
                  ID: {person.id}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!selectedId}
            onClick={() => navigate('/dashboard')}
            className="btn-primary mt-8 flex w-full items-center justify-center gap-3 disabled:opacity-40"
          >
            Continue to dashboard
            <ArrowRight size={18} />
          </button>
        </div>
      </main>

      <p className="t-caption px-8 pb-6 text-center text-slate-400">
        Decision support only, not a medical diagnosis.
      </p>
    </div>
  )
}
