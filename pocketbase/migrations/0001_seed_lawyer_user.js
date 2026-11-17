migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Idempotent: check if test lawyer user exists
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'advogado@juscalc.com.br')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('advogado@juscalc.com.br')
    record.setPassword('Skip@Pass123')
    record.setVerified(true)
    record.set('name', 'Dr. Fábio Teixeira')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'advogado@juscalc.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
