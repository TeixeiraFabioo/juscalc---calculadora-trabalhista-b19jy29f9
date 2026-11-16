// BLOCO 5 — Engrenagem de Rescisão Indireta.
// Novos campos na coleção `atendimentos`:
//  - faltas_graves: select múltiplo (maxSelect 7) com os motivos de falta grave da empresa
//  - data_ultimo_fato_grave: date (data aproximada do último fato grave)
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('atendimentos')

    if (!col.fields.getByName('faltas_graves')) {
      col.fields.add(
        new SelectField({
          name: 'faltas_graves',
          maxSelect: 7,
          values: [
            'Atraso frequente de salários',
            'Falta de depósito do FGTS',
            'Horas extras não pagas',
            'Assédio moral / Humilhações',
            'Desvio ou acúmulo de função',
            'Falta de EPI / Risco grave',
            'Outro',
          ],
        }),
      )
    }

    if (!col.fields.getByName('data_ultimo_fato_grave')) {
      col.fields.add(new DateField({ name: 'data_ultimo_fato_grave' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('atendimentos')
    const faltas = col.fields.getByName('faltas_graves')
    if (faltas) col.fields.removeByName('faltas_graves')
    const data = col.fields.getByName('data_ultimo_fato_grave')
    if (data) col.fields.removeByName('data_ultimo_fato_grave')
    app.save(col)
  },
)
