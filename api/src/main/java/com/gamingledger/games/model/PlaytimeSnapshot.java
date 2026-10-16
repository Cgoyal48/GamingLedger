package com.gamingledger.games.model;

import java.time.OffsetDateTime;

public record PlaytimeSnapshot(
    long id,
    long copyId,
    int minutes,
    OffsetDateTime recordedAt
) {}
