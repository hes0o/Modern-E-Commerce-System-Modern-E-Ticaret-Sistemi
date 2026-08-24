import { useState, useEffect } from 'react'
import SalesChart from '@/components/charts/SalesChart'
import { Download, Calendar, ChevronDown, TrendingUp, ShoppingBag, DollarSign, BarChart2 } from 'lucide-react'
import api from '@/services/api'
import { formatCurrency } from '@/utils/formatters'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30days')
  const [open, setOpen] = useState(false)
  const [salesData, setSalesData] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusCounts, setStatusCounts] = useState({})

  const dateOptions = [
    { value: '7days', label: 'Son 7 Gün', period: '7D' },
    { value: '30days', label: 'Son 30 Gün', period: '1M' },
    { value: '90days', label: 'Son 90 Gün', period: '1Y' },
    { value: '1year', label: 'Bu Yıl', period: '1Y' },
  ]

  useEffect(() => {
    async function loadReport() {
      setLoading(true)
      try {
        const today = new Date()
        const dateTo = today.toISOString().split('T')[0]
        const past = new Date()
        const opt = dateOptions.find((o) => o.value === dateRange)
        if (dateRange === '7days') past.setDate(today.getDate() - 7)
        else if (dateRange === '30days') past.setDate(today.getDate() - 30)
        else if (dateRange === '90days') past.setDate(today.getDate() - 90)
        else past.setFullYear(today.getFullYear() - 1)
        const dateFrom = past.toISOString().split('T')[0]

        const [chartRes, summaryRes, dashRes] = await Promise.allSettled([
          api.get('/api/admin/reports/monthly-sales', { params: { period: opt?.period || '1M' } }),
          api.get('/api/admin/reports/sales', { params: { date_from: dateFrom, date_to: dateTo } }),
          api.get('/api/admin/dashboard'),
        ])

        if (chartRes.status === 'fulfilled') {
          const points = chartRes.value.data?.data?.points || []
          setSalesData(points.map((p) => ({ name: p.name, sales: p.sales, orders: p.orders })))
        }

        if (summaryRes.status === 'fulfilled') {
          setSummary(summaryRes.value.data?.data)
        }

        if (dashRes.status === 'fulfilled') {
          setStatusCounts(dashRes.value.data?.data?.statusCounts || {})
        }
      } catch (err) {
        console.error('Report load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadReport()
  }, [dateRange])

  const handleExportCSV = async () => {
    try {
      const today = new Date()
      const dateTo = today.toISOString().split('T')[0]
      const past = new Date()
      if (dateRange === '7days') past.setDate(today.getDate() - 7)
      else if (dateRange === '30days') past.setDate(today.getDate() - 30)
      else if (dateRange === '90days') past.setDate(today.getDate() - 90)
      else past.setFullYear(today.getFullYear() - 1)
      const dateFrom = past.toISOString().split('T')[0]

      const response = await api.get('/api/admin/reports/sales/export.csv', {
        params: { date_from: dateFrom, date_to: dateTo },
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `satis-raporu-${dateFrom}-${dateTo}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('CSV Export Error:', err)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Raporlar & Analizler</h1>
          <p className="page-subtitle">Finansal performans ve satış analizi raporları.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:shadow-md transition"
            >
              <Calendar size={14} className="text-slate-400" />
              {dateOptions.find((item) => item.value === dateRange)?.label}
              <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">
                {dateOptions.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => { setDateRange(item.value); setOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition ${dateRange === item.value ? 'bg-slate-50 font-semibold text-brand-600' : ''}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CSV Button */}
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm flex items-center gap-2">
            <Download size={14} />
            CSV İndir
          </button>
        </div>
      </div>

      {/* Özet Kartları */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ShoppingBag size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Toplam Sipariş</p>
              <p className="text-xl font-bold text-slate-900">{summary.total_orders}</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Toplam Satış</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.total_sales)}</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">KDV Toplamı</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.total_vat)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grafik */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800">Gelir Performansı</h3>
        {loading ? (
          <div className="h-72 skeleton rounded-xl" />
        ) : (
          <SalesChart data={salesData} />
        )}
      </div>

      {/* Order Status Breakdown */}
      {Object.keys(statusCounts).length > 0 && (() => {
        const STATUS_LABELS = {
          pending:    { label: 'Beklemede',     color: 'bg-yellow-400' },
          confirmed:  { label: 'Onaylandı',     color: 'bg-teal-400' },
          preparing:  { label: 'Hazırlanıyor',  color: 'bg-blue-400' },
          shipped:    { label: 'Kargoda',       color: 'bg-purple-400' },
          delivered:  { label: 'Teslim Edildi', color: 'bg-green-400' },
          completed:  { label: 'Tamamlandı',    color: 'bg-emerald-500' },
          cancelled:  { label: 'İptal Edildi',  color: 'bg-red-400' },
        }
        const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1
        return (
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 size={18} className="text-indigo-500" /> Sipariş Durum Dağılımı
            </h3>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => {
                const cfg = STATUS_LABELS[status] || { label: status, color: 'bg-gray-400' }
                const pct = Math.round((count / totalOrders) * 100)
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-28 flex-shrink-0">{cfg.label}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-full rounded-full ${cfg.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-12 text-right">{count} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}