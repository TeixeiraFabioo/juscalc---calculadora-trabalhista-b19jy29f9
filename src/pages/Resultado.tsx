import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calculator,
  ArrowLeft,
  FileCheck,
  Download,
  Share2,
  DollarSign,
  Scale,
  Sparkles,
  Info,
  Calendar,
  User,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Resultado: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E82] mb-1">
            <span
              onClick={() => navigate('/atendimentos')}
              className="cursor-pointer hover:text-[#0F2A44] hover:underline"
            >
              Atendimentos
            </span>
            <span>/</span>
            <span className="text-[#C9A24B] font-bold">Resultado</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A44] tracking-tight flex items-center gap-2.5">
            <Calculator className="w-7 h-7 text-[#C9A24B]" />
            Resultado da Simulação Trabalhista
          </h1>
          <p className="text-sm sm:text-base text-[#5A6E82] mt-0.5">
            Quadro analítico estruturado para apuração de verbas rescisórias e pedidos da inicial.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => navigate('/novo-atendimento')}
            className="text-xs font-bold text-[#0F2A44] border-gray-300"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar à Entrevista</span>
          </Button>

          <Button
            disabled
            className="bg-[#0F2A44] text-white text-xs font-bold flex items-center gap-1.5 opacity-70"
            title="Exportação disponível na próxima etapa"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </Button>
        </div>
      </div>

      {/* Scope banner */}
      <div className="p-4 bg-[#E8D5A3]/25 border border-[#C9A24B]/40 rounded-xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#C9A24B] flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[#0F2A44]">
          <p className="font-bold">Área Reservada: Estrutura e Layout Prontos</p>
          <p className="text-[#5A6E82] mt-0.5">
            Conforme planejado no escopo v1, esta tela exibe o layout definitivo de apresentação dos
            cálculos (resumo geral, tabela de verbas, reflexos de FGTS e demonstrativo líquido),
            pronta para a injeção dos motores de cálculo.
          </p>
        </div>
      </div>

      {/* Main KPI Totals Summary (Blueprint) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Bruto Estimado */}
        <Card className="bg-[#0F2A44] text-white border-none shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <span className="text-xs uppercase tracking-wider text-[#C9A24B] font-bold">
              Total Bruto Estimado
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
              R$ --.---,--
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Soma total de todas as verbas rescisórias apuradas
            </p>
          </CardContent>
        </Card>

        {/* FGTS + Multa de 40% */}
        <Card className="bg-white border-2 border-gray-200 shadow-md rounded-2xl">
          <CardContent className="p-5">
            <span className="text-xs uppercase tracking-wider text-[#5A6E82] font-bold">
              FGTS + Multa de 40%
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-[#0F2A44] tracking-tight">
              R$ --.---,--
            </div>
            <p className="text-xs text-[#5A6E82] mt-1">
              Depósitos não recolhidos + indenização rescisória
            </p>
          </CardContent>
        </Card>

        {/* Honorários Sucumbenciais / Contratuais */}
        <Card className="bg-white border-2 border-gray-200 shadow-md rounded-2xl">
          <CardContent className="p-5">
            <span className="text-xs uppercase tracking-wider text-[#C9A24B] font-bold">
              Honorários Estimados (20%)
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-[#C9A24B] tracking-tight">
              R$ --.---,--
            </div>
            <p className="text-xs text-[#5A6E82] mt-1">
              Expectativa de honorários advocatícios do escritório
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Case Header Details (Pre-structured preview) */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F2A44] mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#C9A24B]" />
          Parâmetros do Atendimento
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-[#F4F6F9] rounded-xl">
            <span className="text-gray-500 block">Reclamante</span>
            <span className="font-bold text-[#0F2A44] text-sm">[Aguardando entrevista]</span>
          </div>
          <div className="p-3 bg-[#F4F6F9] rounded-xl">
            <span className="text-gray-500 block">Reclamada</span>
            <span className="font-bold text-[#0F2A44] text-sm">[Aguardando entrevista]</span>
          </div>
          <div className="p-3 bg-[#F4F6F9] rounded-xl">
            <span className="text-gray-500 block">Período Contratual</span>
            <span className="font-bold text-[#0F2A44] text-sm">--/--/---- a --/--/----</span>
          </div>
          <div className="p-3 bg-[#F4F6F9] rounded-xl">
            <span className="text-gray-500 block">Modalidade Rescisória</span>
            <span className="font-bold text-[#0F2A44] text-sm">Dispensa sem justa causa</span>
          </div>
        </div>
      </div>

      {/* Analytical Verbas Table Layout */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F2A44]">
              Quadro Demonstrativo de Verbas Rescisórias
            </h2>
            <p className="text-xs text-[#5A6E82]">
              Estrutura discriminada das verbas apuradas conforme a CLT e legislação vigente.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            Aguardando Cálculos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#0F2A44] text-white">
                <th className="py-3 px-4 font-bold">Verba Rescisória</th>
                <th className="py-3 px-4 font-bold">Fundamento Legal</th>
                <th className="py-3 px-4 font-bold">Base / Proporção</th>
                <th className="py-3 px-4 font-bold text-right">Valor Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium text-[#0F2A44]">
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">Saldo de Salário</td>
                <td className="py-3 px-4 text-gray-500">Art. 462 da CLT</td>
                <td className="py-3 px-4 text-gray-500">Dias trabalhados no mês</td>
                <td className="py-3 px-4 text-right font-mono text-gray-400">R$ --,--</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">Aviso Prévio Indenizado</td>
                <td className="py-3 px-4 text-gray-500">Lei nº 12.506/2011</td>
                <td className="py-3 px-4 text-gray-500">30 a 90 dias proporcionais</td>
                <td className="py-3 px-4 text-right font-mono text-gray-400">R$ --,--</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">13º Salário Proporcional</td>
                <td className="py-3 px-4 text-gray-500">Lei nº 4.090/1962</td>
                <td className="py-3 px-4 text-gray-500">Meses trabalhados no ano (avos)</td>
                <td className="py-3 px-4 text-right font-mono text-gray-400">R$ --,--</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">Férias Vencidas + 1/3 Constitucional</td>
                <td className="py-3 px-4 text-gray-500">Art. 134 e 142 da CLT / Art. 7º CF</td>
                <td className="py-3 px-4 text-gray-500">Período aquisitivo completo</td>
                <td className="py-3 px-4 text-right font-mono text-gray-400">R$ --,--</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">
                  Férias Proporcionais + 1/3 Constitucional
                </td>
                <td className="py-3 px-4 text-gray-500">Art. 146 e 147 da CLT</td>
                <td className="py-3 px-4 text-gray-500">Proporção dos avos indenizados</td>
                <td className="py-3 px-4 text-right font-mono text-gray-400">R$ --,--</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">Multa Rescisória de 40% do FGTS</td>
                <td className="py-3 px-4 text-gray-500">Art. 18, §1º da Lei nº 8.036/1990</td>
                <td className="py-3 px-4 text-gray-500">40% sobre o saldo total devido</td>
                <td className="py-3 px-4 text-right font-mono text-gray-400">R$ --,--</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">Horas Extras + Adicional (50% e 100%)</td>
                <td className="py-3 px-4 text-gray-500">Art. 59 da CLT e Súmula 376 TST</td>
                <td className="py-3 px-4 text-gray-500">Excesso além da 8ª diária / 44ª semanal</td>
                <td className="py-3 px-4 text-right font-mono text-gray-400">R$ --,--</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-[#F4F6F9] border-t-2 border-[#0F2A44] font-bold text-[#0F2A44]">
                <td colSpan={3} className="py-4 px-4 text-right uppercase tracking-wider text-xs">
                  Total Geral Estimado:
                </td>
                <td className="py-4 px-4 text-right text-base sm:text-lg font-black text-[#0F2A44]">
                  R$ --.---,--
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer Nav Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200">
        <p className="text-xs text-[#5A6E82]">
          Tabela parametrizada com os fundamentos trabalhistas para a próxima etapa de cálculos.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/novo-atendimento')}
            className="text-xs font-bold text-[#0F2A44]"
          >
            Editar Entrevista
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] text-xs font-extrabold"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
