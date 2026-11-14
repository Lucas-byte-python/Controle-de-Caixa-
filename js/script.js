// Confere a sessão no servidor. O cookie é HttpOnly e não fica acessível ao JavaScript.
fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
    .then(resposta => {
        if (!resposta.ok) window.location.replace("/html/login.html");
        else return resposta.json();
    })
    .then(dados => {
        if (dados && dados.user) {
            const campo = document.getElementById("usuarioLogado");
            if (campo) campo.textContent = dados.user.nome;
        }
    })
    .catch(() => window.location.replace("/html/login.html"));

// ASTROAGROCOMERCIAL | Controle de Caixas e Paletes
// Lógica de inicialização e recarga
(() => {
        const navegacao = performance.getEntriesByType('navigation')[0];
        if (navegacao && navegacao.type === 'reload') {
            window.location.replace(new URL('load.html', window.location.href).href);
        }
    })();

// script.js

const caixas = [
    "CAIXA DA ASTRO",
    "CAIXA DA IFCO (VERDE)",
    "CAIXA PÃO DE AÇUCAR (PRETA)",
    "CAIXA ASTRO (FRANGOLÂNDIA)",
    "CAIXA DO SUPERMERCADO COMETA",
    "CAIXA DE FORNECEDOR",
    "CAIXA PETROLINA (VERMELHA)",
    "CAIXA DA SERRA (VERDE)",
    "CAIXA DA SERRA (PRETA)"
];

const paletes = [
    "PBR",
    "DESCARTÁVEL"
];

let movimentacoes =
    JSON.parse(
        localStorage.getItem("movimentacoesAstro")
    ) || [];

let idEmEdicao = null;

let graficoCaixas = null;
let graficoPaletes = null;
let graficoResumoCaixas = null;
let graficoResumoPaletes = null;


/* =========================
   NAVEGAÇÃO
========================= */

function mostrarSecao(secao, botao) {

    document
        .querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active");
        });

    document
        .getElementById(secao)
        .classList.add("active");

    document
        .querySelectorAll(".menu button")
        .forEach(button => {
            button.classList.remove("active");
        });

    botao.classList.add("active");

    const titulos = {

        dashboard: [
            "Dashboard",
            "Visão geral do estoque do Centro de Distribuição"
        ],

        caixas: [
            "Controle de Caixas",
            "Entrada, saída e saldo das caixas"
        ],

        paletes: [
            "Controle de Paletes",
            "Entrada, saída e saldo dos paletes"
        ],

        devolucoes: [
            "Devolução de Caixas",
            "Confirmação e consulta de caixas recebidas de volta"
        ],

        historico: [
            "Histórico",
            "Todas as movimentações registradas"
        ],

        relatorios: [
            "Relatórios",
            "Emissão e impressão de relatórios de caixas e paletes"
        ]

    };

    document.getElementById("tituloPagina")
        .textContent = titulos[secao][0];

    document.getElementById("subtituloPagina")
        .textContent = titulos[secao][1];
}


/* =========================
   ABRIR MODAL
========================= */

function abrirModal(categoria) {

    idEmEdicao = null;

    document
        .getElementById("modal")
        .classList.add("show");

    document.getElementById("tituloModal")
        .textContent = "Registrar Movimentação";

    document.getElementById("botaoSalvar")
        .textContent = "Registrar";

    document.getElementById("categoria")
        .value = categoria;

    document.getElementById("movimento")
        .value = "entrada";

    atualizarMateriais();
}


/* =========================
   EDITAR MOVIMENTAÇÃO
========================= */

function editarMovimentacao(id) {

    const registro =
        movimentacoes.find(
            item => item.id === id
        );

    if (!registro) {

        alert(
            "Não foi possível encontrar esta movimentação."
        );

        return;
    }

    idEmEdicao = id;

    document
        .getElementById("modal")
        .classList.add("show");

    document.getElementById("tituloModal")
        .textContent = "Editar Movimentação";

    document.getElementById("botaoSalvar")
        .textContent = "Salvar alteração";

    document.getElementById("categoria")
        .value = registro.categoria;

    atualizarMateriais();

    document.getElementById("material")
        .value = registro.material;

    document.getElementById("movimento")
        .value = registro.movimento;

    document.getElementById("quantidade")
        .value = registro.quantidade;

    document.getElementById("destino")
        .value =
        registro.destino === "-"
            ? ""
            : registro.destino;

    document.getElementById("observacao")
        .value =
        registro.observacao === "-"
            ? ""
            : registro.observacao;
}


/* =========================
   FECHAR MODAL
========================= */

function fecharModal() {

    document
        .getElementById("modal")
        .classList.remove("show");

    document
        .getElementById("formMovimentacao")
        .reset();

    idEmEdicao = null;

    document.getElementById("tituloModal")
        .textContent = "Registrar Movimentação";

    document.getElementById("botaoSalvar")
        .textContent = "Registrar";

    atualizarMateriais();
}


/* =========================
   ATUALIZAR MATERIAIS
========================= */

