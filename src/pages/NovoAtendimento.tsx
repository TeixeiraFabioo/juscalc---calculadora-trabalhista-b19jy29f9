import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const NovoAtendimento: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E82] mb-1">
            <span
              onClick={() => navigate('/atendimentos')}
              className="cursor-pointer hover:text-[#0F2A44] hover:underline"
            >
              Atendimentos
            </span>
            <span>/</span>
            <span className="text-[#C9A24B] font-bold">Novo</span>
          </div>

          {/* TÍTULO OBRIGATÓRIO: "Nova Entrevista Trabalhista" */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A44] tracking-tight">
            Nova Entrevista Trabalhista
          </h1>
          <p className="text-sm text-[#5A6E82] mt-0.5">
            Estrutura de coleta de dados contratuais e fatos relevantes para simulação rescisória.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/atendimentos')}
            className="text-xs font-bold text-[#5A6E82] border-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => navigate('/resultado')}
            className="bg-[#0F2A44] hover:bg-[#1A3D61] text-white text-xs font-bold flex items-center gap-1.5"
          >
            <span>Ver Prévia do Resultado</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C9A24B]" />
          </Button>
        </div>
      </div>

      {/* Info notice explaining v1 scope */}
      <div className="p-4 bg-[#E8D5A3]/25 border border-[#C9A24B]/40 rounded-xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#C9A24B] flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[#0F2A44]">
          <p className="font-bold">Estrutura Visual Pronta para a Próxima Etapa</p>
          <p className="text-[#5A6E82] mt-0.5">
            Esta tela já possui os blocos e seções estruturados para receber os campos dinâmicos do
            formulário trabalhista e acionar os motores de cálculo no próximo passo.
          </p>
        </div>
      </div>

      {/* Structured Sections Blueprint */}
      <div className="space-y-5">
        {/* Bloco 1: Dados do Trabalhador e da Reclamada */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-[#0F2A44] text-[#C9A24B] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F2A44]">
                Qualificação das Partes
              </h2>
              <p className="text-xs text-[#5A6E82]">
                Identificação do reclamante e da empresa empregadora.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#F4F6F9] border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F2A44]">
                <User className="w-4 h-4 text-[#C9A24B]" />
                <span>Dados do Reclamante (Trabalhador)</span>
              </div>
              <p className="text-xs text-gray-500">
                Nome completo, CPF, cargo/função desempenhada e dados de contato.
              </p>
              <div className="pt-2 text-[11px] font-mono text-gray-400 italic">
                [Campos de identificação aguardando formulário]
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F6F9] border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F2A44]">
                <Building2 className="w-4 h-4 text-[#C9A24B]" />
                <span>Dados da Reclamada (Empresa)</span>
              </div>
              <p className="text-xs text-gray-500">
                Razão social, CNPJ, ramo de atividade e porte da empresa.
              </p>
              <div className="pt-2 text-[11px] font-mono text-gray-400 italic">
                [Campos da empresa aguardando formulário]
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2: Vínculo Empregatício e Datas */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-[#0F2A44] text-[#C9A24B] flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F2A44]">
                Datas Contratuais & Modalidade de Rescisão
              </h2>
              <p className="text-xs text-[#5A6E82]">
                Definição do período laborado para apuração de prescrição e reflexos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#F4F6F9] border border-gray-200/80">
              <span className="text-xs font-bold text-[#0F2A44] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C9A24B]" />
                Admissão & Demissão
              </span>
              <p className="text-[11px] text-gray-500 mt-1">Data inicial e término do contrato</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4F6F9] border border-gray-200/80">
              <span className="text-xs font-bold text-[#0F2A44] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C9A24B]" />
                Motivo da Rescisão
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                Sem justa causa, pedido, justa causa ou rescisão indireta
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4F6F9] border border-gray-200/80">
              <span className="text-xs font-bold text-[#0F2A44] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C9A24B]" />
                Aviso Prévio
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                Trabalhado ou indenizado (Lei 12.506/11)
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 3: Remuneração, Jornada e Pedidos */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-[#0F2A44] text-[#C9A24B] flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F2A44]">
                Remuneração e Verbas Pleiteadas
              </h2>
              <p className="text-xs text-[#5A6E82]">
                Base de cálculo salarial, adicionais e pedidos especiais.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#F4F6F9] border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F2A44]">
                <DollarSign className="w-4 h-4 text-[#C9A24B]" />
                <span>Salário Base & Comissões</span>
              </div>
              <p className="text-xs text-gray-500">
                Última remuneração, salário por fora, adicionais noturno, insalubridade ou
                periculosidade.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F6F9] border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F2A44]">
                <Clock className="w-4 h-4 text-[#C9A24B]" />
                <span>Jornada & Horas Extras</span>
              </div>
              <p className="text-xs text-gray-500">
                Horários de entrada/saída, intervalo intrajornada e domingos/feriados laborados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA to move to calculations screen */}
      <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#5A6E82]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Estrutura visual preparada conforme o plano v1 aprovado.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto text-xs font-bold text-[#5A6E82]"
          >
            Voltar ao Dashboard
          </Button>

          <Button
            onClick={() => navigate('/resultado')}
            className="w-full sm:w-auto bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] font-extrabold text-sm py-2.5 px-5 rounded-lg shadow-md flex items-center justify-center gap-2"
          >
            <span>Avançar para Tela de Resultado</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
