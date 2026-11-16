import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Plus,
  Search,
  Filter,
  FileQuestion,
  Calendar,
  Briefcase,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { getAtendimentosDoUsuario } from '@/services/atendimentos'
import type { AtendimentoRecord } from '@/types/atendimento'

const fmtData = (iso: string): string => iso.slice(0, 10).split('-').reverse().join('/')

/** Tag laranja de Rescisão Indireta (BLOCO 5). */
const TagRescisaoIndireta: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
    <AlertCircle className="w-3 h-3" />
    Rescisão Indireta
  </span>
)

export const Atendimentos: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [registros, setRegistros] = useState<AtendimentoRecord[] | null>(null)

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

  const carregando = registros === null
  const lista = registros ?? []

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F2A44]/5 text-[#0F2A44] border border-[#0F2A44]/10">
              <Users className="w-3.5 h-3.5 text-[#C9A24B]" />
              Gestão de Clientes
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

      {/* Filter and Search Bar (pre-structured) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar por cliente, reclamada ou data..."
            className="pl-9 h-10 text-sm border-gray-300 focus:border-[#C9A24B] focus:ring-[#C9A24B]"
            disabled
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            disabled
            className="text-xs font-semibold text-[#5A6E82] flex items-center gap-1.5 h-10"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar</span>
          </Button>
          <Button
            variant="outline"
            disabled
            className="text-xs font-semibold text-[#5A6E82] flex items-center gap-1.5 h-10"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Período</span>
          </Button>
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
            return (
              <Card
                key={at.id}
                className="bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/resultado?id=${at.id}`)}
              >
                <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {rescisaoIndireta && <TagRescisaoIndireta />}
                      <span className="text-sm font-bold text-[#0F2A44] truncate">
                        {at.cliente_nome || 'Cliente sem nome'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A6E82] truncate">
                      {at.empresa_nome || 'Empresa não informada'}
                    </p>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                      <Briefcase className="w-3 h-3" />
                      {at.motivo_saida || 'Motivo não informado'}
                      {at.data_admissao && (
                        <>
                          <span aria-hidden>·</span>
                          <Calendar className="w-3 h-3" />
                          {fmtData(at.data_admissao)}
                          {at.data_saida ? ` a ${fmtData(at.data_saida)}` : ' — em curso'}
                        </>
                      )}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      at.resultado ? 'bg-[#C9A24B]/15 text-[#0F2A44]' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {at.resultado ? 'Simulação pronta' : `Etapa ${at.step ?? 1}/4`}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State Card - Orienta o primeiro registro */}
      {!carregando && lista.length === 0 && (
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
    </div>
  )
}
