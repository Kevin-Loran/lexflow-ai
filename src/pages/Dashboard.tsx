import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { FileText, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle, ArrowRight } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

// ─── Color tokens ──────────────────────────────────────────────────
const PRIMARY   = '#4F46E5'
const TEXT_1    = '#0F172A'
const TEXT_2    = '#64748B'
const TEXT_3    = '#94a3b8'
const BORDER    = '#E2E8F0'
const CARD_BG   = '#ffffff'

const CHART_PALETTE = ['#4F46E5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

// ─── Badge maps ────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  'Ativo':                 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'Vencido':               'bg-red-50 text-red-700 ring-1 ring-red-200',
  'Próximo do vencimento': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  'Pendente':              'bg-slate-100 text-slate-600',
  'Cancelado':             'bg-slate-100 text-slate-500',
}

const PRIO_BADGE: Record<string, string> = {
  alta:  'bg-red-50 text-red-700 ring-1 ring-red-200',
  media: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  baixa: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
}

// ─── Custom tooltip ─────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-3.5 py-2.5 text-sm">
      {label && <p className="font-medium text-slate-700 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-slate-600">
          <span className="font-semibold" style={{ color: p.fill || p.color }}>{p.value}</span>
          {' '}{p.name}
        </p>
      ))}
    </div>
  )
}

// ─── Metric card ─────────────────────────────────────────────────────
interface CardData {
  label: string
  value: string | number
  desc: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

function MetricCard({ label, value, desc, icon: Icon, iconBg, iconColor }: CardData) {
  return (
    <div
      className="rounded-xl p-5 transition-shadow hover:shadow-md"
      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: TEXT_3 }}
        >
          {label}
        </span>
        <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>
      <p
        className="text-[28px] font-bold tracking-tight leading-none mb-1"
        style={{ color: TEXT_1 }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: TEXT_2 }}>{desc}</p>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────
