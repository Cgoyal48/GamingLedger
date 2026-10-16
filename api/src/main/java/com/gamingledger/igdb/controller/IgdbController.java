package com.gamingledger.igdb.controller;

import com.gamingledger.igdb.client.IgdbClient;
import com.gamingledger.igdb.model.IgdbGame;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IgdbController {

    private final IgdbClient igdb;

    public IgdbController(IgdbClient igdb) {
        this.igdb = igdb;
    }

    @GetMapping("/api/games/search")
    public List<IgdbGame> search(@RequestParam String q) {
        if (q.trim().length() < 2) {
            return List.of();
        }
        return igdb.search(q);
    }
}
