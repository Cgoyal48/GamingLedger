package com.gamingledger.settings.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record Settings(
    @NotBlank @Pattern(regexp = "INR|USD|EUR|GBP|JPY") String displayCurrency
) {}
