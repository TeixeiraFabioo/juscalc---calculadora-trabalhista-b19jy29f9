import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Plus,
  Search,
  FileQuestion,
  Calendar,
  Briefcase,
  Sparkles,
  AlertCircle,
  Loader2,
  Eye,
  Pencil,
  Copy,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  getAtendimentosDoUsuario,
  salvarStatus,
  statusDo,
  duplicarAtendimento,
  excluirAtendimento,
  valorLiquidoEstimado,
  STATUS_OPTIONS,
  type AtendimentoStatus,
} from '@/services/atendimentos'
import { gerarChecklist } from '@/services/checklist'
import { fmt } from '@/lib/calculo'
import type { AtendimentoRecord } from '@/types/atendimento'

const fmtData = (iso: string): string => iso.slice(0, 10).split('-').reverse().join('/')

const STATUS_TODOS = 'Todos'
const FILTROS_STATUS = [STATUS_TODOS, ...STATUS_OPTIONS] as const

const corDoStatus: Record<AtendimentoStatus, string> = {
  Simulação: 'bg-[#C9A24B]/15 text-[#8A6D1F] border border-[#C9A24B]/30',
  'Aguardando Documentos': 'bg-blue-50 text-blue-700 border border-blue-200',
  Ajuizado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

/** Tag laranja de Rescisão Indireta (BLOCO 5). */
const TagRescisaoIndireta: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
    <AlertCircle className="w-3 h-3" />
    Rescisão Indireta
  </span>
)

