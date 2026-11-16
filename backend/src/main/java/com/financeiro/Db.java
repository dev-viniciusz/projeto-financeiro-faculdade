package com.financeiro;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

@Repository
public class Db {
    private final JdbcTemplate jdbc;

    public Db(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Registro> listar(LocalDate inicio, LocalDate fim) {
        String sql = "SELECT * FROM registro WHERE data BETWEEN ? AND ? ORDER BY data, id";
        return jdbc.query(sql, this::lerRegistro, inicio, fim);
    }

    public Registro buscar(long id) {
        List<Registro> registros = jdbc.query("SELECT * FROM registro WHERE id = ?", this::lerRegistro, id);
        if (registros.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro não encontrado.");
        }
        return registros.get(0);
    }

    public Registro cadastrar(Registro registro) {
        String sql = "INSERT INTO registro (tipo, descricao, valor, data, categoria) VALUES (?, ?, ?, ?, ?)";
        GeneratedKeyHolder chave = new GeneratedKeyHolder();
        jdbc.update(conexao -> {
            PreparedStatement comando = conexao.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            comando.setString(1, registro.getTipo());
            comando.setString(2, registro.getDescricao());
            comando.setBigDecimal(3, registro.getValor());
            comando.setObject(4, registro.getData());
            comando.setString(5, registro.getCategoria());
            return comando;
        }, chave);
        registro.setId(chave.getKey().longValue());
        return registro;
    }

    public Registro editar(long id, Registro registro) {
        String sql = "UPDATE registro SET descricao = ?, valor = ?, data = ?, categoria = ? WHERE id = ?";
        jdbc.update(sql, registro.getDescricao(), registro.getValor(), registro.getData(), registro.getCategoria(), id);
        registro.setId(id);
        return registro;
    }

    public void apagar(long id) {
        int removidos = jdbc.update("DELETE FROM registro WHERE id = ?", id);
        if (removidos == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro não encontrado.");
        }
    }

    // Transforma uma linha da tabela em um objeto Java.
    private Registro lerRegistro(ResultSet linha, int numero) throws SQLException {
        Registro registro = new Registro();
        registro.setId(linha.getLong("id"));
        registro.setTipo(linha.getString("tipo"));
        registro.setDescricao(linha.getString("descricao"));
        registro.setValor(linha.getBigDecimal("valor"));
        registro.setData(linha.getDate("data").toLocalDate());
        registro.setCategoria(linha.getString("categoria"));
        return registro;
    }
}
