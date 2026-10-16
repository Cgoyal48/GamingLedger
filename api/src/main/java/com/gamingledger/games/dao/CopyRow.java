package com.gamingledger.games.dao;

import java.time.OffsetDateTime;

/** A copy joined with its game and latest playtime, before any money is attached. */
public record CopyRow(
    long id,
    long gameId,
    String title,
    OffsetDateTime createdAt,
    Long igdbId,
    String source,
    String coverImageId,
    String platform,
    String status,
    String intent,
    String acquisition,
    Integer minutes
) {}
