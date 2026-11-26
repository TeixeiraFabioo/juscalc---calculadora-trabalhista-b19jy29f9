/// <reference path="../pb_data/types.d.ts" />
/**
 * TEMPORÁRIO — diagnóstico do erro 400 "Failed to create record" na coleção
 * `atendimentos`. Registra no log de hooks o corpo exato recebido no POST de
 * create (e o id do usuário autenticado, se houver), para fechar o diagnóstico
 * de por que o create é rejeitado.
 *
 * REMOVER assim que a causa for identificada — não altera a resposta de forma
 * alguma (apenas chama e.next()).
 */
onRecordCreateRequest((e) => {
  const info = e.requestInfo()
  const auth = info.auth
  let body = '∅'
  try {
    body = JSON.stringify(info.body || {})
  } catch (_) {
    body = '<body não serializável>'
  }
  console.log(
    '[diag-atendimentos] POST create' +
      ' | auth=' +
      (auth && auth.id !== '' ? auth.id : 'SEM AUTH') +
      ' | body=' +
      body,
  )
  e.next()
}, 'atendimentos')
