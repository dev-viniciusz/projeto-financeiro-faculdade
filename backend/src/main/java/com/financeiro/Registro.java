package com.financeiro;

import java.math.BigDecimal;
import java.time.LocalDate;

// Formato dos dados enviados pelo formulário e lidos da tabela do banco.
// As regras de domínio ficam em Usuario, Renda, Despesa e Investimento.
public class Registro {
    private Long id;
    private String tipo;
    private String descricao;
    private BigDecimal valor;
    private LocalDate data;
    private String categoria;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
}