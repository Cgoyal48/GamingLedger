package com.gamingledger.stats.model;

/**
 * One platform or year. Cost per hour uses only paid games with hours ({@code paidGames}),
 * while {@code minutes} counts every game in the group. Null cost per hour means no paid game has hours yet.
 */
public record StatGroup(
    String key,
    int games,
    int paidGames,
    long minutes,
    Long costPerHourMinor,
    boolean converted,
    BestValue best
) {}
