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

/** Conta avos entre duas datas: mês completo ou fração final ≥ 15 dias = 1 avo (Art. 132 da CLT). */
function avosEntre(inicio: string, fim: string): number {
  const [ai, mi, di] = inicio.split('-').map(Number)
  const [af, mf, df] = fim.split('-').map(Number)
  if (!ai || !mi || !di || !af || !mf || !df) return 0
  if (af < ai || (af === ai && mf < mi) || (af === ai && mf === mi && df < di)) return 0
  let meses = (af - ai) * 12 + (mf - mi)
  if (df < di) meses -= 1
  // Fração do mês incompleto: dias do último "aniversário" mensal até a data final.
  let fracao = df - di
  if (df < di) {
    const anoRef = mf === 1 ? af - 1 : af
    const mesRef = mf === 1 ? 12 : mf - 1
    const diasNoMesRef = new Date(Date.UTC(anoRef, mesRef, 0)).getUTCDate()
    fracao = diasNoMesRef - di + df
  }
  return Math.max(0, meses) + (fracao >= 15 ? 1 : 0)
}

/** Soma N anos a uma data YYYY-MM-DD — 29/02 cai para 28/02 em ano não bissexto. */
function addAnos(data: string, anos: number): string {
  if (!data || !anos) return data
  const [a, m, d] = data.split('-').map(Number)
  if (!a || !m || !d) return data
  const dt = new Date(Date.UTC(a + anos, m - 1, d))
  if (dt.getUTCMonth() + 1 !== m) {
    const ultimo = new Date(Date.UTC(a + anos, m, 0)).getUTCDate()
    return `${a + anos}-${String(m).padStart(2, '0')}-${String(ultimo).padStart(2, '0')}`
  }
  return dt.toISOString().slice(0, 10)
}

/** Avos de 13º no ano civil da data final — de janeiro (ou da admissão, se no mesmo ano) até a
 * data final; cada mês com fração ≥ 15 dias trabalhados = 1 avo, máximo 12 (Lei nº 4.090/1962). */
export function avos13NoAno(dataAdmissao: string, dataFinal: string): number {
  const anoFinal = Number(dataFinal.split('-')[0])
  const anoAdmissao = Number(dataAdmissao.split('-')[0])
  if (!anoFinal || !anoAdmissao) return 0
  const inicio = anoAdmissao === anoFinal ? dataAdmissao : `${anoFinal}-01-01`
  return avosEntre(inicio, dataFinal)
}

/** Avos de férias no período aquisitivo em curso — a partir do último aniversário contratual
 * (dia/mês da admissão); cada mês/fração ≥ 15 dias = 1 avo, máximo 12 (Art. 132 da CLT). */
export function avosFeriasPeriodo(dataAdmissao: string, dataFinal: string): number {
  const anosCompletos = Math.floor(diffMeses(dataAdmissao, dataFinal) / 12)
  const inicioPeriodo = addAnos(dataAdmissao, anosCompletos)
  return avosEntre(inicioPeriodo, dataFinal)
}

/** Soma N dias a uma data YYYY-MM-DD — aritmética puramente em calendário UTC. */
export function addDias(data: string, dias: number): string {
  if (!data) return data
  const [ano, mes, dia] = data.split('-').map(Number)
  if (!ano || !mes || !dia) return data
  const d = new Date(Date.UTC(ano, mes - 1, dia + dias))
  return d.toISOString().slice(0, 10)
}

/** Data de hoje no fuso local, no formato YYYY-MM-DD. */
export function hojeLocalISO(): string {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/** Formata data ISO (YYYY-MM-DD) como DD/MM/AAAA. */
export const fmtData = (iso: string): string => (iso ? iso.split('-').reverse().join('/') : '')

// Referencia o tipo de formulário para manter o vínculo com a entrevista (não remova).
export type { AtendimentoForm }
