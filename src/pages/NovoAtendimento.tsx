import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from '@/hooks/use-toast'
import { ProgressSteps } from '@/components/entrevista/ProgressSteps'
import { Step1Contrato } from '@/components/entrevista/Step1Contrato'
import { Step2Remuneracao } from '@/components/entrevista/Step2Remuneracao'
import { Step3Verbas } from '@/components/entrevista/Step3Verbas'
import { Step4Revisao } from '@/components/entrevista/Step4Revisao'
import {
  loadDraft,
  saveDraft,
  saveResultado,
  recordToForm,
  formToPayload,
} from '@/services/atendimentos'
import { carregarConfiguracoes } from '@/services/configuracoes'
import { calcularTrabalhista } from '@/lib/calculo'
import type { ResultadoCalculo } from '@/lib/calculo'
import type { AtendimentoForm } from '@/types/atendimento'

const STEP_LABELS: [string, string, string, string] = [
  'Contrato e Rescisão',
  'Remuneração e Jornada',
  'Verbas e Adicionais',
  'Revisão',
]

const emptyForm: AtendimentoForm = {
  step: 1,
  cliente_nome: '',
  cliente_cpf: '',
  empresa_nome: '',
  empresa_cnpj: '',
  data_admissao: '',
  data_saida: '',
  motivo_saida: '',
  verbas_recebidas: '',
  pago_prazo_10_dias: '',
  ja_sacou_fgts: false,
  ja_recebeu_seguro_desemprego: false,
  ultimo_salario: '',
  recebia_por_fora: '',
  valor_por_fora: '',
  recebia_comissoes: '',
  media_comissoes: '',
  hora_entrada: '',
  hora_saida: '',
  minutos_intervalo: '',
  dias_semana: '',
  horas_extras_uteis: '',
  horas_extras_domingo: '',
  situacao_fgts: '',
  tem_adicional_noturno: false,
  horas_noturnas_semana: '',
  tem_insalubridade: false,
  grau_insalubridade: '',
  tem_periculosidade: false,
  tem_ferias_vencidas: false,
  periodos_ferias: '',
  tem_descontos_indevidos: false,
  valor_descontos: '',
  tem_dano_moral: false,
  valor_dano_moral: '',
  incluir_multa_467: false,
}

/** Validação básica por etapa: retorna erros por campo. */
function validateStep(form: AtendimentoForm, step: number): Record<string, string> {
  const errors: Record<string, string> = {}
  const req = (key: string, cond: boolean, msg = 'Campo obrigatório') => {
    if (!cond) errors[key] = msg
  }

  if (step === 1) {
    req('cliente_nome', form.cliente_nome.trim() !== '')
    req('cliente_cpf', form.cliente_cpf.trim() !== '')
    req('empresa_nome', form.empresa_nome.trim() !== '')
    req('data_admissao', form.data_admissao !== '')
    req('data_saida', form.data_saida !== '')
    req('motivo_saida', form.motivo_saida !== '')
    req('verbas_recebidas', form.verbas_recebidas !== '')
    if (form.verbas_recebidas === 'recebeu_parcial' || form.verbas_recebidas === 'recebeu_tudo') {
      req('pago_prazo_10_dias', form.pago_prazo_10_dias !== '')
    }
  }

  if (step === 2) {
    req('ultimo_salario', form.ultimo_salario.trim() !== '')
    req('recebia_por_fora', form.recebia_por_fora !== '')
    if (form.recebia_por_fora === 'sim') {
      req('valor_por_fora', form.valor_por_fora.trim() !== '')
    }
    req('recebia_comissoes', form.recebia_comissoes !== '')
    if (form.recebia_comissoes === 'sim') {
      req('media_comissoes', form.media_comissoes.trim() !== '')
    }
    req('hora_entrada', form.hora_entrada !== '')
    req('hora_saida', form.hora_saida !== '')
    req('minutos_intervalo', form.minutos_intervalo !== '')
    req('dias_semana', form.dias_semana !== '')
    if (form.minutos_intervalo !== '' && Number(form.minutos_intervalo) < 0) {
      errors.minutos_intervalo = 'Valor inválido'
    }
    if (form.dias_semana !== '' && !['5', '6'].includes(form.dias_semana)) {
      errors.dias_semana = 'Escolha 5 ou 6 dias'
    }
  }

  if (step === 3) {
    req('situacao_fgts', form.situacao_fgts !== '')
    if (form.tem_adicional_noturno) {
      req('horas_noturnas_semana', form.horas_noturnas_semana.trim() !== '')
    }
    if (form.tem_insalubridade) {
      req('grau_insalubridade', form.grau_insalubridade !== '')
    }
    if (form.tem_ferias_vencidas) {
      req('periodos_ferias', form.periodos_ferias !== '')
    }
    if (form.tem_descontos_indevidos) {
      req('valor_descontos', form.valor_descontos.trim() !== '')
    }
    if (form.tem_dano_moral) {
      req('valor_dano_moral', form.valor_dano_moral.trim() !== '')
    }
  }

  return errors
}

