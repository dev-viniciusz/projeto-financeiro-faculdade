# Meu Financeiro

Sistema de finanças pessoais para apresentação da faculdade. Usa **Java com Spring Boot**, banco H2, **HTML, CSS e JavaScript puro**.

## Iniciar o sistema

1. No VS Code, abra a pasta completa do projeto e aguarde a importação de `backend/pom.xml` com a extensão **Extension Pack for Java** instalada.
2. Abra `backend/src/main/java/com/financeiro/Main.java` e clique em **Run Java**.
3. Aguarde o servidor iniciar e abra **http://localhost:8080/** no navegador.

O Spring Boot inicia o Tomcat embutido. O mesmo servidor entrega os arquivos HTML, CSS e JavaScript e atende às requisições da API. Mantenha o Java em execução enquanto usa o site.

O comando **Run Code**, da extensão Code Runner, executa `javac` em um arquivo isolado e não carrega as bibliotecas do Spring.

Para iniciar pelo terminal, é necessário ter JDK 21 ou superior e Maven instalado:

```powershell
cd backend
mvn spring-boot:run
```

O site e a API ficam em **http://localhost:8080**. Para parar o Spring iniciado no terminal, pressione `Ctrl+C`.

O JavaScript usa `/api`, no mesmo endereço e porta do site. Não é necessário usar Live Server, Node ou Python. Não há Maven Wrapper: somente o `pom.xml` para a configuração Maven.

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

O banco começa vazio e usa o caminho `./data/financeiro`, relativo à pasta de execução do Java: `data/financeiro.mv.db` ao iniciar pela raiz ou `backend/data/financeiro.mv.db` ao iniciar dentro de `backend`. Use sempre a mesma pasta de execução para acessar o mesmo banco. Os registros continuam salvos após reiniciar o sistema. O `schema.sql` cria a tabela se ela ainda não existir. Para fazer backup, pare o Spring e copie o arquivo do banco.

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

Com o Spring iniciado, abra **http://localhost:8080/h2-console** e preencha:

- Driver Class: `org.h2.Driver`
- JDBC URL: `jdbc:h2:file:./data/financeiro`
- User Name: `sa`
- Password: deixe em branco.

Clique em **Connect**. Para visualizar os registros, execute `SELECT * FROM REGISTRO;`.

## Fluxo para explicar na apresentação

1. Executamos `Main.java`: o Spring Boot inicia o Tomcat na porta 8080.
2. O navegador pede o site; o servidor entrega HTML, CSS e JavaScript.
3. Ao consultar ou salvar, `app.js` chama `api.js`, que envia uma requisição HTTP com `fetch` para `/api`.
4. O Tomcat recebe a requisição e o Spring a encaminha ao método correspondente de `FinanceiroController`.
5. O controller valida quando necessário e chama `Db`, que executa SQL no banco H2. No resumo, `Usuario` calcula os totais.
6. O Spring devolve os dados em JSON e o JavaScript atualiza a tela no navegador.
