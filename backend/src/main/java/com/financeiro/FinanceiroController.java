package com.financeiro;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class FinanceiroController {
    private final Db db;

    public FinanceiroController(Db db) {
        this.db = db;
    }

    @GetMapping("/registros")
    public List<Registro> listar(@RequestParam LocalDate inicio, @RequestParam LocalDate fim,
            @RequestParam(required = false) String tipo, @RequestParam(required = false) String categoria) {
        Validate.periodo(inicio, fim);
        List<Registro> resultado = new ArrayList<>();
        for (Registro registro : db.listar(inicio, fim)) {
            boolean mesmoTipo = tipo == null || tipo.equals(registro.getTipo());
            boolean mesmaCategoria = categoria == null || categoria.equals(registro.getCategoria());
            if (mesmoTipo && mesmaCategoria) {
                resultado.add(registro);
            }
        }
        return resultado;
    }

    @GetMapping("/registros/{id}")
    public Registro buscar(@PathVariable long id) {
        return db.buscar(id);
    }

    @PostMapping("/registros")
    public ResponseEntity<Registro> cadastrar(@RequestBody Registro registro) {
        Validate.registro(registro);
        return ResponseEntity.status(HttpStatus.CREATED).body(db.cadastrar(registro));
    }

    @PutMapping("/registros/{id}")
    public Registro editar(@PathVariable long id, @RequestBody Registro registro) {
        Validate.registro(registro);
        Registro antigo = db.buscar(id);
        if (!antigo.getTipo().equals(registro.getTipo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível alterar o tipo do registro.");
        }
        return db.editar(id, registro);
    }

    @DeleteMapping("/registros/{id}")
    public ResponseEntity<Void> apagar(@PathVariable long id) {
        db.apagar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/resumo")
    public Map<String, Object> resumo(@RequestParam LocalDate inicio, @RequestParam LocalDate fim) {
        Validate.periodo(inicio, fim);
        List<Registro> registros = db.listar(inicio, fim);
        Usuario usuario = new Usuario();
        for (Registro registro : registros) {
            if (registro.getTipo().equals("RENDA")) {
                usuario.adicionarRenda(new Renda(registro.getDescricao(), registro.getValor(), registro.getData()));
            } else if (registro.getTipo().equals("DESPESA")) {
                usuario.adicionarDespesa(new Despesa(registro.getDescricao(), registro.getValor(), registro.getCategoria(), registro.getData()));
            } else {
                usuario.adicionarInvestimento(new Investimento(registro.getDescricao(), registro.getValor(), registro.getData()));
            }
        }
        Map<String, Object> resumo = usuario.consultarResumo();
        List<Registro> recentes = new ArrayList<>();
        for (int i = registros.size() - 1; i >= 0 && recentes.size() < 3; i--) {
            recentes.add(registros.get(i));
        }
        resumo.put("recentes", recentes);
        return resumo;
    }
}
