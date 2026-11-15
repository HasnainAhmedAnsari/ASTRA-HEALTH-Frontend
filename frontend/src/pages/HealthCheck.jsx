
import { useEffect, useState } from 'react'
import { Activity, HeartPulse, Thermometer, Wind, Droplets, Moon, AlertTriangle, RefreshCw } from 'lucide-react'
import api from '../services/api'
import { useCrew } from '../context/Crew'
import { Card, ErrorBox, Loading, PageHeader, fmt, lvl } from '../components/ui'

const metrics = [
  ['Heart rate', 'heart_rate_bpm', 'bpm', HeartPulse],
  ['Blood pressure', null, 'mmHg', Activity],
  ['Body temperature', 'body_temp_c', '°C', Thermometer],
  ['Blood oxygen', 'spo2_pct', '%', Wind],
  ['Respiratory rate', 'resp_rate_bpm', '/min', Droplets],
  ['Sleep', 'sleep_hours', 'hours', Moon],
]

export default function HealthCheck() {
  const { selectedId, astronaut } = useCrew()
  const [data, setData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!selectedId) return
    setLoading(true)
    setError('')
    try {
      const [dashboard, recentAlerts] = await Promise.all([
        api.dashboard(selectedId),
        api.alerts(selectedId, 30),
      ])
      setData(dashboard)
      setAlerts(Array.isArray(recentAlerts) ? recentAlerts : [])
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Could not load health data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [selectedId])

  if (loading) return <Loading label="Loading health check…" />

  if (error) return (
    <div className="space-y-4">
      <PageHeader crumb="MISSION CONTROL / HEALTH CHECK" title="Health Check" />
      <ErrorBox message={error} />
      <button onClick={load} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-white">
        <RefreshCw size={15} className="mr-2 inline" />Try again
      </button>
    </div>
  )

  if (!data?.latest_reading) return (
    <div className="space-y-4">
      <PageHeader crumb="MISSION CONTROL / HEALTH CHECK" title="Health Check" />
      <Card><p className="text-sm text-slate-300">No readings available for {astronaut?.name || selectedId}.</p></Card>
    </div>
  )

  const r = data.latest_reading
  const values = {
    heart_rate_bpm: r.heart_rate_bpm,
    body_temp_c: r.body_temp_c,
    spo2_pct: r.spo2_pct,
    resp_rate_bpm: r.resp_rate_bpm,
    sleep_hours: r.sleep_hours,
  }

  return (
    <div className="space-y-7">
      <PageHeader
        crumb="MISSION CONTROL / HEALTH CHECK"
        title="Health Check"
        subtitle={`Latest health readings for ${data.astronaut?.name || astronaut?.name || selectedId} · Mission day ${data.mission_day ?? '—'}`}
        right={<button onClick={load} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-white"><RefreshCw size={15} className="mr-2 inline" />Refresh</button>}
      />

      <div className={`rounded-xl border p-5 ${lvl(data.overall_level).border} ${lvl(data.overall_level).bg}`}>
        <p className="text-xs uppercase tracking-widest text-slate-400">Overall health status</p>
        <p className={`mt-1 text-3xl font-bold capitalize ${lvl(data.overall_level).text}`}>{data.overall_level || 'Unknown'}</p>
        <p className="mt-2 text-sm text-slate-300">
          Risk score: {data.assessment?.risk_score ?? '—'} / 100 · Predicted pattern: {(data.assessment?.predicted_condition || 'not available').replaceAll('_', ' ')}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Latest vital signs</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map(([name, key, unit, Icon]) => {
            const value = key ? values[key] : `${fmt(r.systolic_bp, 0)} / ${fmt(r.diastolic_bp, 0)}`
            return (
              <div key={name} className="rounded-xl border border-slate-700 bg-petrol-raised p-4">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-sm">{name}</span><Icon size={18} />
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {value == null ? '—' : key === 'body_temp_c' || key === 'spo2_pct' || key === 'sleep_hours' ? fmt(value, 1) : fmt(value, 0)}
                  <span className="text-sm font-normal text-slate-400"> {unit}</span>
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <Card title={`Health alerts · ${alerts.length} in the last 30 days`}>
        {alerts.length ? (
          <div className="space-y-3">
            {alerts.slice(0, 10).map((a, i) => (
              <div key={a.id || i} className="flex items-start gap-3 border-b border-slate-700 pb-3 last:border-0">
                <AlertTriangle size={17} className={a.level === 'red' || a.risk_level === 'red' ? 'text-red-400' : 'text-amber-400'} />
                <div>
                  <p className="text-sm font-semibold capitalize text-white">
                    {a.metric || a.title || a.type || 'Health alert'} · {a.level || a.risk_level || 'notice'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {a.message || a.description || a.recommendation || 'Review this alert in the monitoring dashboard.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-400">No alerts in the last 30 days.</p>}
      </Card>

      <p className="text-xs text-slate-500">Decision support only, not a medical diagnosis. Readings are based on the project's recorded demonstration data.</p>
    </div>
  )
}
