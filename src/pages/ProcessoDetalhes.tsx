import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft, ExternalLink, User, Building2, DollarSign,
  Clock, Shield, FileCheck, Trash2, Pencil
} from 'lucide-react'

const STATUS_CORES: Record<string, string> = {
  'Em análise':   'bg-amber-100 text-amber-700',
  'Em andamento': 'bg-blue-100 text-blue-700',
  'Concluído':    'bg-emerald-100 text-emerald-700',
  'Arquivado':    'bg-slate-100 text-slate-500',
}

const STATUS_OPTS = ['Em análise', 'Em andamento', 'Concluído', 'Arquivado']

function Campo({ label, value }: { label: string; value?: any }) {
  if (value == null || value === '' || value === false) return null
  const texto = typeof value === 'boolean' ? (value ? 'Sim' : 'Não')
    : typeof value === 'object' ? JSON.stringify(value)
    : String(value)
  if (!texto) return null
  return (
    <div>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <p className="text-slate-800 text-sm mt-0.5 leading-relaxed">{texto}</p>
    </div>
  )
}

function CampoBool({ label, value }: { label: string; value?: boolean | null }) {
  if (value == null) return null
  return (
    <div>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <p className={`text-sm mt-0.5 font-medium ${value ? 'text-emerald-600' : 'text-red-500'}`}>
        {value ? 'Sim' : 'Não'}
      </p>
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
  const [editandoStatus, setEditandoStatus] = useState(false)
  const [novoStatus, setNovoStatus] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('processos')
        .select('*')
        .eq('id', id)
        .single()
      setProcesso(data)
      setNovoStatus(data?.status || 'Em análise')
      setLoading(false)
    }
    if (id) fetchData()
  }, [id])

  async function handleStatusSave() {
    await supabase.from('processos').update({ status: novoStatus }).eq('id', id)
    setProcesso((p: any) => ({ ...p, status: novoStatus }))
    setEditandoStatus(false)
  }

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

  const end = processo.endereco || {}
  const dc = processo.dados_contratuais || {}
  const rb = processo.remuneracao_beneficios || {}
  const jt = processo.jornada_trabalho || {}
  const as = processo.ambiente_saude || {}
  const pt = processo.provas_testemunhas || {}
  const testemunhas: any[] = pt.testemunhas || []

  return (
    <div className="p-4 md:p-8 md:pl-10 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {processo.nome_cliente || 'Cliente sem nome'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{processo.nome_empresa || ''}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {editandoStatus ? (
              <div className="flex items-center gap-2">
                <select
                  value={novoStatus}
                  onChange={e => setNovoStatus(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={handleStatusSave} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Salvar</button>
                <button onClick={() => setEditandoStatus(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancelar</button>
              </div>
            ) : (
              <button onClick={() => setEditandoStatus(true)} className="flex items-center gap-1.5 group">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CORES[processo.status] || 'bg-slate-100 text-slate-500'}`}>
                  {processo.status}
                </span>
                <Pencil className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {processo.pasta_drive_url && (
            <a
              href={processo.pasta_drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Pasta no Drive
            </a>
          )}
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

      <div className="space-y-5">

        {/* Dados Pessoais */}
        <Secao icon={User} titulo="Dados Pessoais">
          <Campo label="Nome" value={processo.nome_cliente} />
          <Campo label="CPF" value={processo.cpf} />
          <Campo label="RG" value={processo.rg} />
          <Campo label="Endereço" value={
            end.logradouro
              ? `${end.logradouro}, ${end.numero}${end.complemento ? ` - ${end.complemento}` : ''}, ${end.bairro}, ${end.cidade}/${end.estado} - ${end.cep}`
              : null
          } />
        </Secao>

        {/* Dados Contratuais */}
        <Secao icon={Building2} titulo="Dados Contratuais">
          <Campo label="Empresa" value={processo.nome_empresa} />
          <Campo label="Cargo no Registro" value={processo.cargo_registro} />
          <Campo label="Função Real" value={processo.funcao_real} />
          <Campo label="Motivo do Desligamento" value={processo.motivo_desligamento} />
          <Campo label="Data de Admissão" value={processo.data_admissao ? new Date(processo.data_admissao).toLocaleDateString('pt-BR') : null} />
          <Campo label="Data de Demissão" value={processo.data_demissao ? new Date(processo.data_demissao).toLocaleDateString('pt-BR') : null} />
          <Campo label="Aviso Prévio" value={dc.avisoPrevio?.tipo} />
          <CampoBool label="Aviso Prévio Cumprido" value={dc.avisoPrevio?.cumprido} />
          <CampoBool label="Desvio ou Acúmulo de Função" value={dc.desvioOuAcumuloFuncao} />
        </Secao>

        {/* Remuneração */}
        <Secao icon={DollarSign} titulo="Remuneração e Benefícios">
          <Campo label="Último Salário Bruto" value={
            processo.ultimo_salario_bruto
              ? `R$ ${Number(processo.ultimo_salario_bruto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : null
          } />
          <Campo label="Valor Por Fora (mensal)" value={
            rb.valorPorForaMensal
              ? `R$ ${Number(rb.valorPorForaMensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : null
          } />
          <CampoBool label="Recebia Comissão ou Bônus" value={rb.recebiaComissaoOuBonus} />
          <div className="sm:col-span-2">
            <Campo label="Detalhes da Remuneração" value={rb.detalhesRemuneracao} />
          </div>
        </Secao>

        {/* Jornada */}
        <Secao icon={Clock} titulo="Jornada de Trabalho">
          <Campo label="Horário Contratual" value={jt.horarioContratual} />
          <Campo label="Tipo de Controle de Ponto" value={jt.tipoControlePonto} />
          <Campo label="Frequência de Horas Extras" value={jt.frequenciaHorasExtras} />
          <Campo label="Média de Horas Extras Semanais" value={jt.mediaHorasExtrasSemanais != null ? `${jt.mediaHorasExtrasSemanais}h` : null} />
          <CampoBool label="Possui Controle de Ponto" value={jt.possuiControlePonto} />
          <CampoBool label="Ponto Era Espelho Fiel" value={jt.pontoEraEspelhoFiel} />
          <CampoBool label="Intervalo de Almoço Garantido" value={jt.intervaloAlmocoGarantido} />
          <CampoBool label="Trabalho Noturno" value={jt.trabalhoNoturno} />
        </Secao>

        {/* Ambiente e Saúde */}
        <Secao icon={Shield} titulo="Ambiente, Saúde e Segurança">
          <Campo label="Agente de Risco" value={as.especificacaoAgenteRisco} />
          <CampoBool label="Contato com Insalubridade/Periculosidade" value={as.contatoInsalubridadePericuloridade} />
          <CampoBool label="Sofreu Acidente de Trabalho" value={as.sofreuAcidenteTrabalho} />
          <CampoBool label="Desenvolveu Doença Ocupacional" value={as.desenvolveuDoencaOcupacional} />
          <CampoBool label="Sofreu Assédio ou Perseguição" value={as.sofreuAssedioOuPerseguicao} />
          {as.relatoAmbienteTrabalho && (
            <div className="sm:col-span-2">
              <Campo label="Relato do Ambiente de Trabalho" value={as.relatoAmbienteTrabalho} />
            </div>
          )}
        </Secao>

        {/* Provas e Testemunhas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-500" /> Provas e Testemunhas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <CampoBool label="Possui Provas Digitais" value={pt.possuiProvasDigitais} />
          </div>
          {testemunhas.length > 0 && (
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Testemunhas</span>
              <div className="mt-2 space-y-2">
                {testemunhas.map((t: any, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-lg px-4 py-3 text-sm grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <span className="font-medium text-slate-800">{t.nome || '—'}</span>
                    <span className="text-slate-500">{t.telefone || '—'}</span>
                    <span className="text-slate-500">{t.grauRelacao || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
