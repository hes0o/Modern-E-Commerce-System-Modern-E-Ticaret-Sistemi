import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

const BG_MAP = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  yellow: 'bg-amber-50 text-amber-600 border-amber-100',
  red: 'bg-red-50 text-red-600 border-red-100',
}

export default function StatCard({ title, value, icon: Icon, color = 'indigo', change, subtitle, onClick }) {
  const iconStyle = BG_MAP[color] || BG_MAP.indigo

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus
  const trendBadge = change > 0
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
    : change < 0
      ? 'bg-red-50 text-red-700 border-red-200/60'
      : 'bg-slate-50 text-slate-600 border-slate-200/60'

  return (
    <div className="card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer"
      onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 tracking-tight">{title}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{value}</p>
        </div>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0', iconStyle)}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {change !== undefined ? (
          <span className={clsx('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border', trendBadge)}>
            <TrendIcon size={12} />
            <span>%{Math.abs(change)} geçen aya göre</span>
          </span>
        ) : subtitle ? (
          <span className="text-[11px] font-medium text-slate-500">{subtitle}</span>
        ) : null}
      </div>
    </div>
  )
}
