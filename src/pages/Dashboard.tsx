import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { FileText, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from 'recharts'

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const STATUS_BADGE: Record<string, string> = {
  'Ativo':                 'bg-emerald-100 text-emerald-700',
  'Vencido':               'bg-red-100 text-red-700',
  'Próximo do vencimento': 'bg-amber-100 text-amber-700',
}

const PRIO_BADGE: Record<string, string> = {
  alta:  'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baixa: 'bg-indigo-100 text-indigo-700',
}

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
    { label: 'Total de Contratos',  value: total,          icon: FileText,       accent: '#6366f1', iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600' },
    { label: 'Contratos Ativos',    value: ativos,          icon: CheckCircle,    accent: '#10b981', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Contratos Vencidos',  value: vencidos,        icon: XCircle,        accent: '#ef4444', iconBg: 'bg-red-50',     iconColor: 'text-red-600' },
    { label: 'Vencendo em 30 dias', value: vencendo30,      icon: Clock,          accent: '#f59e0b', iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
    { label: 'Valor Total',         value: `R$ ${valorTotal.toLocaleString('pt-BR')}`, icon: DollarSign, accent: '#8b5cf6', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
    { label: 'Prioridade Alta',     value: prioridadeAlta,  icon: AlertTriangle,  accent: '#f97316', iconBg: 'bg-orange-50',  iconColor: 'text-orange-600' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 md:pl-10">
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Visão geral dos seus contratos</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
        {cards.map(({ label, value, icon: Icon, accent, iconBg, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
            style={{ borderLeft: `3px solid ${accent}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{label}</span>
              <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Contratos por Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%" outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">Nenhum dado ainda</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Prioridade de Revisão</h3>
          {prioridadeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={prioridadeData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">Nenhum dado ainda</div>
          )}
        </div>
      </div>

      {/* Recent contracts table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h3 className="font-semibold text-slate-800 text-sm">Contratos Recentes</h3>
        </div>
        {contratos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Nenhum contrato cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Título', 'Tipo', 'Status', 'Vencimento', 'Prioridade'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contratos.slice(0, 10).map((c, i) => (
                  <tr
                    key={c.id}
                    className="transition-colors"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid #f1f5f9' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f5f3ff30'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td className="px-6 py-3.5 font-medium text-slate-900 truncate max-w-[200px]">{c.titulo_contrato || c.nome_arquivo || '—'}</td>
                    <td className="px-6 py-3.5 text-slate-500">{c.tipo_documento || '—'}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[c.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {c.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{c.data_fim_vigencia_date || c.mes_vencimento || '—'}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIO_BADGE[(c.prioridade_revisao || '').toLowerCase()] ?? 'bg-slate-100 text-slate-500'}`}>
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
