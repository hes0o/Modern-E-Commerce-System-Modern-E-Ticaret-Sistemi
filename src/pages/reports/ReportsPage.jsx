import { useState } from 'react'
import SalesChart from '@/components/charts/SalesChart'
import DonutChart from '@/components/charts/DonutChart'
import { Download, Calendar, ChevronDown } from 'lucide-react'
import api from '@/services/api'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30days')
  const [open, setOpen] = useState(false)

  const dateOptions = [
    { value: "7days", label: "Son 7 Gün" },
    { value: "30days", label: "Son 30 Gün" },
    { value: "90days", label: "Son 90 Gün" },
    { value: "1year", label: "Bu Yıl" }
  ]

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
          <h1 className="page-title">
            Raporlar & Analizler
          </h1>

          <p className="page-subtitle">
            Finansal performans ve satış analizi raporları.
          </p>
        </div>


        <div className="flex items-center gap-3">

          {/* Date Dropdown */}
          <div className="relative">

            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:shadow-md transition"
            >

              <Calendar
                size={14}
                className="text-slate-400"
              />

              {
                dateOptions.find(
                  item => item.value === dateRange
                )?.label
              }

              <ChevronDown
                size={14}
                className={`transition ${open ? "rotate-180" : ""
                  }`}
              />

            </button>


            {open && (

              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">

                {
                  dateOptions.map((item) => (

                    <button
                      key={item.value}

                      onClick={() => {
                        setDateRange(item.value)
                        setOpen(false)
                      }}

                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                    >
                      {item.label}
                    </button>

                  ))
                }

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



      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


        <div className="card p-6 lg:col-span-2 space-y-4">

          <h3 className="text-base font-bold text-slate-800">
            Gelir Performansı
          </h3>

          <SalesChart />

        </div>



        <div className="card p-6 space-y-4">

          <h3 className="text-base font-bold text-slate-800">
            Kategorilere Göre Satış
          </h3>

          <DonutChart />

        </div>


      </div>


    </div>
  )
}