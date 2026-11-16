package com.financeiro;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Despesa {
    private String descricao;
    private BigDecimal valor;
    private String categoria;
    private LocalDate data;

    public Despesa(String descricao, BigDecimal valor, String categoria, LocalDate data) {
        alterarDespesa(descricao, valor, categoria, data);
    }

    public void alterarDespesa(String descricao, BigDecimal valor, String categoria, LocalDate data) {
        this.descricao = descricao;
        this.valor = valor;
        this.categoria = categoria;
        this.data = data;
    }

    public String getDescricao() { return descricao; }
    public BigDecimal getValor() { return valor; }
    public String getCategoria() { return categoria; }
    public LocalDate getData() { return data; }
}
