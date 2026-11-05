"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Automato = require("../js/automato.js");

const reconhecidas = ["c", "ac", "bc", "ca", "cb", "abc", "abca", "ccc", "acbcac", "ccccc"];
const rejeitadas = ["", "a", "b", "ab", "abab", "cc", "acc", "cabc", "acbc", "cccc", "d", "dc", "cd", "abcx"];

for (const palavra of reconhecidas) {
  test(`reconhece ${palavra}`, () => assert.equal(Automato.analisar(palavra).reconhecida, true));
}
for (const palavra of rejeitadas) {
  test(`rejeita ${palavra || "ε"}`, () => assert.equal(Automato.analisar(palavra).reconhecida, false));
}

test("todas as 78 transições operacionais têm o destino correto", () => {
  let verificadas = 0;
  for (const estado of Automato.ESTADOS) {
    for (const simbolo of Automato.DOMINIO) {
      const maquina = Automato.criarMaquina();
      if (estado === "qImpar") maquina.consumir("c");
      if (estado === "qErro") maquina.consumir("d");
      let esperado;
      if (estado === "qErro" || simbolo >= "d") esperado = "qErro";
      else if (simbolo === "c") esperado = estado === "qPar" ? "qImpar" : "qPar";
      else esperado = estado;
      const transicao = maquina.consumir(simbolo);
      assert.equal(transicao.anterior, estado);
      assert.equal(transicao.proximo, esperado, `${estado} --${simbolo}--> ${esperado}`);
      assert.equal(Automato.TRANSICOES[estado][simbolo], esperado);
      assert.equal(maquina.resultado().estado, esperado);
      verificadas += 1;
    }
  }
  assert.equal(verificadas, 78);
});

test("ccc alterna estados a cada consumo, sem encerrar a palavra", () => {
  const maquina = Automato.criarMaquina();
  assert.equal(maquina.resultado().estado, "qPar");
  for (const esperado of ["qImpar", "qPar", "qImpar"]) {
    maquina.consumir("c");
    assert.equal(maquina.resultado().estado, esperado);
  }
  assert.equal(maquina.resultado().palavra, "ccc");
  assert.deepEqual(maquina.resultado().percurso.map((passo) => passo.indice), [1, 2, 3]);
});

test("o erro é absorvente para qualquer sufixo a-z", () => {
  const resultado = Automato.analisar(`dc${Automato.DOMINIO}`);
  assert.equal(resultado.estado, "qErro");
  assert.equal(resultado.reconhecida, false);
  assert.ok(resultado.percurso.every((passo) => passo.proximo === "qErro"));
});

test("rastreamentos abca, cabc e dc registram símbolo, origem e destino", () => {
  for (const [palavra, estados] of [
    ["abca", ["qPar", "qPar", "qPar", "qImpar", "qImpar"]],
    ["cabc", ["qPar", "qImpar", "qImpar", "qImpar", "qPar"]],
    ["dc", ["qPar", "qErro", "qErro"]]
  ]) {
    const resultado = Automato.analisar(palavra);
    resultado.percurso.forEach((passo, i) => {
      assert.deepEqual(passo, { indice: i + 1, simbolo: palavra[i], anterior: estados[i], proximo: estados[i + 1] });
    });
  }
});

test("reiniciar não altera um resultado já salvo", () => {
  const maquina = Automato.criarMaquina();
  maquina.consumir("c");
  const salvo = maquina.resultado();
  maquina.reiniciar();
  maquina.consumir("a");
  assert.equal(salvo.palavra, "c");
  assert.equal(salvo.estado, "qImpar");
  assert.equal(salvo.percurso.length, 1);
  salvo.percurso[0].proximo = "alterado apenas na cópia";
  assert.equal(maquina.resultado().percurso[0].proximo, "qPar");
});

test("o núcleo recusa caracteres que devem passar pelo filtro de entrada", () => {
  for (const simbolo of ["", "cc", "C", "!", "é", " ", "\n", "😀"]) {
    const maquina = Automato.criarMaquina();
    assert.throws(() => maquina.consumir(simbolo), RangeError);
    assert.equal(maquina.resultado().estado, "qPar");
  }
  assert.throws(() => Automato.analisar(null), TypeError);
});

// Oráculo independente, restrito aos testes: nunca comanda a aplicação.
function referencia(palavra) {
  let quantidadeC = 0;
  for (const simbolo of palavra) {
    if (!"abc".includes(simbolo)) return false;
    if (simbolo === "c") quantidadeC += 1;
  }
  return quantidadeC % 2 === 1;
}

function enumerar(alfabeto, tamanhoMaximo, visitar, prefixo = "") {
  visitar(prefixo);
  if (prefixo.length === tamanhoMaximo) return;
  for (const simbolo of alfabeto) enumerar(alfabeto, tamanhoMaximo, visitar, prefixo + simbolo);
}

test("exaustivo: 1.093 cadeias de {a,b,c} com comprimentos de 0 a 6", () => {
  let verificadas = 0;
  enumerar("abc", 6, (palavra) => {
    assert.equal(Automato.analisar(palavra).reconhecida, referencia(palavra), palavra || "ε");
    verificadas += 1;
  });
  assert.equal(verificadas, 1093);
});

test("exaustivo adicional: 18.279 cadeias de a-z com comprimentos de 0 a 3", () => {
  let verificadas = 0;
  enumerar(Automato.DOMINIO, 3, (palavra) => {
    assert.equal(Automato.analisar(palavra).reconhecida, referencia(palavra), palavra || "ε");
    verificadas += 1;
  });
  assert.equal(verificadas, 18279);
});
