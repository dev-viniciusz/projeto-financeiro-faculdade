package com.financeiro;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Renda {
    private String descricao;
    private BigDecimal valor;
    private LocalDate data;

    public Renda(String descricao, BigDecimal valor, LocalDate data) {
        alterarRenda(descricao, valor, data);
    }

    public void alterarRenda(String descricao, BigDecimal valor, LocalDate data) {
        this.descricao = descricao;
        this.valor = valor;
        this.data = data;
    }

    public String getDescricao() { return descricao; }
    public BigDecimal getValor() { return valor; }
    public LocalDate getData() { return data; }
}
