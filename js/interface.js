/* A interface cuida dos eventos e da apresentação. O reconhecimento fica no autômato. */
(function () {
  "use strict";

  const porId = (id) => document.getElementById(id);
  const campo = porId("palavra");
  const historico = [];
  let emComposicao = false;
  let atual = Automato.analisar("");

  function textoPercurso(resultado) {
    if (resultado.percurso.length === 0) return "qPar · nenhum símbolo consumido (ε)";
    return resultado.percurso.map((passo) =>
      `${String(passo.indice).padStart(2, "0")}  ${passo.anterior.padEnd(6)} ── ${passo.simbolo} ──▶ ${passo.proximo}`
    ).join("\n");
  }

  // A tabela visível é derivada da mesma definição usada pelo reconhecedor.
  function montarTabela() {
    const corpo = porId("tabela-corpo");
    for (const estado of Automato.ESTADOS) {
      const linha = document.createElement("tr");
      const nome = document.createElement("th");
      nome.scope = "row";
      nome.textContent = `${estado === Automato.INICIAL ? "→ " : ""}${Automato.FINAIS.includes(estado) ? "* " : ""}${estado}`;
      linha.append(nome);
      for (const simbolo of ["a", "b", "c", "d"]) {
        const celula = document.createElement("td");
        celula.textContent = Automato.TRANSICOES[estado][simbolo];
        celula.dataset.estado = estado;
        celula.dataset.simbolo = simbolo;
        linha.append(celula);
      }
      corpo.append(linha);
    }
  }

  function mostrarAtual() {
    porId("cadeia-atual").textContent = atual.palavra || "ε";
    const quantidade = atual.percurso.length;
    porId("tamanho-cadeia").textContent = `${quantidade} ${quantidade === 1 ? "símbolo" : "símbolos"}`;
    porId("contador-transicoes").textContent = `${quantidade} ${quantidade === 1 ? "transição" : "transições"}`;
    porId("estado-atual").textContent = atual.estado;
    porId("painel-estado").dataset.estado = atual.estado;
    porId("tipo-estado").textContent = {
      qPar: "Inicial · não final",
      qImpar: "Estado final",
      qErro: "Não final · absorvente"
    }[atual.estado];
    porId("explicacao-estado").textContent = {
      qPar: atual.palavra ? "Quantidade par de c. Continue digitando ou pressione espaço." : "Nenhum c lido. Aguardando a primeira letra.",
      qImpar: "Quantidade ímpar de c. O espaço confirma o resultado.",
      qErro: "Letra fora do alfabeto da linguagem. Corrija a palavra ou encerre com espaço."
    }[atual.estado];
    // Estar em um estado final durante a digitação ainda não encerra a palavra.
    porId("situacao-atual").textContent = "Em digitação";
    const percurso = porId("percurso-atual");
    percurso.textContent = quantidade ? textoPercurso(atual) : "qPar · aguardando a primeira letra";
    percurso.scrollTop = percurso.scrollHeight;
    const ultimoPasso = atual.percurso.at(-1);
    for (const celula of document.querySelectorAll(".transition-table td")) {
      const coluna = ultimoPasso && ("abc".includes(ultimoPasso.simbolo) ? ultimoPasso.simbolo : "d");
      const selecionada = Boolean(ultimoPasso && celula.dataset.estado === ultimoPasso.anterior && celula.dataset.simbolo === coluna);
      celula.classList.toggle("active", selecionada);
      if (selecionada) celula.setAttribute("aria-label", `Última transição: ${ultimoPasso.anterior}, ${ultimoPasso.simbolo}, ${ultimoPasso.proximo}`);
      else celula.removeAttribute("aria-label");
    }
    for (const linha of document.querySelectorAll(".transition-table tbody tr")) {
      linha.firstElementChild.classList.toggle("row-active", Boolean(ultimoPasso && linha.children[1].dataset.estado === ultimoPasso.anterior));
    }
    porId("ultima-transicao").textContent = ultimoPasso
      ? `δ(${ultimoPasso.anterior}, ${ultimoPasso.simbolo}) = ${ultimoPasso.proximo}`
      : "δ(estado, símbolo) = próximo estado";
  }

  function mostrarUltimo(resultado) {
    const painel = porId("ultimo-resultado");
    painel.dataset.resultado = resultado ? (resultado.reconhecida ? "reconhecida" : "rejeitada") : "nenhum";
    porId("icone-resultado").textContent = resultado ? (resultado.reconhecida ? "✓" : "×") : "—";
    porId("status-resultado").textContent = resultado ? (resultado.reconhecida ? "Reconhecida" : "Rejeitada") : "Nenhuma palavra encerrada";
    porId("palavra-resultado").textContent = resultado ? (resultado.palavra || "ε") : "";
    porId("estado-resultado").textContent = resultado ? resultado.estado : "";
    porId("motivo-resultado").textContent = !resultado
      ? "Pressione espaço no campo para registrar o primeiro resultado."
      : resultado.estado === "qErro"
        ? "Letra fora do alfabeto da linguagem: a palavra contém uma letra de d a z."
        : resultado.reconhecida
          ? "A palavra terminou em qImpar: quantidade ímpar de c."
          : resultado.palavra
            ? "A palavra terminou em qPar: quantidade par de c, incluindo zero."
            : "A cadeia vazia ε é rejeitada: zero ocorrências de c.";
  }

  function adicionarHistorico(resultado) {
    historico.push(resultado);
    const linha = document.createElement("tr");
    for (const valor of [historico.length, resultado.palavra || "ε"]) {
      const celula = document.createElement("td");
      const conteudo = document.createElement(typeof valor === "number" ? "span" : "code");
      conteudo.textContent = valor;
      celula.append(conteudo);
      linha.append(celula);
    }
    const resultadoCelula = document.createElement("td");
    const selo = document.createElement("span");
    selo.className = `result-pill${resultado.reconhecida ? " accepted" : ""}`;
    selo.textContent = resultado.reconhecida ? "Reconhecida" : "Rejeitada";
    resultadoCelula.append(selo);
    linha.append(resultadoCelula);
    const estadoCelula = document.createElement("td");
    const estadoTexto = document.createElement("code");
    estadoTexto.textContent = resultado.estado;
    estadoCelula.append(estadoTexto);
    linha.append(estadoCelula);
    const percursoCelula = document.createElement("td");
    const detalhes = document.createElement("details");
    const resumo = document.createElement("summary");
    resumo.textContent = `Ver percurso (${resultado.percurso.length})`;
    const texto = document.createElement("pre");
    // O percurso completo só é formatado quando solicitado; os passos já estão preservados.
    detalhes.addEventListener("toggle", () => {
      if (detalhes.open && !texto.textContent) texto.textContent = textoPercurso(resultado);
    });
    detalhes.append(resumo, texto);
    percursoCelula.append(detalhes);
    linha.append(percursoCelula);
    porId("historico-corpo").append(linha);
  }

  function mostrarResumoHistorico() {
    porId("total-historico").textContent = historico.length;
    const reconhecidas = historico.filter((resultado) => resultado.reconhecida).length;
    porId("resumo-historico").textContent = historico.length
      ? `${historico.length} encerrada(s) · ${reconhecidas} reconhecida(s) · ${historico.length - reconhecidas} rejeitada(s). Ordem de entrada preservada.`
      : "As palavras encerradas aparecerão aqui. Editar a cadeia corrente preserva este histórico.";
    porId("historico-vazio").hidden = historico.length > 0;
    porId("historico-tabela").hidden = historico.length === 0;
    porId("limpar-historico").disabled = historico.length === 0;
  }

  function avisarIgnorados(ignorados) {
    if (!ignorados.length) return;
    const rotulos = { "\n": "quebra de linha", "\r": "retorno de linha", "\t": "tabulação" };
    const amostra = [...new Set(ignorados.map((item) => rotulos[item.simbolo] || item.simbolo))];
    const maiuscula = ignorados.some((item) => /^[A-Z]$/.test(item.simbolo));
    porId("aviso-entrada").textContent = `Símbolo ignorado: ${amostra.slice(0, 8).join(", ")}${amostra.length > 8 ? "…" : ""}. ${maiuscula ? "Use letras minúsculas, de a a z. " : ""}Esses símbolos não entram na cadeia efetivamente analisada.`;
    porId("aviso-entrada").classList.add("ignored");
  }

  function processarCampo() {
    if (emComposicao) return;
    const edicao = Entrada.processarEdicao(campo.value, campo.selectionStart);
    atual = edicao.atual;
    // Depois de um delimitador, só a palavra ainda em edição permanece no campo.
    // Portanto, reprocessar uma correção nunca registra outra vez palavras anteriores.
    campo.value = atual.palavra;
    campo.setSelectionRange(edicao.cursor, edicao.cursor);
    for (const resultado of edicao.encerradas) adicionarHistorico(resultado);
    if (edicao.encerradas.length) {
      mostrarUltimo(edicao.encerradas.at(-1));
      mostrarResumoHistorico();
    }
    avisarIgnorados(edicao.ignorados);
    mostrarAtual();
  }

  campo.addEventListener("input", processarCampo);
  campo.addEventListener("compositionstart", () => { emComposicao = true; });
  campo.addEventListener("compositionend", () => { emComposicao = false; processarCampo(); });
  campo.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" && !evento.isComposing) {
      evento.preventDefault();
      avisarIgnorados([{ simbolo: "\n" }]);
    }
    // Tab e as teclas de edição mantêm o comportamento nativo do navegador.
  });
  porId("limpar-analise").addEventListener("click", () => {
    campo.value = "";
    atual = Automato.analisar("");
    porId("aviso-entrada").classList.remove("ignored");
    porId("aviso-entrada").textContent = "Análise reiniciada em qPar. Os resultados anteriores foram preservados.";
    mostrarAtual();
    campo.focus();
  });
  porId("limpar-historico").addEventListener("click", () => {
    historico.length = 0;
    porId("historico-corpo").replaceChildren();
    mostrarUltimo(null);
    mostrarResumoHistorico();
  });
  for (const botao of document.querySelectorAll("[data-exemplo]")) {
    botao.addEventListener("click", () => {
      campo.value = botao.dataset.exemplo;
      campo.setSelectionRange(campo.value.length, campo.value.length);
      processarCampo();
      campo.focus();
    });
  }
  montarTabela();
  mostrarAtual();
})();
