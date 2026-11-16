migrate(
  (app) => {
    // Seed idempotente: defaults das configurações do escritório
    // para o usuário advogado real desta instância.
    try {
      const seedUser = app.findFirstRecordByData('users', 'email', 'advogado@juscalc.com.br')
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
      const user = app.findFirstRecordByData('users', 'email', 'advogado@juscalc.com.br')
      const config = app.findFirstRecordByData('configuracoes_escritorio', 'user', user.id)
      app.delete(config)
    } catch (_) {}
  },
)
