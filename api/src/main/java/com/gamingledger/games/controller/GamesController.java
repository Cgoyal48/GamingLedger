package com.gamingledger.games.controller;

import com.gamingledger.common.security.CurrentUserId;
import com.gamingledger.games.model.Copy;
import com.gamingledger.games.model.CopyRequest;
import com.gamingledger.games.model.NewCopyRequest;
import com.gamingledger.games.service.CopyService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/games")
public class GamesController {

    private final CopyService copies;

    public GamesController(CopyService copies) {
        this.copies = copies;
    }

    @GetMapping
    public List<Copy> list(@CurrentUserId UUID userId) {
        return copies.list(userId);
    }

    @PostMapping
    public Copy create(@CurrentUserId UUID userId, @Valid @RequestBody NewCopyRequest body) {
        return copies.create(userId, body);
    }

    @PutMapping("/{id}")
    public Copy update(@CurrentUserId UUID userId, @PathVariable long id, @Valid @RequestBody CopyRequest body) {
        return copies.update(userId, id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUserId UUID userId, @PathVariable long id) {
        copies.delete(userId, id);
    }
}
