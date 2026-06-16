import { useNavigate } from 'react-router-dom'
import {
  UserPlus, Mail, Inbox, Cpu, Brain, Database, LayoutDashboard, Bell,
  CheckCircle2, Zap, ArrowRight, FileText, DollarSign, Calendar, Shield, Sparkles,
} from 'lucide-react'

// ─── Data ───────────────────────────────────────────────────────────────────

const PASSOS_USUARIO = [
  {
    numero: '01',
    icon: UserPlus,
    titulo: 'Crie sua conta',
    descricao: 'Cadastre-se na plataforma com seu e-mail e senha. Leva menos de 1 minuto.',
    cor: '#6366f1',
  },
  {
    numero: '02',
    icon: Mail,
    titulo: 'Conecte seu e-mail profissional',
    descricao: 'Vincule o e-mail do escritório à automação. Esse é o único passo técnico — feito uma única vez.',
    cor: '#8b5cf6',
  },
  {
    numero: '03',
    icon: LayoutDashboard,
    titulo: 'Abra o dashboard',
    descricao: 'Seus contratos já chegam organizados, analisados e com alertas. Sem uploads, sem formulários.',
    cor: '#10b981',
  },
]

const BASTIDORES = [
  {
    icon: Inbox,
    titulo: 'E-mail detectado',
    descricao: 'Um contrato ou documento chega na sua caixa de entrada.',
    cor: '#3b82f6',
  },
  {
    icon: Cpu,
    titulo: 'n8n dispara',
    descricao: 'O fluxo de automação é ativado automaticamente e captura o anexo PDF.',
    cor: '#8b5cf6',
  },
  {
    icon: Brain,
    titulo: 'Gemini AI analisa',
    descricao: 'A IA lê o documento e extrai partes, valores, datas, cláusulas e obrigações.',
    cor: '#6366f1',
  },
  {
    icon: Database,
    titulo: 'Supabase armazena',
    descricao: 'Todos os dados estruturados são salvos com segurança, vinculados à sua conta.',
    cor: '#f59e0b',
  },
  {
    icon: Bell,
    titulo: 'Alertas ativos',
    descricao: 'O sistema monitora prazos e gera alertas de vencimento e renovação.',
    cor: '#ef4444',
  },
]

const GRUPOS_EXTRACAO = [
  {
    icon: FileText,
    titulo: 'Partes do Contrato',
    cor: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
    campos: ['Partes envolvidas', 'Papéis (contratante/contratado)', 'Tipo de documento', 'Categoria'],
  },
  {
    icon: DollarSign,
    titulo: 'Financeiro',
    cor: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    campos: ['Valor total', 'Valor mensal', 'Forma de pagamento', 'Cláusula de multa'],
  },
  {
    icon: Calendar,
    titulo: 'Datas e Vigência',
    cor: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    campos: ['Data de assinatura', 'Início de vigência', 'Fim de vigência', 'Dias para vencer', 'Cláusula de renovação'],
  },
  {
    icon: Shield,
    titulo: 'Cláusulas Jurídicas',
    cor: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    campos: ['Cláusula de rescisão', 'Confidencialidade', 'Foro', 'LGPD'],
  },
  {
    icon: Sparkles,
    titulo: 'Análise da IA',
    cor: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    campos: ['Obrigações', 'Pontos de atenção', 'Alertas recomendados', 'Prazos importantes', 'Resumo jurídico'],
  },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ text, cor }: { text: string; cor: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="h-px w-5 rounded-full" style={{ background: cor }} />
      <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: cor }}>
        {text}
      </span>
    </div>
  )
}

