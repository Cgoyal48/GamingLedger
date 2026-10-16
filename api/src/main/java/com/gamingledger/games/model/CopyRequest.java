package com.gamingledger.games.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Body for adding a copy and for editing one. With an igdbId the title is IGDB's; without one it's custom. */
public record CopyRequest(
    @NotBlank String title,
    Long igdbId,
    @NotBlank @Pattern(regexp = "steam|playstation|xbox|switch|mobile|pc|other") String platform,
    @NotBlank @Pattern(regexp = "unplayed|playing|completed|abandoned") String status,
    @NotBlank @Pattern(regexp = "to_play|to_own") String intent,
    @NotBlank @Pattern(regexp = "purchased|free|gift|subscription") String acquisition
) {}
