import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings,
  User,
  Shield,
  LogOut,
  Building,
  KeyRound,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Download,
  Upload,
  Cloud,
  Percent,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  carregarConfigCompleta,
  salvarConfiguracoes,
  PADROES_PAINEL,
  type ConfigPainel,
} from '@/services/configuracoes'

export const Configuracoes: React.FC = () => {
  const { user, logout, requestPasswordReset } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email] = useState(user?.email || 'advogado@juscalc.com.br')

  // Configurações do escritório (nuvem)
  const [cfg, setCfg] = useState<ConfigPainel | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [restaurando, setRestaurando] = useState(false)
  const [confirmarRestaurar, setConfirmarRestaurar] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    let active = true
    carregarConfigCompleta()
      .then((c) => {
        if (active) setCfg(c)
      })
      .catch(() => {
        if (active) setCfg({ ...PADROES_PAINEL })
      })
    return () => {
      active = false
    }
  }, [user?.id])

  const set = <K extends keyof ConfigPainel>(campo: K, valor: ConfigPainel[K]) =>
    setCfg((prev) => (prev ? { ...prev, [campo]: valor } : prev))

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cfg) return
    setSalvando(true)
    try {
      const salvo = await salvarConfiguracoes(cfg)
      setCfg(salvo)
      toast({
        title: 'Configurações salvas',
        description: 'Os parâmetros do escritório foram gravados na nuvem.',
      })
    } catch {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível gravar na nuvem. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  const handleRestaurar = async () => {
    setConfirmarRestaurar(false)
    setRestaurando(true)
    try {
      const padroes = { ...PADROES_PAINEL }
      const salvo = await salvarConfiguracoes(padroes)
      setCfg(salvo)
      toast({ title: 'Padrões restaurados', description: 'Valores de fábrica gravados na nuvem.' })
    } catch {
      toast({
        title: 'Erro ao restaurar',
        description: 'Não foi possível gravar os padrões. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setRestaurando(false)
    }
  }

  const handleExportar = () => {
    if (!cfg) return
    const conteudo = JSON.stringify(
      { app: 'JusCalc', tipo: 'configuracoes_escritorio', dados: cfg },
      null,
      2,
    )
    const blob = new Blob([conteudo], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `juscalc-configuracoes-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Backup exportado', description: 'Arquivo JSON gerado com as configurações.' })
  }

  const handleImportar = async (file: File) => {
    try {
      const texto = await file.text()
      const json = JSON.parse(texto) as { dados?: Partial<ConfigPainel> } & Partial<ConfigPainel>
      const dados = json.dados ?? json
      const importado: ConfigPainel = {
        nome_escritorio:
          typeof dados.nome_escritorio === 'string'
            ? dados.nome_escritorio
            : PADROES_PAINEL.nome_escritorio,
        numero_oab:
          typeof dados.numero_oab === 'string' ? dados.numero_oab : PADROES_PAINEL.numero_oab,
        percentual_honorarios:
          Number(dados.percentual_honorarios) || PADROES_PAINEL.percentual_honorarios,
        salario_minimo: Number(dados.salario_minimo) || PADROES_PAINEL.salario_minimo,
        teto_seguro_desemprego:
          Number(dados.teto_seguro_desemprego) || PADROES_PAINEL.teto_seguro_desemprego,
        divisor_padrao: Number(dados.divisor_padrao) || PADROES_PAINEL.divisor_padrao,
        texto_rodape:
          typeof dados.texto_rodape === 'string' ? dados.texto_rodape : PADROES_PAINEL.texto_rodape,
        mensagem_whatsapp:
          typeof dados.mensagem_whatsapp === 'string'
            ? dados.mensagem_whatsapp
            : PADROES_PAINEL.mensagem_whatsapp,
      }
      const salvo = await salvarConfiguracoes(importado)
      setCfg(salvo)
      toast({
        title: 'Backup importado',
        description: 'Configurações restauradas do arquivo JSON.',
      })
    } catch {
      toast({
        title: 'Erro ao importar',
        description: 'Arquivo inválido ou fora do formato esperado.',
        variant: 'destructive',
      })
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setIsResetting(true)
    const res = await requestPasswordReset(user.email)
    setIsResetting(false)
    setResetMessage(
      res.success
        ? 'E-mail para redefinição de senha enviado com sucesso.'
        : res.error || 'Erro ao solicitar redefinição.',
    )
    setTimeout(() => setResetMessage(null), 5000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F2A44]/5 text-[#0F2A44] border border-[#0F2A44]/10">
              <Settings className="w-3.5 h-3.5 text-[#C9A24B]" />
              Painel de Ajustes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A44] tracking-tight">
            Configurações do Escritório
          </h1>
          <p className="text-sm sm:text-base text-[#5A6E82] mt-0.5">
            Parâmetros globais do escritório, gravados na nuvem (coleção configuracoes_escritorio).
          </p>
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 h-10 px-4"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da conta</span>
          </Button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {!cfg ? (
        <div className="flex items-center justify-center py-12 text-sm text-[#5A6E82]">
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A24B] mr-2" />
          Carregando configurações…
        </div>
      ) : (
        <form onSubmit={handleSalvar} className="space-y-6">
          {/* Bloco 1: Identificação */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#0F2A44] text-[#C9A24B] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F2A44]">Identificação Profissional</h2>
                <p className="text-xs text-[#5A6E82]">
                  Dados usados no cabeçalho das simulações e apresentações.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <Label htmlFor="office-name" className="text-xs font-semibold text-[#0F2A44]">
                  Nome do Escritório
                </Label>
                <Input
                  id="office-name"
                  value={cfg.nome_escritorio}
                  onChange={(e) => set('nome_escritorio', e.target.value)}
                  placeholder="Ex: Silveira Advogados Associados"
                  className="mt-1 h-10 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="office-oab" className="text-xs font-semibold text-[#0F2A44]">
                  Número OAB
                </Label>
                <Input
                  id="office-oab"
                  value={cfg.numero_oab}
                  onChange={(e) => set('numero_oab', e.target.value)}
                  placeholder="Ex: 123.456/SP"
                  className="mt-1 h-10 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="lawyer-email" className="text-xs font-semibold text-[#0F2A44]">
                  E-mail de Login
                </Label>
                <Input
                  id="lawyer-email"
                  value={email}
                  disabled
                  className="mt-1 h-10 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Bloco 2: Parâmetros financeiros */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#C9A24B] text-[#0F2A44] flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F2A44]">Parâmetros Financeiros</h2>
                <p className="text-xs text-[#5A6E82]">
                  Valores usados pelo motor de cálculo nas simulações.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <Label htmlFor="cfg-honorarios" className="text-xs font-semibold text-[#0F2A44]">
                  Percentual padrão de Honorários (%)
                </Label>
                <Input
                  id="cfg-honorarios"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={cfg.percentual_honorarios}
                  onChange={(e) => set('percentual_honorarios', Number(e.target.value))}
                  className="mt-1 h-10 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="cfg-salario" className="text-xs font-semibold text-[#0F2A44]">
                  Salário Mínimo vigente (R$)
                </Label>
                <Input
                  id="cfg-salario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cfg.salario_minimo}
                  onChange={(e) => set('salario_minimo', Number(e.target.value))}
                  className="mt-1 h-10 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="cfg-teto" className="text-xs font-semibold text-[#0F2A44]">
                  Teto do Seguro-Desemprego (R$)
                </Label>
                <Input
                  id="cfg-teto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cfg.teto_seguro_desemprego}
                  onChange={(e) => set('teto_seguro_desemprego', Number(e.target.value))}
                  className="mt-1 h-10 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="cfg-divisor" className="text-xs font-semibold text-[#0F2A44]">
                  Divisor padrão
                </Label>
                <Input
                  id="cfg-divisor"
                  type="number"
                  step="1"
                  min="1"
                  value={cfg.divisor_padrao}
                  onChange={(e) => set('divisor_padrao', Number(e.target.value))}
                  className="mt-1 h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Bloco 3: Textos padrão */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#1A3D61] text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F2A44]">Textos Padrão</h2>
                <p className="text-xs text-[#5A6E82]">
                  Usados na apresentação do cálculo e no envio ao cliente.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <Label htmlFor="cfg-rodape" className="text-xs font-semibold text-[#0F2A44]">
                  Texto padrão do rodapé da apresentação
                </Label>
                <textarea
                  id="cfg-rodape"
                  value={cfg.texto_rodape}
                  onChange={(e) => set('texto_rodape', e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] focus-visible:border-[#C9A24B]"
                />
              </div>

              <div>
                <Label htmlFor="cfg-whatsapp" className="text-xs font-semibold text-[#0F2A44]">
                  Mensagem padrão de envio no WhatsApp
                </Label>
                <textarea
                  id="cfg-whatsapp"
                  value={cfg.mensagem_whatsapp}
                  onChange={(e) => set('mensagem_whatsapp', e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] focus-visible:border-[#C9A24B]"
                />
              </div>
            </div>
          </div>

          {/* Bloco 4: Segurança e Senha */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#1A3D61] text-white flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F2A44]">Segurança e Autenticação</h2>
                <p className="text-xs text-[#5A6E82]">
                  Gerenciamento de credenciais e acesso à área reservada.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F4F6F9] border border-gray-200">
              <div>
                <p className="text-sm font-bold text-[#0F2A44]">Redefinir Senha de Acesso</p>
                <p className="text-xs text-[#5A6E82] mt-0.5">
                  Enviaremos um link de alteração de senha para{' '}
                  <span className="font-semibold text-[#0F2A44]">{email}</span>.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={isResetting}
                onClick={handlePasswordReset}
                className="text-xs font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44] flex-shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                <span>{isResetting ? 'Solicitando...' : 'Enviar Link de Redefinição'}</span>
              </Button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                disabled={restaurando || salvando}
                onClick={() => setConfirmarRestaurar(true)}
                className="text-xs font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44] h-10 flex items-center justify-center gap-1.5"
              >
                {restaurando ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Restaurar Padrões</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!cfg}
                onClick={handleExportar}
                className="text-xs font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44] h-10 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Backup (JSON)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!cfg}
                onClick={() => fileRef.current?.click()}
                className="text-xs font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44] h-10 flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Backup (JSON)</span>
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleImportar(file)
                  e.target.value = ''
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={salvando}
              className="w-full sm:w-auto bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] font-extrabold text-sm py-2.5 px-6 rounded-lg shadow-md flex items-center justify-center gap-2"
            >
              {salvando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
              <span>{salvando ? 'Salvando...' : 'Salvar na Nuvem'}</span>
            </Button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={confirmarRestaurar}
        title="Restaurar padrões?"
        description="Todos os campos voltarão aos valores de fábrica (honorários 30%, salário mínimo 1621,00, teto 2518,65, divisor 220 e os textos padrão) e serão gravados na nuvem. Esta ação não pode ser desfeita."
        confirmLabel="Restaurar padrões"
        busy={restaurando}
        onConfirm={() => void handleRestaurar()}
        onCancel={() => setConfirmarRestaurar(false)}
      />
    </div>
  )
}
