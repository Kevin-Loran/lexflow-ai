import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, FolderOpen, Filter, X, ChevronRight } from 'lucide-react'

const PRIORIDADE_CORES: Record<string, { badge: string; bar: string }> = {
  'alta':  { badge: 'bg-red-100 text-red-700',    bar: 'bg-red-400' },
  'media': { badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-400' },
  'baixa': { badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-400' },
}

export function Processos() {
  const navigate = useNavigate()
  const [processos, setProcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .order('id', { ascending: false })
      if (error) console.error('Erro ao buscar processos:', error.message)
      setProcessos(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const categorias = [...new Set(processos.map(p => p.categoria).filter(Boolean))]

  const filtrados = processos.filter(p => {
    const texto = [p.titulo_contrato, p.parte_1_nome, p.parte_2_nome, p.categoria]
      .join(' ').toLowerCase()
    if (busca && !texto.includes(busca.toLowerCase().trim())) return false
    if (filtroCategoria && p.categoria !== filtroCategoria) return false
    return true
  })

  const temFiltro = busca || filtroCategoria

  return (
    <div className="p-4 md:p-8 md:pl-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Processos</h2>
        <p className="text-slate-500 text-sm mt-1">{filtrados.length} de {processos.length} processo(s)</p>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por título, parte ou categoria..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="flex-1 text-sm focus:outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            className="text-sm focus:outline-none bg-transparent text-slate-700"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {temFiltro && (
          <button
            onClick={() => { setBusca(''); setFiltroCategoria('') }}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" /> Limpar
          </button>
        )}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Nenhum processo encontrado</p>
          <p className="text-slate-400 text-sm max-w-xs">
            Os processos chegam automaticamente quando contratos são processados pelo fluxo de IA.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map(p => {
            const prio = PRIORIDADE_CORES[p.prioridade_revisao?.toLowerCase()]
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/processos/${p.id}`)}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Barra de prioridade no topo */}
                <div className={`h-1.5 w-full ${prio?.bar ?? 'bg-slate-200'}`} />

                <div className="p-5 flex flex-col gap-3 flex-1">
                  {/* Ícone + título */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <FolderOpen className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                        {p.titulo_contrato || 'Sem título'}
                      </h3>
                      {p.tipo_documento && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{p.tipo_documento}</p>
                      )}
                    </div>
                  </div>

                  {/* Categoria */}
                  {p.categoria && (
                    <span className="self-start text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full truncate max-w-full">
                      {p.categoria}
                    </span>
                  )}

                  {/* Partes */}
                  <div className="space-y-1">
                    {p.parte_1_nome && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                        <span className="text-slate-400 shrink-0">{p.parte_1_papel || 'Parte 1'}:</span>
                        <span className="font-medium truncate">{p.parte_1_nome}</span>
                      </div>
                    )}
                    {p.parte_2_nome && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                        <span className="text-slate-400 shrink-0">{p.parte_2_papel || 'Parte 2'}:</span>
                        <span className="font-medium truncate">{p.parte_2_nome}</span>
                      </div>
                    )}
                  </div>

                  {/* Rodapé: valor + prioridade + seta */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.valor_total != null && (
                        <span className="text-xs font-semibold text-slate-700">
                          R$ {Number(p.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      {p.prioridade_revisao && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prio?.badge ?? 'bg-slate-100 text-slate-500'}`}>
                          {p.prioridade_revisao}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
