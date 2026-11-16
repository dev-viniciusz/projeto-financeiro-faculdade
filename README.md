# Meu Financeiro

Sistema de finanças pessoais para apresentação da faculdade. Usa **Java com Spring Boot**, banco H2, **HTML, CSS e JavaScript puro**.

## Abrir pelo Live Server

1. No VS Code, abra `frontend/src/index.html`.
2. Clique com o botão direito e escolha **Open with Live Server**.
3. Navegue normalmente pelo menu. As páginas de `frontend/src/pages` também podem ser abertas diretamente.

Todos os HTMLs têm `DOCTYPE`, `html`, `head`, `body`, título, CSS e JavaScript ligados por caminhos relativos. O visual e a troca de temas funcionam sem o backend. Para cadastrar, editar e consultar os dados, inicie também o Spring.

## Iniciar o backend

No VS Code, instale **Extension Pack for Java**, abra a pasta completa do projeto e aguarde a importação de `backend/pom.xml`. Pressione **F5** e escolha **Iniciar Spring Boot**. A configuração em `.vscode/launch.json` inicia o projeto com as dependências do Maven, usando a pasta `backend` e mostrando os logs no terminal integrado. Para parar essa execução, pressione **Shift+F5**.

O comando **Run Code**, da extensão Code Runner, executa `javac` em um arquivo isolado e não carrega as bibliotecas do Spring.

Para iniciar pelo terminal, é necessário ter JDK 21 ou superior e Maven instalado:

```powershell
cd backend
mvn spring-boot:run
```

O backend fica em **http://localhost:8080**. Também é possível abrir o site nesse endereço, sem Live Server. Para parar o Spring iniciado no terminal, pressione `Ctrl+C`.

O JavaScript usa `http://localhost:8080/api` quando aberto pelo Live Server. O Spring permite conexões locais de `localhost` e `127.0.0.1`, mesmo em outra porta. Não é necessário instalar Node ou Python para executar o projeto. Não há Maven Wrapper: somente o `pom.xml` para a configuração Maven.

## Estrutura

```text
backend/
  pom.xml
  src/main/java/com/financeiro/
    Main.java                   inicia o Spring
    Usuario.java                reúne as movimentações e calcula saldo e resumo
    Renda.java                  descrição, valor e data da renda
    Despesa.java                descrição, valor, categoria e data da despesa
    Investimento.java           tipo, valor e data do investimento
    Registro.java               transporta os dados entre a API e o banco
    FinanceiroController.java   recebe as requisições HTTP
    Db.java                     executa SQL com JdbcTemplate
    Validate.java               valida os campos com condições if
    ApiException.java           devolve mensagens de erro
  src/main/resources/
    application.properties
    schema.sql
frontend/src/
  index.html
  pages/
    visao-geral.html
    rendas.html
    despesas.html
    investimentos.html
    nova-renda.html
    nova-despesa.html
    novo-investimento.html
    configuracoes.html
  css/styles.css
  js/api.js
  js/app.js
  js/theme.js
  assets/
```

O CSS e os scripts são compartilhados para evitar repetir código, mas cada HTML contém sua tela completa. O `app.js` lê o atributo `data-pagina` do `body` para saber quais dados preencher. A edição usa o mesmo formulário de cadastro, com `?id=1` na URL.

As classes `Usuario`, `Renda`, `Despesa` e `Investimento` seguem os nomes e os métodos do UML do documento. Os cálculos de `Usuario` são utilizados pela API. `Registro` é apenas uma classe auxiliar para o formato comum das requisições e da tabela. `BigDecimal` representa dinheiro e `LocalDate` representa datas. Não há login nem formulário de CPF.

## Funcionalidades

- Cadastrar, consultar, editar e apagar rendas, despesas e investimentos.
- Filtrar despesas por categoria e selecionar mês ou intervalo de datas.
- Exibir resumo, despesas por categoria e movimentações recentes.
- Escolher Verde claro, Verde escuro ou Rosa claro em Configurações → Aparência. O tema é salvo no navegador.

**Saldo = rendas − despesas.** Investimentos são somados separadamente. O cartão de despesas mantém o total do período quando a lista é filtrada por categoria.

O banco começa vazio e fica em `backend/data/financeiro.mv.db`. Os registros continuam salvos após reiniciar o sistema. O `schema.sql` cria a tabela se ela ainda não existir. Para fazer backup, pare o Spring e copie o arquivo do banco.

O botão **Apagar** pede confirmação e remove o registro do banco (`DELETE /api/registros/{id}`). O registro deixa de aparecer na lista, no resumo e nas movimentações recentes. Não é mantido um histórico de registros apagados.

## Compartilhar temporariamente com ngrok

O túnel deve apontar para a porta **8080 do Spring**, pois ela entrega tanto o site quanto a API. Não precisa expor o Live Server. O frontend usa o próprio endereço público para consultar a API.

1. Instale o ngrok e configure sua conta com `ngrok config add-authtoken SEU_TOKEN` no seu terminal.
2. Inicie o Spring dentro de `backend`. Para compartilhar sem expor o console do banco, use:

```powershell
mvn spring-boot:run "-Dspring-boot.run.arguments=--spring.h2.console.enabled=false"
```

3. Em outro terminal, execute `ngrok http 8080`.
4. Copie o endereço HTTPS mostrado em `Forwarding` e teste no celular.
5. Cole esse endereço como destino de um novo link no Bitly.

O computador, o Spring e o ngrok precisam permanecer ligados para o link funcionar. Todos acessam e alteram o mesmo banco: use dados de demonstração. O Bitly apenas redireciona o link, não hospeda o sistema.

## Consultar o banco H2

Com o Spring iniciado a partir da pasta `backend`, abra **http://localhost:8080/h2-console** e preencha:

- Driver Class: `org.h2.Driver`
- JDBC URL: `jdbc:h2:file:./data/financeiro`
- User Name: `sa`
- Password: deixe em branco.

Clique em **Connect**. Para visualizar os registros, execute `SELECT * FROM REGISTRO;`.

## Fluxo para explicar na apresentação

1. O usuário abre um HTML e preenche o formulário.
2. `api.js` envia os dados com `fetch` para o Spring.
3. `FinanceiroController` valida e chama `Db` para gravar ou consultar o banco.
4. No resumo, os registros são organizados nas classes `Renda`, `Despesa` e `Investimento` do `Usuario`.
5. `Usuario` calcula os totais com laços `for`; o Spring devolve JSON e o JavaScript preenche a tela.
