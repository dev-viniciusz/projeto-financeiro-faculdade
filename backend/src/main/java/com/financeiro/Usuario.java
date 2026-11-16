package com.financeiro;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Usuario {
    private String nome;
    private String cpf;
    private final List<Renda> rendas = new ArrayList<>();
    private final List<Despesa> despesas = new ArrayList<>();
    private final List<Investimento> investimentos = new ArrayList<>();

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public void adicionarRenda(Renda renda) { rendas.add(renda); }
    public void adicionarDespesa(Despesa despesa) { despesas.add(despesa); }
    public void adicionarInvestimento(Investimento investimento) { investimentos.add(investimento); }

    public BigDecimal consultarSaldo() {
        BigDecimal saldo = BigDecimal.ZERO;
        for (Renda renda : rendas) {
            saldo = saldo.add(renda.getValor());
        }
        for (Despesa despesa : despesas) {
            saldo = saldo.subtract(despesa.getValor());
        }
        return saldo;
    }

    public Map<String, Object> consultarResumo() {
        BigDecimal totalRendas = BigDecimal.ZERO;
        BigDecimal totalDespesas = BigDecimal.ZERO;
        BigDecimal totalInvestimentos = BigDecimal.ZERO;
        Map<String, BigDecimal> categorias = new HashMap<>();
        for (Renda renda : rendas) {
            totalRendas = totalRendas.add(renda.getValor());
        }
        for (Despesa despesa : despesas) {
            totalDespesas = totalDespesas.add(despesa.getValor());
            BigDecimal totalCategoria = categorias.getOrDefault(despesa.getCategoria(), BigDecimal.ZERO);
            categorias.put(despesa.getCategoria(), totalCategoria.add(despesa.getValor()));
        }
        for (Investimento investimento : investimentos) {
            totalInvestimentos = totalInvestimentos.add(investimento.getValor());
        }
        Map<String, Object> resumo = new HashMap<>();
        resumo.put("rendas", totalRendas);
        resumo.put("despesas", totalDespesas);
        resumo.put("investimentos", totalInvestimentos);
        resumo.put("saldo", consultarSaldo());
        resumo.put("quantidadeRendas", rendas.size());
        resumo.put("quantidadeDespesas", despesas.size());
        resumo.put("quantidadeInvestimentos", investimentos.size());
        resumo.put("categorias", categorias);
        return resumo;
    }
}
