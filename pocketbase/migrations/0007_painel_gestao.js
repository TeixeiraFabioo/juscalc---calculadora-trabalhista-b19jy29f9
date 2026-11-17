/// <reference path="../pb_data/types.d.ts" />
/**
 * BLOCO 7 — Painel de Gestão e Configurações.
 *
 * 1. Coleção `atendimentos`: novo campo select `status` ("Simulação",
 *    "Aguardando Documentos", "Ajuizado") + backfill dos registros existentes
 *    com "Simulação" (default do escopo). Idempotente.
 * 2. Coleção `configuracoes_escritorio`: campos do Painel de Configurações —
 *    nome_escritorio, numero_oab, percentual_honorarios (padrão 30),
 *    texto_rodape e mensagem_whatsapp (defaults do escopo). Idempotente.
 */
migrate(
  (app) => {
    // ===== 1. atendimentos.status (select) =====
    const at = app.findCollectionByNameOrId('atendimentos')
    if (!at.fields.getByName('status')) {
      at.fields.add(
        new SelectField({
          name: 'status',
          values: ['Simulação', 'Aguardando Documentos', 'Ajuizado'],
          maxSelect: 1,
        }),
      )
      app.save(at)
    }

    // Backfill idempotente: todo atendimento sem status vira "Simulação"
    app
      .db()
      .newQuery(`
    UPDATE atendimentos SET status = {:padrao}
    WHERE status IS NULL OR status = ''
  `)
      .bind({ padrao: 'Simulação' })
      .execute()

    // ===== 2. configuracoes_escritorio: novos campos =====
    const cfg = app.findCollectionByNameOrId('configuracoes_escritorio')
    let mudou = false
    if (!cfg.fields.getByName('nome_escritorio')) {
      cfg.fields.add(new TextField({ name: 'nome_escritorio', max: 200 }))
      mudou = true
    }
    if (!cfg.fields.getByName('numero_oab')) {
      cfg.fields.add(new TextField({ name: 'numero_oab', max: 30 }))
      mudou = true
    }
    if (!cfg.fields.getByName('percentual_honorarios')) {
      cfg.fields.add(new NumberField({ name: 'percentual_honorarios' }))
      mudou = true
    }
    if (!cfg.fields.getByName('texto_rodape')) {
      cfg.fields.add(new TextField({ name: 'texto_rodape', max: 1000 }))
      mudou = true
    }
    if (!cfg.fields.getByName('mensagem_whatsapp')) {
      cfg.fields.add(new TextField({ name: 'mensagem_whatsapp', max: 2000 }))
      mudou = true
    }
    if (mudou) app.save(cfg)

    // Defaults do escopo nos registros existentes (idempotente)
    app
      .db()
      .newQuery(`
    UPDATE configuracoes_escritorio SET
      percentual_honorarios = 30,
      texto_rodape = {:rodape},
      mensagem_whatsapp = {:whats}
    WHERE texto_rodape IS NULL OR texto_rodape = ''
       OR mensagem_whatsapp IS NULL OR mensagem_whatsapp = ''
  `)
      .bind({
        rodape:
          'Documento gerado pelo JusCalc — simulação estimativa baseada nos dados informados. Não substitui a análise jurídica do caso concreto.',
        whats:
          'Olá! Preparamos a simulação dos seus direitos trabalhistas. Para avançarmos, preciso dos documentos do checklist anexo. Qualquer dúvida, estou à disposição!',
      })
      .execute()
  },
  (app) => {
    // Down: remove o campo status; os campos de texto do escritório são mantidos
    // (a reversão de dados de texto destruiria informações do usuário).
    const at = app.findCollectionByNameOrId('atendimentos')
    const status = at.fields.getByName('status')
    if (status) {
      at.fields.removeByName('status')
      app.save(at)
    }
  },
)
