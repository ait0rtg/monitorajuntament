import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { format, subDays, startOfMonth, startOfDay, addDays } from 'date-fns'
import { ca } from 'date-fns/locale'

const COLORS = {
  urbanisme: '#3b82f6',
  contractacio: '#f97316',
  personal: '#a855f7',
  serveis: '#22c55e',
  pressupost: '#ef4444',
  altres: '#6b7280'
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Promise.all for dashboard metrics
    const [
      { count: totalDocs },
      { count: urgentsSetmana },
      { data: venciments },
      { data: importsMes },
      { data: temesData },
      { data: proveidors },
      { data: heatmap },
      { data: tramits },
      { data: compromisos }
    ] = await Promise.all([
      supabase.from('monitoratge').select('*', { count: 'exact', head: true }),
      supabase.from('monitoratge').select('*', { count: 'exact', head: true })
        .eq('classificacio', 'URGENT')
        .gte('data_deteccio', startOfDay(subDays(new Date(), 7)).toISOString()),
      
      // 1. Venciments pròxims
      supabase.from('monitoratge').select('id, titol, venciment, url_original')
        .not('venciment', 'is', null)
        .gte('venciment', startOfDay(new Date()).toISOString())
        .lte('venciment', addDays(new Date(), 30).toISOString())
        .order('venciment', { ascending: true }),

      // 2. Evolució imports
      supabase.rpc('get_imports_per_mes'), // Requires a custom SQL RPC, simplified client side here for demonstration, but actually let's implement via raw data
      
      // 3. Distribucio per Tema
      supabase.from('monitoratge').select('tema_principal'),
      
      // 4. Ranking
      supabase.from('monitoratge').select('titol, import_detectat')
        .eq('font', 'Perfil Contractant')
        .not('import_detectat', 'is', null),
        
      // 5. Heatmap (Simplificat per bar chart agrupada per dies aquí)
      supabase.from('monitoratge').select('data_deteccio, classificacio')
        .gte('data_deteccio', subDays(new Date(), 30).toISOString()),
        
      // 6. Tipus tràmit
      supabase.from('monitoratge').select('tipus_tramit').not('tipus_tramit', 'is', null),
      
      // 7. Compromisos
      supabase.from('monitoratge').select('*')
        .eq('estat_seguiment', 'pendent')
        .lte('data_deteccio', subDays(new Date(), 90).toISOString())
        .order('data_deteccio', { ascending: true })
    ])

    // Process 3. Themes
    const themeCounts = temesData?.reduce((acc:any, curr) => {
      const t = curr.tema_principal || 'altres'
      acc[t] = (acc[t] || 0) + 1
      return acc
    }, {})
    const pieData = Object.keys(themeCounts || {}).map(k => ({ name: k, value: themeCounts[k] }))

    // Process 6. Classes
    const classCounts = tramits?.reduce((acc:any, curr) => {
      const t = curr.tipus_tramit
      acc[t] = (acc[t] || 0) + 1
      return acc
    }, {})
    const classData = Object.keys(classCounts || {}).map(k => ({ name: k, total: classCounts[k] })).sort((a,b)=>b.total-a.total)

    setStats({
      totalDocs: totalDocs || 0,
      urgentsSetmana: urgentsSetmana || 0,
      venciments: venciments || [],
      pieData,
      classData,
      compromisos: compromisos || []
    })
    setLoading(false)
  }

  if (loading) return <div className="animate-pulse text-gray-400">Carregant estadístiques...</div>

  return (
    <div className="space-y-6">
      
      {/* Header KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card border-l-4 border-l-blue-500">
          <h3 className="text-gray-400 text-sm">Total Documents</h3>
          <p className="text-3xl font-bold mt-1">{stats?.totalDocs}</p>
        </div>
        <div className="card border-l-4 border-l-red-500">
          <h3 className="text-gray-400 text-sm">Urgents (7 dies)</h3>
          <p className="text-3xl font-bold mt-1 text-red-500">{stats?.urgentsSetmana}</p>
        </div>
        <div className="card border-l-4 border-l-orange-500">
          <h3 className="text-gray-400 text-sm">Venciments (30 dies)</h3>
          <p className="text-3xl font-bold mt-1">{stats?.venciments?.length}</p>
        </div>
        <div className="card border-l-4 border-l-purple-500">
          <h3 className="text-gray-400 text-sm">Pendents {'>'} 90 dies</h3>
          <p className="text-3xl font-bold mt-1">{stats?.compromisos?.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. Donut Themes */}
        <div className="card h-80">
          <h3 className="text-lg font-semibold mb-4">Distribució per Tema</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={stats?.pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {stats?.pieData.map((entry:any, index:number) => (
                  <Cell key={\`cell-\${index}\`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.altres} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#161924', border: '1px solid #374151' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 6. Treemap / Bar classes */}
        <div className="card h-80">
          <h3 className="text-lg font-semibold mb-4">Classificació de Tràmits</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.classData} layout="vertical" margin={{ left: 50 }}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#161924', border: '1px solid #374151' }} />
              <Bar dataKey="total" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 1. Venciments Timeline */}
        <div className="card lg:col-span-2 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Pròxims Venciments</h3>
          <div className="flex gap-4 min-w-max pb-2">
            {stats?.venciments?.map((v:any) => {
              const days = Math.ceil((new Date(v.venciment).getTime() - new Date().getTime()) / 86400000)
              let color = 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
              if (days < 7) color = 'bg-red-500/20 border-red-500/50 text-red-400'
              else if (days < 15) color = 'bg-orange-500/20 border-orange-500/50 text-orange-400'
              
              return (
                <a key={v.id} href={v.url_original} target="_blank" className={\`border rounded-lg p-3 w-64 \${color} hover:bg-opacity-30 transition\`}>
                  <div className="font-bold text-lg mb-1">{format(new Date(v.venciment), 'dd MMM', { locale: ca })}</div>
                  <div className="text-sm line-clamp-2">{v.titol}</div>
                  <div className="text-xs mt-2 opacity-80">En {days} dies</div>
                </a>
              )
            })}
            {stats?.venciments?.length === 0 && <div className="text-gray-500">Cap venciment en els propers 30 dies.</div>}
          </div>
        </div>

        {/* 7. Compromisos Pendents */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">⚠️ Compromisos encallats ({'>'} 90 dies)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Títol</th>
                  <th className="px-4 py-3">Classificació</th>
                  <th className="px-4 py-3">Estat</th>
                </tr>
              </thead>
              <tbody>
                {stats?.compromisos?.map((c:any) => (
                  <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3">{format(new Date(c.data_deteccio), 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3 font-medium">{c.titol}</td>
                    <td className="px-4 py-3">
                      <span className={\`px-2 py-1 rounded text-xs \${c.classificacio === 'URGENT' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800'}\`}>
                        {c.classificacio}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-yellow-500">{c.estat_seguiment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
