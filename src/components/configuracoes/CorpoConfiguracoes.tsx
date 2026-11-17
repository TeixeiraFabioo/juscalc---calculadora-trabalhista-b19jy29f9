import React, { useRef } from 'react'
import {
  Building,
  KeyRound,
  Loader2,
  RotateCcw,
  Download,
  Upload,
  Cloud,
  Percent,
  FileText,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ConfigPainel } from '@/services/configuracoes'

interface CorpoConfiguracoesProps {
  cfg: ConfigPainel
  email: string
  salvando: boolean
  restaurando: boolean
  isResetting: boolean
  onSet: <K extends keyof ConfigPainel>(campo: K, valor: ConfigPainel[K]) => void
  onSubmit: (e: React.FormEvent) => void
  onPedirRestaurar: () => void
  onExportar: () => void
  onImportar: (file: File) => void
  onPasswordReset: () => void
}

/**
 * Corpo do formulário de configurações do escritório (blocos 1-4 + barra de ações).
 * Usado tanto na aba "Escritório" (admin) quanto na tela inteira (usuário comum).
 */
export const CorpoConfiguracoes: React.FC<CorpoConfiguracoesProps> = ({
  cfg,
  email,
  salvando,
  restaurando,
  isResetting,
  onSet,
  onSubmit,
  onPedirRestaurar,
  onExportar,
  onImportar,
  onPasswordReset,
}) => {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Bloco 1: Identificação */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-[#0F2A44] text-[#C9A24B] flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F2A44]">Identificação Profissional</h2>
            <p className="text-xs text-[#5A6E82]">
              Dados usados no cabeçalho das simulações e apresentações.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <Label htmlFor="office-name" className="text-xs font-semibold text-[#0F2A44]">
              Nome do Escritório
            </Label>
            <Input
              id="office-name"
              value={cfg.nome_escritorio}
              onChange={(e) => onSet('nome_escritorio', e.target.value)}
              placeholder="Ex: Silveira Advogados Associados"
              className="mt-1 h-10 text-sm"
            />
          </div>

          <div>
            <Label htmlFor="office-oab" className="text-xs font-semibold text-[#0F2A44]">
              Número OAB
            </Label>
            <Input
              id="office-oab"
              value={cfg.numero_oab}
              onChange={(e) => onSet('numero_oab', e.target.value)}
              placeholder="Ex: 123.456/SP"
              className="mt-1 h-10 text-sm"
            />
          </div>

          <div>
            <Label htmlFor="lawyer-email" className="text-xs font-semibold text-[#0F2A44]">
              E-mail de Login
            </Label>
            <Input
              id="lawyer-email"
              value={email}
              disabled
              className="mt-1 h-10 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Bloco 2: Parâmetros financeiros */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-[#C9A24B] text-[#0F2A44] flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F2A44]">Parâmetros Financeiros</h2>
            <p className="text-xs text-[#5A6E82]">
              Valores usados pelo motor de cálculo nas simulações.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <Label htmlFor="cfg-honorarios" className="text-xs font-semibold text-[#0F2A44]">
              Percentual padrão de Honorários (%)
            </Label>
            <Input
              id="cfg-honorarios"
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={cfg.percentual_honorarios}
              onChange={(e) => onSet('percentual_honorarios', Number(e.target.value))}
              className="mt-1 h-10 text-sm"
            />
          </div>

          <div>
            <Label htmlFor="cfg-salario" className="text-xs font-semibold text-[#0F2A44]">
              Salário Mínimo vigente (R$)
            </Label>
            <Input
              id="cfg-salario"
              type="number"
              step="0.01"
              min="0"
              value={cfg.salario_minimo}
              onChange={(e) => onSet('salario_minimo', Number(e.target.value))}
              className="mt-1 h-10 text-sm"
            />
          </div>

          <div>
            <Label htmlFor="cfg-teto" className="text-xs font-semibold text-[#0F2A44]">
              Teto do Seguro-Desemprego (R$)
            </Label>
            <Input
              id="cfg-teto"
              type="number"
              step="0.01"
              min="0"
              value={cfg.teto_seguro_desemprego}
              onChange={(e) => onSet('teto_seguro_desemprego', Number(e.target.value))}
              className="mt-1 h-10 text-sm"
            />
          </div>

          <div>
            <Label htmlFor="cfg-divisor" className="text-xs font-semibold text-[#0F2A44]">
              Divisor padrão
            </Label>
            <Input
              id="cfg-divisor"
              type="number"
              step="1"
              min="1"
              value={cfg.divisor_padrao}
              onChange={(e) => onSet('divisor_padrao', Number(e.target.value))}
              className="mt-1 h-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Bloco 3: Textos padrão */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-[#1A3D61] text-white flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F2A44]">Textos Padrão</h2>
            <p className="text-xs text-[#5A6E82]">
              Usados na apresentação do cálculo e no envio ao cliente.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          <div>
            <Label htmlFor="cfg-rodape" className="text-xs font-semibold text-[#0F2A44]">
              Texto padrão do rodapé da apresentação
            </Label>
            <textarea
              id="cfg-rodape"
              value={cfg.texto_rodape}
              onChange={(e) => onSet('texto_rodape', e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] focus-visible:border-[#C9A24B]"
            />
          </div>

          <div>
            <Label htmlFor="cfg-whatsapp" className="text-xs font-semibold text-[#0F2A44]">
              Mensagem padrão de envio no WhatsApp
            </Label>
            <textarea
              id="cfg-whatsapp"
              value={cfg.mensagem_whatsapp}
              onChange={(e) => onSet('mensagem_whatsapp', e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] focus-visible:border-[#C9A24B]"
            />
          </div>
        </div>
      </div>

      {/* Bloco 4: Segurança e Senha */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-[#1A3D61] text-white flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F2A44]">Segurança e Autenticação</h2>
            <p className="text-xs text-[#5A6E82]">
              Gerenciamento de credenciais e acesso à área reservada.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F4F6F9] border border-gray-200">
          <div>
            <p className="text-sm font-bold text-[#0F2A44]">Redefinir Senha de Acesso</p>
            <p className="text-xs text-[#5A6E82] mt-0.5">
              Enviaremos um link de alteração de senha para{' '}
              <span className="font-semibold text-[#0F2A44]">{email}</span>.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={isResetting}
            onClick={onPasswordReset}
            className="text-xs font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44] flex-shrink-0"
          >
            <KeyRound className="w-3.5 h-3.5 mr-1.5" />
            <span>{isResetting ? 'Solicitando...' : 'Enviar Link de Redefinição'}</span>
          </Button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            disabled={restaurando || salvando}
            onClick={onPedirRestaurar}
            className="text-xs font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44] h-10 flex items-center justify-center gap-1.5"
          >
            {restaurando ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>Restaurar Padrões</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!cfg}
            onClick={onExportar}
            className="text-xs font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44] h-10 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Backup (JSON)</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!cfg}
            onClick={() => fileRef.current?.click()}
            className="text-xs font-bold text-[#0F2A44] border-gray-300 hover:border-[#0F2A44] h-10 flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Backup (JSON)</span>
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImportar(file)
              e.target.value = ''
            }}
          />
        </div>

        <Button
          type="submit"
          disabled={salvando}
          className="w-full sm:w-auto bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] font-extrabold text-sm py-2.5 px-6 rounded-lg shadow-md flex items-center justify-center gap-2"
        >
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
          <span>{salvando ? 'Salvando...' : 'Salvar na Nuvem'}</span>
        </Button>
      </div>
    </form>
  )
}
