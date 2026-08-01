export default function NavBar({ tab, onChange }) {
  const TABS = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'users', label: 'Users' },
    { key: 'revenue', label: 'Revenue' },
  ]
  return (
    <div className="border-b border-gray-200/80 bg-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-8 flex items-center h-12 gap-1">
        <span
          className="text-[14px] text-gray-900 mr-6"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Olly Analytics
        </span>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
              tab === t.key ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
