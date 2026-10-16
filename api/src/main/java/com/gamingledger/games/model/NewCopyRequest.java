package com.gamingledger.games.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/** Body for adding a copy. A purchased game comes with its purchase; other acquisitions come without one. */
public record NewCopyRequest(
    @Valid @NotNull CopyRequest copy,
    @Valid NewPurchase purchase
) {}
