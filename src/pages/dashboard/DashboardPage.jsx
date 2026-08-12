import { useEffect, useState } from 'react'
import StatCard from '@/components/common/StatCard'
import SalesChart from '@/components/charts/SalesChart'
import Badge from '@/components/common/Badge'
import { ShoppingBag, DollarSign, Users, AlertTriangle, ArrowRight, Plus, Package, Download } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { userService } from '@/services/userService'
import { stockService } from '@/services/stockService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Link } from 'react-router-dom'
import TopProducts from "@/components/dashboard/TopProducts"
import { useNavigate, useLocation } from 'react-router-dom'


export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    dailyOrders: 0,
    monthlySales: 0,
    totalSales: 0,
    totalCustomers: 0,
    lowStock: 0,
  })
  const [salesData, setSalesData] = useState([])
  const [latestOrders, setLatestOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('1M')

  const PERIODS = [{ value: '1D', label: 'Bugün' },
  { value: '7D', label: '7 Gün' },
  { value: '1M', label: '1 Ay' },
  { value: '1Y', label: '1 Yıl' },
  { value: '2Y', label: '2 Yıl' },
  ]

  useEffect(() => {
    async function loadDashboard() {
      try {
        const orderStats = await orderService.getStats()
        const userStats = await userService.getStats()
        const stockStats = await stockService.getStats()
        const salesChart = await orderService.getSalesByMonth(period)
        const recent = await orderService.getAll({ page: 1, limit: 5 })

        setStats({
          dailyOrders: orderStats.todayOrders || 0,
          monthlySales: orderStats.monthlyRevenue || 0,
          totalSales: orderStats.totalRevenue || 0,
          totalCustomers: userStats.total || 0,
          lowStock: (stockStats.lowStock || 0) + (stockStats.outOfStock || 0),
        })
        setSalesData(salesChart)
        setLatestOrders(recent.items)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [period])

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Kontrol Paneli</h1>
          <p className="page-subtitle">Hoş geldiniz! Mağazanızın genel durumu ve canlı metrikleri.</p>
        </div>

        <div className="flex items-center gap-3">

          <Link to="/products/new" className="btn btn-primary">
            <Plus size={15} />
            Yeni Ürün Ekle
          </Link>

          <Link to="/reports" className="btn btn-secondary">
            <Download size={15} />
            Rapor Al
          </Link>

        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <StatCard
          title="Günlük Sipariş"
          value={stats.dailyOrders}
          icon={ShoppingBag}
          color="indigo"

        />
        <StatCard
          title="Bu Ayki Satış"
          value={formatCurrency(stats.monthlySales)}
          icon={DollarSign}
          color="green"

        />
        <StatCard
          title="Toplam Satış Hacmi"
          value={formatCurrency(stats.totalSales)}
          icon={DollarSign}
          color="green"

        />
        <StatCard
          title="Toplam Müşteri"
          value={stats.totalCustomers}
          icon={Users}
          color="yellow"

        />
        <StatCard
          title="Kritik Stok Uyarısı"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="red"
          subtitle="Yenilenmesi gereken ürünler"
          onClick={() => navigate('/stock')}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Gelir Performansı</h3>
              <p className="text-xs text-slate-400">
                Aylık bazda gerçekleşen satış hacmi
              </p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="select w-36">
              {PERIODS.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="h-72 skeleton rounded-xl" />
          ) : (
            <SalesChart data={salesData} />
          )}
        </div>
        <TopProducts />

      </div>

      {/* Latest Orders Table */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Son Siparişler</h3>
            <p className="text-[11px] text-slate-400">Sisteme giren en son verilmiş siparişler</p>
          </div>
          <Link to="/orders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline">
            Tümünü Gör <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Müşteri</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="py-3">
                      <div className="h-4 skeleton w-full" />
                    </td>
                  </tr>
                ))
              ) : (
                latestOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-bold text-slate-900">{order.id}</td>
                    <td className="font-medium text-slate-800">{order.customer}</td>
                    <td><Badge status={order.status} /></td>
                    <td className="text-slate-500 text-xs">{formatDate(order.orderedAt)}</td>
                    <td className="font-bold text-slate-900">{formatCurrency(order.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
