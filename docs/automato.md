# Modelo formal e funcionamento

## Linguagem atribuída

**L(G) = {x | x ∈ {a,b,c}⁺ e o número de c em x é ímpar}.**

A palavra pode começar ou terminar com qualquer letra de Σ = {a,b,c}. Letras consecutivas são permitidas: `ccc` é reconhecida. Palavras sem `c`, a palavra vazia ε e palavras com letras fora de Σ são rejeitadas.

## AFD mínimo sobre Σ

Definimos **M = (Q, Σ, δ, qPar, F)**, em que:

- Q = {qPar, qImpar};
- Σ = {a,b,c};
- qPar é o estado inicial;
- F = {qImpar};
- δ é a função da tabela abaixo.

| Estado | a | b | c |
|---|---|---|---|
| → qPar | qPar | qPar | qImpar |
| * qImpar | qImpar | qImpar | qPar |

`→` indica estado inicial e `*` indica estado final. “Final” significa que o estado autoriza reconhecimento **se a palavra terminar naquele ponto**; não significa que a leitura deve parar imediatamente.

`qPar` representa um prefixo com quantidade par de `c`, inclusive zero. `qImpar` representa um prefixo com quantidade ímpar. As letras `a` e `b` não modificam essa quantidade, portanto preservam o estado. Cada `c` acrescenta uma ocorrência e alterna a paridade.

Os dois estados são alcançáveis: ε chega a `qPar` e `c` chega a `qImpar`. Eles são distinguíveis pelo sufixo vazio, pois um é final e o outro não. Portanto, não podem ser unidos, e este AFD de dois estados é mínimo sobre Σ.

## Justificativa pelo invariante de paridade

O invariante é: **após ler qualquer prefixo sobre Σ, o estado é `qPar` exatamente quando o número de `c` no prefixo é par, e `qImpar` exatamente quando é ímpar**.

Na base, o prefixo vazio tem zero ocorrências de `c`, e a máquina começa em `qPar`. No passo indutivo, ler `a` ou `b` preserva a contagem de `c` e o estado. Ler `c` troca par por ímpar ou ímpar por par, exatamente como faz δ. Logo, o invariante vale após qualquer quantidade de símbolos.

Como somente `qImpar` é final, uma palavra sobre Σ é reconhecida se, e somente se, possui quantidade ímpar de `c`. Isso também exclui ε: a leitura vazia permanece em `qPar`. Os testes finitos ajudam a detectar erros de implementação; o invariante justifica a correção para palavras de qualquer comprimento.

## Máquina operacional sobre a–z

Para permitir testes com letras inválidas no campo, a aplicação usa **Γ = {a,...,z}** e o estado adicional `qErro`:

**MΓ = ({qPar,qImpar,qErro}, Γ, δΓ, qPar, {qImpar}).**

| Estado | a | b | c | Qualquer letra de d a z |
|---|---|---|---|---|
| → qPar | qPar | qPar | qImpar | qErro |
| * qImpar | qImpar | qImpar | qPar | qErro |
| qErro | qErro | qErro | qErro | qErro |

Qualquer letra de `d` a `z` invalida a palavra, mesmo se ela já contiver quantidade ímpar de `c`. `qErro` é não final e absorvente: todas as letras mantêm esse estado. Essa extensão não inclui novas palavras na linguagem; apenas define a rejeição de entradas fora de Σ.

Uma edição que remova a letra inválida pode recuperar um estado de paridade porque a aplicação passa a analisar **outra palavra**, recomeçando do estado inicial. Isso não é uma saída de `qErro` durante a leitura da mesma palavra.

## Execução no código

`js/automato.js` reúne `ESTADOS`, `INICIAL`, `FINAIS` e `TRANSICOES`. Para cada letra consumida, a operação central é:

```text
anterior ← estado atual
próximo ← TRANSICOES[anterior][símbolo]
registrar (anterior, símbolo, próximo)
estado atual ← próximo
```

O resultado de `analisar(palavra)` inclui `palavra`, `estado`, `reconhecida` e `percurso`. Cada passo do percurso tem `indice` (começando em 1), `simbolo`, `anterior` e `proximo`. O reconhecimento é determinado pela presença do estado atingido em `FINAIS`.

`js/entrada.js` aplica a política de caracteres, identifica espaços delimitadores e chama a máquina. A interface trata eventos de entrada e composição de texto, em vez de depender apenas de teclas. Quando o texto é corrigido, o percurso da palavra corrente é reconstruído desde `qPar`. O histórico recebe apenas palavras encerradas por espaço.

O espaço pertence ao protocolo da interface, não a Σ nem a Γ. Ao recebê-lo, a aplicação preserva resultado e percurso da palavra encerrada, e começa a próxima em `qPar`. A cadeia corrente permanece “Em digitação” até esse delimitador.

## Gramática regular equivalente

```text
S ::= aS | bS | cA
A ::= aA | bA | cS | ε
```

O não terminal inicial `S` corresponde a `qPar`; `A` corresponde a `qImpar`. As produções com `a` e `b` preservam o não terminal, e as produções com `c` alternam entre `S` e `A`. A produção `A ::= ε` permite terminar em um estado correspondente à quantidade ímpar de `c`.

O símbolo inicial `S` não tem produção vazia. Para chegar a `A`, é preciso consumir ao menos um `c`; assim, a gramática não gera ε a partir de `S`. Não há produção para `d` a `z`, que são rejeitadas pela máquina operacional.

Por exemplo:

```text
S ⇒ aS ⇒ abS ⇒ abcA ⇒ abcaA ⇒ abca
```

## Rastreamentos comentados

### `abca` — reconhecida

```text
qPar --a--> qPar --b--> qPar --c--> qImpar --a--> qImpar
```

| Passo | Símbolo | Antes | Depois | Explicação |
|---|---|---|---|---|
| 1 | a | qPar | qPar | Não acrescenta c. |
| 2 | b | qPar | qPar | Não acrescenta c. |
| 3 | c | qPar | qImpar | Primeira ocorrência de c. |
| 4 | a | qImpar | qImpar | Preserva a paridade ímpar. |

Ao espaço, `qImpar` pertence a F: palavra reconhecida.

### `cabc` — rejeitada

```text
qPar --c--> qImpar --a--> qImpar --b--> qImpar --c--> qPar
```

| Passo | Símbolo | Antes | Depois | Explicação |
|---|---|---|---|---|
| 1 | c | qPar | qImpar | Alterna de par para ímpar. |
| 2 | a | qImpar | qImpar | Preserva a paridade. |
| 3 | b | qImpar | qImpar | Preserva a paridade. |
| 4 | c | qImpar | qPar | Segunda ocorrência: quantidade par. |

Ao espaço, `qPar` não pertence a F: palavra rejeitada.

### `dc` — rejeitada

```text
qPar --d--> qErro --c--> qErro
```

| Passo | Símbolo | Antes | Depois | Explicação |
|---|---|---|---|---|
| 1 | d | qPar | qErro | Letra fora de Σ. |
| 2 | c | qErro | qErro | O erro é absorvente. |

Ao espaço, `qErro` não pertence a F: palavra rejeitada. A existência de um `c` não corrige a letra inválida.

### `ccc` durante a digitação

```text
qPar --c--> qImpar --c--> qPar --c--> qImpar
```

Cada letra altera o estado visível, mas a palavra só recebe resultado encerrado ao espaço. `cc` terminaria em `qPar`; `ccc` termina em `qImpar`.
