# Formulário Google — Avaliação do Desempenho do Professor a Tempo Inteiro

Este formulário é gerado automaticamente pelo script `CriarFormulario.gs`, com base no **Apêndice 3 — Modelo de Avaliação do Desempenho do Professor, a tempo inteiro**.

## Como criar o formulário (cerca de 3 minutos)

1. Abra <https://script.google.com> com a sua conta Google e clique em **Novo projecto**.
2. Apague o conteúdo de `Code.gs` e cole **todo** o conteúdo de `CriarFormulario.gs`.
3. Clique em **Guardar** (ícone de disquete).
4. Na barra superior, seleccione a função **`criarFormulario`** e clique em **Executar**.
5. Autorize o acesso quando o Google pedir. Se aparecer *"A Google não validou esta app"*, clique em **Avançadas → Aceder ao projecto (não seguro)**. O script é seu e só cria ficheiros na sua conta.
6. Abra **Registo de execução**. Lá estão os três links: editar o formulário, partilhar o formulário e abrir a folha de respostas.

> Execute `criarFormulario` **apenas uma vez**. Se o executar de novo, será criado um novo formulário.

## Estrutura do formulário

| Secção | Conteúdo |
|---|---|
| 1. Dados do professor avaliado | Nome, Unidade Básica/Extensão, Departamento, Categoria Profissional, Período de Avaliação |
| 2. Tipo de função | Escolha entre Quadro 1 e Quadro 2. O formulário mostra apenas o quadro escolhido |
| Quadro 1: com coordenação | Docência (50 pts, 7 critérios), Investigação (40 pts, 9 critérios), Gestão académica (10 pts, 3 critérios) |
| Quadro 2: sem gestão | Docência (60 pts, 7 critérios), Investigação (40 pts, 9 critérios) |
| Apreciação final | Pontos fortes, aspectos a melhorar, avaliador, cargo, data e declaração |

- Cada critério pede uma **pontuação entre 0 e a pontuação básica máxima** do modelo. Por exemplo, "Facilitação de aulas…" aceita 0 a 16,40 no Quadro 1. O Google Forms rejeita valores fora deste intervalo.
- Cada padrão tem um campo opcional de **evidências**, como turmas leccionadas, orientandos ou links de publicações.
- Na **Investigação** há ainda um campo **Link para anexo de evidências**. O avaliado coloca os comprovativos (certificados, artigos, actas, declarações) numa pasta do Google Drive, partilha-a com "Qualquer pessoa com o link" e cola o link. O formulário só aceita links válidos (https://). O Google Forms não permite criar perguntas de carregamento de ficheiros por script; por isso usa-se o link.

## Cálculo automático

Cada resposta é registada numa folha Google. O separador **Pontuações** soma automaticamente:
**Docência + Investigação + Gestão = TOTAL (máximo 100 pontos)**.

## Personalização (opcional)

- **Logótipo da instituição:** no formulário, clique em *Personalizar tema → Cabeçalho* e carregue a imagem.
- **Categorias profissionais:** altere a lista em `setChoiceValues([...])` antes de executar o script.
