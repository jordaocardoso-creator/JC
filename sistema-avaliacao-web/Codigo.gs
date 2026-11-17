
// ============================================================================
// SISTEMA DE AVALIAÇÃO DO DESEMPENHO DO PROFESSOR A TEMPO INTEIRO
// Circuito: DOCENTE (auto-avaliação + evidências) → COORDENADORES dos cursos e
// programas seleccionados (validação + assinatura, cada um) → DIRECÇÃO
// (decisão final) → DOCUMENTO ÚNICO EM PDF por docente.
// Baseado no Apêndice 3 (Quadro 1 e Quadro 2).
// Ficheiros do projecto Apps Script:
// • Code.gs     (este ficheiro)
// • Pagina.html (interface web)
// Instalação: ver LEIA-ME.
// ============================================================================

// ---------------------------------------------------------------------------
// 1. CONFIGURAÇÃO GERAL (pode alterar)
// ---------------------------------------------------------------------------
const SISTEMA = {
  TITULO: 'Avaliação do Desempenho do Professor a Tempo Inteiro',
  INSTITUICAO: 'Universidade Católica de Moçambique',
  TAMANHO_MAX_MB: 10,                     // tamanho máximo por ficheiro anexado
  TIPOS_PERMITIDOS: ['application/pdf', 'image/jpeg', 'image/png'],
};

// Pastas e folha do sistema. Deixe vazio ('') e execute "instalar" uma vez: são criadas
// automaticamente na conta que executa o script.
const IDS = {
  RAIZ: '',
  PROCESSOS: '',
  REGISTO: '',
};

// Cursos, programas e Ano Propedêutico com os respectivos coordenadores (avaliadores).
// Estes valores só são usados pela função "instalar" para preencher o separador
// "Configuração" do Registo. Depois disso, altere-os directamente nessa folha.
const UNIDADES_PADRAO = [
  ['Curso', 'Administração e Gestão Hospitalar', 'Jordão António Cardoso', 'jcardoso@ucm.ac.mz'],
  ['Curso', 'Análises Clínicas e Laboratoriais', 'Sónia Raquel', 'sraquel@ucm.ac.mz'],
  ['Curso', 'Enfermagem', 'Ana Paula Miguel', 'amiguel@ucm.ac.mz'],
  ['Curso', 'Farmácia', 'Manuel Canivete', 'mcanivete@ucm.ac.mz'],
  ['Curso', 'Medicina Geral', 'Elmano Gomonda', 'egomonda@ucm.ac.mz'],
  ['Curso', 'Psicologia Clínica e Assistência Social', 'Roda Nhavoto', 'rnhavoto@ucm.ac.mz'],
  ['Programa', 'Mestrado em Gestão de Serviços de Saúde', 'Jordão António Cardoso', 'jcardoso@ucm.ac.mz'],
  ['Programa', 'Mestrado em Psicologia em Saúde', 'Roda Nhavoto', 'rnhavoto@ucm.ac.mz'],
  ['Programa', 'Mestrado em Saúde Pública', 'Brigite Zongo', 'szongo@ucm.ac.mz'],
  ['Ano Propedêutico', 'Ano Propedêutico', 'Nilton Maumane', 'njmaumane@ucm.ac.mz'],
  ['Direcção', '', 'Direcção da Faculdade de Ciências de Saúde', 'direccao.fcs@ucm.ac.mz'],
];
const TIPOS_UNIDADE = ['Curso', 'Programa', 'Ano Propedêutico'];

const VERSAO = '2026-11-17-f';   // tem de ser igual à versão em Pagina.html

const ESTADOS = {
  SUBMISSAO: 'Em submissão',
  AVALIADOR: 'Aguarda validação dos avaliadores',
  DIRECCAO: 'Aguarda decisão da Direcção',
  CONCLUIDA: 'Concluída',
};

const COLUNAS = ['ID', 'Submetido em', 'Docente', 'Email do docente', 'Unidade', 'Cursos e programas', 'Quadro',
  'Avaliadores', 'Estado', 'Auto-avaliação', 'Pontuação validada', 'Pontuação final', 'Decisão',
  'Pasta de evidências', 'Documento final', 'Dados (não editar)'];

