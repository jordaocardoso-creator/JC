# Sistema de Avaliação do Desempenho Docente (docente → avaliador → Direcção)

Este sistema substitui o formulário Google anterior. Funciona como uma página web dentro da sua conta Google, criada com o Google Apps Script, e segue o modelo do **Apêndice 3** (Quadro 1 e Quadro 2).

## Como funciona o circuito

| Etapa | Quem | O que faz |
|---|---|---|
| 1 | **Docente** | Abre o link do sistema e preenche os seus dados. Escolhe a função que exerce: o sistema mostra o Quadro 1 (com coordenação) ou o Quadro 2 (sem gestão). Em cada critério indica a auto-avaliação e junta as evidências: descrição, link electrónico e/ou ficheiros PDF, JPG ou PNG (até 10 MB cada). Escolhe o avaliador, assina no ecrã e submete. |
| 2 | **Avaliador** | Recebe um email com um link pessoal. Abre cada evidência e marca-a como *Validada*, *Parcialmente validada* ou *Não validada*. Confirma ou ajusta a pontuação, escreve comentários e um parecer geral, assina no ecrã e submete à Direcção. |
| 3 | **Direcção** | Recebe um email com o processo validado e decide: **Homologar**, **Homologar com alteração da pontuação** (com justificação) ou **Devolver ao avaliador** (com despacho). Assina no ecrã. |
| Fim | Sistema | Gera um **documento único em PDF por docente**. O PDF tem os dados, todos os critérios, as evidências com links, a validação, as pontuações, o parecer, a decisão, as três assinaturas e o histórico. Fica guardado na pasta do docente e é enviado por email ao docente, ao avaliador e à Direcção. |

Em cada etapa o docente recebe um email e pode acompanhar o estado do processo por um link próprio.

## Instalação (cerca de 5 minutos, feita uma única vez, num computador)

### Passo 1: criar o projecto

1. Abra <https://script.google.com> e clique em **Novo projecto**.
2. No topo, clique em "Projecto sem título" e dê-lhe o nome **Sistema de Avaliação Docente**.
3. No ficheiro `Code.gs`, apague tudo e cole **todo** o conteúdo de **`Codigo.gs`**.
4. À esquerda, clique em **+** ao lado de "Ficheiros" e escolha **HTML**. Dê ao ficheiro o nome **`Pagina`**, exactamente assim, sem ".html". Apague o conteúdo que aparece e cole **todo** o conteúdo de **`Pagina.html`**.
5. Clique em **Guardar**.

### Passo 2: verificar os avaliadores e a Direcção

A pasta **"Avaliação de Desempenho Docente — Sistema"** e a folha **"Registo — Avaliação de Desempenho Docente"** já foram criadas no seu Drive, e o código já as conhece. **Não precisa de executar a função `instalar`.**

Abra a folha do Registo e vá ao separador **Configuração**. Para teste, já lá estão três exemplos com o seu email: dois avaliadores e a Direcção. Assim recebe os emails de todas as etapas e pode experimentar o circuito completo. Antes de enviar o link aos docentes, substitua-os pelos nomes e emails reais, uma linha por pessoa.

- Os **avaliadores** aparecem na lista do formulário do docente.
- Todas as pessoas com o papel **Direcção** recebem os processos validados.
- Use emails de contas Google (Gmail ou institucional Google). Assim, as pastas de evidências são partilhadas só com essas pessoas.

### Passo 3: publicar a página web

1. No editor, clique em **Implementar → Nova implementação**.
2. Na roda dentada, escolha **Aplicação Web**.
3. Preencha:
   - **Descrição:** Avaliação docente 2026
   - **Executar como:** **Eu** (o seu email)
   - **Quem tem acesso:** **Qualquer pessoa**
4. Clique em **Implementar**. O Google pede autorização: clique em **Autorizar acesso**, escolha a sua conta e, se aparecer "A Google não validou esta app", clique em **Avançadas → Aceder ao projecto (não seguro)** e depois em **Permitir**.
5. Copie o **URL da aplicação Web**, que termina em `/exec`. **Este é o link que envia a todos os docentes.**

## Onde fica cada coisa

- **Registo:** uma linha por docente, com o estado do processo, as pontuações, o link da pasta e o link do PDF final. Serve de painel para a Direcção.
- **Pasta "Processos por docente":** uma pasta por processo, com as evidências carregadas, as imagens das assinaturas e o **PDF final**.

## Perguntas frequentes

- **O docente precisa de conta Google?** Não. Basta o link e um email válido.
- **Posso alterar o código depois?** Sim. Depois de guardar a alteração, vá a **Implementar → Gerir implementações → ✏️ (Editar) → Versão: Nova versão → Implementar**. O link mantém-se.
- **Quero alterar a lista de cursos ou programas.** Edite as listas `CURSOS` e `PROGRAMAS` no início de `Codigo.gs` e publique uma nova versão (ver a pergunta anterior). O docente pode marcar vários cursos e vários programas ao mesmo tempo.
- **Quero mudar o tamanho máximo dos ficheiros.** Altere `TAMANHO_MAX_MB` no início de `Codigo.gs`.
- **Um link deixou de funcionar.** Quando a Direcção devolve um processo, o avaliador recebe um link novo. O link antigo deixa de ser válido por segurança.
- **Limite de emails:** uma conta Gmail gratuita envia até cerca de 100 emails por dia. Cada processo completo usa 6 a 8 emails.
