import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useAddBrand, useBrands, useDeleteBrand, useUpdateBrand } from '../hooks/useBrands'
import BrandModal from '../components/BrandModal'

export default function Users() {
  const { data: brands = [], isLoading, isError, error } = useBrands()
  const addBrand = useAddBrand()
  const updateBrand = useUpdateBrand()
  const deleteBrand = useDeleteBrand()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)

  const filteredBrands = useMemo(() => {
    const sorted = [...brands].sort((a, b) => a.name.localeCompare(b.name))
    if (!search.trim()) return sorted
    const q = search.toLowerCase()
    return sorted.filter(
      (b) => b.name.toLowerCase().includes(q) || (b.amplitude_emails || []).some((e) => e.toLowerCase().includes(q))
    )
  }, [brands, search])

  function openAdd() {
    setEditingBrand(null)
    setModalOpen(true)
  }

  function openEdit(brand) {
    setEditingBrand(brand)
    setModalOpen(true)
  }

  function handleSave(values) {
    if (editingBrand) {
      updateBrand.mutate({ id: editingBrand.id, ...values }, { onSuccess: () => setModalOpen(false) })
    } else {
      addBrand.mutate(values, { onSuccess: () => setModalOpen(false) })
    }
  }

  function handleDelete(brand) {
    if (!window.confirm(`Delete "${brand.name}"? This can't be undone.`)) return
    deleteBrand.mutate(brand.id)
  }

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
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1
            className="text-[32px] text-gray-900 leading-none"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, letterSpacing: '-0.02em' }}
          >
            Users
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brand or email"
                className="pl-7 pr-7 py-1.5 w-56 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus size={14} />
              Add brand
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[1fr_1fr_100px_100px_72px] gap-4 px-6 py-2.5 bg-gray-50/70 border-b border-gray-100 text-[10px] uppercase tracking-widest font-semibold text-gray-400">
            <div>Brand</div>
            <div>Emails</div>
            <div>Status</div>
            <div>Plan</div>
            <div></div>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredBrands.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-gray-400">
                {brands.length === 0 ? 'No brands yet — click "Add brand" to create one.' : 'No brands match.'}
              </div>
            ) : (
              filteredBrands.map((b) => (
                <div key={b.id} className="grid grid-cols-[1fr_1fr_100px_100px_72px] gap-4 px-6 py-3.5 items-start hover:bg-gray-50/50 transition-colors">
                  <div className="text-[13px] font-semibold text-gray-900 truncate pt-0.5">{b.name}</div>
                  <div className="text-[12.5px] text-gray-600 space-y-0.5">
                    {(b.amplitude_emails || []).length === 0 ? (
                      <span className="text-gray-300 italic">no email mapped</span>
                    ) : (
                      b.amplitude_emails.map((e) => <div key={e} className="truncate">{e}</div>)
                    )}
                  </div>
                  <div className="pt-0.5">
                    {b.status === 'trial' ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600">On trial</span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-600">Paid</span>
                    )}
                  </div>
                  <div className="text-[13px] text-gray-500 pt-0.5">{b.status === 'paid' ? b.plan || '—' : '—'}</div>
                  <div className="flex items-center gap-1 pt-0.5">
                    <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(b)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <BrandModal
          brand={editingBrand}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          saving={addBrand.isPending || updateBrand.isPending}
        />
      )}
    </div>
  )
}
