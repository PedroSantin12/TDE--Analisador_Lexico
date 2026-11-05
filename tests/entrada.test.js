"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Entrada = require("../js/entrada.js");

test("sem espaço a palavra permanece na análise corrente", () => {
  for (const [palavra, estado] of [["c", "qImpar"], ["cc", "qPar"], ["ccc", "qImpar"]]) {
    const resultado = Entrada.processarEdicao(palavra);
    assert.equal(resultado.atual.estado, estado);
    assert.equal(resultado.encerradas.length, 0);
  }
});

test("c cc ccc abcx seguido de espaço preserva a ordem e reinicia", () => {
  const resultado = Entrada.processarEdicao("c cc ccc abcx ");
  assert.deepEqual(resultado.encerradas.map((item) => [item.palavra, item.reconhecida, item.estado]), [
    ["c", true, "qImpar"], ["cc", false, "qPar"], ["ccc", true, "qImpar"], ["abcx", false, "qErro"]
  ]);
  assert.equal(resultado.atual.palavra, "");
  assert.equal(resultado.atual.estado, "qPar");
  assert.deepEqual(resultado.atual.percurso, []);
});

for (const [texto, palavra, reconhecida, estado, ignorados] of [
  ["c! ", "c", true, "qImpar", ["!"]],
  ["c@c ", "cc", false, "qPar", ["@"]],
  ["c!d ", "cd", false, "qErro", ["!"]],
  ["dc ", "dc", false, "qErro", []]
]) {
  test(`política obrigatória de entrada: ${JSON.stringify(texto)}`, () => {
    const resultado = Entrada.processarEdicao(texto);
    assert.equal(resultado.encerradas.length, 1);
    assert.deepEqual([
      resultado.encerradas[0].palavra,
      resultado.encerradas[0].reconhecida,
      resultado.encerradas[0].estado
    ], [palavra, reconhecida, estado]);
    assert.deepEqual(resultado.ignorados.map((item) => item.simbolo), ignorados);
  });
}

test("espaços consecutivos rejeitam cada cadeia vazia", () => {
  const resultado = Entrada.processarEdicao("  c  ");
  assert.deepEqual(resultado.encerradas.map((item) => item.palavra), ["", "", "c", ""]);
  assert.deepEqual(resultado.encerradas.map((item) => item.reconhecida), [false, false, true, false]);
  assert.ok(resultado.encerradas.filter((item) => !item.palavra).every((item) => item.estado === "qPar"));
});

test("maiúsculas são ignoradas com orientação, sem conversão", () => {
  const resultado = Entrada.processarEdicao("CcA ");
  assert.equal(resultado.encerradas[0].palavra, "c");
  assert.equal(resultado.encerradas[0].reconhecida, true);
  assert.deepEqual(resultado.ignorados.map((item) => item.simbolo), ["C", "A"]);
  assert.ok(resultado.ignorados.every((item) => item.motivo.includes("minúsculas")));
});

test("acentos, números, emoji e pontuação não mudam a máquina", () => {
  const resultado = Entrada.processarEdicao("á1c😀!?ç ");
  assert.equal(resultado.encerradas[0].palavra, "c");
  assert.equal(resultado.encerradas[0].percurso.length, 1);
  assert.deepEqual(resultado.ignorados.map((item) => item.simbolo), ["á", "1", "😀", "!", "?", "ç"]);
});

test("quebras de linha e tab colados são ignorados, não delimitadores", () => {
  const resultado = Entrada.processarEdicao("c\r\nc\tc ");
  assert.equal(resultado.encerradas.length, 1);
  assert.equal(resultado.encerradas[0].palavra, "ccc");
  assert.equal(resultado.encerradas[0].reconhecida, true);
  assert.deepEqual(resultado.ignorados.map((item) => item.simbolo), ["\r", "\n", "\t"]);
});

test("colagem termina palavras e mantém uma cauda editável", () => {
  const resultado = Entrada.processarEdicao("c cc ab");
  assert.deepEqual(resultado.encerradas.map((item) => item.palavra), ["c", "cc"]);
  assert.equal(resultado.atual.palavra, "ab");
  assert.equal(resultado.cursor, 2);
});

test("edição de cd para c remove o erro e o percurso antigo", () => {
  assert.equal(Entrada.processarEdicao("cd").atual.estado, "qErro");
  const corrigido = Entrada.processarEdicao("c");
  assert.equal(corrigido.atual.estado, "qImpar");
  assert.equal(corrigido.atual.percurso.length, 1);
  assert.equal(corrigido.encerradas.length, 0);
  assert.equal(Entrada.processarEdicao("c ").encerradas[0].reconhecida, true);
});

test("reprocessar após edição preserva resultados salvos sem duplicá-los", () => {
  const historico = [];
  let campo = "";
  function editar(texto) {
    const resultado = Entrada.processarEdicao(texto);
    historico.push(...resultado.encerradas);
    campo = resultado.atual.palavra;
    return resultado;
  }
  editar("c ");
  assert.equal(campo, "");
  editar("cd");
  editar("c");
  editar("ca");
  assert.equal(historico.length, 1);
  editar(`${campo} `);
  assert.deepEqual(historico.map((item) => item.palavra), ["c", "ca"]);
  assert.deepEqual(historico[0].percurso.map((item) => item.simbolo), ["c"]);
});

test("cursor acompanha filtragem e inserção de espaço no meio", () => {
  assert.equal(Entrada.processarEdicao("c!d", 2).cursor, 1);
  assert.equal(Entrada.processarEdicao("c😀a", 3).cursor, 1);
  assert.equal(Entrada.processarEdicao("c😀a", 4).cursor, 2);
  const meio = Entrada.processarEdicao("c ab", 2);
  assert.equal(meio.encerradas[0].palavra, "c");
  assert.equal(meio.atual.palavra, "ab");
  assert.equal(meio.cursor, 0);
  assert.equal(Entrada.processarEdicao("c ab", 3).cursor, 1);
  assert.equal(Entrada.processarEdicao("c ab", 0).cursor, 0);
});

test("exclusão e substituição recalculam apenas a cadeia corrente", () => {
  assert.equal(Entrada.processarEdicao("ccc").atual.estado, "qImpar");
  assert.equal(Entrada.processarEdicao("cc").atual.estado, "qPar");
  assert.equal(Entrada.processarEdicao("ac").atual.estado, "qImpar");
  const vazio = Entrada.processarEdicao("");
  assert.equal(vazio.atual.estado, "qPar");
  assert.deepEqual(vazio.atual.percurso, []);
  assert.equal(vazio.encerradas.length, 0);
});