export const NovoAtendimento: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState<AtendimentoForm>(emptyForm)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [recordId, setRecordId] = useState<string | null>(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCalculando, setIsCalculando] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Carregar rascunho existente ao abrir a tela
  useEffect(() => {
    let active = true
    if (!user) {
      setIsLoadingDraft(false)
      return
    }
    loadDraft(user.id)
      .then((record) => {
        if (!active) return
        if (record) {
          setForm(recordToForm(record))
          setStep(record.step ?? 1)
          setRecordId(record.id)
        }
      })
      .catch(() => {
        if (active) setSaveError('Não foi possível carregar o rascunho salvo.')
      })
      .finally(() => {
        if (active) setIsLoadingDraft(false)
      })
    return () => {
      active = false
    }
  }, [user])

  const set = useCallback(<K extends keyof AtendimentoForm>(key: K, value: AtendimentoForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  /** Salva o rascunho no banco (cria na 1ª vez, atualiza depois). */
  const persist = useCallback(
    async (formToSave: AtendimentoForm) => {
      if (!user) return
      setIsSaving(true)
      setSaveError(null)
      try {
        const payloadForm = { ...formToSave, step }
        const { record } = await saveDraft(payloadForm, user.id, recordId)
        setRecordId(record.id)
        return record
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Falha ao salvar o rascunho automaticamente.'
        setSaveError(msg)
        toast({
          title: 'Erro ao salvar rascunho',
          description: msg,
          variant: 'destructive',
        })
      } finally {
        setIsSaving(false)
      }
    },
    [user, recordId, step],
  )

  const goToStep = useCallback(
    async (next: number) => {
      setErrors({})
      setStep(next)
      setForm((prev) => ({ ...prev, step: next }))
      await persist({ ...form, step: next })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [form, persist],
  )

  const handleNext = useCallback(async () => {
    const errs = validateStep(form, step)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    if (step < 4) {
      await goToStep(step + 1)
    }
  }, [form, step, goToStep])

  const handleBack = useCallback(async () => {
    if (step > 1) {
      await goToStep(step - 1)
    } else {
      navigate('/atendimentos')
    }
  }, [step, goToStep, navigate])

  const handleEditSection = useCallback(
    async (targetStep: number) => {
      await goToStep(targetStep)
    },
    [goToStep],
  )

  /** Calcula a simulação, salva o resultado JSON no atendimento e navega para o Resultado. */
  const handleCalcular = useCallback(async () => {
    if (!user || isCalculando) return
    setIsCalculando(true)
    setSaveError(null)
    try {
      // Persiste o estado final da entrevista antes de calcular
      const payloadForm = { ...form, step: 4 }
      const { record } = await saveDraft(payloadForm, user.id, recordId)
      setRecordId(record.id)

      const cfg = await carregarConfiguracoes()
      const resultado: ResultadoCalculo = calcularTrabalhista(form, cfg)
      await saveResultado(record.id, resultado)
      toast({
        title: 'Simulação calculada',
        description: `Total bruto da ação: ${resultado.total_bruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
      })
      navigate(`/resultado?id=${record.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao calcular a simulação.'
      setSaveError(msg)
      toast({ title: 'Erro ao calcular', description: msg, variant: 'destructive' })
    } finally {
      setIsCalculando(false)
    }
  }, [user, form, recordId, isCalculando, navigate])

  const stepProps = { form, set, errors }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-5">
      {/* Cabeçalho */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A44] tracking-tight">
          Nova Entrevista Trabalhista
        </h1>
        <p className="text-sm text-[#5A6E82] mt-0.5">
          Entrevista guiada em 4 etapas para coleta de dados contratuais e fatos relevantes.
        </p>
      </div>

      {/* Barra de progresso — 4 etapas */}
      <ProgressSteps step={step} labels={STEP_LABELS} onStepClick={handleEditSection} />

      {/* Estado de salvamento */}
      {isSaving && (
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E82]">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A24B]" />
          Salvando rascunho…
        </div>
      )}
      {!isSaving && !saveError && recordId && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <Save className="w-3.5 h-3.5" />
          Rascunho salvo automaticamente.
        </div>
      )}
      {saveError && (
        <div className="flex items-start gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{saveError}</span>
        </div>
      )}

      {isLoadingDraft ? (
        <div className="flex items-center justify-center py-16 text-sm text-[#5A6E82]">
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A24B] mr-2" />
          Carregando rascunho…
        </div>
      ) : (
        <>
          {/* Etapas */}
          {step === 1 && <Step1Contrato {...stepProps} />}
          {step === 2 && <Step2Remuneracao {...stepProps} />}
          {step === 3 && <Step3Verbas {...stepProps} />}
          {step === 4 && (
            <Step4Revisao
              form={form}
              onEdit={handleEditSection}
              onCalcular={handleCalcular}
              isCalculando={isCalculando}
            />
          )}

          {/* Navegação Voltar / Próximo */}
          {step < 4 && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSaving}
                className="w-full sm:w-auto text-sm font-bold text-[#5A6E82] border-gray-300 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={isSaving}
                className="w-full sm:flex-1 bg-[#0F2A44] hover:bg-[#1A3D61] text-white text-sm font-bold py-2.5 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {step === 3 ? 'Ir para Revisão' : 'Próximo'}
                <ArrowRight className="w-4 h-4 text-[#C9A24B]" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
