/** Orquestração das regras 1–10 do motor de cálculo trabalhista (JusCalc). */

import type { AtendimentoForm } from '@/types/atendimento'
import {
  CONFIG_PADRAO,
  addDias,
  avosNoAno,
  diffMeses,
  fmt,
  fmtData,
  hojeLocalISO,
  num,
  r2,
  type ConfiguracoesCalculo,
  type ResultadoCalculo,
  type Verba,
} from './base'

const grupoDaVerba = (nome: string): string => {
  if (
    nome.startsWith('Multa do Art. 477') ||
    nome.startsWith('Multa do Art. 467') ||
    nome.startsWith('Seguro-Desemprego')
  )
    return 'Multas e Seguro-Desemprego'
  if (nome.startsWith('FGTS') || nome.startsWith('Multa Rescisória')) return 'FGTS + Multa de 40%'
  if (nome.startsWith('Reflexos')) return 'Reflexos'
  if (
    nome.startsWith('Horas Extras') ||
    nome.startsWith('Intervalo') ||
    nome.startsWith('Adicional') ||
    nome.startsWith('DSR')
  )
    return 'Jornada e Adicionais'
  return 'Verbas Rescisórias'
}

export function calcularTrabalhista(
  form: AtendimentoForm,
  cfg: ConfiguracoesCalculo = CONFIG_PADRAO,
): ResultadoCalculo {
  const verbas: Verba[] = []
  const memoria: string[] = []
  const push = (nome: string, fundamento: string, base: string, valor: number) => {
    if (valor > 0) verbas.push({ nome, fundamento, base, valor: r2(valor) })
  }

  const motivo = form.motivo_saida
  const rescisaoIndireta = motivo.startsWith('Rescisão Indireta')
  const rescIndiretaAindaTrabalhando = motivo === 'Rescisão Indireta - Ainda trabalhando'
  const rescIndiretaJaSaiu = motivo === 'Rescisão Indireta - Já saiu'
  const aindaTrabalhando = motivo === 'Ainda trabalhando' || rescIndiretaAindaTrabalhando
  // Rescisão Indireta "Ainda trabalhando": contrato vigente — projeta o término na data atual.
  const dataSaidaBase =
    form.data_saida || (rescIndiretaAindaTrabalhando ? hojeLocalISO() : '') || hojeLocalISO()
  // Verbas que uma DEMISSÃO SEM JUSTA CAUSA gera (o Rescisão Indireta deve espelhar exatamente):
  const verbasDemissaoSemJustaCausa = [
    'Aviso Prévio Indenizado',
    'Saldo de Salário',
    '13º Salário Proporcional',
    'Férias Vencidas + 1/3 Constitucional',
    'Férias Proporcionais + 1/3 Constitucional',
    'FGTS sobre Verbas Salariais',
    `Multa Rescisória de ${(cfg.multa_fgts * 100).toFixed(0)}% do FGTS`,
    'Multa do Art. 477 da CLT',
    'Multa do Art. 467 da CLT',
    'Seguro-Desemprego (estimativa)',
  ]
  const dataAdmissao = form.data_admissao || dataSaidaBase

  // ===== REGRAS 1 e 2 — prescrição quinquenal e base salarial =====
  const salarioBruto = num(form.ultimo_salario)
  const porFora = form.recebia_por_fora === 'sim' ? num(form.valor_por_fora) : 0
  const comissoes = form.recebia_comissoes === 'sim' ? num(form.media_comissoes) : 0
  const baseSalarial = r2(salarioBruto + porFora + comissoes)

  let meses = diffMeses(dataAdmissao, dataSaidaBase)
  let prescricaoAplicada = false
  if (meses > 60) {
    meses = 60 // últimos 60 meses contados da data de saída
    prescricaoAplicada = true
    memoria.push(
      `Prescrição quinquenal: verbas mensais recorrentes (horas extras, adicionais e FGTS atrasado) limitadas aos últimos 60 meses contados da data de saída (${fmtData(dataSaidaBase)}).`,
    )
  }
  const valorHora = baseSalarial / cfg.divisor_padrao

  memoria.push(
    `Base Salarial = Salário Bruto (${fmt(salarioBruto)})` +
      (porFora > 0 ? ` + salário "por fora" (${fmt(porFora)})` : '') +
      (comissoes > 0 ? ` + média de comissões (${fmt(comissoes)})` : '') +
      ` = ${fmt(baseSalarial)}.`,
  )
  memoria.push(
    `Valor da hora = Base Salarial ÷ divisor ${cfg.divisor_padrao} = ${fmt(valorHora)} por hora.`,
  )

  // ===== REGRA 3 — aviso prévio indenizado + projeção do contrato =====
  const semAviso = motivo === 'Pedido de demissão' || motivo === 'Justa causa'
  const anos = Math.floor(diffMeses(dataAdmissao, dataSaidaBase) / 12)
  const avisoDias = semAviso ? 0 : Math.min(90, 30 + 3 * anos)
  if (semAviso) {
    memoria.push(
      `Aviso prévio indenizado não aplicado (motivo: ${motivo}); sem projeção de contrato para 13º e férias.`,
    )
  } else {
    memoria.push(
      `Aviso prévio indenizado: 30 dias + 3 dias por ano completo (${anos} ano(s)) = ${avisoDias} dias (máximo 90), conforme Lei nº 12.506/2011.`,
    )
  }
  const dataFinalProjetada = avisoDias > 0 ? addDias(dataSaidaBase, avisoDias) : dataSaidaBase
  if (avisoDias > 0) {
    memoria.push(
      `Contrato projetado até ${fmtData(dataFinalProjetada)} para fins de 13º salário e férias.`,
    )
  }
  const avisoValor = r2(baseSalarial * (avisoDias / 30))
  push(
    'Aviso Prévio Indenizado',
    'Lei nº 12.506/2011',
    `${fmt(baseSalarial)} × ${avisoDias}/30`,
    avisoValor,
  )

  // ===== REGRA 4 — saldo de salário =====
  const naoRecebeu = form.verbas_recebidas === 'nao_recebeu_nada'
  const parcialSemPrazo =
    form.verbas_recebidas === 'recebeu_parcial' && form.pago_prazo_10_dias === 'nao'
  const saldoPago = !(naoRecebeu || parcialSemPrazo)
  // Saldo de salário: dias trabalhados no mês da saída. Se admissão e saída ocorrerem
  // no mesmo mês/ano, conta do dia da admissão até o dia da saída (inclusive); caso
  // contrário, o dia da saída. Limitado a 30 dias.
  const [anoSaida, mesSaida, diaSaidaNum] = dataSaidaBase.split('-').map(Number)
  const [anoAdm, mesAdm, diaAdmNum] = dataAdmissao.split('-').map(Number)
  let diasNoMesSaida = Math.min(30, diaSaidaNum || 0)
  const mesmoMesAno =
    diaAdmNum !== undefined &&
    mesAdm !== undefined &&
    anoAdm !== undefined &&
    anoAdm === anoSaida &&
    mesAdm === mesSaida &&
    (anoAdm !== 0 || mesAdm !== 0)
  if (mesmoMesAno) diasNoMesSaida = Math.min(30, diaSaidaNum - diaAdmNum + 1)
  const saldoSalario = saldoPago ? 0 : r2((baseSalarial / 30) * diasNoMesSaida)
  memoria.push(
    saldoSalario > 0
      ? mesmoMesAno
        ? `Saldo de salário: admissão e saída no mesmo mês (${fmtData(dataAdmissao)} a ${fmtData(dataSaidaBase)}), ${diasNoMesSaida} dias trabalhados (de ${diaAdmNum} a ${diaSaidaNum}) × (${fmt(baseSalarial)} ÷ 30) = ${fmt(saldoSalario)} — verbas não pagas pela empresa.`
        : `Saldo de salário: ${diasNoMesSaida} dias trabalhados no mês da saída × (${fmt(baseSalarial)} ÷ 30) = ${fmt(saldoSalario)} — verbas não pagas pela empresa.`
      : 'Saldo de salário: R$ 0,00 — verbas pagas pela empresa.',
  )
  push(
    'Saldo de Salário',
    'Art. 462 da CLT',
    mesmoMesAno
      ? `${fmt(baseSalarial)} ÷ 30 × ${diasNoMesSaida} dias (admissão no mesmo mês da saída)`
      : `${fmt(baseSalarial)} ÷ 30 × ${diasNoMesSaida} dias`,
    saldoSalario,
  )

  // ===== REGRA 5 — 13º proporcional, férias vencidas e proporcionais =====
  const avos13 = avosNoAno(dataAdmissao, dataFinalProjetada)
  const decimoProp = r2((baseSalarial / 12) * avos13)
  memoria.push(
    `13º salário proporcional: ${avos13}/12 avos de ${fmt(baseSalarial)} = ${fmt(decimoProp)} (fração ≥ 15 dias conta como mês inteiro, já com a projeção do aviso prévio).`,
  )
  push(
    '13º Salário Proporcional',
    'Lei nº 4.090/1962',
    `${avos13}/12 de ${fmt(baseSalarial)}`,
    decimoProp,
  )

  let feriasVencidas = 0
  if (form.tem_ferias_vencidas) {
    const periodos = Math.max(1, num(form.periodos_ferias, 1))
    feriasVencidas = r2((baseSalarial + baseSalarial / 3) * periodos)
    memoria.push(
      `Férias vencidas + 1/3: ${periodos} período(s) aquisitivo(s) × (${fmt(baseSalarial)} + 1/3) = ${fmt(feriasVencidas)}${periodos >= 2 ? ' — em dobro, vencidas há mais de 12 meses' : ''}.`,
    )
    push(
      'Férias Vencidas + 1/3 Constitucional',
      'Art. 137 e 142 da CLT',
      `${periodos} × (${fmt(baseSalarial)} + 1/3)`,
      feriasVencidas,
    )
  }

  const avosFerias = avos13
  const feriasProp = r2((baseSalarial + baseSalarial / 3) * (avosFerias / 12))
  memoria.push(
    `Férias proporcionais + 1/3: ${avosFerias}/12 × (${fmt(baseSalarial)} + 1/3) = ${fmt(feriasProp)}.`,
  )
  push(
    'Férias Proporcionais + 1/3 Constitucional',
    'Art. 146 e 147 da CLT',
    `${avosFerias}/12 × (${fmt(baseSalarial)} + 1/3)`,
    feriasProp,
  )

  // ===== REGRA 6 — horas extras e intervalo suprimido =====
  const heUteis = num(form.horas_extras_uteis)
  const heDomingo = num(form.horas_extras_domingo)
  const he50 = r2(valorHora * 1.5 * heUteis * 4.33 * meses)
  const he100 = r2(valorHora * 2.0 * heDomingo * 4.33 * meses)
  if (he50 > 0) {
    memoria.push(
      `Horas extras 50% (dias úteis): ${fmt(valorHora)} × 1,5 × ${heUteis}h/semana × 4,33 × ${meses} meses = ${fmt(he50)}.`,
    )
    push(
      'Horas Extras 50% (dias úteis)',
      'Art. 59 da CLT',
      `${fmt(valorHora)}/h × 1,5 × ${heUteis}h × 4,33 × ${meses}`,
      he50,
    )
  }
  if (he100 > 0) {
    memoria.push(
      `Horas extras 100% (domingos e feriados): ${fmt(valorHora)} × 2,0 × ${heDomingo}h/semana × 4,33 × ${meses} meses = ${fmt(he100)}.`,
    )
    push(
      'Horas Extras 100% (domingos e feriados)',
      'Art. 59 da CLT',
      `${fmt(valorHora)}/h × 2,0 × ${heDomingo}h × 4,33 × ${meses}`,
      he100,
    )
  }

  const supressao = Math.max(0, 60 - num(form.minutos_intervalo, 60))
  const diasTrabalho = meses * num(form.dias_semana, 5)
  const intervaloSuprimido = r2(valorHora * 1.5 * (supressao / 60) * diasTrabalho)
  if (intervaloSuprimido > 0) {
    memoria.push(
      `Intervalo intrajornada suprimido: ${supressao} minutos por dia pagos como hora extra de 50% em ${diasTrabalho} dias trabalhados = ${fmt(intervaloSuprimido)}.`,
    )
    push(
      'Intervalo Intrajornada Suprimido',
      'Art. 71, §4º da CLT',
      `${fmt(valorHora)}/h × 1,5 × ${supressao}/60 × ${diasTrabalho} dias`,
      intervaloSuprimido,
    )
  }

  // ===== REGRA 7 — adicionais =====
  const horasNoturnas = form.tem_adicional_noturno ? num(form.horas_noturnas_semana) : 0
  const adicNoturno = r2(valorHora * 0.2 * 1.1428 * horasNoturnas * 4.33 * meses)
  if (adicNoturno > 0) {
    memoria.push(
      `Adicional noturno: ${fmt(valorHora)} × 0,20 × 1,1428 × ${horasNoturnas}h/semana × 4,33 × ${meses} meses = ${fmt(adicNoturno)}.`,
    )
    push(
      'Adicional Noturno',
      'Art. 73 da CLT',
      `${fmt(valorHora)}/h × 0,20 × 1,1428 × ${horasNoturnas}h × 4,33 × ${meses}`,
      adicNoturno,
    )
  }

  const grauIns = form.tem_insalubridade ? num(form.grau_insalubridade, 10) / 100 : 0
  const insalubridade = r2(cfg.salario_minimo * grauIns * meses)
  if (insalubridade > 0) {
    memoria.push(
      `Adicional de insalubridade: ${fmt(cfg.salario_minimo)} (salário mínimo) × ${grauIns * 100}% × ${meses} meses = ${fmt(insalubridade)}.`,
    )
    push(
      'Adicional de Insalubridade',
      'Art. 192 da CLT',
      `${fmt(cfg.salario_minimo)} × ${grauIns * 100}% × ${meses}`,
      insalubridade,
    )
  }

  const periculosidade = form.tem_periculosidade ? r2(salarioBruto * 0.3 * meses) : 0
  if (periculosidade > 0) {
    memoria.push(
      `Adicional de periculosidade: ${fmt(salarioBruto)} × 30% × ${meses} meses = ${fmt(periculosidade)}.`,
    )
    push(
      'Adicional de Periculosidade',
      'Art. 193 da CLT',
      `${fmt(salarioBruto)} × 30% × ${meses}`,
      periculosidade,
    )
  }

  // ===== REGRA 8 — DSR e reflexos SIMPLES (sem cascata) =====
  const habituais = r2(
    he50 + he100 + intervaloSuprimido + adicNoturno + insalubridade + periculosidade,
  )
  const dsr = r2(habituais * cfg.percentual_dsr)
  if (dsr > 0) {
    memoria.push(
      `DSR estimado de ${(cfg.percentual_dsr * 100).toFixed(2)}% sobre horas extras, intervalo suprimido e adicionais (reflexo simples, sem cascata): ${fmt(habituais)} × ${(cfg.percentual_dsr * 100).toFixed(2)}% = ${fmt(dsr)}.`,
    )
    push(
      'DSR sobre Verbas Habituais',
      'Art. 7º da CLT',
      `${fmt(habituais)} × ${(cfg.percentual_dsr * 100).toFixed(2)}%`,
      dsr,
    )
  }

  const reflexo13 = r2(habituais / 12)
  const reflexoFerias = r2((habituais / 12) * 1.3333)
  const reflexoAviso = r2(habituais * (avisoDias / 30))
  if (reflexo13 > 0)
    push(
      'Reflexos Habituais no 13º Salário',
      'Súmula 205 do TST',
      `${fmt(habituais)} ÷ 12`,
      reflexo13,
    )
  if (reflexoFerias > 0)
    push(
      'Reflexos Habituais nas Férias + 1/3',
      'Súmula 205 do TST',
      `${fmt(habituais)} ÷ 12 × 1,3333`,
      reflexoFerias,
    )
  if (reflexoAviso > 0)
    push(
      'Reflexos Habituais no Aviso Prévio',
      'Súmula 305 do TST',
      `${fmt(habituais)} × ${avisoDias}/30`,
      reflexoAviso,
    )
  if (reflexo13 > 0 || reflexoFerias > 0 || reflexoAviso > 0) {
    memoria.push(
      `Reflexos simples (sem cascata) das verbas habituais (${fmt(habituais)}): no 13º = 1/12 (${fmt(reflexo13)}); nas férias + 1/3 = 1/12 × 1,3333 (${fmt(reflexoFerias)}); no aviso prévio = ${fmt(reflexoAviso)}.`,
    )
  }

  // ===== REGRA 9 — FGTS + multa (40% ou 20% no Acordo 484-A) =====
  const pctMulta = motivo === 'Acordo (Art. 484-A)' ? 0.2 : cfg.multa_fgts
  const pctLabel = (pctMulta * 100).toFixed(0)
  const salarialSemFerias = r2(
    saldoSalario +
      avisoValor +
      he50 +
      he100 +
      intervaloSuprimido +
      adicNoturno +
      insalubridade +
      periculosidade +
      dsr +
      decimoProp +
      reflexo13 +
      reflexoFerias +
      reflexoAviso,
  )
  const fgtsSalarial = r2(salarialSemFerias * cfg.percentual_fgts)
  memoria.push(
    `FGTS de ${(cfg.percentual_fgts * 100).toFixed(0)}% sobre verbas de natureza salarial (${fmt(salarialSemFerias)}), excluindo férias indenizadas + 1/3 = ${fmt(fgtsSalarial)}.`,
  )
  push(
    'FGTS sobre Verbas Salariais',
    'Art. 15 da Lei nº 8.036/1990',
    `${fmt(salarialSemFerias)} × ${(cfg.percentual_fgts * 100).toFixed(0)}%`,
    fgtsSalarial,
  )

  let fgtsAtrasado = 0
  if (form.situacao_fgts !== 'depositado_corretamente') {
    fgtsAtrasado = r2(baseSalarial * meses * cfg.percentual_fgts)
    memoria.push(
      `FGTS não depositado: ${(cfg.percentual_fgts * 100).toFixed(0)}% sobre toda a remuneração do período não prescrito (${meses} meses × ${fmt(baseSalarial)}) = ${fmt(fgtsAtrasado)}.`,
    )
    push(
      'FGTS não Depositado (diferenças)',
      'Art. 15 da Lei nº 8.036/1990',
      `${meses} × ${fmt(baseSalarial)} × ${(cfg.percentual_fgts * 100).toFixed(0)}%`,
      fgtsAtrasado,
    )
  }

  let baseMulta = r2(fgtsSalarial + fgtsAtrasado)
  let descBaseMulta = `saldo total de FGTS devido (${fmt(baseMulta)})`
  if (form.ja_sacou_fgts) {
    // Já sacou o FGTS anterior: multa apenas sobre saldo estimado do contrato + diferenças.
    baseMulta = r2(baseSalarial * meses * cfg.percentual_fgts + fgtsAtrasado)
    descBaseMulta = `saldo estimado do contrato + diferenças não depositadas (${fmt(baseMulta)}), pois o FGTS anterior já foi sacado`
  }
  const multaFgts = r2(baseMulta * pctMulta)
  memoria.push(
    `Multa de ${pctLabel}% do FGTS sobre ${descBaseMulta} = ${fmt(multaFgts)}${motivo === 'Acordo (Art. 484-A)' ? ' (percentual reduzido para 20% no acordo do Art. 484-A)' : ''}.`,
  )
  push(
    `Multa Rescisória de ${pctLabel}% do FGTS`,
    'Art. 18, §1º da Lei nº 8.036/1990',
    `${pctLabel}% sobre ${fmt(baseMulta)}`,
    multaFgts,
  )

  // ===== REGRA 10 — multas 477/467 e seguro-desemprego =====
  const aplica477 = (naoRecebeu || parcialSemPrazo) && motivo !== 'Ainda trabalhando'
  const multa477 = aplica477 ? r2(baseSalarial) : 0
  if (multa477 > 0) {
    memoria.push(
      `Multa do Art. 477 da CLT: verbas rescisórias não pagas no prazo de 10 dias → 1× base salarial = ${fmt(multa477)}.`,
    )
    push('Multa do Art. 477 da CLT', 'Art. 477, §8º da CLT', `1× ${fmt(baseSalarial)}`, multa477)
  }

  // Multa do Art. 467: SEMPRE aplicada quando "Rescisão Indireta - Já saiu" (verbas em atraso
  // após a saída), ou quando o advogado marcar a opção em qualquer outro motivo.
  if ((form.incluir_multa_467 || rescIndiretaJaSaiu) && saldoSalario > 0) {
    const base467 = r2(saldoSalario + feriasVencidas + decimoProp)
    const multa467 = r2(base467 * 0.5)
    memoria.push(
      `Multa do Art. 467 da CLT (opção marcada): 50% sobre saldo de salário, férias e 13º não pagos (${fmt(base467)}) = ${fmt(multa467)}.`,
    )
    push('Multa do Art. 467 da CLT', 'Art. 467 da CLT', `50% × ${fmt(base467)}`, multa467)
  }

  const habilitaSeguro =
    (motivo === 'Demissão sem justa causa' ||
      motivo === 'Acordo (Art. 484-A)' ||
      motivo.startsWith('Rescisão Indireta')) &&
    !aindaTrabalhando
  let avisoSeguro: string | undefined
  if (habilitaSeguro && !form.ja_recebeu_seguro_desemprego) {
    const parcelas = meses >= 24 ? 5 : meses >= 12 ? 4 : 3
    const bruto = r2(baseSalarial * 0.8)
    const parcela = r2(Math.min(bruto, cfg.teto_seguro_desemprego))
    const seguro = r2(parcela * parcelas)
    avisoSeguro = 'Estimativa sujeita às regras do MTE'
    memoria.push(
      `Seguro-desemprego (estimativa): ${parcelas} parcela(s) conforme ${meses} meses trabalhados, cada uma em 80% da base salarial (${fmt(bruto)}) limitada ao teto de ${fmt(cfg.teto_seguro_desemprego)} → total ${fmt(seguro)}.`,
    )
    push(
      'Seguro-Desemprego (estimativa)',
      'Lei nº 7.998/1990',
      `${parcelas} parcelas × mín(${fmt(bruto)}; teto ${fmt(cfg.teto_seguro_desemprego)})`,
      seguro,
    )
  }

  // ===== Subtotais por grupo e total bruto =====
  const gruposMap = new Map<string, number>()
  for (const v of verbas) {
    const g = grupoDaVerba(v.nome)
    gruposMap.set(g, r2((gruposMap.get(g) ?? 0) + v.valor))
  }
  const grupos = Array.from(gruposMap.entries()).map(([nome, subtotal]) => ({ nome, subtotal }))

  const totalBruto = r2(verbas.reduce((s, v) => s + v.valor, 0))
  memoria.push(
    `TOTAL BRUTO DA AÇÃO = ${fmt(totalBruto)} (soma de ${verbas.length} verba${verbas.length === 1 ? '' : 's'}).`,
  )

  return {
    verbas,
    grupos,
    memoria,
    total_bruto: totalBruto,
    aviso_seguro_desemprego: avisoSeguro,
    verbas_demissao_sem_justa_causa: rescisaoIndireta ? verbasDemissaoSemJustaCausa : undefined,
    parametros: {
      base_salarial: baseSalarial,
      valor_hora: r2(valorHora),
      meses_relevantes: meses,
      aviso_dias: avisoDias,
      data_final_projetada: dataFinalProjetada,
      prescricao_aplicada: prescricaoAplicada,
    },
  }
}
