/**
 * ============================================================================
 *  SISTEMA DE AVALIAÇÃO DO DESEMPENHO DO PROFESSOR A TEMPO INTEIRO
 *  Circuito: DOCENTE (auto-avaliação + evidências) → AVALIADOR (validação +
 *  assinatura) → DIRECÇÃO (decisão final) → DOCUMENTO ÚNICO EM PDF por docente.
 *  Baseado no Apêndice 3 (Quadro 1 e Quadro 2).
 *
 *  Ficheiros do projecto Apps Script:
 *    • Codigo.gs   (este ficheiro)
 *    • Pagina.html (interface web)
 *  Instalação: ver LEIA-ME.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1. CONFIGURAÇÃO GERAL (pode alterar)
// ---------------------------------------------------------------------------
const SISTEMA = {
  TITULO: 'Avaliação do Desempenho do Professor a Tempo Inteiro',
  INSTITUICAO: 'Universidade Católica de Moçambique',
  TAMANHO_MAX_MB: 10,                     // tamanho máximo por ficheiro anexado
  TIPOS_PERMITIDOS: ['application/pdf', 'image/jpeg', 'image/png'],
};

// Pastas e folha já criadas no Google Drive do proprietário (dispensa a função "instalar").
// Para instalar noutra conta, deixe os três valores vazios ('') e execute "instalar".
const IDS = {
  RAIZ: '14L3o0K-nYPxG1WBC_B373cW110MCTj3j',        // Avaliação de Desempenho Docente — Sistema
  PROCESSOS: '1n09za5eRjcLhsF5cSCdvqUhXTjbeepMe',   // Processos por docente
  REGISTO: '1oQ2Lubm5nFFl8Y5J-1C-xMkUb9g_z_Xvh6aQcPS_8nU', // Registo — Avaliação de Desempenho Docente
};

const ESTADOS = {
  SUBMISSAO: 'Em submissão',
  AVALIADOR: 'Aguarda validação do avaliador',
  DIRECCAO: 'Aguarda decisão da Direcção',
  CONCLUIDA: 'Concluída',
};

const COLUNAS = ['ID', 'Submetido em', 'Docente', 'Email do docente', 'Unidade', 'Departamento', 'Quadro',
  'Avaliador', 'Estado', 'Auto-avaliação', 'Pontuação validada', 'Pontuação final', 'Decisão',
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
  cfg.getRange('A1:C1').setValues([['Papel', 'Nome', 'Email']])
    .setFontWeight('bold').setBackground('#0f5c4d').setFontColor('#ffffff');
  cfg.getRange('A2:C4').setValues([
    ['Avaliador', 'Nome do Avaliador 1 (substituir)', 'avaliador1@exemplo.com'],
    ['Avaliador', 'Nome do Avaliador 2 (substituir)', 'avaliador2@exemplo.com'],
    ['Direcção', 'Director(a) da Unidade (substituir)', 'direccao@exemplo.com'],
  ]);
  cfg.getRange('A2:A50').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Avaliador', 'Direcção'], true).build());
  cfg.getRange('E1').setValue('Instruções: escreva uma linha por pessoa. Os avaliadores aparecem na lista do formulário do docente. ' +
    'Todas as pessoas com o papel "Direcção" recebem os processos validados para decisão final. Use contas Google (Gmail ou institucional).');
  cfg.setColumnWidth(2, 260); cfg.setColumnWidth(3, 260); cfg.setColumnWidth(5, 420);
  cfg.getRange('E1').setWrap(true);

  props.setProperties({ RAIZ: raiz.getId(), PROCESSOS: processos.getId(), REGISTO: ss.getId() });

  Logger.log('Instalação concluída.');
  Logger.log('1) Preencha avaliadores e Direcção no separador "Configuração": ' + ss.getUrl());
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
                  tipos: SISTEMA.TIPOS_PERMITIDOS, estados: ESTADOS };
  const t = HtmlService.createTemplateFromFile('Pagina');
  t.ctx = JSON.stringify(ctx).replace(/</g, '\\u003c');
  return t.evaluate()
    .setTitle(SISTEMA.TITULO)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function contextoPagina_(p) {
  const modo = p.modo || 'docente';
  if (modo === 'docente') {
    return { modo, quadros: quadrosParaCliente_(), avaliadores: config_().avaliadores.map(a => ({ nome: a.nome, email: a.email })) };
  }
  const r = obterRegisto_(p.id);
  if (!r) throw new Error('Processo não encontrado. Verifique o link recebido por email.');
  const publico = registoPublico_(r);
  if (modo === 'avaliador') {
    exigirToken_(r, 'a', p.t);
    return { modo, t: p.t, quadros: quadrosParaCliente_(), registo: publico, assinaturas: imagensAssinaturas_(r),
             concluido: r.estado !== ESTADOS.AVALIADOR };
  }
  if (modo === 'direccao') {
    exigirToken_(r, 'd', p.t);
    return { modo, t: p.t, quadros: quadrosParaCliente_(), registo: publico, assinaturas: imagensAssinaturas_(r),
             concluido: r.estado !== ESTADOS.DIRECCAO };
  }
  if (modo === 'ver') {
    exigirToken_(r, 'v', p.t);
    return { modo, registo: { id: r.id, estado: r.estado, docente: r.docente, historico: r.historico,
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

/** Remove os tokens antes de enviar o registo para o navegador. */
function registoPublico_(r) {
  const c = JSON.parse(JSON.stringify(r));
  delete c.tokens;
  return c;
}

