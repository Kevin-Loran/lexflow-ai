import { Mail, LogIn, Brain, Database, LayoutDashboard, Bell, Upload } from 'lucide-react'

const etapas = [
  {
    icon: LogIn,
    titulo: '1. Login na plataforma',
    descricao: 'O advogado cria sua conta e faz login no JuriTech com e-mail e senha.',
    cor: 'bg-blue-500',
  },
  {
    icon: Mail,
    titulo: '2. Conecta o e-mail profissional',
    descricao: 'Configura o e-mail do escritório para que contratos recebidos sejam capturados automaticamente.',
    cor: 'bg-violet-500',
  },
  {
    icon: Upload,
    titulo: '3. Upload manual ou recepção por e-mail',
    descricao: 'Contratos chegam em PDF via e-mail ou são enviados manualmente pelo advogado.',
    cor: 'bg-indigo-500',
  },
  {
    icon: Brain,
    titulo: '4. IA extrai as informações',
    descricao: 'O n8n processa o PDF e a IA extrai automaticamente partes, valores, datas, obrigações e cláusulas relevantes.',
    cor: 'bg-emerald-500',
  },
  {
    icon: Database,
    titulo: '5. Dados salvos no Supabase',
    descricao: 'Todas as informações estruturadas são salvas com segurança no banco de dados, vinculadas ao advogado.',
    cor: 'bg-amber-500',
  },
  {
    icon: LayoutDashboard,
    titulo: '6. Dashboard completo',
    descricao: 'O advogado visualiza prazos, valores, obrigações e o status de cada contrato em tempo real.',
    cor: 'bg-orange-500',
  },
  {
    icon: Bell,
    titulo: '7. Alertas automáticos',
    descricao: 'O sistema gera alertas sobre vencimentos, renovações e obrigações próximas.',
    cor: 'bg-red-500',
  },
]

export function ComoFunciona() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Como Funciona</h2>
        <p className="text-slate-500 text-sm mt-1">Entenda o fluxo completo do JuriTech</p>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

        <div className="space-y-8">
          {etapas.map(({ icon: Icon, titulo, descricao, cor }) => (
            <div key={titulo} className="flex gap-6 relative">
              <div className={`w-12 h-12 ${cor} rounded-xl flex items-center justify-center shrink-0 z-10 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">{titulo}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-8 text-center">
        <h3 className="text-white font-bold text-xl mb-2">JuriTech</h3>
        <p className="text-blue-300 text-sm">
          Automação jurídica inteligente — do recebimento do contrato ao alerta de vencimento.
        </p>
      </div>
    </div>
  )
}
