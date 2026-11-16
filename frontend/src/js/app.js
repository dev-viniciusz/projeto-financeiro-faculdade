const categorias = {
    ALIMENTACAO: "Alimentação",
    MORADIA: "Moradia",
    TRANSPORTE: "Transporte",
    LAZER: "Lazer",
    SAUDE: "Saúde",
};
const secoes = {
    rendas: {
        tipo: "RENDA",
        titulo: "Rendas",
        novo: "Nova renda",
        singular: "renda",
        cor: "income",
        icone: "up",
    },
    despesas: {
        tipo: "DESPESA",
        titulo: "Despesas",
        novo: "Nova despesa",
        singular: "despesa",
        cor: "expense",
        icone: "down",
    },
    investimentos: {
        tipo: "INVESTIMENTO",
        titulo: "Investimentos",
        novo: "Novo investimento",
        singular: "investimento",
        cor: "investment",
        icone: "invest",
    },
};
const hoje = new Date();
let inicio = dataIso(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
let fim = dataIso(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0));
let pagina = "visao-geral";
let categoriaAtual = "";
let aviso;

function elemento(id) {
    return document.getElementById(id);
}
function dinheiro(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}
function dataTexto(data) {
    return data.split("-").reverse().join("/");
}
function dataIso(data) {
    return (
        data.getFullYear() +
        "-" +
        String(data.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(data.getDate()).padStart(2, "0")
    );
}
// Uma descrição cadastrada deve aparecer como texto, nunca como código HTML.
function texto(valor) {
    const span = document.createElement("span");
    span.textContent = valor;
    return span.innerHTML;
}
function periodo() {
    return "?inicio=" + inicio + "&fim=" + fim;
}
function mensagem(textoMensagem) {
    clearTimeout(aviso);
    elemento("toast").textContent = textoMensagem;
    elemento("toast").hidden = false;
    aviso = setTimeout(() => (elemento("toast").hidden = true), 5000);
}

// Cada tela é um HTML completo. O JavaScript só busca e preenche os dados.
pagina = document.body.dataset.pagina;
const dentroDePages = location.pathname.includes("/pages/");
const pastaPages = dentroDePages ? "" : "pages/";
const formularios = {
    rendas: "nova-renda",
    despesas: "nova-despesa",
    investimentos: "novo-investimento",
};
try {
    inicio = sessionStorage.getItem("financeiro.inicio") || inicio;
    fim = sessionStorage.getItem("financeiro.fim") || fim;
} catch (erro) {
    /* O período também funciona sem armazenamento. */
}

async function abrirPagina() {
    elemento("periodo-atual").textContent =
        dataTexto(inicio) + " – " + dataTexto(fim);
    elemento("erro-conexao").hidden = true;
    try {
        if (document.body.dataset.formulario) {
            await mostrarFormulario(
                new URLSearchParams(location.search).get("id"),
            );
        } else if (pagina === "visao-geral") {
            await mostrarResumo();
        } else if (pagina === "configuracoes") {
            marcarTema();
        } else {
            await mostrarRegistros();
        }
        document.title = elemento("titulo").textContent + " | Meu Financeiro";
        const avisoSalvo = sessionStorage.getItem("financeiro.aviso");
        if (avisoSalvo) {
            mensagem(avisoSalvo);
            sessionStorage.removeItem("financeiro.aviso");
        }
    } catch (erro) {
        elemento("erro-conexao").textContent = erro.message;
        elemento("erro-conexao").hidden = false;
    }
}

async function mostrarResumo() {
    const resumo = await consultarApi("/resumo" + periodo());
    elemento("total-rendas").textContent = dinheiro(resumo.rendas);
    elemento("total-despesas").textContent = dinheiro(resumo.despesas);
    elemento("total-investimentos").textContent = dinheiro(
        resumo.investimentos,
    );
    elemento("saldo").textContent = dinheiro(resumo.saldo);
    elemento("saldo").className = resumo.saldo < 0 ? "expense" : "income";
    elemento("quantidade-rendas").textContent =
        resumo.quantidadeRendas + " rendas no período";
    elemento("quantidade-despesas").textContent =
        resumo.quantidadeDespesas + " despesas no período";

    let barras = "";
    const valores = Object.values(resumo.categorias);
    const maior = Math.max(1, ...valores);
    for (const codigo in resumo.categorias) {
        const valor = resumo.categorias[codigo];
        barras += `<div class="bar-row"><span>${categorias[codigo]}</span><div class="track"><i style="width:${(valor / maior) * 100}%"></i></div><span>${dinheiro(valor)}</span></div>`;
    }
    elemento("categorias-resumo").innerHTML =
        barras || "<p>Nenhuma despesa neste período.</p>";
    let recentes = "";
    for (const registro of resumo.recentes) {
        const tipo =
            registro.tipo === "RENDA"
                ? "Renda"
                : registro.tipo === "DESPESA"
                  ? "Despesa"
                  : "Investimento";
        recentes += `<div class="recent-row"><span>${dataTexto(registro.data)}</span><span>${texto(registro.descricao)}</span><span>${tipo}</span><span>${dinheiro(registro.valor)}</span></div>`;
    }
    elemento("recentes").innerHTML =
        recentes || '<p class="empty">Nenhum registro neste período.</p>';
}

async function mostrarRegistros() {
    const secao = secoes[pagina];
    const resumo = await consultarApi("/resumo" + periodo());
    let caminho = "/registros" + periodo() + "&tipo=" + secao.tipo;
    if (pagina === "despesas" && categoriaAtual)
        caminho += "&categoria=" + categoriaAtual;
    const registros = await consultarApi(caminho);
    elemento("rotulo-total").textContent = secao.titulo + " no período";
    elemento("total-lista").textContent = dinheiro(resumo[pagina]);
    elemento("total-lista").className = secao.cor;
    const quantidade = resumo["quantidade" + secao.titulo];
    elemento("quantidade-lista").textContent = quantidade + " registros";
    elemento("novo-registro").textContent = "＋ " + secao.novo;
    elemento("novo-registro").dataset.create = pagina;
    const despesa = pagina === "despesas";
    elemento("filtros").hidden = !despesa;
    if (despesa) {
        let botoes = `<button data-category="" class="${categoriaAtual === "" ? "primary" : ""}">Todas</button>`;
        for (const codigo in categorias) {
            botoes += `<button data-category="${codigo}" class="${categoriaAtual === codigo ? "primary" : ""}">${categorias[codigo]}</button>`;
        }
        elemento("botoes-categoria").innerHTML = botoes;
    }
    elemento("tabela").className = despesa ? "records expenses" : "records";
    elemento("cabecalho-tabela").innerHTML =
        `<tr><th>${pagina === "investimentos" ? "Tipo de investimento" : "Descrição"}</th>${despesa ? "<th>Categoria</th>" : ""}<th class="date">Data</th><th class="amount">Valor</th><th class="action">Ações</th></tr>`;
    let linhas = "";
    for (const registro of registros) {
        linhas += `<tr><td>${texto(registro.descricao)}</td>${despesa ? `<td><span class="badge">${categorias[registro.categoria]}</span></td>` : ""}<td class="date">${dataTexto(registro.data)}</td><td class="amount">${dinheiro(registro.valor)}</td><td class="action"><div class="row-actions"><button class="text-button" data-edit="${registro.id}">Editar</button><button class="delete-button" data-delete="${registro.id}">Apagar</button></div></td></tr>`;
    }
    elemento("registros").innerHTML = linhas;
    elemento("lista-vazia").hidden = registros.length > 0;
    elemento("rodape-lista").textContent =
        registros.length + " registros no período selecionado";
}

async function apagarRegistro(id, botao) {
    if (!window.confirm("Apagar este registro? Essa ação não pode ser desfeita.")) return;
    botao.disabled = true;
    try {
        await consultarApi("/registros/" + id, "DELETE");
        await mostrarRegistros();
        mensagem("Registro apagado com sucesso.");
    } catch (erro) {
        mensagem(erro.message);
    } finally {
        botao.disabled = false;
    }
}

async function mostrarFormulario(id) {
    const secao = secoes[pagina];
    const despesa = pagina === "despesas";
    const registro = id ? await consultarApi("/registros/" + id) : null;
    if (registro && registro.tipo !== secao.tipo)
        throw new Error("Abra a seção correspondente a esse registro.");
    elemento("titulo").textContent = id
        ? "Editar " + secao.singular
        : secao.novo;
    elemento("titulo-formulario").textContent =
        "Dados " +
        (despesa || pagina === "rendas" ? "da " : "do ") +
        secao.singular;
    elemento("voltar").textContent = "← Voltar para " + pagina;
    elemento("voltar").onclick = voltarLista;
    elemento("cancelar").onclick = voltarLista;
    elemento("salvar").textContent = id
        ? "Salvar alterações"
        : "Salvar " + secao.singular;
    elemento("rotulo-descricao").textContent =
        pagina === "investimentos" ? "Tipo de investimento *" : "Descrição *";
    elemento("descricao").placeholder =
        pagina === "investimentos"
            ? "Ex.: Tesouro Direto"
            : "Ex.: Salário, aluguel, compras...";
    elemento("campo-categoria").hidden = !despesa;
    elemento("categoria").required = despesa;
    elemento("record-form").classList.toggle("expense-form", despesa);

    elemento("orientacao").textContent = despesa
        ? "A categoria facilita suas consultas."
        : pagina === "rendas"
          ? "A renda será somada ao saldo."
          : "Os aportes são totalizados separadamente do saldo.";
    if (registro) {
        elemento("descricao").value = registro.descricao;
        elemento("valor").value = Number(registro.valor)
            .toFixed(2)
            .replace(".", ",");
        elemento("data").value = registro.data;
        elemento("categoria").value = registro.categoria || "";
    }
    elemento("record-form").onsubmit = async function (evento) {
        evento.preventDefault();
        const botao = elemento("salvar");
        const erro = elemento("form-error");
        erro.textContent = "";
        let valor = elemento("valor").value.trim();
        // Aceita 1234,56 ou 1.234,56 e envia 1234.56 para o Java.
        if (valor.includes(",")) {
            if (!/^(\d+|\d{1,3}(\.\d{3})+),\d{1,2}$/.test(valor)) {
                erro.textContent =
                    "Informe um valor válido, com até duas casas decimais.";
                return;
            }
            valor = valor.replaceAll(".", "").replace(",", ".");
        }
        if (!/^\d+(\.\d{1,2})?$/.test(valor) || Number(valor) <= 0) {
            erro.textContent =
                "Informe um valor maior que zero, com até duas casas decimais.";
            return;
        }
        const dados = {
            tipo: secao.tipo,
            descricao: elemento("descricao").value.trim(),
            valor: valor,
            data: elemento("data").value,
            categoria: despesa ? elemento("categoria").value : null,
        };
        botao.disabled = true;
        try {
            await consultarApi(
                "/registros" + (id ? "/" + id : ""),
                id ? "PUT" : "POST",
                dados,
            );
            if (dados.data < inicio || dados.data > fim) {
                escolherMes(dados.data.slice(0, 7));
            }
            salvarPeriodo();
            sessionStorage.setItem(
                "financeiro.aviso",
                "Registro salvo com sucesso.",
            );
            voltarLista();
        } catch (falha) {
            erro.textContent = falha.message;
        } finally {
            botao.disabled = false;
        }
    };
}

function voltarLista() {
    location.href = pastaPages + pagina + ".html";
}
function salvarPeriodo() {
    sessionStorage.setItem("financeiro.inicio", inicio);
    sessionStorage.setItem("financeiro.fim", fim);
}
function marcarTema() {
    document.querySelectorAll("[data-theme-choice]").forEach((botao) => {
        const selecionado =
            botao.dataset.themeChoice ===
            document.documentElement.dataset.theme;
        botao.setAttribute("aria-pressed", selecionado);
        botao.querySelector(".check").textContent = selecionado ? "✓" : "";
    });
}
function escolherMes(mes) {
    const partes = mes.split("-");
    inicio = dataIso(new Date(Number(partes[0]), Number(partes[1]) - 1, 1));
    fim = dataIso(new Date(Number(partes[0]), Number(partes[1]), 0));
}
document.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button");
    if (!botao) return;
    if (botao.dataset.create)
        location.href =
            pastaPages + formularios[botao.dataset.create] + ".html";
    if (botao.dataset.edit)
        location.href =
            pastaPages + formularios[pagina] + ".html?id=" + botao.dataset.edit;
    if (botao.dataset.delete) apagarRegistro(botao.dataset.delete, botao);
    if (botao.hasAttribute("data-category")) {
        categoriaAtual = botao.dataset.category;
        mostrarRegistros().catch((erro) => mensagem(erro.message));
    }
    if (botao.dataset.themeChoice) {
        const tema = botao.dataset.themeChoice;
        document.documentElement.dataset.theme = tema;
        try {
            localStorage.setItem("financeiro.theme", tema);
        } catch (erro) {
            mensagem("O navegador não permitiu salvar a preferência.");
        }
        marcarTema();
    }
});
elemento("period-open").onclick = function () {
    elemento("start").value = inicio;
    elemento("end").value = fim;
    elemento("month").value = inicio.slice(0, 7);
    elemento("period-error").textContent = "";
    elemento("period-dialog").showModal();
};
elemento("period-cancel").onclick = () => elemento("period-dialog").close();
elemento("month").onchange = function () {
    if (!this.value) return;
    const partes = this.value.split("-");
    elemento("start").value = dataIso(
        new Date(Number(partes[0]), Number(partes[1]) - 1, 1),
    );
    elemento("end").value = dataIso(
        new Date(Number(partes[0]), Number(partes[1]), 0),
    );
};
elemento("period-form").onsubmit = function (evento) {
    evento.preventDefault();
    if (elemento("start").value > elemento("end").value) {
        elemento("period-error").textContent =
            "A data inicial deve ser anterior ou igual à final.";
        return;
    }
    inicio = elemento("start").value;
    fim = elemento("end").value;
    salvarPeriodo();
    elemento("period-dialog").close();
    abrirPagina();
};
// No celular, o botão de três linhas abre a navegação lateral.
const telaPequena = window.matchMedia("(max-width: 760px)");
const menuLateral = elemento("menu-lateral");
const botaoMenu = elemento("menu-toggle");

function alternarMenu(abrir) {
    const estavaAberto = document.body.classList.contains("menu-aberto");
    const aberto = abrir && telaPequena.matches;
    document.body.classList.toggle("menu-aberto", aberto);
    botaoMenu.setAttribute("aria-expanded", aberto);
    botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    elemento("menu-backdrop").hidden = !aberto;
    menuLateral.inert = telaPequena.matches && !aberto;
    document.querySelector(".workspace").inert = aberto;
    if (aberto) {
        elemento("menu-close").focus();
    } else if (estavaAberto && telaPequena.matches) {
        botaoMenu.focus();
    }
}

botaoMenu.onclick = () => alternarMenu(true);
elemento("menu-close").onclick = () => alternarMenu(false);
elemento("menu-backdrop").onclick = () => alternarMenu(false);
telaPequena.addEventListener("change", () => alternarMenu(false));
document.addEventListener("keydown", function (evento) {
    if (!document.body.classList.contains("menu-aberto")) return;
    if (evento.key === "Escape") alternarMenu(false);
    if (evento.key === "Tab") {
        const links = menuLateral.querySelectorAll("a, button");
        const primeiro = links[0];
        const ultimo = links[links.length - 1];
        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    }
});
alternarMenu(false);
abrirPagina();
