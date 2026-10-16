package com.gamingledger.fx.service;

import com.gamingledger.fx.client.FxClient;
import com.gamingledger.fx.dao.FxRateDao;
import com.gamingledger.fx.model.Rates;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

/** Keeps a local copy of exchange rates so conversions don't call the rate API on every request. */
@Service
public class FxService {

    private static final Logger log = LoggerFactory.getLogger(FxService.class);
    private static final Duration RECHECK_LATEST = Duration.ofHours(6);
    // Rates are published on business days only, so look back far enough to cover a long holiday.
    private static final int LOOKBACK_DAYS = 7;

    private final FxRateDao rates;
    private final FxClient client;
    private Instant lastLatestCheck;

    public FxService(FxRateDao rates, FxClient client) {
        this.rates = rates;
        this.client = client;
    }

    public Rates ratesSince(LocalDate earliest) {
        LocalDate from = earliest.minusDays(LOOKBACK_DAYS);
        ensureRates(from, LocalDate.now(ZoneOffset.UTC));
        return new Rates(rates.findSince(from));
    }

    private synchronized void ensureRates(LocalDate from, LocalDate to) {
        FxRateDao.StoredRange stored = rates.storedRange();
        if (stored.first() == null) {
            fetchAndStore(from, to);
            lastLatestCheck = Instant.now();
            return;
        }
        if (from.isBefore(stored.first())) {
            fetchAndStore(from, stored.first().minusDays(1));
        }
        boolean recheckDue = lastLatestCheck == null
            || lastLatestCheck.isBefore(Instant.now().minus(RECHECK_LATEST));
        if (stored.last().isBefore(to) && recheckDue) {
            fetchAndStore(stored.last().plusDays(1), to);
            lastLatestCheck = Instant.now();
        }
    }

    private void fetchAndStore(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            return;
        }
        Map<LocalDate, Map<String, BigDecimal>> fetched;
        try {
            fetched = client.eurRates(from, to);
        } catch (RestClientException e) {
            log.warn("Could not fetch exchange rates for {}..{}: {}", from, to, e.getMessage());
            return;
        }
        rates.insertAll(fetched);
    }
}
