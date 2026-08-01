// Amplitude daily-export loader + shared helpers.

const files = import.meta.glob('../../amplitude-data/*.json', { eager: true, import: 'default' })

export const allDays = Object.entries(files)
  .map(([p, data]) => {
    const date = p.match(/(\d{4}-\d{2}-\d{2})\.json$/)?.[1]
    if (!data.users && Array.isArray(data.events)) {
      const users = {}
      for (const ev of data.events) {
        const uid = ev.user_id
        if (!uid) continue
        if (!users[uid]) users[uid] = { events: [] }
        users[uid].events.push(ev)
      }
      return { date, users }
    }
    return { date, ...data }
  })
  .filter((d) => d.date)
  .sort((a, b) => a.date.localeCompare(b.date))

export function parseAmpTime(s) {
  if (!s) return null
  const t = new Date(s.replace(' ', 'T').slice(0, 23) + 'Z').getTime()
  return Number.isNaN(t) ? null : t
}
