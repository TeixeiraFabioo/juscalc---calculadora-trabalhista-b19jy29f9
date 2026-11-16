import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Calculator,
  ArrowLeft,
  Download,
  Scale,
  Sparkles,
  Loader2,
  AlertCircle,
  User,
  Building2,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getAtendimento } from '@/services/atendimentos'
import { ChecklistDocumentos } from '@/components/checklist/ChecklistDocumentos'
import { useAuth } from '@/context/AuthContext'
import { imprimirResultado } from '@/lib/impressao'
import type { AtendimentoRecord } from '@/types/atendimento'
import type { ResultadoCalculo } from '@/lib/calculo'

const fmt = (v: number): string => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtData = (iso: string): string => iso.split('-').reverse().join('/')

export const Resultado: React.FC = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const id = params.get('id')
  const { user } = useAuth()

  const [record, setRecord] = useState<AtendimentoRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!id) {
      setLoading(false)
      setError('Nenhum atendimento informado. Calcule uma simulação na entrevista.')
      return
    }
    getAtendimento(id)
      .then((rec) => {
        if (!active) return
        setRecord(rec)
        if (!rec?.resultado) {
          setError(
            'Este atendimento ainda não possui simulação calculada. Conclua a entrevista e clique em "Calcular Simulação".',
          )
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar o resultado da simulação.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  const r: ResultadoCalculo | null | undefined = record?.resultado

  // BLOCO 5 — Rescisão Indireta: identificação, card explicativo e alerta de "ainda trabalhando".
  const rescisaoIndireta = !!record?.motivo_saida?.startsWith('Rescisão Indireta')
  const aindaTrabalhando =
    record?.motivo_saida === 'Rescisão Indireta - Ainda trabalhando' ||
    record?.motivo_saida === 'Ainda trabalhando'

  const grupoFgts = r?.grupos.find((g) => g.nome === 'FGTS + Multa de 40%')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Tag de identificação — Rescisão Indireta */}
      {rescisaoIndireta && (
        <div className="flex justify-start">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            Rescisão Indireta
          </span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6E82] mb-1">
            <span
              onClick={() => navigate('/atendimentos')}
              className="cursor-pointer hover:text-[#0F2A44] hover:underline"
            >
              Atendimentos
            </span>
            <span>/</span>
            <span className="text-[#C9A24B] font-bold">Resultado</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A44] tracking-tight flex items-center gap-2.5">
            <Calculator className="w-7 h-7 text-[#C9A24B]" />
            Resultado da Simulação Trabalhista
          </h1>
          <p className="text-sm sm:text-base text-[#5A6E82] mt-0.5">
            Quadro analítico estruturado para apuração de verbas rescisórias e pedidos da inicial.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => navigate('/novo-atendimento')}
            className="text-xs font-bold text-[#0F2A44] border-gray-300"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar à Entrevista</span>
          </Button>
          <Button
            onClick={imprimirResultado}
            className="bg-[#0F2A44] hover:bg-[#1A3D61] text-white text-xs font-bold flex items-center gap-1.5"
            title="Imprimir / salvar em PDF (inclui o Checklist Inteligente)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-sm text-[#5A6E82]">
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A24B] mr-2" />
          Carregando resultado…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && r && record && (
        <>
          {/* BLOCO 5 — Card explicativo dourado + alerta vermelho "ainda trabalhando" */}
          {rescisaoIndireta && (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-[#C9A24B] bg-[#C9A24B]/10 p-5 shadow-sm">
                <h2 className="text-sm sm:text-base font-extrabold text-[#0F2A44] flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#C9A24B]" />
                  O que é Rescisão Indireta?
                </h2>
                <p className="mt-1.5 text-sm sm:text-base text-[#0F2A44] leading-relaxed">
                  É quando a empresa descumpre graves obrigações do contrato. Na Justiça, você tem o
                  direito de sair recebendo todos os direitos como se tivesse sido demitido sem
                  justa causa.
                </p>
              </div>
              {aindaTrabalhando && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-red-700 leading-relaxed">
                    IMPORTANTE: Não peça demissão e não pare de trabalhar antes da orientação final
                    do advogado para não perder seus direitos.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* KPIs principais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-[#0F2A44] text-white border-none shadow-lg rounded-2xl">
              <CardContent className="p-5">
                <span className="text-xs uppercase tracking-wider text-[#C9A24B] font-bold">
                  Total Bruto da Ação
                </span>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {fmt(r.total_bruto)}
                </div>
                <p className="text-xs text-gray-300 mt-1">Soma total de todas as verbas apuradas</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-gray-200 shadow-md rounded-2xl">
              <CardContent className="p-5">
                <span className="text-xs uppercase tracking-wider text-[#5A6E82] font-bold">
                  FGTS + Multa
                </span>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-[#0F2A44] tracking-tight">
                  {fmt(grupoFgts?.subtotal ?? 0)}
                </div>
                <p className="text-xs text-[#5A6E82] mt-1">
                  Depósitos não recolhidos + indenização rescisória
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-gray-200 shadow-md rounded-2xl">
              <CardContent className="p-5">
                <span className="text-xs uppercase tracking-wider text-[#C9A24B] font-bold">
                  Base Salarial Utilizada
                </span>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-[#C9A24B] tracking-tight">
                  {fmt(r.parametros.base_salarial)}
                </div>
                <p className="text-xs text-[#5A6E82] mt-1">
                  Valor-hora de {fmt(r.parametros.valor_hora)} · divisor 220
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Parâmetros do atendimento */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F2A44] mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#C9A24B]" />
              Parâmetros do Atendimento
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#F4F6F9] rounded-xl">
                <span className="text-gray-500 block">Reclamante</span>
                <span className="font-bold text-[#0F2A44] text-sm">
                  {record.cliente_nome || '—'}
                </span>
              </div>
              <div className="p-3 bg-[#F4F6F9] rounded-xl">
                <span className="text-gray-500 block">Reclamada</span>
                <span className="font-bold text-[#0F2A44] text-sm">
                  {record.empresa_nome || '—'}
                </span>
              </div>
              <div className="p-3 bg-[#F4F6F9] rounded-xl">
                <span className="text-gray-500 block flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Período Contratual
                </span>
                <span className="font-bold text-[#0F2A44] text-sm">
                  {record.data_admissao ? fmtData(record.data_admissao.slice(0, 10)) : '—'} a{' '}
                  {record.data_saida ? fmtData(record.data_saida.slice(0, 10)) : '—'}
                </span>
              </div>
              <div className="p-3 bg-[#F4F6F9] rounded-xl">
                <span className="text-gray-500 block">Modalidade Rescisória</span>
                <span className="font-bold text-[#0F2A44] text-sm">
                  {record.motivo_saida || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Quadro de verbas por grupo */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-[#0F2A44]">
                Quadro Demonstrativo de Verbas Rescisórias
              </h2>
              <p className="text-xs text-[#5A6E82]">
                Estrutura discriminada das verbas apuradas conforme a CLT e legislação vigente.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#0F2A44] text-white">
                    <th className="py-3 px-4 font-bold">Verba Rescisória</th>
                    <th className="py-3 px-4 font-bold">Fundamento Legal</th>
                    <th className="py-3 px-4 font-bold">Base / Proporção</th>
                    <th className="py-3 px-4 font-bold text-right">Valor Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium text-[#0F2A44]">
                  {r.verbas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 px-4 text-center text-gray-400 italic">
                        Nenhuma verba apurada para os dados informados.
                      </td>
                    </tr>
                  )}
                  {r.verbas.map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">{v.nome}</td>
                      <td className="py-3 px-4 text-gray-500">{v.fundamento}</td>
                      <td className="py-3 px-4 text-gray-500">{v.base}</td>
                      <td className="py-3 px-4 text-right font-mono">{fmt(v.valor)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {r.grupos.map((g) => (
                    <tr key={g.nome} className="bg-[#F4F6F9] font-bold text-[#0F2A44]">
                      <td
                        colSpan={3}
                        className="py-2.5 px-4 text-right text-xs uppercase tracking-wider"
                      >
                        Subtotal — {g.nome}:
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">{fmt(g.subtotal)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#0F2A44] border-t-2 border-[#C9A24B] font-bold text-white">
                    <td
                      colSpan={3}
                      className="py-4 px-4 text-right uppercase tracking-wider text-xs"
                    >
                      Total Bruto da Ação:
                    </td>
                    <td className="py-4 px-4 text-right text-base sm:text-lg font-black text-[#C9A24B]">
                      {fmt(r.total_bruto)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Memória de cálculo */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A24B]" />
              <h2 className="text-base sm:text-lg font-bold text-[#0F2A44]">Memória de Cálculo</h2>
            </div>
            <ol className="p-5 space-y-2.5 list-decimal list-inside text-xs sm:text-sm text-[#0F2A44]">
              {r.memoria.map((m, i) => (
                <li key={i} className="leading-relaxed">
                  {m}
                </li>
              ))}
            </ol>
            {r.aviso_seguro_desemprego && (
              <div className="mx-5 mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-semibold">
                {r.aviso_seguro_desemprego}
              </div>
            )}
          </div>

          {/* BLOCO 6 — Checklist Inteligente de Documentos e Provas */}
          {user && <ChecklistDocumentos record={record} userId={user.id} />}

          {/* Footer Nav Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200 print:hidden">
            <p className="text-xs text-[#5A6E82]">
              Simulação gerada pelo motor de cálculo do JusCalc e salva no atendimento.
            </p>{' '}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/novo-atendimento')}
                className="text-xs font-bold text-[#0F2A44]"
              >
                Editar Entrevista
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] text-xs font-extrabold"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
