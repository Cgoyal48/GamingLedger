package com.gamingledger.games.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record NewPlaytime(
    @NotNull @PositiveOrZero Integer minutes
) {}
