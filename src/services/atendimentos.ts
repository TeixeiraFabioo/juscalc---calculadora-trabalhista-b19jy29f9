import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import type { ResultadoCalculo } from '@/lib/calculo'
import type { AtendimentoForm, AtendimentoRecord, Select } from '@/types/atendimento'

const COLLECTION = 'atendimentos'

/**
 * Reautentica silenciosamente a sessão atual (refresh do token de auth).
 * Retorna true quando o authStore fica com um token válido no fim.
 */
async function reautenticar(): Promise<boolean> {
  try {
    if (!pb.authStore.isValid) return false
    await pb.collection('users').authRefresh()
    return pb.authStore.isValid
  } catch {
    return false
  }
}

/**
 * 400 de create/update SEM nenhum erro por campo = falha da regra de API
 * (o PocketBase nem valida os campos quando a regra nega — chega sem token
 * de autenticação válido). Um authRefresh renova o token e o retry reenvia.
 */
function falhaDeRegra(err: unknown): boolean {
  const e = err as { status?: number }
  return e?.status === 400 && Object.keys(extractFieldErrors(err)).length === 0
}

/** Status jurídico do atendimento (select `status` — migração 0007). */
export type AtendimentoStatus = 'Simulação' | 'Aguardando Documentos' | 'Ajuizado'

export const STATUS_OPTIONS: AtendimentoStatus[] = [
  'Simulação',
  'Aguardando Documentos',
  'Ajuizado',
]

/**
 * Carrega o rascunho aberto mais recente do usuário logado.
 * Retorna null se não existir nenhum.
 */
export async function loadDraft(userId: string): Promise<AtendimentoRecord | null> {
  const list = await pb.collection(COLLECTION).getList<AtendimentoRecord>(1, 1, {
    filter: pb.filter('user = {:userId}', { userId }),
    sort: '-updated',
  })
  return list.items[0] ?? null
}

/** Converte uma linha do banco para o estado do formulário. */
export function recordToForm(record: AtendimentoRecord): AtendimentoForm {
  return {
    step: safeStep(record.step),
    cliente_nome: record.cliente_nome ?? '',
    cliente_cpf: record.cliente_cpf ?? '',
    empresa_nome: record.empresa_nome ?? '',
    empresa_cnpj: record.empresa_cnpj ?? '',
    data_admissao: toDateInput(record.data_admissao),
    data_saida: toDateInput(record.data_saida),
    motivo_saida: record.motivo_saida ?? '',
    verbas_recebidas: record.verbas_recebidas ?? '',
    pago_prazo_10_dias: record.pago_prazo_10_dias ?? '',
    ja_sacou_fgts: !!record.ja_sacou_fgts,
    ja_recebeu_seguro_desemprego: !!record.ja_recebeu_seguro_desemprego,
    faltas_graves: Array.isArray(record.faltas_graves) ? record.faltas_graves : [],
    data_ultimo_fato_grave: toDateInput(record.data_ultimo_fato_grave),
    ultimo_salario: numToInput(record.ultimo_salario),
    recebia_por_fora: record.recebia_por_fora ?? '',
    valor_por_fora: numToInput(record.valor_por_fora),
    recebia_comissoes: record.recebia_comissoes ?? '',
    media_comissoes: numToInput(record.media_comissoes),
    hora_entrada: record.hora_entrada ?? '',
    hora_saida: record.hora_saida ?? '',
    minutos_intervalo: numToInput(record.minutos_intervalo),
    dias_semana: numToInput(record.dias_semana),
    horas_extras_uteis: numToInput(record.horas_extras_uteis),
    horas_extras_domingo: numToInput(record.horas_extras_domingo),
    situacao_fgts: record.situacao_fgts ?? '',
    tem_adicional_noturno: !!record.tem_adicional_noturno,
    horas_noturnas_semana: numToInput(record.horas_noturnas_semana),
    tem_insalubridade: !!record.tem_insalubridade,
    grau_insalubridade: numToInput(record.grau_insalubridade),
    tem_periculosidade: !!record.tem_periculosidade,
    tem_ferias_vencidas: !!record.tem_ferias_vencidas,
    periodos_ferias: numToInput(record.periodos_ferias),
    tem_descontos_indevidos: !!record.tem_descontos_indevidos,
    valor_descontos: numToInput(record.valor_descontos),
    tem_dano_moral: !!record.tem_dano_moral,
    valor_dano_moral: numToInput(record.valor_dano_moral),
    incluir_multa_467: !!record.incluir_multa_467,
  }
}

