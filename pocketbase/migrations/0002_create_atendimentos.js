migrate(
  (app) => {
    const collection = new Collection({
      name: 'atendimentos',
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
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },

        // Etapa 1 — Dados do Contrato e Rescisão
        { name: 'step', type: 'number', onlyInt: true, min: 1, max: 4 },
        { name: 'cliente_nome', type: 'text', max: 200 },
        { name: 'cliente_cpf', type: 'text', max: 20 },
        { name: 'empresa_nome', type: 'text', max: 200 },
        { name: 'empresa_cnpj', type: 'text', max: 20 },
        { name: 'data_admissao', type: 'date' },
        { name: 'data_saida', type: 'date' },
        {
          name: 'motivo_saida',
          type: 'select',
          maxSelect: 1,
          values: [
            'Demissão sem justa causa',
            'Pedido de demissão',
            'Justa causa',
            'Acordo (Art. 484-A)',
            'Ainda trabalhando',
            'Rescisão Indireta - Ainda trabalhando',
            'Rescisão Indireta - Já saiu',
          ],
        },
        {
          name: 'verbas_recebidas',
          type: 'select',
          maxSelect: 1,
          values: ['nao_recebeu_nada', 'recebeu_parcial', 'recebeu_tudo'],
        },
        { name: 'pago_prazo_10_dias', type: 'select', maxSelect: 1, values: ['sim', 'nao'] },
        { name: 'ja_sacou_fgts', type: 'bool' },
        { name: 'ja_recebeu_seguro_desemprego', type: 'bool' },

        // Etapa 2 — Remuneração e Jornada
        { name: 'ultimo_salario', type: 'number' },
        { name: 'recebia_por_fora', type: 'select', maxSelect: 1, values: ['sim', 'nao'] },
        { name: 'valor_por_fora', type: 'number' },
        { name: 'recebia_comissoes', type: 'select', maxSelect: 1, values: ['sim', 'nao'] },
        { name: 'media_comissoes', type: 'number' },
        { name: 'hora_entrada', type: 'text', max: 10 },
        { name: 'hora_saida', type: 'text', max: 10 },
        { name: 'minutos_intervalo', type: 'number', onlyInt: true, min: 0 },
        { name: 'dias_semana', type: 'number', onlyInt: true, min: 1, max: 7 },
        { name: 'horas_extras_uteis', type: 'number', min: 0 },
        { name: 'horas_extras_domingo', type: 'number', min: 0 },

        // Etapa 3 — Verbas, FGTS e Adicionais
        {
          name: 'situacao_fgts',
          type: 'select',
          maxSelect: 1,
          values: ['depositado_corretamente', 'nao_depositava_nada', 'depositava_alguns_meses'],
        },
        { name: 'tem_adicional_noturno', type: 'bool' },
        { name: 'horas_noturnas_semana', type: 'number', min: 0 },
        { name: 'tem_insalubridade', type: 'bool' },
        { name: 'grau_insalubridade', type: 'number', onlyInt: true },
        { name: 'tem_periculosidade', type: 'bool' },
        { name: 'tem_ferias_vencidas', type: 'bool' },
        { name: 'periodos_ferias', type: 'number', onlyInt: true, min: 1, max: 2 },
        { name: 'tem_descontos_indevidos', type: 'bool' },
        { name: 'valor_descontos', type: 'number', min: 0 },
        { name: 'tem_dano_moral', type: 'bool' },
        { name: 'valor_dano_moral', type: 'number', min: 0 },
        { name: 'incluir_multa_467', type: 'bool' },

        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_atendimentos_user ON atendimentos (user)'],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('atendimentos')
    app.delete(collection)
  },
)
