import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings,
  User,
  Shield,
  Bell,
  Scale,
  LogOut,
  Mail,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

export const Configuracoes: React.FC = () => {
  const { user, logout, requestPasswordReset } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || 'Dr. Roberto Silveira')
  const [email] = useState(user?.email || 'advogado@juscalc.com.br')
  const [oabNumber, setOabNumber] = useState('123.456/SP')
  const [officeName, setOfficeName] = useState('Silveira Advogados Associados')
  const [phone, setPhone] = useState('(11) 98765-4321')

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setIsResetting(true)
    const res = await requestPasswordReset(user.email)
    setIsResetting(false)
    if (res.success) {
      setResetMessage('E-mail para redefinição de senha enviado com sucesso.')
    } else {
      setResetMessage(res.error || 'Erro ao solicitar redefinição.')
    }
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
            Configurações da Conta
          </h1>
          <p className="text-sm sm:text-base text-[#5A6E82] mt-0.5">
            Dados cadastrais do advogado, informações do escritório e preferências de acesso.
          </p>
        </div>

        {/* Botão de Logout em destaque */}
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

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">Informações da conta atualizadas com sucesso!</span>
        </div>
      )}

      {resetMessage && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Bloco 1: Dados do Advogado */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#0F2A44] text-[#C9A24B] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F2A44]">Identificação Profissional</h2>
              <p className="text-xs text-[#5A6E82]">
                Seus dados utilizados no cabeçalho das simulações e petições.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <Label htmlFor="lawyer-name" className="text-xs font-semibold text-[#0F2A44]">
                Nome do Advogado
              </Label>
              <Input
                id="lawyer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-10 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="lawyer-oab" className="text-xs font-semibold text-[#0F2A44]">
                Inscrição OAB (Número / UF)
              </Label>
              <Input
                id="lawyer-oab"
                value={oabNumber}
                onChange={(e) => setOabNumber(e.target.value)}
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
              <span className="text-[11px] text-gray-400 mt-0.5 block">
                E-mail autenticado com o backend PocketBase.
              </span>
            </div>

            <div>
              <Label htmlFor="lawyer-phone" className="text-xs font-semibold text-[#0F2A44]">
                Telefone / WhatsApp Profissional
              </Label>
              <Input
                id="lawyer-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="mt-1 h-10 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Dados do Escritório */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#C9A24B] text-[#0F2A44] flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F2A44]">Dados do Escritório</h2>
              <p className="text-xs text-[#5A6E82]">
                Informações da banca jurídica ou sociedade de advogados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="sm:col-span-2">
              <Label htmlFor="office-name" className="text-xs font-semibold text-[#0F2A44]">
                Nome do Escritório / Razão Social
              </Label>
              <Input
                id="office-name"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="mt-1 h-10 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Segurança e Senha */}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs text-[#5A6E82]">
            Premissa v1: Um único usuário advogado acessando a própria conta.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] font-extrabold text-sm py-2.5 px-6 rounded-lg shadow-md"
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
