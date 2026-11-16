migrate(
  (app) => {
    // 1) Campo `resultado` (JSON) na coleção atendimentos
    const atendimentos = app.findCollectionByNameOrId('atendimentos')
    if (!atendimentos.fields.getByName('resultado')) {
      atendimentos.fields.add(new JSONField({ name: 'resultado', maxSize: 2000000 }))
      app.save(atendimentos)
    }

    // 2) Coleção configuracoes_escritorio — um registro editável por usuário
    if (!app.hasTable('configuracoes_escritorio')) {
      const usersId = '_pb_users_auth_'
      const collection = new Collection({
        name: 'configuracoes_escritorio',
        type: 'base',
        listRule: "@request.auth.id != '' && user = @request.auth.id",
        viewRule: "@request.auth.id != '' && user = @request.auth.id",
        createRule: "@request.auth.id != '' && @request.body.user = @request.auth.id",
        updateRule: "@request.auth.id != '' && user = @request.auth.id",
        deleteRule: "@request.auth.id != '' && user = @request.auth.id",
        fields: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: usersId,
            cascadeDelete: true,
            maxSelect: 1,
          },
          { name: 'salario_minimo', type: 'number', min: 0 },
          { name: 'divisor_padrao', type: 'number', min: 1 },
          { name: 'percentual_dsr', type: 'number', min: 0, max: 1 },
          { name: 'percentual_fgts', type: 'number', min: 0, max: 1 },
          { name: 'multa_fgts', type: 'number', min: 0, max: 1 },
          { name: 'teto_seguro_desemprego', type: 'number', min: 0 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_config_escritorio_user ON configuracoes_escritorio (user)',
        ],
      })
      app.save(collection)
    }

    // 3) Seed idempotente: defaults para o usuário advogado existente
    try {
      const seedUser = app.findFirstRecordByData('users', 'email', 'fabio.saantost@gmail.com')
      try {
        // já existe configuração para este usuário — nada a fazer
        app.findFirstRecordByData('configuracoes_escritorio', 'user', seedUser.id)
      } catch (_) {
        const config = new Record(app.findCollectionByNameOrId('configuracoes_escritorio'))
        config.set('user', seedUser.id)
        config.set('salario_minimo', 1621.0)
        config.set('divisor_padrao', 220)
        config.set('percentual_dsr', 0.1667)
        config.set('percentual_fgts', 0.08)
        config.set('multa_fgts', 0.4)
        config.set('teto_seguro_desemprego', 2518.65)
        app.save(config)
      }
    } catch (_) {
      // usuário seed não existe — nada a popular
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('configuracoes_escritorio')
      app.delete(collection)
    } catch (_) {}
    try {
      const atendimentos = app.findCollectionByNameOrId('atendimentos')
      if (atendimentos.fields.getByName('resultado')) {
        atendimentos.fields.removeByName('resultado')
        app.save(atendimentos)
      }
    } catch (_) {}
  },
)