// ---------------------------------------------------------------------------
// 2. CRITÉRIOS DO MODELO (Apêndice 3)
// ---------------------------------------------------------------------------
const CRIT_INVESTIGACAO = [
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

const QUADROS = {
  Q1: {
    codigo: 'Q1',
    nome: 'Quadro 1 — Professor COM Função de Coordenação Científica e Pedagógica',
    funcao: 'Coordenador de Departamento, Curso e/ou Programa',
    padroes: [
      { k: 'D', nome: 'Docência', max: 50, criterios: [
        ['Acompanhamento e tutoria na Plataforma Moodle', 3.20],
        ['Participação na concepção/revisão de planos curriculares (1.º, 2.º, 3.º ciclos)', 4.30],
        ['Facilitação de aulas teóricas, teórico-práticas, práticas laboratoriais e seminários (1.º, 2.º, 3.º ciclos)', 16.40],
        ['Orientação/Co-orientação tutorial e acompanhamento de trabalhos finais de programas (1.º, 2.º, 3.º ciclos)', 12.00],
        ['Participação em júris de defesas públicas de trabalhos científicos (1.º, 2.º, 3.º ciclos)', 2.00],
        ['Participação na produção de materiais didáctico-pedagógicos e publicados na Plataforma Moodle da UCM', 9.65],
        ['Participação na formação profissional e aperfeiçoamento pedagógico no campo da psicopedagogia', 2.45],
      ] },
      { k: 'I', nome: 'Investigação', max: 40, criterios: CRIT_INVESTIGACAO },
      { k: 'G', nome: 'Gestão académica — coordenação científica e pedagógica', max: 10, criterios: [
        ['Coordenação científica e pedagógica de curso, programa ou Centro de Investigação e Regência de Unidades Curriculares (1.º, 2.º, 3.º ciclos)', 6.50],
        ['Gestão/Extensão universitária', 2.50],
        ['Consultoria ou prestação de serviços especializados', 1.00],
      ] },
    ],
  },
  Q2: {
    codigo: 'Q2',
    nome: 'Quadro 2 — Professor SEM Função de Gestão',
    funcao: 'Docente sem cargo de coordenação ou gestão',
    padroes: [
      { k: 'D', nome: 'Docência', max: 60, criterios: [
        ['Acompanhamento e tutoria na Plataforma Moodle', 7.20],
        ['Participação na concepção/revisão de planos curriculares (1.º, 2.º, 3.º ciclos)', 5.30],
        ['Facilitação de aulas teóricas, teórico-práticas, práticas laboratoriais e seminários (1.º, 2.º, 3.º ciclos)', 20.40],
        ['Orientação/Co-orientação tutorial e acompanhamento de trabalhos finais de programas (1.º, 2.º, 3.º ciclos)', 12.95],
        ['Participação em júris de defesas públicas de trabalhos científicos (1.º, 2.º, 3.º ciclos)', 3.50],
        ['Produção de materiais didáctico-pedagógicos e publicados na Plataforma Moodle da UCM', 7.65],
        ['Formação profissional e aperfeiçoamento pedagógico no campo da psicopedagogia', 3.00],
      ] },
      { k: 'I', nome: 'Investigação', max: 40, criterios: CRIT_INVESTIGACAO },
    ],
  },
};

/** Lista plana dos critérios de um quadro: [{key, padrao, padraoK, n, texto, max}] */
function listaCriterios_(q) {
  const out = [];
  QUADROS[q].padroes.forEach(p => p.criterios.forEach(([texto, max], i) =>
    out.push({ key: q + '-' + p.k + '-' + (i + 1), padrao: p.nome, padraoK: p.k, n: i + 1, texto, max })));
  return out;
}

// ---------------------------------------------------------------------------
// 3. INSTALAÇÃO (executar UMA vez no editor)
// ---------------------------------------------------------------------------
function instalar() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('REGISTO') || IDS.REGISTO) {
    Logger.log('O sistema já está instalado. Registo: ' + SpreadsheetApp.openById(prop_('REGISTO')).getUrl());
    return;
  }
  const raiz = DriveApp.createFolder('Avaliação de Desempenho Docente — Sistema');
  const processos = raiz.createFolder('Processos por docente');

  const ss = SpreadsheetApp.create('Registo — Avaliação de Desempenho Docente');
  DriveApp.getFileById(ss.getId()).moveTo(raiz);

  const reg = ss.getSheets()[0].setName('Registo');
  reg.getRange(1, 1, 1, COLUNAS.length).setValues([COLUNAS])
    .setFontWeight('bold').setBackground('#0f5c4d').setFontColor('#ffffff').setWrap(true);
  reg.setFrozenRows(1);
  reg.hideColumns(COLUNAS.length);

  const cfg = ss.insertSheet('Configuração');
  cfg.getRange('A1:D1').setValues([['Tipo', 'Curso / Programa', 'Coordenador (avaliador)', 'Email']])
    .setFontWeight('bold').setBackground('#0f5c4d').setFontColor('#ffffff');
  cfg.getRange(2, 1, UNIDADES_PADRAO.length, 4).setValues(UNIDADES_PADRAO);
  cfg.getRange('A2:A80').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(TIPOS_UNIDADE.concat(['Direcção']), true).build());
  cfg.getRange('F1').setValue('Instruções: uma linha por curso, programa ou Ano Propedêutico, com o coordenador que o avalia. ' +
    'O docente marca as unidades onde lecciona e o sistema envia a avaliação aos respectivos coordenadores. ' +
    'Um coordenador com várias unidades recebe uma só avaliação. Todas as linhas com o tipo "Direcção" recebem os ' +
    'processos validados para a decisão final. Uma unidade sem email de coordenador não pode ser submetida.');
  cfg.setColumnWidth(2, 300); cfg.setColumnWidth(3, 240); cfg.setColumnWidth(4, 220); cfg.setColumnWidth(6, 420);
  cfg.getRange('F1').setWrap(true);
  cfg.setFrozenRows(1);

  props.setProperties({ RAIZ: raiz.getId(), PROCESSOS: processos.getId(), REGISTO: ss.getId() });

  Logger.log('Instalação concluída.');
  Logger.log('1) Confirme os coordenadores e a Direcção no separador "Configuração": ' + ss.getUrl());
  Logger.log('2) Depois: Implementar → Nova implementação → Aplicação Web.');
  Logger.log('Pasta do sistema: ' + raiz.getUrl());
}

