package com.gamingledger.games.service;

import com.gamingledger.datastore.jooq.codegen.tables.records.PurchasesRecord;
import com.gamingledger.fx.model.Rates;
import com.gamingledger.fx.service.FxService;
import com.gamingledger.games.model.Spend;
import com.gamingledger.games.model.Valuation;
import com.gamingledger.purchases.dao.PurchaseDao;
import com.gamingledger.settings.service.SettingsService;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

/** Money per copy, converted into the user's display currency at each purchase's date. */
@Service
public class CopyValueService {

    private final PurchaseDao purchases;
    private final FxService fx;
    private final SettingsService settings;

    public CopyValueService(PurchaseDao purchases, FxService fx, SettingsService settings) {
        this.purchases = purchases;
        this.fx = fx;
        this.settings = settings;
    }

    public Valuation valuate(UUID userId, Collection<Long> copyIds) {
        String display = settings.displayCurrency(userId);
        List<PurchasesRecord> rows = purchases.findByCopies(userId, copyIds);
        List<LocalDate> foreignDates = rows.stream()
            .filter(p -> !p.getCurrency().equals(display))
            .map(p -> p.getPurchasedAt().toLocalDate())
            .toList();
        // Only call the rate service when something actually needs converting.
        Rates rates = foreignDates.isEmpty() ? null : fx.ratesSince(Collections.min(foreignDates));

        Map<Long, Spend> byCopy = new HashMap<>();
        for (PurchasesRecord p : rows) {
            boolean inGame = p.getKind().equals("in_game");
            Spend one;
            if (p.getCurrency().equals(display)) {
                one = new Spend(p.getAmountMinor(), inGame ? p.getAmountMinor() : 0, false, false);
            } else {
                Long converted = rates.convert(
                    p.getAmountMinor(), p.getCurrency(), display, p.getPurchasedAt().toLocalDate()
                );
                one = converted == null
                    ? new Spend(0, 0, true, true)
                    : new Spend(converted, inGame ? converted : 0, true, false);
            }
            byCopy.merge(p.getCopyId(), one, Spend::plus);
        }
        return new Valuation(display, byCopy);
    }

    /** Rounded to the nearest minor unit. Null when there is nothing to divide. */
    public static Long costPerHour(Long spentMinor, Integer minutes) {
        if (spentMinor == null || minutes == null || minutes == 0) {
            return null;
        }
        return (spentMinor * 60 + minutes / 2) / minutes;
    }
}
