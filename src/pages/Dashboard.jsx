import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Info } from 'lucide-react'
import { useBrands } from '../hooks/useBrands'
import { allDays } from '../lib/amplitudeData'
import { RESOLVE_TICKETS_CLOSED, RESOLVE_ACTIVATED_NOT_CLOSING } from '../lib/resolveTickets'
import { REPLY_USAGE } from '../lib/replyUsage'

// ── Small building blocks ──────────────────────────────────────────────────

function Section({ title, span, children }) {
  return (
    <div className={span ? 'col-span-full' : ''}>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-[11px] uppercase tracking-widest font-semibold text-gray-400">{title}</h2>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div className="grid grid-cols-3 gap-4">{children}</div>
    </div>
  )
}

function Note({ children }) {
  return (
    <div className="mt-2 flex items-start gap-1.5 text-[11px] text-gray-400">
      <Info size={12} className="mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  )
}

// Tiny inline sparkline — no chart lib needed.
function Sparkline({ series, trend }) {
  const max = Math.max(...series, 1)
  const min = Math.min(...series, 0)
  const range = max - min || 1
  const W = 100
  const H = 28
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1 || 1)) * W
    const y = H - ((v - min) / range) * H
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const color = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#9ca3af'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-20 h-7 overflow-visible flex-shrink-0">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrendBadge({ trend, pct }) {
  if (trend === 'flat' || pct == null) return null
  const up = trend === 'up'
  return (
    <span className={`text-[11px] font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  )
}

function StatCard({ label, value, note, adoption, sparkSeries, trend, pct, rows, emptyMsg, span }) {
  const [open, setOpen] = useState(false)
  const canExpand = rows && rows.length > 0
  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-shadow flex flex-col ${span ? 'col-span-3' : ''} ${canExpand ? 'cursor-pointer hover:shadow-md' : ''} ${open ? 'shadow-md border-gray-300' : 'border-gray-200/80 shadow-sm'}`}
      onClick={() => canExpand && setOpen((o) => !o)}
    >
      <div className="px-5 pt-4 pb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-2 truncate">{label}</div>
          <div className="flex items-baseline gap-2">
            <div
              className="text-[30px] leading-none text-gray-900"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              {value}
            </div>
            <TrendBadge trend={trend} pct={pct} />
            {adoption != null && (
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                {adoption}% adopted
              </span>
            )}
          </div>
          {note && <div className="text-[11.5px] text-gray-400 mt-1.5 truncate">{note}</div>}
        </div>
        {sparkSeries && <Sparkline series={sparkSeries} trend={trend} />}
      </div>
      {open && (
        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50 max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {rows.length === 0 ? (
            <p className="text-[13px] text-gray-400 py-1">{emptyMsg || 'None.'}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {rows.map((r, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-[13px]">
                  <span className="text-gray-700 font-medium truncate">{r.label}</span>
                  {r.sub != null && <span className="ml-4 text-gray-400 flex-shrink-0 text-[12px]">{r.sub}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────

function activeUsersOnDay(day, paidUsers) {
  return Object.keys(day.users || {}).filter((u) => paidUsers.has(u) && day.users[u].events?.length)
}

function uniqueActiveUsers(days, paidUsers) {
  const set = new Set()
  for (const d of days) for (const u of activeUsersOnDay(d, paidUsers)) set.add(u)
  return set
}

function eventsOfType(days, paidUsers, type) {
  // returns Map<user, events[]>
  const map = new Map()
  for (const d of days) {
    for (const [u, data] of Object.entries(d.users || {})) {
      if (!paidUsers.has(u)) continue
      const hits = (data.events || []).filter((e) => e.event_type === type)
      if (hits.length) map.set(u, [...(map.get(u) || []), ...hits])
    }
  }
  return map
}

function pctChange(curr, prev) {
  if (!prev) return curr ? 100 : null
  return Math.round(((curr - prev) / prev) * 100)
}

// Maps a collection of emails to their distinct brand names — several team
// members can share one brand, so counts must dedupe by brand, not email.
function toBrandSet(emails, emailToName) {
  const set = new Set()
  for (const e of emails) set.add(emailToName[e.toLowerCase()] || e)
  return set
}

function adoptionPct(count, total) {
  if (!total) return null
  return Math.round((count / total) * 100)
}

// ── Main ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: brands = [], isLoading, isError, error } = useBrands()

  // Fixed to the last 7 days — no historical (all-time) amplitude data used.
  const windowDays = useMemo(() => allDays.slice(-7), [])
  const dateRangeLabel = useMemo(() => {
    if (!windowDays.length) return ''
    const start = format(parseISO(windowDays[0].date), 'MMM d')
    const end = format(parseISO(windowDays[windowDays.length - 1].date), 'MMM d, yyyy')
    return `${start} – ${end}`
  }, [windowDays])

  const { paidUsers, emailToName, paidBrandCount, paidBrandNames } = useMemo(() => {
    const emailToName = {}
    const paidBrands = brands.filter((b) => (b.status || 'paid') === 'paid')
    for (const b of paidBrands) {
      for (const email of b.amplitude_emails || []) emailToName[email.toLowerCase()] = b.name
    }
    return {
      paidUsers: new Set(Object.keys(emailToName)),
      emailToName,
      paidBrandCount: paidBrands.length,
      paidBrandNames: paidBrands.map((b) => b.name),
    }
  }, [brands])

  const displayName = (email) => emailToName[email.toLowerCase()] || email

  // ── DAU (within the 7-day window) — counted by distinct brand ─────────
  const dauSeries = useMemo(
    () => windowDays.map((d) => toBrandSet(activeUsersOnDay(d, paidUsers), emailToName).size),
    [paidUsers, emailToName, windowDays]
  )
  const dauToday = dauSeries[dauSeries.length - 1] || 0
  const dauYesterday = dauSeries[dauSeries.length - 2] || 0
  const dauTrend = dauToday === dauYesterday ? 'flat' : dauToday > dauYesterday ? 'up' : 'down'
  const dauRows = useMemo(() => {
    const day = windowDays[windowDays.length - 1]
    if (!day) return []
    return [...toBrandSet(activeUsersOnDay(day, paidUsers), emailToName)].sort().map((name) => ({ label: name }))
  }, [paidUsers, emailToName, windowDays])

  // ── WAU (the 7-day window as a whole) — counted by distinct brand ─────
  const wauBrands = useMemo(
    () => toBrandSet(uniqueActiveUsers(windowDays, paidUsers), emailToName),
    [paidUsers, emailToName, windowDays]
  )
  const wauRows = useMemo(
    () => [...wauBrands].sort().map((name) => ({ label: name })),
    [wauBrands]
  )

  // ── Resolve activation + ticket closing (manually curated — see resolveTickets.js) ──
  const resolveStats = useMemo(() => {
    const closedEntries = Object.entries(RESOLVE_TICKETS_CLOSED)
    const closing5Plus = closedEntries.filter(([, n]) => n >= 5)
    return {
      totalActivated: closedEntries.length + RESOLVE_ACTIVATED_NOT_CLOSING.length,
      activatedRows: [
        ...closedEntries.map(([name, n]) => ({ label: name, sub: `${n} closed` })),
        ...RESOLVE_ACTIVATED_NOT_CLOSING.map((name) => ({ label: name, sub: '0 closed' })),
      ].sort((a, b) => a.label.localeCompare(b.label)),
      notClosingCount: RESOLVE_ACTIVATED_NOT_CLOSING.length,
      notClosingRows: [...RESOLVE_ACTIVATED_NOT_CLOSING].sort().map((name) => ({ label: name })),
      closing5PlusCount: closing5Plus.length,
      closing5PlusRows: closing5Plus.sort((a, b) => a[0].localeCompare(b[0])).map(([name, n]) => ({ label: name, sub: `${n} closed` })),
    }
  }, [])

  // ── Reply engagement (manually curated — see replyUsage.js) ──────────
  const replyStats = useMemo(() => {
    const entries = Object.entries(REPLY_USAGE)
    const autoEntries = entries.filter(([, mode]) => mode === 'auto')
    const manualEntries = entries.filter(([, mode]) => mode === 'manual')
    const usingNames = new Set(entries.map(([name]) => name))
    const notUsing = paidBrandNames.filter((name) => !usingNames.has(name))
    return {
      totalCount: entries.length,
      totalRows: entries
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, mode]) => ({ label: name, sub: mode === 'auto' ? 'Auto-response' : 'Manual' })),
      autoCount: autoEntries.length,
      autoRows: autoEntries.sort((a, b) => a[0].localeCompare(b[0])).map(([name]) => ({ label: name })),
      manualCount: manualEntries.length,
      manualRows: manualEntries.sort((a, b) => a[0].localeCompare(b[0])).map(([name]) => ({ label: name })),
      notUsingCount: notUsing.length,
      notUsingRows: [...notUsing].sort().map((name) => ({ label: name })),
    }
  }, [paidBrandNames])

  // ── Ask Olly usage (within the 7-day window) — counted by brand ──────
  const askWindow = useMemo(() => eventsOfType(windowDays, paidUsers, 'ask_olly_message_sent'), [windowDays, paidUsers])

  const askOllyByBrand = useMemo(() => {
    const map = new Map()
    for (const [u, events] of askWindow.entries()) {
      const brand = emailToName[u.toLowerCase()] || u
      map.set(brand, (map.get(brand) || 0) + events.length)
    }
    return map
  }, [askWindow, emailToName])

  const askOllyRows = useMemo(
    () => [...askOllyByBrand.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([brand, n]) => ({ label: brand, sub: `${n}×` })),
    [askOllyByBrand]
  )

  const questionsAskedCount = useMemo(() => {
    let total = 0
    for (const events of askWindow.values()) total += events.length
    return total
  }, [askWindow])

  // ── Team invites (within the 7-day window) — counted by brand ────────
  const teamInvites = useMemo(() => {
    const invites = eventsOfType(windowDays, paidUsers, 'inviteTeamInviteSent')
    const byBrand = new Map()
    for (const [u, events] of invites.entries()) {
      const brand = emailToName[u.toLowerCase()] || u
      const total = events.reduce((s, e) => s + (e.event_properties?.inviteCount || (e.event_properties?.emails?.length ?? 1)), 0)
      byBrand.set(brand, (byBrand.get(brand) || 0) + total)
    }
    const rows = [...byBrand.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([brand, n]) => ({ label: brand, sub: `${n} invited` }))
    const notInvited = paidBrandNames.filter((name) => !byBrand.has(name)).sort().map((name) => ({ label: name }))
    return { invitedCount: byBrand.size, rows, notInvited }
  }, [paidUsers, emailToName, paidBrandNames, windowDays])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-[13px] text-gray-400">Loading…</div>
  }
  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen text-[13px] text-red-500 text-center px-8">
        Couldn't load brands: {error.message}. Run supabase/brands.sql against your Supabase project.
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#fafaf9]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-[32px] text-gray-900 leading-none"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, letterSpacing: '-0.02em' }}
          >
            Product Analytics
          </h1>
          <div className="text-[12.5px] text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            Last 7 days · {dateRangeLabel}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-4 gap-y-8">
          <Section title="Paid users" span>
            <StatCard label="Total paid users" value={paidBrandCount} note="brands mapped in Supabase" />
            <StatCard
              label="Daily active users"
              value={dauToday}
              note="most recent day"
              adoption={adoptionPct(dauToday, paidBrandCount)}
              sparkSeries={dauSeries}
              trend={dauTrend}
              pct={pctChange(dauToday, dauYesterday)}
              rows={dauRows}
            />
            <StatCard
              label="Weekly active users"
              value={wauBrands.size}
              note="last 7 days"
              adoption={adoptionPct(wauBrands.size, paidBrandCount)}
              rows={wauRows}
            />
          </Section>

          <Section title="Resolve" span>
            <StatCard
              label="Activated Resolve"
              value={resolveStats.totalActivated}
              note="closing + not yet closing tickets"
              adoption={adoptionPct(resolveStats.totalActivated, paidBrandCount)}
              rows={resolveStats.activatedRows}
            />
            <StatCard
              label="Activated, not closing tickets"
              value={resolveStats.notClosingCount}
              adoption={adoptionPct(resolveStats.notClosingCount, paidBrandCount)}
              rows={resolveStats.notClosingRows}
            />
            <StatCard
              label="Activated, closed 5+ tickets"
              value={resolveStats.closing5PlusCount}
              adoption={adoptionPct(resolveStats.closing5PlusCount, paidBrandCount)}
              rows={resolveStats.closing5PlusRows}
            />
            <Note>Ticket-closing isn't tracked as an Amplitude event, so this is manually curated (see src/lib/resolveTickets.js). Adoption % is of total paid brands.</Note>
          </Section>

          <Section title="Replies" span>
            <StatCard
              label="Using Olly to reply to reviews"
              value={replyStats.totalCount}
              adoption={adoptionPct(replyStats.totalCount, paidBrandCount)}
              rows={replyStats.totalRows}
            />
            <StatCard
              label="Using auto-response"
              value={replyStats.autoCount}
              adoption={adoptionPct(replyStats.autoCount, paidBrandCount)}
              rows={replyStats.autoRows}
            />
            <StatCard
              label="Replying manually"
              value={replyStats.manualCount}
              adoption={adoptionPct(replyStats.manualCount, paidBrandCount)}
              rows={replyStats.manualRows}
            />
            <StatCard
              label="Not using Olly to reply"
              value={replyStats.notUsingCount}
              adoption={adoptionPct(replyStats.notUsingCount, paidBrandCount)}
              rows={replyStats.notUsingRows}
              emptyMsg="Every paid brand is using Olly to reply."
            />
            <Note>Reply method (auto vs manual) isn't tracked as a single Amplitude event, so this is manually curated (see src/lib/replyUsage.js).</Note>
          </Section>

          <Section title="Ask Olly" span>
            <StatCard
              label="Used Ask Olly — last 7 days"
              value={askOllyRows.length}
              adoption={adoptionPct(askOllyRows.length, paidBrandCount)}
              rows={askOllyRows}
            />
            <StatCard label="Questions asked — last 7 days" value={questionsAskedCount} note="total messages sent to Ask Olly" />
          </Section>

          <Section title="Team invites" span>
            <StatCard
              label="Brands that invited team members"
              value={teamInvites.invitedCount}
              note="last 7 days"
              adoption={adoptionPct(teamInvites.invitedCount, paidBrandCount)}
              rows={teamInvites.rows}
            />
            <StatCard
              label="Have not invited anyone"
              value={teamInvites.notInvited.length}
              note="last 7 days"
              rows={teamInvites.notInvited}
              emptyMsg="Every paid brand has invited at least one teammate."
            />
          </Section>
        </div>
      </div>
    </div>
  )
}
