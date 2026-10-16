package com.gamingledger.games.model;

import java.time.OffsetDateTime;

public record Copy(
    long id,
    long gameId,
    String title,
    OffsetDateTime createdAt,
    Long igdbId,
    String source,
    String coverUrl,
    String platform,
    String status,
    String intent,
    String acquisition,
    Long spentMinor,
    /** The part of {@code spentMinor} that went on DLC, passes and other in-game purchases. */
    Long inGameMinor,
    String spentCurrency,
    boolean converted,
    boolean rateMissing,
    Integer minutes,
    Long costPerHourMinor
) {}
