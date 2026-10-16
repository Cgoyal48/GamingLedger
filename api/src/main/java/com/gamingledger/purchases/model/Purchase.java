package com.gamingledger.purchases.model;

import java.time.OffsetDateTime;

public record Purchase(
    long id,
    Long copyId,
    String kind,
    long amountMinor,
    String currency,
    OffsetDateTime purchasedAt,
    String note
) {}