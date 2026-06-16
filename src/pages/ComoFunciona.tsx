import { Mail, LogIn, Brain, Database, LayoutDashboard, Bell, Upload } from 'lucide-react'

const etapas = [
  {
    icon: LogIn,
    titulo: '1. Login na plataforma',
    descricao: 'O advogado cria sua conta e faz login no JuriTech com e-mail e senha.',
    iconBg: 'bg-indigo-500',
    accent: '#6366f1',
  },
  {
    icon: Mail,
    titulo: '2. Conecta o e-mail profissional',
    descricao: 'Configura o e-mail do escritório para que contratos recebidos sejam capturados automaticamente.',
    iconBg: 'bg-violet-500',
    accent: '#8b5cf6',
  },
  {
    icon: Upload,
    titulo: '3. Upload manual ou recepção por e-mail',
    descricao: 'Contratos chegam em PDF via e-mail ou são enviados manualmente pelo advogado.',
    iconBg: 'bg-blue-500',
    accent: '#3b82f6',
  },
  {
    icon: Brain,
    titulo: '4. IA extrai as informações',
    descricao: 'O n8n processa o PDF e a IA extrai automaticamente partes, valores, datas, obrigações e cláusulas relevantes.',
    iconBg: 'bg-emerald-500',
    accent: '#10b981',
  },
  {
    icon: Database,
    titulo: '5. Dados salvos no Supabase',
    descricao: 'Todas as informações estruturadas são salvas com segurança no banco de dados, vinculadas ao advogado.',
    iconBg: 'bg-amber-500',
    accent: '#f59e0b',
  },
  {
    icon: LayoutDashboard,
    titulo: '6. Dashboard completo',
    descricao: 'O advogado visualiza prazos, valores, obrigações e o status de cada contrato em tempo real.',
    iconBg: 'bg-orange-500',
    accent: '#f97316',
  },
  {
    icon: Bell,
    titulo: '7. Alertas automáticos',
    descricao: 'O sistema gera alertas sobre vencimentos, renovações e obrigações próximas.',
    iconBg: 'bg-red-500',
    accent: '#ef4444',
  },
]

export function ComoFunciona() {
  return (
    <div className="p-4 md:p-8 md:pl-10 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Como Funciona</h2>
        <p className="text-slate-500 text-sm mt-1">Entenda o fluxo completo do JuriTech</p>
      </div>

      <div className="relative">
        {/* Connector line */}
        <div
          className="absolute left-6 top-6 bottom-6 w-px"
          style={{ background: 'linear-gradient(to bottom, #e2e8f0, #e2e8f0)' }}
        />

        <div className="space-y-5">
          {etapas.map(({ icon: Icon, titulo, descricao, iconBg, accent }) => (
            <div key={titulo} className="flex gap-5 relative">
              <div
                className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-md`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex-1"
                style={{ borderLeft: `3px solid ${accent}` }}
              >
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{titulo}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-10 rounded-2xl p-8 text-center"
        style={{ background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)' }}
        >
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">JuriTech</h3>
        <p className="text-indigo-300 text-sm">
          Automação jurídica inteligente. Do recebimento do contrato ao alerta de vencimento.
        </p>
      </div>
    </div>
  )
}