function imagensAssinaturas_(r) {
  const out = {};
  [['docente', r.assinDocente], ['avaliador', r.assinAvaliador], ['direccao', r.direccao]].forEach(([k, a]) => {
    if (a && a.imgId) {
      try { out[k] = 'data:image/png;base64,' + Utilities.base64Encode(DriveApp.getFileById(a.imgId).getBlob().getBytes()); }
      catch (e) { /* imagem indisponível */ }
    }
  });
  return out;
}

// ---------------------------------------------------------------------------
// 5. ETAPA 1 — DOCENTE
// ---------------------------------------------------------------------------
/** Cria o processo e a pasta de evidências. Devolve o id e a chave de carregamento. */
function docIniciar(d) {
  const erros = [];
  ['nome', 'email', 'unidade', 'departamento', 'categoria', 'periodo', 'quadro', 'avaliador'].forEach(c => {
    if (!d || !String(d[c] || '').trim()) erros.push(c);
  });
  if (erros.length) throw new Error('Preencha todos os campos obrigatórios dos dados do docente.');
  if (!QUADROS[d.quadro]) throw new Error('Quadro inválido.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) throw new Error('Email do docente inválido.');
  const lista = config_().avaliadores.filter(a => a.email.toLowerCase() === String(d.avaliador).toLowerCase());
  const avaliador = lista.find(a => a.nome === d.avaliadorNome) || lista[0];
  if (!avaliador) throw new Error('Seleccione um avaliador da lista.');

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
    docente: { nome: d.nome.trim(), email: d.email.trim(), unidade: d.unidade.trim(), departamento: d.departamento.trim(),
               categoria: d.categoria.trim(), periodo: d.periodo.trim() },
    avaliador: { nome: avaliador.nome, email: avaliador.email },
    tokens: { up: token_(), a: token_(), d: token_(), v: token_() },
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

/** Assinatura e submissão ao avaliador. */
function docFinalizar(id, up, assinatura) {
  return comBloqueio_(() => {
    const r = obterRegisto_(id);
    if (!r || r.tokens.up !== up || r.estado !== ESTADOS.SUBMISSAO) throw new Error('Submissão não autorizada.');
    if (!assinatura || !String(assinatura.nome || '').trim() || !assinatura.declaracao)
      throw new Error('Escreva o seu nome e confirme a declaração.');
    r.assinDocente = { nome: assinatura.nome.trim(), data: agora_(), imgId: guardarAssinatura_(r, 'docente', assinatura.png) };
    r.estado = ESTADOS.AVALIADOR;
    r.submetidoEm = agora_();
    r.historico.push({ data: agora_(), evento: 'Submetido pelo docente ao avaliador ' + r.avaliador.nome });
    partilharPasta_(r, [r.avaliador.email]);
    guardarRegisto_(r);

    enviarEmail_(r.avaliador.email, 'Avaliação de desempenho para validar — ' + r.docente.nome,
      '<p>Caro(a) ' + esc_(r.avaliador.nome) + ',</p>' +
      '<p>O(a) docente <b>' + esc_(r.docente.nome) + '</b> (' + esc_(r.docente.departamento) + ') submeteu a auto-avaliação ' +
      'do período <b>' + esc_(r.docente.periodo) + '</b> e indicou-o(a) como avaliador(a).</p>' +
      '<p>' + botao_(link_('avaliador', r), 'Abrir e validar evidências') + '</p>' +
      '<p>Pasta de evidências: <a href="' + r.pasta.url + '">' + r.pasta.url + '</a></p>');
    enviarEmail_(r.docente.email, 'Auto-avaliação submetida — ' + r.id,
      '<p>Caro(a) ' + esc_(r.docente.nome) + ',</p><p>A sua auto-avaliação foi submetida com sucesso ao avaliador(a) <b>' +
      esc_(r.avaliador.nome) + '</b>. Auto-avaliação: <b>' + fmt_(r.totalAuto) + ' / 100</b>.</p>' +
      '<p>' + botao_(link_('ver', r), 'Acompanhar o processo') + '</p>' +
      '<p>Receberá o documento final por email após a decisão da Direcção.</p>');
    return { id: r.id, acompanhar: link_('ver', r) };
  });
}

// ---------------------------------------------------------------------------
// 6. ETAPA 2 — AVALIADOR
// ---------------------------------------------------------------------------
function avaSubmeter(id, t, v) {
  return comBloqueio_(() => {
    const r = obterRegisto_(id);
    exigirToken_(r, 'a', t);
    if (r.estado !== ESTADOS.AVALIADOR) throw new Error('Este processo já não está na fase de validação.');
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
    r.validacao = validacao;
    r.totalValidado = soma_(Object.keys(validacao).map(k => validacao[k].pont));
    r.parecer = String(v.parecer || '').slice(0, 5000);
    r.assinAvaliador = { nome: v.nome.trim(), cargo: String(v.cargo || '').trim(), data: agora_(),
                         imgId: guardarAssinatura_(r, 'avaliador', v.png) };
    r.estado = ESTADOS.DIRECCAO;
    r.historico.push({ data: agora_(), evento: 'Validado e assinado pelo avaliador; submetido à Direcção' });
    const direccao = config_().direccao;
    if (!direccao.length) throw new Error('Não há nenhum email da Direcção no separador "Configuração" do Registo.');
    partilharPasta_(r, direccao.map(x => x.email));
    guardarRegisto_(r);

    enviarEmail_(direccao.map(x => x.email).join(','), 'Avaliação de desempenho para decisão — ' + r.docente.nome,
      '<p>O processo de avaliação de <b>' + esc_(r.docente.nome) + '</b> (' + esc_(r.docente.departamento) + ', ' +
      esc_(r.docente.periodo) + ') foi validado e assinado por <b>' + esc_(r.assinAvaliador.nome) + '</b>.</p>' +
      '<p>Auto-avaliação: ' + fmt_(r.totalAuto) + ' / 100 · Pontuação validada: <b>' + fmt_(r.totalValidado) + ' / 100</b></p>' +
      '<p>' + botao_(link_('direccao', r), 'Abrir para decisão final') + '</p>');
    enviarEmail_(r.docente.email, 'Avaliação validada pelo avaliador — ' + r.id,
      '<p>O seu processo foi validado pelo avaliador e enviado à Direcção para decisão final.</p><p>' +
      botao_(link_('ver', r), 'Acompanhar o processo') + '</p>');
    return { ok: true };
  });
}

// ---------------------------------------------------------------------------
// 7. ETAPA 3 — DIRECÇÃO
// ---------------------------------------------------------------------------
function dirSubmeter(id, t, x) {
  return comBloqueio_(() => {
    const r = obterRegisto_(id);
    exigirToken_(r, 'd', t);
    if (r.estado !== ESTADOS.DIRECCAO) throw new Error('Este processo já não está na fase de decisão.');
    const decisoes = ['Homologada', 'Homologada com alteração da pontuação', 'Devolvida ao avaliador'];
    if (!x || decisoes.indexOf(x.decisao) < 0) throw new Error('Escolha a decisão.');
    if (!String(x.nome || '').trim() || !x.declaracao || !x.png)
      throw new Error('Escreva o seu nome, assine no quadro e confirme a declaração.');

    if (x.decisao === 'Devolvida ao avaliador') {
      if (!String(x.despacho || '').trim()) throw new Error('Indique no despacho o motivo da devolução.');
      r.estado = ESTADOS.AVALIADOR;
      r.tokens.a = token_();                                // novo link para o avaliador
      r.historico.push({ data: agora_(), evento: 'Devolvido ao avaliador pela Direcção (' + x.nome.trim() + '): ' + x.despacho.trim() });
      guardarRegisto_(r);
      enviarEmail_(r.avaliador.email, 'Processo devolvido pela Direcção — ' + r.docente.nome,
        '<p>A Direcção devolveu o processo de <b>' + esc_(r.docente.nome) + '</b> para revisão.</p>' +
        '<p><b>Despacho:</b> ' + esc_(x.despacho) + '</p><p>' + botao_(link_('avaliador', r), 'Rever a validação') + '</p>');
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
    enviarEmail_([r.avaliador.email].concat(config_().direccao.map(d => d.email)).join(','),
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

  b.appendParagraph('1. Dados do professor avaliado').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  tabela_(b, [
    ['Nome', r.docente.nome], ['Email', r.docente.email], ['Unidade Básica/Extensão', r.docente.unidade],
    ['Departamento', r.docente.departamento], ['Categoria Profissional', r.docente.categoria],
    ['Período de Avaliação', r.docente.periodo], ['Função', QUADROS[r.quadro].funcao], ['Avaliador', r.avaliador.nome],
  ], false, [150, null]);

  b.appendParagraph('2. Critérios de verificação, evidências e validação').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  QUADROS[r.quadro].padroes.forEach(p => {
    b.appendParagraph(p.nome + ' (máx. ' + p.max + ' pontos)').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    const linhas = [['N.º', 'Critério de verificação', 'Máx.', 'Auto', 'Evidências', 'Validação', 'Pont. validada', 'Comentário do avaliador']];
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
  tabela_(b, [
    ['', 'Pontos'],
    ['Auto-avaliação do docente', fmt_(r.totalAuto) + ' / 100'],
    ['Pontuação validada pelo avaliador', fmt_(r.totalValidado) + ' / 100'],
    ['Pontuação final homologada pela Direcção', fmt_(r.direccao.pontFinal) + ' / 100'],
  ], true, [260, null]);

  b.appendParagraph('4. Declaração do docente').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  b.appendParagraph('Declaro que as informações e evidências apresentadas são verdadeiras e referem-se ao período de avaliação.');
  blocoAssinatura_(b, r.assinDocente, 'Docente');

  b.appendParagraph('5. Parecer e assinatura do avaliador').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  b.appendParagraph(r.parecer || '(sem parecer escrito)');
  blocoAssinatura_(b, r.assinAvaliador, 'Avaliador');

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
  const vals = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues() : [];
  const pessoas = vals.filter(v => v[0] && v[2]).map(v => ({ papel: String(v[0]).trim(), nome: String(v[1]).trim(), email: String(v[2]).trim() }));
  return { avaliadores: pessoas.filter(p => p.papel === 'Avaliador'), direccao: pessoas.filter(p => p.papel === 'Direcção') };
}

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
  const linha = [r.id, r.submetidoEm || '', r.docente.nome, r.docente.email, r.docente.unidade, r.docente.departamento,
    r.quadro === 'Q1' ? 'Quadro 1 (com coordenação)' : 'Quadro 2 (sem gestão)', r.avaliador.nome, r.estado,
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

function link_(modo, r) {
  const k = { avaliador: 'a', direccao: 'd', ver: 'v' }[modo];
  return ScriptApp.getService().getUrl() + '?modo=' + modo + '&id=' + encodeURIComponent(r.id) + '&t=' + r.tokens[k];
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
