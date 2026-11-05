/* Regras de entrada separadas tanto da máquina quanto dos elementos da página. */
(function (raiz, criarAPI) {
  "use strict";
  if (typeof module !== "undefined" && module.exports) {
    module.exports = criarAPI(require("./automato.js"));
  } else {
    raiz.Entrada = criarAPI(raiz.Automato);
  }
})(globalThis, function (Automato) {
  "use strict";

  function motivoIgnorado(simbolo) {
    if (simbolo >= "A" && simbolo <= "Z") return "Use letras minúsculas de a a z; maiúsculas não são convertidas.";
    if (simbolo === "\n" || simbolo === "\r") return "Quebra de linha ignorada; somente o espaço encerra a palavra.";
    return "Símbolo ignorado; use letras minúsculas de a a z e espaço.";
  }

  function processarEdicao(texto, cursor = texto.length) {
    if (typeof texto !== "string") throw new TypeError("A entrada deve ser um texto.");
    const posicaoCursor = Number.isFinite(cursor) ? Math.max(0, Math.min(texto.length, cursor)) : texto.length;
    const encerradas = [];
    const ignorados = [];
    const maquina = Automato.criarMaquina();
    let cursorCauda = 0;
    let posicaoOriginal = 0;

    for (const simbolo of texto) {
      if (simbolo >= "a" && simbolo <= "z") {
        maquina.consumir(simbolo);
        if (posicaoOriginal < posicaoCursor) cursorCauda += 1;
      } else if (simbolo === " ") {
        // O espaço não é símbolo da máquina. Primeiro salva, depois reinicia.
        encerradas.push(maquina.resultado());
        maquina.reiniciar();
        cursorCauda = 0;
      } else {
        ignorados.push({ simbolo, motivo: motivoIgnorado(simbolo) });
      }
      // Índices do textarea são medidos em unidades UTF-16, inclusive para emoji.
      posicaoOriginal += simbolo.length;
    }

    return { atual: maquina.resultado(), encerradas, ignorados, cursor: cursorCauda };
  }

  return { processarEdicao };
});
