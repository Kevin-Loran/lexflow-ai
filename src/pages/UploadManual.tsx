import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Upload, FileText, CheckCircle } from 'lucide-react'

export function UploadManual() {
  const { user } = useAuth()
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState('')
  const [observacao, setObservacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!arquivo) return

    setLoading(true)
    setErro('')

    const path = `${user?.id}/${Date.now()}_${arquivo.name}`
    const { error: uploadError } = await supabase.storage
      .from('contratos-pdf')
      .upload(path, arquivo, { contentType: 'application/pdf' })

    if (uploadError) {
      setErro('Erro ao enviar o arquivo: ' + uploadError.message)
      setLoading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('contratos-pdf').getPublicUrl(path)

    await supabase.from('contratos').insert({
      user_id: user?.id,
      nome_arquivo: arquivo.name,
      titulo_contrato: titulo || arquivo.name,
      arquivo_url: urlData.publicUrl,
      origem_documento: 'upload_manual',
      status_manual: 'ativo',
    })

    setSucesso(true)
    setArquivo(null)
    setTitulo('')
    setObservacao('')
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Upload Manual</h2>
        <p className="text-slate-500 text-sm mt-1">Envie um contrato em PDF para análise automática</p>
      </div>

      {sucesso ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="font-semibold text-emerald-900 text-lg mb-2">PDF enviado com sucesso!</h3>
          <p className="text-emerald-700 text-sm mb-4">
            A análise automática será feita pelo fluxo do n8n.
          </p>
          <button
            onClick={() => setSucesso(false)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm transition-colors"
          >
            Enviar outro
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <form onSubmit={handleUpload} className="space-y-5">
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => setArquivo(e.target.files?.[0] || null)}
              />
              {arquivo ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-slate-800 text-sm">{arquivo.name}</p>
                    <p className="text-xs text-slate-500">{(arquivo.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">Clique para selecionar o PDF</p>
                  <p className="text-slate-400 text-xs mt-1">Apenas arquivos .pdf</p>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título (opcional)</label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Contrato de Prestação de Serviços"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observação (opcional)</label>
              <textarea
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                placeholder="Alguma observação sobre este contrato..."
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">{erro}</div>
            )}

            <button
              type="submit"
              disabled={!arquivo || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar PDF'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
