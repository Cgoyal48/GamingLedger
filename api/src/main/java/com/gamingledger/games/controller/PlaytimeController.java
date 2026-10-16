package com.gamingledger.games.controller;

import com.gamingledger.common.security.CurrentUserId;
import com.gamingledger.games.model.NewPlaytime;
import com.gamingledger.games.model.PlaySession;
import com.gamingledger.games.model.PlaytimeSnapshot;
import com.gamingledger.games.service.PlaytimeService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PlaytimeController {

    private final PlaytimeService playtime;

    public PlaytimeController(PlaytimeService playtime) {
        this.playtime = playtime;
    }

    @PostMapping("/api/games/{id}/playtime")
    public PlaytimeSnapshot log(
        @CurrentUserId UUID userId,
        @PathVariable long id,
        @Valid @RequestBody NewPlaytime body
    ) {
        return playtime.log(userId, id, body.minutes());
    }

    /** Every hours entry across the user's copies, newest first. Feeds the timeline. */
    @GetMapping("/api/playtime")
    public List<PlaySession> history(@CurrentUserId UUID userId) {
        return playtime.history(userId);
    }
}
