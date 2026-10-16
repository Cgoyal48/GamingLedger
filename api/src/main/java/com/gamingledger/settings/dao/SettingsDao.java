package com.gamingledger.settings.dao;

import static com.gamingledger.datastore.jooq.codegen.Tables.USER_SETTINGS;

import java.util.Optional;
import java.util.UUID;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

@Repository
public class SettingsDao {

    private final DSLContext dsl;

    public SettingsDao(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<String> findDisplayCurrency(UUID userId) {
        return dsl.select(USER_SETTINGS.DISPLAY_CURRENCY)
            .from(USER_SETTINGS)
            .where(USER_SETTINGS.USER_ID.eq(userId))
            .fetchOptional(USER_SETTINGS.DISPLAY_CURRENCY);
    }

    public void upsertDisplayCurrency(UUID userId, String currency) {
        dsl.insertInto(USER_SETTINGS)
            .set(USER_SETTINGS.USER_ID, userId)
            .set(USER_SETTINGS.DISPLAY_CURRENCY, currency)
            .onConflict(USER_SETTINGS.USER_ID)
            .doUpdate()
            .set(USER_SETTINGS.DISPLAY_CURRENCY, currency)
            .execute();
    }
}
