package com.gamingledger.games.model;

/** What one copy cost, in the display currency. {@code inGameMinor} is the part spent after buying the game. */
public record Spend(long totalMinor, long inGameMinor, boolean converted, boolean rateMissing) {

    public Spend plus(Spend other) {
        return new Spend(
            totalMinor + other.totalMinor,
            inGameMinor + other.inGameMinor,
            converted || other.converted,
            rateMissing || other.rateMissing
        );
    }
}
