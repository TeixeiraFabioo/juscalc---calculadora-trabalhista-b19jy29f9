/** Tipos, constantes e helpers do motor de cálculo trabalhista (JusCalc). */

export interface ConfiguracoesCalculo {
  salario_minimo: number // SALARIO_MINIMO = 1621.00
  divisor_padrao: number // DIVISOR_PADRAO = 220
  percentual_dsr: number // PERCENTUAL_DSR = 0.1667
  percentual_fgts: number // PERCENTUAL_FGTS = 0.08
  multa_fgts: number // MULTA_FGTS = 0.40
  teto_seguro_desemprego: number // TETO_SEGURO_DESEMPREGO = 2518.65
}

/** Defaults exigidos pelo escopo (usados quando não há registro no banco). */
export const CONFIG_PADRAO: ConfiguracoesCalculo = {
  salario_minimo: 1621.0,
  divisor_padrao: 220,
  percentual_dsr: 0.1667,
  percentual_fgts: 0.08,
  multa_fgts: 0.4,
  teto_seguro_desemprego: 2518.65,
}

export interface Verba {
  nome: string
  fundamento: string
  base: string
  valor: number
}

export interface ResultadoCalculo {
  verbas: Verba[]
  grupos: { nome: string; subtotal: number }[]
  memoria: string[]
  total_bruto: number
  aviso_seguro_desemprego?: string
  /** Verbas que uma demissão sem justa causa gera (o Rescisão Indireta espelha exatamente). */
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

export const fmt = (v: number): string =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const r2 = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100

export const num = (v: string | number | null | undefined, fallback = 0): number => {
  if (v === null || v === undefined || v === '') return fallback
  const n = Number(v)
  return Number.isNaN(n) ? fallback : n
}

/** Diferença em meses inteiros entre duas datas (YYYY-MM-DD). */
export function diffMeses(de: string, ate: string): number {
  const [dY, dM, dD] = de.split('-').map(Number)
  const [aY, aM, aD] = ate.split('-').map(Number)
  let m = (aY - dY) * 12 + (aM - dM)
  if (aD < dD) m -= 1
  return Math.max(0, m)
}

/**
 * Avos do período aquisitivo em curso (fração ≥ 15 dias = mês inteiro),
 * contados do aniversário contratual até o fim projetado com o aviso.
 */
export function avosNoAno(dataAdmissao: string, dataFinalProjetada: string): number {
  const [aY, aM, aD] = dataAdmissao.split('-').map(Number)
  const [fY, fM, fD] = dataFinalProjetada.split('-').map(Number)
  if (fY < aY || (fY === aY && (fM < aM || (fM === aM && fD < aD)))) return 0

  // Avos contados do último aniversário contratual até a data final projetada
  let anos = fY - aY
  if (fM < aM || (fM === aM && fD < aD)) anos -= 1
  if (anos < 0) {
    // antes do primeiro aniversário: conta direto da admissão
    anos = 0
  }
  const inicio = new Date(Date.UTC(aY + anos, aM - 1, aD))
  const fim = new Date(Date.UTC(fY, fM - 1, fD))
  const dias = Math.round((fim.getTime() - inicio.getTime()) / 86400000)
  const avos = Math.floor(dias / 30) + (dias % 30 >= 15 ? 1 : 0)
  return Math.min(12, Math.max(0, avos))
}

export function addDias(dateStr: string, dias: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function fmtData(dataIso: string): string {
  return dataIso.split('-').reverse().join('/')
}
