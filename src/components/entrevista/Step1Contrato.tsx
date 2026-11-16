import React from 'react'
import type { AtendimentoForm, Select } from '@/types/atendimento'
import { Field, TextInput, SelectInput, RadioGroup, Checkbox } from './fields'

interface StepProps {
  form: AtendimentoForm
  set: <K extends keyof AtendimentoForm>(key: K, value: AtendimentoForm[K]) => void
  errors: Record<string, string>
}

export const MotivosSaida = [
  'Demissão sem justa causa',
  'Pedido de demissão',
  'Justa causa',
  'Acordo (Art. 484-A)',
  'Ainda trabalhando',
  'Rescisão Indireta - Ainda trabalhando',
  'Rescisão Indireta - Já saiu',
] as const

/** Opções exatas de falta grave da empresa (BLOCO 5 — Rescisão Indireta). */
export const FaltasGraves = [
  'Atraso frequente de salários',
  'Falta de depósito do FGTS',
  'Horas extras não pagas',
  'Assédio moral / Humilhações',
  'Desvio ou acúmulo de função',
  'Falta de EPI / Risco grave',
  'Outro',
] as const

export const Step1Contrato: React.FC<StepProps> = ({ form, set, errors }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-[#0F2A44]">
          Etapa 1 — Dados do Contrato e Rescisão
        </h2>
        <p className="text-xs text-[#5A6E82] mt-0.5">
          Identificação das partes e situação da rescisão do contrato de trabalho.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome completo do cliente" required error={errors.cliente_nome}>
          <TextInput
            value={form.cliente_nome}
            onChange={(e) => set('cliente_nome', e.target.value)}
            placeholder="Ex.: João da Silva"
            error={errors.cliente_nome}
          />
        </Field>

        <Field label="CPF" required error={errors.cliente_cpf}>
          <TextInput
            value={form.cliente_cpf}
            onChange={(e) => set('cliente_cpf', e.target.value)}
            placeholder="000.000.000-00"
            error={errors.cliente_cpf}
          />
        </Field>

        <Field label="Nome da empresa reclamada" required error={errors.empresa_nome}>
          <TextInput
            value={form.empresa_nome}
            onChange={(e) => set('empresa_nome', e.target.value)}
            placeholder="Ex.: Empresa LTDA"
            error={errors.empresa_nome}
          />
        </Field>

        <Field label="CNPJ da empresa" hint="Opcional" error={errors.empresa_cnpj}>
          <TextInput
            value={form.empresa_cnpj}
            onChange={(e) => set('empresa_cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
            error={errors.empresa_cnpj}
          />
        </Field>

        <Field label="Data de admissão" required error={errors.data_admissao}>
          <TextInput
            type="date"
            value={form.data_admissao}
            onChange={(e) => set('data_admissao', e.target.value)}
            error={errors.data_admissao}
          />
        </Field>

        <Field label="Data de saída (ou último dia trabalhado)" required error={errors.data_saida}>
          <TextInput
            type="date"
            value={form.data_saida}
            onChange={(e) => set('data_saida', e.target.value)}
            error={errors.data_saida}
          />
        </Field>
      </div>

      <Field label="Motivo da saída" required error={errors.motivo_saida}>
        <SelectInput
          data-testid="motivo-saida"
          value={form.motivo_saida}
          onChange={(e) => set('motivo_saida', e.target.value)}
          error={errors.motivo_saida}
        >
          <option value="">Selecione o motivo da saída…</option>
          {MotivosSaida.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </SelectInput>
      </Field>

      {(form.motivo_saida === 'Rescisão Indireta - Ainda trabalhando' ||
        form.motivo_saida === 'Rescisão Indireta - Já saiu') && (
        <div className="rounded-xl border-2 border-[#C9A24B] bg-[#C9A24B]/5 p-4 sm:p-5 space-y-4 shadow-sm">
          <div>
            <p className="text-sm font-bold text-[#0F2A44] flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C9A24B]" />
              Faltas graves da empresa (Rescisão Indireta)
            </p>
            <p className="text-[11px] text-[#5A6E82] mt-0.5">
              Marque todos os descumprimentos cometidos pela empresa — eles fundamentam a rescisão
              indireta (Art. 483 da CLT).
            </p>
          </div>

          <div className="space-y-1.5" data-testid="faltas-graves">
            {FaltasGraves.map((falta) => (
              <Checkbox
                key={falta}
                label={falta}
                checked={form.faltas_graves.includes(falta)}
                onChange={(checked) =>
                  set(
                    'faltas_graves',
                    checked
                      ? [...form.faltas_graves, falta]
                      : form.faltas_graves.filter((f) => f !== falta),
                  )
                }
              />
            ))}
          </div>

          <Field label="Data aproximada do último fato grave" error={errors.data_ultimo_fato_grave}>
            <TextInput
              type="date"
              value={form.data_ultimo_fato_grave}
              onChange={(e) => set('data_ultimo_fato_grave', e.target.value)}
              error={errors.data_ultimo_fato_grave}
            />
          </Field>
        </div>
      )}

      <div className="space-y-3">
        <Field label="Recebeu as verbas rescisórias?" required error={errors.verbas_recebidas}>
          <RadioGroup
            name="verbas_recebidas"
            value={form.verbas_recebidas}
            onChange={(v) => set('verbas_recebidas', v as Select)}
            options={[
              { value: 'nao_recebeu_nada', label: 'Não recebeu nada' },
              { value: 'recebeu_parcial', label: 'Recebeu parcial' },
              { value: 'recebeu_tudo', label: 'Recebeu tudo' },
            ]}
            error={errors.verbas_recebidas}
          />
        </Field>

        {(form.verbas_recebidas === 'recebeu_parcial' ||
          form.verbas_recebidas === 'recebeu_tudo') && (
          <Field
            label="Foi pago dentro do prazo de 10 dias?"
            required
            error={errors.pago_prazo_10_dias}
          >
            <RadioGroup
              name="pago_prazo_10_dias"
              value={form.pago_prazo_10_dias}
              onChange={(v) => set('pago_prazo_10_dias', v as Select)}
              options={[
                { value: 'sim', label: 'Sim' },
                { value: 'nao', label: 'Não' },
              ]}
              error={errors.pago_prazo_10_dias}
            />
          </Field>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-[#0F2A44]">
          Já sacou o FGTS anterior ou recebeu guias do Seguro-Desemprego?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Checkbox
            label="Já sacou o FGTS"
            checked={form.ja_sacou_fgts}
            onChange={(v) => set('ja_sacou_fgts', v)}
          />
          <Checkbox
            label="Já recebeu Seguro-Desemprego"
            checked={form.ja_recebeu_seguro_desemprego}
            onChange={(v) => set('ja_recebeu_seguro_desemprego', v)}
          />
        </div>
      </div>
    </div>
  )
}
