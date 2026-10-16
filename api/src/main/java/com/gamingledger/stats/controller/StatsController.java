package com.gamingledger.stats.controller;

import com.gamingledger.common.security.CurrentUserId;
import com.gamingledger.stats.model.Stats;
import com.gamingledger.stats.service.StatsService;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StatsController {

    private final StatsService stats;

    public StatsController(StatsService stats) {
        this.stats = stats;
    }

    @GetMapping("/api/stats")
    public Stats get(@CurrentUserId UUID userId) {
        return stats.forUser(userId);
    }
}
