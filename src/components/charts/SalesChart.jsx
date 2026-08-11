import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { formatCurrency } from '@/utils/formatters'

export default function SalesChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: 'Oca', sales: 40000, orders: 24 },
    { name: 'Şub', sales: 30000, orders: 18 },
    { name: 'Mar', sales: 60000, orders: 36 },
    { name: 'Nis', sales: 80000, orders: 45 },
    { name: 'May', sales: 50000, orders: 30 },
    { name: 'Haz', sales: 90000, orders: 52 },
    { name: 'Tem', sales: 110000, orders: 64 },
    { name: 'Ağu', sales: 125000, orders: 70 },
  ]

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `₺${val / 1000}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
            formatter={(val) => [formatCurrency(val), 'Satış']}
          />
          <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
