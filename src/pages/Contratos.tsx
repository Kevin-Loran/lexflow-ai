import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  Search, X, Plus, FileText, CheckCircle, XCircle,
  AlertTriangle, Eye, Pencil, Trash2, MoreHorizontal, Clock,
} from 'lucide-react'

// ─── Tokens ────────────────────────────────────────────────────────
const PRIMARY  = '#4F46E5'
const TEXT_1   = '#0F172A'
const TEXT_2   = '#64748B'
const TEXT_3   = '#94a3b8'
const BORDER   = '#E2E8F0'
const CARD_BG  = '#ffffff'

// ─── Helpers ───────────────────────────────────────────────────────
function normalizar(v: string | null | undefined) {
  return (v || '').toLowerCase().trim()
}

// ─── Badge maps ────────────────────────────────────────────────────
const STATUS_CLS: Record<string, string> = {
  'Ativo':                 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'Vencido':               'bg-red-50 text-red-700 ring-1 ring-red-200',
  'Próximo do vencimento': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  'Pendente':              'bg-slate-100 text-slate-600',
  'Cancelado':             'bg-slate-100 text-slate-500',
  'Sem data':              'bg-slate-100 text-slate-500',
}

const PRIO_CLS: Record<string, string> = {
  alta:  'bg-red-50 text-red-700 ring-1 ring-red-200',
  media: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  baixa: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
}

// ─── Summary card ──────────────────────────────────────────────────
function SummaryCard({
  label, value, desc, icon: Icon, iconBg, iconColor,
}: {
  label: string; value: number | string; desc: string
  icon: React.ElementType; iconBg: string; iconColor: string
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_3 }}>
          {label}
        </span>
        <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight leading-none mb-1" style={{ color: TEXT_1 }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: TEXT_2 }}>{desc}</p>
    </div>
  )
}

// ─── Dias cell ─────────────────────────────────────────────────────
function DiasCell({ dias }: { dias: number | null | undefined }) {
  if (dias == null) return <span style={{ color: TEXT_3 }} className="text-xs">—</span>
  if (dias < 0) return (
    <span className="text-xs font-semibold text-red-600">Vencido</span>
  )
  if (dias <= 30) return (
    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
      <Clock className="w-3 h-3 shrink-0" />
      {dias}d
    </span>
  )
  return <span className="text-xs" style={{ color: TEXT_2 }}>{dias}d</span>
}