function atualizarMateriais() {

    const categoria =
        document.getElementById("categoria").value;

    const select =
        document.getElementById("material");

    const lista =
        categoria === "caixa"
            ? caixas
            : paletes;

    select.innerHTML = "";

    lista.forEach(item => {

        const option =
            document.createElement("option");

        option.value = item;
        option.textContent = item;

        select.appendChild(option);

    });
}


/* =========================
   FORMULÁRIO
========================= */

document
    .getElementById("formMovimentacao")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const categoria =
                document.getElementById("categoria").value;

            const material =
                document.getElementById("material").value;

            const movimento =
                document.getElementById("movimento").value;

            const quantidade =
                Number(
                    document.getElementById("quantidade").value
                );

            const destino =
                document
                    .getElementById("destino")
                    .value
                    .trim();

            const observacao =
                document
                    .getElementById("observacao")
                    .value
                    .trim();

            if (
                !quantidade ||
                quantidade <= 0
            ) {

                alert(
                    "Informe uma quantidade válida."
                );

                return;
            }


            /* =========================
               NOVA MOVIMENTAÇÃO
            ========================= */

            if (idEmEdicao === null) {

                // Saídas podem ultrapassar o saldo atual; o estoque ficará negativo.

                const registro = {

                    id: Date.now(),

                    data:
                        new Date().toISOString(),

                    categoria,

                    material,

                    movimento,

                    quantidade,

                    destino:
                        destino || "-",

                    observacao:
                        observacao || "-"

                };

                movimentacoes.push(registro);

                salvar();

                fecharModal();

                atualizarTudo();

                alert(
                    "Movimentação registrada com sucesso!"
                );

                return;
            }


            /* =========================
               EDITANDO
            ========================= */

            const indice =
                movimentacoes.findIndex(
                    item =>
                        item.id === idEmEdicao
                );

            if (indice === -1) {

                alert(
                    "Erro: movimentação não encontrada."
                );

                return;
            }

            // Edições também permitem saldo negativo.

            movimentacoes[indice] = {

                ...movimentacoes[indice],

                categoria,

                material,

                movimento,

                quantidade,

                destino:
                    destino || "-",

                observacao:
                    observacao || "-"

            };

            salvar();

            fecharModal();

            atualizarTudo();

            alert(
                "Movimentação alterada com sucesso!"
            );

        }
    );


/* =========================
   CALCULAR SALDO
========================= */

function calcularSaldo(
    categoria,
    material
) {

    let entrada = 0;
    let saida = 0;

    movimentacoes.forEach(
        movimento => {

            if (
                movimento.categoria === categoria &&
                movimento.material === material
            ) {

                if (
                    movimento.movimento === "entrada"
                ) {

                    entrada +=
                        movimento.quantidade;

                } else {

                    saida +=
                        movimento.quantidade;
                }
            }
        }
    );

    return entrada - saida;
}


/* =========================
   SALDO SEM REGISTRO
========================= */

function calcularSaldoSemRegistro(
    categoria,
    material,
    idIgnorar
) {

    let entrada = 0;
    let saida = 0;

    movimentacoes.forEach(
        movimento => {

            if (
                movimento.id === idIgnorar
            ) {
                return;
            }

            if (
                movimento.categoria === categoria &&
                movimento.material === material
            ) {

                if (
                    movimento.movimento === "entrada"
                ) {

                    entrada +=
                        movimento.quantidade;

                } else {

                    saida +=
                        movimento.quantidade;
                }
            }
        }
    );

    return entrada - saida;
}


/* =========================
   TOTAIS
========================= */

function calcularTotais(
    categoria,
    material
) {

    let entrada = 0;
    let saida = 0;

    movimentacoes.forEach(
        movimento => {

            if (
                movimento.categoria === categoria &&
                movimento.material === material
            ) {

                if (
                    movimento.movimento === "entrada"
                ) {

                    entrada +=
                        movimento.quantidade;

                } else {

                    saida +=
                        movimento.quantidade;
                }
            }
        }
    );

    return {
        entrada,
        saida,
        saldo: entrada - saida
    };
}


/* =========================
   MONTAR TABELA
========================= */

function montarTabela(
    lista,
    categoria,
    elemento
) {

    const tbody =
        document.getElementById(elemento);

    tbody.innerHTML = "";

    lista.forEach(
        material => {

            const dados =
                calcularTotais(
                    categoria,
                    material
                );

            const tr =
                document.createElement("tr");

            tr.innerHTML = `

                <td>
                    <strong>
                        ${material}
                    </strong>
                </td>

                <td>
                    ${dados.entrada}
                </td>

                <td>
                    ${dados.saida}
                </td>

                <td class="
                    saldo
                    ${dados.saldo <= 0 ? "zero" : ""}
                ">
                    ${dados.saldo}
                </td>

            `;

            tbody.appendChild(tr);

        }
    );
}


/* =========================
   GRÁFICOS DE MOVIMENTAÇÃO
========================= */

