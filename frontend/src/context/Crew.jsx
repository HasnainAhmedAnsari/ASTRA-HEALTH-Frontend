
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const CrewContext = createContext(null)
export const useCrew = () => useContext(CrewContext)

const remember = {
  get: () => {
    try { return localStorage.getItem('astra.astronaut') }
    catch { return null }
  },
  set: (value) => {
    try { localStorage.setItem('astra.astronaut', value) }
    catch { /* storage unavailable */ }
  },
}

export function CrewProvider({ children }) {
  const [crew, setCrew] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [online, setOnline] = useState(null)
  const [version, setVersion] = useState(0)

  const loadCrew = useCallback(async () => {
    try {
      const list = await api.astronauts()
      setCrew(Array.isArray(list) ? list : [])
      setOnline(true)

      setSelectedId((current) => {
        const saved = current || remember.get()
        const match = list.find((a) => String(a.id) === String(saved))
        const nextId = match?.id ?? null
        if (nextId !== null) remember.set(String(nextId))
        return nextId === null ? null : String(nextId)
      })
    } catch (error) {
      console.error('Could not load astronauts:', error)
      setOnline(false)
    }
  }, [])

  useEffect(() => {
    loadCrew()
  }, [loadCrew])

  const select = (id) => {
    const value = String(id)
    remember.set(value)
    setSelectedId(value)
  }

  const refresh = () => {
    setVersion((value) => value + 1)
    loadCrew()
  }

  const astronaut =
    crew.find((a) => String(a.id) === String(selectedId)) || null

  return (
    <CrewContext.Provider
      value={{
        crew,
        astronaut,
        selectedId,
        select,
        refresh,
        version,
        online,
        user: astronaut,
        authReady: online !== null,
        isStaff: false,
        signOut: () => {
          setSelectedId(null)
          try { localStorage.removeItem('astra.astronaut') }
          catch { /* ignore */ }
        },
      }}
    >
      {children}
    </CrewContext.Provider>
  )
}

/** Fetch data again when the selected astronaut changes or data is refreshed. */
export function useAstronautData(fetcher, deps = []) {
  const { selectedId, version } = useCrew()
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!selectedId) {
      setState({ data: null, loading: false, error: null })
      return
    }

    let alive = true
    setState((current) => ({ ...current, loading: true, error: null }))

    fetcher(selectedId)
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (alive) {
          setState({
            data: null,
            loading: false,
            error: error?.response?.data?.detail || error.message,
          })
        }
      })

    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, version, ...deps])

  return state
}
