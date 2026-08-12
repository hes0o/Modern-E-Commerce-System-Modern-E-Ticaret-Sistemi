import clsx from 'clsx'

const COLOR_MAP = {
  green: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  red: { bg: 'bg-red-50 text-red-700 border-red-200/80', dot: 'bg-red-500' },
  yellow: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  blue: { bg: 'bg-blue-50 text-blue-700 border-blue-200/80', dot: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50 text-purple-700 border-purple-200/80', dot: 'bg-purple-500' },
  indigo: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80', dot: 'bg-indigo-500' },
  slate: { bg: 'bg-slate-100 text-slate-700 border-slate-200/80', dot: 'bg-slate-400' },
  orange: { bg: 'bg-orange-50 text-orange-700 border-orange-200/80', dot: 'bg-orange-500' },
}

const STATUS_LABEL_MAP = {
  active: { color: 'green', label: 'Aktif' },
  inactive: { color: 'slate', label: 'Pasif' },
  published: { color: 'green', label: 'Aktif' },
  draft: { color: 'yellow', label: 'Taslak' },
  archived: { color: 'slate', label: 'Arşivlendi' },
  pending: { color: 'yellow', label: 'Beklemede' },
  processing: { color: 'blue', label: 'Hazırlanıyor' },
  shipped: { color: 'purple', label: 'Kargoda' },
  delivered: { color: 'green', label: 'Teslim Edildi' },
  cancelled: { color: 'red', label: 'İptal Edildi' },
  out_of_stock: { color: 'red', label: 'Stokta Yok' },
  low_stock: { color: 'yellow', label: 'Kritik Stok' },
}

export default function Badge({ status, color, label, dot = true, className }) {
  let resolvedColor = color || 'slate'
  let resolvedLabel = label || status || ''

  if (status && STATUS_LABEL_MAP[status]) {
    resolvedColor = color || STATUS_LABEL_MAP[status].color
    resolvedLabel = label || STATUS_LABEL_MAP[status].label
  }

  const c = COLOR_MAP[resolvedColor] || COLOR_MAP.slate

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-subtle',
        c.bg, className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', c.dot)} />}
      {resolvedLabel}
    </span>
  )
}
