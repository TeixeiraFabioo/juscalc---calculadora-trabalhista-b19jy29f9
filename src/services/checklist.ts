/**
 * BLOCO 6 — Checklist Inteligente de Documentos e Provas.
 * Geração dinâmica dos itens conforme os dados do atendimento (verbas calculadas > 0,
 * dados brutos do formulário e faltas graves da Rescisão Indireta), persistência do
 * estado no campo `checklist_marcados` do atendimento e upload de anexos na coleção
 * `checklist_anexos` (Storage nativo do PocketBase/Skip Cloud).
 */

import pb from '@/lib/pocketbase/client'
import type { AtendimentoRecord } from '@/types/atendimento'
import type { ResultadoCalculo } from '@/lib/calculo'

const ANEXOS_COLLECTION = 'checklist_anexos'

export interface ChecklistItem {
  id: string
  label: string
  group: 'obrigatorios' | 'condicionais'
  /** Grupo condicional que gerou o item (para agrupar na tela). */
  condicao?: string
  entregue: boolean
  anexos: ChecklistAnexo[]
}

export interface ChecklistAnexo {
  id: string
  nome: string
  url: string
  itemId: string
}

export interface ChecklistProgresso {
  total: number
  entregues: number
}

export interface ChecklistData {
  itens: ChecklistItem[]
  progresso: ChecklistProgresso
}

// ============ Definição dos documentos ============

/** Documentos Obrigatórios — sempre exibidos (7 itens). */
const OBRIGATORIOS: { id: string; label: string }[] = [
  { id: 'doc_foto', label: 'Documento com foto (RG/CNH)' },
  { id: 'cpf', label: 'CPF' },
  { id: 'comprovante_residencia', label: 'Comprovante de residência atualizado' },
  { id: 'ctps', label: 'CTPS (física ou PDF da Carteira Digital)' },
  { id: 'extrato_fgts', label: 'Extrato Analítico do FGTS (app FGTS)' },
  { id: 'extrato_cnis', label: 'Extrato CNIS (app Meu INSS)' },
  { id: 'procuracao', label: 'Procuração assinada' },
]

/** Obrigatórios do cenário de Reconhecimento de Vínculo: sem CTPS nem Extrato
 * FGTS (o trabalhador nunca teve carteira assinada) — no lugar, provas de vínculo. */
const OBRIGATORIOS_RECONHECIMENTO: { id: string; label: string }[] = [
  { id: 'doc_foto', label: 'Documento com foto (RG/CNH)' },
  { id: 'cpf', label: 'CPF' },
  { id: 'comprovante_residencia', label: 'Comprovante de residência atualizado' },
  { id: 'recibos_pagamento', label: 'Recibos de pagamento (ou comprovantes de PIX/depósito)' },
  { id: 'conversas_whatsapp', label: 'Conversas de WhatsApp/e-mails com a empresa' },
  { id: 'escalas_horario', label: 'Escalas de trabalho ou controles de horário' },
  { id: 'crachacesso', label: 'Crachá/cartão de acesso/e-mail corporativo' },
  { id: 'testemunhas', label: 'Contato de 2 testemunhas que viram o trabalho' },
  { id: 'extrato_cnis', label: 'Extrato CNIS (app Meu INSS)' },
  { id: 'procuracao', label: 'Procuração assinada' },
]

/** Condições dinâmicas: exibidas apenas se a verba/dado correspondente existe. */
interface Condicao {
  id: string
  titulo: string
  aplica: (r: ResultadoCalculo, rec: AtendimentoRecord) => boolean
  itens: string[]
}

