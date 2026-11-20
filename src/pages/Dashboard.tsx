import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calculator,
  Plus,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Scale,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { getAtendimentosDoUsuario } from '@/services/atendimentos'
import type { AtendimentoRecord } from '@/types/atendimento'
import { fmt } from '@/lib/calculo/base'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [atendimentos, setAtendimentos] = useState<AtendimentoRecord[] | null>(null)

  // Dados reais: atendimentos salvos na conta do usuário logado
  useEffect(() => {
    let active = true
    if (!user) {
      setAtendimentos([])
      return
    }
    getAtendimentosDoUsuario(user.id).then((lista) => {
      if (active) setAtendimentos(lista)
    })
    return () => {
      active = false
    }
  }, [user])

  const carregando = atendimentos === null
  const lista = atendimentos ?? []
  const totalSimulations = lista.length
  const totalBruto = lista.reduce(
    (soma, r) =>
      soma + (typeof r.resultado?.total_bruto === 'number' ? r.resultado.total_bruto : 0),
    0,
  )
  const comCalculo = lista.filter((r) => typeof r.resultado?.total_bruto === 'number').length
  const mediaPorAtendimento = comCalculo > 0 ? totalBruto / comCalculo : 0
  const ultimoAtendimento = lista[0]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header section with Welcome & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8D5A3]/40 text-[#0F2A44] border border-[#C9A24B]/30">
              <Sparkles className="w-3 h-3 text-[#C9A24B]" />
              Painel do Advogado
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A44] tracking-tight">
            Olá, {user?.name || 'Dr. Advogado'}
          </h1>
          <p className="text-sm sm:text-base text-[#5A6E82] mt-0.5">
            Visão geral das suas entrevistas e simulações trabalhistas.
          </p>
        </div>

        {/* Botão dourado em destaque "+ Novo Atendimento" */}
        <div className="flex-shrink-0">
          <Button
            onClick={() => navigate('/novo-atendimento')}
            className="w-full sm:w-auto bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] font-extrabold text-base py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 border border-[#B38E3D]"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Novo Atendimento</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards: Total de Simulações e Valor Total Simulado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Total de Simulações */}
        <Card className="bg-white border-2 border-gray-200/80 shadow-md rounded-2xl overflow-hidden hover:border-[#0F2A44]/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A6E82]">
                Total de Simulações
              </span>
              <div className="w-12 h-12 rounded-xl bg-[#0F2A44] text-[#C9A24B] flex items-center justify-center shadow">
                <Calculator className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-[#0F2A44] tracking-tight">
                {carregando ? '…' : totalSimulations}
              </span>
              {comCalculo > 0 && (
                <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {comCalculo} com cálculo
                </span>
              )}
            </div>

            <p className="mt-2 text-xs sm:text-sm text-[#5A6E82]">
              Entrevistas e pré-cálculos trabalhistas registrados no sistema.
            </p>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500">
              <span>
                {carregando
                  ? 'Carregando seus dados…'
                  : totalSimulations === 0
                    ? 'Nenhum atendimento registrado ainda'
                    : `${comCalculo} com simulação calculada`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Valor Total Simulado */}
        <Card className="bg-white border-2 border-gray-200/80 shadow-md rounded-2xl overflow-hidden hover:border-[#C9A24B] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5A6E82]">
                Valor Total Simulado
              </span>
              <div className="w-12 h-12 rounded-xl bg-[#C9A24B] text-[#0F2A44] flex items-center justify-center shadow">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F2A44] tracking-tight">
                {carregando ? '…' : fmt(totalBruto)}
              </span>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-[#5A6E82]">
              Soma dos totais brutos das simulações já calculadas.
            </p>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500">
              <span>Média por atendimento: {carregando ? '…' : fmt(mediaPorAtendimento)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards & Workflow Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0F2A44]">Fluxo de Atendimento JusCalc</h2>
              <p className="text-xs sm:text-sm text-[#5A6E82]">
                Como funciona a estrutura de cálculo trabalhista inteligente
              </p>
            </div>
            <Scale className="w-6 h-6 text-[#C9A24B]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-[#F4F6F9] border border-gray-200/80">
              <div className="w-8 h-8 rounded-full bg-[#0F2A44] text-white flex items-center justify-center text-xs font-bold mb-2">
                1
              </div>
              <h3 className="font-bold text-sm text-[#0F2A44]">Entrevista Trabalhista</h3>
              <p className="text-xs text-gray-600 mt-1">
                Coleta estruturada de dados contratuais, jornada, salários e rescisão.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F6F9] border border-gray-200/80">
              <div className="w-8 h-8 rounded-full bg-[#C9A24B] text-[#0F2A44] flex items-center justify-center text-xs font-bold mb-2">
                2
              </div>
              <h3 className="font-bold text-sm text-[#0F2A44]">Simulação Automática</h3>
              <p className="text-xs text-gray-600 mt-1">
                Apuração de aviso prévio, 13º, férias, FGTS + 40%, horas extras e adicionais.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F6F9] border border-gray-200/80">
              <div className="w-8 h-8 rounded-full bg-[#1A3D61] text-white flex items-center justify-center text-xs font-bold mb-2">
                3
              </div>
              <h3 className="font-bold text-sm text-[#0F2A44]">Resultado & Petição</h3>
              <p className="text-xs text-gray-600 mt-1">
                Quadro analítico de verbas e suporte para embasar a inicial com segurança.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F2A44]/5 p-4 rounded-xl border border-[#0F2A44]/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0F2A44] text-[#C9A24B] flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F2A44]">
                  Próxima etapa: Formulário e Cálculos
                </p>
                <p className="text-xs text-[#5A6E82]">
                  Nesta etapa v1, as estruturas visuais e navegação estão 100% fluidas.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/resultado')}
              className="w-full sm:w-auto text-xs font-bold text-[#0F2A44] border-[#0F2A44] hover:bg-[#0F2A44] hover:text-white"
            >
              Ver Tela de Resultado
            </Button>
          </div>
        </div>

        {/* Right column: Atendimentos shortcut */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[#0F2A44]">Atendimentos</h2>
              <Clock className="w-5 h-5 text-[#5A6E82]" />
            </div>
            <p className="text-xs sm:text-sm text-[#5A6E82]">
              Acesse a lista completa de atendimentos e clientes trabalhistas cadastrados.
            </p>

            <div className="my-5 p-4 rounded-xl bg-[#F4F6F9] border border-dashed border-gray-300 text-center">
              {carregando ? (
                <>
                  <p className="text-xs font-semibold text-[#0F2A44]">Carregando…</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Buscando seus atendimentos salvos.
                  </p>
                </>
              ) : totalSimulations === 0 ? (
                <>
                  <p className="text-xs font-semibold text-[#0F2A44]">Pronto para o 1º registro</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Nenhum atendimento em andamento no momento.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-[#0F2A44]">
                    {totalSimulations === 1
                      ? '1 atendimento registrado'
                      : `${totalSimulations} atendimentos registrados`}
                  </p>
                  {ultimoAtendimento?.cliente_nome && (
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                      Último cliente: {ultimoAtendimento.cliente_nome}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={() => navigate('/atendimentos')}
              variant="outline"
              className="w-full font-bold text-sm text-[#0F2A44] border-gray-300 hover:border-[#0F2A44]"
            >
              Ir para Atendimentos
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5A6E82]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ambiente seguro OAB/LGPD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
