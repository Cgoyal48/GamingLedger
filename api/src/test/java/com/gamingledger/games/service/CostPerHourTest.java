package com.gamingledger.games.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CostPerHourTest {

    @Test
    void dividesSpendByHoursAndRoundsToNearest() {
        // ₹1,798 over 30.5 h = ₹58.95/h
        assertThat(CopyValueService.costPerHour(179800L, 1830)).isEqualTo(5895);
        // 100 over 40 min = 150/h exactly; 100 over 7 min = 857.14 → 857
        assertThat(CopyValueService.costPerHour(100L, 40)).isEqualTo(150);
        assertThat(CopyValueService.costPerHour(100L, 7)).isEqualTo(857);
    }

    @Test
    void nothingToDivideGivesNull() {
        assertThat(CopyValueService.costPerHour(null, 600)).isNull();
        assertThat(CopyValueService.costPerHour(149900L, null)).isNull();
        assertThat(CopyValueService.costPerHour(149900L, 0)).isNull();
    }
}
