package com.gamingledger.stats.service;

import static java.util.stream.Collectors.groupingBy;

import com.gamingledger.games.model.Copy;
import com.gamingledger.games.service.CopyService;
import com.gamingledger.games.service.CopyValueService;
import com.gamingledger.purchases.dao.PurchaseDao;
import com.gamingledger.settings.service.SettingsService;
import com.gamingledger.stats.model.BestValue;
import com.gamingledger.stats.model.StatGroup;
import com.gamingledger.stats.model.Stats;
import com.gamingledger.stats.model.Unlaunched;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

/**
 * Builds on the per-copy values the inventory already shows, so a platform's cost per hour always agrees
 * with its cards. Spend is converted per purchase date before it is summed, which is why the grouping
 * happens here rather than in SQL.
 */
@Service
public class StatsService {

    private final CopyService copies;
    private final PurchaseDao purchases;
    private final SettingsService settings;

    public StatsService(CopyService copies, PurchaseDao purchases, SettingsService settings) {
        this.copies = copies;
        this.purchases = purchases;
        this.settings = settings;
    }

    public Stats forUser(UUID userId) {
        List<Copy> all = copies.list(userId);
        Map<Long, OffsetDateTime> firstPaid = purchases.firstPurchaseByCopy(userId);

        List<StatGroup> platforms = all.stream()
            .collect(groupingBy(Copy::platform))
            .entrySet().stream()
            .map(entry -> summarize(entry.getKey(), entry.getValue()))
            .sorted(Comparator.comparing(StatGroup::costPerHourMinor, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(StatGroup::minutes, Comparator.reverseOrder()))
            .toList();

        List<StatGroup> years = all.stream()
            .filter(copy -> firstPaid.containsKey(copy.id()))
            .collect(groupingBy(copy -> String.valueOf(firstPaid.get(copy.id()).getYear())))
            .entrySet().stream()
            .map(entry -> summarize(entry.getKey(), entry.getValue()))
            .sorted(Comparator.comparing(StatGroup::key).reversed())
            .toList();

        return new Stats(settings.displayCurrency(userId), platforms, years, unlaunched(all));
    }

    /** Matches the quest log: bought to play, still unplayed, no hours. */
    static boolean neverLaunched(Copy copy) {
        return copy.intent().equals("to_play")
            && copy.status().equals("unplayed")
            && (copy.minutes() == null || copy.minutes() == 0);
    }

    /** Spend with a missing exchange rate is still in its own currency, so it can't be added in. */
    static Unlaunched unlaunched(List<Copy> all) {
        List<Copy> waiting = all.stream()
            .filter(StatsService::neverLaunched)
            .filter(copy -> copy.spentMinor() != null && !copy.rateMissing())
            .toList();
        return new Unlaunched(
            waiting.size(),
            waiting.stream().mapToLong(Copy::spentMinor).sum(),
            waiting.stream().anyMatch(Copy::converted)
        );
    }

    /** Cost per hour is total spend over total hours of the paid games, not an average of their rates. */
    static StatGroup summarize(String key, List<Copy> group) {
        List<Copy> paid = group.stream().filter(copy -> copy.costPerHourMinor() != null).toList();
        long minutes = group.stream().mapToLong(copy -> copy.minutes() == null ? 0 : copy.minutes()).sum();

        Long costPerHour = null;
        if (!paid.isEmpty()) {
            long spent = paid.stream().mapToLong(Copy::spentMinor).sum();
            int paidMinutes = Math.toIntExact(paid.stream().mapToLong(Copy::minutes).sum());
            costPerHour = CopyValueService.costPerHour(spent, paidMinutes);
        }
        BestValue best = paid.stream()
            .min(Comparator.comparing(Copy::costPerHourMinor))
            .map(copy -> new BestValue(copy.id(), copy.title(), copy.costPerHourMinor(), copy.converted()))
            .orElse(null);

        return new StatGroup(
            key, group.size(), paid.size(), minutes, costPerHour, paid.stream().anyMatch(Copy::converted), best
        );
    }
}