function obterDadosGrafico(categoria, material, quantidadeDias) {
    const hoje = new Date();
    const dias = [];
    const quantidade = Number(quantidadeDias) || 30;

    for (let i = quantidade - 1; i >= 0; i--) {
        const data = new Date(hoje);
        data.setHours(0, 0, 0, 0);
        data.setDate(data.getDate() - i);

        const chave = [
            data.getFullYear(),
            String(data.getMonth() + 1).padStart(2, "0"),
            String(data.getDate()).padStart(2, "0")
        ].join("-");

        dias.push({
            chave,
            rotulo: data.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit"
            }),
            entrada: 0,
            saida: 0
        });
    }

    const porData = Object.fromEntries(dias.map(dia => [dia.chave, dia]));

    movimentacoes.forEach(registro => {
        if (registro.categoria !== categoria || registro.material !== material) return;

        const dataRegistro = new Date(registro.data);
        if (Number.isNaN(dataRegistro.getTime())) return;

        const chave = [
            dataRegistro.getFullYear(),
            String(dataRegistro.getMonth() + 1).padStart(2, "0"),
            String(dataRegistro.getDate()).padStart(2, "0")
        ].join("-");

        if (!porData[chave]) return;

        const quantidadeMovida = Number(registro.quantidade) || 0;
        if (registro.movimento === "entrada") {
            porData[chave].entrada += quantidadeMovida;
        } else {
            porData[chave].saida += quantidadeMovida;
        }
    });

    return {
        labels: dias.map(dia => dia.rotulo),
        entradas: dias.map(dia => dia.entrada),
        saidas: dias.map(dia => dia.saida)
    };
}

function preencherFiltrosGraficos() {
    const configuracoes = [
        { id: "filtroGraficoCaixas", lista: caixas },
        { id: "filtroGraficoPaletes", lista: paletes }
    ];

    configuracoes.forEach(config => {
        const select = document.getElementById(config.id);
        if (!select) return;

        const valorAnterior = select.value;
        select.innerHTML = "";

        config.lista.forEach(material => {
            const option = document.createElement("option");
            option.value = material;
            option.textContent = material;
            select.appendChild(option);
        });

        if (config.lista.includes(valorAnterior)) {
            select.value = valorAnterior;
        }
    });
}

function atualizarResumoGrafico(categoria, material, sufixo) {
    const totais = calcularTotais(categoria, material);

    document.getElementById("entradasGrafico" + sufixo).textContent =
        totais.entrada.toLocaleString("pt-BR");
    document.getElementById("saidasGrafico" + sufixo).textContent =
        totais.saida.toLocaleString("pt-BR");
    document.getElementById("saldoGrafico" + sufixo).textContent =
        totais.saldo.toLocaleString("pt-BR");
}

function criarOuAtualizarGrafico(categoria, canvasId, instanciaAtual, material, quantidadeDias) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined" || !material) return instanciaAtual;

    const dados = obterDadosGrafico(categoria, material, quantidadeDias);
    const configuracao = {
        type: "bar",
        data: {
            labels: dados.labels,
            datasets: [
                {
                    label: "Entradas",
                    data: dados.entradas,
                    backgroundColor: "rgba(37, 185, 255, 0.82)",
                    borderColor: "#25b9ff",
                    borderWidth: 1,
                    borderRadius: 5,
                    borderSkipped: false,
                    maxBarThickness: 24,
                    categoryPercentage: 0.68,
                    barPercentage: 0.82
                },
                {
                    label: "Saídas",
                    data: dados.saidas,
                    backgroundColor: "rgba(255, 113, 135, 0.82)",
                    borderColor: "#ff7187",
                    borderWidth: 1,
                    borderRadius: 5,
                    borderSkipped: false,
                    maxBarThickness: 24,
                    categoryPercentage: 0.68,
                    barPercentage: 0.82
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: "index" },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#071b3d",
                    titleColor: "#ffffff",
                    bodyColor: "#dceaff",
                    borderColor: "rgba(150,190,240,.25)",
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: "#91aacb",
                        font: { size: 10 },
                        autoSkip: true,
                        maxTicksLimit: Number(quantidadeDias) === 90 ? 15 : 30
                    },
                    border: { color: "rgba(150,190,240,.16)" }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        color: "#91aacb",
                        font: { size: 10 }
                    },
                    grid: { color: "rgba(150,190,240,.10)" },
                    border: { display: false }
                }
            }
        }
    };

    if (instanciaAtual) {
        instanciaAtual.data = configuracao.data;
        instanciaAtual.options = configuracao.options;
        instanciaAtual.update();
        return instanciaAtual;
    }

    return new Chart(canvas, configuracao);
}

