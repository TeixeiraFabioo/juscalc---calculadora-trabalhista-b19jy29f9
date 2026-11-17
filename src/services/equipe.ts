/**
 * Cliente para as rotas admin de /backend/v1/usuarios (pb_hooks — Skip Cloud).
 *
 * IMPORTANTE: a criação acontece do lado do servidor (admin-side) para NÃO
 * trocar a sessão do administrador logado — nunca usar pb.collection('users')
 * .create() no cliente para esse fim.
 */

import pb from '@/lib/pocketbase/client'

export interface UsuarioEquipe {
  id: string
  name: string
  email: string
  role: 'admin' | 'usuario'
  ativo: boolean
  created?: string
}

export interface NovoUsuarioInput {
  nome_completo: string
  email: string
  senha: string
  perfil: 'admin' | 'usuario'
}

const BASE = '/backend/v1/usuarios'

/** Lista os usuários cadastrados (rota exclusiva de admin). */
export async function listarUsuarios(): Promise<UsuarioEquipe[]> {
  const res = await pb.send<{ ok: boolean; usuarios: UsuarioEquipe[] }>(BASE, {})
  return res.usuarios ?? []
}

/** Cria um novo usuário admin-side (não troca a sessão do admin logado). */
export async function criarUsuario(input: NovoUsuarioInput): Promise<UsuarioEquipe> {
  const res = await pb.send<{ ok: boolean; usuario: UsuarioEquipe }>(BASE, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  })
  return res.usuario
}

/** Ativa/desativa o acesso de um usuário (persiste em users.ativo e perfis.ativo). */
export async function alterarAcessoUsuario(id: string, ativo: boolean): Promise<void> {
  await pb.send(`${BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ativo }),
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Extrai a mensagem técnica exata do erro (message + status) do Skip Cloud. */
export function detalhesErro(err: unknown): string {
  const anyErr = err as { status?: number; message?: string; response?: { message?: string } }
  const partes: string[] = []
  if (typeof anyErr?.status === 'number' && anyErr.status !== 0)
    partes.push(`status ${anyErr.status}`)
  const msg = anyErr?.response?.message || anyErr?.message || String(err)
  if (msg) partes.push(msg)
  return partes.join(' — ') || 'Erro desconhecido.'
}
