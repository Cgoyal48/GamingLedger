package com.gamingledger.igdb.model;

public record IgdbGame(
    long igdbId,
    String name,
    Integer year,
    String coverUrl
) {
}
