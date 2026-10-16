package com.gamingledger.stats.model;

/**
 * Money spent on games bought to play that have never been opened. {@code games} counts only those with spend.
 * Games marked to_own are left out: a sealed collector's edition was never meant to be launched.
 */
public record Unlaunched(int games, long spentMinor, boolean converted) {}
