# Registro de verificação

Verificações realizadas em **05/11/2026**, no Windows, a partir do enunciado textual fornecido. O repositório inicialmente continha apenas um README. Os sete vídeos e outros documentos originais do professor não estavam disponíveis.

## Testes automatizados do núcleo e da entrada

**Resultado: 47 testes aprovados; nenhuma falha.** Executados com Node.js v24.18.0:

```sh
node --test tests/automato.test.js tests/entrada.test.js
```

Também foi executado `npm.cmd test`. Não foi necessária instalação de dependências.

- Todos os 24 exemplos obrigatórios de palavras reconhecidas e rejeitadas.
- As 78 transições: três estados e 26 letras, incluindo erro absorvente.
- As 1.093 cadeias de `{a,b,c}` com comprimento de zero a seis.
- As 18.279 cadeias de `a–z` com comprimento de zero a três.
- Nos dois conjuntos exaustivos, comparação com referência independente que exige alfabeto válido e conta `c` ímpares; essa referência existe somente nos testes.
- Percursos `ccc`, `abca`, `cabc` e `dc`; reinício e preservação de resultados.
- Espaço, ε, espaços consecutivos, lotes, símbolos ignorados, maiúsculas, acentos, emoji, quebras de linha e edição.
- Correção `cd` para `c`, substituição, exclusão e ajuste do cursor, inclusive após emoji e espaço no meio do campo.

O invariante de paridade em [automato.md](automato.md) justifica a correção para qualquer comprimento; a enumeração finita complementa essa prova.

## Interface em navegador real

**26 cenários aprovados no Chrome 156.0.8078.80 e no Edge 156.0.4314.58**, por automação Playwright disponível no ambiente de desenvolvimento. Os dois navegadores abriram o `index.html` via `file://`, com o contexto de rede em modo offline. Não houve requisições HTTP/HTTPS nem erros JavaScript da aplicação.

| Verificação executada | Resultado |
|---|---|
| Abertura local sem servidor | `qPar`, sem palavra encerrada. |
| Digitar `ccc` passo a passo | `qImpar`, `qPar`, `qImpar`; sempre “Em digitação”, sem registro antecipado. |
| Percurso e tabela | Passos corretos e destaque da última transição consultada. |
| Espaço após `ccc` | Reconhecimento, preservação no histórico e reinício em `qPar`. |
| Abrir percurso no histórico | Passos preservados e legíveis. |
| Entrada em lote `c cc ccc abcx ` | Reconhecida, rejeitada, reconhecida, rejeitada, nessa ordem. |
| `c! `, `c@c `, `c!d ` e `dc ` | Políticas obrigatórias respeitadas. |
| Maiúsculas, acentos, dígitos e emoji | Ignorados, sem normalização, com aviso visível. |
| Backspace em `cd` e Delete em `dc` | Palavra `c`, `qImpar`, sem transições antigas ou duplicação de histórico. |
| Selecionar e substituir | Análise coerente com o novo texto. |
| Inserir espaço após `c` em `cab` | Registra `c`, mantém `ab` no campo e cursor no início da cauda. |
| Inserção em lote com quebra de linha | Quebra ignorada; `c` + quebra + `c ` encerra somente `cc`. |
| Dois espaços com campo vazio | Dois registros de ε rejeitada. |
| Enter | Não encerra nem navega/recarrega a página. |
| Tab e Shift+Tab | Saem do campo e retornam a ele. |
| Limpar análise | Histórico e último resultado preservados. |
| Limpar histórico | Palavra corrente e estado preservados. |
| Sequência de eventos de composição | Sem duplicação ao receber `compositionend` seguido de `input`. |
| Recarregar | Histórico descartado e estado inicial restaurado. |
| Palavra com 5.000 letras | Percurso completo e interface sem falha. |
| Tela de 390 × 844 | Sem rolagem horizontal da página; tabela do histórico tem rolagem interna. |

A automação usou teclas do navegador para digitação e correção; inserções de lotes foram feitas com `fill`, acionando `input`. Eventos de composição foram simulados. O conteúdo inserido em lote percorre a mesma função usada na colagem, mas a área de transferência nativa do Windows e um teclado IME físico não foram exercitados.

Foram inspecionadas capturas das telas de computador (1440 px) e celular (390 px). Corrigiu-se a largura mínima do conteúdo no layout móvel e o ocultamento visual do atalho de acessibilidade fora do foco.

## Pacote de entrega

**Pacote extraído e aprovado em pasta independente do repositório.** O ZIP foi gerado com `scripts/preparar-entrega.ps1`, extraído em uma pasta de verificação e executado por `file://`, offline. Nessa cópia, passaram novamente os 47 testes Node e os 26 cenários de interface no Chrome, incluindo edição, lotes, símbolos ignorados e layout móvel.

A pasta e o ZIP finais foram regenerados após completar este registro. A integridade de todos os arquivos foi conferida por SHA-256 entre a origem e a extração final. A pasta gerada contém implementação, documentação, testes e script de empacotamento, sem `.git` ou dependências. O nome provisório `INTEGRANTES_A_PREENCHER` precisa ser substituído antes da submissão.

## Verificações de código

- `node --check` nos três arquivos JavaScript da aplicação: aprovado.
- `git diff --check`: aprovado.
- Revisão independente do núcleo, entrada e interface: sem defeitos identificados.
- A tabela da interface é montada a partir de `TRANSICOES`; a entrada é exibida usando `textContent`, sem interpretar HTML.
- Nenhum recurso remoto, serviço externo ou carregamento que exija servidor.

## Roteiro manual complementar

1. Extraia o ZIP e abra `index.html` diretamente no navegador.
2. Digite `ccc` lentamente e encerre com espaço; abra seu percurso no histórico.
3. Cole `c cc ccc abcx ` usando Ctrl+V e confira os quatro resultados.
4. Cole `c` + uma quebra de linha + `c `: deve rejeitar apenas `cc` e informar o símbolo ignorado.
5. Digite `cd`, apague `d` e encerre: deve reconhecer `c`.
6. Experimente `C`, `á`, `!`, `c! ` e `c!d `; observe a cadeia efetiva e os avisos.
7. Navegue por Tab/Shift+Tab e abra os percursos pelo teclado.
8. Para outro navegador ou dispositivo, repita o roteiro e confira legibilidade, edição e espaço. Firefox, Safari, leitores de tela e aparelhos móveis físicos não foram testados.

Preencher os nomes dos integrantes e realizar a submissão no Google Drive são as pendências de entrega. Documentação e perguntas de treino são recursos de apoio do projeto, sem atribuir um relatório adicional ao professor.
