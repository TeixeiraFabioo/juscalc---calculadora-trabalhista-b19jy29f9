import React from 'react'
import type { AtendimentoForm, Select } from '@/types/atendimento'
import { Field, TextInput, RadioGroup } from './fields'

interface StepProps {
  form: AtendimentoForm
  set: <K extends keyof AtendimentoForm>(key: K, value: AtendimentoForm[K]) => void
  errors: Record<string, string>
}

export const Step2Remuneracao: React.FC<StepProps> = ({ form, set, errors }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-[#0F2A44]">
          Etapa 2 — Remuneração e Jornada de Trabalho
        </h2>
        <p className="text-xs text-[#5A6E82] mt-0.5">
          Salário, verbas habituais e rotina de trabalho para base de apuração.
        </p>
      </div>

      <Field label="Último salário bruto em carteira (R$)" required error={errors.ultimo_salario}>
        <TextInput
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form.ultimo_salario}
          onChange={(e) => set('ultimo_salario', e.target.value)}
          placeholder="Ex.: 2500,00"
          error={errors.ultimo_salario}
        />
      </Field>

      <div className="space-y-3">
        <Field label='Recebia salário "por fora"?' required error={errors.recebia_por_fora}>
          <RadioGroup
            name="recebia_por_fora"
            value={form.recebia_por_fora}
            onChange={(v) => set('recebia_por_fora', v as Select)}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'nao', label: 'Não' },
            ]}
            error={errors.recebia_por_fora}
          />
        </Field>

        {form.recebia_por_fora === 'sim' && (
          <Field label="Valor médio mensal por fora (R$)" required error={errors.valor_por_fora}>
            <TextInput
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.valor_por_fora}
              onChange={(e) => set('valor_por_fora', e.target.value)}
              placeholder="Ex.: 1000,00"
              error={errors.valor_por_fora}
            />
          </Field>
        )}
      </div>

      <div className="space-y-3">
        <Field
          label="Recebia comissões/prêmios habituais?"
          required
          error={errors.recebia_comissoes}
        >
          <RadioGroup
            name="recebia_comissoes"
            value={form.recebia_comissoes}
            onChange={(v) => set('recebia_comissoes', v as Select)}
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'nao', label: 'Não' },
            ]}
            error={errors.recebia_comissoes}
          />
        </Field>

        {form.recebia_comissoes === 'sim' && (
          <Field label="Média mensal (R$)" required error={errors.media_comissoes}>
            <TextInput
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.media_comissoes}
              onChange={(e) => set('media_comissoes', e.target.value)}
              placeholder="Ex.: 500,00"
              error={errors.media_comissoes}
            />
          </Field>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-[#0F2A44] mb-2">Jornada habitual</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Hora de entrada" required error={errors.hora_entrada}>
            <TextInput
              type="time"
              value={form.hora_entrada}
              onChange={(e) => set('hora_entrada', e.target.value)}
              error={errors.hora_entrada}
            />
          </Field>

          <Field label="Hora de saída" required error={errors.hora_saida}>
            <TextInput
              type="time"
              value={form.hora_saida}
              onChange={(e) => set('hora_saida', e.target.value)}
              error={errors.hora_saida}
            />
          </Field>

          <Field
            label="Minutos de intervalo de almoço efetivamente usufruídos"
            hint="Ex.: 60 min, 30 min, 0 min"
            required
            error={errors.minutos_intervalo}
          >
            <TextInput
              type="number"
              min="0"
              max="240"
              inputMode="numeric"
              value={form.minutos_intervalo}
              onChange={(e) => set('minutos_intervalo', e.target.value)}
              placeholder="Ex.: 60"
              error={errors.minutos_intervalo}
            />
          </Field>

          <Field label="Dias trabalhados por semana" required error={errors.dias_semana}>
            <select
              value={form.dias_semana}
              onChange={(e) => set('dias_semana', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#0F2A44] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/50 focus:border-[#C9A24B]"
            >
              <option value="">Selecione…</option>
              <option value="5">5 dias</option>
              <option value="6">6 dias</option>
            </select>
          </Field>

          <Field
            label="Média de horas extras em dias úteis (50%) por semana"
            hint="Opcional"
            error={errors.horas_extras_uteis}
          >
            <TextInput
              type="number"
              min="0"
              step="0.5"
              inputMode="decimal"
              value={form.horas_extras_uteis}
              onChange={(e) => set('horas_extras_uteis', e.target.value)}
              placeholder="Ex.: 5"
              error={errors.horas_extras_uteis}
            />
          </Field>

          <Field
            label="Média de horas extras em domingos/feriados (100%) por semana"
            hint="Opcional"
            error={errors.horas_extras_domingo}
          >
            <TextInput
              type="number"
              min="0"
              step="0.5"
              inputMode="decimal"
              value={form.horas_extras_domingo}
              onChange={(e) => set('horas_extras_domingo', e.target.value)}
              placeholder="Ex.: 2"
              error={errors.horas_extras_domingo}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