/**
 * Normaliza o valor de um campo date do PocketBase: a API não aceita string
 * vazia em campos date — vira null. Retorna Date ISO ou null.
 */
function dateOuNull(v: string): string | null {
  const s = (v ?? '').trim()
  if (s === '') return null
  const d = new Date(s.length === 10 ? `${s}T00:00:00.000Z` : s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** Sanitiza um número de formulário: vazio/inválido vira 0 (o PocketBase aceita
 * 0 mesmo em campos com min/max — null explícito é rejeitado com 400). */
function numOuZero(v: string): number {
  const s = (v ?? '').trim()
  if (s === '') return 0
  const n = Number(s.replace(',', '.'))
  return Number.isNaN(n) ? 0 : n
}

/** Sanitiza um texto: vazio vira '' (campo text aceita string vazia). */
function textoOuVazio(v: unknown, max?: number): string {
  const s = typeof v === 'string' ? v.trim() : ''
  return max !== undefined ? s.slice(0, max) : s
}

/**
 * Define um valor no payload SOMENTE se não estiver vazio (null/''):
 * o PocketBase rejeita null explícito em campos date/select/number
 * (400 "Failed to create record") — a chave vazia deve ser omitida.
 */
function setSePreenchido<T extends object, K extends keyof T>(
  payload: T,
  key: K,
  value: T[K] | null | '',
): void {
  if (value !== null && value !== '') payload[key] = value
}

/**
 * Valores aceitos pelos campos select do PocketBase (schema da coleção
 * `atendimentos`). Rascunhos antigos podem guardar valores fora dessas listas
 * — enviar um valor inválido causa 400 "Failed to update record".
 */
const MOTIVOS_SAIDA = [
  'Demissão sem justa causa',
  'Pedido de demissão',
  'Justa causa',
  'Acordo (Art. 484-A)',
  'Ainda trabalhando',
  'Rescisão Indireta - Ainda trabalhando',
  'Rescisão Indireta - Já saiu',
]

const VALORES_SELECT: Record<string, string[]> = {
  verbas_recebidas: ['nao_recebeu_nada', 'recebeu_parcial', 'recebeu_tudo'],
  pago_prazo_10_dias: ['sim', 'nao'],
  recebia_por_fora: ['sim', 'nao'],
  recebia_comissoes: ['sim', 'nao'],
  situacao_fgts: ['depositado_corretamente', 'nao_depositava_nada', 'depositava_alguns_meses'],
}

const FALTAS_GRAVES_VALIDAS = [
  'Atraso frequente de salários',
  'Falta de depósito do FGTS',
  'Horas extras não pagas',
  'Assédio moral / Humilhações',
  'Desvio ou acúmulo de função',
  'Falta de EPI / Risco grave',
  'Outro',
]

/**
 * Valida um valor de select contra a lista aceita pelo PocketBase.
 * Valor fora da lista (rascunho antigo) volta vazio — o campo é opcional,
 * e vazio é aceito; inválido não.
 */
function selectValido(v: unknown, valoresAceitos: string[]): Select {
  return typeof v === 'string' && valoresAceitos.includes(v) ? (v as Select) : ''
}

/**
 * Converte o estado do formulário + usuário em payload SANITIZADO para o banco.
 * - datas vazias → chave OMITIDA (o PocketBase rejeita null e "" em date);
 * - números vazios/inválidos → 0 (aceito mesmo em campos com min/max);
 * - selects vazios/inválidos → chave OMITIDA (null é rejeitado);
 * - textos vazios → '' (campo text aceita) e truncados no limite do schema;
 * - user sempre com o id do usuário autenticado.
 */
export function formToPayload(form: AtendimentoForm, userId: string): Partial<AtendimentoRecord> {
  const payload: Partial<AtendimentoRecord> = { user: userId, step: form.step }

  const text = textoOuVazio
  const num = numOuZero
  const date = dateOuNull

  payload.cliente_nome = text(form.cliente_nome, 200)
  payload.cliente_cpf = text(form.cliente_cpf, 20)
  payload.empresa_nome = text(form.empresa_nome, 200)
  payload.empresa_cnpj = text(form.empresa_cnpj, 20)
  setSePreenchido(payload, 'data_admissao', date(form.data_admissao))
  setSePreenchido(payload, 'data_saida', date(form.data_saida))
  setSePreenchido(payload, 'motivo_saida', selectValido(form.motivo_saida, MOTIVOS_SAIDA))
  setSePreenchido(
    payload,
    'verbas_recebidas',
    selectValido(form.verbas_recebidas, VALORES_SELECT.verbas_recebidas),
  )
  setSePreenchido(
    payload,
    'pago_prazo_10_dias',
    selectValido(form.pago_prazo_10_dias, VALORES_SELECT.pago_prazo_10_dias),
  )
  payload.ja_sacou_fgts = !!form.ja_sacou_fgts
  payload.ja_recebeu_seguro_desemprego = !!form.ja_recebeu_seguro_desemprego
  payload.faltas_graves = Array.isArray(form.faltas_graves)
    ? form.faltas_graves.filter((f) => typeof f === 'string' && FALTAS_GRAVES_VALIDAS.includes(f))
    : []
  setSePreenchido(payload, 'data_ultimo_fato_grave', date(form.data_ultimo_fato_grave))

  payload.ultimo_salario = num(form.ultimo_salario)
  setSePreenchido(
    payload,
    'recebia_por_fora',
    selectValido(form.recebia_por_fora, VALORES_SELECT.recebia_por_fora),
  )
  payload.valor_por_fora = num(form.valor_por_fora)
  setSePreenchido(
    payload,
    'recebia_comissoes',
    selectValido(form.recebia_comissoes, VALORES_SELECT.recebia_comissoes),
  )
  payload.media_comissoes = num(form.media_comissoes)
  payload.hora_entrada = text(form.hora_entrada, 10)
  payload.hora_saida = text(form.hora_saida, 10)
  payload.minutos_intervalo = num(form.minutos_intervalo)
  payload.dias_semana = num(form.dias_semana)
  payload.horas_extras_uteis = num(form.horas_extras_uteis)
  payload.horas_extras_domingo = num(form.horas_extras_domingo)

  setSePreenchido(
    payload,
    'situacao_fgts',
    selectValido(form.situacao_fgts, VALORES_SELECT.situacao_fgts),
  )
  payload.tem_adicional_noturno = !!form.tem_adicional_noturno
  payload.horas_noturnas_semana = num(form.horas_noturnas_semana)
  payload.tem_insalubridade = !!form.tem_insalubridade
  payload.grau_insalubridade = num(form.grau_insalubridade)
  payload.tem_periculosidade = !!form.tem_periculosidade
  payload.tem_ferias_vencidas = !!form.tem_ferias_vencidas
  payload.periodos_ferias = num(form.periodos_ferias)
  payload.tem_descontos_indevidos = !!form.tem_descontos_indevidos
  payload.valor_descontos = num(form.valor_descontos)
  payload.tem_dano_moral = !!form.tem_dano_moral
  payload.valor_dano_moral = num(form.valor_dano_moral)
  payload.incluir_multa_467 = !!form.incluir_multa_467

  return payload
}

/** Cria um novo atendimento (rascunho) para o usuário logado. */
export async function createDraft(
  form: AtendimentoForm,
  userId: string,
): Promise<AtendimentoRecord> {
  const payload = formToPayload(form, userId)
  // Novo atendimento sempre nasce como "Simulação" (select `status`, migração 0007).
  payload.status = 'Simulação'
  try {
    return await pb.collection(COLLECTION).create<AtendimentoRecord>(payload)
  } catch (err) {
    if (falhaDeRegra(err) && (await reautenticar())) {
      return pb.collection(COLLECTION).create<AtendimentoRecord>(payload)
    }
    throw err
  }
}

/** Atualiza um atendimento existente. */
export async function updateDraft(
  recordId: string,
  form: AtendimentoForm,
  userId: string,
): Promise<AtendimentoRecord> {
  const payload = formToPayload(form, userId)
  try {
    return await pb.collection(COLLECTION).update<AtendimentoRecord>(recordId, payload)
  } catch (err) {
    if (falhaDeRegra(err) && (await reautenticar())) {
      return pb.collection(COLLECTION).update<AtendimentoRecord>(recordId, payload)
    }
    throw err
  }
}

/** Salva (cria ou atualiza) o rascunho do usuário. */
export async function saveDraft(
  form: AtendimentoForm,
  userId: string,
  recordId: string | null,
): Promise<{ record: AtendimentoRecord; created: boolean }> {
  if (recordId) {
    const record = await updateDraft(recordId, form, userId)
    return { record, created: false }
  }
  const record = await createDraft(form, userId)
  return { record, created: true }
}

/** Salva o resultado JSON completo do cálculo no registro do atendimento. */
export async function saveResultado(
  recordId: string,
  resultado: ResultadoCalculo,
): Promise<AtendimentoRecord> {
  return pb.collection(COLLECTION).update<AtendimentoRecord>(recordId, { resultado })
}

/** Lista todos os atendimentos do usuário logado (tela de Atendimentos). */
export async function getAtendimentosDoUsuario(userId: string): Promise<AtendimentoRecord[]> {
  try {
    return await pb.collection(COLLECTION).getFullList<AtendimentoRecord>({
      filter: `user = "${userId}"`,
      sort: '-created',
    })
  } catch {
    return []
  }
}

/** Busca um atendimento por id (usado pela tela de Resultado). */
export async function getAtendimento(id: string): Promise<AtendimentoRecord | null> {
  try {
    return await pb.collection(COLLECTION).getOne<AtendimentoRecord>(id)
  } catch {
    return null
  }
}

/** Salva apenas o status do atendimento (select editável na tela CRM). */
export async function salvarStatus(
  recordId: string,
  status: AtendimentoStatus,
): Promise<AtendimentoRecord> {
  return pb.collection(COLLECTION).update<AtendimentoRecord>(recordId, { status })
}

/** Lê o status salvo de um registro (fallback "Simulação"). */
export function statusDo(record: AtendimentoRecord): AtendimentoStatus {
  const s = record.status
  return STATUS_OPTIONS.find((opt) => opt === s) ?? 'Simulação'
}

/**
 * Duplica um atendimento (inclusive checklist_marcados e resultado).
 * Retorna a nova linha criada.
 */
export async function duplicarAtendimento(
  record: AtendimentoRecord,
  userId: string,
): Promise<AtendimentoRecord> {
  const copia = formToPayload(recordToForm(record), userId)
  return pb.collection(COLLECTION).create<AtendimentoRecord>({
    ...copia,
    resultado: record.resultado,
    checklist_marcados: record.checklist_marcados,
    status: statusDo(record),
  })
}

/** Exclui um atendimento e os anexos do checklist vinculados a ele. */
export async function excluirAtendimento(recordId: string): Promise<void> {
  try {
    const anexos = await pb.collection('checklist_anexos').getFullList<{ id: string }>({
      filter: `atendimento = "${recordId}"`,
      fields: 'id',
    })
    for (const anexo of anexos) {
      await pb.collection('checklist_anexos').delete(anexo.id)
    }
  } catch {
    // Sem anexos (ou falha ao listar): segue com a exclusão do atendimento.
  }
  await pb.collection(COLLECTION).delete(recordId)
}

/** Estimativa de verbas: deduz honorários de 15% quando houver resultado. */
export function valorLiquidoEstimado(record: AtendimentoRecord): number | null {
  const r = record.resultado
  if (!r || typeof r.total_bruto !== 'number') return null
  return Math.max(0, Math.round(r.total_bruto * 0.85 * 100) / 100)
}

function safeStep(step: unknown): number {
  const n = Number(step)
  return Number.isInteger(n) && n >= 1 && n <= 4 ? n : 1
}

/** "2024-05-01 00:00:00.000Z" → "2024-05-01" (formato de <input type=date>) */
function toDateInput(value: unknown): string {
  if (!value) return ''
  const s = String(value)
  return s.length >= 10 ? s.slice(0, 10) : ''
}

/** 2450.5 → "2450.5"; null/undefined → "" */
function numToInput(value: unknown): string {
  if (value === null || value === undefined) return ''
  const n = Number(value)
  return Number.isNaN(n) ? '' : String(n)
}
