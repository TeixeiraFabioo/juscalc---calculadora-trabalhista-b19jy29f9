/**
 * BLOCO 6 — Componente do Checklist Inteligente de Documentos e Provas.
 * Checkbox persistente, upload de arquivos (PDF/imagens) para o Storage do
 * PocketBase/Skip Cloud e barra de progresso 'X de Y itens entregues'.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckSquare,
  Square,
  Paperclip,
  Loader2,
  FileText,
  Trash2,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { AtendimentoRecord } from '@/types/atendimento'
import {
  gerarChecklist,
  listarAnexos,
  marcadosDo,
  salvarMarcados,
  enviarAnexo,
  removerAnexo,
  textoWhatsApp,
  type ChecklistAnexo,
  type ChecklistData,
  type ChecklistItem,
} from '@/services/checklist'

interface Props {
  record: AtendimentoRecord
  userId: string
}

type AnexoComItem = ChecklistAnexo

export const ChecklistDocumentos: React.FC<Props> = ({ record, userId }) => {
  const { toast } = useToast()
  const [anexos, setAnexos] = useState<AnexoComItem[]>([])
  const [marcados, setMarcados] = useState<string[]>([])
  const [enviando, setEnviando] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const itemAlvoRef = useRef<string | null>(null)

  // Carrega o estado persistido (marcados + anexos) ao montar / trocar de atendimento.
  useEffect(() => {
    let active = true
    setMarcados(marcadosDo(record))
    listarAnexos(record.id)
      .then((lista) => {
        if (active) setAnexos(lista)
      })
      .catch(() => {
        /* checklist segue funcional sem os anexos pré-carregados */
      })
    return () => {
      active = false
    }
  }, [record.id])

  const checklist: ChecklistData = useMemo(
    () => gerarChecklist({ ...record, checklist_marcados: { entregues: marcados } }, anexos),
    [record, marcados, anexos],
  )

  const toggle = async (item: ChecklistItem) => {
    const novo = item.entregue ? marcados.filter((m) => m !== item.id) : [...marcados, item.id]
    setMarcados(novo)
    try {
      await salvarMarcados(record.id, novo)
    } catch {
      setMarcados(marcados)
      toast({ title: 'Erro ao salvar o status do item', variant: 'destructive' })
    }
  }

  const abrirUpload = (itemId: string) => {
    itemAlvoRef.current = itemId
    inputRef.current?.click()
  }

  const aoSelecionar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const itemId = itemAlvoRef.current
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!itemId || files.length === 0) return
    setEnviando(itemId)
    try {
      const criados: AnexoComItem[] = []
      for (const f of files) {
        criados.push(await enviarAnexo(record.id, userId, itemId, f))
      }
      setAnexos((a) => [...a, ...criados])
      toast({ title: 'Arquivo anexado ao atendimento' })
    } catch {
      toast({ title: 'Falha no envio do arquivo', variant: 'destructive' })
    } finally {
      setEnviando(null)
      itemAlvoRef.current = null
    }
  }

  const excluir = async (anexo: AnexoComItem) => {
    const anteriores = anexos
    setAnexos((a) => a.filter((x) => x.id !== anexo.id))
    try {
      await removerAnexo(anexo.id)
    } catch {
      setAnexos(anteriores)
      toast({ title: 'Falha ao remover o anexo', variant: 'destructive' })
    }
  }

  const copiarWhatsApp = async () => {
    const texto = textoWhatsApp(checklist, record)
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Fallback para navegadores sem clipboard API
      const ta = document.createElement('textarea')
      ta.value = texto
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  return (
    <section
      id="checklist-inteligente"
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:break-inside-avoid"
    >
      {/* Cabeçalho com barra de progresso */}
      <div className="p-5 border-b border-gray-100 bg-[#0F2A44] print:bg-white print:border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white print:text-[#0F2A44]">
              Checklist Inteligente de Documentos e Provas
            </h2>
            <p className="text-xs text-gray-300 print:text-gray-500 mt-0.5">
              Gerado automaticamente conforme as verbas e os dados deste atendimento.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl sm:text-2xl font-black text-[#C9A24B]">
              Documentação: {checklist.progresso.entregues} de {checklist.progresso.total} itens
              entregues
            </div>
          </div>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-white/20 print:bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#C9A24B] transition-all duration-300"
            style={{
              width: `${
                checklist.progresso.total > 0
                  ? (checklist.progresso.entregues / checklist.progresso.total) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Ações */}
      <div className="px-5 pt-4 flex flex-wrap gap-2 print:hidden">
        <Button
          variant="outline"
          onClick={copiarWhatsApp}
          className="text-xs font-bold text-[#0F2A44] border-[#25D366] hover:bg-[#25D366]/10"
        >
          {copiado ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1 text-green-600" /> Lista copiada!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1" /> Copiar Lista Pendente para WhatsApp
            </>
          )}
        </Button>
      </div>

      {/* Corpo do checklist (imprime estado) */}
      <div className="p-5 space-y-6">
        {(['obrigatorios', 'condicionais'] as const).map((grupo) => {
          const itensDoGrupo = checklist.itens.filter((i) => i.group === grupo)
          if (itensDoGrupo.length === 0) return null
          return (
            <div key={grupo} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6E82]">
                {grupo === 'obrigatorios'
                  ? 'Documentos Obrigatórios'
                  : 'Condicionais — Conforme as Verbas Calculadas'}
              </h3>

              {grupo === 'condicionais' && (
                <div className="space-y-4">
                  {Array.from(new Set(itensDoGrupo.map((i) => i.condicao))).map((cond) => {
                    const itensCond = itensDoGrupo.filter((i) => i.condicao === cond)
                    return (
                      <div key={cond} className="rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-2.5 bg-[#F4F6F9] text-xs font-extrabold text-[#0F2A44] uppercase tracking-wide">
                          {cond}
                        </div>
                        <ul className="divide-y divide-gray-100">
                          {itensCond.map((item) => (
                            <LinhaItem
                              key={item.id}
                              item={item}
                              enviando={enviando}
                              onToggle={toggle}
                              onUpload={abrirUpload}
                              onDelete={excluir}
                            />
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              )}

              {grupo === 'obrigatorios' && (
                <ul className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  {itensDoGrupo.map((item) => (
                    <LinhaItem
                      key={item.id}
                      item={item}
                      enviando={enviando}
                      onToggle={toggle}
                      onUpload={abrirUpload}
                      onDelete={excluir}
                    />
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        multiple
        className="hidden"
        onChange={aoSelecionar}
      />
    </section>
  )
}

const LinhaItem: React.FC<{
  item: ChecklistItem
  enviando: string | null
  onToggle: (item: ChecklistItem) => void
  onUpload: (itemId: string) => void
  onDelete: (a: AnexoComItem) => void
}> = ({ item, enviando, onToggle, onUpload, onDelete }) => {
  const isImage = (n: string) => /\.(png|jpe?g|gif|webp|heic)$/i.test(n)
  return (
    <li className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3 hover:bg-gray-50 print:break-inside-avoid">
      <button
        type="button"
        onClick={() => onToggle(item)}
        aria-pressed={item.entregue}
        className="flex items-start gap-2.5 flex-1 text-left print:pointer-events-none"
      >
        {item.entregue ? (
          <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <Square className="w-5 h-5 text-[#5A6E82] flex-shrink-0 mt-0.5" />
        )}
        <span
          className={`text-sm font-semibold leading-snug ${
            item.entregue ? 'text-[#0F2A44] line-through decoration-green-600/60' : 'text-[#0F2A44]'
          }`}
        >
          {item.label}
        </span>
        {enviando === item.id && (
          <Loader2 className="w-4 h-4 animate-spin text-[#C9A24B] flex-shrink-0 mt-1" />
        )}
      </button>

      {/* Anexos existentes */}
      {item.anexos.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:justify-end">
          {item.anexos.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 max-w-[180px] px-2 py-1 rounded-md bg-[#F4F6F9] border border-gray-200 text-[11px] font-semibold text-[#0F2A44] print:bg-white"
            >
              <FileText className="w-3 h-3 text-[#C9A24B] flex-shrink-0" />
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="truncate hover:underline print:text-[#0F2A44]"
                title={`Abrir ${a.nome}`}
              >
                {a.nome}
              </a>
              <button
                type="button"
                onClick={() => onDelete(a)}
                className="text-red-400 hover:text-red-600 print:hidden"
                title="Remover anexo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onUpload(item.id)}
        disabled={enviando === item.id}
        className="print:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold text-[#0F2A44] bg-[#C9A24B]/15 border border-[#C9A24B]/50 hover:bg-[#C9A24B]/25 transition-colors disabled:opacity-50 shrink-0"
      >
        <Paperclip className="w-3.5 h-3.5 text-[#C9A24B]" />
        <span>{enviando === item.id ? 'Enviando…' : 'Anexar Arquivo'}</span>
      </button>
    </li>
  )
}
