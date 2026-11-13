/**
 * ============================================================================
 *  FORMULÁRIO GOOGLE — AVALIAÇÃO DO DESEMPENHO DO PROFESSOR A TEMPO INTEIRO
 *  Baseado no "Apêndice 3: Modelo de Avaliação do Desempenho do Professor,
 *  a tempo inteiro" (Quadro 1 e Quadro 2).
 *
 *  COMO USAR (resumo — ver LEIA-ME.md):
 *   1. Abrir https://script.google.com  →  "Novo projecto".
 *   2. Apagar o conteúdo de Code.gs e colar TODO este ficheiro.
 *   3. Guardar e executar a função  criarFormulario  (autorizar quando pedir).
 *   4. Ver os links do formulário e da folha de respostas em "Registo de execução".
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1. DADOS DO MODELO (critérios e pontuações básicas máximas)
// ---------------------------------------------------------------------------
const QUADRO_1 = {
  codigo: 'Q1',
  titulo: 'Quadro 1 — Professor a tempo inteiro COM Função de Coordenação Científica e Pedagógica',
  subtitulo: '(Coordenadores de Departamento, Curso e/ou Programa)',
  padroes: [
    {
      nome: 'Docência', peso: '50% = 50 pontos', max: 50,
      criterios: [
        ['Acompanhamento e tutoria na Plataforma Moodle', 3.20],
        ['Participação na concepção/revisão de planos curriculares (1.º, 2.º, 3.º ciclos)', 4.30],
        ['Facilitação de aulas teóricas, teórico-práticas, práticas laboratoriais e seminários (1.º, 2.º, 3.º ciclos)', 16.40],
        ['Orientação/Co-orientação tutorial e acompanhamento de trabalhos finais de programas (1.º, 2.º, 3.º ciclos)', 12.00],
        ['Participação em júris de defesas públicas de trabalhos científicos (1.º, 2.º, 3.º ciclos)', 2.00],
        ['Participação na produção de materiais didáctico-pedagógicos e publicados na Plataforma Moodle da UCM', 9.65],
        ['Participação na formação profissional e aperfeiçoamento pedagógico no campo da psicopedagogia', 2.45],
      ],
    },
    { nome: 'Investigação', peso: '40% = 40 pontos', max: 40, criterios: null /* preenchido abaixo */ },
    {
      nome: 'Gestão académica — coordenação científica e pedagógica', peso: '10% = 10 pontos', max: 10,
      criterios: [
        ['Coordenação científica e pedagógica de curso, programa ou Centro de Investigação e Regência de Unidades Curriculares (1.º, 2.º, 3.º ciclos)', 6.50],
        ['Gestão/Extensão universitária', 2.50],
        ['Consultoria ou prestação de serviços especializados', 1.00],
      ],
    },
  ],
};

const CRITERIOS_INVESTIGACAO = [
  ['Comunicações orais/poster em encontros científicos nacionais/internacionais', 2.00],
  ['Coordenação técnico-científica de projectos de investigação', 5.45],
  ['Editor/Corpo editorial de publicação periódica no âmbito nacional/internacional', 3.30],
  ['Participação na organização de eventos científicos', 4.00],
  ['Orientação/co-orientação científica de trabalhos finais de curso (monografias/dissertações/teses)', 9.30],
  ['Participação em júris de defesas públicas de trabalhos científicos', 4.10],
  ['Publicação de artigos em actas de encontros científicos/revistas científicas nacionais/internacionais com arbitragem (revisão de pares, "revista indexada")', 3.70],
  ['Publicação de capítulo de livro com avaliação científica e com/sem revisão de pares', 3.15],
  ['Publicação de livros em Editoras Nacionais/Internacionais (com/sem avaliação científica e com revisão de pares)', 5.00],
];
QUADRO_1.padroes[1].criterios = CRITERIOS_INVESTIGACAO;

const QUADRO_2 = {
  codigo: 'Q2',
  titulo: 'Quadro 2 — Professor a tempo inteiro SEM Função de Gestão',
  subtitulo: '',
  padroes: [
    {
      nome: 'Docência', peso: '60% = 60 pontos', max: 60,
      criterios: [
        ['Acompanhamento e tutoria na Plataforma Moodle', 7.20],
        ['Participação na concepção/revisão de planos curriculares (1.º, 2.º, 3.º ciclos)', 5.30],
        ['Facilitação de aulas teóricas, teórico-práticas, práticas laboratoriais e seminários (1.º, 2.º, 3.º ciclos)', 20.40],
        ['Orientação/Co-orientação tutorial e acompanhamento de trabalhos finais de programas (1.º, 2.º, 3.º ciclos)', 12.95],
        ['Participação em júris de defesas públicas de trabalhos científicos (1.º, 2.º, 3.º ciclos)', 3.50],
        ['Produção de materiais didáctico-pedagógicos e publicados na Plataforma Moodle da UCM', 7.65],
        ['Formação profissional e aperfeiçoamento pedagógico no campo da psicopedagogia', 3.00],
      ],
    },
    { nome: 'Investigação', peso: '40% = 40 pontos', max: 40, criterios: CRITERIOS_INVESTIGACAO },
  ],
};

