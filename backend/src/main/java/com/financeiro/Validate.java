package com.financeiro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class Validate {
    public static void registro(Registro registro) {
        if (registro.getTipo() == null || !List.of("RENDA", "DESPESA", "INVESTIMENTO").contains(registro.getTipo())) {
            erro("Escolha um tipo de registro válido.");
        }
        if (registro.getDescricao() == null || registro.getDescricao().isBlank()) {
            erro("Informe a descrição ou o tipo de investimento.");
        }
        registro.setDescricao(registro.getDescricao().trim());
        if (registro.getDescricao().length() > 120) {
            erro("A descrição deve ter no máximo 120 caracteres.");
        }
        BigDecimal valor = registro.getValor();
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            erro("O valor deve ser maior que zero.");
        }
        if (valor.scale() > 2 || valor.compareTo(new BigDecimal("9999999999999.99")) > 0) {
            erro("Informe um valor com até 13 dígitos e duas casas decimais.");
        }
        if (registro.getData() == null) {
            erro("Informe a data.");
        }
        if (registro.getTipo().equals("DESPESA")) {
            List<String> categorias = List.of("ALIMENTACAO", "MORADIA", "TRANSPORTE", "LAZER", "SAUDE");
            if (registro.getCategoria() == null || !categorias.contains(registro.getCategoria())) {
                erro("Selecione uma categoria válida.");
            }
        } else {
            registro.setCategoria(null);
        }
    }

    public static void periodo(LocalDate inicio, LocalDate fim) {
        if (inicio.isAfter(fim)) {
            erro("A data inicial deve ser anterior ou igual à data final.");
        }
    }

    private static void erro(String mensagem) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