function AutomacaoVisual() {
  return (
    <div className="w-[250px] shrink-0 space-y-2 select-none">
      {/* Incoming email */}
      <div
        className="rounded-xl p-3.5"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.2)' }}>
            <Mail className="w-3 h-3 text-blue-400" />
          </div>
          <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Novo e-mail recebido
          </span>
          <span className="ml-auto text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>agora</span>
        </div>
        <p className="text-[11px] pl-8" style={{ color: 'rgba(255,255,255,0.28)' }}>
          contrato_parceria.pdf
        </p>
      </div>

      {/* Connector */}
      <div className="flex justify-center">
        <div className="w-px h-4 rounded-full" style={{ background: 'rgba(99,102,241,0.4)' }} />
      </div>

      {/* Processing */}
      <div
        className="rounded-xl p-3.5"
        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)' }}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span className="text-[11px] font-medium text-indigo-300">Gemini AI analisando</span>
          <div className="ml-auto flex gap-1">
            {[0.9, 0.5, 0.2].map((op, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#818cf8', opacity: op }} />
            ))}
          </div>
        </div>
      </div>

      {/* Connector */}
      <div className="flex justify-center">
        <div className="w-px h-4 rounded-full" style={{ background: 'rgba(16,185,129,0.4)' }} />
      </div>

      {/* Result */}
      <div
        className="rounded-xl p-3.5"
        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-medium text-emerald-300">Contrato organizado</span>
        </div>
        <div className="space-y-1.5 pl-6">
          {[['Valor', 'R$ 25.000,00'], ['Partes', '2 identificadas'], ['Vence', 'em 45 dias']].map(([label, val]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[10px] w-10 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export function ComoFunciona() {
  const navigate = useNavigate()

  return (
    <div className="p-4 md:p-8 pb-12">
      <div className="max-w-5xl mx-auto space-y-20 md:space-y-28">

        {/* ══════════════ HERO ══════════════ */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 55%, #0a1422 100%)' }}
        >
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute w-80 h-80 -top-16 -right-16 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)' }}
            />
            <div
              className="absolute w-56 h-56 -bottom-10 left-0 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)' }}
            />
          </div>

          <div className="relative flex items-center gap-10 p-8 md:p-14">
            {/* Left: text */}
            <div className="flex-1 min-w-0">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-7"
                style={{
                  background: 'rgba(99,102,241,0.2)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.28)',
                }}
              >
                <Zap className="w-3 h-3" />
                100% automatizado
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-5">
                Cadastre-se.<br />
                <span style={{ color: '#a5b4fc' }}>O resto é com a IA.</span>
              </h2>

              <p className="text-sm md:text-base leading-relaxed max-w-md" style={{ color: 'rgba(148,163,184,0.8)' }}>
                Conecte seu e-mail profissional uma única vez. A partir daí, cada contrato que chegar
                na sua caixa é automaticamente detectado, lido e organizado — sem nenhuma ação sua.
              </p>
            </div>

            {/* Right: automation visual (desktop only) */}
            <div className="hidden lg:flex items-center justify-center shrink-0">
              <AutomacaoVisual />
            </div>
          </div>
        </div>

        {/* ══════════════ STEPPER ══════════════ */}
        <div>
          <SectionLabel text="O que você faz" cor="#6366f1" />
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">3 passos. Só isso.</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-md">
            Você configura uma vez. A automação trabalha para sempre.
          </p>

          <div className="max-w-2xl space-y-0">
            {PASSOS_USUARIO.map(({ numero, icon: Icon, titulo, descricao, cor }, idx) => (
              <div key={numero} className="flex gap-5">
                {/* Step number + connector line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: `${cor}12`,
                      color: cor,
                      border: `1.5px solid ${cor}30`,
                    }}
                  >
                    {numero}
                  </div>
                  {idx < PASSOS_USUARIO.length - 1 && (
                    <div
                      className="w-px flex-1 my-2.5"
                      style={{ background: '#e2e8f0', minHeight: 32 }}
                    />
                  )}
                </div>

                {/* Card */}
                <div className={idx < PASSOS_USUARIO.length - 1 ? 'flex-1 pb-5' : 'flex-1'}>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${cor}10` }}
                    >
                      <Icon style={{ color: cor, width: 18, height: 18 }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1.5">{titulo}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{descricao}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ TIMELINE ══════════════ */}
        <div>
          <SectionLabel text="O que acontece automaticamente" cor="#10b981" />
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Por baixo do capô</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-md">
            Enquanto você trabalha, a automação processa cada documento em segundos.
          </p>

          <div className="max-w-2xl space-y-0">
            {BASTIDORES.map(({ icon: Icon, titulo, descricao, cor }, idx) => (
              <div key={titulo} className="flex gap-5">
                {/* Icon dot + connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10"
                    style={{ background: `${cor}15`, border: `2px solid ${cor}45` }}
                  >
                    <Icon style={{ color: cor, width: 16, height: 16 }} />
                  </div>
                  {idx < BASTIDORES.length - 1 && (
                    <div
                      className="w-px flex-1 my-1.5"
                      style={{
                        background: `linear-gradient(to bottom, ${cor}55, ${BASTIDORES[idx + 1].cor}55)`,
                        minHeight: 28,
                      }}
                    />
                  )}
                </div>

                {/* Card */}
                <div className={idx < BASTIDORES.length - 1 ? 'flex-1 pb-4' : 'flex-1'}>
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4">
                    <p className="font-semibold text-slate-900 text-sm mb-1">{titulo}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ EXTRACTION GROUPS ══════════════ */}
        <div>
          <SectionLabel text="Extração automática" cor="#8b5cf6" />
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            O que a IA lê em cada contrato
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-lg">
            Cada documento é processado e os seguintes campos são extraídos e organizados automaticamente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {GRUPOS_EXTRACAO.map(({ icon: Icon, titulo, cor, bg, campos }) => (
              <div
                key={titulo}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 mb-4 pb-4"
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon style={{ color: cor, width: 16, height: 16 }} />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{titulo}</h4>
                </div>

                {/* Fields */}
                <div className="space-y-2">
                  {campos.map(campo => (
                    <div key={campo} className="flex items-center gap-2.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: cor, opacity: 0.65 }}
                      />
                      <span className="text-slate-600 text-xs">{campo}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ CTA ══════════════ */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.18) 0%, transparent 65%)' }}
          />
          <div className="relative p-8 md:p-16 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                boxShadow: '0 8px 28px rgba(99,102,241,0.45)',
              }}
            >
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-2xl md:text-3xl leading-tight mb-3">
              Automação jurídica de verdade.
            </h3>
            <p
              className="text-sm md:text-base leading-relaxed max-w-sm mx-auto mb-8"
              style={{ color: 'rgba(148,163,184,0.8)' }}
            >
              Do recebimento do e-mail ao alerta de vencimento — sem intervenção manual.
            </p>
            <button
              onClick={() => navigate('/contratos/novo')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-transform hover:scale-105 active:scale-100"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 4px 24px rgba(99,102,241,0.45)',
              }}
            >
              Enviar primeiro contrato
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