export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
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

  // ── Metrics (business logic unchanged) ──
  const total          = contratos.length
  const ativos         = contratos.filter(c => c.status === 'Ativo').length
  const vencidos       = contratos.filter(c => c.status === 'Vencido').length
  const vencendo30     = contratos.filter(c => c.status === 'Próximo do vencimento').length
  const valorTotal     = contratos.reduce((acc, c) => acc + (Number(c.valor_total_numero) || 0), 0)
  const prioridadeAlta = contratos.filter(c => (c.prioridade_revisao || '').toLowerCase() === 'alta').length

  const statusData = [
    { name: 'Ativo',    value: ativos },
    { name: 'Vencido',  value: vencidos },
    { name: 'Próximo',  value: vencendo30 },
    { name: 'Sem data', value: contratos.filter(c => c.status === 'Sem data').length },
  ].filter(d => d.value > 0)

  const prioridadeData = ['Alta', 'Media', 'Baixa'].map(p => ({
    name: p,
    value: contratos.filter(c => (c.prioridade_revisao || '').toLowerCase() === p.toLowerCase()).length,
  })).filter(d => d.value > 0)

  const cards: CardData[] = [
    { label: 'Total de Contratos',  value: total,          desc: 'no escritório',      icon: FileText,       iconBg: 'bg-slate-100',    iconColor: 'text-slate-600' },
    { label: 'Contratos Ativos',    value: ativos,          desc: 'em vigor',            icon: CheckCircle,    iconBg: 'bg-emerald-50',   iconColor: 'text-emerald-600' },
    { label: 'Contratos Vencidos',  value: vencidos,        desc: 'prazo expirado',      icon: XCircle,        iconBg: 'bg-red-50',       iconColor: 'text-red-600' },
    { label: 'Vencendo em 30 dias', value: vencendo30,      desc: 'atenção necessária',  icon: Clock,          iconBg: 'bg-amber-50',     iconColor: 'text-amber-600' },
    { label: 'Valor Total',         value: `R$ ${valorTotal.toLocaleString('pt-BR')}`, desc: 'portfólio acumulado', icon: DollarSign, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
    { label: 'Prioridade Alta',     value: prioridadeAlta,  desc: 'requer revisão',      icon: AlertTriangle,  iconBg: 'bg-orange-50',    iconColor: 'text-orange-600' },
  ]

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin" style={{ borderColor: `${PRIMARY} transparent transparent transparent` }} />
      </div>
    )
  }

  return (
    <div className="p-5 md:p-7 space-y-6">

      {/* ── Linha 1: Métricas ── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => <MetricCard key={card.label} {...card} />)}
        </div>
      </section>

      {/* ── Linha 2: Gráficos ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Status */}
        <div
          className="rounded-xl p-6"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: TEXT_1 }}>Contratos por Status</h3>
              <p className="text-xs mt-0.5" style={{ color: TEXT_2 }}>{contratos.length} contratos no total</p>
            </div>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="45%"
                  outerRadius={75}
                  innerRadius={35}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', color: TEXT_2, paddingTop: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[210px] flex flex-col items-center justify-center gap-2" style={{ color: TEXT_3 }}>
              <FileText className="w-8 h-8 opacity-30" />
              <p className="text-sm">Nenhum dado ainda</p>
            </div>
          )}
        </div>

        {/* Prioridade */}
        <div
          className="rounded-xl p-6"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: TEXT_1 }}>Prioridade de Revisão</h3>
              <p className="text-xs mt-0.5" style={{ color: TEXT_2 }}>Distribuição por nível de urgência</p>
            </div>
          </div>
          {prioridadeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={prioridadeData} barSize={40}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: TEXT_2 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: TEXT_2 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="value" name="contratos" fill={PRIMARY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[210px] flex flex-col items-center justify-center gap-2" style={{ color: TEXT_3 }}>
              <AlertTriangle className="w-8 h-8 opacity-30" />
              <p className="text-sm">Nenhum dado ainda</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Linha 3: Contratos Recentes ── */}
      <section
        className="rounded-xl overflow-hidden"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: TEXT_1 }}>Contratos Recentes</h3>
            <p className="text-xs mt-0.5" style={{ color: TEXT_2 }}>Últimos {Math.min(contratos.length, 10)} registros</p>
          </div>
          {contratos.length > 0 && (
            <button
              onClick={() => navigate('/contratos')}
              className="flex items-center gap-1 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg"
              style={{ color: PRIMARY }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(79,70,229,0.06)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              Ver todos
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Table */}
        {contratos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6" style={{ color: TEXT_3 }} />
            </div>
            <p className="text-sm font-medium" style={{ color: TEXT_2 }}>Nenhum contrato cadastrado</p>
            <p className="text-xs" style={{ color: TEXT_3 }}>Contratos chegam automaticamente via n8n ou você pode cadastrar manualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#FAFAFA' }}>
                  {[
                    { label: 'Título',     cls: 'w-[35%]' },
                    { label: 'Tipo',       cls: 'w-[20%]' },
                    { label: 'Status',     cls: 'w-[15%]' },
                    { label: 'Vencimento', cls: 'w-[15%]' },
                    { label: 'Prioridade', cls: 'w-[15%]' },
                  ].map(({ label, cls }) => (
                    <th
                      key={label}
                      className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${cls}`}
                      style={{ color: TEXT_3, borderBottom: `1px solid ${BORDER}` }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contratos.slice(0, 10).map((c, i) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: i < Math.min(contratos.length, 10) - 1 ? `1px solid #f1f5f9` : 'none' }}
                    onClick={() => navigate(`/contratos/${c.id}`)}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium truncate max-w-[260px]" style={{ color: TEXT_1 }}>
                        {c.titulo_contrato || c.nome_arquivo || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs truncate max-w-[160px]" style={{ color: TEXT_2 }}>
                        {c.tipo_documento || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_BADGE[c.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {c.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs whitespace-nowrap" style={{ color: TEXT_2 }}>
                        {c.data_fim_vigencia_date || c.mes_vencimento || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${PRIO_BADGE[(c.prioridade_revisao || '').toLowerCase()] ?? 'bg-slate-100 text-slate-500'}`}>
                        {c.prioridade_revisao || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  )
}
