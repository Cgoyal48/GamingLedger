package com.gamingledger.stats.model;

import java.util.List;

/** Value by platform and by the year each game was first paid for. Money is in the display currency. */
public record Stats(String currency, List<StatGroup> platforms, List<StatGroup> years, Unlaunched unlaunched) {}
