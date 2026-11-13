/* O núcleo não acessa a página: pode ser usado no navegador e nos testes. */
(function (raiz, criarAPI) {
  "use strict";
  const api = criarAPI();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else raiz.Automato = api;
})(globalThis, function () {
  "use strict";

  const ESTADOS = Object.freeze(["qPar", "qImpar", "qErro"]);
  const INICIAL = "qPar";
  const FINAIS = Object.freeze(["qImpar"]);
  const ALFABETO = Object.freeze(["a", "b", "c", "f"]);
  const DOMINIO_VALIDO = "abcf";  // Estas seis transições descrevem o AFD mínimo sobre {a,b,c}.
  const DOMINIO_INVALIDO = "deghijklmnopqrstuvwxyz";  // Estas seis transições descrevem o AFD mínimo sobre {a,b,c}.

  const TRANSICOES = {
    qPar: { a: "qPar", b: "qPar", c: "qImpar", f: "qPar" },
    qImpar: { a: "qImpar", b: "qImpar", c: "qPar", f: "qImpar" },
    qErro: { a: "qErro", b: "qErro", c: "qErro", f: "qErro" }
  };

  // A aplicação permite a–z: toda letra fora de Σ entra no erro absorvente.
  for (const estado of ESTADOS) {
    for (const simbolo of DOMINIO_INVALIDO) {
      TRANSICOES[estado][simbolo] = "qErro";
    }
    Object.freeze(TRANSICOES[estado]);
  }
  Object.freeze(TRANSICOES);

  function criarMaquina() {
    let estadoAtual = INICIAL;
    let palavra = "";
    let percurso = [];

    function consumir(simbolo) {
      if (typeof simbolo !== "string" || simbolo.length !== 1 || !DOMINIO_VALIDO.includes(simbolo)) {
        throw new RangeError("O autômato operacional consome apenas uma letra minúscula de a a z por vez.");
      }

      // O reconhecimento depende desta consulta, não de uma contagem de c.
      const anterior = estadoAtual;
      const proximo = TRANSICOES[estadoAtual][simbolo];
      const transicao = { indice: percurso.length + 1, simbolo, anterior, proximo };
      percurso.push(transicao);
      palavra += simbolo;
      estadoAtual = proximo;
      return { ...transicao };
    }

    function resultado() {
      return {
        palavra,
        estado: estadoAtual,
        reconhecida: FINAIS.includes(estadoAtual),
        // Uma cópia preserva o histórico quando a máquina é reiniciada.
        percurso: percurso.map((passo) => ({ ...passo }))
      };
    }

    function reiniciar() {
      estadoAtual = INICIAL;
      palavra = "";
      percurso = [];
    }

    return { consumir, resultado, reiniciar };
  }

  function analisar(palavra) {
    if (typeof palavra !== "string") throw new TypeError("A palavra deve ser um texto.");
    const maquina = criarMaquina();
    for (const simbolo of palavra) maquina.consumir(simbolo);
    return maquina.resultado();
  }

  return { ESTADOS, INICIAL, FINAIS, ALFABETO, DOMINIO_VALIDO, TRANSICOES, criarMaquina, analisar };
});
