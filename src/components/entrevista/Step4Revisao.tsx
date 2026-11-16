import React from 'react'
import { Pencil, Calculator, Lock } from 'lucide-react'
import type { AtendimentoForm } from '@/types/atendimento'

interface Step4Props {
  form: AtendimentoForm
  onEdit: (step: number) => void
}

interface SectionProps {
  title: string
  step: number
  onEdit: (step: number) => void
  children: React.ReactNode
}

const Section: React.FC<SectionProps> = ({ title, step, onEdit, children }) => (
  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-[#F4F6F9] border-b border-gray-200">
      <h3 className="text-sm font-bold text-[#0F2A44]">{title}</h3>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="flex items-center gap-1.5 text-xs font-bold text-[#C9A24B] hover:text-[#0F2A44] transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Editar
      </button>
    </div>
    <dl className="px-4 py-3 space-y-1.5">{children}</dl>
  </div>
)

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
    <dt className="text-xs font-semibold text-[#5A6E82] sm:w-1/2 flex-shrink-0">{label}</dt>
    <dd className="text-sm text-[#0F2A44] font-medium break-words">
      {value === undefined || value === null || value === '' ? (
        <span className="text-gray-400 italic">Não informado</span>
      ) : (
        value
      )}
    </dd>
  </div>
)

const boolLabel = (v: boolean) => (v ? 'Sim' : 'Não')

const fmtBRL = (v: string) => {
  const n = Number(v)
  if (!v || Number.isNaN(n)) return ''
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const verbasLabels: Record<string, string> = {
  nao_recebeu_nada: 'Não recebeu nada',
  recebeu_parcial: 'Recebeu parcial',
  recebeu_tudo: 'Recebeu tudo',
}

const simNaoLabels: Record<string, string> = { sim: 'Sim', nao: 'Não' }

export const Step4Revisao: React.FC<Step4Props> = ({ form, onEdit }) => {
  const insalubreGrau = form.grau_insalubridade ? `${form.grau_insalubridade}%` : ''

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-[#0F2A44]">Etapa 4 — Revisão</h2>
        <p className="text-xs text-[#5A6E82] mt-0.5">
          Confira os dados antes de gerar a simulação. Use "Editar" para ajustar qualquer seção.
        </p>
      </div>

      <Section title="1. Dados do Contrato e Rescisão" step={1} onEdit={onEdit}>
        <Row label="Nome completo do cliente" value={form.cliente_nome} />
        <Row label="CPF" value={form.cliente_cpf} />
        <Row label="Nome da empresa reclamada" value={form.empresa_nome} />
        <Row label="CNPJ (opcional)" value={form.empresa_cnpj} />
        <Row
          label="Data de admissão"
          value={form.data_admissao ? form.data_admissao.split('-').reverse().join('/') : ''}
        />
        <Row
          label="Data de saída (último dia trabalhado)"
          value={form.data_saida ? form.data_saida.split('-').reverse().join('/') : ''}
        />
        <Row label="Motivo da saída" value={form.motivo_saida} />
        <Row
          label="Recebeu as verbas rescisórias?"
          value={form.verbas_recebidas ? verbasLabels[form.verbas_recebidas] : ''}
        />
        {form.pago_prazo_10_dias && (
          <Row
            label="Foi pago dentro do prazo de 10 dias?"
            value={simNaoLabels[form.pago_prazo_10_dias]}
          />
        )}
        <Row label="Já sacou o FGTS" value={boolLabel(form.ja_sacou_fgts)} />
        <Row
          label="Já recebeu Seguro-Desemprego"
          value={boolLabel(form.ja_recebeu_seguro_desemprego)}
        />
      </Section>

      <Section title="2. Remuneração e Jornada de Trabalho" step={2} onEdit={onEdit}>
        <Row label="Último salário bruto em carteira" value={fmtBRL(form.ultimo_salario)} />
        <Row
          label='Recebia salário "por fora"?'
          value={form.recebia_por_fora ? simNaoLabels[form.recebia_por_fora] : ''}
        />
        {form.recebia_por_fora === 'sim' && (
          <Row label="Valor médio mensal por fora" value={fmtBRL(form.valor_por_fora)} />
        )}
        <Row
          label="Recebia comissões/prêmios habituais?"
          value={form.recebia_comissoes ? simNaoLabels[form.recebia_comissoes] : ''}
        />
        {form.recebia_comissoes === 'sim' && (
          <Row label="Média mensal de comissões" value={fmtBRL(form.media_comissoes)} />
        )}
        <Row
          label="Jornada habitual"
          value={
            form.hora_entrada || form.hora_saida
              ? `Das ${form.hora_entrada || '--:--'} às ${form.hora_saida || '--:--'}`
              : ''
          }
        />
        <Row
          label="Intervalo de almoço efetivamente usufruído"
          value={form.minutos_intervalo ? `${form.minutos_intervalo} min` : ''}
        />
        <Row
          label="Dias trabalhados por semana"
          value={form.dias_semana ? `${form.dias_semana} dias` : ''}
        />
        <Row
          label="Média de horas extras (50%) em dias úteis/semana"
          value={form.horas_extras_uteis ? `${form.horas_extras_uteis} h` : ''}
        />
        <Row
          label="Média de horas extras (100%) em domingos/feriados/semana"
          value={form.horas_extras_domingo ? `${form.horas_extras_domingo} h` : ''}
        />
      </Section>

      <Section title="3. Verbas, FGTS e Adicionais" step={3} onEdit={onEdit}>
        <Row label="Situação do FGTS" value={form.situacao_fgts} />
        {form.tem_adicional_noturno && (
          <Row
            label="Adicional Noturno — média de horas noturnas/semana"
            value={form.horas_noturnas_semana ? `${form.horas_noturnas_semana} h` : ''}
          />
        )}
        {form.tem_insalubridade && <Row label="Insalubridade" value={insalubreGrau} />}
        {form.tem_periculosidade && <Row label="Periculosidade" value="30%" />}
        {form.tem_ferias_vencidas && (
          <Row
            label="Férias vencidas não gozadas"
            value={form.periodos_ferias ? `${form.periodos_ferias} período(s)` : 'Sim'}
          />
        )}
        {form.tem_descontos_indevidos && (
          <Row
            label="Descontos indevidos no salário — valor total"
            value={fmtBRL(form.valor_descontos)}
          />
        )}
        {form.tem_dano_moral && (
          <Row
            label="Dano Moral / Assédio — valor sugerido a arbitrar"
            value={fmtBRL(form.valor_dano_moral)}
          />
        )}
        <Row
          label="Incluir estimativa de Multa Art. 467"
          value={boolLabel(form.incluir_multa_467)}
        />
      </Section>

      {/* CTA — sem cálculo nesta entrega */}
      <div className="bg-white rounded-2xl border border-[#C9A24B]/50 shadow-sm p-5 sm:p-6 space-y-3">
        <button
          type="button"
          className="w-full bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] font-extrabold text-sm py-3 px-5 rounded-lg shadow-md flex items-center justify-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          Calcular Simulação
        </button>
        <p className="text-[11px] text-[#5A6E82] flex items-start gap-1.5">
          <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#C9A24B]" />
          <span>
            A simulação será calculada no próximo passo do JusCalc. Nenhum valor de verbas é exibido
            nesta etapa.
          </span>
        </p>
      </div>
    </div>
  )
}
