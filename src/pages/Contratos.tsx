import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Filter, X, Plus, Trash2 } from 'lucide-react'

function formatarData(valor: string | null | undefined) {
  if (!valor) return '—'
  // Supabase retorna datas como "2025-12-31" — parseamos manualmente para evitar Invalid Date
  const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return '—'
  return `${match[3]}/${match[2]}/${match[1]}`
}

function normalizar(valor: string | null | undefined) {
  return (valor || '').toLowerCase().trim()
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
    await supabase.from('contratos').delete().eq('id', contratoId)
    setContratos(prev => prev.filter(c => c.id !== contratoId))
  }

  // Opções dinâmicas geradas a partir dos dados reais
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
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contratos</h2>
          <p className="text-slate-500 text-sm mt-1">{filtrados.length} de {contratos.length} contrato(s)</p>
        </div>
        <button
          onClick={() => navigate('/contratos/novo')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Contrato
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Filter className="w-4 h-4 text-slate-400 shrink-0" />

          {[
            { key: 'status', label: 'Status', options: statusOpts },
            { key: 'prioridade', label: 'Prioridade', options: prioridadeOpts },
            { key: 'categoria', label: 'Categoria', options: categorias },
            { key: 'tipo', label: 'Tipo', options: tipos },
          ].map(({ key, label, options }) => (
            <select
              key={key}
              value={filtros[key as keyof typeof filtros]}
              onChange={e => setFiltros(f => ({ ...f, [key]: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{label}</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Nenhum contrato encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Título', 'Tipo', 'Categoria', 'Remetente', 'Valor', 'Vencimento', 'Status', 'Dias', 'Prioridade', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrados.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/contratos/${c.id}`)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[180px] truncate">{c.titulo_contrato || c.nome_arquivo || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.tipo_documento || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.categoria || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">{c.remetente_email || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.valor_total || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.data_fim_vigencia_date || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        c.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'Vencido' ? 'bg-red-100 text-red-700' :
                        c.status === 'Próximo do vencimento' ? 'bg-amber-100 text-amber-700' :
                        c.status ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400'
                      }`}>{c.status || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.dias_para_vencer ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        normalizar(c.prioridade_revisao) === 'alta' ? 'bg-red-100 text-red-700' :
                        normalizar(c.prioridade_revisao) === 'media' ? 'bg-amber-100 text-amber-700' :
                        normalizar(c.prioridade_revisao) === 'baixa' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-50 text-slate-400'
                      }`}>{c.prioridade_revisao || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => handleDelete(e, c.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
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
