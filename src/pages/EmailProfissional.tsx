import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Info, Trash2 } from 'lucide-react'

export function EmailProfissional() {
  const { user } = useAuth()
  const [contas, setContas] = useState<any[]>([])
  const [form, setForm] = useState({
    email_profissional: '',
    provedor: 'Gmail',
    imap_host: '',
    imap_port: '993',
    usar_ssl: true,
  })
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    async function fetchContas() {
      const { data } = await supabase
        .from('contas_email')
        .select('*')
        .eq('user_id', user?.id)
      setContas(data || [])
    }
    if (user) fetchContas()
  }, [user])

  const provedores: Record<string, { host: string; port: string }> = {
    Gmail: { host: 'imap.gmail.com', port: '993' },
    Outlook: { host: 'outlook.office365.com', port: '993' },
    'IMAP Personalizado': { host: '', port: '993' },
  }

  const handleProvedorChange = (p: string) => {
    setForm(f => ({ ...f, provedor: p, imap_host: provedores[p]?.host || '', imap_port: provedores[p]?.port || '993' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('contas_email').insert({
      ...form,
      user_id: user?.id,
      imap_port: Number(form.imap_port),
    })
    if (!error) {
      setSucesso(true)
      setForm({ email_profissional: '', provedor: 'Gmail', imap_host: '', imap_port: '993', usar_ssl: true })
      const { data } = await supabase.from('contas_email').select('*').eq('user_id', user?.id)
      setContas(data || [])
      setTimeout(() => setSucesso(false), 3000)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('contas_email').delete().eq('id', id)
    setContas(c => c.filter(x => x.id !== id))
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">E-mail Profissional</h2>
        <p className="text-slate-500 text-sm mt-1">Configure seu e-mail para receber contratos automaticamente</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-amber-800 text-sm">
          Por segurança, a conexão real com e-mail deve ser feita por OAuth, Gmail API, Microsoft Graph ou senha de aplicativo.
          Este protótipo salva apenas os dados de configuração.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4" /> Adicionar conta de e-mail
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail profissional</label>
            <input
              type="email"
              value={form.email_profissional}
              onChange={e => setForm(f => ({ ...f, email_profissional: e.target.value }))}
              placeholder="advogado@escritorio.com"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Provedor</label>
            <select
              value={form.provedor}
              onChange={e => handleProvedorChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(provedores).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IMAP Host</label>
              <input
                type="text"
                value={form.imap_host}
                onChange={e => setForm(f => ({ ...f, imap_host: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Porta</label>
              <input
                type="number"
                value={form.imap_port}
                onChange={e => setForm(f => ({ ...f, imap_port: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.usar_ssl}
              onChange={e => setForm(f => ({ ...f, usar_ssl: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-blue-600"
            />
            <span className="text-sm text-slate-700">Usar SSL</span>
          </label>

          {sucesso && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg">
              E-mail salvo com sucesso!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar e-mail profissional'}
          </button>
        </form>
      </div>

      {contas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Contas cadastradas</h3>
          <div className="space-y-3">
            {contas.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.email_profissional}</p>
                  <p className="text-xs text-slate-500">{c.provedor} · {c.imap_host}:{c.imap_port}</p>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
