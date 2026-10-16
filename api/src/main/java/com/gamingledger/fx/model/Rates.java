package com.gamingledger.fx.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Currency;
import java.util.Map;
import java.util.NavigableMap;

/** Per-euro rates by date. Weekends and holidays fall back to the previous published day. */
public record Rates(NavigableMap<LocalDate, Map<String, BigDecimal>> byDate) {

    /** Returns null when either currency has no rate on or before the date. */
    public Long convert(long amountMinor, String from, String to, LocalDate date) {
        if (from.equals(to)) {
            return amountMinor;
        }
        BigDecimal fromPerEur = perEur(from, date);
        BigDecimal toPerEur = perEur(to, date);
        if (fromPerEur == null || toPerEur == null) {
            return null;
        }
        return BigDecimal.valueOf(amountMinor)
            .movePointLeft(minorDigits(from))
            .multiply(toPerEur)
            .divide(fromPerEur, 10, RoundingMode.HALF_UP)
            .movePointRight(minorDigits(to))
            .setScale(0, RoundingMode.HALF_UP)
            .longValueExact();
    }

    private BigDecimal perEur(String currency, LocalDate date) {
        if (currency.equals("EUR")) {
            return BigDecimal.ONE;
        }
        Map.Entry<LocalDate, Map<String, BigDecimal>> day = byDate.floorEntry(date);
        return day == null ? null : day.getValue().get(currency);
    }

    private static int minorDigits(String currency) {
        return Math.max(0, Currency.getInstance(currency).getDefaultFractionDigits());
    }
}