// ---------------------------------------------------------------------------
// 4. PÁGINAS WEB
// ---------------------------------------------------------------------------
function doGet(e) {
  const p = (e && e.parameter) || {};
  let ctx;
  try {
    ctx = contextoPagina_(p);
  } catch (err) {
    ctx = { modo: 'erro', mensagem: err.message };
  }
  ctx.sistema = { titulo: SISTEMA.TITULO, instituicao: SISTEMA.INSTITUICAO, maxMb: SISTEMA.TAMANHO_MAX_MB,
                  tipos: SISTEMA.TIPOS_PERMITIDOS, estados: ESTADOS, tiposUnidade: TIPOS_UNIDADE, versao: VERSAO };
  const t = HtmlService.createTemplateFromFile('Pagina');
  // Enviado em base64 'web-safe' (letras, números, - _ =): sem barras, que o serviço HTML da Google pode cortar.
  t.ctx = Utilities.base64EncodeWebSafe(JSON.stringify(ctx), Utilities.Charset.UTF_8);
  return t.evaluate()
    .setTitle(SISTEMA.TITULO)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function contextoPagina_(p) {
  const modo = p.modo || 'docente';
  if (modo === 'docente') {
    let email = '';
    try { email = Session.getActiveUser().getEmail() || ''; } catch (e) { /* sem acesso ao email */ }
    return { modo, quadros: quadrosParaCliente_(), emailUtilizador: email,
             unidades: config_().unidades.map(u => ({ tipo: u.tipo, nome: u.nome, coord: u.coord, temCoord: !!u.email })) };
  }
  const r = obterRegisto_(p.id);
  if (!r) throw new Error('Processo não encontrado. Verifique o link recebido por email.');
  const publico = registoPublico_(r);
  if (modo === 'avaliador') {
    const eu = r.avaliadores.findIndex(a => a.token && a.token === p.t);
    if (eu < 0) throw new Error('Link inválido ou expirado. Use o link mais recente recebido por email.');
    return { modo, t: p.t, eu, quadros: quadrosParaCliente_(), registo: publico, assinaturas: imagensAssinaturas_(r),
             concluido: r.estado !== ESTADOS.AVALIADOR || r.avaliadores[eu].estado === 'concluida' };
  }
  if (modo === 'direccao') {
    exigirToken_(r, 'd', p.t);
    return { modo, t: p.t, quadros: quadrosParaCliente_(), registo: publico, assinaturas: imagensAssinaturas_(r),
             concluido: r.estado !== ESTADOS.DIRECCAO };
  }
  if (modo === 'ver') {
    exigirToken_(r, 'v', p.t);
    return { modo, registo: { id: r.id, estado: r.estado, docente: r.docente, historico: r.historico,
             avaliadores: r.avaliadores.map(a => ({ nome: a.nome, unidades: a.unidades, estado: a.estado })),
             pdf: r.estado === ESTADOS.CONCLUIDA ? r.pdf : null } };
  }
  throw new Error('Página desconhecida.');
}

function quadrosParaCliente_() {
  const out = {};
  Object.keys(QUADROS).forEach(q => {
    const Q = QUADROS[q];
    out[q] = { codigo: q, nome: Q.nome, funcao: Q.funcao,
      padroes: Q.padroes.map(p => ({ k: p.k, nome: p.nome, max: p.max,
        criterios: p.criterios.map(([texto, max], i) => ({ key: q + '-' + p.k + '-' + (i + 1), n: i + 1, texto, max })) })) };
  });
  return out;
}

/** Remove as chaves de acesso antes de enviar o registo para o navegador. */
function registoPublico_(r) {
  const c = JSON.parse(JSON.stringify(r));
  delete c.tokens;
  (c.avaliadores || []).forEach(a => delete a.token);
  return c;
}

function imagemBase64_(id) {
  if (!id) return null;
  try { return 'data:image/png;base64,' + Utilities.base64Encode(DriveApp.getFileById(id).getBlob().getBytes()); }
  catch (e) { return null; }
}

function imagensAssinaturas_(r) {
  return {
    docente: imagemBase64_(r.assinDocente && r.assinDocente.imgId),
    avaliadores: (r.avaliadores || []).map(a => imagemBase64_(a.assin && a.assin.imgId)),
    direccao: imagemBase64_(r.direccao && r.direccao.imgId),
  };
}

// ---------------------------------------------------------------------------
// 5. ETAPA 1 — DOCENTE
// ---------------------------------------------------------------------------
/** Cria o processo e a pasta de evidências. Devolve o id e a chave de carregamento. */
function docIniciar(d) {
  const erros = [];
  ['nome', 'email', 'unidade', 'categoria', 'periodo', 'quadro'].forEach(c => {
    if (!d || !String(d[c] || '').trim()) erros.push(c);
  });
  if (erros.length) throw new Error('Preencha todos os campos obrigatórios dos dados do docente.');
  if (!QUADROS[d.quadro]) throw new Error('Quadro inválido.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) throw new Error('Email do docente inválido.');

  // Unidades seleccionadas → coordenadores (avaliadores), agrupados por email
  const cfg = config_();
  const escolhidas = cfg.unidades.filter(u => [].concat(d.unidades || []).indexOf(u.nome) >= 0);
  if (!escolhidas.length) throw new Error('Seleccione pelo menos um curso, programa ou o Ano Propedêutico.');
  const semCoord = escolhidas.filter(u => !u.email);
  if (semCoord.length) throw new Error('"' + semCoord.map(u => u.nome).join('", "') +
    '" ainda não tem coordenador configurado. Contacte a Direcção ou desmarque essa opção.');
  const porEmail = {};
  escolhidas.forEach(u => {
    const k = u.email.toLowerCase();
    if (!porEmail[k]) porEmail[k] = { nome: u.coord, email: u.email, unidades: [], token: token_(), estado: 'pendente' };
    porEmail[k].unidades.push(u.nome);
  });
  const avaliadores = Object.keys(porEmail).map(k => porEmail[k]);

  const itens = {};
  listaCriterios_(d.quadro).forEach(c => {
    const it = (d.itens || {})[c.key] || {};
    const auto = numero_(it.auto);
    if (auto === null || auto < 0 || auto > c.max + 1e-9)
      throw new Error('Auto-avaliação inválida em "' + c.texto + '" (0 a ' + fmt_(c.max) + ').');
    const link = String(it.link || '').trim();
    if (link && !/^https?:\/\/\S+$/i.test(link)) throw new Error('Link inválido em "' + c.texto + '". Use um endereço começado por https://');
    itens[c.key] = { auto, desc: String(it.desc || '').slice(0, 2000), link, anexos: [] };
  });

  const id = 'AV-' + Utilities.formatDate(new Date(), 'Africa/Maputo', 'yyyyMMdd-HHmmss') + '-' +
             Math.floor(Math.random() * 900 + 100);
  const pasta = DriveApp.getFolderById(prop_('PROCESSOS'))
    .createFolder(id + ' — ' + String(d.nome).trim() + ' — ' + String(d.periodo).trim());

  const r = {
    id, criadoEm: new Date().toISOString(), estado: ESTADOS.SUBMISSAO, quadro: d.quadro,
    docente: { nome: d.nome.trim(), email: d.email.trim(), unidade: d.unidade.trim(),
               unidades: escolhidas.map(u => ({ tipo: u.tipo, nome: u.nome })),
               departamento: escolhidas.map(u => u.nome).join('; '),
               categoria: d.categoria.trim(), periodo: d.periodo.trim() },
    avaliadores,
    tokens: { up: token_(), d: token_(), v: token_() },
    pasta: { id: pasta.getId(), url: pasta.getUrl() },
    itens, totalAuto: soma_(Object.keys(itens).map(k => itens[k].auto)),
    historico: [{ data: agora_(), evento: 'Processo criado pelo docente' }],
  };
  guardarRegisto_(r);
  return { id, up: r.tokens.up };
}

/** Carrega um ficheiro de evidência (PDF/JPG/PNG) para um critério. */
function docCarregar(id, up, key, nome, tipo, b64) {
  return comBloqueio_(() => {
    const r = obterRegisto_(id);
    if (!r || r.tokens.up !== up || r.estado !== ESTADOS.SUBMISSAO) throw new Error('Carregamento não autorizado.');
    if (!r.itens[key]) throw new Error('Critério inválido.');
    if (SISTEMA.TIPOS_PERMITIDOS.indexOf(tipo) < 0) throw new Error('Formato não permitido em "' + nome + '". Use PDF, JPG ou PNG.');
    const bytes = Utilities.base64Decode(b64);
    if (bytes.length > SISTEMA.TAMANHO_MAX_MB * 1024 * 1024)
      throw new Error('"' + nome + '" excede ' + SISTEMA.TAMANHO_MAX_MB + ' MB.');
    const c = listaCriterios_(r.quadro).find(x => x.key === key);
    const nomeFinal = c.padraoK + c.n + ' — ' + String(nome).replace(/[\\/:*?"<>|]/g, '_');
    const f = DriveApp.getFolderById(r.pasta.id).createFile(Utilities.newBlob(bytes, tipo, nomeFinal));
    const anexo = { id: f.getId(), nome: String(nome), url: f.getUrl() };
    r.itens[key].anexos.push(anexo);
    guardarRegisto_(r);
    return anexo;
  });
}

/** Assinatura e submissão aos coordenadores. */
function docFinalizar(id, up, assinatura) {
  return comBloqueio_(() => {
    const r = obterRegisto_(id);
    if (!r || r.tokens.up !== up || r.estado !== ESTADOS.SUBMISSAO) throw new Error('Submissão não autorizada.');
    if (!assinatura || !String(assinatura.nome || '').trim() || !assinatura.declaracao)
      throw new Error('Escreva o seu nome e confirme a declaração.');
    r.assinDocente = { nome: assinatura.nome.trim(), data: agora_(), imgId: guardarAssinatura_(r, 'docente', assinatura.png) };
    r.estado = ESTADOS.AVALIADOR;
    r.submetidoEm = agora_();
    r.historico.push({ data: agora_(), evento: 'Submetido pelo docente aos avaliadores: ' + nomesAvaliadores_(r) });
    partilharPasta_(r, r.avaliadores.map(a => a.email));
    guardarRegisto_(r);

    r.avaliadores.forEach(a => emailAvaliador_(r, a, ''));
    enviarEmail_(r.docente.email, 'Auto-avaliação submetida — ' + r.id,
      '<p>Caro(a) ' + esc_(r.docente.nome) + ',</p><p>A sua auto-avaliação foi submetida com sucesso. ' +
      'Auto-avaliação: <b>' + fmt_(r.totalAuto) + ' / 100</b>.</p>' +
      '<p>Avaliadores: <b>' + esc_(nomesAvaliadores_(r)) + '</b>. Depois de todos validarem, o processo segue para a Direcção.</p>' +
      '<p>' + botao_(link_('ver', r), 'Acompanhar o processo') + '</p>' +
      '<p>Receberá o documento final por email após a decisão da Direcção.</p>');
    return { id: r.id, acompanhar: link_('ver', r), avaliadores: r.avaliadores.map(a => a.nome) };
  });
}

function emailAvaliador_(r, a, nota) {
  enviarEmail_(a.email, 'Avaliação de desempenho para validar — ' + r.docente.nome,
    '<p>Caro(a) ' + esc_(a.nome) + ',</p>' + (nota || '') +
    '<p>O(a) docente <b>' + esc_(r.docente.nome) + '</b> submeteu a auto-avaliação do período <b>' + esc_(r.docente.periodo) +
    '</b>. Como coordenador(a) de <b>' + esc_(a.unidades.join(', ')) + '</b>, é um dos avaliadores deste processo' +
    (r.avaliadores.length > 1 ? ' (avaliadores: ' + esc_(nomesAvaliadores_(r)) + ')' : '') + '.</p>' +
    '<p>' + botao_(link_('avaliador', r, a.token), 'Abrir e validar evidências') + '</p>' +
    '<p>Pasta de evidências: <a href="' + r.pasta.url + '">' + r.pasta.url + '</a></p>');
}

// ---------------------------------------------------------------------------
// 6. ETAPA 2 — AVALIADORES (coordenadores)
// ---------------------------------------------------------------------------
function avaSubmeter(id, t, v) {
  return comBloqueio_(() => {
    const r = obterRegisto_(id);
    if (!r) throw new Error('Processo não encontrado.');
    const a = r.avaliadores.find(x => x.token && x.token === t);
    if (!a) throw new Error('Link inválido ou expirado. Use o link mais recente recebido por email.');
    if (r.estado !== ESTADOS.AVALIADOR) throw new Error('Este processo já não está na fase de validação.');
    if (a.estado === 'concluida') throw new Error('Já submeteu a sua validação deste processo.');
    if (!v || !String(v.nome || '').trim() || !v.declaracao || !v.png)
      throw new Error('Escreva o seu nome, assine no quadro e confirme a declaração.');
    const validacao = {};
    listaCriterios_(r.quadro).forEach(c => {
      const x = (v.itens || {})[c.key] || {};
      if (['Validada', 'Parcialmente validada', 'Não validada'].indexOf(x.estado) < 0)
        throw new Error('Indique a validação de todas as evidências ("' + c.texto + '").');
      const pont = numero_(x.pont);
      if (pont === null || pont < 0 || pont > c.max + 1e-9) throw new Error('Pontuação validada inválida em "' + c.texto + '".');
      validacao[c.key] = { estado: x.estado, pont: x.estado === 'Não validada' ? 0 : pont, coment: String(x.coment || '').slice(0, 2000) };
    });
    a.validacao = validacao;
    a.total = soma_(Object.keys(validacao).map(k => validacao[k].pont));
    a.parecer = String(v.parecer || '').slice(0, 5000);
    a.assin = { nome: v.nome.trim(), cargo: String(v.cargo || '').trim(), data: agora_(), imgId: guardarAssinatura_(r, 'avaliador ' + a.nome, v.png) };
    a.estado = 'concluida';
    r.historico.push({ data: agora_(), evento: 'Validado e assinado por ' + a.nome + ' (' + a.unidades.join(', ') + ')' });

    const faltam = r.avaliadores.filter(x => x.estado !== 'concluida');
    if (faltam.length) {
      guardarRegisto_(r);
      return { ok: true, faltam: faltam.map(x => x.nome) };
    }

    // Último avaliador: combina as validações e envia à Direcção
    combinarValidacoes_(r);
    r.estado = ESTADOS.DIRECCAO;
    r.historico.push({ data: agora_(), evento: 'Todos os avaliadores concluíram; submetido à Direcção' });
    const direccao = config_().direccao;
    if (!direccao.length) throw new Error('Não há nenhum email da Direcção no separador "Configuração" do Registo.');
    partilharPasta_(r, direccao.map(x => x.email));
    guardarRegisto_(r);

    enviarEmail_(direccao.map(x => x.email).join(','), 'Avaliação de desempenho para decisão — ' + r.docente.nome,
      '<p>O processo de avaliação de <b>' + esc_(r.docente.nome) + '</b> (' + esc_(r.docente.departamento) + ', ' +
      esc_(r.docente.periodo) + ') foi validado e assinado por todos os avaliadores: <b>' + esc_(nomesAvaliadores_(r)) + '</b>.</p>' +
      '<p>Auto-avaliação: ' + fmt_(r.totalAuto) + ' / 100 · Pontuação validada (média dos avaliadores): <b>' +
      fmt_(r.totalValidado) + ' / 100</b></p>' +
      '<p>' + botao_(link_('direccao', r), 'Abrir para decisão final') + '</p>');
    enviarEmail_(r.docente.email, 'Avaliação validada pelos avaliadores — ' + r.id,
      '<p>O seu processo foi validado por todos os avaliadores e enviado à Direcção para decisão final.</p><p>' +
      botao_(link_('ver', r), 'Acompanhar o processo') + '</p>');
    return { ok: true, faltam: [] };
  });
}

/** Junta as validações dos avaliadores: pontuação = média; estado = comum a todos ou "Parcialmente validada". */
function combinarValidacoes_(r) {
  const out = {};
  const varios = r.avaliadores.length > 1;
  listaCriterios_(r.quadro).forEach(c => {
    const vs = r.avaliadores.map(a => a.validacao[c.key]);
    const media = Math.round(vs.reduce((s, x) => s + x.pont, 0) / vs.length * 100) / 100;
    const estados = vs.map(x => x.estado);
    const estado = estados.every(e => e === estados[0]) ? estados[0] : 'Parcialmente validada';
    const coment = r.avaliadores.map((a, i) => vs[i].coment ? (varios ? a.nome + ': ' : '') + vs[i].coment : '')
      .filter(Boolean).join(' | ');
    out[c.key] = { estado, pont: media, coment };
  });
  r.validacao = out;
  r.totalValidado = soma_(Object.keys(out).map(k => out[k].pont));
}

// ---------------------------------------------------------------------------
// 7. ETAPA 3 — DIRECÇÃO
// ---------------------------------------------------------------------------
function dirSubmeter(id, t, x) {
  return comBloqueio_(() => {
    const r = obterRegisto_(id);
    exigirToken_(r, 'd', t);
    if (r.estado !== ESTADOS.DIRECCAO) throw new Error('Este processo já não está na fase de decisão.');
    const decisoes = ['Homologada', 'Homologada com alteração da pontuação', 'Devolvida aos avaliadores'];
    if (!x || decisoes.indexOf(x.decisao) < 0) throw new Error('Escolha a decisão.');
    if (!String(x.nome || '').trim() || !x.declaracao || !x.png)
      throw new Error('Escreva o seu nome, assine no quadro e confirme a declaração.');

    if (x.decisao === 'Devolvida aos avaliadores') {
      if (!String(x.despacho || '').trim()) throw new Error('Indique no despacho o motivo da devolução.');
      r.estado = ESTADOS.AVALIADOR;
      r.avaliadores.forEach(a => { a.estado = 'pendente'; a.token = token_(); });   // novos links
      r.historico.push({ data: agora_(), evento: 'Devolvido aos avaliadores pela Direcção (' + x.nome.trim() + '): ' + x.despacho.trim() });
      guardarRegisto_(r);
      const nota = '<p><b>A Direcção devolveu este processo para revisão.</b> Despacho: ' + esc_(x.despacho) + '</p>';
      r.avaliadores.forEach(a => emailAvaliador_(r, a, nota));
      return { ok: true, devolvido: true };
    }

    let final = r.totalValidado;
    if (x.decisao === 'Homologada com alteração da pontuação') {
      final = numero_(x.pontFinal);
      if (final === null || final < 0 || final > 100) throw new Error('Pontuação final inválida (0 a 100).');
      if (!String(x.despacho || '').trim()) throw new Error('Justifique no despacho a alteração da pontuação.');
    }
    r.direccao = { decisao: x.decisao, pontFinal: Math.round(final * 100) / 100, despacho: String(x.despacho || '').slice(0, 5000),
                   nome: x.nome.trim(), cargo: String(x.cargo || '').trim(), data: agora_(),
                   imgId: guardarAssinatura_(r, 'direccao', x.png) };
    r.estado = ESTADOS.CONCLUIDA;
    r.historico.push({ data: agora_(), evento: 'Decisão final da Direcção: ' + x.decisao });

    const pdf = gerarDocumentoFinal_(r);
    r.pdf = { id: pdf.getId(), url: pdf.getUrl(), nome: pdf.getName() };
    r.historico.push({ data: agora_(), evento: 'Documento final gerado' });
    guardarRegisto_(r);

    const corpo = '<p>O processo de avaliação de <b>' + esc_(r.docente.nome) + '</b> (' + esc_(r.docente.periodo) + ') foi concluído.</p>' +
      '<p>Decisão: <b>' + esc_(x.decisao) + '</b> · Pontuação final: <b>' + fmt_(r.direccao.pontFinal) + ' / 100</b></p>' +
      '<p>O documento final segue em anexo.</p>';
    const anexo = DriveApp.getFileById(r.pdf.id).getBlob();
    enviarEmail_(r.docente.email, 'Documento final da avaliação de desempenho — ' + r.id, corpo, [anexo]);
    enviarEmail_(r.avaliadores.map(a => a.email).concat(config_().direccao.map(d => d.email)).join(','),
      'Avaliação concluída — ' + r.docente.nome, corpo + '<p><a href="' + r.pdf.url + '">Abrir o documento no Drive</a></p>', [anexo]);
    return { ok: true, pdf: r.pdf.url };
  });
}

// ---------------------------------------------------------------------------
// 8. DOCUMENTO FINAL (PDF ÚNICO POR DOCENTE)
// ---------------------------------------------------------------------------
function gerarDocumentoFinal_(r) {
  const pasta = DriveApp.getFolderById(r.pasta.id);
  const titulo = 'Ficha de Avaliação — ' + r.docente.nome + ' — ' + r.docente.periodo;
  const doc = DocumentApp.create(titulo);
  const b = doc.getBody();
  b.setMarginTop(40).setMarginBottom(40).setMarginLeft(40).setMarginRight(40);
  const st = {}; st[DocumentApp.Attribute.FONT_FAMILY] = 'Arial'; st[DocumentApp.Attribute.FONT_SIZE] = 9.5;
  b.setAttributes(st);

  const cab = b.getParagraphs()[0];
  cab.setText(SISTEMA.INSTITUICAO.toUpperCase()).setAlignment(DocumentApp.HorizontalAlignment.CENTER).setBold(true);
  b.appendParagraph('Apêndice 3 — Ficha de Avaliação do Desempenho do Professor, a tempo inteiro')
    .setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  b.appendParagraph('Processo n.º ' + r.id + ' · Estado: ' + r.estado + ' · ' + QUADROS[r.quadro].nome)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER).setItalic(true);

  const porTipo = t => r.docente.unidades.filter(u => u.tipo === t).map(u => u.nome).join('; ') || '—';
  b.appendParagraph('1. Dados do professor avaliado').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  tabela_(b, [
    ['Nome', r.docente.nome], ['Email', r.docente.email], ['Unidade Básica/Extensão', r.docente.unidade],
    ['Cursos', porTipo('Curso')], ['Programas', porTipo('Programa')], ['Ano Propedêutico', porTipo('Ano Propedêutico')],
    ['Categoria Profissional', r.docente.categoria], ['Período de Avaliação', r.docente.periodo],
    ['Função', QUADROS[r.quadro].funcao],
    ['Avaliadores', r.avaliadores.map(a => a.nome + ' (' + a.unidades.join(', ') + ')').join('; ')],
  ], false, [150, null]);

  b.appendParagraph('2. Critérios de verificação, evidências e validação').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  if (r.avaliadores.length > 1)
    b.appendParagraph('Pontuação validada = média das pontuações atribuídas pelos ' + r.avaliadores.length + ' avaliadores.').setItalic(true);
  QUADROS[r.quadro].padroes.forEach(p => {
    b.appendParagraph(p.nome + ' (máx. ' + p.max + ' pontos)').setHeading(DocumentApp.ParagraphHeading.HEADING3).setItalic(false);
    const linhas = [['N.º', 'Critério de verificação', 'Máx.', 'Auto', 'Evidências', 'Validação', 'Pont. validada', 'Comentários dos avaliadores']];
    const links = [];
    let sA = 0, sV = 0;
    p.criterios.forEach(([texto, max], i) => {
      const key = r.quadro + '-' + p.k + '-' + (i + 1);
      const it = r.itens[key], v = r.validacao[key];
      sA += it.auto; sV += v.pont;
      const ev = [];
      if (it.desc) ev.push({ t: it.desc });
      if (it.link) ev.push({ t: 'Link', url: it.link });
      it.anexos.forEach(a => ev.push({ t: a.nome, url: a.url }));
      links.push(ev);
      linhas.push([String(i + 1), texto, fmt_(max), fmt_(it.auto), '', v.estado, fmt_(v.pont), v.coment || '']);
    });
    linhas.push(['', 'Subtotal ' + p.nome, fmt_(p.max), fmt_(sA), '', '', fmt_(sV), '']);
    const tb = tabela_(b, linhas, true, [22, 150, 32, 32, 105, 60, 42, null]);
    links.forEach((ev, i) => {
      const cel = tb.getCell(i + 1, 4);
      cel.clear();
      if (!ev.length) { cel.setText('—'); return; }
      ev.forEach((e, j) => {
        const par = j === 0 ? cel.getChild(0).asParagraph().setText(e.t) : cel.appendParagraph(e.t);
        if (e.url) par.setLinkUrl(e.url);
      });
    });
    tb.getRow(linhas.length - 1).editAsText().setBold(true);
  });

  b.appendParagraph('3. Resumo da pontuação').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  const resumo = [['', 'Pontos'], ['Auto-avaliação do docente', fmt_(r.totalAuto) + ' / 100']];
  r.avaliadores.forEach(a => resumo.push(['Validada por ' + a.nome + ' (' + a.unidades.join(', ') + ')', fmt_(a.total) + ' / 100']));
  if (r.avaliadores.length > 1) resumo.push(['Pontuação validada (média dos avaliadores)', fmt_(r.totalValidado) + ' / 100']);
  resumo.push(['Pontuação final homologada pela Direcção', fmt_(r.direccao.pontFinal) + ' / 100']);
  tabela_(b, resumo, true, [300, null]);

  b.appendParagraph('4. Declaração do docente').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  b.appendParagraph('Declaro que as informações e evidências apresentadas são verdadeiras e referem-se ao período de avaliação.');
  blocoAssinatura_(b, r.assinDocente, 'Docente');

  b.appendParagraph('5. Pareceres e assinaturas dos avaliadores').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  r.avaliadores.forEach(a => {
    b.appendParagraph(a.nome + ' — coordenador(a) de ' + a.unidades.join(', ')).setHeading(DocumentApp.ParagraphHeading.HEADING3);
    b.appendParagraph(a.parecer || '(sem parecer escrito)');
    blocoAssinatura_(b, a.assin, 'Avaliador');
  });

  b.appendParagraph('6. Decisão final da Direcção').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  b.appendParagraph('Decisão: ' + r.direccao.decisao).setBold(true);
  b.appendParagraph('Despacho: ' + (r.direccao.despacho || '—')).setBold(false);
  blocoAssinatura_(b, r.direccao, 'Direcção');

  b.appendParagraph('Histórico do processo').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  r.historico.forEach(h => b.appendListItem(h.data + ' — ' + h.evento));

  doc.saveAndClose();
  const ficheiroDoc = DriveApp.getFileById(doc.getId());
  const pdf = pasta.createFile(ficheiroDoc.getAs('application/pdf')).setName(titulo + '.pdf');
  ficheiroDoc.setTrashed(true);
  return pdf;
}

function tabela_(b, linhas, cabecalho, larguras) {
  const tb = b.appendTable(linhas);
  tb.setBorderColor('#9aaba5');
  if (cabecalho) {
    const row = tb.getRow(0);
    for (let c = 0; c < row.getNumCells(); c++) row.getCell(c).setBackgroundColor('#e1efeb');
    row.editAsText().setBold(true);
  } else {
    for (let i = 0; i < tb.getNumRows(); i++) tb.getRow(i).getCell(0).editAsText().setBold(true);
  }
  (larguras || []).forEach((w, i) => { if (w) tb.setColumnWidth(i, w); });
  return tb;
}

function blocoAssinatura_(b, a, papel) {
  if (!a) return;
  if (a.imgId) {
    try {
      const img = b.appendParagraph('').appendInlineImage(DriveApp.getFileById(a.imgId).getBlob());
      img.setWidth(180).setHeight(54);
    } catch (e) { /* sem imagem */ }
  }
  b.appendParagraph('____________________________________');
  b.appendParagraph(a.nome + (a.cargo ? ' — ' + a.cargo : '') + ' (' + papel + ')').setBold(true);
  b.appendParagraph('Assinado electronicamente em ' + a.data).setBold(false).setItalic(true);
  b.appendParagraph('').setItalic(false);
}

// ---------------------------------------------------------------------------
// 9. FUNÇÕES AUXILIARES
// ---------------------------------------------------------------------------
function config_() {
  const sh = SpreadsheetApp.openById(prop_('REGISTO')).getSheetByName('Configuração');
  const vals = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : [];
  const linhas = vals.map(v => ({ tipo: String(v[0]).trim(), nome: String(v[1]).trim(), coord: String(v[2]).trim(), email: String(v[3]).trim() }));
  return {
    unidades: linhas.filter(l => TIPOS_UNIDADE.indexOf(l.tipo) >= 0 && l.nome),
    direccao: linhas.filter(l => l.tipo === 'Direcção' && l.email).map(l => ({ nome: l.coord, email: l.email })),
  };
}

function nomesAvaliadores_(r) { return r.avaliadores.map(a => a.nome).join(', '); }

function folhaRegisto_() { return SpreadsheetApp.openById(prop_('REGISTO')).getSheetByName('Registo'); }

function obterRegisto_(id) {
  if (!id) return null;
  const sh = folhaRegisto_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return null;
  const ids = sh.getRange(2, 1, n, 1).getValues().map(v => v[0]);
  const i = ids.indexOf(id);
  if (i < 0) return null;
  return JSON.parse(sh.getRange(i + 2, COLUNAS.length).getValue());
}

function guardarRegisto_(r) {
  const sh = folhaRegisto_();
  const feitos = r.avaliadores.filter(a => a.estado === 'concluida').length;
  const estado = r.estado === ESTADOS.AVALIADOR ? r.estado + ' (' + feitos + ' de ' + r.avaliadores.length + ')' : r.estado;
  const linha = [r.id, r.submetidoEm || '', r.docente.nome, r.docente.email, r.docente.unidade, r.docente.departamento,
    r.quadro === 'Q1' ? 'Quadro 1 (com coordenação)' : 'Quadro 2 (sem gestão)', nomesAvaliadores_(r), estado,
    r.totalAuto, r.totalValidado === undefined ? '' : r.totalValidado, r.direccao ? r.direccao.pontFinal : '',
    r.direccao ? r.direccao.decisao : '', r.pasta.url, r.pdf ? r.pdf.url : '', JSON.stringify(r)];
  const n = sh.getLastRow() - 1;
  const ids = n > 0 ? sh.getRange(2, 1, n, 1).getValues().map(v => v[0]) : [];
  const i = ids.indexOf(r.id);
  if (i >= 0) sh.getRange(i + 2, 1, 1, linha.length).setValues([linha]);
  else sh.appendRow(linha);
}

function guardarAssinatura_(r, papel, png) {
  if (!png) return null;
  const b64 = String(png).replace(/^data:image\/png;base64,/, '');
  const f = DriveApp.getFolderById(r.pasta.id)
    .createFile(Utilities.newBlob(Utilities.base64Decode(b64), 'image/png', 'Assinatura — ' + papel + '.png'));
  return f.getId();
}

function partilharPasta_(r, emails) {
  const pasta = DriveApp.getFolderById(r.pasta.id);
  emails.forEach(e => {
    try { pasta.addViewer(e); }
    catch (err) {
      // Email sem conta Google: abre a pasta a quem tiver o link (apenas leitura).
      pasta.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }
  });
}

function exigirToken_(r, papel, t) {
  if (!r || !t || r.tokens[papel] !== t) throw new Error('Link inválido ou expirado. Use o link mais recente recebido por email.');
}

function link_(modo, r, token) {
  const t = token || r.tokens[{ direccao: 'd', ver: 'v' }[modo]];
  return ScriptApp.getService().getUrl() + '?modo=' + modo + '&id=' + encodeURIComponent(r.id) + '&t=' + t;
}

function enviarEmail_(para, assunto, html, anexos) {
  if (!para) return;
  const corpo = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#15231f">' + html +
    '<hr><p style="color:#5b6b66;font-size:12px">' + esc_(SISTEMA.INSTITUICAO) + ' · ' + esc_(SISTEMA.TITULO) + '</p></div>';
  const op = { to: para, subject: assunto, htmlBody: corpo, name: 'Avaliação de Desempenho Docente' };
  if (anexos) op.attachments = anexos;
  MailApp.sendEmail(op);
}

function botao_(url, texto) {
  return '<a href="' + url + '" style="background:#0f5c4d;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">' +
    esc_(texto) + '</a>';
}

function comBloqueio_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function prop_(k) {
  const v = PropertiesService.getScriptProperties().getProperty(k) || IDS[k];
  if (!v) throw new Error('O sistema ainda não foi instalado. Execute a função "instalar" no editor.');
  return v;
}
function token_() { return Utilities.getUuid().replace(/-/g, ''); }
function numero_(x) { const v = parseFloat(String(x === undefined || x === null ? '' : x).replace(',', '.')); return isNaN(v) ? null : v; }
function soma_(arr) { return Math.round(arr.reduce((a, b) => a + b, 0) * 100) / 100; }
function fmt_(n) { return Number(n).toFixed(2).replace('.', ','); }
function agora_() { return Utilities.formatDate(new Date(), 'Africa/Maputo', 'dd/MM/yyyy HH:mm'); }
function esc_(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