const CONDICOES: Condicao[] = [
  {
    id: 'horas_extras',
    titulo: 'Jornada e Horas Extras',
    aplica: (r) => verbaValor(r, 'Horas Extras') > 0 || verbaValor(r, 'Intervalo') > 0,
    itens: [
      'Espelhos/Cartões de ponto',
      'Escalas de trabalho',
      'Conversas de WhatsApp/e-mails fora do horário',
      'Contato de 2 testemunhas',
    ],
  },
  {
    id: 'por_fora_comissoes',
    titulo: 'Salário Por Fora / Comissões',
    aplica: (r, rec) =>
      verbaPorFora(r, rec) > 0 ||
      verbaComissoes(r, rec) > 0 ||
      (rec.recebia_por_fora === 'sim' && (rec.valor_por_fora ?? 0) > 0) ||
      (rec.recebia_comissoes === 'sim' && (rec.media_comissoes ?? 0) > 0),
    itens: [
      'Extratos bancários dos últimos 12 meses',
      'Comprovantes de PIX/depósitos',
      'Relatórios de vendas/metas',
    ],
  },
  {
    id: 'adicionais',
    titulo: 'Insalubridade, Periculosidade e Adicional Noturno',
    aplica: (r) =>
      verbaValor(r, 'Insalubridade') > 0 ||
      verbaValor(r, 'Periculosidade') > 0 ||
      verbaValor(r, 'Noturno') > 0,
    itens: [
      'Fotos/vídeos do local de trabalho',
      'Fichas de entrega de EPI',
      'Exames médicos (ASO admissional/demissional)',
    ],
  },
  {
    id: 'rescisao_multas',
    titulo: 'Rescisão / Multas',
    aplica: (r) =>
      verbaGrupo(r, 'Verbas Rescisórias') > 0 ||
      verbaGrupo(r, 'Multas e Seguro-Desemprego') > 0 ||
      verbaGrupo(r, 'FGTS + Multa de 40%') > 0,
    itens: [
      'TRCT (Termo de Rescisão do Contrato de Trabalho)',
      'Aviso Prévio e comprovante de pagamento rescisório',
    ],
  },
  {
    id: 'dano_moral',
    titulo: 'Dano Moral',
    aplica: (r, rec) => verbaValor(r, 'Dano Moral') > 0 || !!rec.tem_dano_moral,
    itens: [
      'Prints de mensagens ofensivas',
      'Áudios',
      'Atestados médicos/psicológicos',
      'Testemunhas',
    ],
  },
  {
    id: 'rescisao_indireta',
    titulo: 'Rescisão Indireta — Provas da Falta Grave',
    aplica: (_r, rec) => !!rec.motivo_saida?.startsWith('Rescisão Indireta'),
    itens: (rec) => provasFaltaGrave(rec.faltas_graves ?? []),
  },
] as unknown as Condicao[]

/** Provas específicas de cada falta grave marcada na Rescisão Indireta (BLOCO 5). */
function provasFaltaGrave(faltas: string[]): string[] {
  const provas = new Set<string>()
  for (const falta of faltas) {
    switch (falta) {
      case 'Atraso frequente de salários':
        provas.add('Extratos bancários mostrando atraso de salários')
        provas.add('Comprovantes de PIX/depósitos fora do dia de pagamento')
        break
      case 'Falta de depósito do FGTS':
        provas.add('Extrato do FGTS zerado ou sem depósitos (app FGTS)')
        break
      case 'Horas extras não pagas':
        provas.add('Espelhos/Cartões de ponto com as horas excedentes')
        break
      case 'Assédio moral / Humilhações':
        provas.add('Prints de mensagens de cobrança/ofensas (WhatsApp/e-mail)')
        provas.add('Contato de testemunhas das humilhações')
        break
      case 'Desvio ou acúmulo de função':
        provas.add('Descrição de cargo e organograma da empresa')
        provas.add('Fotos/prints das atividades exercidas')
        break
      case 'Falta de EPI / Risco grave':
        provas.add('Fotos/vídeos do local sem EPI ou com risco')
        provas.add('Fichas de entrega de EPI (falta de assinatura)')
        break
      case 'Outro':
        provas.add('Documentos específicos da falta grave relatada')
        break
    }
  }
  if (provas.size === 0) {
    provas.add('Documentos que comprovem a falta grave praticada pela empresa')
  }
  return Array.from(provas)
}

/** Helper de leitura do campo condicional `itens` (string[] ou função). */
function itensDaCondicao(c: Condicao, rec: AtendimentoRecord): string[] {
  return typeof c.itens === 'function'
    ? (c.itens as (r: AtendimentoRecord) => string[])(rec)
    : c.itens
}

// ============ Leitura das verbas do resultado ============

const temTrecho = (nome: string, trecho: string) => nome.toLowerCase().includes(trecho)

function verbaValor(r: ResultadoCalculo, trecho: string): number {
  return r.verbas
    .filter((v) => temTrecho(v.nome, trecho.toLowerCase()))
    .reduce((s, v) => s + v.valor, 0)
}

function verbaGrupo(r: ResultadoCalculo, nomeGrupo: string): number {
  return r.grupos.find((g) => g.nome === nomeGrupo)?.subtotal ?? 0
}

function verbaPorFora(r: ResultadoCalculo, rec: AtendimentoRecord): number {
  // O salário "por fora" entra na base salarial — detecta pela memória do cálculo.
  if ((rec.valor_por_fora ?? 0) > 0 && r.memoria.some((m) => m.includes('por fora'))) {
    return rec.valor_por_fora ?? 0
  }
  return 0
}

function verbaComissoes(r: ResultadoCalculo, rec: AtendimentoRecord): number {
  if ((rec.media_comissoes ?? 0) > 0 && r.memoria.some((m) => m.includes('comissões'))) {
    return rec.media_comissoes ?? 0
  }
  return 0
}

// ============ Montagem do checklist ============

