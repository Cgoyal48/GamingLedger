package com.gamingledger.purchases.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.time.OffsetDateTime;

public record PurchaseRequest(
    Long copyId,
    @NotBlank @Pattern(regexp = "game|in_game|top_up") String kind,
    @NotNull @Positive Long amountMinor,
    @NotBlank @Pattern(regexp = "[A-Z]{3}") String currency,
    @NotNull OffsetDateTime purchasedAt,
    String note
) {}