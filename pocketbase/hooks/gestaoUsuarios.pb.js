/// <reference path="../pb_data/types.d.ts" />
/**
 * Gestão de Equipe — rotas admin em /backend/v1/usuarios.
 *
 * POST /backend/v1/usuarios          — cria novo usuário (admin-side, sem trocar a sessão)
 * GET  /backend/v1/usuarios          — lista usuários (id, name, email, role, ativo, created)
 * PATCH /backend/v1/usuarios/{id}    — ativa/desativa acesso (ativo true/false)
 *
 * Todas exigem um token de usuário do próprio PocketBase no header Authorization
 * cujo registro auth tenha role = 'admin' (validação server-side, não só no front).
 */
/**
 * POST /backend/v1/primeiro-acesso — público, mas ACEITA APENAS o e-mail
 * fabio.saantost@gmail.com. Cria a conta admin (ou redefine a senha, caso já
 * exista, sem duplicar) e grava/atualiza o perfil com role 'admin'.
 */
routerAdd('POST', '/backend/v1/primeiro-acesso', (e) => {
  const ADMIN_EMAIL = 'fabio.saantost@gmail.com'
  const body = e.requestInfo().body || {}
  const email = String(body.email || '')
    .trim()
    .toLowerCase()
  const senha = String(body.senha || '')

  if (email !== ADMIN_EMAIL) {
    throw new ForbiddenError(
      'Cadastro público bloqueado: somente o administrador autorizado pode definir o primeiro acesso.',
    )
  }
  if (senha.length < 8) {
    throw new BadRequestError('A senha deve ter pelo menos 8 caracteres.')
  }

  // Já existe conta? Ajusta como admin (sem duplicar). Senão, cria.
  let rec
  try {
    rec = e.app.findAuthRecordByEmail('users', email)
  } catch (_) {
    rec = null
  }

  if (rec) {
    rec.setPassword(senha)
    rec.setVerified(true)
    rec.set('role', 'admin')
    rec.set('ativo', true)
    if (rec.getString('name') === '') rec.set('name', 'Administrador')
    e.app.save(rec)
  } else {
    const users = e.app.findCollectionByNameOrId('users')
    rec = new Record(users)
    rec.setEmail(email)
    rec.setPassword(senha)
    rec.setVerified(true)
    rec.set('name', 'Administrador')
    rec.set('role', 'admin')
    rec.set('ativo', true)
    e.app.save(rec)
  }

  // Perfil 1:1 com role admin (cria ou atualiza)
  let perfil
  try {
    perfil = e.app.findFirstRecordByData('perfis', 'user', rec.id)
  } catch (_) {
    perfil = null
  }
  if (perfil) {
    perfil.set('role', 'admin')
    perfil.set('ativo', true)
    e.app.save(perfil)
  } else {
    const p = new Record(e.app.findCollectionByNameOrId('perfis'))
    p.set('user', rec.id)
    p.set('role', 'admin')
    p.set('ativo', true)
    p.set('name', rec.getString('name'))
    e.app.save(p)
  }

  return e.json(200, { ok: true, message: 'Conta de administrador definida com sucesso.' })
})

routerAdd(
  'POST',
  '/backend/v1/usuarios',
  (e) => {
    const info = e.requestInfo()
    const auth = info.auth

    if (!auth || auth.id === '') {
      throw new UnauthorizedError('Autenticação necessária.')
    }
    if (auth.getString('role') !== 'admin') {
      throw new ForbiddenError('Apenas administradores podem criar usuários.')
    }

    const body = info.body || {}
    const nome = String(body.nome_completo || '').trim()
    const email = String(body.email || '')
      .trim()
      .toLowerCase()
    const senha = String(body.senha || '')
    const perfil = String(body.perfil || 'usuario') // 'admin' | 'usuario'

    if (nome === '') throw new BadRequestError('Informe o nome completo do usuário.')
    if (email === '' || email.indexOf('@') === -1)
      throw new BadRequestError('Informe um e-mail válido.')
    if (senha.length < 8)
      throw new BadRequestError('A senha inicial deve ter pelo menos 8 caracteres.')
    if (perfil !== 'admin' && perfil !== 'usuario')
      throw new BadRequestError('Perfil inválido: use admin ou usuario.')

    // E-mail já cadastrado? Não duplicar — responder 409 com a mensagem clara.
    try {
      e.app.findAuthRecordByEmail('users', email)
      throw new BadRequestError('Já existe uma conta com este e-mail.')
    } catch (err) {
      if (err && err.message && err.message.indexOf('Já existe') !== -1) throw err
    }

    const users = e.app.findCollectionByNameOrId('users')
    const rec = new Record(users)
    rec.setEmail(email)
    rec.setPassword(senha)
    rec.setVerified(true)
    rec.set('name', nome)
    rec.set('role', perfil)
    rec.set('ativo', true)
    e.app.save(rec)

    // Garante o perfil 1:1 na coleção perfis
    try {
      e.app.findFirstRecordByData('perfis', 'user', rec.id)
    } catch (_) {
      const p = new Record(e.app.findCollectionByNameOrId('perfis'))
      p.set('user', rec.id)
      p.set('role', perfil)
      p.set('ativo', true)
      p.set('name', nome)
      e.app.save(p)
    }

    return e.json(200, {
      ok: true,
      usuario: {
        id: rec.id,
        name: rec.getString('name'),
        email: rec.email(),
        role: perfil,
        ativo: true,
      },
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/usuarios',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth || auth.id === '') {
      throw new UnauthorizedError('Autenticação necessária.')
    }
    if (auth.getString('role') !== 'admin') {
      throw new ForbiddenError('Apenas administradores podem listar usuários.')
    }

    const records = e.app.findRecordsByFilter('users', '', 'created', 200, 0)
    const lista = []
    for (const r of records) {
      lista.push({
        id: r.id,
        name: r.getString('name'),
        email: r.email(),
        role: r.getString('role') || 'usuario',
        ativo: r.getBool('ativo'),
        created: r.get('created'),
      })
    }
    return e.json(200, { ok: true, usuarios: lista })
  },
  $apis.requireAuth(),
)

routerAdd(
  'PATCH',
  '/backend/v1/usuarios/{id}',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth || auth.id === '') {
      throw new UnauthorizedError('Autenticação necessária.')
    }
    if (auth.getString('role') !== 'admin') {
      throw new ForbiddenError('Apenas administradores podem alterar acessos.')
    }

    const id = e.request.pathValue('id')
    const body = e.requestInfo().body || {}
    const ativo = !!body.ativo

    let rec
    try {
      rec = e.app.findRecordById('users', id)
    } catch (_) {
      throw new NotFoundError('Usuário não encontrado.')
    }

    // O admin não pode desativar a própria conta
    if (rec.id === auth.id && !ativo) {
      throw new BadRequestError('Você não pode desativar sua própria conta de administrador.')
    }

    rec.set('ativo', ativo)
    e.app.save(rec)

    return e.json(200, { ok: true, id: rec.id, ativo: rec.getBool('ativo') })
  },
  $apis.requireAuth(),
)
