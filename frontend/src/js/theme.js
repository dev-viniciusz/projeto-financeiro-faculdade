// Recupera o tema antes de desenhar a página.
try {
    const savedTheme = localStorage.getItem("financeiro.theme");
    if (["verde-claro", "verde-escuro", "rosa-claro"].includes(savedTheme))
        document.documentElement.dataset.theme = savedTheme;
} catch (_) {
    // Alguns navegadores podem bloquear o armazenamento local.
}
