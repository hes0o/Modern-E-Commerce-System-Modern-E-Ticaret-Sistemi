import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { formatCurrency } from '@/utils/formatters'
import { BarChart2 } from 'lucide-react'

export default function SalesChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center gap-3 text-slate-400">
        <BarChart2 size={36} strokeWidth={1.5} />
        <p className="text-sm font-medium">Bu dönem için satış verisi bulunamadı</p>
        <p className="text-xs text-slate-300">Sipariş oluşturulduktan sonra grafik güncellenecektir</p>
      </div>
    )
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(val) => val >= 1000 ? `₺${(val / 1000).toFixed(0)}k` : `₺${val}`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
            formatter={(val, name) => [formatCurrency(val), name === 'sales' ? 'Satış' : 'Sipariş']}
            labelStyle={{ color: '#94a3b8', fontSize: 11 }}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#salesGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#6366f1' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
