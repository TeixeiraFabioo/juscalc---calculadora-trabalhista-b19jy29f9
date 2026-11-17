/**
 * Tipos e utilidades base do motor de cálculo trabalhista — JusCalc (BLOCO 3).
 * Nenhuma regra de negócio aqui — apenas estrutura de dados e helpers puros.
 */

import type { AtendimentoForm } from '@/types/atendimento'

/** Parâmetros globais do escritório usados pelo motor de cálculo. */
export interface ConfiguracoesCalculo {
  salario_minimo: number
  divisor_padrao: number
  percentual_dsr: number
  percentual_fgts: number
  multa_fgts: number
  teto_seguro_desemprego: number
}

export const CONFIG_PADRAO: ConfiguracoesCalculo = {
  salario_minimo: 1621,
  divisor_padrao: 220,
  percentual_dsr: 0.1667,
  percentual_fgts: 0.08,
  multa_fgts: 0.4,
  teto_seguro_desemprego: 2518.65,
}

/** Uma verba rescisória apurada pelo motor. */
export interface Verba {
  nome: string
  fundamento: string
  /** Base/proporção utilizada (texto de apresentação). */
  base: string
  valor: number
}

/** Resultado completo do cálculo — gravado como JSON no atendimento. */
export interface ResultadoCalculo {
  verbas: Verba[]
  grupos: { nome: string; subtotal: number }[]
  memoria: string[]
  total_bruto: number
  aviso_seguro_desemprego?: string
  verbas_demissao_sem_justa_causa?: string[]
  parametros: {
    base_salarial: number
    valor_hora: number
    meses_relevantes: number
    aviso_dias: number
    data_final_projetada: string
    prescricao_aplicada: boolean
  }
}

/** Formata um valor como moeda BRL. */
export const fmt = (v: number): string =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Arredonda para 2 casas decimais. */
export const r2 = (v: number): number => Math.round(v * 100) / 100

/** Converte string de input em número (vazio/NaN → fallback, padrão 0). */
export const num = (v: string | number | null | undefined, fallback = 0): number => {
  if (v === null || v === undefined || v === '') return fallback
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : fallback
}

/** Diferença em meses completos entre duas datas YYYY-MM-DD. */
export function diffMeses(inicio: string, fim: string): number {
  const [ai, mi, di] = inicio.split('-').map(Number)
  const [af, mf, df] = fim.split('-').map(Number)
  if (!ai || !mi || !af || !mf) return 0
  let meses = (af - ai) * 12 + (mf - mi)
  if (df !== undefined && di !== undefined && df < di) meses -= 1
  return Math.max(0, meses)
}

/** Avos de 13º/férias no ano aquisitivo em curso (fração ≥ 15 dias = 1 avo). */
export function avosNoAno(dataAdmissao: string, dataFinal: string): number {
  const [aAdm, mAdm, dAdm] = dataAdmissao.split('-').map(Number)
  const [aFim, mFim, dFim] = dataFinal.split('-').map(Number)
  if (!aAdm || !mAdm || !aFim || !mFim) return 0
  // Meses decorridos desde o último aniversário contratual (dia/mês da admissão).
  let meses = (aFim - aAdm) * 12 + (mFim - mAdm)
  if (dFim !== undefined && dAdm !== undefined && dFim < dAdm) meses -= 1
  let avos = meses % 12
  // Fração ≥ 15 dias conta como mês inteiro (Art. 132 da CLT).
  if (dFim !== undefined && dAdm !== undefined && dFim - dAdm >= 15) avos += 1
  return Math.min(12, Math.max(0, avos))
}

/** Soma N dias a uma data YYYY-MM-DD. */
export function addDias(data: string, dias: number): string {
  if (!data) return data
  const d = new Date(`${data}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

/** Formata data ISO (YYYY-MM-DD) como DD/MM/AAAA. */
export const fmtData = (iso: string): string => (iso ? iso.split('-').reverse().join('/') : '')

// Referencia o tipo de formulário para manter o vínculo com a entrevista (não remova).
export type { AtendimentoForm }
