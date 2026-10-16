package com.gamingledger.fx.dao;

import static com.gamingledger.datastore.jooq.codegen.Tables.FX_RATES;
import static org.jooq.impl.DSL.max;
import static org.jooq.impl.DSL.min;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.TreeMap;
import org.jooq.DSLContext;
import org.jooq.Query;
import org.springframework.stereotype.Repository;

/** Rates are stored per euro, as the European Central Bank publishes them. */
@Repository
public class FxRateDao {

    /** Both dates are null when no rates are stored yet. */
    public record StoredRange(LocalDate first, LocalDate last) {}

    private final DSLContext dsl;

    public FxRateDao(DSLContext dsl) {
        this.dsl = dsl;
    }

    public StoredRange storedRange() {
        return dsl.select(min(FX_RATES.RATE_DATE), max(FX_RATES.RATE_DATE))
            .from(FX_RATES)
            .fetchOne(r -> new StoredRange(r.value1(), r.value2()));
    }

    public NavigableMap<LocalDate, Map<String, BigDecimal>> findSince(LocalDate from) {
        NavigableMap<LocalDate, Map<String, BigDecimal>> byDate = new TreeMap<>();
        dsl.selectFrom(FX_RATES)
            .where(FX_RATES.RATE_DATE.ge(from))
            .forEach(r -> byDate
                .computeIfAbsent(r.getRateDate(), d -> new HashMap<>())
                .put(r.getCurrency(), r.getPerEur()));
        return byDate;
    }

    /** Rows that already exist are left untouched, so overlapping fetches are safe. */
    public void insertAll(Map<LocalDate, Map<String, BigDecimal>> perEurByDate) {
        List<Query> inserts = new ArrayList<>();
        perEurByDate.forEach((date, rates) -> rates.forEach((currency, perEur) -> inserts.add(
            dsl.insertInto(FX_RATES)
                .set(FX_RATES.RATE_DATE, date)
                .set(FX_RATES.CURRENCY, currency)
                .set(FX_RATES.PER_EUR, perEur)
                .onConflict(FX_RATES.RATE_DATE, FX_RATES.CURRENCY)
                .doNothing()
        )));
        if (!inserts.isEmpty()) {
            dsl.batch(inserts).execute();
        }
    }
}
