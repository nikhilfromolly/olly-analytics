import { useState } from 'react'
import { X } from 'lucide-react'

const PLANS = ['Lite', 'Growth', 'Pro']

export default function BrandModal({ brand, onSave, onClose, saving }) {
  const isEdit = !!brand
  const [name, setName] = useState(brand?.name || '')
  const [status, setStatus] = useState(brand?.status || 'paid')
  const [plan, setPlan] = useState(brand?.plan || '')
  const [emails, setEmails] = useState((brand?.amplitude_emails || []).join(', '))
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Brand name is required.')
      return
    }
    const amplitude_emails = emails
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onSave({
      name: name.trim(),
      status,
      plan: status === 'paid' ? plan || null : null,
      amplitude_emails,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold text-gray-900">{isEdit ? 'Edit brand' : 'Add brand'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Brand name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Beyond Burg"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              >
                <option value="paid">Paid</option>
                <option value="trial">Trial</option>
              </select>
            </div>
            {status === 'paid' && (
              <div className="flex-1">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Plan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                >
                  <option value="">—</option>
                  {PLANS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">
              Amplitude emails <span className="normal-case font-normal text-gray-400">(comma-separated)</span>
            </label>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="owner@brand.com, teammate@brand.com"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-gray-900 text-white rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
