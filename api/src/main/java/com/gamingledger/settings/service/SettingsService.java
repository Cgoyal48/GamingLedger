package com.gamingledger.settings.service;

import com.gamingledger.settings.dao.SettingsDao;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class SettingsService {

    private static final String DEFAULT_CURRENCY = "INR";

    private final SettingsDao settings;

    public SettingsService(SettingsDao settings) {
        this.settings = settings;
    }

    public String displayCurrency(UUID userId) {
        return settings.findDisplayCurrency(userId).orElse(DEFAULT_CURRENCY);
    }

    public void setDisplayCurrency(UUID userId, String currency) {
        settings.upsertDisplayCurrency(userId, currency);
    }
}
