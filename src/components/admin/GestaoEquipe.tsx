import React, { useCallback, useEffect, useState } from 'react'
import { Loader2, UserPlus, Users, ShieldCheck, ShieldOff, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  listarUsuarios,
  criarUsuario,
  alterarAcessoUsuario,
  detalhesErro,
  type UsuarioEquipe,
} from '@/services/equipe'
import { cn } from '@/lib/utils'

const emptyForm = {
  nome_completo: '',
  email: '',
  senha: '',
  perfil: 'usuario' as 'admin' | 'usuario',
}

export const GestaoEquipe: React.FC = () => {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<UsuarioEquipe[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [salvando, setSalvando] = useState(false)
  const [toggleando, setToggleando] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      setUsuarios(await listarUsuarios())
    } catch (err) {
      setErro(detalhesErro(err))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)

    if (form.nome_completo.trim() === '') {
      setErro('Informe o nome completo.')
      return
    }
    if (form.email.trim() === '' || !form.email.includes('@')) {
      setErro('Informe um e-mail válido.')
      return
    }
    if (form.senha.length < 8) {
      setErro('A senha inicial deve ter pelo menos 8 caracteres.')
      return
    }

    setSalvando(true)
    try {
      const novo = await criarUsuario({
        nome_completo: form.nome_completo.trim(),
        email: form.email.trim(),
        senha: form.senha,
        perfil: form.perfil,
      })
      setUsuarios((prev) => [...prev, novo])
      setForm(emptyForm)
      toast({
        title: 'Usuário cadastrado',
        description: `${novo.name} agora tem acesso ao JusCalc.`,
      })
    } catch (err) {
      setErro(detalhesErro(err))
      toast({
        title: 'Erro ao cadastrar usuário',
        description: detalhesErro(err),
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  const handleToggle = async (u: UsuarioEquipe) => {
    setToggleando(u.id)
    setErro(null)
    try {
      await alterarAcessoUsuario(u.id, !u.ativo)
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, ativo: !u.ativo } : x)))
    } catch (err) {
      setErro(detalhesErro(err))
      toast({
        title: 'Erro ao alterar acesso',
        description: detalhesErro(err),
        variant: 'destructive',
      })
    } finally {
      setToggleando(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulário de cadastro */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-[#C9A24B]" />
          <h3 className="text-base font-bold text-[#0F2A44]">Cadastrar Novo Usuário</h3>
        </div>

        <form onSubmit={handleCadastrar} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="eq-nome" className="text-xs font-semibold text-[#0F2A44]">
              Nome Completo *
            </Label>
            <Input
              id="eq-nome"
              value={form.nome_completo}
              onChange={(e) => setForm({ ...form, nome_completo: e.target.value })}
              placeholder="Dr. João da Silva"
              className="mt-1 h-10 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="eq-email" className="text-xs font-semibold text-[#0F2A44]">
              E-mail *
            </Label>
            <Input
              id="eq-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="joao@escritorio.com.br"
              className="mt-1 h-10 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="eq-senha" className="text-xs font-semibold text-[#0F2A44]">
              Senha Inicial (mín. 8 caracteres) *
            </Label>
            <Input
              id="eq-senha"
              type="text"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              placeholder="Defina uma senha provisória"
              className="mt-1 h-10 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#0F2A44]">Perfil *</Label>
            <div className="mt-1 flex items-center gap-4 h-10">
              {(['usuario', 'admin'] as const).map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-1.5 text-sm text-[#0F2A44] cursor-pointer"
                >
                  <input
                    type="radio"
                    name="eq-perfil"
                    checked={form.perfil === p}
                    onChange={() => setForm({ ...form, perfil: p })}
                    className="accent-[#0F2A44]"
                  />
                  {p === 'admin' ? 'Administrador' : 'Usuário'}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={salvando}
              className="w-full sm:w-auto bg-[#0F2A44] hover:bg-[#1A3D61] text-white font-bold text-sm"
            >
              {salvando ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <UserPlus className="w-4 h-4 mr-1.5" />
              )}
              Cadastrar Usuário
            </Button>
            <p className="mt-2 text-[11px] text-[#5A6E82]">
              A conta é criada no servidor sem encerrar a sua sessão de administrador.
            </p>
          </div>
        </form>

        {erro && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <ShieldOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="break-all">{erro}</span>
          </div>
        )}
      </div>

      {/* Lista de usuários */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#C9A24B]" />
          <h3 className="text-base font-bold text-[#0F2A44]">Usuários Cadastrados</h3>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-10 text-sm text-[#5A6E82]">
            <Loader2 className="w-5 h-5 animate-spin text-[#C9A24B] mr-2" />
            Carregando usuários…
          </div>
        ) : usuarios.length === 0 ? (
          <p className="text-sm text-[#5A6E82] py-6 text-center">
            Nenhum usuário cadastrado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-bold text-[#5A6E82]">Nome</TableHead>
                  <TableHead className="text-xs font-bold text-[#5A6E82]">E-mail</TableHead>
                  <TableHead className="text-xs font-bold text-[#5A6E82]">Perfil</TableHead>
                  <TableHead className="text-xs font-bold text-[#5A6E82]">Acesso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-sm font-semibold text-[#0F2A44]">
                      <div className="flex items-center gap-1.5">
                        {u.role === 'admin' && <Shield className="w-3.5 h-3.5 text-[#C9A24B]" />}
                        {u.name || '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#5A6E82]">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[11px] font-semibold',
                          u.role === 'admin'
                            ? 'border-[#C9A24B] text-[#8A6A1F] bg-[#C9A24B]/10'
                            : 'border-gray-300 text-[#5A6E82]',
                        )}
                      >
                        {u.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {toggleando === u.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A24B]" />
                        )}
                        <Switch
                          checked={u.ativo}
                          onCheckedChange={() => handleToggle(u)}
                          disabled={toggleando === u.id}
                          aria-label={`Ativar/desativar acesso de ${u.name}`}
                        />
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            u.ativo ? 'text-emerald-700' : 'text-red-600',
                          )}
                        >
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {erro && !carregando && usuarios.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <ShieldOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="break-all">{erro}</span>
          </div>
        )}
      </div>
    </div>
  )
}
