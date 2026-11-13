# Preparação para a apresentação individual

Este documento é um recurso de estudo para que cada integrante compreenda e demonstre o projeto. Não é um relatório adicional nominalmente exigido pelo professor.

## Roteiro sugerido

1. Apresente a linguagem: palavras sobre `{a,b,c}` com quantidade ímpar de `c`. Esclareça que `a` e `b` podem aparecer em qualquer posição e que letras repetidas são permitidas.
2. Mostre a tabela e explique `qPar`, `qImpar` e `qErro`. Distinga o AFD mínimo de dois estados da máquina operacional de três estados.
3. Digite `ccc` lentamente. Explique cada alternância e mostre que a situação ainda é “Em digitação”. Pressione espaço e mostre o reconhecimento.
4. Digite `cc ` e explique a rejeição por quantidade par. Digite `abca ` e `cabc ` para comparar os percursos.
5. Digite `dc ` para mostrar que a letra `d` entra na máquina e que o erro é absorvente.
6. Digite `cd`, remova `d` com Backspace e mostre o retorno a `qImpar` pelo recálculo. Encerre com espaço.
7. Cole `c cc ccc abcx ` e confira os quatro resultados no histórico.
8. Demonstre `c! ` e explique a cadeia efetivamente processada. Demonstre uma maiúscula para mostrar a orientação de usar minúsculas.
9. No VS Code, abra `js/automato.js`. Localize estados, inicial, finais, tabela e a consulta da transição durante a leitura.
10. Explique a divisão entre autômato, tratamento da entrada e atualização da interface. Mostre os testes e o invariante de paridade.

Repita o roteiro individualmente: quem apresenta deve conseguir localizar e explicar o trecho de código sem depender do colega.

## Perguntas de treino com respostas

### 1. Por que o estado inicial não é final?

Antes de ler qualquer símbolo, há zero letras `c`. Zero é par, portanto a máquina começa em `qPar`, que não é final. Isso rejeita ε e palavras sem `c`.

### 2. Por que `a` e `b` não mudam o estado de paridade?

Essas letras não acrescentam ocorrências de `c`. Se a quantidade era par, continua par; se era ímpar, continua ímpar. Por isso suas transições retornam ao mesmo estado de paridade.

### 3. Por que cada `c` troca de estado?

Adicionar uma ocorrência muda uma quantidade par para ímpar ou ímpar para par. A tabela faz `qPar --c--> qImpar` e `qImpar --c--> qPar`.

### 4. Por que `ccc` é aceita e `cc` é rejeitada?

`ccc` termina em `qImpar` após três alternâncias. `cc` termina em `qPar` após duas. A máquina aceita somente estados de `FINAIS`, que contém apenas `qImpar`.

### 5. Por que a palavra pode começar ou terminar com `a` ou `b`?

O enunciado restringe o alfabeto e a quantidade de `c`, sem exigir uma letra nas extremidades. Como `a` e `b` preservam o estado, `ac`, `ca` e `abca`, por exemplo, terminam em `qImpar`.

### 6. Por que uma palavra com `d` é rejeitada mesmo contendo um `c`?

`d` está fora de Σ. Sua transição leva a `qErro`, e todas as transições posteriores permanecem nesse estado não final. A condição exige tanto usar somente letras de Σ quanto ter quantidade ímpar de `c`.

### 7. Por que há dois estados no modelo e três na aplicação?

O modelo mínimo considera apenas entradas de Σ = `{a,b,c}`. A interface admite a–z para demonstrar palavras inválidas e precisa definir o que fazer com `d` a `z`. Para isso, inclui `qErro`, sem ampliar o conjunto das palavras reconhecidas.

### 8. Onde estão definidos os estados finais e as transições?

Em `js/automato.js`: `FINAIS` identifica os estados de aceitação, `INICIAL` identifica `qPar`, `ESTADOS` identifica os estados e `TRANSICOES` relaciona o estado corrente e a letra ao próximo estado. A função `analisar` produz o percurso ao executar a máquina.

### 9. Como o espaço encerra a análise?

O tratamento da entrada identifica o espaço comum como delimitador. Preserva a palavra corrente, o estado atingido e o percurso, determina se o estado pertence a `FINAIS` e reinicia a próxima palavra em `qPar`. O espaço não é consumido como letra do autômato. Espaço sem letras anteriores encerra ε e registra rejeição.

### 10. Como mudar para quantidade par de `c` sem aceitar ε?

Trocar apenas `FINAIS` para `['qPar']` também aceitaria ε, porque `qPar` é inicial. Isso reconheceria a versão que admite a palavra vazia, mas não preservaria a exigência de `{a,b,c}⁺`.

Uma adaptação inteiramente representada por estados deve criar um estado inicial adicional, por exemplo `qInicio`, que seja não final. Dele, `a` ou `b` leva a `qPar`, `c` leva a `qImpar` e `d` a `z` leva a `qErro`. Os estados existentes mantêm suas transições, e somente `qPar` passa a ser final. Nenhuma transição retorna a `qInicio`.

Assim, `qInicio` distingue “nenhuma letra lida” de “quantidade par após ao menos uma letra”. ε termina em `qInicio` e é rejeitada; `a` e `cc` terminam em `qPar` e são reconhecidas. A tabela, os testes, a documentação e a interface também devem refletir esse novo estado.

### 11. Como adaptar para contar outra letra?

Escolha a letra cuja paridade será relevante. Para contar `a` ímpares sobre `{a,b,c}`, por exemplo, as transições de `a` passam a alternar `qPar` e `qImpar`, enquanto `b` e `c` preservam o estado. `qErro` continua absorvente. Atualize descrição, tabela visível, gramática, exemplos e testes para a nova linguagem.

### 12. Como admitir uma nova letra no alfabeto?

Primeiro é preciso definir a semântica da letra. Para admitir `d`, ela deve preservar a paridade como `a` e `b`, ou alterná-la como `c`? A decisão depende da nova linguagem. Atualize Σ, a tabela nos estados de paridade, a classificação de letras inválidas, a tabela da interface, a gramática e os testes. O domínio do campo já inclui `d`, mas isso, por si só, não a torna parte de Σ.

## Alterações para praticar

- Localizar a transição consultada ao consumir o primeiro e o segundo `c`.
- Explicar por que editar `cd` para `c` permite recuperar a análise, embora `qErro` seja absorvente.
- Alterar temporariamente a letra cuja paridade é controlada, atualizar os testes e conferir os resultados.
- Construir a versão de quantidade par e não vazia com `qInicio`, em uma cópia de estudo do projeto.
- Explicar por que pontuação ignorada não entra no percurso, mas letras `d` a `z` entram.

Reverta os exercícios na cópia de estudo antes da entrega: o projeto entregue deve continuar resolvendo a letra j originalmente atribuída.
