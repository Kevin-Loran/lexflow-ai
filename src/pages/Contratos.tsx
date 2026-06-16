import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Filter, X, Plus, Trash2 } from 'lucide-react'

function normalizar(valor: string | null | undefined) {
  return (valor || '').toLowerCase().trim()
}

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

export function Contratos() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contratos, setContratos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState({ status: '', prioridade: '', categoria: '', tipo: '' })

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

  const statusOpts = [...new Set(contratos.map(c => c.status).filter(Boolean))]
  const prioridadeOpts = [...new Set(contratos.map(c => c.prioridade_revisao).filter(Boolean))]
  const categorias = [...new Set(contratos.map(c => c.categoria).filter(Boolean))]
  const tipos = [...new Set(contratos.map(c => c.tipo_documento).filter(Boolean))]

  const filtrados = contratos.filter(c => {
    const titulo = normalizar(c.titulo_contrato || c.nome_arquivo)
    if (busca && !titulo.includes(busca.toLowerCase().trim())) return false
    if (filtros.status && normalizar(c.status) !== normalizar(filtros.status)) return false
    if (filtros.prioridade && normalizar(c.prioridade_revisao) !== normalizar(filtros.prioridade)) return false
    if (filtros.categoria && normalizar(c.categoria) !== normalizar(filtros.categoria)) return false
    if (filtros.tipo && normalizar(c.tipo_documento) !== normalizar(filtros.tipo)) return false
    return true
  })

  const temFiltroAtivo = Object.values(filtros).some(Boolean) || busca

  const limparFiltros = () => {
    setFiltros({ status: '', prioridade: '', categoria: '', tipo: '' })
    setBusca('')
  }

  return (
    <div className="p-4 md:p-8 md:pl-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Contratos</h2>
          <p className="text-slate-500 text-sm mt-1">{filtrados.length} de {contratos.length} contrato(s)</p>
        </div>
        <button
          onClick={() => navigate('/contratos/novo')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Contrato
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-5">
        {/* Filter bar */}
        <div className="p-4 flex flex-wrap gap-3 items-center" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 bg-slate-50/50 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="flex-1 text-sm focus:outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium">Filtrar</span>
          </div>

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
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-600 transition-all"
            >
              <option value="">{label}</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Nenhum contrato encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Título', 'Tipo', 'Categoria', 'Remetente', 'Valor', 'Vencimento', 'Status', 'Dias', 'Prioridade', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/contratos/${c.id}`)}
                    className="cursor-pointer transition-colors"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid #f1f5f9' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.04)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td className="px-4 py-3.5 font-medium text-slate-900 max-w-[180px] truncate">{c.titulo_contrato || c.nome_arquivo || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{c.tipo_documento || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500">{c.categoria || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 max-w-[140px] truncate">{c.remetente_email || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{c.valor_total || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{c.data_fim_vigencia_date || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE[c.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {c.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{c.dias_para_vencer ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIO_BADGE[normalizar(c.prioridade_revisao)] ?? 'bg-slate-100 text-slate-500'}`}>
                        {c.prioridade_revisao || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={e => handleDelete(e, c.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
