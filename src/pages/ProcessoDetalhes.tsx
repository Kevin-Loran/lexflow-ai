import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft, FileText, Users, DollarSign, Shield, Brain, Trash2, AlertTriangle
} from 'lucide-react'

const PRIORIDADE_CORES: Record<string, string> = {
  'alta':  'bg-red-100 text-red-700',
  'media': 'bg-amber-100 text-amber-700',
  'baixa': 'bg-emerald-100 text-emerald-700',
}

function parseLista(v: string | null | undefined): string[] | null {
  if (!v) return null
  try {
    const parsed = JSON.parse(v)
    return Array.isArray(parsed) ? parsed : [String(parsed)]
  } catch {
    return [v]
  }
}

function Campo({ label, value, span2 }: { label: string; value?: string | null; span2?: boolean }) {
  if (!value) return null
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <p className="text-slate-800 text-sm mt-0.5 leading-relaxed">{value}</p>
    </div>
  )
}

function ListaCampo({ label, items, icon: Icon }: { label: string; items: string[] | null; icon?: any }) {
  if (!items || items.length === 0) return null
  return (
    <div className="sm:col-span-2">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-800">
            {Icon
              ? <Icon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              : <span className="text-blue-400 mt-0.5 shrink-0">•</span>
            }
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Secao({ icon: Icon, titulo, children }: { icon: any; titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500" /> {titulo}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

export function ProcessoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [processo, setProcesso] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('processos')
        .select('*')
        .eq('id', id)
        .single()
      setProcesso(data)
      setLoading(false)
    }
    if (id) fetchData()
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Excluir este processo? Esta ação não pode ser desfeita.')) return
    setExcluindo(true)
    const { error } = await supabase.from('processos').delete().eq('id', id)
    if (error) { alert('Erro: ' + error.message); setExcluindo(false); return }
    navigate('/processos')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!processo) return (
    <div className="p-8 text-center text-slate-400">Processo não encontrado.</div>
  )

  const prazos    = parseLista(processo.prazos_importantes)
  const obrigacoes = parseLista(processo.obrigacoes)
  const pontos    = parseLista(processo.pontos_de_atencao)
  const alertas   = parseLista(processo.alertas_recomendados)

  return (
    <div className="p-4 md:p-8 md:pl-10 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {processo.titulo_contrato || 'Sem título'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{processo.tipo_documento || ''}</p>
          {processo.prioridade_revisao && (
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${PRIORIDADE_CORES[processo.prioridade_revisao?.toLowerCase()] || 'bg-slate-100 text-slate-500'}`}>
              Prioridade: {processo.prioridade_revisao}
            </span>
          )}
        </div>

        <button
          onClick={handleDelete}
          disabled={excluindo}
          className="flex items-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50 self-start"
        >
          <Trash2 className="w-4 h-4" />
          {excluindo ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>

      <div className="space-y-5">

        <Secao icon={FileText} titulo="Identificação">
          <Campo label="Tipo de Documento" value={processo.tipo_documento} />
          <Campo label="Categoria" value={processo.categoria} />
          <Campo label="Resumo" value={processo.resumo} span2 />
        </Secao>

        <Secao icon={Users} titulo="Partes Envolvidas">
          <Campo label={processo.parte_1_papel || 'Parte 1'} value={processo.parte_1_nome} />
          <Campo label={processo.parte_2_papel || 'Parte 2'} value={processo.parte_2_nome} />
        </Secao>

        <Secao icon={DollarSign} titulo="Valores e Pagamento">
          <Campo label="Valor Total" value={
            processo.valor_total != null
              ? `R$ ${Number(processo.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : null
          } />
          <Campo label="Valor Mensal" value={processo.valor_mensal} />
          <Campo label="Forma de Pagamento" value={processo.forma_pagamento} span2 />
        </Secao>

        <Secao icon={Shield} titulo="Cláusulas">
          <Campo label="Rescisão" value={processo.clausula_rescisao} span2 />
          <Campo label="Multa" value={processo.clausula_multa} />
          <Campo label="Renovação" value={processo.clausula_renovacao} />
          <Campo label="Confidencialidade" value={processo.clausula_confidencialidade} />
          <Campo label="Foro" value={processo.clausula_foro} />
          <Campo label="LGPD" value={processo.clausula_lgpd} />
        </Secao>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-500" /> Análise da IA
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ListaCampo label="Prazos Importantes" items={prazos} />
            <ListaCampo label="Obrigações" items={obrigacoes} />
            <ListaCampo label="Pontos de Atenção" items={pontos} />
            <ListaCampo label="Alertas Recomendados" items={alertas} icon={AlertTriangle} />
          </div>
        </div>

      </div>
    </div>
  )
}