// ─── Actions dropdown ──────────────────────────────────────────────
function ActionsMenu({
  onVisualizar,
  onEditar,
  onExcluir,
}: {
  contratoId?: string
  onVisualizar: () => void
  onEditar: () => void
  onExcluir: (e: React.MouseEvent) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
        style={{ color: TEXT_3 }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLElement).style.background = '#f1f5f9'
          ;(e.currentTarget as HTMLElement).style.color = TEXT_2
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = TEXT_3
        }}
        title="Ações"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 z-20 mt-1 w-40 rounded-xl overflow-hidden"
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {[
            { label: 'Visualizar', icon: Eye,     action: () => { setOpen(false); onVisualizar() }, cls: '' },
            { label: 'Editar',     icon: Pencil,  action: () => { setOpen(false); onEditar() },     cls: '' },
            { label: 'Excluir',    icon: Trash2,  action: (e: any) => { setOpen(false); onExcluir(e) }, cls: 'text-red-600' },
          ].map(({ label, icon: Icon, action, cls }) => (
            <button
              key={label}
              onClick={action}
              className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm transition-colors text-left ${cls}`}
              style={cls ? {} : { color: TEXT_1 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────
export function Contratos() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contratos, setContratos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState({ status: '', prioridade: '', categoria: '', tipo: '' })

  // ── Data (unchanged) ──
  async function fetchData() {
    const { data } = await supabase
      .from('contratos_dashboard')
      .select('*')
      .order('created_at', { ascending: false })
    setContratos(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  async function handleDelete(e: React.MouseEvent, contratoId: string) {
    e.stopPropagation()
    if (!window.confirm('Excluir este contrato?')) return
    const { error } = await supabase.from('contratos').delete().eq('id', contratoId)
    if (error) { alert('Erro ao excluir: ' + error.message); return }
    setContratos(prev => prev.filter(c => c.id !== contratoId))
  }

  // ── Filter options (unchanged) ──
  const statusOpts    = [...new Set(contratos.map(c => c.status).filter(Boolean))]
  const prioridadeOpts = [...new Set(contratos.map(c => c.prioridade_revisao).filter(Boolean))]
  const categorias    = [...new Set(contratos.map(c => c.categoria).filter(Boolean))]
  const tipos         = [...new Set(contratos.map(c => c.tipo_documento).filter(Boolean))]

  // ── Filter logic (unchanged) ──
  const filtrados = contratos.filter(c => {
    const titulo = normalizar(c.titulo_contrato || c.nome_arquivo)
    if (busca && !titulo.includes(busca.toLowerCase().trim())) return false
    if (filtros.status    && normalizar(c.status)             !== normalizar(filtros.status))     return false
    if (filtros.prioridade && normalizar(c.prioridade_revisao) !== normalizar(filtros.prioridade)) return false
    if (filtros.categoria  && normalizar(c.categoria)          !== normalizar(filtros.categoria))  return false
    if (filtros.tipo       && normalizar(c.tipo_documento)     !== normalizar(filtros.tipo))       return false
    return true
  })

  const temFiltroAtivo = Object.values(filtros).some(Boolean) || busca
  const limparFiltros  = () => { setFiltros({ status: '', prioridade: '', categoria: '', tipo: '' }); setBusca('') }

  // ── Summary counts ──
  const total      = contratos.length
  const ativos     = contratos.filter(c => c.status === 'Ativo').length
  const vencidos   = contratos.filter(c => c.status === 'Vencido').length
  const prioAlta   = contratos.filter(c => normalizar(c.prioridade_revisao) === 'alta').length

  return (
    <div className="p-5 md:p-7 space-y-5">

      {/* ── Cabeçalho ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: TEXT_1 }}>Contratos</h2>
          <p className="text-sm mt-0.5" style={{ color: TEXT_2 }}>
            Gerencie, acompanhe e monitore todos os seus contratos em um único lugar.
          </p>
        </div>
        <button
          onClick={() => navigate('/contratos/novo')}
          className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm"
          style={{ background: PRIMARY }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#4338CA'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = PRIMARY}
        >
          <Plus className="w-4 h-4" />
          Novo Contrato
        </button>
      </div>

      {/* ── Cards de resumo ── */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="Total"         value={total}    desc="contratos no escritório" icon={FileText}      iconBg="bg-slate-100"   iconColor="text-slate-600" />
          <SummaryCard label="Ativos"        value={ativos}   desc="em vigor"                icon={CheckCircle}   iconBg="bg-emerald-50"  iconColor="text-emerald-600" />
          <SummaryCard label="Vencidos"      value={vencidos} desc="prazo expirado"          icon={XCircle}       iconBg="bg-red-50"      iconColor="text-red-600" />
          <SummaryCard label="Prioridade Alta" value={prioAlta} desc="requer revisão"        icon={AlertTriangle} iconBg="bg-orange-50"   iconColor="text-orange-600" />
        </div>
      )}

      {/* ── Filtros ── */}
      <div
        className="rounded-xl p-4"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Busca */}
          <div
            className="flex items-center gap-2 flex-1 min-w-[200px] rounded-lg px-3.5 py-2.5 transition-all"
            style={{ background: '#F8FAFC', border: `1px solid ${BORDER}` }}
            onFocus={() => {}}
          >
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: TEXT_3 }} />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="flex-1 text-sm focus:outline-none bg-transparent"
              style={{ color: TEXT_1 }}
              onFocus={e => (e.currentTarget.parentElement!.style.borderColor = PRIMARY)}
              onBlur={e => (e.currentTarget.parentElement!.style.borderColor = BORDER)}
            />
            {busca && (
              <button onClick={() => setBusca('')}>
                <X className="w-3.5 h-3.5" style={{ color: TEXT_3 }} />
              </button>
            )}
          </div>

          {/* Separador */}
          <div className="w-px h-6 shrink-0" style={{ background: BORDER }} />

          {/* Selects */}
          {[
            { key: 'status',     label: 'Status',     options: statusOpts },
            { key: 'prioridade', label: 'Prioridade', options: prioridadeOpts },
            { key: 'categoria',  label: 'Categoria',  options: categorias },
            { key: 'tipo',       label: 'Tipo',       options: tipos },
          ].map(({ key, label, options }) => (
            <select
              key={key}
              value={filtros[key as keyof typeof filtros]}
              onChange={e => setFiltros(f => ({ ...f, [key]: e.target.value }))}
              className="rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-all"
              style={{
                background: filtros[key as keyof typeof filtros] ? 'rgba(79,70,229,0.06)' : '#F8FAFC',
                border: `1px solid ${filtros[key as keyof typeof filtros] ? '#c7d2fe' : BORDER}`,
                color: filtros[key as keyof typeof filtros] ? PRIMARY : TEXT_2,
                fontWeight: filtros[key as keyof typeof filtros] ? '500' : '400',
              }}
            >
              <option value="">{label}</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          {/* Limpar */}
          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-2.5 transition-colors"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)'}
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}
        </div>

        {temFiltroAtivo && (
          <p className="text-xs mt-2.5" style={{ color: TEXT_3 }}>
            {filtrados.length} de {contratos.length} contrato(s) exibido(s)
          </p>
        )}
      </div>

      {/* ── Tabela ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 rounded-full animate-spin border-[3px] border-t-transparent"
              style={{ borderColor: `${PRIMARY} transparent transparent transparent` }}
            />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: '#F8FAFC', border: `1px solid ${BORDER}` }}
            >
              <FileText className="w-5 h-5" style={{ color: TEXT_3 }} />
            </div>
            <p className="text-sm font-medium" style={{ color: TEXT_2 }}>
              {temFiltroAtivo ? 'Nenhum contrato encontrado com esses filtros.' : 'Nenhum contrato cadastrado ainda.'}
            </p>
            {temFiltroAtivo && (
              <button
                onClick={limparFiltros}
                className="text-xs font-medium transition-colors"
                style={{ color: PRIMARY }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: `1px solid ${BORDER}` }}>
                  {[
                    { label: 'Contrato',   w: 'min-w-[240px]' },
                    { label: 'Categoria',  w: 'min-w-[110px]' },
                    { label: 'Remetente',  w: 'min-w-[140px]' },
                    { label: 'Valor',      w: 'min-w-[100px]' },
                    { label: 'Vencimento', w: 'min-w-[100px]' },
                    { label: 'Status',     w: 'min-w-[130px]' },
                    { label: 'Dias',       w: 'min-w-[60px]'  },
                    { label: 'Prioridade', w: 'min-w-[90px]'  },
                    { label: '',           w: 'w-10'          },
                  ].map(({ label, w }) => (
                    <th
                      key={label}
                      className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${w}`}
                      style={{ color: TEXT_3 }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/contratos/${c.id}`)}
                    className="cursor-pointer transition-colors group"
                    style={{ borderTop: i === 0 ? 'none' : `1px solid #f1f5f9` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(79,70,229,0.025)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    {/* Contrato: título + tipo */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold truncate max-w-[240px]" style={{ color: TEXT_1 }}>
                        {c.titulo_contrato || c.nome_arquivo || '—'}
                      </p>
                      {c.tipo_documento && (
                        <p className="text-xs mt-0.5 truncate max-w-[240px]" style={{ color: TEXT_3 }}>
                          {c.tipo_documento}
                        </p>
                      )}
                    </td>

                    {/* Categoria */}
                    <td className="px-5 py-4">
                      <p className="text-xs truncate max-w-[110px]" style={{ color: TEXT_2 }}>
                        {c.categoria || '—'}
                      </p>
                    </td>

                    {/* Remetente */}
                    <td className="px-5 py-4">
                      <p className="text-xs truncate max-w-[140px]" style={{ color: TEXT_2 }}>
                        {c.remetente_email || '—'}
                      </p>
                    </td>

                    {/* Valor */}
                    <td className="px-5 py-4">
                      <p className="text-xs font-medium whitespace-nowrap" style={{ color: TEXT_1 }}>
                        {c.valor_total || '—'}
                      </p>
                    </td>

                    {/* Vencimento */}
                    <td className="px-5 py-4">
                      <p className="text-xs whitespace-nowrap" style={{ color: TEXT_2 }}>
                        {c.data_fim_vigencia_date || '—'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${STATUS_CLS[c.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {c.status || 'N/A'}
                      </span>
                    </td>

                    {/* Dias */}
                    <td className="px-5 py-4">
                      <DiasCell dias={c.dias_para_vencer} />
                    </td>

                    {/* Prioridade */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${PRIO_CLS[normalizar(c.prioridade_revisao)] ?? 'bg-slate-100 text-slate-500'}`}>
                        {c.prioridade_revisao || 'N/A'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-3 py-4">
                      <ActionsMenu
                        contratoId={c.id}
                        onVisualizar={() => navigate(`/contratos/${c.id}`)}
                        onEditar={() => navigate(`/contratos/${c.id}/editar`)}
                        onExcluir={e => handleDelete(e, c.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer da tabela */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop: `1px solid ${BORDER}`, background: '#FAFAFA' }}
            >
              <p className="text-xs" style={{ color: TEXT_3 }}>
                {filtrados.length} contrato{filtrados.length !== 1 ? 's' : ''} exibido{filtrados.length !== 1 ? 's' : ''}
                {filtrados.length !== contratos.length && ` (de ${contratos.length} total)`}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
