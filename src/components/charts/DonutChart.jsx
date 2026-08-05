import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

export default function DonutChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: 'Elektronik', value: 45, color: '#6366f1' },
    { name: 'Giyim', value: 30, color: '#10b981' },
    { name: 'Ev & Yaşam', value: 15, color: '#f59e0b' },
    { name: 'Spor', value: 10, color: '#ef4444' },
  ]

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
