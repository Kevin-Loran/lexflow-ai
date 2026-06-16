import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Save } from 'lucide-react'

const STATUS_OPTS = ['ativo', 'vencido', 'pendente', 'cancelado']
const PRIORIDADE_OPTS = ['alta', 'media', 'baixa']

const inputCls = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 transition-all'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  )
}

function Input({ value, onChange, type = 'text', placeholder }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  )
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={inputCls}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Textarea({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className={`${inputCls} resize-none`}
    />
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-semibold text-slate-800 text-sm mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function ContratoForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    titulo_contrato: '',
    tipo_documento: '',
    categoria: '',
    status_manual: '',
    prioridade_revisao: '',
    data_assinatura: '',
    data_inicio_vigencia: '',
    data_fim_vigencia: '',
    valor_total: '',
    valor_mensal: '',
    forma_pagamento: '',
    remetente_email: '',
    resumo: '',
    obrigacoes: '',
  })

  useEffect(() => {
    if (!isEditing) return
    async function fetch() {
      const { data } = await supabase.from('contratos').select('*').eq('id', id).single()
      if (data) {
        setForm({
          titulo_contrato: data.titulo_contrato || '',
          tipo_documento: data.tipo_documento || '',
          categoria: data.categoria || '',
          status_manual: data.status_manual || '',
          prioridade_revisao: data.prioridade_revisao || '',
          data_assinatura: isoDate(data.data_assinatura),
          data_inicio_vigencia: isoDate(data.data_inicio_vigencia),
          data_fim_vigencia: isoDate(data.data_fim_vigencia),
          valor_total: data.valor_total || '',
          valor_mensal: data.valor_mensal || '',
          forma_pagamento: data.forma_pagamento || '',
          remetente_email: data.remetente_email || '',
          resumo: data.resumo || '',
          obrigacoes: data.obrigacoes || '',
        })
      }
      setLoading(false)
    }
    fetch()
  }, [id, isEditing])

  function isoDate(v: any): string {
    if (!v) return ''
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10)
    const m = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})/)
    if (m) return `${m[3]}-${m[2]}-${m[1]}`
    return ''
  }

  function set(key: keyof typeof form) {
    return (val: string) => setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSave() {
    setErro('')
    setSaving(true)
    const payload = {
      titulo_contrato: form.titulo_contrato || null,
      tipo_documento: form.tipo_documento || null,
      categoria: form.categoria || null,
      status_manual: form.status_manual || null,
      prioridade_revisao: form.prioridade_revisao || null,
      data_assinatura: form.data_assinatura || null,
      data_inicio_vigencia: form.data_inicio_vigencia || null,
      data_fim_vigencia: form.data_fim_vigencia || null,
      valor_total: form.valor_total || null,
      valor_mensal: form.valor_mensal || null,
      forma_pagamento: form.forma_pagamento || null,
      remetente_email: form.remetente_email || null,
      resumo: form.resumo || null,
      obrigacoes: form.obrigacoes || null,
    }

    if (isEditing) {
      const { error } = await supabase.from('contratos').update(payload).eq('id', id)
      if (error) { setErro(error.message); setSaving(false); return }
      navigate(`/contratos/${id}`)
    } else {
      const { data, error } = await supabase
        .from('contratos')
        .insert({ ...payload, user_id: user!.id, origem_documento: 'manual' })
        .select()
        .single()
      if (error) { setErro(error.message); setSaving(false); return }
      navigate(`/contratos/${data.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 md:pl-10 max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
        {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
      </h2>

      {erro && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{erro}</div>
      )}

      <div className="space-y-5">
        <Section title="Identificação">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Título do Contrato</Label>
              <Input value={form.titulo_contrato} onChange={set('titulo_contrato')} placeholder="Ex: Contrato de Prestação de Serviços" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Documento</Label>
                <Input value={form.tipo_documento} onChange={set('tipo_documento')} placeholder="Ex: Contrato, Adendo, NDA" />
              </div>
              <div>
                <Label>Categoria</Label>
                <Input value={form.categoria} onChange={set('categoria')} placeholder="Ex: Trabalhista, Comercial" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status_manual} onChange={set('status_manual')} options={STATUS_OPTS} placeholder="Selecionar status" />
              </div>
              <div>
                <Label>Prioridade de Revisão</Label>
                <Select value={form.prioridade_revisao} onChange={set('prioridade_revisao')} options={PRIORIDADE_OPTS} placeholder="Selecionar prioridade" />
              </div>
            </div>
            <div>
              <Label>Remetente / Email</Label>
              <Input value={form.remetente_email} onChange={set('remetente_email')} type="email" placeholder="remetente@exemplo.com" />
            </div>
          </div>
        </Section>

        <Section title="Datas">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Data de Assinatura</Label>
              <Input value={form.data_assinatura} onChange={set('data_assinatura')} type="date" />
            </div>
            <div>
              <Label>Início de Vigência</Label>
              <Input value={form.data_inicio_vigencia} onChange={set('data_inicio_vigencia')} type="date" />
            </div>
            <div>
              <Label>Fim de Vigência</Label>
              <Input value={form.data_fim_vigencia} onChange={set('data_fim_vigencia')} type="date" />
            </div>
          </div>
        </Section>

        <Section title="Valores">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Valor Total</Label>
              <Input value={form.valor_total} onChange={set('valor_total')} placeholder="Ex: R$ 10.000,00" />
            </div>
            <div>
              <Label>Valor Mensal</Label>
              <Input value={form.valor_mensal} onChange={set('valor_mensal')} placeholder="Ex: R$ 1.000,00" />
            </div>
            <div>
              <Label>Forma de Pagamento</Label>
              <Input value={form.forma_pagamento} onChange={set('forma_pagamento')} placeholder="Ex: Boleto, PIX" />
            </div>
          </div>
        </Section>

        <Section title="Resumo e Obrigações">
          <div className="space-y-4">
            <div>
              <Label>Resumo</Label>
              <Textarea value={form.resumo} onChange={set('resumo')} placeholder="Descreva brevemente o contrato..." />
            </div>
            <div>
              <Label>Obrigações</Label>
              <Textarea value={form.obrigacoes} onChange={set('obrigacoes')} placeholder="Liste as obrigações principais..." />
            </div>
          </div>
        </Section>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl transition-colors font-medium shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
