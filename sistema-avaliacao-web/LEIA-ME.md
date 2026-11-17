# Sistema de Avaliação do Desempenho Docente — UCM

Aplicação web no Google Apps Script, instalada numa conta institucional **@ucm.ac.mz**, que segue o modelo do **Apêndice 3** (Quadro 1 e Quadro 2).

## Como funciona o circuito

| Etapa | Quem | O que faz |
|---|---|---|
| 1 | **Docente** | Preenche os seus dados e marca **onde lecciona**: um ou mais cursos, programas e/ou o Ano Propedêutico. Escolhe a função (Quadro 1 ou 2), indica a auto-avaliação em cada critério e junta as evidências (descrição, link e/ou ficheiros PDF, JPG ou PNG). Assina no ecrã e submete. |
| 2 | **Coordenadores** (avaliadores) | São escolhidos **automaticamente**: os coordenadores das unidades marcadas pelo docente. Um coordenador com várias unidades marcadas recebe **uma só** avaliação. Cada um recebe um email com o seu link, valida as evidências, ajusta a pontuação, comenta e assina. |
| 3 | **Direcção** | Só recebe o processo **quando o último coordenador terminar**. Vê a pontuação de cada avaliador e a média, os pareceres e as assinaturas. Decide: **Homologar**, **Homologar com alteração da pontuação** ou **Devolver aos avaliadores**. Assina. |
| Fim | Sistema | Gera **um documento único em PDF por docente**, com dados, critérios, evidências, validação, pontuação de cada avaliador e média, pareceres, decisão, todas as assinaturas e histórico. Envia-o por email ao docente, aos avaliadores e à Direcção. |

**Pontuação validada com vários avaliadores:** em cada critério, a pontuação validada é a **média** das pontuações atribuídas pelos avaliadores. Se os avaliadores não concordarem no estado da evidência, o critério fica "Parcialmente validada".

## Coordenadores configurados

| Tipo | Curso / Programa | Coordenador (avaliador) | Email |
|---|---|---|---|
| Curso | Administração e Gestão Hospitalar | Jordão António Cardoso | jcardoso@ucm.ac.mz |
| Curso | Análises Clínicas e Laboratoriais | **por indicar** | — |
| Curso | Enfermagem | Ana Paula Miguel | amiguel@ucm.ac.mz |
| Curso | Farmácia | Manuel Canivete | mcanivete@ucm.ac.mz |
| Curso | Medicina Geral | Elmano Gomonda | egomonda@ucm.ac.mz |
| Curso | Psicologia Clínica e Assistência Social | Roda Nhavoto | rnhavoto@ucm.ac.mz |
| Programa | Mestrado em Gestão de Serviços de Saúde | Jordão António Cardoso | jcardoso@ucm.ac.mz |
| Programa | Mestrado em Psicologia em Saúde | Roda Nhavoto | rnhavoto@ucm.ac.mz |
| Programa | Mestrado em Saúde Pública | Brigite Zongo | szongo@ucm.ac.mz |
| Ano Propedêutico | Ano Propedêutico | Nilton Maumane | njmaumane@ucm.ac.mz |
| Direcção | — | **a indicar** | direccao@ucm.ac.mz (substituir) |

Estes dados ficam no separador **Configuração** da folha do Registo e podem ser alterados lá, sem mexer no código. Enquanto um curso não tiver email de coordenador, o docente não consegue submeter com esse curso marcado.

## Instalação na conta @ucm.ac.mz (cerca de 10 minutos, num computador)

1. **Entrar com a conta da UCM.** Abra <https://script.google.com> com a conta @ucm.ac.mz. Se tiver várias contas abertas, confirme no canto superior direito que é a da UCM.
2. **Criar o projecto.** Clique em **Novo projecto** e dê-lhe o nome **Avaliação Docente UCM**.
3. **Colar os ficheiros.** Use a página **"Código do Sistema de Avaliação"**, que tem os botões de cópia:
   - no ficheiro `Code.gs`, apague tudo e cole com o **1.º botão**;
   - clique em **+ → HTML**, dê o nome `Pagina`, apague o conteúdo e cole com o **2.º botão**;
   - clique em **Guardar**.
4. **Instalar.** Na barra superior escolha a função **`instalar`** e clique em **Executar**. Autorize o acesso. O **Registo de execução** mostra o link da folha **"Registo — Avaliação de Desempenho Docente"**.
5. **Confirmar a Configuração.** Abra a folha do Registo e, no separador **Configuração**:
   - escreva o coordenador e o email de **Análises Clínicas e Laboratoriais**;
   - na linha **Direcção**, escreva o nome e o email de quem decide. Pode haver mais do que uma linha "Direcção".
6. **Publicar.** Clique em **Implementar → Nova implementação**, escolha **Aplicação Web** e preencha:
   - **Executar como:** Eu
   - **Quem tem acesso:** **Qualquer pessoa na Universidade Católica de Moçambique**, ou o nome do domínio ucm.ac.mz
7. **Copiar o link.** Clique em **Implementar** e copie o link que termina em `/exec`. É o link a enviar aos docentes.

Com acesso restrito à UCM, o aviso "This application was created by a Google Apps Script user" não aparece. O email do docente também é preenchido automaticamente.

## Quando o código mudar

1. Substitua o conteúdo dos dois ficheiros e clique em **Guardar**.
2. Para testar, use **Implementar → Testar implementações** (link `/dev`).
3. Para os docentes verem a mudança, vá a **Implementar → Gerir implementações → ✏️ → Versão: Nova versão → Implementar**. O link `/exec` mantém-se.

## Onde fica cada coisa

- **Registo:** uma linha por docente, com as unidades, os avaliadores, o estado ("Aguarda validação dos avaliadores (1 de 2)", "Aguarda decisão da Direcção", "Concluída"), as pontuações e os links da pasta e do PDF final.
- **Pasta "Processos por docente":** uma pasta por processo, com as evidências, as assinaturas e o **PDF final**.

## Notas

- **Devolução:** se a Direcção devolver um processo, todos os avaliadores recebem um link novo, com as validações anteriores já preenchidas. Os links antigos deixam de funcionar.
- **Emails:** uma conta Google Workspace pode enviar cerca de 1500 emails por dia.
- **Regra para quem alterar o código da `Pagina`:** nunca escreva duas barras seguidas (`//`) dentro do código, nem sequer em links. O serviço da Google corta a linha nesse ponto e a página deixa de funcionar.
