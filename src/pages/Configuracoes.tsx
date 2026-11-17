import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Shield, LogOut, CheckCircle2, Loader2, Cloud, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { GestaoEquipe } from '@/components/admin/GestaoEquipe'
import { CorpoConfiguracoes } from '@/components/configuracoes/CorpoConfiguracoes'
import {
  carregarConfigCompleta,
  salvarConfiguracoes,
  PADROES_PAINEL,
  type ConfigPainel,
} from '@/services/configuracoes'

const ADMIN_EMAIL = 'fabio.saantost@gmail.com'

export const Configuracoes: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const ehAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL

  // Configurações do escritório (nuvem)
  const [cfg, setCfg] = useState<ConfigPainel | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [restaurando, setRestaurando] = useState(false)
  const [confirmarRestaurar, setConfirmarRestaurar] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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
      const salvo = await salvarConfiguracoes({ ...PADROES_PAINEL })
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

      {!cfg ? (
        <div className="flex items-center justify-center py-12 text-sm text-[#5A6E82]">
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A24B] mr-2" />
          Carregando configurações…
        </div>
      ) : ehAdmin ? (
        <Tabs defaultValue="escritorio" className="space-y-6">
          <TabsList className="h-auto w-full sm:w-auto flex flex-col sm:flex-row gap-1 bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm">
            <TabsTrigger
              value="escritorio"
              className="text-xs sm:text-sm font-bold text-[#5A6E82] data-[state=active]:bg-[#0F2A44] data-[state=active]:text-white rounded-lg px-4 py-2"
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Escritório
            </TabsTrigger>
            <TabsTrigger
              value="equipe"
              className="text-xs sm:text-sm font-bold text-[#5A6E82] data-[state=active]:bg-[#0F2A44] data-[state=active]:text-white rounded-lg px-4 py-2"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Gestão de Equipe / Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="escritorio">
            <CorpoConfiguracoes
              cfg={cfg}
              email={user?.email ?? ''}
              salvando={salvando}
              restaurando={restaurando}
              isResetting={false}
              onSet={set}
              onSubmit={(e) => {
                e.preventDefault()
                void handleSalvar(e)
              }}
              onPedirRestaurar={() => setConfirmarRestaurar(true)}
              onExportar={handleExportar}
              onImportar={(f) => void handleImportar(f)}
              onPasswordReset={() => {}}
            />
          </TabsContent>

          <TabsContent value="equipe">
            <GestaoEquipe />
          </TabsContent>
        </Tabs>
      ) : (
        <CorpoConfiguracoes
          cfg={cfg}
          email={user?.email ?? ''}
          salvando={salvando}
          restaurando={restaurando}
          isResetting={false}
          onSet={set}
          onSubmit={(e) => {
            e.preventDefault()
            void handleSalvar(e)
          }}
          onPedirRestaurar={() => setConfirmarRestaurar(true)}
          onExportar={handleExportar}
          onImportar={(f) => void handleImportar(f)}
          onPasswordReset={() => {}}
        />
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
