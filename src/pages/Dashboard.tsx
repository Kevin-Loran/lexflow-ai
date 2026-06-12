import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { FileText, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function Dashboard() {
  const { user } = useAuth()
  const [contratos, setContratos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('contratos_dashboard')
        .select('*')
        .order('created_at', { ascending: false })
      setContratos(data || [])
      setLoading(false)
    }
    if (user) fetchData()
  }, [user])

  const total = contratos.length
  // A view retorna o campo 'status' calculado (não status_manual)
  const ativos = contratos.filter(c => c.status === 'Ativo').length
  const vencidos = contratos.filter(c => c.status === 'Vencido').length
  const vencendo30 = contratos.filter(c => c.status === 'Próximo do vencimento').length
  const valorTotal = contratos.reduce((acc, c) => acc + (Number(c.valor_total_numero) || 0), 0)
  const prioridadeAlta = contratos.filter(c =>
    (c.prioridade_revisao || '').toLowerCase() === 'alta'
  ).length

  const statusData = [
    { name: 'Ativo', value: ativos },
    { name: 'Vencido', value: vencidos },
    { name: 'Próximo', value: vencendo30 },
    { name: 'Sem data', value: contratos.filter(c => c.status === 'Sem data').length },
  ].filter(d => d.value > 0)

  const prioridadeData = ['Alta', 'Media', 'Baixa'].map(p => ({
    name: p,
    value: contratos.filter(c => (c.prioridade_revisao || '').toLowerCase() === p.toLowerCase()).length,
  })).filter(d => d.value > 0)

  const cards = [
    { label: 'Total de Contratos', value: total, icon: FileText, color: 'bg-blue-500' },
    { label: 'Contratos Ativos', value: ativos, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Contratos Vencidos', value: vencidos, icon: XCircle, color: 'bg-red-500' },
    { label: 'Vencendo em 30 dias', value: vencendo30, icon: Clock, color: 'bg-amber-500' },
    { label: 'Valor Total', value: `R$ ${valorTotal.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'bg-violet-500' },
    { label: 'Prioridade Alta', value: prioridadeAlta, icon: AlertTriangle, color: 'bg-orange-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Visão geral dos seus contratos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{label}</span>
              <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Contratos por Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">Nenhum dado ainda</div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Prioridade de Revisão</h3>
          {prioridadeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={prioridadeData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">Nenhum dado ainda</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Contratos Recentes</h3>
        </div>
        {contratos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Nenhum contrato cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Título', 'Tipo', 'Status', 'Vencimento', 'Prioridade'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {contratos.slice(0, 10).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-[200px]">{c.titulo_contrato || c.nome_arquivo || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{c.tipo_documento || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'Vencido' ? 'bg-red-100 text-red-700' :
                        c.status === 'Próximo do vencimento' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {c.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{c.data_fim_vigencia_date || c.mes_vencimento || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.prioridade_revisao === 'alta' ? 'bg-red-100 text-red-700' :
                        c.prioridade_revisao === 'media' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {c.prioridade_revisao || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