const OPCAO_Q1 = 'Professor COM Função de Coordenação Científica e Pedagógica (Coordenador de Departamento, Curso e/ou Programa) — Quadro 1';
const OPCAO_Q2 = 'Professor SEM Função de Gestão — Quadro 2';

// ---------------------------------------------------------------------------
// 2. CRIAÇÃO DO FORMULÁRIO
// ---------------------------------------------------------------------------
function criarFormulario() {
  const form = FormApp.create('Avaliação do Desempenho do Professor a Tempo Inteiro');
  form.setDescription(
    'Apêndice 3 — Modelo de Avaliação do Desempenho do Professor, a tempo inteiro.\n\n' +
    'Instruções:\n' +
    '• Preencha os dados do professor avaliado.\n' +
    '• Seleccione o tipo de função; o formulário mostrará apenas o quadro de critérios aplicável.\n' +
    '• Em cada critério, atribua a pontuação obtida entre 0 e a pontuação básica máxima indicada ' +
    '(use ponto ou vírgula para as casas decimais, ex.: 3.20). Atribua 0 quando a actividade não foi realizada.\n' +
    '• Em cada padrão pode indicar as evidências (ex.: n.º de turmas, títulos de publicações, links Moodle).\n' +
    '• A pontuação total (máx. 100 pontos) é calculada automaticamente na folha de respostas.'
  );
  form.setCollectEmail(true);
  form.setProgressBar(true);
  form.setAllowResponseEdits(true);
  form.setConfirmationMessage('Obrigado! A avaliação foi registada com sucesso.');

  const mapa = {}; // itemId -> { quadro, padrao }
  const ids = {};

  // --- Secção 1: Dados do professor avaliado ---
  form.addSectionHeaderItem().setTitle('DADOS DO PROFESSOR AVALIADO');
  ids.nome = form.addTextItem().setTitle('Nome').setRequired(true).getId();
  form.addTextItem().setTitle('Unidade Básica/Extensão').setRequired(true);
  form.addTextItem().setTitle('Departamento').setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Categoria Profissional')
    .setChoiceValues(['Professor Catedrático', 'Professor Associado', 'Professor Auxiliar', 'Assistente', 'Assistente Estagiário'])
    .showOtherOption(true)
    .setRequired(true);
  form.addTextItem()
    .setTitle('Período de Avaliação')
    .setHelpText('Ex.: Janeiro a Dezembro de 2026 / 1.º Semestre de 2026')
    .setRequired(true);

  // --- Secção 2: Tipo de função (ramificação) ---
  form.addPageBreakItem().setTitle('TIPO DE FUNÇÃO DO PROFESSOR');
  const tipo = form.addMultipleChoiceItem()
    .setTitle('Qual é a função do professor avaliado?')
    .setHelpText('Esta escolha define o quadro de critérios de verificação a aplicar.')
    .setRequired(true);
  ids.tipo = tipo.getId();

  // --- Quadros 1 e 2 ---
  const inicioQ1 = adicionarQuadro_(form, QUADRO_1, mapa);
  const inicioQ2 = adicionarQuadro_(form, QUADRO_2, mapa);

  // --- Secção final ---
  const paginaFinal = form.addPageBreakItem().setTitle('APRECIAÇÃO FINAL E IDENTIFICAÇÃO DO AVALIADOR');
  form.addParagraphTextItem().setTitle('Pontos fortes do desempenho');
  form.addParagraphTextItem().setTitle('Aspectos a melhorar / recomendações');
  form.addTextItem().setTitle('Nome do Avaliador').setRequired(true);
  form.addTextItem().setTitle('Cargo/Função do Avaliador').setRequired(true);
  form.addDateItem().setTitle('Data da avaliação').setRequired(true);
  form.addCheckboxItem()
    .setTitle('Declaração')
    .setChoiceValues(['Declaro que a pontuação atribuída se baseia em evidências verificáveis do período de avaliação.'])
    .setRequired(true);

  // Ramificação: escolha do tipo -> quadro correspondente; fim do Quadro 1 -> secção final
  tipo.setChoices([tipo.createChoice(OPCAO_Q1, inicioQ1.primeira), tipo.createChoice(OPCAO_Q2, inicioQ2.primeira)]);
  // A última secção do Quadro 1 deve saltar o Quadro 2 e ir para a secção final
  inicioQ1.ultima.setGoToPage(paginaFinal);

  // --- Folha de respostas e cálculo automático ---
  const ss = SpreadsheetApp.create('Respostas — Avaliação do Desempenho do Professor');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  const resumo = ss.insertSheet('Pontuações');
  resumo.appendRow(['Data/Hora', 'Professor avaliado', 'Quadro aplicado', 'Docência', 'Investigação', 'Gestão académica', 'TOTAL (máx. 100)']);
  resumo.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#1a5276').setFontColor('#ffffff');
  resumo.setFrozenRows(1);

  PropertiesService.getScriptProperties().setProperties({
    MAPA: JSON.stringify(mapa),
    IDS: JSON.stringify(ids),
    PLANILHA: ss.getId(),
  });

  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('aoSubmeter').forForm(form).onFormSubmit().create();

  Logger.log('Formulário (editar):   ' + form.getEditUrl());
  Logger.log('Formulário (partilhar): ' + form.getPublishedUrl());
  Logger.log('Folha de respostas:     ' + ss.getUrl());
}

