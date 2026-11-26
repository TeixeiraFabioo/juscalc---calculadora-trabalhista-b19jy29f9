// Reconhecimento de Vínculo — trabalhador que nunca teve carteira assinada.
// Novos campos na coleção `atendimentos`:
//  - motivo_saida: novo valor de select 'reconhecimento_vinculo'
//  - incluir_multa_479: bool (checkbox da multa do Art. 479 da CLT — contrato verbal)
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('atendimentos')

    const motivo = col.fields.getByName('motivo_saida')
    if (motivo && !motivo.values.includes('reconhecimento_vinculo')) {
      motivo.values.push('reconhecimento_vinculo')
    }

    if (!col.fields.getByName('incluir_multa_479')) {
      col.fields.add(new BoolField({ name: 'incluir_multa_479' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('atendimentos')
    const motivo = col.fields.getByName('motivo_saida')
    if (motivo) {
      motivo.values = motivo.values.filter((v) => v !== 'reconhecimento_vinculo')
    }
    const multa479 = col.fields.getByName('incluir_multa_479')
    if (multa479) col.fields.removeByName('incluir_multa_479')
    app.save(col)
  },
)
