# TDE — Analisador léxico

Aplicação interativa da disciplina **Linguagens Formais**, URI Campus Erechim, professor **Fabio Zanin**. Implementa a **Lista de Exercícios 2, exercício 2, letra j**:

> Reconhece palavras com a, b e c que possuem quantidade ímpar de c.

**L(G) = {x | x ∈ {a,b,c}⁺ e o número de c em x é ímpar}.**

O reconhecimento utiliza uma máquina de estados e uma tabela de transições. Não consulta uma lista de palavras nem decide o resultado contando letras. A contagem aparece apenas nos testes como referência independente.

## Identificação

| Campo | Identificação |
|---|---|
| Integrante 1 | **Gabriel Novelo Javornik** |
| Integrante 2 | **Pedro Santin Montemesso** |
| Turma indicada no material | 2024-2 |
| Trabalho | TDE em dupla; apresentação e avaliação individuais |
| Peso informado | 20% da nota semestral |

Datas fornecidas nos materiais: **entrega até 18/11/2026 às 23h59**, pelo Google Drive; **apresentação individual em 19/11/2026**, em aula. Esses dados foram preservados conforme o enunciado recebido.

## Executar

1. Abra a pasta do projeto no **Visual Studio Code** para consultar ou alterar os arquivos.
2. Para usar o analisador, abra **`index.html` em um navegador** com um duplo clique no arquivo.
3. Digite uma palavra usando letras minúsculas e pressione **espaço** para encerrá-la.

Não precisa de Node.js, instalação, extensão do VS Code, servidor ou conexão com a internet para usar a aplicação. HTML, CSS e JavaScript são arquivos locais; não há CDN ou fontes remotas.

## Usar durante a apresentação

- Observe o estado e o percurso enquanto digita. **Em digitação** permanece visível até o espaço, mesmo quando o estado corrente é final.
- O espaço registra **Reconhecida** ou **Rejeitada**, preserva o percurso no histórico e reinicia a palavra seguinte em `qPar`.
- Abra o percurso de uma palavra no histórico para explicar suas transições.
- **Limpar análise** descarta apenas a palavra corrente; preserva histórico e último resultado.
- **Limpar histórico** remove os resultados registrados; preserva a palavra corrente.
- O histórico fica na memória da página. Recarregar ou fechar a página o descarta.

Uma sequência útil é `c cc ccc abcx `, com espaço também ao final. Os resultados esperados, na ordem, são: reconhecida, rejeitada, reconhecida e rejeitada.

## Política de entrada

O domínio do campo é **a–z**, mais o espaço delimitador. O alfabeto da linguagem continua sendo **Σ = {a,b,c}**.

| Entrada | Comportamento |
|---|---|
| `a`, `b`, `c` | Consome a letra e consulta a tabela de transições. |
| `d` a `z` | Preserva a letra e entra em `qErro`; a palavra será rejeitada. |
| Espaço comum | Encerra a palavra e prepara a próxima. |
| Espaço com palavra vazia | Registra rejeição de ε. Espaços consecutivos repetem essa regra. |
| Maiúsculas | Ignora e orienta a usar minúsculas; não converte automaticamente. |
| Pontuação, dígitos e acentos | Ignora e informa o ocorrido; não normaliza letras acentuadas. |
| Quebras de linha coladas | Ignora como símbolos especiais; não as transforma em espaços. |
| Enter | Não encerra a palavra nem recarrega a página. |
| Tab | Mantém a navegação entre os controles. |

A interface mostra a cadeia efetivamente processada. Por exemplo, `c! ` processa `c` e reconhece; `c@c ` processa `cc` e rejeita; `c!d ` processa `cd` e rejeita. Em `dc `, o `c` mantém `qErro`.

É possível usar Backspace, Delete, selecionar e substituir texto e colar várias palavras. Editar a palavra corrente recalcula seu percurso desde `qPar`, sem alterar palavras encerradas. Assim, corrigir `cd` para `c` recupera `qImpar` antes do próximo espaço.

Filtragem de símbolos, tratamento de maiúsculas, edição, histórico e controles de limpeza são **escolhas do projeto** que complementam pontos não detalhados pelo professor.

## Organização do código

```text
index.html                  Estrutura e conteúdo da interface
styles.css                  Aparência e adaptação às telas
js/automato.js              Estados, tabela e execução da máquina
js/entrada.js               Filtragem, edição e delimitação por espaço
js/interface.js             Eventos e atualização da interface
tests/automato.test.js       Casos da linguagem e verificação exaustiva
tests/entrada.test.js        Filtragem, colagem, edição e delimitadores
docs/automato.md             Modelo formal, gramática e rastreamentos
docs/apresentacao.md         Roteiro e perguntas de treino com respostas
docs/verificacao.md          Registro de verificações e roteiro manual
package.json                Comando opcional para os testes de desenvolvimento
scripts/preparar-entrega.ps1 Geração opcional da pasta e do ZIP de entrega
```

Em `js/automato.js`, procure `ESTADOS`, `INICIAL`, `FINAIS` e `TRANSICOES`. A função `analisar` devolve a palavra, o estado final, o reconhecimento e o percurso. O tratamento da entrada e a interface ficam em arquivos separados para facilitar a explicação e alterações.

## Testes de desenvolvimento

Com Node.js instalado, na pasta do projeto:

```sh
node --test
```

Também é possível executar `npm test`. Não é necessário executar `npm install`: os testes usam recursos do próprio Node.js.

A suíte contém **47 testes** e cobre os exemplos obrigatórios, as 78 transições operacionais (três estados × 26 letras), as **1.093 cadeias** de `{a,b,c}` de comprimento 0 a 6, mais **18.279 cadeias** de `a–z` de comprimento 0 a 3, e casos de filtragem, espaços, colagem e edição. O registro do que foi efetivamente executado está em [docs/verificacao.md](docs/verificacao.md).

## Entrega

A pasta de entrega está disponível em:

```text
entrega/INTEGRANTES_A_PREENCHER/TDE--Analisador_Lexico/
entrega/TDE--Analisador_Lexico.zip
```

Antes de enviar, preencha os dois nomes completos acima e renomeie a pasta `INTEGRANTES_A_PREENCHER` com os nomes dos integrantes. Extraia o ZIP antes de executar o `index.html`; mantenha as subpastas e os arquivos juntos. Os integrantes devem realizar a submissão no Google Drive.

Para refazer o pacote após preencher os nomes, execute no PowerShell, na pasta do projeto:

```powershell
.\scripts\preparar-entrega.ps1 -Identificacao 'Nome Completo 1 e Nome Completo 2'
```

O script copia somente os arquivos do projeto e substitui o ZIP gerado. Ele não altera os nomes dentro do README: preencha-os antes. Executar o script sem argumentos mantém a identificação provisória.

O pacote inclui implementação, testes e documentação, sem dependências instaladas ou metadados do Git. A documentação e as perguntas de treino são recursos de apoio ao entendimento e à apresentação; não representam um relatório adicional atribuído ao professor.

## Material de apoio

- [Modelo formal e correção](docs/automato.md)
- [Roteiro da apresentação individual](docs/apresentacao.md)
- [Verificações e roteiro manual](docs/verificacao.md)

O desenvolvimento segue o enunciado textual fornecido. Os sete vídeos mencionados e outros arquivos originais do professor não estavam disponíveis na pasta inicial do repositório.
