/**
 * Tipos do formulário de atendimento (entrevista guiada) e do registro no PocketBase.
 * Nenhuma lógica de cálculo — apenas estrutura de dados.
 */

import type { ResultadoCalculo } from '@/lib/calculo'

/** Valores possíveis dos campos select/radio. */
export type Select =
  | 'nao_recebeu_nada'
  | 'recebeu_parcial'
  | 'recebeu_tudo'
  | 'sim'
  | 'nao'
  | 'depositado_corretamente'
  | 'nao_depositava_nada'
  | 'depositava_alguns_meses'
  | '' // vazio = ainda não respondido

export interface AtendimentoForm {
  // Etapa 1 — Dados do Contrato e Rescisão
  cliente_nome: string
  cliente_cpf: string
  empresa_nome: string
  empresa_cnpj: string
  data_admissao: string // YYYY-MM-DD
  data_saida: string // YYYY-MM-DD
  motivo_saida: string // select (um dos motivos definidos na migração)
  verbas_recebidas: Select // radio: não recebeu nada / parcial / tudo
  pago_prazo_10_dias: Select // sim / não (condicional)
  ja_sacou_fgts: boolean
  ja_recebeu_seguro_desemprego: boolean

  // Rescisão Indireta — faltas graves da empresa (BLOCO 5)
  faltas_graves: string[] // select múltiplo (opções definidas na migração)
  data_ultimo_fato_grave: string // YYYY-MM-DD

  // Etapa 2 — Remuneração e Jornada
  ultimo_salario: string
  recebia_por_fora: Select
  valor_por_fora: string
  recebia_comissoes: Select
  media_comissoes: string
  hora_entrada: string // HH:MM
  hora_saida: string // HH:MM
  minutos_intervalo: string
  dias_semana: string // 5 ou 6
  horas_extras_uteis: string
  horas_extras_domingo: string

  // Etapa 3 — Verbas, FGTS e Adicionais
  situacao_fgts: Select
  tem_adicional_noturno: boolean
  horas_noturnas_semana: string
  tem_insalubridade: boolean
  grau_insalubridade: string // 10 | 20 | 40
  tem_periculosidade: boolean
  tem_ferias_vencidas: boolean
  periodos_ferias: string // 1 ou 2
  tem_descontos_indevidos: boolean
  valor_descontos: string
  tem_dano_moral: boolean
  valor_dano_moral: string
  incluir_multa_467: boolean

  // Controle
  step: number // 1..4
}

export interface AtendimentoRecord {
  id: string
  user: string
  step?: number
  cliente_nome?: string
  cliente_cpf?: string
  empresa_nome?: string
  empresa_cnpj?: string
  data_admissao?: string
  data_saida?: string
  motivo_saida?: string
  verbas_recebidas?: Select
  pago_prazo_10_dias?: Select
  ja_sacou_fgts?: boolean
  ja_recebeu_seguro_desemprego?: boolean
  faltas_graves?: string[]
  data_ultimo_fato_grave?: string
  ultimo_salario?: number
  recebia_por_fora?: Select
  valor_por_fora?: number
  recebia_comissoes?: Select
  media_comissoes?: number
  hora_entrada?: string
  hora_saida?: string
  minutos_intervalo?: number
  dias_semana?: number
  horas_extras_uteis?: number
  horas_extras_domingo?: number
  situacao_fgts?: Select
  tem_adicional_noturno?: boolean
  horas_noturnas_semana?: number
  tem_insalubridade?: boolean
  grau_insalubridade?: number
  tem_periculosidade?: boolean
  tem_ferias_vencidas?: boolean
  periodos_ferias?: number
  tem_descontos_indevidos?: boolean
  valor_descontos?: number
  tem_dano_moral?: boolean
  valor_dano_moral?: number
  incluir_multa_467?: boolean
  checklist_marcados?: { entregues?: string[] } | null
  resultado?: ResultadoCalculo | null
  created?: string
  updated?: string
  expand?: Record<string, unknown>
}
