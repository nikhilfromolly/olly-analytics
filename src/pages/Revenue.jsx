import { useMemo, useState } from 'react'
import { Info, Search, X } from 'lucide-react'
import { useBrands } from '../hooks/useBrands'
import { MONTHS, PAID_MONTHS } from '../lib/revenueStatus'

function MonthBarChart({ title, series, formatValue, color }) {
  const max = Math.max(...series.map((s) => s.value), 1)
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl px-5 py-4 shadow-sm">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-4">{title}</p>
      <div className="flex items-end gap-4 h-32">
        {series.map((s) => (
          <div key={s.label} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center h-24">
              <div
                className="w-full max-w-10 rounded-t-md transition-all"
                style={{ height: `${(s.value / max) * 100}%`, background: color, minHeight: s.value ? 4 : 0 }}
                title={formatValue ? formatValue(s.value) : s.value}
              />
            </div>
            <div className="text-[10.5px] text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Revenue() {
  const { data: brands = [], isLoading, isError, error } = useBrands()
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const brandByName = new Map(brands.map((b) => [b.name, b]))
    return Object.entries(PAID_MONTHS)
      .map(([name, months]) => {
        const monthSet = new Set(months)
        const brand = brandByName.get(name)
        const firstMonthIdx = MONTHS.findIndex((m) => monthSet.has(m))
        const lastMonthIdx = MONTHS.length - 1 - [...MONTHS].reverse().findIndex((m) => monthSet.has(m))
        const currentlyPaid = monthSet.has(MONTHS[MONTHS.length - 1])
        return { name, monthSet, brand, firstMonthIdx, lastMonthIdx, currentlyPaid }
      })
      .sort((a, b) => a.firstMonthIdx - b.firstMonthIdx || a.name.localeCompare(b.name))
  }, [brands])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((r) => r.name.toLowerCase().includes(q))
  }, [rows, search])

  const convertedPerMonth = useMemo(
    () => MONTHS.map((m, i) => ({ label: m.slice(0, 3), value: rows.filter((r) => r.firstMonthIdx === i).length })),
    [rows]
  )

  const revenuePerMonth = useMemo(
    () =>
      MONTHS.map((m) => ({
        label: m.slice(0, 3),
        value: rows.reduce((sum, r) => sum + (r.monthSet.has(m) ? Number(r.brand?.amount) || 0 : 0), 0),
      })),
    [rows]
  )

  const missingAmountBrands = useMemo(
    () => rows.filter((r) => r.currentlyPaid && !r.brand?.amount).map((r) => r.name),
    [rows]
  )

  if (isLoading) return <div className="flex items-center justify-center h-64 text-[13px] text-gray-400">Loading…</div>
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-[13px] text-red-500 text-center px-8">
        Couldn't load brands: {error.message}
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#fafaf9]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8 gap-3">
          <h1
            className="text-[32px] text-gray-900 leading-none"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, letterSpacing: '-0.02em' }}
          >
            Revenue
          </h1>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand"
              className="pl-7 pr-7 py-1.5 w-56 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <MonthBarChart title="Brands converted to paid" series={convertedPerMonth} color="#6366f1" />
          <MonthBarChart
            title="Revenue collected"
            series={revenuePerMonth}
            formatValue={(v) => `₹${v.toLocaleString('en-IN')}`}
            color="#10b981"
          />
        </div>
        {missingAmountBrands.length > 0 && (
          <div className="mb-8 flex items-start gap-1.5 text-[11px] text-gray-400">
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            <span>
              Revenue collected excludes {missingAmountBrands.length} currently-paid brand{missingAmountBrands.length === 1 ? '' : 's'} with
              no "amount" set in Supabase: {missingAmountBrands.join(', ')}.
            </span>
          </div>
        )}
        {missingAmountBrands.length === 0 && <div className="mb-8" />}

        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div
            className="grid gap-2 px-6 py-2.5 bg-gray-50/70 border-b border-gray-100 text-[10px] uppercase tracking-widest font-semibold text-gray-400"
            style={{ gridTemplateColumns: `1.4fr repeat(${MONTHS.length}, 1fr) 90px` }}
          >
            <div>Brand</div>
            {MONTHS.map((m) => (
              <div key={m} className="text-center">{m.slice(0, 3)}</div>
            ))}
            <div className="text-center">Status</div>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredRows.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-gray-400">No brands match.</div>
            ) : (
              filteredRows.map((r) => (
                <div
                  key={r.name}
                  className="grid gap-2 px-6 py-3 items-center hover:bg-gray-50/50 transition-colors"
                  style={{ gridTemplateColumns: `1.4fr repeat(${MONTHS.length}, 1fr) 90px` }}
                >
                  <div className="text-[13px] font-semibold text-gray-900 truncate">{r.name}</div>
                  {MONTHS.map((m) => (
                    <div key={m} className="flex justify-center">
                      {r.monthSet.has(m) ? (
                        <span className="text-[10.5px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-600">Paid</span>
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-center">
                    {r.currentlyPaid ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Paid this month" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-red-400" title="Didn't renew" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
