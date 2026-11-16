/**
 * Configurações do escritório (constantes editáveis do motor de cálculo).
 * Um registro por usuário na coleção `configuracoes_escritorio`.
 * Fallback: defaults do escopo (CONFIG_PADRAO).
 */

import pb from '@/lib/pocketbase/client'
import { CONFIG_PADRAO, type ConfiguracoesCalculo } from '@/lib/calculo'

export interface ConfigEscritorio extends ConfiguracoesCalculo {
  id: string
  user: string
}

/** Carrega as configurações do usuário logado; cria com os defaults se não existir. */
export async function carregarConfiguracoes(): Promise<ConfiguracoesCalculo> {
  try {
    const rec = await pb
      .collection('configuracoes_escritorio')
      .getFirstListItem(`user = "${pb.authStore.record?.id ?? ''}"`)
    return {
      salario_minimo: Number(rec.data.salario_minimo) || CONFIG_PADRAO.salario_minimo,
      divisor_padrao: Number(rec.data.divisor_padrao) || CONFIG_PADRAO.divisor_padrao,
      percentual_dsr: Number(rec.data.percentual_dsr) || CONFIG_PADRAO.percentual_dsr,
      percentual_fgts: Number(rec.data.percentual_fgts) || CONFIG_PADRAO.percentual_fgts,
      multa_fgts: Number(rec.data.multa_fgts) || CONFIG_PADRAO.multa_fgts,
      teto_seguro_desemprego:
        Number(rec.data.teto_seguro_desemprego) || CONFIG_PADRAO.teto_seguro_desemprego,
    }
  } catch {
    // Sem registro ainda: tenta criar com os defaults; se falhar (ex.: sem auth),
    // usa os defaults em memória para não bloquear o cálculo.
    try {
      const rec = await pb.collection('configuracoes_escritorio').create({
        user: pb.authStore.record?.id,
        salario_minimo: CONFIG_PADRAO.salario_minimo,
        divisor_padrao: CONFIG_PADRAO.divisor_padrao,
        percentual_dsr: CONFIG_PADRAO.percentual_dsr,
        percentual_fgts: CONFIG_PADRAO.percentual_fgts,
        multa_fgts: CONFIG_PADRAO.multa_fgts,
        teto_seguro_desemprego: CONFIG_PADRAO.teto_seguro_desemprego,
      })
      return {
        salario_minimo: Number(rec.data.salario_minimo),
        divisor_padrao: Number(rec.data.divisor_padrao),
        percentual_dsr: Number(rec.data.percentual_dsr),
        percentual_fgts: Number(rec.data.percentual_fgts),
        multa_fgts: Number(rec.data.multa_fgts),
        teto_seguro_desemprego: Number(rec.data.teto_seguro_desemprego),
      }
    } catch {
      return { ...CONFIG_PADRAO }
    }
  }
}