const semAcento = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export const Atendimentos: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [registros, setRegistros] = useState<AtendimentoRecord[] | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>(STATUS_TODOS)

  // Ações por linha
  const [statusPendente, setStatusPendente] = useState<string | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const [duplicandoId, setDuplicandoId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!user?.id) {
      setRegistros([])
      return
    }
    getAtendimentosDoUsuario(user.id)
      .then((recs) => {
        if (active) setRegistros(recs)
      })
      .catch(() => {
        if (active) setRegistros([])
      })
    return () => {
      active = false
    }
  }, [user?.id])

  const lista = useMemo(() => {
    const termo = semAcento(busca.trim())
    return (registros ?? []).filter((at) => {
      const casaBusca =
        termo === '' ||
        semAcento(at.cliente_nome ?? '').includes(termo) ||
        semAcento(at.empresa_nome ?? '').includes(termo)
      const casaStatus = filtroStatus === STATUS_TODOS || statusDo(at) === filtroStatus
      return casaBusca && casaStatus
    })
  }, [registros, busca, filtroStatus])

  /** Troca o status no select da linha e grava na nuvem. */
  const trocarStatus = async (rec: AtendimentoRecord, novo: AtendimentoStatus) => {
    setStatusPendente(rec.id)
    try {
      await salvarStatus(rec.id, novo)
      setRegistros((prev) =>
        (prev ?? []).map((r) => (r.id === rec.id ? { ...r, status: novo } : r)),
      )
      toast({ title: 'Status atualizado', description: `${rec.cliente_nome}: ${novo}.` })
    } catch {
      toast({
        title: 'Erro ao salvar o status',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      })
    } finally {
      setStatusPendente(null)
    }
  }

  const duplicar = async (rec: AtendimentoRecord) => {
    if (!user?.id) return
    setDuplicandoId(rec.id)
    try {
      await duplicarAtendimento(rec, user.id)
      const recs = await getAtendimentosDoUsuario(user.id)
      setRegistros(recs)
      toast({ title: 'Atendimento duplicado', description: `${rec.cliente_nome}: cópia criada.` })
    } catch {
      toast({
        title: 'Erro ao duplicar',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      })
    } finally {
      setDuplicandoId(null)
    }
  }

  const excluir = async (rec: AtendimentoRecord) => {
    setExcluindoId(rec.id)
    try {
      await excluirAtendimento(rec.id)
      setRegistros((prev) => (prev ?? []).filter((r) => r.id !== rec.id))
      toast({ title: 'Atendimento excluído', description: `${rec.cliente_nome} foi removido.` })
    } catch {
      toast({
        title: 'Erro ao excluir',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      })
    } finally {
      setExcluindoId(null)
    }
  }

  const carregando = registros === null
  const semResultados = !carregando && (registros ?? []).length > 0 && lista.length === 0

  const acoesLinha = (rec: AtendimentoRecord) => {
    const ocupado = statusPendente === rec.id || duplicandoId === rec.id || excluindoId === rec.id
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          disabled={ocupado}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/resultado?id=${rec.id}`)
          }}
          className="h-8 px-2.5 text-[11px] font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44]"
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          Abrir Resultado
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={ocupado}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/novo-atendimento?id=${rec.id}`)
          }}
          className="h-8 px-2.5 text-[11px] font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44]"
        >
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Editar Entrevista
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={ocupado}
          onClick={(e) => {
            e.stopPropagation()
            void duplicar(rec)
          }}
          className="h-8 px-2.5 text-[11px] font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44]"
        >
          {duplicandoId === rec.id ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <Copy className="w-3.5 h-3.5 mr-1" />
          )}
          Duplicar
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={ocupado}
          onClick={(e) => {
            e.stopPropagation()
            setConfirmarExclusao(rec)
          }}
          className="h-8 px-2.5 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          {excluindoId === rec.id ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5 mr-1" />
          )}
          Excluir
        </Button>
      </div>
    )
  }

  const [confirmarExclusao, setConfirmarExclusao] = useState<AtendimentoRecord | null>(null)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F2A44]/5 text-[#0F2A44] border border-[#0F2A44]/10">
              <Users className="w-3.5 h-3.5 text-[#C9A24B]" />
              CRM Jurídico
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A44] tracking-tight">
            Atendimentos Trabalhistas
          </h1>
          <p className="text-sm sm:text-base text-[#5A6E82] mt-0.5">
            Histórico completo de clientes entrevistados e simulações vinculadas.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Button
            onClick={() => navigate('/novo-atendimento')}
            className="w-full sm:w-auto bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] font-extrabold text-base py-3 px-5 rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Novo Atendimento</span>
          </Button>
        </div>
      </div>

      {/* Busca e filtro por status */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou empresa..."
            className="pl-9 h-10 text-sm border-gray-300 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {FILTROS_STATUS.map((filtro) => (
            <button
              key={filtro}
              type="button"
              onClick={() => setFiltroStatus(filtro)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filtroStatus === filtro
                  ? 'bg-[#0F2A44] text-white shadow'
                  : 'bg-[#F4F6F9] text-[#5A6E82] hover:bg-gray-200'
              }`}
            >
              {filtro}
            </button>
          ))}
        </div>
      </div>

      {carregando && (
        <div className="flex items-center justify-center py-10 text-sm text-[#5A6E82]">
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A24B] mr-2" />
          Carregando atendimentos…
        </div>
      )}

      {/* Lista de atendimentos */}
      {!carregando && lista.length > 0 && (
        <div className="space-y-3">
          {lista.map((at) => {
            const rescisaoIndireta = at.motivo_saida?.startsWith('Rescisão Indireta') ?? false
            const status = statusDo(at)
            const liquido = valorLiquidoEstimado(at)
            const checklist = gerarChecklist(at)
            const ocupado =
              statusPendente === at.id || duplicandoId === at.id || excluindoId === at.id
            return (
              <Card
                key={at.id}
                className="bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 sm:p-5 space-y-3">
                  {/* Linha 1: cliente + empresa + data + tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#0F2A44] truncate">
                          {at.cliente_nome || 'Cliente sem nome'}
                        </span>
                        {rescisaoIndireta && <TagRescisaoIndireta />}
                      </div>
                      <p className="text-xs text-[#5A6E82] truncate flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 flex-shrink-0" />
                        {at.empresa_nome || 'Empresa não informada'}
                      </p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                        <Calendar className="w-3 h-3" />
                        {at.data_admissao
                          ? `${fmtData(at.data_admissao)}${at.data_saida ? ` a ${fmtData(at.data_saida)}` : ' — em curso'}`
                          : 'Datas não informadas'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A6E82]">
                        Valor Líquido Estimado
                      </p>
                      <p className="text-base sm:text-lg font-extrabold text-[#0F2A44] tabular-nums">
                        {liquido !== null ? fmt(liquido) : '—'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {liquido !== null ? 'após honorários de 15%' : 'simulação pendente'}
                      </p>
                    </div>
                  </div>

                  {/* Linha 2: status + checklist */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6E82]">
                        Status
                      </span>
                      <div className="relative">
                        <Select
                          value={status}
                          disabled={ocupado}
                          onValueChange={(novo) => void trocarStatus(at, novo as AtendimentoStatus)}
                        >
                          <SelectTrigger
                            className={`h-8 w-auto gap-1 rounded-full border py-0 pl-3 pr-7 text-[11px] font-bold ${corDoStatus[status]}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt} className="text-xs">
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {statusPendente === at.id && (
                          <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5A6E82]">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          checklist.progresso.entregues === checklist.progresso.total
                            ? 'text-emerald-500'
                            : 'text-gray-400'
                        }`}
                      />
                      Checklist: {checklist.progresso.entregues}/{checklist.progresso.total} docs
                      <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#C9A24B] transition-all"
                          style={{
                            width: `${
                              checklist.progresso.total === 0
                                ? 0
                                : Math.round(
                                    (checklist.progresso.entregues / checklist.progresso.total) *
                                      100,
                                  )
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Linha 3: ações */}
                  {acoesLinha(at)}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Sem resultados para a busca/filtro */}
      {semResultados && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <FileQuestion className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#0F2A44]">Nenhum atendimento encontrado</h2>
          <p className="text-sm text-[#5A6E82] mt-1">
            Ajuste a busca ou o filtro de status para ver outros atendimentos.
          </p>
        </div>
      )}

      {/* Empty State Card - Orienta o primeiro registro */}
      {!carregando && (registros ?? []).length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 sm:p-14 text-center shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-[#0F2A44]/5 text-[#C9A24B] mx-auto flex items-center justify-center border border-[#C9A24B]/30 shadow-inner">
              <Briefcase className="w-10 h-10 text-[#0F2A44]" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F2A44]">
                Nenhum atendimento registrado ainda
              </h2>
              <p className="text-sm text-[#5A6E82] mt-2 leading-relaxed">
                Você ainda não possui atendimentos ou entrevistas cadastradas. Comece agora
                registrando o primeiro cliente para apurar seus direitos e simular as verbas
                rescisórias.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => navigate('/novo-atendimento')}
                className="w-full sm:w-auto bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] font-extrabold text-base py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Iniciar Primeiro Atendimento</span>
              </Button>
            </div>

            {/* Quick Guidance Box */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-left bg-[#F4F6F9] p-4 rounded-xl text-xs text-[#0F2A44]">
              <p className="font-bold flex items-center gap-1.5 text-[#0F2A44] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" />
                O que você poderá fazer após o registro:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 pl-1">
                <li>Registrar dados da rescisão, salário base e adicionais</li>
                <li>Apurar aviso prévio, férias proporcionais, 13º e FGTS com multa de 40%</li>
                <li>Simular reflexos de horas extras e danos trabalhistas</li>
                <li>Gerar resumo executivo para embasar sua petição inicial</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={confirmarExclusao !== null}
        title="Excluir atendimento?"
        description={`O atendimento de ${
          confirmarExclusao?.cliente_nome || 'cliente sem nome'
        } será excluído definitivamente, junto com os anexos do checklist. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir definitivamente"
        busy={excluindoId !== null}
        onConfirm={() => {
          const rec = confirmarExclusao
          setConfirmarExclusao(null)
          if (rec) void excluir(rec)
        }}
        onCancel={() => setConfirmarExclusao(null)}
      />
    </div>
  )
}
