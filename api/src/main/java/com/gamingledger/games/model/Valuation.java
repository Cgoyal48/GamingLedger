package com.gamingledger.games.model;

import java.util.Map;

/** Spend per copy id, all in one currency. Copies with no purchases have no entry. */
public record Valuation(String currency, Map<Long, Spend> byCopy) {

    public Spend spend(long copyId) {
        return byCopy.get(copyId);
    }
}
