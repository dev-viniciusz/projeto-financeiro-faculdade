// No Live Server local, a API fica na porta 8080.
// Pelo Spring ou pelo ngrok, usamos o mesmo endereço do site.
const usandoLiveServer =
    ["localhost", "127.0.0.1"].includes(location.hostname) &&
    location.port !== "8080";
const API_URL = usandoLiveServer ? "http://localhost:8080/api" : "/api";
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
            "O visual está carregado. Para consultar ou salvar os dados, inicie o backend na porta 8080.",
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
