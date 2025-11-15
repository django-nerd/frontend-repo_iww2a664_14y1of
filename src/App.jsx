import { useEffect, useMemo, useState } from 'react'
import Toggle from './components/Toggle'

function Stat({ label, value, suffix }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-gray-100">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">
        {value !== undefined && value !== null ? value : '—'}{suffix || ''}
      </p>
    </div>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Filters({ role, setRole, sortBy, setSortBy, expertise, setExpertise }) {
  const roleOptions = [
    { label: 'Hosts (CTUs)', value: 'ctu' },
    { label: 'Guests (Sponsors)', value: 'sponsor' },
  ]
  const sortOptions = role === 'ctu'
    ? [
        { label: 'Recruitment Velocity', value: 'recruitment_velocity' },
        { label: 'Data Quality (low → high)', value: 'data_quality_pdpp' },
      ]
    : [
        { label: 'EDC Usability', value: 'ecrf_edc_usability' },
        { label: 'Eligibility Rigidity', value: 'eligibility_rigidity_pct' },
      ]

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Toggle options={roleOptions} value={role} onChange={setRole} />

      <select
        className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-700"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="">No sorting</option>
        {sortOptions.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <input
        value={expertise}
        onChange={(e) => setExpertise(e.target.value)}
        placeholder="Filter by expertise (e.g., Oncology)"
        className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-700 w-64"
      />
    </div>
  )
}

export default function App() {
  const [role, setRole] = useState('ctu')
  const [sortBy, setSortBy] = useState('')
  const [expertise, setExpertise] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams()
        if (sortBy) qs.set('sort_by', sortBy)
        if (expertise) qs.set('expertise', expertise)

        const url = role === 'ctu' ? `${baseUrl}/api/ctus?${qs}` : `${baseUrl}/api/sponsors?${qs}`
        const res = await fetch(url)
        const data = await res.json()
        setItems(Array.isArray(data) ? data : [])
      } catch (e) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [role, sortBy, expertise])

  const headerTitle = role === 'ctu' ? 'Hosts Dashboard' : 'Guests Dashboard'
  const headerSubtitle = role === 'ctu'
    ? 'Benchmarks across Australian CTUs'
    : 'Benchmarks across Sponsors'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="px-6 md:px-10 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">AUS Trials Exchange</h1>
          <p className="text-slate-600">Clinical trial brokerage, styled like a travel marketplace</p>
        </div>
        <Filters role={role} setRole={setRole} sortBy={sortBy} setSortBy={setSortBy} expertise={expertise} setExpertise={setExpertise} />
      </header>

      <main className="px-6 md:px-10 pb-20">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">{headerTitle}</h2>
          <p className="text-slate-600">{headerSubtitle}</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it, idx) => (
              <Card key={idx} title={it.name} subtitle={role === 'ctu' ? `${it.city || ''} ${it.state || ''}`.trim() : undefined}>
                {role === 'ctu' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Recruitment Velocity" value={it.recruitment_velocity} suffix="/mo" />
                    <Stat label="Data Quality" value={it.data_quality_pdpp} suffix=" PD/PP" />
                    <Stat label="Feasibility → HREC" value={it?.timelines?.feasibility_to_hrec_days} suffix=" d" />
                    <Stat label="HREC → Site Init" value={it?.timelines?.hrec_to_siteinit_days} suffix=" d" />
                    <Stat label="Site Init → FPI" value={it?.timelines?.siteinit_to_fpi_days} suffix=" d" />
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Expertise</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(it.trial_expertise || []).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-700">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="EDC Usability" value={it.ecrf_edc_usability} suffix="/10" />
                    <Stat label="Eligibility Rigidity" value={it.eligibility_rigidity_pct} suffix="%" />
                    <Stat label="CTA Execution" value={it?.startup_timelines?.cta_execution_rate} suffix="%" />
                    <Stat label="Feasibility TAT" value={it?.startup_timelines?.feasibility_turnaround_days} suffix=" d" />
                    <Stat label="Visit Freq" value={it?.monitoring?.visit_frequency_days} suffix=" d" />
                    <Stat label="Query Closure" value={it?.monitoring?.query_closure_days} suffix=" d" />
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Expertise</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(it.trial_expertise || []).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-700">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="text-center text-slate-500 mt-10">
            No results. Try adjusting filters. You can POST sample data to the API to populate the dashboard.
          </div>
        )}
      </main>
    </div>
  )
}
