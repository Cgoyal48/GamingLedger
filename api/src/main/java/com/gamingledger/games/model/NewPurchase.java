package com.gamingledger.games.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.time.OffsetDateTime;

/** What was paid for the game itself when adding it. The copy and kind come from the request it's part of. */
public record NewPurchase(
    @NotNull @Positive Long amountMinor,
    @NotBlank @Pattern(regexp = "[A-Z]{3}") String currency,
    @NotNull OffsetDateTime purchasedAt
) {}