function obterResumoDiario(categoria) {
    const hoje = new Date();
    const dias = [];

    for (let i = 6; i >= 0; i--) {
        const data = new Date(hoje);
        data.setHours(0, 0, 0, 0);
        data.setDate(data.getDate() - i);
        const chave = [
            data.getFullYear(),
            String(data.getMonth() + 1).padStart(2, "0"),
            String(data.getDate()).padStart(2, "0")
        ].join("-");

        dias.push({
            chave,
            rotulo: data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            entrada: 0,
            saida: 0
        });
    }

    const mapa = Object.fromEntries(dias.map(dia => [dia.chave, dia]));

    movimentacoes.forEach(registro => {
        if (registro.categoria !== categoria) return;

        const data = new Date(registro.data);
        if (Number.isNaN(data.getTime())) return;

        const chave = [
            data.getFullYear(),
            String(data.getMonth() + 1).padStart(2, "0"),
            String(data.getDate()).padStart(2, "0")
        ].join("-");

        if (!mapa[chave]) return;

        const quantidade = Number(registro.quantidade) || 0;
        if (registro.movimento === "entrada") mapa[chave].entrada += quantidade;
        else mapa[chave].saida += quantidade;
    });

    return {
        labels: dias.map(dia => dia.rotulo),
        entradas: dias.map(dia => dia.entrada),
        saidas: dias.map(dia => dia.saida)
    };
}

function atualizarGraficoResumo(categoria, canvasId, instancia) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return instancia;

    const dados = obterResumoDiario(categoria);
    const config = {
        type: "bar",
        data: {
            labels: dados.labels,
            datasets: [
                {
                    label: "Entradas",
                    data: dados.entradas,
                    backgroundColor: "rgba(37,185,255,.82)",
                    borderColor: "#25b9ff",
                    borderWidth: 1,
                    borderRadius: 5,
                    maxBarThickness: 24
                },
                {
                    label: "Saídas",
                    data: dados.saidas,
                    backgroundColor: "rgba(255,113,135,.82)",
                    borderColor: "#ff7187",
                    borderWidth: 1,
                    borderRadius: 5,
                    maxBarThickness: 24
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: "index" },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#071b3d",
                    titleColor: "#fff",
                    bodyColor: "#dceaff",
                    borderColor: "rgba(150,190,240,.25)",
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#91aacb", font: { size: 10 } },
                    border: { color: "rgba(150,190,240,.16)" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: "#91aacb", font: { size: 10 } },
                    grid: { color: "rgba(150,190,240,.10)" },
                    border: { display: false }
                }
            }
        }
    };

    if (instancia) {
        instancia.data = config.data;
        instancia.update();
        return instancia;
    }

    return new Chart(canvas, config);
}

function atualizarGraficos() {
    preencherFiltrosGraficos();

    const materialCaixa = document.getElementById("filtroGraficoCaixas")?.value;
    const periodoCaixa = document.getElementById("periodoGraficoCaixas")?.value || 30;
    const materialPalete = document.getElementById("filtroGraficoPaletes")?.value;
    const periodoPalete = document.getElementById("periodoGraficoPaletes")?.value || 30;

    graficoResumoCaixas = atualizarGraficoResumo("caixa", "graficoResumoCaixas", graficoResumoCaixas);
    graficoResumoPaletes = atualizarGraficoResumo("palete", "graficoResumoPaletes", graficoResumoPaletes);

    if (materialCaixa) {
        graficoCaixas = criarOuAtualizarGrafico(
            "caixa", "graficoCaixas", graficoCaixas, materialCaixa, periodoCaixa
        );
        atualizarResumoGrafico("caixa", materialCaixa, "Caixas");
    }

    if (materialPalete) {
        graficoPaletes = criarOuAtualizarGrafico(
            "palete", "graficoPaletes", graficoPaletes, materialPalete, periodoPalete
        );
        atualizarResumoGrafico("palete", materialPalete, "Paletes");
    }
}

function configurarFiltrosGraficos() {
    [
        "filtroGraficoCaixas",
        "periodoGraficoCaixas",
        "filtroGraficoPaletes",
        "periodoGraficoPaletes"
    ].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.addEventListener("change", atualizarGraficos);
    });
}




/* =========================
   DASHBOARD
========================= */

function atualizarDashboard() {

    montarTabela(
        caixas,
        "caixa",
        "dashboardCaixas"
    );

    montarTabela(
        paletes,
        "palete",
        "dashboardPaletes"
    );

    let totalCaixas = 0;
    let totalPaletes = 0;
    let entradas = 0;
    let saidas = 0;

    caixas.forEach(
        caixa => {

            totalCaixas +=
                calcularSaldo(
                    "caixa",
                    caixa
                );

        }
    );

    paletes.forEach(
        palete => {

            totalPaletes +=
                calcularSaldo(
                    "palete",
                    palete
                );

        }
    );

    movimentacoes.forEach(
        movimento => {

            if (
                movimento.movimento ===
                "entrada"
            ) {

                entradas +=
                    movimento.quantidade;

            } else {

                saidas +=
                    movimento.quantidade;
            }
        }
    );

    document.getElementById(
        "totalCaixas"
    ).textContent = totalCaixas;

    document.getElementById(
        "totalPaletes"
    ).textContent = totalPaletes;

    document.getElementById(
        "totalEntradas"
    ).textContent = entradas;

    document.getElementById(
        "totalSaidas"
    ).textContent = saidas;

    atualizarGraficos();
}


