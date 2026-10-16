package com.gamingledger.settings.controller;

import com.gamingledger.common.security.CurrentUserId;
import com.gamingledger.settings.model.Settings;
import com.gamingledger.settings.service.SettingsService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settings;

    public SettingsController(SettingsService settings) {
        this.settings = settings;
    }

    @GetMapping
    public Settings get(@CurrentUserId UUID userId) {
        return new Settings(settings.displayCurrency(userId));
    }

    @PutMapping
    public Settings update(@CurrentUserId UUID userId, @Valid @RequestBody Settings body) {
        settings.setDisplayCurrency(userId, body.displayCurrency());
        return body;
    }
}
