const API_URL = "/api";
async function consultarApi(caminho, metodo = "GET", registro = null) {
    const opcoes = { method: metodo };
    if (registro !== null) {
        opcoes.headers = { "Content-Type": "application/json" };
        opcoes.body = JSON.stringify(registro);
    }

    let resposta;
    try {
        resposta = await fetch(API_URL + caminho, opcoes);
    } catch (erro) {
        throw new Error(
            "Não foi possível conectar ao servidor. Tente novamente.",
        );
    }
    if (resposta.status === 204) return null;
    const dados = await resposta.json();
    if (!resposta.ok) {
        throw new Error(
            dados.message || "Não foi possível concluir a operação.",
        );
    }
    return dados;
}
