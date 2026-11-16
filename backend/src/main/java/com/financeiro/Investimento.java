package com.financeiro;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Investimento {
    private String tipo;
    private BigDecimal valor;
    private LocalDate data;

    public Investimento(String tipo, BigDecimal valor, LocalDate data) {
        alterarInvestimento(tipo, valor, data);
    }

    public void alterarInvestimento(String tipo, BigDecimal valor, LocalDate data) {
        this.tipo = tipo;
        this.valor = valor;
        this.data = data;
    }

    public String getTipo() { return tipo; }
    public BigDecimal getValor() { return valor; }
    public LocalDate getData() { return data; }
}
