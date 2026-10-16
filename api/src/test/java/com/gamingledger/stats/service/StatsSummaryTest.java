package com.gamingledger.stats.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.gamingledger.games.model.Copy;
import com.gamingledger.stats.model.StatGroup;
import com.gamingledger.stats.model.Unlaunched;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class StatsSummaryTest {

    private static Copy copy(long id, String title, Long spentMinor, Integer minutes, boolean converted) {
        Long perHour = spentMinor == null || minutes == null || minutes == 0
            ? null
            : (spentMinor * 60 + minutes / 2) / minutes;
        return new Copy(
            id, id, title, OffsetDateTime.now(), null, "custom", null, "pc", "playing", "to_play", "purchased",
            spentMinor, spentMinor == null ? null : 0L, spentMinor == null ? null : "INR", converted, false, minutes,
            perHour
        );
    }

    @Test
    void costPerHourIsTotalSpendOverTotalHoursNotAnAverageOfRates() {
        // ₹100 over 1 h (₹100/h) and ₹100 over 9 h (≈₹11/h): averaging rates would say ₹55/h.
        StatGroup group = StatsService.summarize("pc", List.of(
            copy(1, "Short", 10000L, 60, false),
            copy(2, "Long", 10000L, 540, false)
        ));

        assertThat(group.costPerHourMinor()).isEqualTo(2000);
        assertThat(group.best().title()).isEqualTo("Long");
    }

    @Test
    void unpaidGamesCountTowardHoursButNotCostPerHour() {
        StatGroup group = StatsService.summarize("pc", List.of(
            copy(1, "Paid", 6000L, 120, true),
            copy(2, "Free", null, 600, false),
            copy(3, "Bought, unplayed", 9900L, null, false)
        ));

        assertThat(group.games()).isEqualTo(3);
        assertThat(group.paidGames()).isEqualTo(1);
        assertThat(group.minutes()).isEqualTo(720);
        assertThat(group.costPerHourMinor()).isEqualTo(3000);
        assertThat(group.converted()).isTrue();
    }

    private static Copy shelved(long id, String status, String intent, Long spentMinor, Integer minutes) {
        return new Copy(
            id, id, "Game " + id, OffsetDateTime.now(), null, "custom", null, "pc", status, intent, "purchased",
            spentMinor, spentMinor == null ? null : 0L, spentMinor == null ? null : "INR", false, false, minutes, null
        );
    }

    @Test
    void unlaunchedSpendSkipsGamesThatWereOpenedOrOnlyCollected() {
        Unlaunched unlaunched = StatsService.unlaunched(List.of(
            shelved(1, "unplayed", "to_play", 50000L, null),
            shelved(2, "unplayed", "to_play", 12900L, 0),
            shelved(3, "unplayed", "to_own", 899900L, null),
            shelved(4, "playing", "to_play", 30000L, null),
            shelved(5, "unplayed", "to_play", 40000L, 90),
            shelved(6, "unplayed", "to_play", null, null)
        ));

        assertThat(unlaunched.games()).isEqualTo(2);
        assertThat(unlaunched.spentMinor()).isEqualTo(62900);
    }

    @Test
    void aGroupWithNoPaidHoursHasNoCostPerHour() {
        StatGroup group = StatsService.summarize("switch", List.of(copy(1, "Gift", null, 300, false)));

        assertThat(group.costPerHourMinor()).isNull();
        assertThat(group.best()).isNull();
    }
}
