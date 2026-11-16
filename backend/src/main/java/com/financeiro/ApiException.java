package com.financeiro;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

// Devolve os erros em JSON para o JavaScript mostrar a mensagem na tela.
@RestControllerAdvice
public class ApiException {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> tratar(ResponseStatusException erro) {
        return ResponseEntity.status(erro.getStatusCode()).body(Map.of("message", erro.getReason()));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class})
    public ResponseEntity<?> dadosInvalidos(Exception erro) {
        return ResponseEntity.badRequest().body(Map.of("message", "Confira os campos, os valores e as datas informadas."));
    }
}
