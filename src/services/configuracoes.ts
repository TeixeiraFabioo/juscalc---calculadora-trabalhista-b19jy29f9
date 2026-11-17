/**
 * Configurações do escritório (constantes editáveis do motor de cálculo + painel).
 * Um registro por usuário na coleção `configuracoes_escritorio`.
 * Fallback: defaults do escopo (CONFIG_PADRAO).
 */

import pb from '@/lib/pocketbase/client'
import { CONFIG_PADRAO, type ConfiguracoesCalculo } from '@/lib/calculo'

export interface ConfigEscritorio extends ConfiguracoesCalculo {
  id: string
  user: string
}

/** Campos editáveis na tela de Configurações (BLOCO 7). */
export interface ConfigPainel {
  nome_escritorio: string
  numero_oab: string
  percentual_honorarios: number
  salario_minimo: number
  teto_seguro_desemprego: number
  divisor_padrao: number
  texto_rodape: string
  mensagem_whatsapp: string
}

/** Defaults exigidos pelo escopo (usados em "Restaurar Padrões"). */
export const PADROES_PAINEL: ConfigPainel = {
  nome_escritorio: '',
  numero_oab: '',
  percentual_honorarios: 30,
  salario_minimo: CONFIG_PADRAO.salario_minimo,
  teto_seguro_desemprego: CONFIG_PADRAO.teto_seguro_desemprego,
  divisor_padrao: CONFIG_PADRAO.divisor_padrao,
  texto_rodape:
    'Documento gerado pelo JusCalc — simulação estimativa baseada nos dados informados. Não substitui a análise jurídica do caso concreto.',
  mensagem_whatsapp:
    'Olá! Preparamos a simulação dos seus direitos trabalhistas. Para avançarmos, preciso dos documentos do checklist anexo. Qualquer dúvida, estou à disposição!',
}

const COLLECTION = 'configuracoes_escritorio'

interface ConfigRecord extends Record<string, unknown> {
  id: string
  user: string
  nome_escritorio?: string
  numero_oab?: string
  percentual_honorarios?: number
  salario_minimo?: number
  teto_seguro_desemprego?: number
  divisor_padrao?: number
  texto_rodape?: string
  mensagem_whatsapp?: string
}

const num = (v: unknown, fallback: number): number => {
  const n = Number(v)
  return Number.isFinite(n) && v !== null && v !== undefined && v !== '' ? n : fallback
}

const txt = (v: unknown, fallback = ''): string =>
  typeof v === 'string' && v.trim() !== '' ? v : fallback

function recordToPainel(rec: ConfigRecord): ConfigPainel {
  return {
    nome_escritorio: rec.nome_escritorio ?? '',
    numero_oab: rec.numero_oab ?? '',
    percentual_honorarios: num(rec.percentual_honorarios, PADROES_PAINEL.percentual_honorarios),
    salario_minimo: num(rec.salario_minimo, PADROES_PAINEL.salario_minimo),
    teto_seguro_desemprego: num(rec.teto_seguro_desemprego, PADROES_PAINEL.teto_seguro_desemprego),
    divisor_padrao: num(rec.divisor_padrao, PADROES_PAINEL.divisor_padrao),
    texto_rodape: txt(rec.texto_rodape, PADROES_PAINEL.texto_rodape),
    mensagem_whatsapp: txt(rec.mensagem_whatsapp, PADROES_PAINEL.mensagem_whatsapp),
  }
}

/** Payload de criação/atualização a partir do formulário. */
export function painelToPayload(dados: ConfigPainel, userId: string): Record<string, unknown> {
  return {
    user: userId,
    nome_escritorio: dados.nome_escritorio.trim(),
    numero_oab: dados.numero_oab.trim(),
    percentual_honorarios: num(dados.percentual_honorarios, PADROES_PAINEL.percentual_honorarios),
    salario_minimo: num(dados.salario_minimo, PADROES_PAINEL.salario_minimo),
    teto_seguro_desemprego: num(
      dados.teto_seguro_desemprego,
      PADROES_PAINEL.teto_seguro_desemprego,
    ),
    divisor_padrao: num(dados.divisor_padrao, PADROES_PAINEL.divisor_padrao),
    texto_rodape: dados.texto_rodape,
    mensagem_whatsapp: dados.mensagem_whatsapp,
  }
}

/** Carrega as configurações do usuário logado; cria com os defaults se não existir. */
export async function carregarConfigCompleta(): Promise<ConfigPainel> {
  const userId = pb.authStore.record?.id ?? ''
  try {
    const rec = await pb.collection(COLLECTION).getFirstListItem<ConfigRecord>(`user = "${userId}"`)
    return recordToPainel(rec)
  } catch {
    // Sem registro ainda: tenta criar com os defaults; se falhar (ex.: sem auth),
    // usa os defaults em memória para não bloquear a tela.
    try {
      const rec = await pb
        .collection(COLLECTION)
        .create<ConfigRecord>(painelToPayload(PADROES_PAINEL, userId))
      return recordToPainel(rec)
    } catch {
      return { ...PADROES_PAINEL }
    }
  }
}

/** Salva (cria ou atualiza) as configurações do escritório na nuvem. */
export async function salvarConfiguracoes(dados: ConfigPainel): Promise<ConfigPainel> {
  const userId = pb.authStore.record?.id ?? ''
  try {
    const rec = await pb.collection(COLLECTION).getFirstListItem<ConfigRecord>(`user = "${userId}"`)
    const atualizado = await pb
      .collection(COLLECTION)
      .update<ConfigRecord>(rec.id, painelToPayload(dados, userId))
    return recordToPainel(atualizado)
  } catch (err) {
    if (err instanceof Error && err.message.includes('404')) {
      const rec = await pb
        .collection(COLLECTION)
        .create<ConfigRecord>(painelToPayload(dados, userId))
      return recordToPainel(rec)
    }
    throw err
  }
}

/** Carrega apenas os parâmetros numéricos do motor de cálculo (usado pela entrevista). */
export async function carregarConfiguracoes(): Promise<ConfiguracoesCalculo> {
  const painel = await carregarConfigCompleta()
  return {
    salario_minimo: painel.salario_minimo,
    divisor_padrao: painel.divisor_padrao,
    percentual_dsr: CONFIG_PADRAO.percentual_dsr,
    percentual_fgts: CONFIG_PADRAO.percentual_fgts,
    multa_fgts: CONFIG_PADRAO.multa_fgts,
    teto_seguro_desemprego: painel.teto_seguro_desemprego,
  }
}