export function gerarChecklist(
  record: AtendimentoRecord,
  anexos: ChecklistAnexo[] = [],
): ChecklistData {
  const itens: ChecklistItem[] = []
  const r = record.resultado

  // Reconhecimento de Vínculo: troca CTPS/Extrato FGTS pelas provas de vínculo.
  const obrigatorios =
    record.motivo_saida === 'reconhecimento_vinculo' ? OBRIGATORIOS_RECONHECIMENTO : OBRIGATORIOS
  for (const doc of obrigatorios) {
    itens.push(montarItem(doc.id, doc.label, 'obrigatorios', undefined, anexos, record))
  }

  if (r) {
    for (const c of CONDICOES) {
      if (!c.aplica(r, record)) continue
      for (const label of itensDaCondicao(c, record)) {
        itens.push(
          montarItem(`${c.id}__${slug(label)}`, label, 'condicionais', c.titulo, anexos, record),
        )
      }
    }
  }

  const entregues = itens.filter((i) => i.entregue).length
  return { itens, progresso: { total: itens.length, entregues } }
}

function montarItem(
  id: string,
  label: string,
  group: ChecklistItem['group'],
  condicao: string | undefined,
  anexos: ChecklistAnexo[],
  record: AtendimentoRecord,
): ChecklistItem {
  return {
    id,
    label,
    group,
    condicao,
    entregue: marcadosDo(record).includes(id) || anexos.some((a) => a.itemId === id),
    anexos: anexos.filter((a) => a.itemId === id),
  }
}

// ============ Persistência do estado (campo checklist_marcados) ============

/** JSON do campo `checklist_marcados` — pode vir como objeto ou string do banco. */
export interface ChecklistMarcados {
  entregues: string[] // ids de itens marcados manualmente (sem anexo)
}

export function marcadosDo(record: AtendimentoRecord): string[] {
  const raw = record.checklist_marcados as unknown
  if (!raw) return []
  let parsed: ChecklistMarcados | null = null
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : (raw as ChecklistMarcados)
  } catch {
    return []
  }
  const lista = parsed?.entregues
  return Array.isArray(lista) ? lista.map(String) : []
}

export async function salvarMarcados(recordId: string, entregues: string[]): Promise<void> {
  await pb.collection('atendimentos').update(recordId, {
    checklist_marcados: { entregues } satisfies ChecklistMarcados,
  })
}

// ============ Anexos (Storage do PocketBase) ============

interface AnexoRecord {
  id: string
  item_id: string
  nome_original?: string
  arquivo: string
  collectionId: string
  collectionName: string
}

/** Lista os anexos do atendimento, com URL pública de download de cada arquivo. */
export async function listarAnexos(atendimentoId: string): Promise<ChecklistAnexo[]> {
  const list = await pb.collection(ANEXOS_COLLECTION).getFullList<AnexoRecord>({
    filter: pb.filter('atendimento = {:id}', { id: atendimentoId }),
    sort: 'created',
  })
  return list.map((rec) => ({
    id: rec.id,
    itemId: rec.item_id,
    nome: rec.nome_original || rec.arquivo,
    url: pb.files.getUrl(rec as unknown as Record<string, unknown>, rec.arquivo),
  }))
}

/** Envia um arquivo (PDF/imagem) para o Storage, vinculado ao atendimento e ao item. */
export async function enviarAnexo(
  atendimentoId: string,
  userId: string,
  itemId: string,
  file: File,
): Promise<ChecklistAnexo> {
  const rec = await pb.collection(ANEXOS_COLLECTION).create<AnexoRecord>({
    user: userId,
    atendimento: atendimentoId,
    item_id: itemId,
    arquivo: file,
    nome_original: file.name,
  })
  return {
    id: rec.id,
    itemId,
    nome: rec.nome_original || file.name,
    url: pb.files.getUrl(rec as unknown as Record<string, unknown>, rec.arquivo),
  }
}

/** Remove um anexo do Storage. */
export async function removerAnexo(anexoId: string): Promise<void> {
  await pb.collection(ANEXOS_COLLECTION).delete(anexoId)
}

// ============ Utilidades ============

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '')
    .slice(0, 60)
}

/** Texto para WhatsApp com a lista dos itens ainda não entregues. */
export function textoWhatsApp(checklist: ChecklistData, record: AtendimentoRecord): string {
  const pendentes = checklist.itens.filter((i) => !i.entregue)
  const nome = record.cliente_nome || 'Cliente'
  const empresa = record.empresa_nome || ''
  const linhas = pendentes.map((i) => `☐ ${i.label}`).join('\n')
  return (
    `*Checklist Inteligente de Documentos e Provas*\n` +
    `${nome}${empresa ? ` x ${empresa}` : ''}\n` +
    `Faltam ${pendentes.length} de ${checklist.progresso.total} documentos:\n\n` +
    linhas +
    `\n\n— Gerado pelo JusCalc`
  )
}
