import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, ExternalLink, Calendar, DollarSign, Users, FileText, AlertTriangle, CheckSquare, Pencil, Trash2 } from 'lucide-react'

function formatarData(v: any): string | null {
  if (!v) return null
  const s = String(v)
  // BR format DD/MM/YYYY — já pronto para exibir
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) return s.slice(0, 10)
  // ISO YYYY-MM-DD
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  // Outro formato: tenta parse genérico
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR')
  return s
}

function formatarValor(v: any): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) return v.map(formatarValor).join(', ')
  if (typeof v === 'object') {
    return Object.entries(v)
      .map(([k, val]) => `${k}: ${formatarValor(val)}`)
      .join(' | ')
  }
  return String(v)
}

function Campo({ label, value }: { label: string; value?: any }) {
  if (value == null || value === '') return null
  const texto = formatarValor(value)
  if (!texto) return null
  return (
    <div>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <p className="text-slate-800 text-sm mt-0.5">{texto}</p>
    </div>
  )
}

function ListaCampo({ label, value }: { label: string; value?: any }) {
  if (!value) return null
  const items: any[] = Array.isArray(value)
    ? value
    : typeof value === 'string'
    ? [value]
    : Object.entries(value).map(([k, v]) => `${k}: ${formatarValor(v)}`)
  if (items.length === 0) return null
  return (
    <div>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <ul className="mt-1 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-800 flex gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            {formatarValor(item)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ContratoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contrato, setContrato] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('contratos_dashboard')
        .select('*')
        .eq('id', id)
        .single()
      setContrato(data)
      setLoading(false)
    }
    if (id) fetchData()
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.')) return
    setExcluindo(true)
    const { error } = await supabase.from('contratos').delete().eq('id', id)
    if (error) { alert('Erro ao excluir: ' + error.message); setExcluindo(false); return }
    navigate('/contratos')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!contrato) {
    return (
      <div className="p-8 text-center text-slate-400">Contrato não encontrado.</div>
    )
  }

  return (
    <div className="p-4 md:p-8 md:pl-10 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {contrato.titulo_contrato || contrato.nome_arquivo || 'Contrato'}
          </h2>
          <div className="flex gap-2 mt-2 flex-wrap">
            {contrato.status_manual && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                contrato.status_manual === 'ativo'     ? 'bg-emerald-100 text-emerald-700' :
                contrato.status_manual === 'vencido'   ? 'bg-red-100 text-red-700' :
                contrato.status_manual === 'pendente'  ? 'bg-amber-100 text-amber-700' :
                contrato.status_manual === 'cancelado' ? 'bg-slate-200 text-slate-600' :
                'bg-slate-100 text-slate-600'
              }`}>{contrato.status_manual}</span>
            )}
            {contrato.prioridade_revisao && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                contrato.prioridade_revisao === 'alta'  ? 'bg-red-100 text-red-700' :
                contrato.prioridade_revisao === 'media' ? 'bg-amber-100 text-amber-700' :
                contrato.prioridade_revisao === 'baixa' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-600'
              }`}>Prioridade {contrato.prioridade_revisao}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {contrato.arquivo_url && (
            <a
              href={contrato.arquivo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir PDF
            </a>
          )}
          <button
            onClick={() => navigate(`/contratos/${id}/editar`)}
            className="flex items-center gap-2 border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={excluindo}
            className="flex items-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {excluindo ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {contrato.resumo && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Resumo
            </h3>
            <p className="text-blue-800 text-sm leading-relaxed">{contrato.resumo}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Informações Gerais
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Tipo de Documento" value={contrato.tipo_documento} />
            <Campo label="Categoria" value={contrato.categoria} />
            <Campo label="Origem" value={contrato.origem_documento} />
            <Campo label="Remetente" value={contrato.remetente_email} />
            <Campo label="Dias para Vencer" value={contrato.dias_para_vencer != null ? String(contrato.dias_para_vencer) : null} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Datas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Data de Assinatura" value={formatarData(contrato.data_assinatura)} />
            <Campo label="Início de Vigência" value={formatarData(contrato.data_inicio_vigencia)} />
            <Campo label="Fim de Vigência" value={formatarData(contrato.data_fim_vigencia)} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Valores
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Valor Total" value={contrato.valor_total} />
            <Campo label="Valor Mensal" value={contrato.valor_mensal} />
            <Campo label="Forma de Pagamento" value={contrato.forma_pagamento} />
          </div>
        </div>

        {contrato.partes_envolvidas && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Partes Envolvidas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {typeof contrato.partes_envolvidas === 'object' && !Array.isArray(contrato.partes_envolvidas) ? (
                Object.entries(contrato.partes_envolvidas).map(([k, v]) => (
                  <Campo key={k} label={k} value={v} />
                ))
              ) : (
                <p className="text-sm text-slate-800">{formatarValor(contrato.partes_envolvidas)}</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> Obrigações e Cláusulas
          </h3>
          <Campo label="Obrigações" value={contrato.obrigacoes} />
          <ListaCampo label="Cláusulas Relevantes" value={contrato.clausulas_relevantes} />
          <ListaCampo label="Prazos Importantes" value={contrato.prazos_importantes} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Atenção e Alertas
          </h3>
          <ListaCampo label="Pontos de Atenção" value={contrato.pontos_de_atencao} />
          <ListaCampo label="Alertas Recomendados" value={contrato.alertas_recomendados} />
        </div>
      </div>
    </div>
  )
}
