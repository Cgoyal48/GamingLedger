package com.gamingledger.fx.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.TreeMap;
import org.junit.jupiter.api.Test;

class RatesTest {

    private final Rates rates = new Rates(new TreeMap<>(Map.of(
        LocalDate.of(2026, 10, 9), Map.of(
            "INR", new BigDecimal("108.3965"), "USD", new BigDecimal("1.1206"), "JPY", new BigDecimal("177.34")
        ),
        LocalDate.of(2026, 10, 12), Map.of(
            "INR", new BigDecimal("107.086"), "USD", new BigDecimal("1.1181"), "JPY", new BigDecimal("177.33")
        )
    )));

    @Test
    void sameCurrencyIsUnchanged() {
        assertThat(rates.convert(149900, "INR", "INR", LocalDate.of(2020, 1, 1))).isEqualTo(149900);
    }

    @Test
    void convertsAtThePurchaseDateRate() {
        // $9.99 × 107.086 / 1.1181 = ₹956.79
        assertThat(rates.convert(999, "USD", "INR", LocalDate.of(2026, 10, 12))).isEqualTo(95679);
    }

    @Test
    void weekendUsesThePreviousBusinessDay() {
        // Sunday the 11th falls back to Friday the 9th: $5 × 108.3965 / 1.1206 = ₹483.65
        assertThat(rates.convert(500, "USD", "INR", LocalDate.of(2026, 10, 11))).isEqualTo(48365);
    }

    @Test
    void euroIsTheBaseAndNeedsNoRow() {
        assertThat(rates.convert(1000, "EUR", "USD", LocalDate.of(2026, 10, 12))).isEqualTo(1118);
    }

    @Test
    void handlesCurrenciesWithoutMinorUnits() {
        // ¥1000 has no decimals; it is 1000 minor units, and becomes $6.31.
        assertThat(rates.convert(1000, "JPY", "USD", LocalDate.of(2026, 10, 12))).isEqualTo(631);
        assertThat(rates.convert(631, "USD", "JPY", LocalDate.of(2026, 10, 12))).isEqualTo(1001);
    }

    @Test
    void missingRateGivesNull() {
        assertThat(rates.convert(999, "USD", "INR", LocalDate.of(2026, 10, 1))).isNull();
        assertThat(rates.convert(999, "USD", "GBP", LocalDate.of(2026, 10, 12))).isNull();
    }
}
