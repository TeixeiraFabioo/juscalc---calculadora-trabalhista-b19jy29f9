import React from 'react'
import type { AtendimentoForm, Select } from '@/types/atendimento'
import { Field, TextInput, SelectInput, Checkbox } from './fields'
import { MOTIVO_RECONHECIMENTO } from './Step1Contrato'

interface StepProps {
  form: AtendimentoForm
  set: <K extends keyof AtendimentoForm>(key: K, value: AtendimentoForm[K]) => void
  errors: Record<string, string>
}

export const SituacoesFgts = [
  'Depositado corretamente',
  'Não depositava nada',
  'Depositava apenas alguns meses',
] as const

export const Step3Verbas: React.FC<StepProps> = ({ form, set, errors }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-[#0F2A44]">
          Etapa 3 — Verbas, FGTS e Adicionais
        </h2>
        <p className="text-xs text-[#5A6E82] mt-0.5">
          Situação do FGTS e adicionais/pedidos que devem entrar na simulação.
        </p>
      </div>

      <Field label="Situação do FGTS" required error={errors.situacao_fgts}>
        <SelectInput
          value={form.situacao_fgts}
          onChange={(e) => set('situacao_fgts', e.target.value as Select)}
          error={errors.situacao_fgts}
        >
          <option value="">Selecione a situação do FGTS…</option>
          {SituacoesFgts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectInput>
      </Field>

      <div className="space-y-3">
        <p className="text-xs font-bold text-[#0F2A44]">
          Adicionais e verbas (marque os que se aplicam)
        </p>

        {/* Adicional Noturno */}
        <div className="rounded-xl border border-gray-200 bg-[#F4F6F9] p-3.5 space-y-2.5">
          <Checkbox
            label="Adicional Noturno (média de horas trabalhadas entre 22h e 5h por semana)"
            checked={form.tem_adicional_noturno}
            onChange={(v) => set('tem_adicional_noturno', v)}
          />
          {form.tem_adicional_noturno && (
            <Field
              label="Média de horas noturnas por semana"
              required
              error={errors.horas_noturnas_semana}
            >
              <TextInput
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                value={form.horas_noturnas_semana}
                onChange={(e) => set('horas_noturnas_semana', e.target.value)}
                placeholder="Ex.: 10"
                error={errors.horas_noturnas_semana}
              />
            </Field>
          )}
        </div>

        {/* Insalubridade */}
        <div className="rounded-xl border border-gray-200 bg-[#F4F6F9] p-3.5 space-y-2.5">
          <Checkbox
            label="Insalubridade"
            checked={form.tem_insalubridade}
            onChange={(v) => set('tem_insalubridade', v)}
          />
          {form.tem_insalubridade && (
            <Field label="Grau de insalubridade" required error={errors.grau_insalubridade}>
              <SelectInput
                value={form.grau_insalubridade}
                onChange={(e) => set('grau_insalubridade', e.target.value)}
                error={errors.grau_insalubridade}
              >
                <option value="">Selecione o grau…</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
                <option value="40">40%</option>
              </SelectInput>
            </Field>
          )}
        </div>

        {/* Periculosidade */}
        <div className="rounded-xl border border-gray-200 bg-[#F4F6F9] p-3.5 space-y-2.5">
          <Checkbox
            label="Periculosidade (30%)"
            checked={form.tem_periculosidade}
            onChange={(v) => set('tem_periculosidade', v)}
          />
        </div>

        {/* Férias vencidas */}
        <div className="rounded-xl border border-gray-200 bg-[#F4F6F9] p-3.5 space-y-2.5">
          <Checkbox
            label="Férias vencidas não gozadas"
            checked={form.tem_ferias_vencidas}
            onChange={(v) => set('tem_ferias_vencidas', v)}
          />
          {form.tem_ferias_vencidas && (
            <Field
              label="Quantidade de períodos"
              hint="1 ou 2 períodos"
              required
              error={errors.periodos_ferias}
            >
              <SelectInput
                value={form.periodos_ferias}
                onChange={(e) => set('periodos_ferias', e.target.value)}
                error={errors.periodos_ferias}
              >
                <option value="">Selecione…</option>
                <option value="1">1 período</option>
                <option value="2">2 períodos</option>
              </SelectInput>
            </Field>
          )}
        </div>

        {/* Descontos indevidos */}
        <div className="rounded-xl border border-gray-200 bg-[#F4F6F9] p-3.5 space-y-2.5">
          <Checkbox
            label="Descontos indevidos no salário"
            checked={form.tem_descontos_indevidos}
            onChange={(v) => set('tem_descontos_indevidos', v)}
          />
          {form.tem_descontos_indevidos && (
            <Field label="Valor total dos descontos (R$)" required error={errors.valor_descontos}>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.valor_descontos}
                onChange={(e) => set('valor_descontos', e.target.value)}
                placeholder="Ex.: 300,00"
                error={errors.valor_descontos}
              />
            </Field>
          )}
        </div>

        {/* Dano moral */}
        <div className="rounded-xl border border-gray-200 bg-[#F4F6F9] p-3.5 space-y-2.5">
          <Checkbox
            label="Dano Moral / Assédio"
            checked={form.tem_dano_moral}
            onChange={(v) => set('tem_dano_moral', v)}
          />
          {form.tem_dano_moral && (
            <Field label="Valor sugerido a arbitrar (R$)" required error={errors.valor_dano_moral}>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.valor_dano_moral}
                onChange={(e) => set('valor_dano_moral', e.target.value)}
                placeholder="Ex.: 5000,00"
                error={errors.valor_dano_moral}
              />
            </Field>
          )}
        </div>
      </div>

      {/* Multa Art. 467 — desligado por padrão */}
      <div className="rounded-xl border border-[#C9A24B]/50 bg-[#E8D5A3]/25 p-3.5 space-y-2">
        <Checkbox
          label="Incluir estimativa de Multa Art. 467"
          checked={form.incluir_multa_467}
          onChange={(v) => set('incluir_multa_467', v)}
        />
        <p className="text-[11px] font-semibold text-[#8A6A1F] flex items-center gap-1.5">
          ⚠ Apenas se houver verbas rescisórias incontroversas
        </p>
      </div>

      {/* Multa Art. 479 — contrato verbal sem registro (Reconhecimento de Vínculo) */}
      {form.motivo_saida === MOTIVO_RECONHECIMENTO && (
        <div className="rounded-xl border border-[#C9A24B]/50 bg-[#E8D5A3]/25 p-3.5 space-y-2">
          <Checkbox
            label="Incluir multa do Art. 479 da CLT (multa de até 2 salários quando o contrato verbal durou mais de 12 meses sem registro)"
            checked={form.incluir_multa_479}
            onChange={(v) => set('incluir_multa_479', v)}
          />
          <p className="text-[11px] font-semibold text-[#8A6A1F] flex items-center gap-1.5">
            ⚠ Aplicada apenas se o período de trabalho sem registro for maior que 12 meses
          </p>
        </div>
      )}
    </div>
  )
}
