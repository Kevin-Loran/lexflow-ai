import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Briefcase, ExternalLink, Filter, X } from 'lucide-react'

const STATUS_CORES: Record<string, string> = {
  'Em análise':    'bg-amber-100 text-amber-700',
  'Em andamento':  'bg-blue-100 text-blue-700',
  'Concluído':     'bg-emerald-100 text-emerald-700',
  'Arquivado':     'bg-slate-100 text-slate-500',
}

function normalizar(v: string | null | undefined) {
  return (v || '').toLowerCase().trim()
}

export function Processos() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [processos, setProcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      const { data } = await supabase
        .from('processos')
        .select('*')
        .order('created_at', { ascending: false })
      setProcessos(data || [])
      setLoading(false)
    }
    fetchData()
  }, [user])

  const statusOpts = [...new Set(processos.map(p => p.status).filter(Boolean))]

  const filtrados = processos.filter(p => {
    const texto = normalizar(p.nome_cliente) + normalizar(p.nome_empresa)
    if (busca && !texto.includes(busca.toLowerCase().trim())) return false
    if (filtroStatus && p.status !== filtroStatus) return false
    return true
  })

  const temFiltro = busca || filtroStatus

  return (
    <div className="p-4 md:p-8 md:pl-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Processos Trabalhistas</h2>
          <p className="text-slate-500 text-sm mt-1">{filtrados.length} de {processos.length} processo(s)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-slate-100">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por cliente ou empresa..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="flex-1 text-sm focus:outline-none bg-transparent"
            />
          </div>

          <Filter className="w-4 h-4 text-slate-400 shrink-0" />

          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Status</option>
            {statusOpts.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {temFiltro && (
            <button
              onClick={() => { setBusca(''); setFiltroStatus('') }}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" /> Limpar
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-16 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Nenhum processo encontrado</p>
            <p className="text-slate-400 text-sm max-w-xs">
              Os processos chegam automaticamente quando um cliente envia um email solicitando abertura de caso.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Cliente', 'Empresa', 'Cargo', 'Admissão', 'Demissão', 'Salário', 'Status', 'Drive', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrados.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/processos/${p.id}`)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[160px] truncate">
                      {p.nome_cliente || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">
                      {p.nome_empresa || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate">
                      {p.cargo_registro || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {p.data_admissao ? p.data_admissao.split('-').reverse().join('/') : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {p.data_demissao ? p.data_demissao.split('-').reverse().join('/') : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {p.ultimo_salario_bruto
                        ? `R$ ${Number(p.ultimo_salario_bruto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_CORES[p.status] || 'bg-slate-100 text-slate-500'}`}>
                        {p.status || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.pasta_drive_url ? (
                        <a
                          href={p.pasta_drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Drive
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
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
