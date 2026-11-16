/**
 * BLOCO 6 — Checklist Inteligente de Documentos e Provas.
 * Migração: adiciona campo `checklist_marcados` (json) na coleção `atendimentos`
 * (persistência do estado entregue/pendente de cada item do checklist)
 * e cria a coleção auxiliar `checklist_anexos` para os arquivos enviados
 * para o Storage do PocketBase/Skip Cloud, vinculados ao atendimento.
 */
migrate(
  (app) => {
    const atend = app.findCollectionByNameOrId('atendimentos')
    if (!atend.fields.getByName('checklist_marcados')) {
      atend.fields.add(new JSONField({ name: 'checklist_marcados', maxSize: 200000 }))
    }
    app.save(atend)

    const atendId = app.findCollectionByNameOrId('atendimentos').id
    const usersId = '_pb_users_auth_'

    const collection = new Collection({
      name: 'checklist_anexos',
      type: 'base',
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule:
        '@request.auth.id != "" && @request.body.user = @request.auth.id && @request.body.atendimento != ""',
      updateRule: '@request.auth.id != "" && user = @request.auth.id',
      deleteRule: '@request.auth.id != "" && user = @request.auth.id',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'atendimento',
          type: 'relation',
          required: true,
          collectionId: atendId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'item_id',
          type: 'text',
          required: true,
          min: 1,
          max: 100,
        },
        { name: 'arquivo', type: 'file', required: true, maxSelect: 1, maxSize: 20971520 },
        { name: 'nome_original', type: 'text', max: 200 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    collection.addIndex('idx_checklist_anexos_atendimento', false, 'atendimento', '')
    app.save(collection)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('checklist_anexos')
    app.delete(col)
    const atend = app.findCollectionByNameOrId('atendimentos')
    if (atend.fields.getByName('checklist_marcados')) {
      atend.fields.removeByName('checklist_marcados')
      app.save(atend)
    }
  },
)