/* =========================
   HISTÓRICO
========================= */

function atualizarHistorico() {

    const tbody =
        document.getElementById(
            "historicoTabela"
        );

    tbody.innerHTML = "";

    if (
        movimentacoes.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty">

                    Nenhuma movimentação registrada.

                </td>

            </tr>

        `;

        return;
    }

    const registros =
        [...movimentacoes].reverse();

    registros.forEach(
        movimento => {

            const data =
                new Date(
                    movimento.data
                ).toLocaleString(
                    "pt-BR"
                );

            const tr =
                document.createElement("tr");

            tr.innerHTML = `

                <td>
                    ${data}
                </td>

                <td>

                    ${
                        movimento.categoria === "caixa"
                            ? "📦 Caixa"
                            : "🪵 Palete"
                    }

                </td>

                <td>

                    <strong>
                        ${movimento.material}
                    </strong>

                </td>

                <td>

                    <span class="
                        badge
                        ${
                            movimento.movimento === "entrada"
                                ? "badge-entrada"
                                : "badge-saida"
                        }
                    ">

                        ${
                            movimento.movimento === "entrada"
                                ? "ENTRADA"
                                : "SAÍDA"
                        }

                    </span>

                </td>

                <td>

                    <strong>
                        ${movimento.quantidade}
                    </strong>

                </td>

                <td>
                    ${movimento.destino}
                </td>

                <td>

                    <div class="acoes">

                        <button
                            type="button"
                            class="acao-btn acao-editar"
                            title="Editar movimentação"
                            onclick="editarMovimentacao(${movimento.id})">

                            ✏️

                        </button>

                        <button
                            type="button"
                            class="acao-btn acao-excluir"
                            title="Excluir movimentação"
                            onclick="excluirMovimentacao(${movimento.id})">

                            🗑️

                        </button>

                    </div>

                </td>

            `;

            tbody.appendChild(tr);

        }
    );
}


/* =========================
   EXCLUIR
========================= */

function excluirMovimentacao(id) {

    const registro =
        movimentacoes.find(
            movimento =>
                movimento.id === id
        );

    if (!registro) {

        alert(
            "Movimentação não encontrada."
        );

        return;
    }

    const confirmar =
        confirm(

            "Deseja realmente excluir esta movimentação?\n\n" +

            registro.material +
            " - " +
            registro.quantidade +
            " unidades"

        );

    if (!confirmar) {
        return;
    }

    movimentacoes =
        movimentacoes.filter(
            movimento =>
                movimento.id !== id
        );

    salvar();

    atualizarTudo();

    alert(
        "Movimentação excluída com sucesso!"
    );
}



/* =========================
   RELATÓRIOS E IMPRESSÃO
========================= */

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[caractere]));
}

function chaveDataLocal(valor) {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "";
    return [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, "0"),
        String(data.getDate()).padStart(2, "0")
    ].join("-");
}

function formatarDataRelatorio(valor, incluirHora = false) {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "Data não informada";
    return data.toLocaleString("pt-BR", incluirHora
        ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
        : { day: "2-digit", month: "long", year: "numeric" });
}

function gerarRelatorio() {
    const tipo = document.getElementById("tipoRelatorio").value;
    const dataInicial = document.getElementById("dataInicialRelatorio").value;
    const dataFinal = document.getElementById("dataFinalRelatorio").value;

    if (dataInicial && dataFinal && dataInicial > dataFinal) {
        alert("A data inicial não pode ser posterior à data final.");
        return;
    }

    const categorias = tipo === "ambos" ? ["caixa", "palete"] : [tipo];
    const nomes = { caixa: "CAIXAS", palete: "PALETES" };

    const registros = movimentacoes
        .filter(registro => categorias.includes(registro.categoria))
        .filter(registro => {
            const dia = chaveDataLocal(registro.data);
            if (!dia) return false;
            return (!dataInicial || dia >= dataInicial) && (!dataFinal || dia <= dataFinal);
        })
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    const materiaisPorCategoria = {
        caixa: caixas,
        palete: paletes
    };

    let totalEntradas = 0;
    let totalSaidas = 0;
    let totalRegistros = registros.length;

    const gruposHTML = categorias.map(categoria => {
        const lista = materiaisPorCategoria[categoria];
        const linhas = lista.map(material => {
            const movimentos = registros.filter(r => r.categoria === categoria && r.material === material);
            const entrada = movimentos.filter(r => r.movimento === "entrada")
                .reduce((soma, r) => soma + (Number(r.quantidade) || 0), 0);
            const saida = movimentos.filter(r => r.movimento === "saida")
                .reduce((soma, r) => soma + (Number(r.quantidade) || 0), 0);
            const saldoAtual = calcularSaldo(categoria, material);
            totalEntradas += entrada;
            totalSaidas += saida;
            return `<tr>
                <td>${escaparHTML(material)}</td>
                <td>${entrada.toLocaleString("pt-BR")}</td>
                <td>${saida.toLocaleString("pt-BR")}</td>
                <td class="${saldoAtual < 0 ? "report-negative" : "report-positive"}">${saldoAtual.toLocaleString("pt-BR")}</td>
            </tr>`;
        }).join("");

        return `<div class="report-group">
            <h3>${nomes[categoria]}</h3>
            <table class="report-table">
                <thead><tr><th>Material</th><th>Entradas no período</th><th>Saídas no período</th><th>Saldo atual</th></tr></thead>
                <tbody>${linhas}</tbody>
            </table>
        </div>`;
    }).join("");

    const linhasMovimentacoes = registros.length
        ? registros.map(registro => `<tr>
            <td>${formatarDataRelatorio(registro.data, true)}</td>
            <td>${nomes[registro.categoria] || escaparHTML(registro.categoria)}</td>
            <td>${escaparHTML(registro.material)}</td>
            <td>${registro.movimento === "entrada" ? "Entrada" : "Saída"}</td>
            <td>${(Number(registro.quantidade) || 0).toLocaleString("pt-BR")}</td>
            <td>${escaparHTML(registro.destino || "—")}</td>
        </tr>`).join("")
        : '<tr><td colspan="6" style="text-align:center">Nenhuma movimentação encontrada para os filtros selecionados.</td></tr>';

    const periodo = dataInicial || dataFinal
        ? `${dataInicial ? formatarDataRelatorio(dataInicial + "T00:00:00") : "Início do histórico"} até ${dataFinal ? formatarDataRelatorio(dataFinal + "T00:00:00") : "Hoje"}`
        : "Todo o histórico";

    const titulo = tipo === "ambos" ? "RELATÓRIO GERAL • CAIXAS E PALETES" : `RELATÓRIO DE ${nomes[tipo]}`;
    const emitido = new Date().toLocaleString("pt-BR");

    const documento = `<article class="report-document">
        <header class="report-doc-header">
            <div>
                <div class="report-brand">ASTROAGROCOMERCIAL</div>
                <div class="report-subbrand">CONTROLE DE CAIXAS E PALETES • CENTRO DE DISTRIBUIÇÃO</div>
            </div>
            <div>
                <div class="report-doc-title">${titulo}</div>
                <div class="report-doc-meta">Período: ${periodo}<br>Emitido em: ${emitido}</div>
            </div>
        </header>
        <div class="report-kpis">
            <div class="report-kpi"><span>Movimentações no período</span><strong>${totalRegistros.toLocaleString("pt-BR")}</strong></div>
            <div class="report-kpi"><span>Total de entradas</span><strong>${totalEntradas.toLocaleString("pt-BR")}</strong></div>
            <div class="report-kpi"><span>Total de saídas</span><strong>${totalSaidas.toLocaleString("pt-BR")}</strong></div>
        </div>
        <h3 style="font-size:13px;color:#123d70;margin:18px 0 8px">RESUMO POR MATERIAL</h3>
        ${gruposHTML}
        <div class="report-group">
            <h3>DETALHAMENTO DAS MOVIMENTAÇÕES</h3>
            <table class="report-table">
                <thead><tr><th>Data e hora</th><th>Categoria</th><th>Material</th><th>Tipo</th><th>Quantidade</th><th>Cliente / Rota</th></tr></thead>
                <tbody>${linhasMovimentacoes}</tbody>
            </table>
        </div>
        <footer class="report-footer">
            <span>Documento gerado pelo Controle ASTRO</span>
            <span>Uso interno • ASTROAGROCOMERCIAL</span>
        </footer>
    </article>`;

    document.getElementById("visualizacaoRelatorio").innerHTML = documento;
    document.getElementById("botaoImprimirRelatorio").disabled = false;
}

function imprimirRelatorio() {
    const visualizacao = document.getElementById("visualizacaoRelatorio");
    if (!visualizacao.querySelector(".report-document")) {
        alert("Gere um relatório antes de imprimir.");
        return;
    }

    document.getElementById("areaImpressao").innerHTML = visualizacao.innerHTML;
    window.print();
}

/* =========================
   LIMPAR HISTÓRICO
========================= */

function limparHistorico() {

    if (movimentacoes.length === 0) {
        alert("Não existem movimentações.");
        return;
    }

    // A exclusão só é autorizada quando a palavra exata é digitada.
    // Não existe confirmação por botão OK isoladamente.
    const palavraConfirmacao = window.prompt(
        "ATENÇÃO! Esta ação apagará TODAS as movimentações do histórico.\n\n" +
        "Para confirmar, digite DESCARTAR no campo abaixo (em letras maiúsculas):",
        ""
    );

    if (palavraConfirmacao !== "DESCARTAR") {
        alert(
            palavraConfirmacao === null
                ? "Operação cancelada. O histórico foi mantido."
                : "Palavra incorreta. O histórico foi mantido. Digite exatamente DESCARTAR."
        );
        return;
    }

    movimentacoes = [];
    salvar();
    atualizarTudo();

    alert("Histórico apagado com sucesso.");
}


/* =========================
   LOCALSTORAGE
========================= */

function salvar() {

    localStorage.setItem(
        "movimentacoesAstro",
        JSON.stringify(
            movimentacoes
        )
    );
}


/* =========================
   ATUALIZAR TUDO
========================= */

function atualizarTudo() {

    montarTabela(
        caixas,
        "caixa",
        "tabelaCaixas"
    );

    montarTabela(
        paletes,
        "palete",
        "tabelaPaletes"
    );

    atualizarDashboard();

    atualizarHistorico();
}


/* =========================
   DATA
========================= */

function atualizarData() {

    const agora =
        new Date();

    document.getElementById(
        "dataAtual"
    ).textContent =

        agora.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
}


/* =========================
   INICIALIZAÇÃO
========================= */

atualizarMateriais();

configurarFiltrosGraficos();

atualizarData();

atualizarTudo();


// =========================
// IDENTIFICAÇÃO E ENCERRAMENTO DA SESSÃO
// =========================
async function encerrarSessao() {
    if (!confirm("Deseja realmente sair do sistema?")) return;

    try {
        const resposta = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin"
        });
        if (!resposta.ok) throw new Error("Não foi possível encerrar a sessão.");
        window.location.replace("/html/login.html");
    } catch (error) {
        alert("Não foi possível sair agora. Verifique sua conexão e tente novamente.");
    }
}


// =========================
// DEVOLUÇÕES DE CAIXAS
// =========================
function prepararFormularioDevolucao() {
    const select = document.getElementById("devolucaoCaixa");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione o tipo de caixa</option>';
    caixas.forEach(nome => {
        const option = document.createElement("option");
        option.value = nome;
        option.textContent = nome;
        select.appendChild(option);
    });
}

function mensagemDevolucao(texto, erro = false) {
    const el = document.getElementById("devolucaoMensagem");
    if (!el) return;
    el.textContent = texto;
    el.className = "return-message " + (erro ? "error" : "success");
}

function formatarDataDevolucao(valor) {
    if (!valor) return "—";
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? "—" : data.toLocaleString("pt-BR");
}

function escaparDevolucao(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[caractere]);
}

let devolucaoArquivoUrl = null;

function limparPreviewDevolucao() {
    if (devolucaoArquivoUrl) {
        URL.revokeObjectURL(devolucaoArquivoUrl);
        devolucaoArquivoUrl = null;
    }
    const preview = document.getElementById("devolucaoPreview");
    const imagem = document.getElementById("devolucaoPreviewImg");
    const pdf = document.getElementById("devolucaoPreviewPdf");
    if (preview) preview.hidden = true;
    if (imagem) {
        imagem.hidden = true;
        imagem.removeAttribute("src");
    }
    if (pdf) pdf.hidden = true;
}

function visualizarArquivoSelecionado() {
    if (!devolucaoArquivoUrl) return;
    const janela = window.open(devolucaoArquivoUrl, "_blank", "noopener");
    if (!janela) alert("Permita a abertura de janelas pop-up para visualizar o anexo.");
}

document.getElementById("devolucaoFoto")?.addEventListener("change", function () {
    const arquivo = this.files && this.files[0];
    const preview = document.getElementById("devolucaoPreview");
    const imagem = document.getElementById("devolucaoPreviewImg");
    const pdf = document.getElementById("devolucaoPreviewPdf");
    limparPreviewDevolucao();
    if (!arquivo) return;

    const tiposPermitidos = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!tiposPermitidos.includes(arquivo.type) || arquivo.size > 2 * 1024 * 1024) {
        this.value = "";
        mensagemDevolucao("Anexe PDF, JPG, PNG ou WEBP de até 2 MB.", true);
        return;
    }

    devolucaoArquivoUrl = URL.createObjectURL(arquivo);
    if (arquivo.type.startsWith("image/")) {
        imagem.src = devolucaoArquivoUrl;
        imagem.hidden = false;
        pdf.hidden = true;
    } else {
        imagem.hidden = true;
        pdf.hidden = false;
    }
    document.getElementById("devolucaoFotoNome").textContent = arquivo.name;
    preview.hidden = false;
    mensagemDevolucao("");
});

document.getElementById("formDevolucao")?.addEventListener("submit", async function (event) {
    event.preventDefault();
    const botao = document.getElementById("botaoSalvarDevolucao");
    const arquivo = document.getElementById("devolucaoFoto").files[0] || null;
    if (arquivo && (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(arquivo.type) || arquivo.size > 2 * 1024 * 1024)) {
        return mensagemDevolucao("O anexo deve ser PDF, JPG, PNG ou WEBP de até 2 MB.", true);
    }

    botao.disabled = true;
    botao.textContent = "Salvando...";
    mensagemDevolucao(arquivo ? "Enviando registro e anexo..." : "Salvando devolução...");

    try {
        let fotoDataUrl = null;
        if (arquivo) {
            fotoDataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error("Não foi possível ler o anexo."));
                reader.readAsDataURL(arquivo);
            });
        }

        const payload = {
            notaFiscal: document.getElementById("devolucaoNota").value.trim(),
            loja: document.getElementById("devolucaoLoja").value.trim(),
            caixa: document.getElementById("devolucaoCaixa").value,
            quantidade: Number(document.getElementById("devolucaoQuantidade").value),
            fotoDataUrl,
            fotoNome: arquivo ? arquivo.name : null
        };

        const resposta = await fetch("/api/devolucoes", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const dados = await resposta.json().catch(() => ({}));
        if (!resposta.ok) throw new Error(dados.error || "Não foi possível registrar a devolução.");

        this.reset();
        limparPreviewDevolucao();
        mensagemDevolucao("Devolução confirmada e salva com sucesso.");
        await carregarDevolucoes();
    } catch (erro) {
        mensagemDevolucao(erro.message || "Erro ao salvar a devolução.", true);
    } finally {
        botao.disabled = false;
        botao.textContent = "Confirmar recebimento";
    }
});

document.getElementById("botaoLimparDevolucao")?.addEventListener("click", () => {
    limparPreviewDevolucao();
    mensagemDevolucao("");
});

document.getElementById("filtroDevolucoes")?.addEventListener("input", () => {
    carregarDevolucoes();
});

async function carregarDevolucoes() {
    const tabela = document.getElementById("tabelaDevolucoes");
    if (!tabela) return;
    tabela.innerHTML = '<tr><td colspan="7" class="empty">Carregando devoluções...</td></tr>';
    try {
        const resposta = await fetch("/api/devolucoes", { credentials: "same-origin", cache: "no-store" });
        const dados = await resposta.json().catch(() => ({}));
        if (!resposta.ok) throw new Error(dados.error || "Não foi possível carregar o histórico.");
        const filtro = (document.getElementById("filtroDevolucoes")?.value || "").trim().toLocaleLowerCase("pt-BR");
        const registros = (dados.devolucoes || []).filter(item =>
            [item.nota_fiscal, item.loja, item.caixa, item.registrado_por]
                .some(valor => String(valor || "").toLocaleLowerCase("pt-BR").includes(filtro))
        );
        if (!registros.length) {
            tabela.innerHTML = '<tr><td colspan="7" class="empty">Nenhuma devolução encontrada.</td></tr>';
            return;
        }
        tabela.innerHTML = registros.map(item => `<tr>
            <td>${escaparDevolucao(formatarDataDevolucao(item.recebido_em))}</td>
            <td><strong>${escaparDevolucao(item.nota_fiscal)}</strong></td>
            <td>${escaparDevolucao(item.loja)}</td>
            <td>${escaparDevolucao(item.caixa)}</td>
            <td>${Number(item.quantidade).toLocaleString("pt-BR")}</td>
            <td>${escaparDevolucao(item.registrado_por || "—")}</td>
            <td>${item.foto_nome ? '<button type="button" class="btn btn-secondary btn-small" onclick="visualizarComprovanteDevolucao(' + Number(item.id) + ')">Ver anexo</button>' : '<span class="return-no-file">Sem anexo</span>'}</td>
        </tr>`).join("");
    } catch (erro) {
        tabela.innerHTML = '<tr><td colspan="7" class="empty">' + escaparDevolucao(erro.message) + '</td></tr>';
    }
}

async function visualizarComprovanteDevolucao(id) {
    try {
        const resposta = await fetch("/api/devolucoes?id=" + encodeURIComponent(id), {
            credentials: "same-origin", cache: "no-store"
        });
        const dados = await resposta.json().catch(() => ({}));
        if (!resposta.ok) throw new Error(dados.error || "Não foi possível abrir o anexo.");
        const janela = window.open("", "_blank");
        if (!janela) return alert("Permita a abertura de janelas pop-up para visualizar o anexo.");
        const arquivo = String(dados.fotoDataUrl || "");
        if (!/^data:(application\/pdf|image\/(jpeg|png|webp));base64,/.test(arquivo)) {
            janela.close();
            throw new Error("O anexo armazenado não é válido.");
        }
        const ehPdf = arquivo.startsWith("data:application/pdf;");
        const conteudo = ehPdf
            ? "<iframe title='Nota fiscal em PDF' src='" + arquivo + "' style='width:100%;height:90vh;border:0'></iframe>"
            : "<img alt='Foto do comprovante' src='" + arquivo + "' style='max-width:100%;height:auto;max-height:90vh;object-fit:contain'>";
        janela.document.write("<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><title>Anexo da devolução</title><meta name='viewport' content='width=device-width,initial-scale=1'><style>body{margin:0;padding:24px;background:#0b1d36;color:#fff;font:14px Arial;text-align:center}h2{font-size:17px}</style></head><body><h2>" + escaparDevolucao(dados.fotoNome || "Anexo da devolução") + "</h2>" + conteudo + "</body></html>");
        janela.document.close();
    } catch (erro) {
        alert(erro.message || "Erro ao abrir anexo.");
    }
}

prepararFormularioDevolucao();
carregarDevolucoes();
