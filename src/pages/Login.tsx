import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Scale, Lock, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Password reset modal / form toggle
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const { login, requestPasswordReset, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, informe seu e-mail e senha de acesso.')
      return
    }

    setIsSubmitting(true)
    const result = await login(email, password)
    setIsSubmitting(false)

    if (result.success) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/'
      navigate(from, { replace: true })
    } else {
      setErrorMessage(
        result.error || 'Credenciais inválidas. Verifique os dados digitados e tente novamente.',
      )
    }
  }

  const handleFillDemo = () => {
    setEmail('advogado@juscalc.com.br')
    setPassword('Skip@Pass123')
    setErrorMessage(null)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      setResetStatus('error')
      setResetMessage('Informe o e-mail cadastrado para redefinir a senha.')
      return
    }

    setResetStatus('loading')
    setResetMessage(null)

    const res = await requestPasswordReset(resetEmail)
    if (res.success) {
      setResetStatus('success')
      setResetMessage('Instruções de recuperação enviadas para o seu e-mail.')
    } else {
      setResetStatus('error')
      setResetMessage(res.error || 'Não foi possível enviar o e-mail de recuperação.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0F2A44] flex items-center justify-center text-[#C9A24B] shadow-xl border-2 border-[#C9A24B]/30 mb-4">
            <Scale className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F2A44]">JusCalc</h1>
          <p className="mt-1 text-sm text-[#5A6E82] font-medium">
            SaaS de Simulação e Cálculos Trabalhistas para Advogados
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-[#E2E8F0]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#0F2A44]">Área Reservada</h2>
            <p className="text-sm text-[#5A6E82]">
              Entre com suas credenciais de advogado para acessar seu painel.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-sm text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-semibold text-[#0F2A44]">
                E-mail Profissional
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 h-5" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advogado@juscalc.com.br"
                  className="pl-10 h-11 text-base border-gray-300 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="block text-sm font-semibold text-[#0F2A44]">
                  Senha de Acesso
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetOpen(true)
                    setResetEmail(email)
                    setResetStatus('idle')
                    setResetMessage(null)
                  }}
                  className="text-xs font-semibold text-[#0F2A44] hover:text-[#C9A24B] underline transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 h-5" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11 text-base border-gray-300 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#0F2A44] hover:bg-[#1A3D61] text-white font-bold text-base rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no JusCalc</span>
                    <ArrowRight className="w-4 h-4 text-[#C9A24B]" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Quick Demo Credential Helper */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <div className="bg-[#F4F6F9] rounded-lg p-3 text-xs text-[#0F2A44]">
              <div className="flex items-center justify-between mb-1.5 font-semibold">
                <span className="text-[#0F2A44]">Acesso de Demonstração:</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[#C9A24B] font-bold hover:underline"
                >
                  Preencher dados
                </button>
              </div>
              <p className="text-gray-600">
                E-mail: <code className="font-mono text-[#0F2A44]">advogado@juscalc.com.br</code>
              </p>
              <p className="text-gray-600">
                Senha: <code className="font-mono text-[#0F2A44]">Skip@Pass123</code>
              </p>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <p className="mt-6 text-center text-xs text-[#5A6E82]">
          Plataforma protegida e restrita para advogados. Conexão segura criptografada.
        </p>
      </div>

      {/* Password Reset Modal / Dialog */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-[#0F2A44]">Recuperar Senha</h3>
            <p className="text-xs text-[#5A6E82] mt-1">
              Informe seu e-mail cadastrado. Enviaremos um link seguro para redefinição de senha.
            </p>

            {resetStatus === 'success' ? (
              <div className="my-5 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">E-mail enviado!</p>
                  <p className="text-xs mt-1 text-green-700">{resetMessage}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="mt-4 space-y-4">
                {resetStatus === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{resetMessage}</span>
                  </div>
                )}
                <div>
                  <Label htmlFor="reset-email" className="text-xs font-semibold text-[#0F2A44]">
                    Seu e-mail cadastrado
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="advogado@juscalc.com.br"
                    className="mt-1 h-10 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsResetOpen(false)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={resetStatus === 'loading'}
                    className="flex-1 bg-[#0F2A44] hover:bg-[#1A3D61] text-white font-semibold"
                  >
                    {resetStatus === 'loading' ? 'Enviando...' : 'Enviar Link'}
                  </Button>
                </div>
              </form>
            )}

            {resetStatus === 'success' && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setIsResetOpen(false)}
                  className="bg-[#0F2A44] text-white hover:bg-[#1A3D61]"
                >
                  Entendi e Voltar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
