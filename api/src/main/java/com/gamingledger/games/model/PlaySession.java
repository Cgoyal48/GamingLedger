package com.gamingledger.games.model;

import java.time.OffsetDateTime;

/** One hours entry: when it was logged, how much it added, and the copy's total after it. */
public record PlaySession(long copyId, OffsetDateTime recordedAt, int minutesAdded, int totalMinutes) {}
