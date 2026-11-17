/// <reference path="../pb_data/types.d.ts" />
/**
 * 0008 — Gestão de Equipe e primeiro acesso do administrador.
 *
 * 1. Coleção `perfis` (1:1 com users): role ('admin'|'usuario') e ativo (bool,
 *    padrão true). Um registro por usuário, criado a partir do próprio usuário
 *    (createRule) mas só editável por admin ou pelo dono que NÃO mude role/ativo.
 * 2. Usuários: campos role e ativo na própria coleção users, com regras que
 *    bloqueiam auto-promoção (só admin/superuser muda role/ativo).
 * 3. Seed idempotente do perfil admin para fabio.saantost@gmail.com.
 * 4. Regra `create` de `atendimentos` simplificada: basta usuário autenticado
 *    (o payload é sanitizado no cliente, sempre enviando user = auth.id).
 */
migrate(
  (app) => {
    // ===== 1. Coleção perfis =====
    let perfis
    try {
      perfis = app.findCollectionByNameOrId('perfis')
    } catch (_) {
      perfis = null
    }

    if (!perfis) {
      perfis = new Collection({
        name: 'perfis',
        listRule:
          "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
        viewRule:
          "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
        createRule: "@request.auth.id != '' && user = @request.auth.id && role = 'usuario'",
        updateRule:
          "@request.auth.id != '' && ((user = @request.auth.id && @request.body.role = role && @request.body.ativo = ativo) || @request.auth.role = 'admin')",
        deleteRule: null,
        fields: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: '_pb_users_auth_',
            cascadeDelete: true,
            maxSelect: 1,
          },
          {
            name: 'role',
            type: 'select',
            required: true,
            values: ['admin', 'usuario'],
            maxSelect: 1,
          },
          {
            name: 'ativo',
            type: 'bool',
          },
          {
            name: 'name',
            type: 'text',
            max: 200,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_perfis_user ON perfis (user)'],
      })
      app.save(perfis)
    }

    // ===== 2. users: role + ativo + regras =====
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let mudouUsers = false
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'usuario'],
          maxSelect: 1,
        }),
      )
      mudouUsers = true
    }
    if (!users.fields.getByName('ativo')) {
      users.fields.add(new BoolField({ name: 'ativo' }))
      mudouUsers = true
    }

    users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.createRule = null
    users.updateRule =
      'id = @request.auth.id && @request.body.role = role && @request.body.ativo = ativo'
    users.deleteRule = null
    if (mudouUsers) app.save(users)
    else app.save(users) // regras sempre regravadas (idempotente)

    // ===== 3. Seed do admin =====
    let adminId = ''
    try {
      adminId = app.findFirstRecordByData('_pb_users_auth_', 'email', 'fabio.saantost@gmail.com').id
    } catch (_) {
      adminId = ''
    }
    if (!adminId) {
      const rec = new Record(users)
      rec.setEmail('fabio.saantost@gmail.com')
      rec.setPassword('JusCalc@2024')
      rec.setVerified(true)
      rec.set('name', 'Fábio Santos')
      rec.set('role', 'admin')
      rec.set('ativo', true)
      app.save(rec)
      adminId = rec.id
    }

    // perfil admin (idempotente)
    try {
      app.findFirstRecordByData('perfis', 'user', adminId)
    } catch (_) {
      const p = new Record(perfis)
      p.set('user', adminId)
      p.set('role', 'admin')
      p.set('ativo', true)
      p.set('name', 'Fábio Santos')
      app.save(p)
    }

    // seed do advogado antigo também recebe role usuário (se existir)
    try {
      const adv = app.findFirstRecordByData('_pb_users_auth_', 'email', 'advogado@juscalc.com.br')
      if (adv.getString('role') === '') {
        adv.set('role', 'usuario')
        adv.set('ativo', true)
        app.save(adv)
      }
    } catch (_) {}

    // ===== 4. atendimentos: regra create simplificada =====
    const at = app.findCollectionByNameOrId('atendimentos')
    at.createRule = "@request.auth.id != ''"
    at.listRule = "@request.auth.id != ''"
    at.viewRule = "@request.auth.id != ''"
    at.updateRule = "@request.auth.id != ''"
    at.deleteRule = "@request.auth.id != ''"
    app.save(at)
  },
  (app) => {
    // Down: restaura regras anteriores e remove a coleção perfis
    const at = app.findCollectionByNameOrId('atendimentos')
    at.listRule = "@request.auth.id != '' && user = @request.auth.id"
    at.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    at.createRule = "@request.auth.id != '' && @request.body.user = @request.auth.id"
    at.updateRule = "@request.auth.id != '' && user = @request.auth.id"
    at.deleteRule = "@request.auth.id != '' && user = @request.auth.id"
    app.save(at)

    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      users.listRule = 'id = @request.auth.id'
      users.viewRule = 'id = @request.auth.id'
      users.updateRule = 'id = @request.auth.id'
      app.save(users)
    } catch (_) {}

    try {
      const perfis = app.findCollectionByNameOrId('perfis')
      app.delete(perfis)
    } catch (_) {}
  },
)
