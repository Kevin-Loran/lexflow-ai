import {
  UserPlus, Mail, Inbox, Cpu, Brain, Database,
  LayoutDashboard, Bell, CheckCircle2, Zap,
} from 'lucide-react'

// ── User-facing steps (what the user sees / does) ──
const PASSOS_USUARIO = [
  {
    numero: '01',
    icon: UserPlus,
    titulo: 'Crie sua conta',
    descricao: 'Cadastre-se na plataforma com seu e-mail e senha. Leva menos de 1 minuto.',
    cor: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
  },
  {
    numero: '02',
    icon: Mail,
    titulo: 'Conecte seu e-mail profissional',
    descricao: 'Vincule o e-mail do escritório à automação. Esse é o único passo técnico — feito uma única vez.',
    cor: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
  },
  {
    numero: '03',
    icon: LayoutDashboard,
    titulo: 'Abra o dashboard',
    descricao: 'Seus contratos já chegam organizados, analisados e com alertas. Sem uploads, sem formulários.',
    cor: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
  },
]

// ── What happens behind the scenes ──
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

// ── What the AI extracts from each document ──
const CAMPOS_EXTRAIDOS = [
  'Partes envolvidas', 'Papéis (contratante/contratado)', 'Valor total', 'Valor mensal',
  'Forma de pagamento', 'Data de assinatura', 'Início de vigência', 'Fim de vigência',
  'Dias para vencer', 'Cláusula de rescisão', 'Cláusula de multa', 'Cláusula de renovação',
  'Confidencialidade', 'Foro', 'LGPD', 'Obrigações', 'Pontos de atenção', 'Alertas recomendados',
  'Prazos importantes', 'Resumo jurídico', 'Tipo de documento', 'Categoria',
]

export function ComoFunciona() {
  return (
    <div className="p-4 md:p-7 max-w-4xl">

      {/* ── Hero ── */}
      <div
        className="rounded-2xl p-7 md:p-10 mb-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #0a1422 100%)' }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div className="relative">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: 'rgba(99,102,241,0.18)', color: '#a5b4fc' }}
          >
            <Zap className="w-3 h-3" />
            100% automatizado
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
            Cadastre-se.<br />
            <span style={{ color: '#a5b4fc' }}>O resto é com a IA.</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-lg" style={{ color: 'rgba(148,163,184,0.8)' }}>
            Conecte seu e-mail profissional uma única vez. A partir daí, cada contrato que chegar na sua caixa
            é automaticamente detectado, lido e organizado — sem nenhuma ação sua.
          </p>
        </div>
      </div>

      {/* ── Sua parte: 3 passos ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6366f1' }}>
            O que você faz
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">3 passos. Só isso.</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PASSOS_USUARIO.map(({ numero, icon: Icon, titulo, descricao, cor, bg }) => (
            <div
              key={numero}
              className="relative rounded-2xl p-5 border border-slate-100 bg-white shadow-sm flex flex-col gap-3"
            >
              {/* Step number */}
              <span
                className="text-[11px] font-bold tracking-widest"
                style={{ color: cor, opacity: 0.5 }}
              >
                {numero}
              </span>

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon className="w-5 h-5" style={{ color: cor }} />
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1">{titulo}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{descricao}</p>
              </div>

              {/* Connector arrow (between cards, hidden on last) */}
              {numero !== '03' && (
                <div
                  className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full items-center justify-center z-10 text-xs font-bold"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8' }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Por baixo do capô ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#10b981' }}>
            O que acontece automaticamente
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Por baixo do capô</h3>

        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-5 top-10 bottom-10 w-px"
            style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.3), rgba(239,68,68,0.3))' }}
          />

          <div className="space-y-3">
            {BASTIDORES.map(({ icon: Icon, titulo, descricao, cor }, idx) => (
              <div key={titulo} className="flex gap-4 relative">
                {/* Icon circle */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10"
                  style={{ background: `${cor}18`, border: `1.5px solid ${cor}30` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: cor, width: 18, height: 18 }} />
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: cor }}
                    >
                      Passo {idx + 1}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm leading-none mb-1">{titulo}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── O que a IA extrai ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>
            Extração automática
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">O que a IA lê em cada contrato</h3>
        <p className="text-slate-500 text-sm mb-5">
          Cada documento é processado e os seguintes campos são extraídos e organizados automaticamente.
        </p>

        <div
          className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5"
        >
          <div className="flex flex-wrap gap-2">
            {CAMPOS_EXTRAIDOS.map(campo => (
              <span
                key={campo}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.07)', color: '#4338ca' }}
              >
                <CheckCircle2 className="w-3 h-3" style={{ color: '#6366f1' }} />
                {campo}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
        />
        <div className="relative">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
          >
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Automação jurídica de verdade</h3>
          <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: 'rgba(148,163,184,0.8)' }}>
            Do recebimento do e-mail ao alerta de vencimento — sem intervenção manual.
          </p>
        </div>
      </div>

    </div>
  )
}
