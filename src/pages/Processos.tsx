import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, FileText, Filter, X } from 'lucide-react'

const PRIORIDADE_CORES: Record<string, string> = {
  'alta':  'bg-red-100 text-red-700',
  'media': 'bg-amber-100 text-amber-700',
  'baixa': 'bg-emerald-100 text-emerald-700',
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

  return (
    <div className="p-4 md:p-8 md:pl-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Processos</h2>
        <p className="text-slate-500 text-sm mt-1">{filtrados.length} de {processos.length} processo(s)</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-slate-100">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por título, parte ou categoria..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="flex-1 text-sm focus:outline-none bg-transparent"
            />
          </div>

          <Filter className="w-4 h-4 text-slate-400 shrink-0" />

          <select
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Categoria</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {(busca || filtroCategoria) && (
            <button
              onClick={() => { setBusca(''); setFiltroCategoria('') }}
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
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Nenhum processo encontrado</p>
            <p className="text-slate-400 text-sm max-w-xs">
              Os processos chegam automaticamente quando contratos são processados pelo fluxo de IA.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Título', 'Tipo', 'Categoria', 'Parte 1', 'Parte 2', 'Valor Total', 'Prioridade'].map(h => (
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
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                      {p.titulo_contrato || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">
                      {p.tipo_documento || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate">
                      {p.categoria || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">
                      {p.parte_1_nome || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">
                      {p.parte_2_nome || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {p.valor_total != null
                        ? `R$ ${Number(p.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${PRIORIDADE_CORES[p.prioridade_revisao?.toLowerCase()] || 'bg-slate-100 text-slate-500'}`}>
                        {p.prioridade_revisao || '—'}
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