/** Cria as secções de um quadro (uma secção por padrão). */
function adicionarQuadro_(form, quadro, mapa) {
  let primeira = null, ultima = null;
  quadro.padroes.forEach((p, i) => {
    const pagina = form.addPageBreakItem()
      .setTitle(quadro.titulo + ' — ' + p.nome.toUpperCase() + ' (' + p.peso + ')')
      .setHelpText((i === 0 && quadro.subtitulo ? quadro.subtitulo + '\n' : '') +
                   'Atribua a pontuação obtida em cada critério de verificação (0 até à pontuação básica máxima).');
    if (!primeira) primeira = pagina;
    ultima = pagina;

    p.criterios.forEach(([texto, max], k) => {
      const validacao = FormApp.createTextValidation()
        .requireNumberBetween(0, max)
        .setHelpText('Introduza um número entre 0 e ' + fmt_(max) + '.')
        .build();
      const item = form.addTextItem()
        .setTitle((k + 1) + '. ' + texto)
        .setHelpText('Pontuação básica máxima: ' + fmt_(max) + ' pontos')
        .setValidation(validacao)
        .setRequired(true);
      mapa[item.getId()] = { quadro: quadro.codigo, padrao: p.nome.split(' ')[0] };
    });

    form.addParagraphTextItem()
      .setTitle('Evidências / observações — ' + p.nome)
      .setHelpText('Opcional. Ex.: disciplinas leccionadas, n.º de orientandos, títulos e links de publicações.');
  });
  return { primeira, ultima };
}

function fmt_(n) { return n.toFixed(2).replace('.', ','); }

// ---------------------------------------------------------------------------
// 3. CÁLCULO AUTOMÁTICO DA PONTUAÇÃO (executa a cada resposta submetida)
// ---------------------------------------------------------------------------
function aoSubmeter(e) {
  const props = PropertiesService.getScriptProperties();
  const mapa = JSON.parse(props.getProperty('MAPA'));
  const ids = JSON.parse(props.getProperty('IDS'));
  const tot = { 'Docência': 0, 'Investigação': 0, 'Gestão': 0 };
  let nome = '', quadro = '';

  e.response.getItemResponses().forEach(r => {
    const id = String(r.getItem().getId());
    if (id === String(ids.nome)) nome = r.getResponse();
    if (id === String(ids.tipo)) quadro = r.getResponse() === OPCAO_Q1 ? 'Quadro 1 (com coordenação)' : 'Quadro 2 (sem gestão)';
    if (mapa[id]) {
      const v = parseFloat(String(r.getResponse()).replace(',', '.')) || 0;
      tot[mapa[id].padrao] += v;
    }
  });

  const total = tot['Docência'] + tot['Investigação'] + tot['Gestão'];
  const r2 = n => Math.round(n * 100) / 100;
  SpreadsheetApp.openById(props.getProperty('PLANILHA')).getSheetByName('Pontuações').appendRow([
    e.response.getTimestamp(), nome, quadro,
    r2(tot['Docência']), r2(tot['Investigação']), r2(tot['Gestão']), r2(total),
  ]);
}
